import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import getCompassDirection from 'geolib/es/getCompassDirection';
import getDistance from 'geolib/es/getDistance';
import { GeolocateControl } from "mapbox-gl";
import Nexus from "nexusui";
import Srl from "total-serialism";
import { useEffect, useRef, useState } from 'react';
import ReactMapboxGl, { Feature, Layer } from 'react-mapbox-gl';
import * as Survey from "survey-react";
import { Freeverb, Listener, Loop, Panner3D, Sampler, NoiseSynth, Transport, start, Filter, PitchShift, now } from "tone";

import {
  seq1, seq2, chords, gamelanChord
} from '../components/sampler/chords'
import { json } from "../data/survey_json";
import { init as customWidget } from '../utils/microphone';
import { findClosest } from '../utils/music'

import './Home.css';
import 'mapbox-gl/dist/mapbox-gl.css'
import "survey-react/survey.css";

Survey.StylesManager.applyTheme("stone");
customWidget(Survey)
const surveyData: number[] = []
const Util = Srl.Utility;
const Mod = Srl.Mod;
const Stat = Srl.Statistic;

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
  const [chord, setChord] = useState(gamelanChord)
  const [average, setAverage] = useState(1)
  const sampler: any = useRef(null);
  const sampler2: any = useRef(null)
  const wind: any = useRef(null);
  const event1: any = useRef(null)
  const event2: any = useRef(null)
  const reverb: any = useRef(null)
  const panner: any = useRef(null)
  const highpass: any = useRef(null)
  const lowpass: any = useRef(null)
  const highpass2: any = useRef(null)
  const lowpass2: any = useRef(null)
  const bandpass: any = useRef(null)
  const pitchShift: any = useRef(null)
  const [location, setLocation] = useState(false)
  const [featureLocation, setFeatureLocation] = useState([-91.1597, 30.4232])
  const survey = new Survey.Model(json)


  const startTransport = async () => {
    if (Transport.state !== "started") {
      console.log("started");
      await start()
      Transport.start("+0.1");
      Transport.bpm.value = 150;
      event1.current.start()
      // event2.current.start()
    }
  }

  const stop = () => {
    event1.current.stop()
    event2.current.stop()
    Transport.stop();
  }


  const handleOnComplete = async (result: any) => {
    const surveyAverage = Nexus.average(Object.values(result.data));
   
    setAverage(surveyAverage)
    // set new chord
    const pickChordbyAverage = Math.round(surveyAverage)
    setChord(chords[pickChordbyAverage])
    const density = Util.map(surveyAverage,
      1,
      7,
      1,
      0.04
    );
    event1.current.probability = density
    event2.current.probability = density

    const durations = Util.map(
      surveyAverage,
      1,
      7,
      0.2,
      1.4
    );

    seq1.durSeq.values = Util.mul(seq1.durSeq.values, [durations])
    seq2.durSeq.values = Util.mul(seq2.durSeq.values, [durations])

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

    highpass.current = new Filter(1800, 'highpass').toDestination();
    lowpass.current = new Filter(500, "lowpass")

    highpass2.current = new Filter(1800, 'highpass').toDestination();
    lowpass2.current = new Filter(500, "lowpass")


    bandpass.current = new Filter()
    bandpass.current.set({
      cutoff: 2000,
      type: "peaking",
      gain: 25,
      Q: 21
    })
    pitchShift.current = new PitchShift({
      "pitch": 5,
      "windowSize": 0.04,
      "delayTime": 0.03,
      "feedback": 0.5,
      "wet": 0.5
    })

    wind.current = new NoiseSynth({
      "noise": {
        "type": "pink",
        "playbackRate": 0.1,
        "volume": -10
      },
      "envelope": {
        "attack": 2,
        "decay": 2,
        "sustain": 0.5,
        "release": 3
      }
    }).chain(pitchShift.current, lowpass.current, highpass.current, reverb.current)

    wind.current.chain(pitchShift.current, lowpass2.current, highpass2.current, reverb.current)

    highpass2.current.gain.value = -10

  }, [])

  // NOTE: this is in a separate useEffect so it can respond to the chord change
  // without refreshing the samples above 
  // TODO: fix issue with jumping values, the problem is NOT retriggering the ENV
  // TODO: add other ruslting samples and attach to some groups of things like quiet tranquil calm 
  // use a long sample of leaves blowing and fade in and out 
  // chirping frogs, bug or bee sounds 
  // maybe water sounds? 
  useEffect(() => {
    console.log(seq1.rSeq.values)
    let windTriggered = false;
    event1.current = new Loop((time) => {
      let freq = seq1.freqSeq.next();

      // round to a wt-tuning
      // console.log("🚀 ~ file: Home.tsx ~ line 165 ~ event1 ~ chord", chord)
      // console.log('chord in event1: ', chord)
      let transFreq = findClosest(chord, freq);

      // console.log(`freq: ${freq} transFreq: ${transFreq}`);

      if (seq1.rSeq.next() > 2) {
        sampler.current.attack = Nexus.pick(0.5, 1, 1.5, 2, 2.5, 3);
        sampler.current.release = Nexus.pick(1, 1.5, 2, 2.5, 3);
      } else {
        sampler.current.release = 1;
      }


      // Trigger the wind attack when the interval is fast but only once until the next release
      if (event1.current.interval < 3 && !windTriggered) {
        // fast intervals
        console.log("value", wind.current.envelope.getValueAtTime(now()))
        if (wind.current.envelope.getValueAtTime(now()) === 0) {
          wind.current.triggerAttack()
          console.log('wind trigger attack 1')
        }

        // NOTE: this is jumping straight to another value 
        // THISIS IT FIX THIS!! 
        // highpass.current.frequency.rampTo(
        //   Math.random() * 4000 + 500,
        //   Nexus.pick([1, 3, 4, 6])
        // );
        // console.log("🚀 ~ file: Home.tsx ~ line 411 ~ event1.current=newLoop ~ highpass.current.frequency.", highpass.current.frequency.value)

        // lowpass.current.frequency.rampTo(
        //   Math.random() * 4000 + 500,
        //   Nexus.pick([1, 3, 4, 10])
        // );
        windTriggered = true;
      } else if (event1.current.interval > 3) {
        // slower intervals 
        wind.current.volume.rampTo(-10, 2)
        console.log('wind release')
        windTriggered = false;
      }
      wind.current.volume.value = Nexus.scale(average, 1, 7, -3, -7)

      // wind distortion 
      pitchShift.current.wet.value = Nexus.scale(average, 1, 7, 1, 0)
      pitchShift.current.pitch = Nexus.scale(average, 1, 7, 7, 1)

      // this should change even if the wind hasn't released
      pitchShift.current.windowSize = Nexus.pick(0.1, 0.04, 0.05)
      pitchShift.current.feedback.rampTo(Nexus.pick(0.2, 0.5), event1.current.interval)


      // divide here so it doesn't break it
      sampler.current.triggerAttackRelease(transFreq / 2, seq1.durSeq.next(), time + wind.current.envelope.attack, seq1.vSeq.next());


      event1.current.interval = seq1.rSeq.next();
      // console.log("🚀 ~ file: Home.tsx ~ line 75 ~ event1 ~ seq1.rSeq.next()", seq1.rSeq.next())
    })


    event2.current = new Loop((time) => {
      let freq = seq2.freqSeq.next();

      let transFreq = findClosest(chord, freq);

      // console.log(`freq: ${freq} transFreq: ${transFreq}`);

      if (seq2.rSeq.next() > 2) {
        sampler2.current.attack = Nexus.pick(0.5, 1, 1.5, 2, 2.5, 3);
        sampler2.current.release = Nexus.pick(1, 1.5, 2, 2.5, 3);
      } else {
        sampler2.current.release = 1;
      }

      // turn down the second signal 

      if (event1.current.interval < 3 && !windTriggered) {
        // fast intervals


        console.log('wind attack event 2')

        highpass2.current.frequency.rampTo(
          Math.random() * 4000 + 500,
          Nexus.pick([1, 3, 4, 6])
        );
        lowpass2.current.frequency.rampTo(
          Math.random() * 4000 + 500,
          Nexus.pick([1, 3, 4, 10])
        );
        windTriggered = true;
      } else if (event1.current.interval > 3) {
        // slower intervals 
        // wind.current.volume.rampTo(-10, 2)
        console.log('wind release')
        windTriggered = false
      }

      sampler2.current.triggerAttackRelease(transFreq, seq2.durSeq.next(), time, seq2.vSeq.next());

      event2.current.interval = seq2.rSeq.next();
    })



    event1.current.humanize = true;
    event2.current.humanize = true;
  }, [chord, average])

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


        <IonButton onClick={startTransport} disabled={!isLoaded}>Start</IonButton>
        <IonButton onClick={stop}>Stop</IonButton>
        <IonButton onClick={retake}>Retake survey</IonButton>
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
