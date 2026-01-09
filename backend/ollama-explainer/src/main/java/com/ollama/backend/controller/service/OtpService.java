package com.ollama.backend.controller.service; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender; // REQUIRES spring-boot-starter-mail in pom.xml

    private Map<String, String> otpStorage = new HashMap<>();

    public void sendOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000); 
        otpStorage.put(email, otp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your Login OTP");
        message.setText("Your OTP is: " + otp + ". It expires in 5 minutes.");
        
        mailSender.send(message); 
    }

    public boolean verifyOtp(String email, String userOtp) {
        return userOtp != null && userOtp.equals(otpStorage.get(email));
    }
}