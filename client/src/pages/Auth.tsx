import React from 'react';
import styled from 'styled-components';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SIGNIN_SUCCESS } from '../actions/signinType';
import { useDispatch } from 'react-redux';
import { HttpMethod, cookieParser, sendRequest, setAllCookie, setCookie, setSessionStorage } from '../App';

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

    const signUpType = new URL(window.location.href).searchParams.get("sign_up_by");
    handleSocialLogin(signUpType as string);
    
  }, []);

  const searchParams = (name: string) => new URL(window.location.href).searchParams.get(name) + "";

  const handleSocialLogin = async (provider: string) => {

    const userId = searchParams("user_id");
    const accessToken = searchParams("access_token");
    const refreshToken = searchParams("refresh_token");

    const response = await sendRequest(
      HttpMethod.GET,
      `${process.env.REACT_APP_API_URL}/users/${userId}`,
      null
    );

    setSessionStorage({ ...response.data });

    setAllCookie(provider, "1", accessToken, refreshToken);
 
    dispatch({
      type: SIGNIN_SUCCESS,
      payload: response.data
    });

    navigate("../home");
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
