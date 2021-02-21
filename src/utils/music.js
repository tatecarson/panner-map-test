import Srl from "total-serialism";

const Stat = Srl.Statistic;
const Util = Srl.Utility;

export function plot(
  values,
  length = 100,
  iterations = 1,
  height = 10,
  clear = false
) {
  // plot values
  if (clear) {
    console.clear();
  }

  for (let i = 0; i < iterations; i++) {
    Util.plot(values.slice(i * length, i * length + length), {
      height,
    });
  }
  console.log(`Total Length: ${values.length}`);
}

export function filterMinMax(
  array,
  min = Stat.min(array),
  max = Stat.max(array)
) {
  return array.filter((number) => number >= min && number <= max);
}

export const findClosest = (arr, num) => {
  const creds = arr.reduce(
    (acc, val, ind) => {
      let { diff, index } = acc;
      const difference = Math.abs(val - num);
      if (difference < diff) {
        diff = difference;
        index = ind;
      }
      return { diff, index };
    },
    {
      diff: Infinity,
      index: -1,
    }
  );

  return arr[creds.index];
};
