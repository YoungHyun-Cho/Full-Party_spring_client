import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { RootReducerType } from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserdata } from '../actions/signin';
import { modalChanger } from '../actions/modal';
import { CLOSE_MODAL } from '../actions/modalType';
import { SIGNIN_SUCCESS } from '../actions/signinType';
import { HttpMethod, SignUpType, sendRequest, setCookie, setSessionStorage } from '../App';

export const ModalContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow: auto;
  z-index: 1000;
`;

export const ModalBackdrop = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalView = styled.div`
  width: 80%;
  max-width: 350px;
  max-height: 90vh;
  overflow: auto;
  border-radius: 30px;
  background-color: white;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  padding: 30px;
  text-align: center;

  header {
    font-size: 25px;
    line-height: 28px;
    margin-bottom: 15px;
    font-family: 'SilkscreenBold';
  }

  .inputSection {
    margin-bottom: 10px;

    fieldset {
      border: none;
      margin: 15px 0;

      .label {
        font-family: 'SilkscreenRegular';
        margin: 5px 0;
      }

      input {
        width: 80%;
        height: 30px;
        border: none;
        border-bottom: 1px solid #d5d5d5;
        text-align: center;

        &:focus {
          outline-style:none;
        }
      }
    }
  }

  .signinBtn {
    width: 80%;
    height: 50px;
    border: none;
    border-radius: 20px;
    background-color: #50C9C3;
    color: white;
    font-family: 'SilkscreenBold';
    font-size: 15px;
    margin: 10px 0 15px 0;
    cursor: pointer;
  }

  .signupModalBtn {
    color: #50C9C3;
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
  }

  .toSignup {
    font-size: 0.8rem;
    margin: 10px 0 20px 0;
  }

  .notUser{
    color: #f34508;
    font-size: 10px;
    margin: 25px 0 10px 0;
  }

  .oauthBtns {
    padding: 0 5%;

    .oauthLabel {
      display: flex;
      align-items: center;
      font-size: 0.8rem;
      margin-bottom: 15px;

      hr {
        flex-grow: 1;
        height: 1px;
        border: none;
        background-color: #d5d5d5;
        margin: 0 10px;
      }
    }

    .oauth {
      width: 50px;
      height: 50px;
      border: none;
      border-radius: 100%;
      margin: 0 10px;
      padding-top: 2px;
      cursor: pointer;

      img {
        width: 25px;
        height: 25px;
      }

      &.guest {
        background-color: #50C9C3;
      }

      &.kakao {
        background-color: #FEE500;
      }

      &.google {
        background-color: white;
        border: 1px solid #e0e0e0;
      }
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-height: 3rem;
  font-size: 1rem;
  border: 1.5px solid var(--color-maingreen--100);
  * {
    font-size: 0.5rem;
  }
`;

export const CloseBtn = styled.button`
  width: 100%;
  text-align: right;
  cursor: pointer;
  margin-bottom: 15px;
  background-color: white;
  border: none;
`

export default function SigninModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [ isTried, setIsTried ] = useState(false);

  const signinReducer = useSelector((state: RootReducerType) => state.signinReducer);

  const [ userInfo, setUserInfo ] = useState({
    email: '',
    password: ''
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserInfo({
      ...userInfo,
      [name]: value
    });
  };

  const closeModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch(modalChanger(e.currentTarget.className))
  };

  const signupModal = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    dispatch(modalChanger(e.currentTarget.className))
  };

  const loginHandler = (signUpType: SignUpType) => {

    setIsTried(true);
    
    if (signUpType === SignUpType.NORMAL) normalLoginHandler();
    else if (signUpType === SignUpType.GUEST) guestLoginHandler(); 
    else socialLoginHandler(signUpType);
  }

  const socialLoginHandler = (signUpType: SignUpType) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/${signUpType}`;
  };

  const normalLoginHandler = () => {

    dispatch(fetchUserdata(userInfo))
    if (signinReducer.isLoggedIn) {
      dispatch({
        type: CLOSE_MODAL
      });
    }

    navigate('/home');
  };

  const guestLoginHandler = async () => {
  
    const response = await sendRequest(
      HttpMethod.POST,
      `${process.env.REACT_APP_API_URL}/auth/guest`,
      {}
    );

    setSessionStorage({ ...response.data });

    dispatch({
      type: SIGNIN_SUCCESS,
      payload: response.data
    });

    dispatch({
      type: CLOSE_MODAL
    });

    setCookie("signupType", "guest");
    setCookie("isLoggedIn", "1");

    navigate('/home');
  };

  return (
    <ModalContainer>
      <ModalBackdrop>
        <ModalView>
          <CloseBtn><div className='closeModalBtn' onClick={(e) => closeModal(e)}><FontAwesomeIcon icon={faTimes} /></div></CloseBtn>
          <header>
            start
            <br />1 player
          </header>
          <section className="inputSection">
            <fieldset>
              <div className='label'>email</div>
              <input
                type='text'
                name='email'
                value={userInfo.email}
                autoComplete='off'
                onChange={(e) => handleInput(e)}
              />
            </fieldset>
            <fieldset>
              <div className='label'>password</div>
              <input
                type='password'
                name='password'
                value={userInfo.password}
                autoComplete='off'
                onChange={(e) => handleInput(e)}
              />
            </fieldset>
          </section>
          {isTried === true && signinReducer.isLoggedIn === false ? <div className='notUser'>입력하신 아이디 혹은 비밀번호가 유효하지 않습니다.</div> : <span />}
          <footer>
            <button className='signinBtn' onClick={() => loginHandler(SignUpType.NORMAL)}>
              Press Start
            </button>
            <section className='toSignup'>
              아직 풀팟의 파티원이 아니세요?<br />
              지금 바로 <span className='signupModalBtn' onClick={(e) => signupModal(e)}>회원가입</span> 하세요 🥳
            </section>
            <div className="oauthBtns">
              <div className="oauthLabel">
                <hr /> OR <hr />
              </div>
              <button 
                onClick={() => loginHandler(SignUpType.GUEST)} 
                className="oauth guest"
                id="guest"  
              >
                <img src="img/fullparty_symbol.png" />
              </button>
              <button onClick={() => loginHandler(SignUpType.KAKAO)} className="oauth kakao">
                <img src="img/kakao_symbol.svg" />
              </button>
              <button onClick={() => loginHandler(SignUpType.GOOGLE)} className="oauth google">
                <img src="img/google_symbol.svg" />
              </button>
            </div>
          </footer>
        </ModalView>
      </ModalBackdrop>
    </ModalContainer>
  );
}