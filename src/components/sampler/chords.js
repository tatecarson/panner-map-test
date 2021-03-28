import Nexus from "nexusui";
import Srl from "total-serialism";

import { plot } from "../../utils/music";

const Gen = Srl.Generative;
const Mod = Srl.Transform;
const TL = Srl.Translate;
const Util = Srl.Utility;
const Algo = Srl.Algorithmic;
const Stat = Srl.Statistic;
const Rand = Srl.Stochastic;

// let notes = Gen.spreadInclusive(9, 38, 50);
// Messing with this gets really different results.
let notes = Gen.sine(13, 5.92, 38, 120);
// duplicate melody 4 times
notes = Mod.duplicate(Mod.palindrome(notes), 2);
// plot(notes, notes.length, 20, false);
notes = Util.add(notes, [12, 14, 24, 16]);
// notes = Util.add(notes, [3, 5, 6]);

notes = Util.mul(notes, [4]);
// plot(notes, notes.length, 1, 20, false);

// beginning sequence
let fib = Algo.fibonacci(20);
// plot(fib, fib.length, 20, false);
// map sequence to the seconds domain
fib = Util.map(fib, Stat.min(fib), Stat.max(fib), 0.5, 5);
// plot(fib, fib.length, 1, 20, false);
// duplicate and repeat backwards
fib = Mod.duplicate(Mod.palindrome(fib), 4);
// console.log("🚀 ~ file: script.js ~ line 28 ~ fib", fib);
// plot(fib, 100, 2, 10, false);

Nexus.tune.createJIScale(
  1 / 1, // 0 - Eb
  279 / 256, // 1 -  E
  9 / 8, // 2 -  F
  147 / 128, // 3 - F#
  21 / 16, // 4 - G
  93 / 64, // 5 - G#
  189 / 128, // 6 - A
  3 / 2, // 7 - Bb
  49 / 32, // 8 - B
  7 / 4, // 9 -  C
  31 / 16, // 10 - C#
  63 / 32 // 11 - D
);
Nexus.tune.root = 297.989;

const wtTransposed = [];
for (let i = -12; i < 24; i++) {
  wtTransposed.push(Nexus.note(i));
}

// subsets of the whole scale
export const openingChord = Mod.lookup([0, 7, 9, 12, 14, 19], wtTransposed);
export const magicChord = Mod.lookup(
  [1, 3, 6, 8, 11, 13, 16, 18],
  wtTransposed
);
export const magicOpeningChord = Mod.lookup(
  [
    0,
    1,
    2,
    3,
    4,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    18,
    19,
    20,
    21,
    22,
    23,
  ],
  wtTransposed
);

export const gamelanChord = Mod.lookup([3, 6, 9, 13], wtTransposed);
export let tamiarDreamChord = Mod.lookup([8, 11, 4, 6, 8, 11, 16, 18], wtTransposed);
tamiarDreamChord[0] = Nexus.note(8 - 24);
tamiarDreamChord[1] = Nexus.note(11 - 24);
export let lostAncestralLakeRegionChord = Mod.lookup(
  [4, 8, 11, 3, 4, 6],
  wtTransposed
);
lostAncestralLakeRegionChord[0] = Nexus.note(4 - 24);
lostAncestralLakeRegionChord[1] = Nexus.note(8 - 24);
lostAncestralLakeRegionChord[2] = Nexus.note(11 - 24);

export const theBrookChord = Mod.lookup(
  [7, 9, 12, 14, 16, 19, 21, 26, 28, 33],
  wtTransposed
);
export const thePoolChord = Mod.lookup([0, 2, 3, 7, 9, 12, 14, 19], wtTransposed);

// map the notes array to the range of the current chord

let currentChord = gamelanChord;
notes = Util.map(
  notes,
  Stat.min(notes),
  Stat.max(notes),
  Stat.min(currentChord),
  Stat.max(currentChord)
);

let ev1prob = Util.map(fib, Stat.min(fib), Stat.max(fib), 0.7, 1);
let ev2prob = Util.map(fib, Stat.min(fib), Stat.max(fib), 0.8, 1);
let velocity = Util.map(fib, Stat.min(fib), Stat.max(fib), 0.2, 0.7);

const durSeq = new Nexus.Sequence(fib, "down");
const durSeq2 = new Nexus.Sequence(fib);
let freqSeq = new Nexus.Sequence(notes);
let freqSeq2 = new Nexus.Sequence(notes, "down");
let rSeq = new Nexus.Sequence(fib);
let rSeq2 = new Nexus.Sequence(fib, "down");
const ev1probSeq = new Nexus.Sequence(ev1prob, "down");
const ev2probSeq = new Nexus.Sequence(ev2prob, "up");
const vSeq = new Nexus.Sequence(velocity);

plot(rSeq.values);
plot(rSeq2.values);
export const seq1 = {
  durSeq,
  freqSeq,
  rSeq,
  evProbseq: ev1probSeq,
  vSeq,
};

export const seq2 = {
  durSeq: durSeq2,
  freqSeq: freqSeq2,
  rSeq: rSeq2,
  evProbseq: ev2probSeq,
  vSeq,
};

export const chords = [
  gamelanChord, theBrookChord, openingChord, lostAncestralLakeRegionChord, magicChord,thePoolChord, tamiarDreamChord, magicOpeningChord  
]
