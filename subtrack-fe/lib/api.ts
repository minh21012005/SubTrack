import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  let token = typeof window !== 'undefined' ? localStorage.getItem('subtrack_token') : null;
  
  // Fallback to cookie if localStorage is empty (useful for testing manual deletion)
  if (!token && typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )subtrack_token=([^;]+)'));
    if (match) {
      token = match[2];
      // Sync back to localStorage so the user sees it again
      localStorage.setItem('subtrack_token', token);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    console.log(`📡 API Error: [${status}] ${originalRequest?.url}`);

    // Prevent infinite loops on auth endpoints
    if (originalRequest.url?.includes('/api/auth/refresh') || originalRequest.url?.includes('/api/auth/login')) {
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      console.log('🔄 Token expired or missing, attempting to refresh...');
      
      if (isRefreshing) {
        console.log('⏳ Already refreshing, queuing request...');
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('📡 Calling refresh API manually via axios secondary instance...');
        // Note: Using a fresh axios instance here to avoid interceptors
        const response = await axios({
          method: 'post',
          url: `${API_URL}/api/auth/refresh`,
          withCredentials: true
        });
        
        const newAccessToken = response.data.data.token;
        console.log('✅ Refresh successful!');
        
        localStorage.setItem('subtrack_token', newAccessToken);
        document.cookie = `subtrack_token=${newAccessToken}; path=/; max-age=${60 * 60 * 24}`;

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
        
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (err) {
        console.error('❌ Refresh failed. Session invalid.');
        processQueue(err, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('subtrack_token');
          localStorage.removeItem('subtrack_user');
          document.cookie = 'subtrack_token=; path=/; max-age=0';
          document.cookie = 'subtrack_refresh=; path=/; max-age=0';
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
