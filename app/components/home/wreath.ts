import {ART} from '~/config/shop';

type Stem = 'base' | 'corner';

type WreathPiece = {
  src: string;
  x: number;
  y: number;
  size: number;
  angle: number;
  stem?: Stem;
};

const leaves = '/art/sweet-pea-leaves.webp';
const sprigArt = {
  beet: {src: '/art/about-beet-leaves.webp', stem: 'base', lean: 0},
  radish: {src: '/art/about-radish-leaves.webp', stem: 'corner', lean: 42},
  pea: {src: leaves, stem: 'base', lean: 0},
  bud: {src: '/art/sweet-pea-bud.webp', stem: 'base', lean: 22},
  flower: {src: '/art/sweet-pea-flower.webp', stem: 'base', lean: 0},
} as const;

// Each bunch shares a stem tucked under the harvest. Directions turn clockwise from upright.
type Sprig = [kind: keyof typeof sprigArt, size: number, direction: number];
const bunches: {x: number; y: number; sprigs: [Sprig, ...Sprig[]]}[] = [
  {x: 49, y: 8, sprigs: [['beet', 14, -65], ['pea', 8, -99], ['radish', 11, 64]]},
  {x: 61, y: 12, sprigs: [['radish', 11, -75], ['pea', 8.5, -8], ['bud', 7, -40]]},
  {x: 62.8, y: 12.8, sprigs: [['radish', 10.5, 57], ['pea', 8.5, 111]]},
  {x: 69.5, y: 16, sprigs: [['beet', 13.6, 52], ['pea', 8.5, 98], ['flower', 6.5, -48]]},
  {x: 77, y: 19, sprigs: [['radish', 12, 83], ['pea', 9, -36]]},
  {x: 85, y: 27.5, sprigs: [['beet', 13, -24], ['pea', 10, 66], ['flower', 6, 9]]},
  {x: 91, y: 37, sprigs: [['radish', 11.5, -16], ['pea', 9, 76]]},
  {x: 94, y: 48.5, sprigs: [['beet', 14, 13], ['pea', 8.5, -29]]},
  {x: 93, y: 56, sprigs: [['radish', 11, 9], ['pea', 9, 155], ['bud', 7, -38]]},
  {x: 91, y: 64.5, sprigs: [['pea', 11, 26], ['beet', 12, 163]]},
  {x: 85.5, y: 72, sprigs: [['radish', 12.5, 62], ['pea', 8, 129]]},
  {x: 81.5, y: 77, sprigs: [['beet', 14.5, 63], ['pea', 8.5, 156], ['bud', 7, 121]]},
  {x: 73, y: 84, sprigs: [['radish', 11.5, 145], ['pea', 9.5, 30]]},
  {x: 64, y: 89.5, sprigs: [['radish', 12, 77], ['pea', 10, 123], ['flower', 7, 63]]},
  {x: 56.5, y: 92, sprigs: [['radish', 10.3, 122], ['bud', 7.3, 172]]},
  {x: 51, y: 91.5, sprigs: [['beet', 14, 111], ['pea', 9, 54]]},
  {x: 48, y: 93.5, sprigs: [['radish', 11.5, -116], ['pea', 8.5, -142]]},
  {x: 38, y: 90, sprigs: [['radish', 11.5, -88], ['pea', 10, -125], ['bud', 6.5, -166]]},
  {x: 28.5, y: 84.5, sprigs: [['beet', 15, -70], ['pea', 8, -119]]},
  {x: 20.5, y: 79, sprigs: [['radish', 12, -59], ['pea', 8, -129]]},
  {x: 15, y: 74, sprigs: [['beet', 15, -35], ['pea', 9, -96], ['flower', 6.5, -43]]},
  {x: 8.5, y: 65, sprigs: [['radish', 10, -37], ['pea', 8, -5]]},
  {x: 6.5, y: 52, sprigs: [['pea', 11, -15], ['beet', 12.5, -155]]},
  {x: 8.5, y: 41, sprigs: [['radish', 11, -8], ['pea', 10, -38], ['bud', 7, -62]]},
  {x: 11.5, y: 31.5, sprigs: [['beet', 14, 38], ['pea', 8, -29]]},
  {x: 17, y: 24, sprigs: [['radish', 12, 53], ['pea', 9, -12]]},
  {x: 24.5, y: 17.5, sprigs: [['pea', 10, 33], ['flower', 6.5, -27]]},
  {x: 29.7, y: 13.5, sprigs: [['radish', 11, 47], ['beet', 10, 12]]},
  {x: 39, y: 10.5, sprigs: [['beet', 13.5, 67], ['pea', 9, -41]]},
];

