import {useCallback, useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
//import { useAuthStore } from "@/stores/AuthStore";

const KakaoOAuthHandler = () => {
    const navigate = useNavigate();
    //const setAccessToken = useAuthStore((state) => state.setAccessToken);

    const sendAuthCodeToServer = async (code)=> {

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', import.meta.env.VITE_APP_KAKAO_API_KEY);
        params.append('code', code);
        params.append('redirect_uri', import.meta.env.VITE_APP_KAKAO_REDIRECT_URI);

        try {
            // fetch를 사용한 Kakao OAuth 토큰 요청
            const response = await fetch('https://kauth.kakao.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
                body: params
            });

            if (!response.ok) {
                throw new Error(`HTTP 에러! 상태: ${response.status}`);
            }
            // 응답 데이터 파싱
            const data = await response.json();
            console.log('응답데이터 : ', data)

            // 응답에서 access token 추출
            const token = data.access_token;
            console.log('엑세스 토큰:', token);
            localStorage.setItem("accessToken", token);
            alert('로그인 성공!!');
            //navigate("/member/kakaoMyinfo", { replace: true });
        } catch (error) {
            console.error(`카카오 로그인 실패:`, error);
            //navigate("/member/login", {replace: true});
        }

    };

    useEffect(() => {
        // 카카오 로그인 후 인가코드 추출
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
            // 인가코드로 액세스 토큰 요청
            sendAuthCodeToServer(code);
        } else {
            navigate("/", { replace: true });
        }

    }, [navigate, sendAuthCodeToServer]);

}

export default KakaoOAuthHandler;