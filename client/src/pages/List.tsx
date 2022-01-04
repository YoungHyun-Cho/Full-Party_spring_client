import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import styled from 'styled-components';
import { AppState } from '../reducers';

export const ListContainer = styled.div`
  width: 100%;
  height: 100%;

  padding: 60px 0;
`

export default function List () {

  const isLoggedIn = useSelector(
    (state: AppState) => state.userReducer.isLoggedIn
  );

  if(!isLoggedIn){
    return <Navigate to="/" />
  }

  return (
    <ListContainer>
      <div>파티 리스트</div>
    </ListContainer>
  );
}
