import React, { useState, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Loading from './Loading';
import UserAddressInput from './UserAddressInput'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import { modalChanger } from '../actions/modal';
import { faTimes, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Coordinates, HttpMethod, sendRequest } from '../App';

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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  header {
    font-size: 25px;
    margin-bottom: 15px;
    font-family: 'SilkscreenBold';
  }

  table {
    td {
      height: 50px;
    }

    .label {
      font-size: 0.9rem;
      font-weight: bold;
    }

    .input, .info {
      width: 186px;
      font-size: 0.9rem;
    }

    .input {
      padding: 0 8px;

      input {
        border: none;
        border-bottom: 1px solid #d5d5d5;
        width: 170px;
        height: 25px;
        text-align: center; 

        &:focus {
          outline-style:none;
        }
      }

      input[type=date] {
        font-family: "-apple-system";
        background-color: #fff;

        &:focus {
          outline-style:none;
        }
      }

      select {
        width: 170px;
        text-align: center;
        border: none;
        border-bottom: 1px solid #d5d5d5;
        background-color: #fff;

        &:focus {
          outline-style:none;
        }
      }
    }
  }

  .profileImage {
    width: 100px;
    height: 100px;
  }

  .confirm {
    margin: 8px 0;
    font-size: 0.9rem;
  }

  .error {
    font-size: 0.7rem;
    color: #f34508;
    margin-top: 5px;
  }
`;

export const MapContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  margin-bottom: 10px;

  .mapTitle {
    font-weight: bold;
    margin-bottom: 5px;
    margin-top: 10px;
  }

  .details {
    font-size: 0.8rem;
    color: #777;
    margin-bottom: 20px;
  }

  input {
    width: 100%;
    height: 25px;
    border: none;
    border-bottom: 1px solid #d5d5d5;
    margin: 8px 0;

    &:focus {
      outline-style:none;
    }
  }

  .mapInput {
    width: 100%;
    height: 200px;
  }
`;

export const CloseBtn = styled.button`
  width: 100%;
  text-align: right;
  cursor: pointer;
  margin-bottom: 10px;
  background-color: white;
  border: none;
`;

export const BtnContainer = styled.section`
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;

  button {
    width: 100px;
    height: 40px;
    border: none;
    border-radius: 10px;
    background-color: white;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon {
      &.left {
        margin-right: 5px;
      }

      &.right {
        margin-left: 5px;
      }
    }

    &.request {
      background-color: #50C9C3;
      color: #fff;
      font-weight: bold;

      &:disabled {
        background-color: #fff;
        color: #50C9C3;
        border: 1px solid #50C9C3;
      }
    }
  }
`;

export const ProgressBar = styled.section`
  width: 100%;
  margin: 15px 0;
  padding: 0 25px;

  .barContainer {
    height: 5px;
    width: 100%;
    border-radius: 50px;
    background-color: #e9e7e7;
  }

  .barFiller {
    height: 100%;
    background-color: #50C9C3;
    border-radius: inherit;
    text-align: right;
  }
`;

export default function SignupModal() {
  type Info = {
    profileImage: any;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    gender: string;
    birth: string;
    mobile: string;
    address: string;
  };

  const dispatch = useDispatch();
  const cameraRef = useRef<any>();
  const [ isLoading, setIsLoading ] = useState(false);
  const [ pageIdx, setPageIdx ] = useState(0);

  const [ userInfo, setUserInfo ] = useState<Info>({
    profileImage: 'defaultProfile.png',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: 'none',
    birth: '',
    mobile: '',
    address: ''
  });

  const [ isError, setIsError ] = useState({
    isEmail: true,
    isName: true,
    isGender: true,
    isBirth: true,
    isMobile: true,
    isAxios: true,
    isVerificationCode: false,
    emailMsg: '',
    nameMsg: '',
    genderMsg: '',
    birthMsg: '',
    mobileMsg: '',
    axiosMsg: '',
    verificationMsg: '',
  });

  const [ isPassword, setIsPassword ] = useState({
    isValid: false,
    passwordMsg: '',
  });

  const [ isConfirmPassword, setIsConfirmPassword ] = useState({
    isValid: false,
    confirmPasswordMsg: '',
  });

  
  const [ isSearch, setIsSearch ] = useState(false);
  const [ isSent, setIsSent ] = useState(false);
  const [ isTimeOut, setIsTimeOut ] = useState(false);
  const [ isRequested, setIsRequested ] = useState(false);

  const [ fixedLocation, setFixedLocation ] = useState('');
  const [ formatAddress, setFormatAddress ] = useState('');
  const [ inputCode, setInputCode ] = useState('');

  const [ coordinates, setCoordinates ] = useState({ lat: 37.496562, lng: 127.024761 });

  const [ verificationData, setVerificationData ] = useState({
    email: userInfo.email,
    code: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const regex={
      email: /\S+@\S+\.\S+/,
      password: /^(?=.*[a-zA-Z])((?=.*\d)(?=.*\W).{8,16}$)/,
      mobile: /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4,4}/
    };
    setUserInfo({
      ...userInfo,
      [name]: value
    });
    if (name === 'email') {
      if (!regex.email.test(value)) {
        setIsError({
          ...isError,
          isEmail: false,
          emailMsg: '유효하지 않은 이메일 형식입니다.'
        });
      }
      else {
        setIsError({
          ...isError,
          isEmail: true,
          emailMsg: ''
        });
      }
    };

    if (name === 'password') {
      if (!regex.password.test(value)) {
        setIsPassword({
          isValid: false,
          passwordMsg: '숫자/영문자/특수문자를 포함한 8~16자리의 비밀번호여야 합니다.'
        });
      }
      else {
        setIsPassword({
          isValid: true,
          passwordMsg: '',
        });
      }

      if (userInfo.confirmPassword !== value) {
        setIsConfirmPassword({
          isValid: false,
          confirmPasswordMsg: '비밀번호가 일치하지 않습니다.',
        });
      }
      else {
        setIsConfirmPassword({
          isValid: true,
          confirmPasswordMsg: '',
        });
      }
    };

    if (name === 'confirmPassword') {
      if (userInfo.password !== value) {
        setIsConfirmPassword({
          isValid: false,
          confirmPasswordMsg: '비밀번호가 일치하지 않습니다.',
        });
      }
      else {
        setIsConfirmPassword({
          isValid: true,
          confirmPasswordMsg: '',
        });
      }
    };

    if (name === 'mobile') {
      if (!regex.mobile.test(value)) {
        setIsError({
          ...isError,
          isMobile: false,
          mobileMsg: "'-'를 포함하여 입력해주세요."
        });
      }
      else {
        setIsError({
          ...isError,
          isMobile: true,
          mobileMsg: ''
        });
      }
    };
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value
    });
  };

  const getCurrentDate = () => {
    let newDate = new Date();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    return year + "-" + (month < 10 ? `0${month}` : `${month}`) + "-" + date;
  };

  const handleAddressChange = (address: string) => {
    setUserInfo({
      ...userInfo,
      address,
    });
  };

  const handleCoordsChange = (changedCoords: Coordinates) => setCoordinates(changedCoords);

  const searchHandler = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => setIsSearch(!isSearch);

  const mailVerification = async () => {

    const response = await sendRequest(
      HttpMethod.POST,
      `${process.env.REACT_APP_API_URL}/mails/verification`,
      { email: userInfo.email }
    );

    if (response.status === 409) {
      setIsError({
        ...isError,
        isAxios: true,
        emailMsg: '이미 가입된 이메일 주소입니다.'
      });
    }

    else {
      setIsSent(true);
      setVerificationData({ email: userInfo.email, code: response.data.code });
      setTimeout(handleCodeExpire, 1000 * 60 * 5);
    }
  };

  const codeVerification = () => {

    if (verificationData.code + "" === inputCode + "") {
      setPageIdx(pageIdx + 1);
      setIsError({
        ...isError,
        isVerificationCode: true,
        verificationMsg: '',
      });
    }
    else {
      setIsError({
        ...isError,
        isVerificationCode: false,
        verificationMsg: '인증번호가 틀렸습니다.',
      });
    }
  };

  const remailVerification = async () => {
    setIsTimeOut(false);
    setIsError({
      ...isError,
      isVerificationCode: false,
      verificationMsg: '',
    });
    mailVerification();
  };

  const handleCodeExpire = () => {
    setIsTimeOut(true);
    setIsError({
      ...isError,
      isVerificationCode: false,
      verificationMsg: '인증시간이 만료됐습니다.',
    });
  };

  const handleSignup = async () => {

    console.log(userInfo);
    const { profileImage, email, password, name, gender, birth, mobile, address } = userInfo;
    const { isEmail, isName, isGender, isBirth, isMobile } = isError;

    if (!email || !password || !name || gender === "none" || !birth || !mobile || !address) {
      setIsError({
        ...isError,
        isAxios: true,
        axiosMsg: '작성이 완료되지 않은 정보가 있습니다.'
      });
    }
    else if(!isEmail || !isPassword.isValid || !isConfirmPassword.isValid || !isName || !isGender || !isBirth || !isMobile) {
      setIsError({
        ...isError,
        isAxios: true,
        axiosMsg: '입력하신 정보가 올바른지 확인해주세요.'
      });
    }
    else {

      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const coordinates = new kakao.maps.LatLng(result[0].y, result[0].x);
          const { La, Ma }: any = coordinates;
          handleCoordsChange({ lat: Ma, lng: La });
        }
      });

      setIsRequested(true);

      console.log(        {
        userName: name, profileImage, email, password, 
        birth, gender, mobile, address, coordinates
      });

      await sendRequest(
        HttpMethod.POST,
        `${process.env.REACT_APP_API_URL}/users`,
        {
          userName: name, profileImage, email, password, 
          birth, gender, mobile, address, coordinates
        }
      );
      dispatch(modalChanger('signinModalBtn'));
      setIsRequested(false);
    }
  };

  const changePageIndex = (toGo: string) => {
    if (toGo === "next") setPageIdx(pageIdx + 1);
    else setPageIdx(pageIdx - 1);
  };

  const handlePageChange = async (event: React.MouseEvent<HTMLButtonElement>) => {

    const toGo = (event.currentTarget as HTMLButtonElement).value;

    if (pageIdx === 2) {
      const response = await sendRequest(
        HttpMethod.POST,
        `${process.env.REACT_APP_API_URL}/users/name?user_name=${userInfo.name}`,
        {}
      );
  
      if (response.status === 409) {
        setIsError({
          ...isError,
          isAxios: true,
          nameMsg: '이미 사용 중인 닉네임입니다.'
        });
      }

      else changePageIndex(toGo);
    }

    else changePageIndex(toGo);
  };

  const closeModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch(modalChanger(e.currentTarget.className))
  };

  if (isLoading) return <Loading />

  return(
    <ModalContainer>
      <ModalBackdrop>
        <ModalView>
          <CloseBtn><div className='closeModalBtn' onClick={(e) => closeModal(e)}><FontAwesomeIcon icon={faTimes} /></div></CloseBtn>
          <header>
            <div className="title">Sign Up</div>
          </header>

          <ProgressBar>
            <div className="barContainer">
              <div className="barFiller" style={{ width: `${((pageIdx + 1)/5*100)}%` }} />
            </div>
          </ProgressBar>

          {(() => {
            if (pageIdx === 0) {
              return (
                <table>
                  <tr>
                    <td className='label'>이메일</td>
                    <td className='input'>
                      <input 
                        type='email'
                        name='email'
                        value={userInfo.email}
                        autoComplete='off'
                        onChange={(e) => handleInputChange(e)}
                      />
                      <div className='error'>{isError.emailMsg}</div>
                    </td>
                  </tr>
                  {isSent ? 
                    <tr>
                      <td className='label'>인증번호</td>
                      <td className='input'>
                        <input
                          type='text'
                          name='inputCode'
                          value={inputCode}
                          autoComplete='off'
                          onChange={(e) => setInputCode(e.target.value)}
                        />
                        <div className='error'>{isError.verificationMsg}</div>
                      </td>
                    </tr>
                  : null}
                </table>
              )
            }
            else if (pageIdx === 1) {
              return (
                <table>
                  <tr>
                    <td className='label'>이메일</td>
                    <td className='input'>
                      <input 
                        type='email'
                        name='email'
                        value={userInfo.email}
                        autoComplete='off'
                        onChange={(e) => handleInputChange(e)}
                        disabled={true}
                      />
                      <div className='error'>{isError.emailMsg}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className='label'>비밀번호</td>
                    <td className='input'>
                      <input
                        type='password'
                        name='password'
                        value={userInfo.password}
                        autoComplete='off'
                        onChange={(e) => handleInputChange(e)}
                      />
                      <div className='error'>{isPassword.passwordMsg}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className='label'>비밀번호<br />확인</td>
                    <td className='input'>
                      <input
                        type='password'
                        name='confirmPassword'
                        value={userInfo.confirmPassword}
                        autoComplete='off'
                        onChange={(e) => handleInputChange(e)}
                      />
                      <div className='error'>{isConfirmPassword.confirmPasswordMsg}</div>
                    </td>
                  </tr>
                </table>
              )
            }
            else if (pageIdx === 2) {
              return (
                <table>
                  <tr>
                    <td className='label'>닉네임</td>
                    <td className='input'>
                      <input
                        type='text'
                        name='name'
                        value={userInfo.name}
                        autoComplete='off'
                        onChange={(e) => handleInputChange(e)}
                      />
                      <div className='error'>{isError.nameMsg}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className='label'>젠더</td>
                    <td className='input'>
                    <select
                      name='gender'
                      value={userInfo.gender}
                      onChange={(e) => handleSelectChange(e)}
                      id='gender'
                    >
                      <option value='none' selected={true} disabled={true}>선택</option>
                      <option value='남성'>남성</option>
                      <option value='여성'>여성</option>
                      <option value='기타'>기타</option>
                    </select>
                    <div className='error'>{isError.genderMsg}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className='label'>생일</td>
                    <td className='input'>
                      <input
                        type='date'
                        name='birth'
                        max={getCurrentDate()}
                        value={userInfo.birth}
                        autoComplete='off'
                        onChange={(e) => handleInputChange(e)}
                      />
                      <div className='error'>{isError.birthMsg}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className='label'>전화번호</td>
                    <td className='input'>
                      <input
                        type='tel'
                        name='mobile'
                        value={userInfo.mobile}
                        autoComplete='off'
                        onChange={(e) => handleInputChange(e)}
                        placeholder="'-'을 포함하여 입력해주세요."
                      />
                      <div className='error'>{isError.mobileMsg}</div>
                    </td>
                  </tr>
                </table>
              )
            }
            else if(pageIdx === 3) {
              return (
                <MapContainer>
                  <div className="mapInfo">
                    <div className="mapTitle">주소</div>
                    <div className="details">이 위치를 기반으로 퀘스트가 검색됩니다.</div>
                  </div>
                  <div className='mapInput'>
                    <UserAddressInput 
                      profileImage={userInfo.profileImage}
                      address={userInfo.address}
                      handleAddressChange={handleAddressChange}
                      handleCoordsChange={handleCoordsChange}
                      isSearch={isSearch}
                      searchHandler={searchHandler}
                    />
                  </div>
                </MapContainer>
              )
            }
            else if (pageIdx === 4) {
              return (
                <>
                  <div className='confirm'>이 정보가 맞나요?</div>
                  <table>
                    <tr>
                      <td className='label'>이메일</td>
                      <td className='info'>{userInfo.email}</td>
                    </tr>
                    <tr>
                      <td className='label'>닉네임</td>
                      <td className='info'>{userInfo.name}</td>
                    </tr>
                    <tr>
                      <td className='label'>젠더</td>
                      <td className='info'>{userInfo.gender === 'none' ? '' : userInfo.gender}</td>
                    </tr>
                    <tr>
                      <td className='label'>생일</td>
                      <td className='info'>{userInfo.birth}</td>
                    </tr>
                    <tr>
                      <td className='label'>전화번호</td>
                      <td className='info'>{userInfo.mobile}</td>
                    </tr>
                    <tr>
                      <td className='label'>주소</td>
                      <td className='info'>{userInfo.address}</td>
                    </tr>
                  </table>
                  <div className='error'>{isError.axiosMsg}</div>
                </>
              )
            }
          })()}

          {(() => {
            if (pageIdx === 0) {
              return (
                <BtnContainer style={{ justifyContent: "flex-end" }}>
                  {!isSent? <button onClick={mailVerification} className="request">인증번호 요청</button> : null}
                  {isSent && !isTimeOut ? <button onClick={codeVerification} className="request">인증번호 확인</button> : null}
                  {isSent && isTimeOut? <button onClick={remailVerification} className="request">인증번호 재전송</button> : null}
                </BtnContainer>
              )
            }
            else if (pageIdx === 1){
              return (
                <BtnContainer style={{ justifyContent: "flex-end" }}>
                  <button onClick={handlePageChange} value="next">다음 <FontAwesomeIcon icon={faAngleRight} className="icon right" /></button>
                </BtnContainer> 
              )
            } 
            else if(pageIdx === 3){
              return (
                <BtnContainer>
                  <button onClick={handlePageChange} value="prev"><FontAwesomeIcon icon={faAngleLeft} className="icon left" /> 이전</button>
                  <button onClick={searchHandler} className="request">주소 검색</button>
                  <button onClick={handlePageChange} value="next">다음 <FontAwesomeIcon icon={faAngleRight} className="icon right" /></button>
                </BtnContainer>
              )
            }
            else if (pageIdx === 4) {
              return (
                <BtnContainer>
                  <button onClick={handlePageChange} value="prev"><FontAwesomeIcon icon={faAngleLeft} className="icon left" /> 이전</button>
                  <button onClick={handleSignup} className="request" disabled={!!isRequested}>완료</button>
                </BtnContainer>
              )
            }
            else {
              return (
                <BtnContainer>
                  <button onClick={handlePageChange} value="prev"><FontAwesomeIcon icon={faAngleLeft} className="icon left" /> 이전</button>
                  <button onClick={handlePageChange} value="next">다음 <FontAwesomeIcon icon={faAngleRight} className="icon right" /></button>
                </BtnContainer>
              )
            }
          })()}
        </ModalView>
      </ModalBackdrop>
    </ModalContainer>
  );
}