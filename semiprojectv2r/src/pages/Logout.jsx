import React from "react";

const Logout = () => {
    //localStorage.clear();

    if (localStorage.getItem("kakao")) {

        localStorage.removeItem("kakao");
    }

    localStorage.removeItem("accessToken");

    return (
        location.href="/"
    );
}

export default Logout;
