# SubTrack - Subscription Waste Detection Tool

SubTrack helps you identify and manage "subscription waste"—recurring expenses you might have forgotten or no longer need. This full-stack application includes a Spring Boot backend and a Next.js frontend.

## 🚀 Getting Started

### Prerequisites

-   [Docker & Docker Compose](https://docs.docker.com/get-docker/) (Recommended)
-   [Java 17+](https://adoptium.net/) (for local backend development)
-   [Node.js 18+](https://nodejs.org/) (for local frontend development)

---

## 🔐 Environment Configuration

This project uses environment variables to manage sensitive information. We've provided templates to help you get started.

### 1. Backend Setup (`subtrack-be`)

1.  Navigate to the `subtrack-be` directory.
2.  Copy `be.env.example` to `be.env`:
    ```bash
    cp be.env.example be.env
    ```
3.  Update the values in `be.env`, especially:
    -   `JWT_SECRET`: A long, unique string for securing logins.
    -   `MAIL_USERNAME/PASSWORD`: If you plan to send email notifications.

### 2. Frontend Setup (`subtrack-fe`)

1.  Navigate to the `subtrack-fe` directory.
2.  Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
3.  Ensure `NEXT_PUBLIC_API_URL` points to your backend (default is `http://localhost:8080`).

---

## 🐳 Running with Docker (Quick Start)

The easiest way to run the entire stack (Database, Backend, Frontend) is using Docker Compose:

1.  Ensure you have created the `be.env` file as described above.
2.  From the root directory, run:
    ```bash
    docker compose up --build
    ```
3.  Access the applications:
    -   **Frontend**: [http://localhost:3000](http://localhost:3000)
    -   **Backend API**: [http://localhost:8080](http://localhost:8080)
    -   **Database**: Port `5432`

---

## 🛠 Manual Development Setup

### Backend (Spring Boot)
```bash
cd subtrack-be
# Ensure you have a PostgreSQL database running locally and be.env configured
./mvnw spring-boot:run
```

### Frontend (Next.js)
```bash
cd subtrack-fe
npm install
npm run dev
```

---

## 📂 Project Structure

-   `subtrack-be/`: Spring Boot application (Java).
-   `subtrack-fe/`: Next.js application (TypeScript/Tailwind).
-   `docker-compose.yml`: Orchestrates the containers.
-   `.gitignore`: Prevents sensitive files from being committed to Git.

---

## 📝 Configuration Tips

-   **Database Password**: The default password in `docker-compose.yml` is `subtrack123`. For production, change this in both `docker-compose.yml` and `be.env`.
-   **Security**: Always keep your `be.env` and `.env.local` files private. They are already listed in `.gitignore`.
