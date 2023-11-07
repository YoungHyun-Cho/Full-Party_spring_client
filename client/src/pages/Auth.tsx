import React from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SIGNIN_SUCCESS } from '../actions/signinType';
import { useDispatch } from 'react-redux';
import { HttpMethod, cookieParser, sendRequest, setAllCookie, setSessionStorage } from '../App';

export const LoadingContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  outline: none;
  z-index: 1000;
`;

export const LoadingBackdrop = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(255,255,255,0.8);
  padding-top: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .text {
    font-family: 'SilkscreenBold';
    color: #50C9C3;
  }

  img {
    width: 50px;
    height: 50px;
    margin-bottom: 15px;
  }
`;

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // const address = new URL(window.location.href).searchParams.get("code");
    // if (address && address[1] !== "/") handleKakaoLogin();
    // else if (address && address[1] === "/") handleGoogleLogin();

    const signUpType = new URL(window.location.href).searchParams.get("sign_up_by");

    if (signUpType === "google") handleGoogleLogin();
    if (signUpType === "kakao") handleKakaoLogin();
  }, []);

  const handleGoogleLogin = async () => {
    // const authorizationCode = new URL(window.location.href).searchParams.get("code");
    // const response = await axios.post(`${process.env.REACT_APP_API_URL}/google`, {
    //   authorizationCode
    // }, { withCredentials: true });
    // dispatch({
    //   type: SIGNIN_SUCCESS,
    //   payload: response.data.userInfo
    // });

    const searchParams = (name: string) => {
      return new URL(window.location.href).searchParams.get(name) + "";
    };

    const accessToken = searchParams("access_token");
    const refreshToken = searchParams("refresh_token");
    const userId = searchParams("user_id");

    // document.cookie = `signupType=google; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
    // document.cookie = `isLoggedIn=1; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
    // document.cookie = `token=${accessToken}; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
    // document.cookie = `refresh=${refreshToken}; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;

    const response = await sendRequest(
      HttpMethod.GET,
      `${process.env.REACT_APP_API_URL}/users/${userId}`,
      null
    );

    setSessionStorage({ ...response.data });
    setAllCookie("google", "1", accessToken, refreshToken);
 
    dispatch({
      type: SIGNIN_SUCCESS,
      payload: response.data
    });

    navigate("../home");
  };

  const handleKakaoLogin = async () => {
    try {
      const authorizationCode = new URL(window.location.href).searchParams.get("code");
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/kakao`, {
        authorizationCode
      }, { withCredentials: true });
      dispatch({
        type: SIGNIN_SUCCESS,
        payload: response.data.userInfo
      });
      document.cookie = `signupType=kakao; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      document.cookie = `isLoggedIn=1; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      navigate("../home");
    }
    catch (error) {
      console.log(error);
    }
  };

  if (cookieParser().isLoggedIn === "1") navigate('../home');

  return (
    <LoadingContainer>
      <LoadingBackdrop>
        <img src="img/loadingLogo.gif" />
        <div className="text">Loading...</div>
      </LoadingBackdrop>
    </LoadingContainer>
  );
}
