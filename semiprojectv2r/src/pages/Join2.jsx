import {useEffect, useRef, useState} from "react";
import "../styles/member.css";

// 회원가입 처리 함수
const processJoinok = async (formValues) => {
    // Web Crypto API로 비밀번호 암호화
    //formValues.passwd = await hashPassword(formValues.passwd);
    //console.log(formValues.passwd);

    fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues) // 데이터를 JSON 문자열로 변환
    }).then(async response => {
        if (response.ok) { // 회원가입이 정상적으로 처리되었다면
            alert('회원가입이 완료되었습니다!!');
            location.href = '/member/login';
        } else if (response.status === 400) {
            alert(await response.text());
        } else { // 회원가입이 실패했다면
            alert('회원가입에 실패했습니다!! 다시 시도해 주세요!');
        }
    }).catch(error => {
        console.error('join error:', error);
        alert('서버와 통신중 오류가 발생했습니다!! 관리자에게 문의하세요!');
    });
};

// Join 함수 컴포넌트 정의
const Join2 = () => {
    // form 요소 참조를 위한 ref 변수 생성
    const formJoinRef = useRef(null);

    // 오류 상태를 위한 변수 선언
    // errors : 상태를 저장하기 위한 변수
    // setErrors : errors 변수의 상태를 변경하는 함수
    const [errors, setErrors] = useState({});
    const [sitekey, setSitekey] = useState(null);
    const [email, setEmail] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [codeVerified, setCodeVerified] = useState(false);

    // 폼 재설정 처리
    const handleReset = () =>  {
        formJoinRef.current.reset();
        setErrors({});
        setEmail('');
        setEmailValid(false);
        setCodeSent(false);
        setVerificationCode('');
        setInputCode('');
        setCodeVerified(false);
    };

    // 폼 제출시 데이터 처리 및 유효성 검사
    const handleJoinSubmit = (e) => {
        setErrors({});
        e.preventDefault();

        // FormData API를 사용해서 폼 데이터 수집
        const formData = new FormData(formJoinRef.current);
        const formValues = Object.fromEntries(formData.entries());
        console.log(">> join ", formValues["g-recaptcha-response"]);

        // 전체 폼 유효성 검사
        const formErrors = validateJoinForm(formValues);

        // 유효성 검사후 오류가 하나라도 없다면?
        if (Object.keys(formErrors).length === 0 && codeVerified) {
            console.log('입력한 회원 정보 : ', formValues);
            // 회원가입처리 API 호출
            processJoinok(formValues);
        } else { // 오류가 하나라도 존재한다면?
            setErrors(formErrors);
            console.log('오류 정보 : ', formErrors);
        }

    };

    // 전체 폼 유효성 검사 함수
    const validateJoinForm = (values) => {
        let formErrors = {};

        // 아이디 검사
        if (!values.userid) {
            formErrors.userid = "아이디를 입력하세요!!";
        } else if (values.userid.length < 6) {
            formErrors.userid = "아이디는 6자 이상이어야 합니다!!";
        }

        // 비밀번호 검사
        if (!values.passwd) {
            formErrors.passwd = "비밀번호를 입력하세요!!";
        } else if (values.passwd.length < 6) {
            formErrors.passwd = "비밀번호는 6자 이상이어야 합니다!!";
        }

        // 비밀번호 확인 검사
        if (!values.repasswd) {
            formErrors.repasswd = "비밀번호 확인을 입력하세요!!";
        } else if (values.passwd !== values.repasswd) {
            formErrors.repasswd = "비밀번호가 일치하지 않습니다!!";
        }
        
        // 이름 확인 검사
        if (!values.name) {
            formErrors.name = "이름을 입력하세요!!";
        }

        // 이메일 확인 검사
        if (!values.email) {
            formErrors.email = "이메일을 입력하세요!!";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            formErrors.email = "유효한 이메일 주소를 입력하세요!!";
        } else {
            setEmailValid(true);
        }

        // 리캡챠 확인 검사
        if (!values["g-recaptcha-response"]) {
            formErrors.recaptcha = "자동가입방지를 확인하세요!!";
        }

        return formErrors;
    };

    // recaptcha 모듈 적재
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        const site_key = import.meta.env.VITE_APP_RECAPTCHA_SITEKEY;
        setSitekey(site_key);

    }, []);

    const handleSendCode = () => {
        // 임시 인증코드 생성
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(generatedCode);
        setCodeSent(true);
        console.log("인증코드", generatedCode);
        alert(`인증코드가 전송되었습니다: ${generatedCode}`); // 실제로는 API 호출 필요
    };

    const handleVerifyCode = () => {
        if (inputCode === verificationCode) {
            alert('인증이 완료되었습니다!');
            setCodeVerified(true);
        } else {
            alert('인증코드가 일치하지 않습니다.');
        }
    };

    return (
        <main id="content">
            <h2>회원가입</h2>
            <form name="joinfrm" id="joinfrm" method="post"
              ref={formJoinRef} onSubmit={handleJoinSubmit} noValidate>

                <div className="form-floating my-2">
                    <input type="text" name="userid" id="userid"
                           className={`form-control ${errors.userid ? 'is-invalid' : ''}`}
                           placeholder="아이디" required minLength="6" maxLength="18"/>
                    <label htmlFor="userid" className="form-label">아이디</label>
                    {errors.userid && <div className="invalid-feedback">{errors.userid}</div>}
                </div>

                <div className="form-floating my-2">
                    <input type="password" name="passwd" id="passwd"
                           className={`form-control ${errors.passwd ? 'is-invalid' : ''}`}
                           placeholder="비밀번호" required minLength="6" maxLength="18"/>
                    <label htmlFor="passwd" className="form-label">비밀번호</label>
                    {errors.passwd && <div className="invalid-feedback">{errors.passwd}</div>}
                </div>

                <div className="form-floating my-2">
                    <input type="password" name="repasswd" id="repasswd"
                           className={`form-control ${errors.repasswd ? 'is-invalid' : ''}`}
                           placeholder="비밀번호 확인" required minLength="6" maxLength="18"/>
                    <label htmlFor="repasswd" className="form-label">비밀번호 확인</label>
                    {errors.repasswd && <div className="invalid-feedback">{errors.repasswd}</div>}
                </div>

                <div className="form-floating my-2">
                    <input type="text" name="name" id="name"
                           className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                           placeholder="이름" required/>
                    <label htmlFor="name" className="form-label">이름</label>
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="my-2 position-relative">
                    <div className="form-floating">
                        <input type="email" name="email" id="email"
                               className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                               placeholder="이메일"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               required />
                        <label htmlFor="email" className="form-label">이메일</label>
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    {/* 조건에 따라 버튼 표시 */}
                    {emailValid && !codeVerified && (
                        <button type="button"
                                className="btn btn-outline-light position-absolute top-50 end-0 translate-middle-y me-2 border-danger text-danger"
                                onClick={codeSent ? handleVerifyCode : handleSendCode}>
                            {codeSent ? '인증코드 확인' : '인증코드 전송'}
                        </button>
                    )}
                </div>

                {/* 인증코드 입력 필드 */}
                {codeSent && !codeVerified && (
                    <div className="form-floating my-2">
                        <input type="text" className="form-control"
                               placeholder="인증코드 입력"
                               value={inputCode}
                               onChange={(e) => setInputCode(e.target.value)} />
                        <label className="form-label">인증코드 입력</label>
                    </div>
                )}

                <div className="my-2 d-flex justify-content-center">
                    <div className="g-recaptcha" data-sitekey={sitekey}></div>
                </div>
                {errors.recaptcha && <div className="alert alert-danger">{errors.recaptcha}</div>}

                <div className="my-2 d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary">
                        <i className="fa-sharp fa-solid fa-file-signature"></i> 입력완료
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleReset}>
                        <i className="fa-sharp fa-solid fa-eraser"></i> 다시입력
                    </button>
                </div>
            </form>
        </main>
    )
}

export default Join2;
