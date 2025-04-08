package com.example.zzyzzy.semiprojectv2.custom;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class NotEmailVerifyException extends RuntimeException {
    public NotEmailVerifyException(String message) {
        super(message);
    }
}
