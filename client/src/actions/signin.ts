import axios from "axios";
import { Dispatch } from 'redux'
import { CLOSE_MODAL } from "./modalType";
import { UserInfoDispatchType, SIGNIN_SUCCESS, SIGNIN_FAIL } from "./signinType";
import { Headers, setEachCookie, setSessionStorage } from "../App";

type UserInfo = {
  email: string,
  password: string
}

export const fetchUserdata = (userInfo: UserInfo) => async (dispatch: Dispatch<UserInfoDispatchType>) => {
  
  setEachCookie("signupType", "general");
  setEachCookie("isLoggedIn", "1");

  const headers: Headers = {};

  await axios.post(`${process.env.REACT_APP_API_URL}/auth/signin`, userInfo, {
    withCredentials: true
  })
  .then((res) => {
    if (res.status === 200) {

      headers.Authorization = res.headers['authorization'];
      headers.Refresh = res.headers['refresh'];

      // document.cookie = `token=${res.headers['authorization']}`; // -> 쿠키에 토큰 저장 완료..
      // document.cookie = `refresh=${res.headers['refresh']}`; // 서버에서 setCookie 해줌 -> 여기서 할 필요 없음. 

      // sessionStorage.setItem("id", res.data.id);
      // sessionStorage.setItem("email", userInfo.email);
      // sessionStorage.setItem("userName", res.data.userName);
      // sessionStorage.setItem("profileImage", res.data.profileImage);
      // sessionStorage.setItem("address", res.data.address);

      setSessionStorage({ ...res.data });

      dispatch({
        type: SIGNIN_SUCCESS,
        payload: res.data
      });
      dispatch({
        type: CLOSE_MODAL
      });
    }
  })
  .catch((err) => {
    if (err.response && err.response.status === 404) {
      dispatch({
        type: SIGNIN_FAIL
      });
    }
    else {
      console.log(err);
    }
  });

  // // 백엔드의 getInitialUserInfo 호출
  // await axios.get(`${process.env.REACT_APP_API_URL}/users`, { headers })
  // .then(res => {
  //   console.log(res.data);

  //     dispatch({
  //       type: SIGNIN_SUCCESS,
  //       payload: res.data
  //     });
  //     dispatch({
  //       type: CLOSE_MODAL
  //     });
  // })
  // .catch(err => {
  //   if (err.response && err.response.status === 401) {
  //     dispatch({
  //       type: SIGNIN_FAIL
  //     });
  //   }
  //   else {
  //     console.log(err);
  //   }
  // });
}