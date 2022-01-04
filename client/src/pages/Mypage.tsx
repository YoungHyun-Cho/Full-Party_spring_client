import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import styled from 'styled-components';
import { AppState } from '../reducers';

export const MypageContainer = styled.div`
  width: 100%;
  height: 100%;

  padding: 60px 0;
`

export default function Mypage () {

  const isLoggedIn = useSelector(
    (state: AppState) => state.userReducer.isLoggedIn
  );

  if(!isLoggedIn){
    return <Navigate to="/" />
  }

  return (
    <MypageContainer>
      <div>마이페이지</div>
    </MypageContainer>
  );
}
