import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import LocalQuest from '../components/LocalQuest';
import EmptyCard from '../components/EmptyCard';
import Loading from '../components/Loading';
import { useDispatch } from 'react-redux';
import { Headers, HttpMethod, cookieParser, sendRequest } from "../App";
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { NOTIFY } from '../actions/notify';
import { useSelector } from 'react-redux';
import { AppState } from '../reducers';
import { RootReducerType } from '../store/store';

export const SearchContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 60px 0;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SearchBar = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  margin: 15px 0;
  justify-content: center;
  align-items: center;

  input {
    width: 90%;
    max-width: 1100px;
    height: 5vh;
    padding: 0px 20px;
    border: 1px solid #d5d5d5;
    border-radius: 20px;
    font-size: 1.1rem;

    &:focus {
      outline-style:none;
    }
  }

  .faSearch {
    position: absolute;
    right: 10%;
    color: #888;
    cursor: pointer;
  }

  @media screen and (min-width: 650px) {
    .faSearch {
      right: 8%;
    }
  }

  @media screen and (min-width: 1000px) {
    .faSearch {
      right: 20%;
    }
  }

  @media screen and (min-width: 1900px) {
    .faSearch {
      right: 23%;
    }
  }
`;

export const SearchContent = styled.div`
  padding: 16px 1%;
  padding-top: 16px;

  .result {
    width: 100%;
    height: 100%;

    .resultLabel {
      font-size: 1.7rem;
      font-weight: bold;
      margin-bottom: 15px;
    }
  }

  .tag {
    padding: 8px 15px;
    margin: 0 10px 15px 0;
    font-size: 0.8rem;
    background-color: #fff;
    border-radius: 20px;
    border: 1px solid #d5d5d5;
    color: #777;
    cursor: pointer;
  }

  @media screen and (min-width: 700px) {
    padding: 16px 4%;
  }
`;

export default function Search() {

  const headers: Headers = {
    Authorization: "Bearer " + cookieParser()["token"],
    Refresh: cookieParser()["refresh"]
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const signinReducer = useSelector(
    (state: RootReducerType) => state.signinReducer
  );
  const userId = useSelector(
    (state: AppState) => state.signinReducer.userInfo?.id
  );

  // const userAddress = signinReducer.userInfo?.address;
  const userAddress = sessionStorage.getItem("address") || "";
  const searchRegion = userAddress.split(" ")[0] + " " + userAddress.split(" ")[1];

  const [ word, setWord ] = useState<string | undefined>('');
  const [ parties, setParties ] = useState<any>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ coordinates, setCoordinates ] = useState({ lat: 37.496562, lng: 127.024761 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setWord(e.target.value);

  const searchQuest = () => {
    
    navigate(`../search/keyword/${word}`)
    window.location.reload();
  };

  const hashtagHandler = (tag: string) => navigate(`/search/tag/${tag}`);

  const enterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') searchQuest();
  };

  useEffect(() => {
    let isComponentMounted = true;
    setIsLoading(true);
    if (params.tag) {
      
      const tag = params.tag;
      const searchData = async () => {

        const res = await sendRequest(
          HttpMethod.GET,
          `${process.env.REACT_APP_API_URL}/search/tag?value=${tag}&region=${searchRegion}`,
          null
        );

        setCoordinates(res.data.coordinates);

        const partyData = res.data.result;

        dispatch({
          type: NOTIFY,
          payload: {
            isBadgeOn: res.data.notificationBadge
          }
        });
        if (isComponentMounted) {
          setWord(tag);
          setParties(partyData);
        }
      }
      searchData();
      // setResponse(searchData());
    }
    else if (params.keyword) {
      const keyword = params.keyword;
      const searchData = async () => {

        const res = await sendRequest(
          HttpMethod.GET,
          `${process.env.REACT_APP_API_URL}/search/keyword?value=${keyword}&region=${searchRegion}`,
          null
        );

        setCoordinates(res.data.coordinates);

        const partyData = res.data.result;
        // const parsedData = partyData.map((party: any) => ({ ...party, latlng: JSON.parse(party.latlng) }));
        dispatch({
          type: NOTIFY,
          payload: {
            isBadgeOn: res.data.notificationBadge
          }
        });
        if (isComponentMounted) {
          setWord(keyword);
          setParties(partyData);
        }
      }
      searchData();
      // setResponse(searchData());
    }
    setIsLoading(false);
    
    return () => {
      isComponentMounted = false
    }
  }, [ params ]);
  // }, [ response ]);

  // useEffect(() => {
  // }, [ parties ]);

  if (cookieParser().isLoggedIn === "0") return <Navigate to="../" />
  else if (isLoading) return <Loading />

  return (
    <SearchContainer>
      <SearchBar>
        <input
          name='word'
          value={word}
          autoComplete='off'
          onChange={(e) => handleInputChange(e)}
          onKeyUp={(e) => enterKey(e)}
          placeholder='검색어를 입력해주세요'
        />
        <div className='faSearch' onClick={() => searchQuest()}>
          <FontAwesomeIcon icon={faSearch} />
        </div>
      </SearchBar>
      <SearchContent>
        {(() => {
          if (!params.tag && !params.keyword) {
            return (
              <div className='result'>
              </div>
            )
          }
          else if (parties.length !== 0) {
            return(
              <div className='result'>
                <LocalQuest location={userAddress} coordinates={coordinates} localParty={parties} /> 
              </div>
            )
          }
          else if (parties.length === 0) {
            return (
              <EmptyCard from="search" />
            )
          }
        })()}
      </SearchContent>
    </SearchContainer>
  );
}