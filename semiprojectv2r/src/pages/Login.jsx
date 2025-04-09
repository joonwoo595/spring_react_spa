import {useRef, useState} from "react";
import "../styles/member.css"
import KakaoLogin from "../components/KakaoLogin.jsx";

// 폼 재설정 함수

// 암호화 함수

// 로그인 처리 함수
const processLoginok = async (values) => {
    fetch("http://localhost:8080/api/auth/signin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(values),
    }).then(async response => {
        if (response.ok) {
            const data = await response.json();
            console.log(data);

            if (data.accessToken) { // JWT 토큰이 존재하면
                localStorage.setItem("accessToken", data.accessToken);
                alert('로그인 성공!!');
                location.href="/member/myinfo";
            } else {
                alert('다시 로그인 하세요!!');
                location.href="/member/login";
            }

        } else if (response.status === 401) {
            alert(await response.text());
        }
    }).catch(error => {
        console.log(error);
        alert('서버와 통신하는 중 오류가 발생했습니다!!');
    });
};

// Login 함수 컴포넌트 정의
const Login = () => {
    // 폼 처리 관련 변수 선언
    const formLoginRef = useRef(null);
    const [errors, setErrors] = useState({});

    // 폼 처리 관련 함수 선언
    const handleLoginSubmit = (e) => {
        e.preventDefault();

        // 폼에 입력된 데이터들 가져오기
        const formData = new FormData(formLoginRef.current);
        const formValues = Object.fromEntries(formData.entries());

        // 유효성 검사 실시
        const formErrors = validateLoginForm(formValues);

        // 유효성 검사 결과에 따라 개별 처리
        if (Object.keys(formErrors).length === 0) {
            console.log('로그인 요청데이터 : ', formValues);
            processLoginok(formValues);
        } else {
            setErrors(formErrors);
            console.log(formErrors);
        }
    }

    // 폼 유효성 검사 함수
    const validateLoginForm = (values) => {
        let formErrors = {};

        // 아이디 검사
        if (!values.userid) {
            formErrors.userid = '아이디를 입력하세요!!';
        } else if (values.userid.length < 6) {
            formErrors.userid = '아이디는 6자 이상이어야 합니다!!';
        }

        // 비밀번호 검사
        if (!values.passwd) {
            formErrors.passwd = '비밀번호를 입력하세요!!';
        } else if (values.passwd.length < 6) {
            formErrors.passwd = '비밀번호는 6자 이상이어야 합니다!!';
        }

        return formErrors;
    }
    
    return (
        <main id="content">
            <h2>로그인</h2>
            <form name="loginfrm" id="loginfrm" method="post"
                  ref={formLoginRef} onSubmit={handleLoginSubmit} noValidate>
                <div className="form-floating my-2">
                    <input type="text" name="userid" id="userid"
                       className={`form-control ${errors.userid ? 'is-invalid' : ''}`}
                       required placeholder="아이디"/>
                    <label htmlFor="userid" className="form-label">아이디</label>
                    {errors.userid && <div className="invalid-feedback">{errors.userid}</div>}
                </div>

                <div className="form-floating my-2">
                    <input type="password" name="passwd" id="passwd"
                       className={`form-control ${errors.passwd ? 'is-invalid' : ''}`}
                       required placeholder="비밀번호"/>
                    <label htmlFor="passwd" className="form-label">비밀번호</label>
                    {errors.passwd && <div className="invalid-feedback">{errors.passwd}</div>}
                </div>

                <div className="my-2 d-flex justify-content-center">
                    <img src="/image/captcha.png"/>
                </div>

                <div className="d-flex justify-content-center py-2 gap-2">
                    <button type="submit" className="btn btn-primary">
                        <i className="fa-solid fa-right-to-bracket"></i> 로그인
                    </button>
                    <button type="button" className="btn btn-danger">
                        <i className="fa-solid fa-key"></i> 비밀번호찾기
                    </button>
                </div>

                <KakaoLogin />

            </form>
        </main>
    )
}

export default Login;
