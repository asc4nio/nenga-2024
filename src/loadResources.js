import { TOOLS } from "./config.js";

export default async function loadResources(textureLoader, svgLoader) {
  // DENIM TEXTURES
  let denim = {
    diffuse: await textureLoader.loadAsync("/tex/denim02-diffuse.jpg"),
    normal: await textureLoader.loadAsync("/tex/denim02-normal.jpg"),
    roughness: await textureLoader.loadAsync("/tex/denim02-roughness.jpg"),
    bump: await textureLoader.loadAsync("/tex/denim02-bump.jpg"),
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
  let sun = await svgLoader.loadAsync("/tex/sun.svg");

  return {
    denim,
    stitches,
    decals,
    sun,
  };
}
