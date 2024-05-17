import stitch01diffuse from "/tex/stitch-01-diffuse.png";
import stitch01normal from "/tex/stitch-01-normal.jpg";
import stitch02diffuse from "/tex/stitch-02-diffuse.png";
import stitch02normal from "/tex/stitch-02-normal.jpg";
import stitch03diffuse from "/tex/stitch-03-diffuse.png";
import stitch03normal from "/tex/stitch-03-normal.jpg";
import stitch04diffuse from "/tex/stitch-04-diffuse.png";
import stitch04normal from "/tex/stitch-04-normal.jpg";
import decal01 from "/tex/decal-01-s.png";
import decal02 from "/tex/decal-02-s.png";
import decal03 from "/tex/decal-04-s.png";

export const CONFIG = {
  cameraDistance: 0,
  denimScale: 2.5,
  sunScale: 0.15,
  sunDivisions: 42,
  sunStepEvery: 40, //ms
  lightIntensity: 4,
  lightPosition: [-1, 0.5, 1],
  palette: ["#E2DB55", "#0BCBAB", "#008A84", "#004699", "#222222"],
};

export const TOOLS = [
  {
    type: "sewing",
    color: CONFIG.palette[0],
    textures: {
      diffuse: stitch01diffuse,
      normal: stitch01normal,
    },
    params: {
      scale: 0.03,
      radius: 56,
    },
  },
  {
    type: "sewing",
    color: CONFIG.palette[1],
    textures: {
      diffuse: stitch02diffuse,
      normal: stitch02normal,
    },
    params: {
      scale: 0.04,
      radius: 72,
    },
  },
  {
    type: "sewing",
    color: CONFIG.palette[3],
    textures: {
      diffuse: stitch03diffuse,
      normal: stitch03normal,
    },
    params: {
      scale: 0.03,
      radius: 72,
    },
  },
  {
    type: "decal",
    textures: {
      diffuse: decal01,
    },
    params: {
      scale: 0.07 * 0.8,
    },
  },
  {
    type: "decal",
    textures: {
      diffuse: decal02,
    },
    params: {
      scale: 0.07 * 0.8,
    },
  },
  {
    type: "decal",
    textures: {
      diffuse: decal03,
    },
    params: {
      scale: 0.06 * 1.2,
    },
  },
  {
    type: "sewing",
    color: CONFIG.palette[1],
    textures: {
      diffuse: stitch04diffuse,
      normal: stitch04normal,
    },
    params: {
      scale: 0.03,
      radius: 72,
    },
  },
];
