import axios from "axios";
import { Dispatch } from 'redux'
import { CLOSE_MODAL } from "./modalType";
import { UserInfoDispatchType, SIGNIN_SUCCESS, SIGNIN_FAIL } from "./signinType";
import { Headers, HttpMethod, sendRequest, setCookie, setSessionStorage } from "../App";

type UserInfo = {
  email: string,
  password: string
}

export const fetchUserdata = (userInfo: UserInfo) => async (dispatch: Dispatch<UserInfoDispatchType>) => {
  
  setCookie("signupType", "general");
  setCookie("isLoggedIn", "1");

  const response = await sendRequest(
    HttpMethod.POST,
    `${process.env.REACT_APP_API_URL}/auth/signin`, 
    userInfo
  );

  if (response.status === 200) {

    setSessionStorage({ ...response.data });

    dispatch({
      type: SIGNIN_SUCCESS,
      payload: response.data
    });
    dispatch({
      type: CLOSE_MODAL
    });
  }

  else {
    if (response.status === 404) {
      dispatch({
        type: SIGNIN_FAIL
      });
      return 404;
    }
    else {
      console.log(response);
    }
  }
}