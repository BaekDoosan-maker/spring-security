package com.doosan.springsecurity.controller;

import com.doosan.springsecurity.dto.LoginRequest;
import com.doosan.springsecurity.dto.TokenResponse;
import com.doosan.springsecurity.entity.MemberEntity;
import com.doosan.springsecurity.repository.UserRepository;
import com.doosan.springsecurity.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("이미 존재하는 사용자명입니다.");
        }
        
        try {
            MemberEntity member = new MemberEntity();
            member.setUsername(request.getUsername());
            member.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(member);
            
            return ResponseEntity.ok("회원가입이 성공적으로 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("회원가입 처리 중 오류가 발생했습니다.");
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        try {
            Optional<MemberEntity> memberOpt = userRepository.findByUsername(request.getUsername());
            
            if (!memberOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("존재하지 않는 사용자입니다.");
            }
            
            MemberEntity member = memberOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("비밀번호가 일치하지 않습니다.");
            }
            
            // 클라이언트 IP 주소 가져오기
            String clientIp = getClientIp(servletRequest);
            
            // IP 주소를 포함하여 토큰 생성
            String accessToken = jwtUtil.generateToken(request.getUsername(), clientIp);
            String refreshToken = jwtUtil.generateRefreshToken(request.getUsername(), clientIp);
            
            TokenResponse tokenResponse = TokenResponse.builder()
                .success(true)
                .access_token(accessToken)
                .refresh_token(refreshToken)
                .expires_in(7200)
                .client_ip(clientIp)
                .build();
                
            return ResponseEntity.ok(tokenResponse);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("로그인 처리 중 오류가 발생했습니다.");
        }
    }
    
    // IP 주소 추출 메서드
    private String getClientIp(HttpServletRequest request) {
        // X-Forwarded-For 헤더 확인
        String clientIp = request.getHeader("X-Forwarded-For");
        
        if (clientIp != null && !clientIp.isEmpty()) {
            // X-Forwarded-For는 여러 IP가 쉼표로 구분되어 있을 수 있음
            // 첫 번째 IP가 실제 클라이언트 IP
            String[] ips = clientIp.split(",");
            return ips[0].trim();
        }
        
        // X-Real-IP 헤더 확인 (Nginx에서 주로 사용)
        clientIp = request.getHeader("X-Real-IP");
        if (clientIp != null && !clientIp.isEmpty()) {
            return clientIp.trim();
        }
        
        // 프록시 서버를 통한 요청인 경우
        clientIp = request.getHeader("Proxy-Client-IP");
        if (clientIp != null && !clientIp.isEmpty() && !"unknown".equalsIgnoreCase(clientIp)) {
            return clientIp.trim();
        }
        
        // WL 프록시 서버를 통한 요청인 경우
        clientIp = request.getHeader("WL-Proxy-Client-IP");
        if (clientIp != null && !clientIp.isEmpty() && !"unknown".equalsIgnoreCase(clientIp)) {
            return clientIp.trim();
        }
        
        // HTTP_CLIENT_IP
        clientIp = request.getHeader("HTTP_CLIENT_IP");
        if (clientIp != null && !clientIp.isEmpty() && !"unknown".equalsIgnoreCase(clientIp)) {
            return clientIp.trim();
        }
        
        // HTTP_X_FORWARDED_FOR
        clientIp = request.getHeader("HTTP_X_FORWARDED_FOR");
        if (clientIp != null && !clientIp.isEmpty() && !"unknown".equalsIgnoreCase(clientIp)) {
            return clientIp.trim();
        }
        
        // 직접 연결된 경우 getRemoteAddr() 사용
        clientIp = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(clientIp)) {
            try {
                InetAddress localHost = InetAddress.getLocalHost();
                clientIp = localHost.getHostAddress();
            } catch (UnknownHostException e) {
                clientIp = "127.0.0.1";
            }
        }
        
        return clientIp;
    }
    
    @GetMapping("/protected")
    public ResponseEntity<String> protectedEndpoint() {
        return ResponseEntity.ok("이 엔드포인트는 인증된 사용자만 접근 가능합니다!");
    }
} 