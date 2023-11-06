import './App.css';
import React, { useEffect, Fragment } from 'react';
import axios, { AxiosResponse } from "axios";
import Home from './pages/Home';
import List from './pages/List';
import Party from './pages/Party';
import Post from './pages/Post';
import Search from './pages/Search';
import Notification from './pages/Notification';
import Favorite from './pages/Favorite';
import Mypage from './pages/Mypage';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import SigninModal from './components/SigninModal';
import SignupModal from './components/SignupModal';
import initialize from './config/initialize';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from './reducers';
import { RootReducerType } from './store/store';
import { SIGNIN_SUCCESS } from './actions/signinType';
import dotenv from "dotenv";
import { fetchUserdata } from './actions/signin';
import { bool } from 'aws-sdk/clients/signer';

declare global {
  interface Window {
    Kakao: any;
    kakao: any;
  }
};

export const cookieParser = () => {
  const cookieString = document.cookie.split("; ");
  const keyAndValue = cookieString.map(item => item.split("="));
  let cookieObject: { [key: string]: string } = {};
  keyAndValue.map((item, i) => cookieObject[item[0]] = item[1]);
  return cookieObject;
};

export type Headers = {
  Authorization?: string;
  Refresh?: string;
}

export type Header = {
  Authorization?: string;
  Refresh?: string;
  withCredentials: boolean;
}

export const requestKeepLoggedIn = async (token: string, signupType: string) => {
  // const response = await axios.post(`${process.env.REACT_APP_API_URL}/keeping`, {}, {
  //   headers: {
  //     access_token: token,
  //     signup_type: signupType
  //   }
  // });
  // return response;
};

// export const headers: Header = {
//   Authorization: "Bearer " + cookieParser()["token"],
//   Refresh: cookieParser()["refresh"],
//   withCredentials: true
// };

export enum HttpMethod {
  POST,
  PATCH, 
  GET, 
  DELETE
}

// export const checkResponse = async (res: AxiosResponse, ) => {
//   if (res.status === 401) {
//     const res2 = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh`);
//     if (res2.status === 200) return true;
//     else return false;
//   }
//   else return true;
// };

export const getHeaders = () => {

  const headers = { 
    Authorization: "Bearer " + cookieParser()["token"],
    Refresh: cookieParser()["refresh"]
  };
  
  return { headers, withCredentials: true };
}; 

export const sendRequest = async (httpMethod: HttpMethod, url: string, body: any): Promise<any> => {

  let response;
  const headers = getHeaders();

  try {
    switch (httpMethod) {
      case HttpMethod.POST:   response = await axios.post(url, body, headers); break;
      case HttpMethod.PATCH:  response = await axios.patch(url, body, headers); break;
      case HttpMethod.GET:    response = await axios.get(url, headers); break;
      case HttpMethod.DELETE: response = await axios.delete(url, headers); break;
    }

    if (response.status === 401) throw new Error();
  }
  catch(error) {
    const refreshResult = await axios.get(`${process.env.REACT_APP_API_URL}/auth/refresh`, headers);
    if (refreshResult.status === 200) return await sendRequest(httpMethod, url, body);
    else console.log(refreshResult);
  }

  console.log(response);

  return response;
};

export const IMAGE_SERVER_URL="https://fullpartyspringimageserver.s3.ap-northeast-2.amazonaws.com";

export default function App() {
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(
    (state: AppState) => state.signinReducer.isLoggedIn
  );

  const { Kakao } = window;
  const modalReducer = useSelector((state: RootReducerType) => state.modalReducer);

  useEffect(() => {
    if (!Kakao.isInitialized()) initialize();
    if (!document.cookie) {
      // document.cookie = `token=temp; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      document.cookie = `signupType=temp; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      document.cookie = `isLoggedIn=0; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
    }
    const { token, signupType, isLoggedIn } = cookieParser();

    if (token !== "temp" && sessionStorage.getItem("id") === null ) {
      document.cookie = `token=temp; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      document.cookie = `refresh=temp; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      document.cookie = `signupType=temp; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      document.cookie = `isLoggedIn=0; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
    }

    else if (token !== "temp" && signupType !== "temp" && isLoggedIn !== "0") {
      // requestKeepLoggedIn(token, signupType).then((res) => {
      dispatch({
        type: SIGNIN_SUCCESS,
      //   // payload: res.data.userInfo
      });
      // });

      // headers.Authorization = "Bearer " + cookieParser()["token"];
      // headers.Refresh = cookieParser()["refresh"];
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <main className="view">
          <TopNav />
          {modalReducer.isModal && modalReducer.modalType === 'signin' ? <SigninModal /> :  null}
          {modalReducer.isModal && modalReducer.modalType === 'signup' ? <SignupModal /> :  null}
          <section className="features">
            <Routes>
              <Fragment>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/home" element={isLoggedIn ? <List /> : <Home />} />
                <Route path="/party/:partyId" element={<Party />}>
                  <Route path=":commentId" element={<Party />} />
                </Route>
                <Route path="/post" element={<Post />} />
                <Route path="/search" element={<Search />} />
                <Route path="/search/keyword/:keyword" element={<Search />} />
                <Route path="/search/tag/:tag" element={<Search />} />
                <Route path="/notification" element={<Notification />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/mypage" element={<Mypage />} />
                <Route path="*" element={<NotFound />} />
              </Fragment>
            </Routes>
          </section>
          {isLoggedIn ? <BottomNav /> : null}
        </main>
      </div>
    </BrowserRouter>
  );
}