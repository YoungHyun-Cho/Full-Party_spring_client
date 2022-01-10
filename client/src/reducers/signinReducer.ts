import { SIGNIN_FAIL, SIGNIN_SUCCESS, UserInfo, UserInfoDispatchType } from "../actions/signinType";

interface InitialState {
  success?: boolean | null
  userInfo?: UserInfo

}

const initialState: InitialState = {
  success: null,
  userInfo: {
    id: 0,
    name: '김리덕스',
    userImage: '김리덕스프사'
  }
}

const signinReducer = (state = initialState, action: UserInfoDispatchType): InitialState => {
  switch (action.type) {
    case SIGNIN_FAIL:
      return {
        ...state,
        success: false
      }

    case SIGNIN_SUCCESS:
      const { id, name, userImage} = action.payload
      return {
        ...state,
        success: true,
        userInfo: {
          id,
          name,
          userImage
        }
      }


    default:
      return state;
  }
}

export default signinReducer;