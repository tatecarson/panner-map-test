import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonViewDidEnter } from '@ionic/react';
import getCompassDirection from 'geolib/es/getCompassDirection';
import getDistance from 'geolib/es/getDistance';
import { GeolocateControl } from "mapbox-gl";
import Nexus from "nexusui";
import { useEffect, useRef, useState } from 'react';
import ReactMapboxGl, { Feature, Layer } from 'react-mapbox-gl';
import * as Survey from "survey-react";
import { Freeverb, Listener, Loop, Panner3D, Sampler, Transport } from "tone";

import { currentChord, seq1, seq2 } from '../components/sampler/chords'
import { json } from "../data/survey_json";
import { init as customWidget } from '../utils/microphone';
import { filterMinMax, findClosest } from '../utils/music'

import './Home.css';
import 'mapbox-gl/dist/mapbox-gl.css'
import "survey-react/survey.css";

Survey.StylesManager.applyTheme("stone");
customWidget(Survey)
const surveyData: number[] = []

const start = () => {
  if (Transport.state !== "started") {
    console.log("started");
    // Tone.start()
    Transport.start("+0.1");
    Transport.bpm.value = 150;
  }
}

const stop = () => {
  Transport.stop();
}

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
    enableHighAccuracy: true,
  },
  trackUserLocation: true
})
console.log("🚀 ~ file: Home.tsx ~ line 59 ~  geolocation", geolocation)

