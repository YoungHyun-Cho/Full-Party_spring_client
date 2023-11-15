import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Loading from '../components/Loading';
import QuestCard from '../components/QuestCard';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../reducers';
import { NOTIFY } from "../actions/notify"
import { Headers, cookieParser } from '../App';

export const FavoriteContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 70px 0;
  padding: 20px 30px;

  header.favoriteHeader {
    font-size: 1.7rem;
    font-weight: bold;
  }

  .emptyMsg {
    margin: 20px 0;
    font-size: 1.1rem;
    color: #777;
  }
`;

export default function Favorite() {
  const dispatch = useDispatch();

  const userInfo = useSelector(
    (state: AppState) => state.signinReducer.userInfo
  );
  const userId = useSelector(
    (state: AppState) => state.signinReducer.userInfo.id
  );

  const headers: Headers = {
    Authorization: "Bearer " + cookieParser()["token"],
    Refresh: cookieParser()["refresh"]
  };

  const [ isLoading, setIsLoading ] = useState(true);
  const [ favoriteList, setFavoriteList ] = useState<Array<Object>>([]);

  useEffect(() => {
    (async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/hearts`, {
        headers, withCredentials: true
      });
      console.log(response);
      dispatch({
        type: NOTIFY,
        payload: {
          isBadgeOn: response.data.notificationBadge
        }
      });
      setFavoriteList(response.data.parties);
    })();
  }, [ userInfo ]);

  useEffect(() => {
    setIsLoading(false);
  }, [ favoriteList ]);

  if (cookieParser().isLoggedIn === "0") return <Navigate to="../" />
  else if(isLoading) return <Loading />

  return (
    <FavoriteContainer>
      <header className="favoriteHeader">
        내가 관심있는 퀘스트
      </header>
      {favoriteList.length > 0 ?
        favoriteList.map((party, idx) => <QuestCard key={idx} party={party} />)
      : <div className="emptyMsg">아직 관심 설정한 퀘스트가 없습니다.</div>}
    </FavoriteContainer>
  );
}