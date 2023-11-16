import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { Coordinates } from '../App';

export const MapContainer = styled.section`
  width: 100%;
  display: flex;
  justify-content: center;

  #map {
    margin-top: 10px;
  }

  .infoWindow {
    position: relative;
    width: 100px;
    bottom: 85px;
    border-radius: 20px;
    float:left;
    border: 1px solid #ccc;
    border-bottom:2px solid #ddd;
  }

  .infoWindow:nth-of-type(n) {
    border: 0;
    box-shadow: 0px 1px 2px #999;
  }

  .infoWindow .navigate {
    display:block;
    text-decoration:none;
    color:#000;
    text-align:center;
    border-radius:20px;
    font-size:14px;
    font-weight:bold;
    overflow:hidden;
  }

  .infoWindow .title {
    display:block;
    text-align:center;
    background:#fff;
    padding:10px 15px;
    font-size:10px;
    font-weight:bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .infoWindow:after {
    content:'';
    position:absolute;
    margin-left:-12px;
    left:50%;
    bottom:-12px;
    width:22px;
    height:12px;
    background:url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png')
  }

  .partyImg {
    width: 16px;
    height: 16px;
    border-radius: 100%;
    border: 1px solid #fff;
  }
`;

type Props = {
  coordinates: Coordinates
  localParty: Array<{ [key: string]: any }>
};

export default function LocalMap({ coordinates, localParty }: Props) {
  const navigate = useNavigate();
  const { kakao } = window;
  const geocoder = new kakao.maps.services.Geocoder();
  const [ coords, setCoords ] = useState({ lat: 37.496562, lng: 127.024761 });

  type p = {
    party: { [key: string]: any }
  };

  const EventMarkerContainer = ({ party }: p) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <>
        <MapMarker
          // position={party.latlng}
          position={party.coordinates}
          image={{
            src: "img/mapMarker.png",
            size: { width: 30, height: 30 },
            options: { offset: { x: 15, y: 52 } },
          }}
          onClick={() => navigate(`../party/${party.id}`)}
          onMouseOver={() => setIsVisible(true)}
          onMouseOut={() => setIsVisible(false)}
        />
        <CustomOverlayMap
          // position={party.latlng}
          position={party.coordinates}
          yAnchor={3.1}
        >
          <div className="partyImg"
            onClick={() => navigate(`../party/${party.id}`)}
            onMouseOver={() => setIsVisible(true)}
            onMouseOut={() => setIsVisible(false)}
            style={{background: `url(${party.image})`, backgroundSize: "cover", backgroundPosition: "center"}}
          />
        </CustomOverlayMap>

        {isVisible?
          <CustomOverlayMap
            // position={party.latlng}
            position={party.coordinates}
          >
            <div className="infoWindow">
              <div className="navigate" onClick={() => navigate(`../party/${party.id}`)}>
                <span className="title">{party.name}</span>
              </div>
            </div>
          </CustomOverlayMap>
        : null}
      </>
    )
  }

  useEffect(() => {
    
    // geocoder.addressSearch(location, (result: any, status: any) => {
    //   console.log(location)
    //   console.log(status)
    //   if (status === kakao.maps.services.Status.OK) {
    //     const coordinates = new kakao.maps.LatLng(result[0].y, result[0].x);
    //     const { La, Ma } = coordinates;
    //     setCoords({ lat: Ma, lng: La });
    //     console.log(La, Ma)
    //   }
    // });

    setCoords(coordinates);

  }, [ localParty ]);

  return (
    <MapContainer>
      <Map
        center={coords}
        style={{ width: "100%", height: "250px" }}
        level={5}
        onZoomChanged={(map) => map.setLevel(map.getLevel() < 5 ? 5 : map.getLevel())}
      >
      {localParty.map((party, index) => (
        <EventMarkerContainer
          key={index}
          party={party}
        />
      ))}
      </Map>
    </MapContainer>
  );
}