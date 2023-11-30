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
import { SIGNIN_FAIL, SIGNIN_SUCCESS, UserInfoDispatchType } from './actions/signinType';
import { Dispatch } from 'redux';

declare global {
  interface Window {
    Kakao: any;
    kakao: any;
  }
};

export enum SignUpType {
  NORMAL = "normal",
  GOOGLE = "google",
  KAKAO = "kakao",
  GUEST = "guest"
}

export type Coordinates = {
  lat: number, lng: number 
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

export enum HttpMethod {
  POST,
  PATCH, 
  GET, 
  DELETE
}

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

export const setCookie = (name: string, value: any, option?: string) => {
  document.cookie = `${name}=${value}; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/; ${option}`;
};

export const setTokenCookie = (name: string, value: any, maxAge: number) => {
  setCookie(name, value, `max-age=${maxAge};`);
};

export const setAllCookie = (signUpType: string, isLoggedIn: string, accessToken: string, refreshToken: string) => {
  setTokenCookie("token", accessToken, 10 * 60);
  setTokenCookie("refresh", refreshToken, 30 * 60);
  setCookie("signupType", signUpType);
  setCookie("isLoggedIn", isLoggedIn);
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
  }
  catch(error : any) {
    response = error.response;
    if (error.response.status === 401) {

      headers.headers.Authorization = "temp";

      try {
        const refreshResult = await axios.get(`${process.env.REACT_APP_API_URL}/auth/refresh`, headers);
        if (refreshResult.status === 200) return await sendRequest(httpMethod, url, body);
        else console.log(refreshResult);
      }
      catch(e: any) {
        
        if (e.response.status === 401) {
          changeToSignOutState();
        }
      }
    }
  }

  return response;
};

let dispatcher: Dispatch<UserInfoDispatchType>;

export const changeToSignOutState = () => {
  
  dispatcher({ type: SIGNIN_FAIL });
  
  setCookie("signupType", "temp");
  setCookie("isLoggedIn", "0");
  sessionStorage.clear();

  window.location.href = `${process.env.REACT_APP_CLIENT_URL}/`;
};

export default function App() {

  const dispatch = useDispatch();
  dispatcher = dispatch;

  const isLoggedIn = useSelector(
    (state: AppState) => state.signinReducer.isLoggedIn
  );

  const { Kakao } = window;
  const modalReducer = useSelector((state: RootReducerType) => state.modalReducer);

  useEffect(() => {
    if (!Kakao.isInitialized()) initialize();
    
    if (!document.cookie) {
      setCookie("signupType", "temp");
      setCookie("isLoggedIn", "0");
    }
    const { token, signupType, isLoggedIn } = cookieParser();

    // 탭 닫은 경우 쿠키 삭제
    if (token !== "temp" && sessionStorage.getItem("id") === null ) {
      setAllCookie("temp", "0", "temp", "temp");
    }

    // 로그인 유지
    else if (token !== "temp" && signupType !== "temp" && isLoggedIn !== "0") {
      
      dispatch({
        type: SIGNIN_SUCCESS,
      });
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