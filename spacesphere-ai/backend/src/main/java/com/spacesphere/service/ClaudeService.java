package com.spacesphere.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.spacesphere.dto.ChatDtos.ChatMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class ClaudeService {

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-sonnet-4-6";

    private static final String ORBIT_SYSTEM_PROMPT = """
            You are Orbit, a research-focused assistant covering the complete history of space
            research and spaceflight, from its earliest origins to today, with special depth on
            ISRO, DRDO, and NASA.
            You trace the full timeline when asked: early rocketry pioneers (Tsiolkovsky, Goddard,
            Oberth), the origins of modern rocketry, the Cold War space race (Sputnik, Vostok/Gagarin,
            Mercury, Gemini, Apollo), space stations (Salyut, Skylab, Mir, ISS), the shuttle era,
            interplanetary probes, the founding and growth of ISRO (PSLV/GSLV/LVM3, Chandrayaan,
            Mangalyaan, Aditya-L1, Gaganyaan) and DRDO, ESA/Roscosmos/JAXA/CNSA, and the modern
            commercial spaceflight era, up through today.
            Your core focus for present-day questions is ISRO, DRDO, and NASA: their scientists,
            ongoing and recent projects, launches, test programs, and publications.
            You also cover space education: outreach/STEM programs, how astronomy and aerospace are
            taught, and study/career paths into space science. When asked how to become a scientist
            at ISRO, DRDO, or NASA, walk through: a strong school foundation in physics/math/chemistry;
            a relevant bachelor's degree (aerospace, mechanical, electrical, electronics, CS, or
            physics — noting IIST/IITs/NITs in India and ABET-accredited programs in the US); building
            specialized skills and joining student satellite/rocketry/robotics clubs; internships or
            research experience (ISRO centers like URSC/VSSC/SAC, DRDO labs like DRDL/ADE, NASA
            centers like JPL/Goddard); a master's or PhD for scientist-level roles; and each agency's
            entry channel (ISRO's ICRB exam and IIST placement, DRDO/DRDS entry exam, NASA's USAJobs
            or contractor/academic network). Mention that publishing research and building a project
            portfolio matters as much as formal qualifications.
            Use the web search tool whenever a question concerns anything recent or time-sensitive,
            rather than relying on memory alone. For well-established historical facts, answer
            directly without searching.
            If asked something unrelated to space research, gently steer back to a related question.
            Keep answers clear, accurate, and concise. Write in natural prose paragraphs, no markdown
            headers or heavy bullet lists.
            """;

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api.key}")
    private String apiKey;

    public ClaudeService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String chat(String userMessage, List<ChatMessage> history) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", MODEL);
        body.put("max_tokens", 1200);
        body.put("system", ORBIT_SYSTEM_PROMPT);

        ArrayNode messages = mapper.createArrayNode();
        if (history != null) {
            for (ChatMessage m : history) {
                ObjectNode node = mapper.createObjectNode();
                node.put("role", m.role());
                node.put("content", m.content());
                messages.add(node);
            }
        }
        ObjectNode userNode = mapper.createObjectNode();
        userNode.put("role", "user");
        userNode.put("content", userMessage);
        messages.add(userNode);
        body.set("messages", messages);

        ArrayNode tools = mapper.createArrayNode();
        ObjectNode webSearchTool = mapper.createObjectNode();
        webSearchTool.put("type", "web_search_20250305");
        webSearchTool.put("name", "web_search");
        tools.add(webSearchTool);
        body.set("tools", tools);

        return callClaude(body);
    }

    /** Used for structured data requests (NASA data summarization etc.), bypassing the Orbit persona. */
    public String ask(String userPrompt, String systemPrompt, int maxTokens) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", MODEL);
        body.put("max_tokens", maxTokens);
        body.put("system", systemPrompt);

        ArrayNode messages = mapper.createArrayNode();
        ObjectNode userNode = mapper.createObjectNode();
        userNode.put("role", "user");
        userNode.put("content", userPrompt);
        messages.add(userNode);
        body.set("messages", messages);

        ArrayNode tools = mapper.createArrayNode();
        ObjectNode webSearchTool = mapper.createObjectNode();
        webSearchTool.put("type", "web_search_20250305");
        webSearchTool.put("name", "web_search");
        tools.add(webSearchTool);
        body.set("tools", tools);

        return callClaude(body);
    }

    private String callClaude(ObjectNode body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);
        JsonNode response = restTemplate.postForObject(ANTHROPIC_URL, request, JsonNode.class);

        if (response == null) {
            throw new IllegalStateException("No response from Claude API");
        }
        if (response.has("type") && "error".equals(response.get("type").asText())) {
            String msg = response.path("error").path("message").asText("Unknown Claude API error");
            throw new IllegalStateException(msg);
        }

        StringBuilder text = new StringBuilder();
        JsonNode content = response.path("content");
        if (content.isArray()) {
            for (JsonNode block : content) {
                if ("text".equals(block.path("type").asText())) {
                    text.append(block.path("text").asText());
                }
            }
        }
        return text.toString();
    }
}
