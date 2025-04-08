package com.example.zzyzzy.semiprojectv2.service;

import com.example.zzyzzy.semiprojectv2.domain.Member;
import com.example.zzyzzy.semiprojectv2.domain.User;
import com.example.zzyzzy.semiprojectv2.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Override
    public User newUser(User user) {

        // 아이디 중복 체크
        if (userRepository.existsByUserid(user.getUserid())) {
            throw new IllegalStateException("이미 존재하는 아이디입니다!!");
        }

        // 이메일 중복 체크
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalStateException("이미 존재하는 이메일입니다!!");
        }

        try {
            user.setVerifycode(makeVerifyCode());  // 계정에 인증코드 생성
            sendVerifyCode(user);   // 메일로 확인용 인증코드 발송
        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalStateException("인증코드 발송에 문제 발생!!");
        }

        user.setPasswd(passwordEncoder.encode(user.getPasswd()));  // 비밀번호를 암호화시켜 저장
        return userRepository.save(user);
    }

    // 알파벳과 숫자로 구성된 6자리 코드 생성
    private String makeVerifyCode() {
        return RandomStringUtils.randomAlphanumeric(6);
    }

    // 인증코드가 포함된 메일 발송
    private void sendVerifyCode(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("회원가입 이메일 인증코드 발송");
        message.setText("인증코드 : " + user.getVerifycode());
        mailSender.send(message);
    }

    @Override
    public User loginUser(User user) {
        User findUser = userRepository.findByUserid(user.getUserid()).orElseThrow(
                () -> new UsernameNotFoundException("사용자가 존재하지 않습니다!!")
        );

        if (findUser == null || !findUser.getPasswd().equals(user.getPasswd())) {
            throw new IllegalStateException("아이디나 비밀번호가 일치하지 않습니다!!");
        }

        return findUser;
    }

    @Override
    public boolean verifyEmail(String userid, String email, String code) {
        Optional<User> user = userRepository
            .findByUseridAndEmailAndVerifycode(userid, email, code);

        if (user.isPresent()) {
            user.get().setVerifycode(null); // 인증코드 초기화
            user.get().setEnabled("true"); // 로그인 가능하도록 설정
            userRepository.save(user.get());
            return true;
        }

        return false;
    }

}
