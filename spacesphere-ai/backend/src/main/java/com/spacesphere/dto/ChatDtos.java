package com.spacesphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class ChatDtos {

    public record ChatMessage(
            @NotBlank String role,   // "user" or "assistant"
            @NotBlank String content
    ) {}

    public record ChatRequest(
            @NotBlank String message,
            List<ChatMessage> history // prior turns, optional
    ) {}

    public record ChatResponse(
            @NotNull String reply
    ) {}
}
