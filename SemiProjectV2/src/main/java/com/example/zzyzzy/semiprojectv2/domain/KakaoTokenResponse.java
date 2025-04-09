package com.example.zzyzzy.semiprojectv2.domain;

import lombok.Data;

@Data
public class KakaoTokenResponse {
    private String access_token;
    private String token_type;
    private String refresh_token;
    private String id_token;
    private Integer expires_in;
    private Integer refresh_token_expires_in;
    private String scope;
}