const Home: React.FC = () => {
  const [isLoaded, setLoaded] = useState(false);
  const sampler: any = useRef(null);
  const sampler2: any = useRef(null)
  const reverb: any = useRef(null)
  const panner: any = useRef(null)
  const [location, setLocation] = useState(false)
  const [featureLocation, setFeatureLocation] = useState([-91.1597, 30.4232])
  const survey = new Survey.Model(json)

  const handleOnComplete = async (result: any) => {
    console.log(result.data)
    surveyData.push(result.data)
  }

  const retake = () => {
    survey.clear()
    survey.render()
  }

  useEffect(() => {
    panner.current = new Panner3D({
      panningModel: "HRTF",
      distanceModel: "linear",
      maxDistance: 150,
      refDistance: 1,
      rolloffFactor: 10,
      coneInnerAngle: 40,
      coneOuterAngle: 50,
      coneOuterGain: 0.4,
    }).toDestination();

    // Listener.positionX.value = -20000

    reverb.current = new Freeverb({
      roomSize: 0.7,
      dampening: 4300,
      wet: 0.5,
    }).connect(panner.current);

    let urls = {
      A4: "sus_A4_r01_main.wav",
      "A#5": "sus_A_sharp_5_r01_main.wav",
      "A#3": "sus_A_sharp_3_r01_main.wav",
      C3: "sus_C3_r01_main.wav",
      C4: "sus_C4_r01_main.wav",
      C5: "sus_C5_r01_main.wav",
      D3: "sus_D3_r01_main.wav",
      D4: "sus_D4_r01_main.wav",
      D5: "sus_D5_r01_main.wav",
      E3: "sus_E3_r01_main.wav",
      E4: "sus_E4_r01_main.wav",
      E5: "sus_E5_r01_main.wav",
      "F#3": "sus_F_sharp_3_r01_main.wav",
      "F#4": "sus_F_sharp_4_r01_main.wav",
      "F#5": "sus_F_sharp_5_r01_main.wav",
      "G#3": "sus_G_sharp_3_r01_main.wav",
      "G#4": "sus_G_sharp_4_r01_main.wav",
      "G#5": "sus_G_sharp_5_r01_main.wav",
    };

    sampler.current = new Sampler({
      urls,
      baseUrl: "../assets/hand-chimes/",
      onload: () => setLoaded(true),
    }).connect(reverb.current);

    sampler.current.attack = 0.5;
    sampler2.current = new Sampler({
      urls,
      baseUrl: "../assets/hand-chimes/",
      onload: () => console.log("buffers 2 loaded!"),
    }).connect(reverb.current);
    sampler2.current.attack = 0.5;


    let event1 = new Loop((time) => {
      // console.log(surveyData)
      let freq = seq1.freqSeq.next();

      // round to a wt-tuning
      let transFreq = findClosest(currentChord, freq);

      // console.log(`freq: ${freq} transFreq: ${transFreq}`);

      if (seq1.rSeq.next() > 2) {
        sampler.current.attack = Nexus.pick(0.5, 1, 1.5, 2, 2.5, 3);
        sampler.current.release = Nexus.pick(1, 1.5, 2, 2.5, 3);
      } else {
        sampler.current.release = 1;
      }

      // divide here so it doesn't break it
      sampler.current.triggerAttackRelease(transFreq / 2, seq1.durSeq.next(), time, seq1.vSeq.next());

      event1.interval = seq1.rSeq.next();
      // console.log("🚀 ~ file: Home.tsx ~ line 75 ~ event1 ~ seq1.rSeq.next()", seq1.rSeq.next())

      event1.probability = seq1.evProbseq.next();
    }).start();


    let event2 = new Loop((time) => {
      let freq = seq2.freqSeq.next();
      let transFreq = findClosest(currentChord, freq);

      // console.log(`freq: ${freq} transFreq: ${transFreq}`);

      if (seq2.rSeq.next() > 2) {
        sampler2.current.attack = Nexus.pick(0.5, 1, 1.5, 2, 2.5, 3);
        sampler2.current.release = Nexus.pick(1, 1.5, 2, 2.5, 3);
      } else {
        sampler2.current.release = 1;
      }
      sampler2.current.triggerAttackRelease(transFreq, seq2.durSeq.next(), time, seq2.vSeq.next());

      event2.interval = seq2.rSeq.next();

      event2.probability = seq2.evProbseq.next();
    }).start();

    event1.humanize = true;

    event2.humanize = true;
    event1.probability = 1;

  }, [])
  const [zoom, setZoom] = useState(15)
  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inbox</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>


        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              Inbox
            </IonTitle>
          </IonToolbar>
        </IonHeader>


        <IonButton onClick={start} disabled={!isLoaded}>Start</IonButton>
        <IonButton onClick={stop}>Stop</IonButton>
        <IonButton onClick={retake}>Retake survey</IonButton>
        {/* <Map height="500px" location={geolocation} ></Map> */}
        <MapDisplay
          // eslint-disable-next-line
          style="mapbox://styles/mapbox/streets-v8"
          zoom={[zoom]}
          center={[featureLocation[0], featureLocation[1]]}
          containerStyle={{
            height: "500px",
            width: "500px"
          }}
          onDblClick={() => {

          }}
          onStyleLoad={(map) => {
            map.resize()
            map.addControl(geolocation, 'top-left')
            geolocation.on('geolocate', (event: any) => {
              setFeatureLocation([-91.1597, 30.4232])

              // setLocation(true)
              let { longitude, latitude } = event.coords

              // TODO: how do i know if i'm close to another one too?
              // loop through and only look at sounds that are within the distance 
              // choose the closest one to set the values for the panner 
              // then use that info to take that markers survey data and change the sound
              let distance = getDistance({ latitude, longitude }, { latitude: featureLocation[1], longitude: featureLocation[0] })
              console.table(event.coords)
              console.log(`distance in meters: ${distance}`)
              let compass = getCompassDirection({ latitude, longitude }, { latitude: featureLocation[1], longitude: featureLocation[0] })
              console.log(compass)

              // sort of fake directional sound based on heading difference from current location to marker
              // doesn't take into account what direction you're facing or N S 
              Listener.positionZ.value = distance

              // "S" | "W" | "NNE" | "NE" | "ENE" | "E" | "ESE" | "SE" | "SSE" | "SSW" | "SW" | "WSW" | "WNW" | "NW" | "NNW" | "N"
              let positionOffset = 0
              if (compass === 'E' || compass === "NNE" || compass === "NE" || compass === "ENE" || compass === "ESE" || compass === "SE" || "SSE") {
                console.log('number should be negative')
                Listener.positionX.value = -distance + positionOffset
              } else if (compass === 'W' || compass === "SSW" || compass === "SW" || compass === "WSW" || compass === "WNW" || compass === "NW" || compass === "NNW") {
                console.log('number should be positive')
                Listener.positionX.value = distance + positionOffset
              } else {
                Listener.positionX.value = 0
              }
              console.log(Listener.positionX.value)
            })
          }}
        >


          {featureLocation && <Layer type="symbol" id="marker" layout={{ 'icon-image': 'marker-15' }}>
            <Feature coordinates={[-91.26, 30.5]} />
            <Feature coordinates={[-91.28, 30.5]} />
            <Feature coordinates={featureLocation} />
          </Layer>}

        </MapDisplay>
        <Survey.Survey model={survey} onComplete={handleOnComplete} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
