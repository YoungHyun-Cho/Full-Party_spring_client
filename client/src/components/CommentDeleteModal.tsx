import React from 'react';
import axios from "axios";
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { HttpMethod, sendRequest } from '../App';

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
`;

export const ModalView = styled.div`
  border-radius: 30px;
  background-color: #fff;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .title {
    margin-bottom: 20px;
  }

  .buttons {
    button {
      width: 100px;
      height: 50px;
      padding: 10px 20px;
      margin: 0 5px;
      border-radius: 20px;
    }

    .delete {
      border: none;
      background-color: #50C9C3;
      color: white; 
    }

    .cancel {
      border: 1px solid #50C9C3; 
      background-color: #fff;
      color: #50C9C3; 
    }
  }
`;

export const CloseBtn = styled.button`
  width: 100%;
  text-align: right;
  cursor: pointer;
  margin-bottom: 20px;
  background-color: white;
  border: none;
`;

type Props = {
  commentDeleteModalHandler: Function,
  commentToDelete: { [key: string] : number },
  partyId: number,
};

export default function CommentDeleteModal({ commentDeleteModalHandler, commentToDelete, partyId }: Props) {
  const navigate = useNavigate();
  const { idx, originalCommentId, commentElementId } = commentToDelete;
  const closeModal = () => {
    commentDeleteModalHandler();
  };

  const deleteHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    
    if (idx === 0 && originalCommentId === commentElementId) {
      await sendRequest(
        HttpMethod.DELETE,
        `${process.env.REACT_APP_API_URL}/comments/${originalCommentId}`,
        null
      );
    }
    else {
      await sendRequest(
        HttpMethod.DELETE,
        `${process.env.REACT_APP_API_URL}/comments/${originalCommentId}/replies/${commentElementId}`,
        null
      );
    }

    commentDeleteModalHandler();
    navigate(`../party/${partyId}`);
  };

  return(
    <ModalContainer>
      <ModalBackdrop onClick={closeModal}>
        <ModalView onClick={(e) => e.stopPropagation()}>
          <CloseBtn onClick={closeModal}><FontAwesomeIcon icon={faTimes} /></CloseBtn>
          <div className="title">덧글을 삭제하시겠습니까?</div>
          <div className="buttons">
            <button className="delete" onClick={deleteHandler}>
                삭제
            </button>
            <button className="cancel" onClick={closeModal}>
                취소
            </button>
          </div>
        </ModalView>
      </ModalBackdrop>
    </ModalContainer>
  )
}