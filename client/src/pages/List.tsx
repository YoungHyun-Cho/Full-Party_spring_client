import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Loading from '../components/Loading';
import PartySlide from '../components/PartySlide';
import LocalQuest from '../components/LocalQuest';
import EmptyCard from '../components/EmptyCard';
import AddressModal from '../components/AddressModal';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Headers, HttpMethod, sendRequest } from "../App";
import { AppState } from '../reducers';
import { NOTIFY } from '../actions/notify';

export const ListContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 70px 0 60px 0;
  padding: 5px 25px;

  section.listSection {
    margin-bottom: 20px;
    header.listHeader {
      font-size: 1.7rem;
      font-weight: bold;
      margin-bottom: 10px;

      main {
        display: flex;
        justify-content: center;
      }
    }
  }
`;

const cookieParser = () => {
  const cookieString = document.cookie.split("; ");
  const keyAndValue = cookieString.map(item => item.split("="));
  let cookieObject: { [key: string]: string } = {};
  keyAndValue.map((item, i) => cookieObject[item[0]] = item[1]);
  return cookieObject;
};

export default function List() {
  const dispatch = useDispatch();

  const userInfo = useSelector(
    (state: AppState) => state.signinReducer.userInfo
  );

  const [ isLoading, setIsLoading ] = useState(true);
  const [ myParties, setMyParties ] = useState([]);
  const [ localParties, setLocalParties ] = useState([]);
  const [ coordinates, setCoordinates ] = useState({ lat: 37.496562, lng: 127.024761 });

  useEffect(() => {

    if (userInfo.address !== "google" && userInfo.address !== "kakao" && userInfo.address !== "guest") {
      setIsLoading(true);

      const headers: Headers = {
        Authorization: "Bearer " + cookieParser()["token"],
        Refresh: cookieParser()["refresh"]
      };

      const searchRegion = userInfo.address.split(" ")[0] + " " + userInfo.address.split(" ")[1];

      (async () => {
        
        const response = await sendRequest(
          HttpMethod.GET, 
          `${process.env.REACT_APP_API_URL}/parties?region=${searchRegion}`,
          null
        );
      
        dispatch({
          type: NOTIFY,
          payload: {
            isBadgeOn: response.data.notificationBadge
          }
        });
        
        const parsedLocalParties = response.data.localParties;
        setLocalParties(parsedLocalParties.filter((party: any) => {
          return party.memberLimit !== party.memberList.length;
        }));
        setMyParties(response.data.myParties);
        setCoordinates(response.data.coordinates);
        setIsLoading(false); // 중복 렌더링 발생하여 일시적으로 변경함. 추후 영구 반영 결정 필요
      })();
    }
    setIsLoading(false);
  }, [ userInfo ]);

  // useEffect(() => {
  //   setIsLoading(false);
  // }, [ localParties, myParties ]);

  if (isLoading) return <Loading />

  if (!userInfo.address || userInfo.address === 'guest' || userInfo.address === "google" || userInfo.address === "kakao")
    return <AddressModal />

  if (cookieParser().isLoggedIn === "0") return <Navigate to="../" />

  return (
    <ListContainer>
      {/* {console.log("myparties : " + myParties)} */}
      {myParties.length > 0 ?
        <section className="listSection">
          <header className="listHeader">
            내 파티의 최근 소식
          </header>
          <main>
            <PartySlide myParties={myParties} />
          </main>
        </section>
      : null}
      {/* {console.log("localparties : " + localParties)} */}
      {localParties.length > 0 ?
        <LocalQuest location={userInfo.address} coordinates={coordinates} localParty={localParties} />
        // <LocalQuest location={searchRegion} localParty={localParties} />
        : <EmptyCard from="list" />}
    </ListContainer>
  );
}