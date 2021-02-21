import { GeolocateControl } from "mapbox-gl";
import React, { useState } from 'react';
import ReactMapboxGl, { Feature, Layer } from 'react-mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css'
import { getListener } from "tone";

interface ILocation {
    lat: number,
    lng: number,
    isError?: boolean,
    message?: string
}

interface MapProps {
    height: string;
    location: any;
}

const MapDisplay = ReactMapboxGl({
    accessToken: "pk.eyJ1IjoidGFjYXJzb24iLCJhIjoiY2tlcmZ2NzlnM2V2aDJzbzdpbzVuOTAyOSJ9.K2Qa_skDVKi93fDCQ93zUg",
    interactive: true
});

const geolocation = new GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
})

const Map: React.FC<MapProps> = ({ height, location }) => {
    console.log(location)
    // const [locationState, setLocationState] = useState(location);
    const [zoom, setZoom] = useState(11)


    return (
        <>

            <MapDisplay
                // eslint-disable-next-line
                style="mapbox://styles/mapbox/streets-v8"
                zoom={[zoom]}
                center={[-90, 30]}
                containerStyle={{
                    height: "500px",
                    width: "500px"
                }}
                onStyleLoad={(map) => {
                    map.resize()
                    map.addControl(geolocation, 'top-left')
                    geolocation.on('geolocate', (coords) => {
                        console.log(coords)
                    })
                }}
            >

                <Layer type="symbol" id="marker" layout={{ 'icon-image': 'marker-15' }}>
                    <Feature coordinates={[-0.481747846041145, 51.3233379650232]} />
                </Layer>

            </MapDisplay>

        </>
    );

};

export default Map;