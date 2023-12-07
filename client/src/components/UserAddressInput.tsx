import React, { useState } from 'react';
import styled from 'styled-components';
import UserMap from '../components/UserMap';
import PostCodeModal from '../components/PostCodeModal';
import { Map } from 'react-kakao-maps-sdk';

export const AddressInputContainer = styled.div`
  input:disabled {
    background-color: white;
  }

  #map {
    width: 100%;
    height: 150px;
    margin-bottom: 8px;
  }
`;

type Props = {
  profileImage: string,
  address: string,
  handleAddressChange: Function,
  handleCoordsChange: Function,
  isSearch: boolean,
  searchHandler: Function
};

export default function UserAddressInput({ profileImage, address, handleAddressChange, handleCoordsChange, isSearch, searchHandler }: Props) {

  const geocoder = new kakao.maps.services.Geocoder();

  const [ fullAddress, setFullAddress ] = useState({
    address: "",
    detailedAddress: "",
    extraAddress: "",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { address, extraAddress } = fullAddress;

    setFullAddress({
      ...fullAddress,
      detailedAddress: event.target.value,
    });
    handleAddressChange(`${address} ${event.target.value} ${extraAddress ? `(${extraAddress})` : ''}`);

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const coordinates = new kakao.maps.LatLng(result[0].y, result[0].x);
        const { La, Ma }: any = coordinates;
        handleCoordsChange({ lat: Ma, lng: La });
      }
    });
  };

  const autoCompleteHandler = (address: string, extraAddress: string) => {
    if (!!fullAddress.detailedAddress)
      handleAddressChange(`${address} ${fullAddress.detailedAddress} ${extraAddress ? `(${extraAddress})` : ''}`);
    else
      handleAddressChange(`${address} ${extraAddress ? `(${extraAddress})` : ''}`);

    setFullAddress({
      ...fullAddress,
      address,
      extraAddress,
    });
    searchHandler();
  };

  const inputValue = fullAddress.address === '' ? '' : fullAddress.address + " " + (fullAddress.extraAddress ? `(${fullAddress.extraAddress})` : '')

  return (
    <AddressInputContainer>
      <div className='mapContainer'>
        <div id='map' className='mapDesc'>
          <UserMap
            address={address}
            profileImage={profileImage} 
          />
        </div>
      </div>

      <input id="fullAddress" type="text" value={inputValue} placeholder="주소" disabled={true} /><br />
      <input type="text" 
        onChange={handleInputChange}
        value={fullAddress.detailedAddress} 
        placeholder="상세주소" 
        autoComplete='off'
      />

      {isSearch ?
        <PostCodeModal
          searchHandler={searchHandler}
          handleCoordsChange={handleCoordsChange}
          autoCompleteHandler={autoCompleteHandler}
        />
      : null}
    </AddressInputContainer>
  );
}