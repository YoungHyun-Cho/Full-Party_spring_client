import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Loading from '../components/Loading';
import { Navigate, Link } from 'react-router-dom';
import { NOTIFY } from "../actions/notify"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faBullhorn, faScroll, faTrophy, faStar, faBellSlash } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../reducers';
import { HttpMethod, cookieParser, sendRequest } from '../App';

export const NotificationContainer = styled.div`
  margin: 60px 0;

  .notificationList {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    color: #000;
    border-bottom: 1px solid #d5d5d5;
    cursor: pointer;

    .contentWrapper {
      display: flex;

      .iconContainer {
        height: 100%;
        padding-top: 0.5px;
      }

      .titleContainer {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }

    .partyNameContainer {
      display: flex;
      font-weight: bold;
      margin-bottom: 5px;

      .partyName {
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .icon {
      font-size: 0.9rem;
      margin-right: 7px;

      &.horn {
        color: #b90e0a;
      }

      &.heart {
        color: #fa3e7d;
      }

      &.level, &.star, &.bell {
        color: #f9c80a;
      }

      &.scroll {
        color: #a1785c;
      }
    }

    .content {
      word-break: keep-all;
    }

    .time {
      min-width: 50px;
      text-align: right;
      font-size: 0.8rem;
      color: #777;
    }
  }
`;

