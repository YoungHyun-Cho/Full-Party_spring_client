import React, { useState } from 'react';
import UserMap from './UserMap';
import styled from 'styled-components';
import axios from 'axios';
import UserAddressInput from './UserAddressInput';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { AppState } from '../reducers';
import { useDispatch, useSelector } from 'react-redux';
import { SIGNIN_SUCCESS } from '../actions/signinType';
import { HttpMethod, sendRequest } from '../App';

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

  .error {
    font-size: 0.7rem;
    color: #f34508;
    margin-top: 5px;
  }

  .confirm {
    font-weight: bold;
    margin-bottom: 10px;
  }

  table {
    margin-bottom: 10px;

    .label {
      width: 50px;
      font-weight: bold;
    }
  }
`;

export const MapContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;

  img {
    width: 50px;
    height: 50px;
  }

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

  .mapInput {
    width: 100%;
    height: 250px;

    margin-bottom: 10px;
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
`;

export const BtnContainer = styled.section`
  width: 100%;
  display: flex;
  justify-content: space-between;

  button {
    width: 90px;
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
    }
  }
`;

export default function  AddressModal() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [ pageIdx, setPageIdx ] = useState(0);
  const [ address, setAddress ] = useState('');
  const [ errorMsg, setErrorMsg ] = useState('');
  const [ isSearch, setIsSearch ] = useState(false);

  const userInfo = useSelector(
    (state: AppState) => state.signinReducer.userInfo
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleAddressChange = (address: string) => setAddress(address);

  const searchHandler = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => setIsSearch(!isSearch);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const toGo = (event.currentTarget as HTMLButtonElement).value;
    if (toGo === "next") setPageIdx(pageIdx + 1);
    else setPageIdx(pageIdx - 1);
  };

  const handleAddressRegister = async () => {
    if (address) {
      setErrorMsg('');
      
      const res = await axios.patch(`${process.env.REACT_APP_API_URL}/user/address/${userInfo.id}`, {
        userId: userInfo.id, address
      });

      // const res = sendRequest(HttpMethod.PATCH, `${process.env.REACT_APP_API_URL}/user/address/${userInfo.id}`);

      if (res.status === 200) {
        dispatch({
          type: SIGNIN_SUCCESS,
          payload: {
            ...userInfo,
            address
          }
        });
        navigate('../home');
      }
    }
    else setErrorMsg('주소를 입력해주세요.');
  }

  return(
    <ModalContainer>
      <ModalBackdrop>
        <ModalView>
          {pageIdx === 0 ?
            <>
              <MapContainer>
                <div className="mapInfo">
                    <img src="img/404logo.png" alt="logo" />
                    <div className="mapTitle">주소를 등록해주세요!</div>
                    <div className="details">이 위치를 기반으로 퀘스트가 검색됩니다.</div>
                </div>
                <div className='mapInput'>
                  <UserAddressInput 
                    profileImage={userInfo.profileImage ? userInfo.profileImage : "https://teo-img.s3.ap-northeast-2.amazonaws.com/defaultProfile.png"}
                    address={userInfo.address}
                    handleAddressChange={handleAddressChange}
                    isSearch={isSearch}
                    searchHandler={searchHandler}
                  />
                </div>
              </MapContainer>
              <BtnContainer style={{ justifyContent: "flex-end" }}>
                <div />
                <button onClick={searchHandler} className="request">주소 검색</button>
                <button onClick={handlePageChange} value="next">다음 <FontAwesomeIcon icon={faAngleRight} className="icon right" /></button>
              </BtnContainer>
            </>
          : null}
          {pageIdx === 1 ?
            <>
              <div className='confirm'>이 정보가 맞나요?</div>
                <table>
                  <tr>
                    <td className='label'>주소</td>
                    <td className='info'>{address}</td>
                  </tr>
                </table>
              <div className='error'>{errorMsg}</div>
              <BtnContainer>
                <button onClick={handlePageChange} value="prev"><FontAwesomeIcon icon={faAngleLeft} className="icon left" /> 이전</button>
                <button onClick={handleAddressRegister} className="request">제출</button>
              </BtnContainer>
            </>
          : null}
        </ModalView>
      </ModalBackdrop>
    </ModalContainer>
  )
}