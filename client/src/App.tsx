import './App.css';
import React, { useEffect, Fragment } from 'react';
import axios, { AxiosError, AxiosResponse } from "axios";
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
import { SIGNIN_FAIL, SIGNIN_SUCCESS } from './actions/signinType';
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

export const checkValue = (name: string, value: any) => {
  return value === null || value === undefined ? sessionStorage.getItem(name) : value;
};

export const setSessionStorage = ({ id, email, userName, profileImage, address }: any) => {

  sessionStorage.setItem("id", checkValue("id", id));
  sessionStorage.setItem("email", checkValue("email", email));
  sessionStorage.setItem("userName", checkValue("userName", userName));
  sessionStorage.setItem("profileImage", checkValue("profileImage", profileImage));
  sessionStorage.setItem("address", checkValue("address", address));
};

export const setEachCookie = (name: string, value: any) => {
    document.cookie = `${name}=${value}; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
};

export const setAllCookie = (signUpType: string, isLoggedIn: string, accessToken: string, refreshToken: string) => {
  setEachCookie("token", accessToken);
  setEachCookie("refresh", refreshToken);
  setEachCookie("signupType", signUpType);
  setEachCookie("isLoggedIn", isLoggedIn);
};

export const sendRequest = async (httpMethod: HttpMethod, url: string, body: any): Promise<any> => {

  let response;
  let headers = getHeaders();

  try {
    switch (httpMethod) {
      case HttpMethod.POST:   response = await axios.post(url, body, headers); break;
      case HttpMethod.PATCH:  response = await axios.patch(url, body, headers); break;
      case HttpMethod.GET:    response = await axios.get(url, headers); break;
      case HttpMethod.DELETE: response = await axios.delete(url, headers); break;
    }

    // if (response.status === 401) throw new Error();
  }
  catch(error : any) {
    if (error.response.status === 401) {

      headers.headers.Authorization = "temp";

      try {
        const refreshResult = await axios.get(`${process.env.REACT_APP_API_URL}/auth/refresh`, headers);
        if (refreshResult.status === 200) return await sendRequest(httpMethod, url, body);
        else console.log(refreshResult);
      }
      catch(e: any) {
        console.log(e.response);
        if (e.response.status === 401) {
          // 리프레시 토큰 만료 -> 로그아웃 처리

          await axios.post(`${process.env.REACT_APP_API_URL}/auth/signout`, {});

          setEachCookie("isLoggedIn", "2");
          window.location.href = `${process.env.REACT_APP_CLIENT_URL}/`;
        }
      }
    }
  }

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

    // 탭 닫은 경우 쿠키 삭제
    if (token !== "temp" && sessionStorage.getItem("id") === null ) {
      // document.cookie = `token=temp; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      // document.cookie = `refresh=temp; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      // document.cookie = `signupType=temp; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;
      // document.cookie = `isLoggedIn=0; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/;`;

      setAllCookie("temp", "0", "temp", "temp");
    }

    // 로그인 유지
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

    if (isLoggedIn === "2") {
      setAllCookie("temp", "0", "temp", "temp");
      dispatch({
        type: SIGNIN_FAIL
      });
      window.location.reload();
      sessionStorage.clear();
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