function placeSprig(x: number, y: number, [kind, size, direction]: Sprig): WreathPiece {
  const {src, stem, lean} = sprigArt[kind];
  return {src, stem, x, y, size, angle: direction - lean};
}

const harvest: WreathPiece[] = [
  {src: ART.carrot, x: 64.5, y: 10, size: 17, angle: 98},
  {src: ART.radishC, x: 75.5, y: 17, size: 10, angle: 69},
  {src: leaves, x: 85, y: 26, size: 6.8, angle: 113},
  {src: ART.eggplant, x: 91, y: 35.5, size: 13.3, angle: -28},
  {src: ART.peapod, x: 94, y: 50, size: 9.5, angle: 8},
  {src: ART.radishB, x: 91, y: 63.5, size: 9.3, angle: -85},
  {src: ART.beet, x: 82.5, y: 76.5, size: 15.5, angle: 56},
  {src: leaves, x: 72, y: 84, size: 7.2, angle: 66},
  {src: ART.peapod, x: 61.5, y: 90, size: 13, angle: 76},
  {src: ART.radishA, x: 49, y: 92, size: 10, angle: 27},
  {src: leaves, x: 37, y: 90, size: 6.5, angle: -65},
  {src: ART.carrot, x: 25.5, y: 84, size: 17.8, angle: 116},
  {src: ART.tomato, x: 15, y: 75, size: 12, angle: -34},
  {src: leaves, x: 9, y: 64, size: 7.2, angle: -17},
  {src: ART.beet, x: 6, y: 50.5, size: 14.2, angle: 3},
  {src: ART.peapod, x: 9, y: 34.5, size: 9.6, angle: 24},
  {src: ART.radishA, x: 17, y: 24, size: 10, angle: 3},
  {src: ART.eggplant, x: 28, y: 15, size: 13.8, angle: 65},
  {src: leaves, x: 39, y: 9.5, size: 7.2, angle: 70},
  {src: ART.tomato, x: 49, y: 7, size: 13, angle: -12},
];

const smallerVegetables: WreathPiece[] = [
  {src: ART.tomato, x: 42.2, y: 10.7, size: 8.6, angle: 17},
  {src: ART.tomato, x: 55.6, y: 6.6, size: 7, angle: -37},
  {src: ART.peapod, x: 66, y: 13.7, size: 10, angle: -69},
  {src: ART.radish2, x: 84.7, y: 27.4, size: 10.5, angle: -21},
  {src: ART.carrot, x: 94.8, y: 53.9, size: 13, angle: -24},
  {src: ART.eggplant, x: 74.2, y: 84.1, size: 10.8, angle: -66},
  {src: ART.carrot, x: 55.5, y: 92.4, size: 13, angle: 82},
  {src: ART.tomato, x: 35.3, y: 88.4, size: 9.5, angle: 17},
  {src: ART.carrot, x: 24.6, y: 82.1, size: 14, angle: 124},
  {src: ART.radish2, x: 7.5, y: 59.3, size: 9.4, angle: 28},
  {src: ART.peapod, x: 23, y: 18, size: 10, angle: 56},
];

// The outer row is turned half a revolution so its fruit nests between the inner bunches.
export const wreathLayers = [
  {
    name: 'outer',
    pieces: [...bunches.map(({x, y, sprigs}) => placeSprig(x, y, sprigs[0])), ...harvest],
  },
  {
    name: 'inner',
    pieces: [
      ...bunches.flatMap(({x, y, sprigs}) => sprigs.map((sprig) => placeSprig(x, y, sprig))),
      ...smallerVegetables,
      ...harvest,
    ],
  },
];
