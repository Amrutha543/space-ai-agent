package com.spacesphere.controller;

import com.spacesphere.dto.ChatDtos.ChatRequest;
import com.spacesphere.dto.ChatDtos.ChatResponse;
import com.spacesphere.service.ClaudeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ClaudeService claudeService;

    public ChatController(ClaudeService claudeService) {
        this.claudeService = claudeService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request) {
        String reply = claudeService.chat(request.message(), request.history());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
