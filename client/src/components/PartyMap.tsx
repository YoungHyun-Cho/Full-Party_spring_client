import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Map, MapMarker, CustomOverlayMap, Circle } from 'react-kakao-maps-sdk';

export const MapContainer = styled.section`
  width: 100%;
  display: flex;
  justify-content: center;

  #map {
    margin-top: 10px;
  }

  .infoWindow {
    position: relative;
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

  .infoWindow a {
    display:block;
    text-decoration:none;
    color:#000;
    text-align:center;
    border-radius:20px;
    font-size:14px;
    font-weight:bold;
    overflow:hidden;
    background: #50C9C3 url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/arrow_white.png') 
    no-repeat right 14px center;
  }

  .infoWindow .title {
    display:block;
    text-align:center;
    background:#fff;
    margin-right:35px;
    padding:10px 15px;
    font-size:14px;
    font-weight:bold;
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
    width: 27px;
    height: 27px;
    border-radius: 100%;
    border: 2px solid #fff;
  }
`;

type Props = {
  isMember: boolean,
  latlng: { lat: number, lng: number },
  image: string
};

export default function PartyMap({ isMember, latlng, image }: Props) {

  const [ coords, setCoords ] = useState(latlng);
  const { lat: lat, lng: lng } = coords;
  const level = (isMember ? 4 : 5);
  const zoomable = (isMember ? true : false);

  useEffect(() => {
    setCoords(latlng)
  }, [ latlng ]);

  return (
    <MapContainer>
      <Map
        center={{ lat: lat + 0.001, lng: lng - 0.0001 }}
        style={{ width: "100%", height: "250px" }}
        level={level}
        zoomable={zoomable}
        onZoomChanged={(map) => map.setLevel(map.getLevel() > 7 ? 7 : map.getLevel())}
      >
        {/* {isMember ? */}
          <>
            <MapMarker
              position={coords}
              image={{
                src: "img/mapMarker.png",
                size: { width: 50, height: 50 },
                options: { offset: { x: 24.15, y: 69 } },
              }}>

            </MapMarker>
            <CustomOverlayMap
              position={coords}
              yAnchor={2.15}
            >
              <img className="partyImg" src={image} alt="Party Image" style={{objectFit: "cover" }} />
            </CustomOverlayMap>
          </>
        :
        <CustomOverlayMap
          position={coords}
          yAnchor={1}
        >
          <div className="infoWindow">
              <a
                href={`https://map.kakao.com/link/map/퀘스트장소,${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="title">퀘스트 장소</span>
              </a>
          </div>
        </CustomOverlayMap>
      </Map>
    </MapContainer>
  );
}