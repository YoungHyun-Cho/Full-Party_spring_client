import axios from "axios";
import { Request, Response } from "express";
import { InternalServerError, SuccessfulResponse, FailedResponse } from "./functions/response";
import { generateAccessToken, verifyAccessToken, setCookie, clearCookie } from "./functions/token";
import { findUser, createUser } from "./functions/sequelize";
import qs from "qs";

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userInfo = await findUser({ email, password }, [ "id", "profileImage", "userName", "region" ]);
    if (!userInfo) return FailedResponse(res, 401, "Unauthorized User");
    return SuccessfulResponse(res, { message: "You Have Successfully Signed In", userInfo });
  }
  catch (error) {
    return InternalServerError(res, error);
  }
};

export const signout = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    const response = await axios({
      method: "POST",
      url: "https://kapi.kakao.com/v1/user/logout",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
    return SuccessfulResponse(res, { message: "You Have Successfully Signed Out" });
  }
  catch (error) {
    return InternalServerError(res, error);
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { userInfo } = req.body;
    const result = await createUser(userInfo);
    if (result) return SuccessfulResponse(res, { message: "Welcome!" });
    return FailedResponse(res, 409, "Already Signed Up");
  }
  catch (error) {
    return InternalServerError(res, error);
  }
};

export const guest = async (req: Request, res: Response) => {
  return SuccessfulResponse(res, { message: "3" });
};

export const google = async (req: Request, res: Response) => {
  return SuccessfulResponse(res, { message: "4" });
};

export const kakao = async (req: Request, res: Response) => {
  try {
    const { authorizationCode } = req.body;
    const response = await axios({
      method: "POST",
      url: "https://kauth.kakao.com/oauth/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      params : {
        grant_type: "authorization_code",
        client_id: "dfdae48bc5a2f6e1f3326d50455762b3",
        client_secret: "eHYGMf3Vm2V5IbA0frZ1qfvdsgJwgZcv",
        redirect_uri: "http://localhost:3000",
        code: authorizationCode
      }
    });
    const accessToken = response.data.access_token;
    const userInfoFromKakao = await axios({
      method: "GET",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const { nickname, profile_image } = userInfoFromKakao.data.properties;
    const { email, gender } = userInfoFromKakao.data.kakao_account;
    const checkUser = await findUser({ email });
    if (!checkUser) {
      await createUser({
        userName: nickname,
        profileImage: profile_image,
        email,
        gender: gender === "male" ? "M" : "F",
        birth: new Date("11/11/2222"),
        region: "KAKAO",
        mobile: "KAKAO",
        exp: 25,
        level: 1
      });
    }
    const userInfo = await findUser({ email }, [ "id", "userName", "profileImage", "region" ]);
    return SuccessfulResponse(res, { message: "You have successfully signed in", userInfo: { ...userInfo, accessToken} });
  }
  catch (error) {
    InternalServerError(res, error);
  }
};

export const keepLoggedIn = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    const userInfoFromKakao = await axios({
      method: "GET",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const { email } = userInfoFromKakao.data.kakao_account;
    const userInfo = await findUser({ email }, [ "id", "userName", "profileImage", "region" ]);
    SuccessfulResponse(res, { message: "SUCCESS KEEPING", userInfo });
  }
  catch (error) {
    InternalServerError(res, error);
  }
};