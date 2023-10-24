import { cookieParser } from "../App";
import { SIGNIN_FAIL, SIGNIN_SUCCESS, UserInfo, UserInfoDispatchType } from "../actions/signinType";

interface InitialState {
  isLoggedIn?: boolean | null;
  userInfo: UserInfo;
};

const initialState: InitialState = {
  isLoggedIn: null,
  userInfo: {
    id: 0.1,
    userName: "",
    profileImage: "https://teo-img.s3.ap-northeast-2.amazonaws.com/defaultProfile.png",
    address: "",
    signupType: ""
  }
};

const signinReducer = (state = initialState, action: UserInfoDispatchType): InitialState => {
  switch (action.type) {
    case SIGNIN_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        userInfo: {
          id: 0,
          userName: "",
          profileImage: "",
          address: "",
          signupType: ""
        }
      };

    case SIGNIN_SUCCESS:

      return {
        ...state,
        isLoggedIn: true,
        userInfo: {
          id: sessionStorage.getItem("id"),
          userName: sessionStorage.getItem("userName"),
          profileImage: sessionStorage.getItem("profileImage"),
          address: sessionStorage.getItem("address"),
          signupType: cookieParser().signupType
        }
      };

    default:
      return state;
  }
}

export default signinReducer;