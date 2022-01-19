import React, { useState } from 'react';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFlag, faAward, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

export const ModalContainer = styled.div`
  width: 100vw;
  height: 100vh;

  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
`;

export const ModalBackdrop = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(0,0,0,0.4);

  display: flex;
  justify-content: center;
  align-items: center;
`

export const ModalView = styled.div`

  width: 320px;

  border-radius: 30px;
  background-color: #fff;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

  padding: 30px;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  header {
    font-family: 'SilkscreenBold';
    font-weight: bold;
    font-size: 20pt;
    
    margin-bottom: 20px;
  }

  .speechBubble {
    position: relative;
    background-color: #50C9C3;
    border-radius: 20px;

    min-width: 150px;
    max-width: 250px;

    padding: 15px;

    display: flex;
    justify-content: center;
    align-items: center;

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 0;
      border: 12px solid transparent;
      border-top-color: #50C9C3;
      border-bottom: 0;
      border-right: 0;
      margin-left: -50px;
      margin-bottom: -10px;
    }

    input {
      background: none;
      border: none;
      border-bottom: 1px solid #fff;

      max-width: 220px;
      min-height: 20px;

      text-align: center;
    }
  }

  .memberContainer {
    display: flex;
    flex-direction: column;
    align-items: center;

    margin: 10px;
    overflow-wrap: normal;
  }

  .profileImage {
    width: 100px;
    height: 100px;
    border: 1px solid #d5d5d5;
    border-radius: 100%;

    margin-bottom: 10px;
  }

  .nameplate {
    font-size: 1.2rem;
    font-weight: bold;
    word-break: break-all;

    min-width: 100px;
    border-bottom: 1px solid #d5d5d5;
    padding-bottom: 5px;
    margin-bottom: 10px;

    #leader {
      color: #50C9C3;
    }
  }

  .levelAndJoinDate {
    color: #777;

    display: flex;
    flex-direction: column;
    justify-content: center;

    .level {
      margin-bottom: 5px;
    }
  }
`

export const CloseBtn = styled.button`

  width: 100%;
  text-align: right;

  cursor: pointer;
  margin-bottom: 10px;

  background-color: white;
  border: none;

`

export const UserStateBtns = styled.section`
  display: flex;
  justify-content: center;

  button {
    min-width: 100px;
    height: 50px;

    border: 1px solid #d5d5d5;
    border-radius: 20px;
    background-color: white; 

    margin: 8px;
    padding: 10px 20px;
  }

  #acceptBtn {
    color: white;
    background-color: #50C9C3; 
    border: none;
  }
`;

type Props = {
  userInfoModalHandler: Function,
  userId: number,
  leaderId: number,
  isLeader: boolean,
  isMember: boolean,
  from: string,
  userInfo: { [key: string]: any }
}

const UserInfoModal = ({ userInfoModalHandler, userId, leaderId, isLeader, isMember, from, userInfo }: Props) => {

  const { id, userName, profileImage, level, message, joinDate } = userInfo;

  const [isEditMode, setIsEditMode] = useState(false);
  const [newMsg, setNewMsg] = useState(message);

  const formatDate = (date: String) => date.slice(0, 10);

  const closeModal =() => {
    userInfoModalHandler();
  }

  function inputHandler(event: React.ChangeEvent<HTMLInputElement>): void {
    setNewMsg(event.target.value);
  }

  function editHandler(event: React.MouseEvent<HTMLButtonElement>): void {
    setIsEditMode(!isEditMode);
  }

  function confirmHandler(event: React.MouseEvent<HTMLButtonElement>) {
    // [dev]
    console.log(newMsg)
    console.log("메시지 변경사항을 서버로 전송합니다.")
    //서버 요청 완료 후,
    setIsEditMode(!isEditMode);
  }

  function expelHandler(event: React.MouseEvent<HTMLButtonElement>) {
    // [dev]
    console.log("파티원을 추방합니다.")
  }

  function refuseHandler(event: React.MouseEvent<HTMLButtonElement>) {
    // [dev]
    console.log("파티원 가입 신청을 거절합니다.")
  }

  function acceptHandler(event: React.MouseEvent<HTMLButtonElement>) {
    // [dev]
    console.log("파티원 가입 신청을 승인합니다.")
    // 이 멤버의 가입을 승인했을 때, 멤버 수가 멤버 정원에 도달했을 경우 
    // partyState를 1로 바꿉니다.
  }

  return(
    <ModalContainer>
      <ModalBackdrop onClick={closeModal}>
        <ModalView onClick={(e) => e.stopPropagation()}>
          <CloseBtn onClick={closeModal}><FontAwesomeIcon icon={faTimes} /></CloseBtn>
          <header>{from === "members"? <>Party<br />Member</> : <>Quest<br />Volunteer</>}</header>
          {isMember ? 
            <section className="speechBubble">
              {isEditMode ?
                <input 
                  type="text"
                  name="newMsg"
                  onChange={(e) => inputHandler(e)}
                  value={newMsg}
                  maxLength={45}
                />
              : null}
              {message && !isEditMode ? message : null}
              {!message && !isEditMode ? `안녕하세요, ${userName}입니다!` : null}
            </section> 
          : null}
          <section className="memberContainer">
            <div 
              className="profileImage" 
              style={{ backgroundImage: `url(${profileImage})`, backgroundSize: "cover" }} 
            />
            <div className="nameplate">
              {id === leaderId? <FontAwesomeIcon icon={ faFlag } id="leader" /> : null} {userName}
            </div>
            <div className="levelAndJoinDate">
              <div className="level">
                <FontAwesomeIcon icon={faAward} /> Lv. {level}
              </div>
              {from === "members" ?
                <div className="joinDate">
                    <FontAwesomeIcon icon={faCalendarCheck} /> {formatDate(joinDate)}
                </div>
              : null}
            </div>
          </section>
          <UserStateBtns>
            {/* 내 정보인 경우 */}
            {id === userId && !isEditMode ? 
              <button onClick={editHandler}>메시지 수정</button> 
            : null}
            {id === userId && isEditMode ? 
              <button onClick={confirmHandler}>변경 사항 적용</button> 
            : null}
            {/* 클라이언트가 리더이며, 본인이 아닌 파티원 정보를 보는 경우 */}
            {isLeader && id !== userId && from === "members" ? 
              <button onClick={expelHandler}>파티원 퇴출</button> 
            : null} 
            {/* 클라이언트가 리더이며, 대기자 리스트를 보는 경우 */}
            {isLeader && from === "waitingQueue" ? 
              <div>
                <button onClick={refuseHandler}>가입 거절</button> 
                <button id="acceptBtn" onClick={acceptHandler}>가입 승인</button>    
              </div>
            : null}
          </UserStateBtns>
        </ModalView>
      </ModalBackdrop>
    </ModalContainer>
  )
}

export default UserInfoModal;