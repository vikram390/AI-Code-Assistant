package com.ollama.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ollama.backend.model.Chat;
import com.ollama.backend.model.User;
import com.ollama.backend.repo.ChatRepo;
import com.ollama.backend.repo.UserRepo;
import com.ollama.backend.controller.service.OtpService; // REQUIRED
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ExplainController {

    private final UserRepo userRepo;
    private final ChatRepo chatRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private OtpService otpService; // Injected to fix compilation errors

    public ExplainController(UserRepo userRepo, ChatRepo chatRepo) {
        this.userRepo = userRepo;
        this.chatRepo = chatRepo;
    }


    @PostMapping("/explain")
    public String explain(@RequestBody ChatRequest req) {
        try {
            boolean isLoggedIn = req.getEmail() != null && !req.getEmail().isEmpty();
            StringBuilder history = new StringBuilder();

            if (isLoggedIn) {
                List<Chat> recent = chatRepo.findTop3BySessionIdOrderByIdDesc(req.getSessionId());
                for (int i = recent.size() - 1; i >= 0; i--) {
                    history.append("User: ").append(recent.get(i).getCode()).append("\n");
                    history.append("AI: ").append(recent.get(i).getExplanation()).append("\n\n");
                }
            }

            String instructions = "### ROLE: Expert Code Tutor\n" +
                "### TASK: Detect the user's intent from 'CURRENT REQUEST'.\n" +
                "1. IF code is provided: Start the response with '📌 CATEGORY:' and use headers: 🎯 PURPOSE:, 🔍 LOGIC:, 💡 EXAMPLE:.\n" +
                "2. IF a general question is asked: Answer it directly as a helpful assistant.\n\n" +
                "### CONTEXT (Previous Chat):\n" + history.toString() + "\n" +
                "### CURRENT REQUEST:\n" + req.getCode() + "\n\n" +
                "RESULT: ";

            String explanation = callOllama("deepseek-coder:6.7b", instructions);

            if (isLoggedIn) {
                saveToDb(req, explanation);
            }
            return explanation;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String callOllama(String model, String prompt) throws Exception {
        URL url = new URL("http://localhost:11434/api/generate");
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/json");
        con.setDoOutput(true);

        Map<String, Object> payloadMap = new HashMap<>();
        payloadMap.put("model", model);
        payloadMap.put("prompt", prompt);
        payloadMap.put("stream", false);

        String jsonPayload = objectMapper.writeValueAsString(payloadMap);
        try (OutputStream os = con.getOutputStream()) {
            os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
        }

        JsonNode rootNode = objectMapper.readTree(con.getInputStream());
        return rootNode.path("response").asText();
    }

    private void saveToDb(ChatRequest req, String explanation) {
        User user = userRepo.findByEmail(req.getEmail());
        if (user != null) {
            Chat chat = new Chat();
            chat.setUserId(user.getId());
            chat.setCode(req.getCode());
            chat.setExplanation(explanation);
            chat.setSessionId(req.getSessionId());
            chat.setTimestamp(LocalDateTime.now());
            chatRepo.save(chat);
        }
    }

    @GetMapping("/history/{email}")
    public List<Chat> getHistory(@PathVariable String email) {
        User user = userRepo.findByEmail(email);
        if (user != null) {
            return chatRepo.findTop3BySessionIdOrderByIdDesc(email); 
        }
        return new ArrayList<>();
    }

    @GetMapping("/session/{sessionId}")
    public List<Chat> getSessionMessages(@PathVariable String sessionId) {
        return chatRepo.findBySessionIdOrderByTimestampAsc(sessionId);
    }
}

class ChatRequest {
    private String email;
    private String code;
    private String sessionId;
    private int guestCount;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public int getGuestCount() { return guestCount; }
    public void setGuestCount(int guestCount) { this.guestCount = guestCount; }
}