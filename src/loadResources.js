import { TOOLS } from "./config.js";

import denimDiffuse from "/tex/denim02-diffuse.jpg";
import denimNormal from "/tex/denim02-normal.jpg";
// import denimRoughness from "/tex/denim02-roughness.jpg";

import sunSvg from "/tex/sun.svg";

import stitchSoundFx from "/stitchSound.wav";

export default async function loadResources(
  textureLoader,
  svgLoader,
  audioLoader
) {
  // DENIM TEXTURES
  let denim = {
    diffuse: await textureLoader.loadAsync(denimDiffuse),
    normal: await textureLoader.loadAsync(denimNormal),
    // roughness: await textureLoader.loadAsync("/tex/denim02-roughness.jpg"),
    // bump: await textureLoader.loadAsync("/tex/denim02-bump.jpg"),
  };

  // STITCHES TEXTURES
  let stitches = [];
  let decals = [];
  for (let tool of TOOLS) {
    if (tool.type == "sewing") {
      let diffuse = await textureLoader.loadAsync(tool.textures.diffuse);
      let normal = await textureLoader.loadAsync(tool.textures.normal);
      stitches.push({
        diffuse: diffuse,
        normal: normal,
      });
    } else if (tool.type == "decal") {
      let diffuse = await textureLoader.loadAsync(tool.textures.diffuse);
      decals.push({
        diffuse: diffuse,
      });
    }
  }

  // SVG
  let sun = await svgLoader.loadAsync(sunSvg);

  let stitchSound = await audioLoader.loadAsync(stitchSoundFx);

  return {
    denim,
    stitches,
    decals,
    sun,
    stitchSound,
  };
}
