package com.subtrack.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    /**
     * Sent asynchronously so it does not block the main application thread.
     * Protects against sending failures if credentials are not set in properties.
     */
    @Async
    public void sendHtmlEmailAsync(String to, String subject, String templateName, Context context) {
        if (senderEmail == null || senderEmail.isBlank()) {
            log.warn("Cannot send email to {} because spring.mail.username is not configured.", to);
            return;
        }

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            
            helper.setFrom("SubTrack <" + senderEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            
            // Process HTML template
            String htmlContent = templateEngine.process("email/" + templateName, context);
            helper.setText(htmlContent, true); // true indicates HTML format

            javaMailSender.send(mimeMessage);
            log.info("Successfully sent HTML email ({}) to: {}", templateName, to);
        } catch (MailException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while sending HTML email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendOtpEmailAsync(String to, String otpCode) {
        Context context = new Context();
        context.setVariable("otpCode", otpCode);
        sendHtmlEmailAsync(to, "SubTrack - Mã Xác Thực Đăng Ký (OTP)", "otp-email.html", context);
    }
}