export default function Notification() {
  const dispatch = useDispatch();
  const userId = useSelector(
    (state: AppState) => state.signinReducer.userInfo.id
  );

  const isBadgeOn = useSelector(
    (state: AppState) => state.notifyReducer.isBadgeOn
  );

  const [ notifications, setNotifications ] = useState<{ [key: string]: any }>([]);
  const [ isLoading, setIsLoading ] = useState(true);

  type messageType = {
    [index: string]: string
  };

  const message: messageType = {
    "apply": "님이 퀘스트에 지원했습니다.",
    "accept": "파티 가입이 승인됐습니다.",
    "deny": "파티 가입이 거절됐습니다.",
    "expel": "파티에서 추방당했습니다.",
    "quit": "님이 파티에서 탈퇴했습니다.",
    "favorite": "님이 퀘스트에 관심을 보입니다.",
    "complete": "퀘스트를 클리어했습니다!",
    "fullparty": "파티원 모집이 완료됐습니다. 퀘스트를 진행해보세요!",
    "reparty": "파티원을 재모집중입니다.",
    "dismiss": "파티가 해산됐습니다.",
    "question": "님의 퀘스트 문의가 도착했습니다.",
    "answer": "퀘스트 문의에 대한 답변이 도착했습니다.",
    "reply": "님의 답변에 대한 재문의가 도착했습니다.",
    "levelup": "로 레벨이 올랐습니다!",
    "leveldown": "로 레벨이 떨어졌습니다."
  };

  enum NotificationType {
    APPLY = "APPLY",
    ACCEPT ="ACCEPT",
    DENY ="DENY",
    CANCEL ="CANCEL",
    EXPEL ="EXPEL",
    QUIT ="QUIT",
    HEART ="HEART",
    COMPLETE ="COMPLETE",
    REVIEW ="REVIEW",
    FULL_PARTY ="FULL_PARTY",
    RE_PARTY ="RE_PARTY",
    DISMISS ="DISMISS",
    COMMENT ="COMMENT",
    REPLY ="REPLY",
    LEVEL_UP ="LEVEL_UP",
    LEVEL_DOWN ="LEVEL_DOWN"
  }

  const timeForToday = (value: Date) => {
    const today = new Date();
    const timeValue = new Date(value);

    const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
    if (betweenTime < 1) return '방금 전';
    if (betweenTime < 60) return `${betweenTime}분 전`;

    const betweenTimeHour = Math.floor(betweenTime / 60);
    if (betweenTimeHour < 24) return `${betweenTimeHour}시간 전`;

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    if (betweenTimeDay < 365) return `${betweenTimeDay}일 전`;
    return `${Math.floor(betweenTimeDay / 365)}년전`;
  };

  useEffect(() => {
    if (userId !== 0.1) {
      setIsLoading(true);
      (async () => {
        const response = await sendRequest(
          HttpMethod.GET,
          `${process.env.REACT_APP_API_URL}/notifications`,
          null
        );
        dispatch({
          type: NOTIFY,
          payload: {
            isBadgeOn: response.data.notificationBadge
          }
        });
        setNotifications(response.data.notifications);
      })();
    }
  }, [ userId ]);

  useEffect(() => {
    setIsLoading(false);
  }, [ notifications ]);

  if (cookieParser().isLoggedIn === "0") return <Navigate to="../" />
  else if (isLoading) return <Loading />

  if (notifications.length <= 0) {
    return (<NotificationContainer>
      <div className="notificationList">
        <div className="contentWrapper">
          <div className="iconContainer">
            <FontAwesomeIcon icon={ faBellSlash } className="icon bell"/>
          </div>
          <div className="titleContainer">
            <div className="partyNameContainer">
              <div>아직 메시지가 없습니다.</div>
            </div>
            <div>주변의 퀘스트를 둘러보고 파티에 참여해보세요!</div>
          </div>
        </div>
      </div>
    </NotificationContainer>)
  }

  return (
    <NotificationContainer>
      {notifications.map((notification: {[key: string]: any}, idx: number) => {
        if (notification.type === "user") {
          return (
            <Link to="/mypage" style={{ textDecoration: 'none' }} key={idx}>
              <div key={idx} className="notificationList" style={{ background: notification.isRead? "#fff" : "rgb(80,201,195, 0.1)" }}>
                <div className="contentWrapper">
                  <div className="iconContainer">
                    <FontAwesomeIcon icon={ faTrophy } className="icon level" />
                  </div>
                  <div className="titleContainer">
                    <div className="partyNameContainer">
                      [<div className="partyName">{notification.subject}</div>] 
                    </div>
                    <div className="content">{notification.content}</div>
                  </div>
                </div>
                <div className="time">{timeForToday(notification.createdAt)}</div>
              </div>
            </Link>
          );
        }
        else {
          return (
            <Link to={notification.label === NotificationType.DISMISS ? `/home` : `/party/${notification.partyId}`} style={{ textDecoration: 'none' }} key={idx}>
              <div key={idx} className="notificationList" style={{ background: notification.isRead? "#fff" : "rgb(80,201,195, 0.1)" }}>
                <div className="contentWrapper">
                  <div className="iconContainer">
                    {notification.label === NotificationType.HEART ? <FontAwesomeIcon icon={ faHeart } className="icon heart" /> : null}
                    {notification.label === NotificationType.COMPLETE ? <FontAwesomeIcon icon={ faStar } className="icon star" /> : null }
                    {notification.label === NotificationType.COMMENT || notification.label === NotificationType.REPLY ? <FontAwesomeIcon icon={ faScroll } className="icon scroll" /> : null }
                    {notification.label !== NotificationType.HEART && notification.label !== NotificationType.COMPLETE && notification.label !== NotificationType.COMMENT && notification.label !== NotificationType.REPLY ?  
                      <FontAwesomeIcon icon={ faBullhorn } className="icon horn" />
                    : null}
                  </div>
                  <div className="titleContainer">
                    <div className="partyNameContainer">
                      [<div className="partyName">{notification.subject}</div>]
                    </div>
                    <div className="content">{notification.content}</div>
                  </div>
                </div>
                <div className="time">{timeForToday(notification.createdAt)}</div>
              </div>
            </Link>
          );
        }
        // if (!notification.partyId) { // 레벨 관련
        //   return (
        //     <Link to="/mypage" style={{ textDecoration: 'none' }} key={idx}>
        //       <div key={idx} className="notificationList" style={{ background: notification.isRead? "#fff" : "rgb(80,201,195, 0.1)" }}>
        //         <div>
        //           <FontAwesomeIcon icon={ faTrophy } className="icon level" />
        //           <span><strong>Lv.{notification.level}</strong>{message[notification.content]}</span>
        //         </div>
        //         <div className="time">{timeForToday(notification.createdAt)}</div>
        //       </div>
        //     </Link>
        //   );
        // }
        // else if(notification.content === "dismiss") { // 파티 해산
        //   return (
        //     <div key={idx} className="notificationList" style={{ background: notification.isRead? "#fff" : "rgb(80,201,195, 0.1)" }}>
        //       <div className="contentWrapper">
        //         <div className="iconContainer">
        //           <FontAwesomeIcon icon={ faBullhorn } className="icon horn" />
        //         </div>
        //         <div className="titleContainer">
        //           <div className="partyNameContainer">
                    // [<div className="partyName">{notification.partyName}</div>]
        //           </div>
        //           <div className="content">{message[notification.content]}</div>
        //         </div>
        //       </div>
        //       <div className="time">{timeForToday(notification.createdAt)}</div>
        //     </div>
        //   );
        // }
        // else { // 파티 관련
        //   return (
        //     <Link to={`/party/${notification.partyId}${notification.commentId ? `/${notification.commentId}` : ""}`} style={{ textDecoration: 'none' }} key={idx}>
        //       <div key={idx} className="notificationList" style={{ background: notification.isRead? "#fff" : "rgb(80,201,195, 0.1)" }}>
        //         <div className="contentWrapper">
        //           <div className="iconContainer">
        //             {notification.content === "favorite" ? <FontAwesomeIcon icon={ faHeart } className="icon heart" /> : null}
        //             {notification.content === "complete" ? <FontAwesomeIcon icon={ faStar } className="icon star" /> : null }
        //             {notification.content === "question" || notification.content === "answer"|| notification.content === "reply" ? <FontAwesomeIcon icon={ faScroll } className="icon scroll" /> : null }
        //             {notification.content !== "favorite" && notification.content !== "complete" && notification.content !== "question" && notification.content !== "answer" && notification.content !== "reply" ?  
        //               <FontAwesomeIcon icon={ faBullhorn } className="icon horn" />
        //             : null}
        //           </div>
        //           <div className="titleContainer">
        //             <div className="partyNameContainer">
        //               [<div className="partyName">{notification.partyName}</div>]
        //             </div>
        //             <div className="content">{notification.userName? notification.userName : null}{message[notification.content]}</div>
        //           </div>
        //         </div>
        //         <div className="time">{timeForToday(notification.createdAt)}</div>
        //       </div>
        //     </Link>
        //   );
        // }
      }).reverse()}
    </NotificationContainer>
  );
}