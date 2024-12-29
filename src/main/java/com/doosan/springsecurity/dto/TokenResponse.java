package com.doosan.springsecurity.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenResponse {
    private boolean success;
    private String access_token;
    private String refresh_token;
    private int expires_in;
    private String client_ip;
} 