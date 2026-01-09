package com.ollama.backend.controller;

import com.ollama.backend.model.User;
import com.ollama.backend.repo.UserRepo;
import com.ollama.backend.controller.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
// Updated to allow all headers and methods for the OTP flow
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST, RequestMethod.GET, RequestMethod.OPTIONS})
public class AuthController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        otpService.sendOtp(email);
        boolean isNewUser = userRepo.findByEmail(email) == null;
        Map<String, Object> response = new HashMap<>();
        response.put("isNewUser", isNewUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String otp = req.get("otp");
        String name = req.get("name");

        if (otpService.verifyOtp(email, otp)) {
            User user = userRepo.findByEmail(email);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(name != null ? name : "User");
                user.setUses(0); 
                userRepo.save(user);
            }
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).body("Invalid OTP");
    }
}