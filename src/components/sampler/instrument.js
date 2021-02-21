import * as Tone from "tone";

export const reverb = new Tone.Freeverb({
  roomSize: 0.7,
  dampening: 4300,
  wet: 0.5,
}).toDestination();

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
export const sampler = new Tone.Sampler({
  urls,
  baseUrl: "../assets/hand-chimes/",
  onload: () => console.log("buffers loaded!"),
}).connect(reverb);

sampler.attack = 0.5;
export const sampler2 = new Tone.Sampler({
  urls,
  baseUrl: "../assets/hand-chimes/",
  onload: () => console.log("buffers 2 loaded!"),
}).connect(reverb);
sampler2.attack = 0.5;
