export const CONFIG = {
  cameraDistance: 0,
  denimScale: 2.5,
  sunScale: 0.15,
  sunDivisions: 72,
  palette: ["#E2DB55", "#0BCBAB", "#008A84", "#004699", "#222222"],
};

export const TOOLS = [
  {
    type: "sewing",
    color: CONFIG.palette[0],
    textures: {
      diffuse: "/tex/stitch-01-diffuse.png",
      normal: "/tex/stitch-01-normal.jpg",
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
      diffuse: "/tex/stitch-02-diffuse.png",
      normal: "/tex/stitch-02-normal.jpg",
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
      diffuse: "/tex/stitch-03-diffuse.png",
      normal: "/tex/stitch-03-normal.jpg",
    },
    params: {
      scale: 0.03,
      radius: 72,
    },
  },
  {
    type: "decal",
    textures: {
      diffuse: "/tex/decal-01.png",
    },
    params: {
      scale: 0.07 * 0.8,
    },
  },
  {
    type: "decal",
    textures: {
      diffuse: "/tex/decal-02.png",
    },
    params: {
      scale: 0.09 * 0.8,
    },
  },
  {
    type: "decal",
    textures: {
      diffuse: "/tex/decal-04.png",
    },
    params: {
      scale: 0.06 * 1.2,
    },
  },
];