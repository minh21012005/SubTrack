package com.subtrack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class SseService {

    // Map user email to a list of SseEmitters (supports multiple tabs)
    private final Map<String, List<SseEmitter>> emittersMap = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String email) {
        SseEmitter emitter = new SseEmitter(120_000L); // 2 minutes timeout
        
        emittersMap.putIfAbsent(email, new CopyOnWriteArrayList<>());
        List<SseEmitter> userEmitters = emittersMap.get(email);
        userEmitters.add(emitter);
        
        Runnable removeEmitter = () -> {
            List<SseEmitter> list = emittersMap.get(email);
            if (list != null) {
                list.remove(emitter);
                if (list.isEmpty()) {
                    emittersMap.remove(email);
                }
            }
        };

        emitter.onCompletion(removeEmitter);
        emitter.onTimeout(removeEmitter);
        emitter.onError((e) -> removeEmitter.run());
        
        // Send a connected event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connected to SubTrack real-time updates"));
        } catch (IOException e) {
            removeEmitter.run();
        }
        
        return emitter;
    }

    public void sendEvent(String email, String eventName, Object data) {
        List<SseEmitter> userEmitters = emittersMap.get(email);
        if (userEmitters != null) {
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name(eventName)
                            .data(data));
                } catch (IOException e) {
                    log.error("Failed to send SSE event to user {}", email, e);
                    // Let the callbacks clean it up
                }
            }
        }
    }
}
