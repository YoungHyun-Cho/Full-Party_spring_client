export const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS';
export const SIGNIN_FAIL = 'SIGNIN_FAIL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

export type UserInfo = {
  id: any,
  email: any,
  userName: any,
  profileImage: any,
  address: any,
  signupType: any
};

export interface signinFailDispatch{
  type: typeof SIGNIN_FAIL;
};

export interface signinSuccessDispatch {
  type: typeof SIGNIN_SUCCESS;
  payload: UserInfo;
};

export interface closeModalDispatch {
  type: typeof CLOSE_MODAL;
};

export type UserInfoDispatchType = signinFailDispatch | signinSuccessDispatch | closeModalDispatch;