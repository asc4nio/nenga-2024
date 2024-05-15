export default async function loadResources(loader) {
  // DENIM TEXTURES
  let denim = {
    diffuse: await loader.loadAsync("/tex/denim02-diffuse.jpg"),
    normal: await loader.loadAsync("/tex/denim02-normal.jpg"),
    roughness: await loader.loadAsync("/tex/denim02-roughness.jpg"),
    bump: await loader.loadAsync("/tex/denim02-bump.jpg"),
  };

  // STITCHES TEXTURES
  let stitches = [
    {
      diffuse: await loader.loadAsync("/tex/brush01-diffuse.png"),
      normal: await loader.loadAsync("/tex/brush01-normal.jpg"),
    },
    {
      diffuse: await loader.loadAsync("/tex/brush02-diffuse.png"),
      normal: await loader.loadAsync("/tex/brush02-normal.jpg"),
    },
  ];

  return {
    denim,
    stitches,
  };
}
