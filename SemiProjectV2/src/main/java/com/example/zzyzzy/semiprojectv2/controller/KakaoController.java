package com.example.zzyzzy.semiprojectv2.controller;

import com.example.zzyzzy.semiprojectv2.domain.KakaoTokenResponse;
import com.example.zzyzzy.semiprojectv2.domain.KakaoUserInfo;
import com.example.zzyzzy.semiprojectv2.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/oauth/kakao")
@CrossOrigin(origins={"http://localhost:5173", "http://127.0.0.1:3000"})
public class KakaoController {

    @Value("${kakao.client.id}")
    private String clientId;

    @Value("${kakao.redirect.uri}")
    private String redirectUri;

    private final RestTemplate restTemplate;
    private static String AccessToken = null;

    // 카카오 로그인 - 로그인 후 인가 코드 받기
    @GetMapping("/login")
    public String kakaoLogin() {
        String authorizeUrl = "https://kauth.kakao.com/oauth/authorize";
        String params = "?client_id=%s&redirect_uri=%s&response_type=code";
        String kakaoUrl = String.format(authorizeUrl+params, clientId, redirectUri);

        return "redirect:" + kakaoUrl;
    }

    // 카카오 인증후 redirect 엔드포인트 - 인가 코드를 이용해서 액세스토큰 받기
    @GetMapping("/callback")
    public ResponseEntity<?> kakaoCallback(@RequestParam String code) {
        // 1단계 : 인가 코드 출력
        log.info("인가 코드: " + code);

        // 2단계: 액세스토큰 요청
        String authorizeUrl = "https://kauth.kakao.com/oauth/token";
        String params = "?client_id=%s&redirect_uri=%s&code=%s&grant_type=authorization_code";
        String kakaoUrl = String.format(authorizeUrl+params, clientId, redirectUri, code);

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // HTTP 요청 엔티티 생성
        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            // POST 요청으로 토큰 받기
            ResponseEntity<KakaoTokenResponse> response = restTemplate.postForEntity(
                    kakaoUrl,
                    request,
                    KakaoTokenResponse.class
            );

            // 응답에서 액세스토큰 추출
            KakaoTokenResponse tokenResponse = response.getBody();
            if (tokenResponse != null) {
                AccessToken = tokenResponse.getAccess_token();
                log.info("Access Token : {}", AccessToken);
            }

            // 사용자 정보 가져오기
            KakaoUserInfo kakaoUserInfo = getUserInfo(AccessToken);
            log.info("kakaoUserInfo: {}", kakaoUserInfo);

            // 응답으로 닉네임 출력
            return ResponseEntity.ok().body(kakaoUserInfo.getProperties().getNickname());
        } catch (Exception e) {
            log.error("Error getting token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting token: " + e.getMessage());
        }

        //return null;
    }

    // 액세스 토큰으로 사용자정보 알아내기
    private KakaoUserInfo getUserInfo(String accessToken) {
        // 사용자 정보 요청을 위한 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
        headers.set("Authorization", "Bearer " + accessToken);

        // HTTP 요청 엔티티 생성
        HttpEntity<String> request = new HttpEntity<>(headers);

        // GET 요청으로 사용자 정보 받기
        ResponseEntity<KakaoUserInfo> response = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                request,
                KakaoUserInfo.class
        );

        return response.getBody();
    }

    // 카카오 로그아웃
}

