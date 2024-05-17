import { CONFIG, TOOLS } from "/src/config.js";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { Pane } from "tweakpane";
import Stats from "three/addons/libs/stats.module.js";

import loadResources from "/src/loadResources.js";
import createWorld from "/src/createWorld.js";
import setInteractions from "/src/setInteractions.js";

import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { gsap } from "gsap";

export default async function threeInit(renderTarget) {
  // CREATE STATE INSTANCE
  window.nengaState = {
    state: "loading", //loaded, running
    dynamicLights: true,
    debug: window.location.hash.includes("#debug"),
    orbitControls: false,
    preventInteractions: true,
    currentTool: 0,
    currentColor: 0,
  };
  // INIT THREEJS
  const renderer = createRenderer();
  const scene = new THREE.Scene();
  const camera = createCamera();
  let stats;

  // LOAD RESOURCES
  const loaders = createLoaders();
  const resources = await loadResources(
    loaders.textureLoader,
    loaders.svgLoader,
    loaders.audioLoader
  ).catch((err) => {
    console.log(err);
  });

  // THAN CREATE THE WORLD
  const world = createWorld(resources, scene, renderTarget);
  const audio = createAudio();
  audio.sound.setBuffer(resources.stitchSound);
  audio.sound.setVolume(0.05);

  let denimPlane = world.createDenimPlane();
  scene.add(denimPlane);

  // THAN SET THE INTERACTIONS
  const interactivity = await setInteractions(
    denimPlane,
    scene,
    renderTarget,
    camera,
    world,
    audio
  );

  async function openAnimation() {
    nengaState.state = "running";
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // await sleep(300);
    document.getElementById("loading-overlay").style.display = "none";

    gsap.fromTo(
      CONFIG,
      {
        lightIntensity: 10,
      },
      {
        lightIntensity: 4,
        duration: 3.2,
        ease: "power2.out",
      }
    );

    await interactivity.sewAnimation(world.sun.points);
    nengaState.dynamicLights = false;
    ui.show();

    // audio.sound.play();
  }

  // IF DEBUG
  if (nengaState.debug) {
    stats = new Stats();
    document.body.appendChild(stats.dom);

    debug(world);
  }

  // CREATE LOADER
  function createLoaders() {
    const manager = new THREE.LoadingManager();
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
      console.log(
        "Started loading file: " +
          url +
          ".\nLoaded " +
          itemsLoaded +
          " of " +
          itemsTotal +
          " files."
      );
    };

    manager.onLoad = function () {
      console.log("Loading complete!");

      nengaState.state = "loaded";

      // console.log(interactivity);
      // openAnimation();
    };

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.log(
        "Loading file: " +
          url +
          ".\nLoaded " +
          itemsLoaded +
          " of " +
          itemsTotal +
          " files."
      );
    };

    manager.onError = function (url) {
      console.log("There was an error loading " + url);
    };
    const textureLoader = new THREE.TextureLoader(manager);
    const svgLoader = new SVGLoader(manager);
    const audioLoader = new THREE.AudioLoader(manager);

    return { textureLoader, svgLoader, audioLoader };
  }
  // CREATE RENDERER
  function createRenderer() {
    let renderer = new THREE.WebGLRenderer({
      // antialias: true,
      preserveDrawingBuffer: true,
      // alpha: true,
    });
    renderer.setSize(renderTarget.offsetWidth, renderTarget.offsetHeight);
    // renderer.setClearColor(0x000000, 0); // the default for alpha canvas
    renderer.setClearColor(new THREE.Color(0xffffff));

    renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : 1);

    renderTarget.appendChild(renderer.domElement);

    return renderer;
  }
  // CREATE CAMERA
  function createCamera() {
    let camera = new THREE.PerspectiveCamera(
      30,
      renderTarget.offsetWidth / renderTarget.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    let camDist = camera.position.z - CONFIG.cameraDistance;

    let heightToFit = 1; // desired height to fit
    camera.fov = 2 * Math.atan(heightToFit / (2 * camDist)) * (180 / Math.PI);
    camera.updateProjectionMatrix();

    if (nengaState.orbitControls) {
      let controls = new OrbitControls(camera, renderTarget);
      controls.enableRotate = false;
      controls.minDistance = 2;
      controls.maxDistance = 5;
    }

    return camera;
  }
  // CREATE AUDIO
  function createAudio() {
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    return { listener, sound };
  }
  // SET DEBUG ENVIRONMENT
  function debug() {
    // debug lights
    scene.add(
      new THREE.DirectionalLightHelper(
        world.lights.directionalLight,
        world.lights.directionalLight.intensity * 0.1,
        0x000000
      )
    );
    // scene.add(
    //   new THREE.PointLightHelper(
    //     world.lights.pointLight,
    //     world.lights.pointLight.intensity * 0.1
    //   )
    // );

    // tweakpane
    const pane = new Pane({
      container: document.getElementById("someContainer"),
    });
    pane.addBinding(nengaState, "currentTool", {
      step: 1,
      min: 0,
      max: TOOLS.length - 1,
    });
    pane.addBinding(nengaState, "currentColor", {
      step: 1,
      min: 0,
      max: CONFIG.palette.length - 1,
    });
    // pane.addBinding(pointerState, "mouse", {
    //   readonly: true,
    //   multiline: true,
    //   rows: 2,
    // });
    pane.addBinding(pointerState.mouse, "x", {
      readonly: true,
    });
    pane.addBinding(pointerState.mouse, "y", {
      readonly: true,
    });

    for (let i = 0; i < CONFIG.palette.length; i++) {
      pane.addBinding(CONFIG.palette, i.toString());
    }

    // const paneCurrentTool = pane.addBinding(nengaState, "currentTool", {
    //   step: 1,
    // });
    // paneCurrentTool.on("change", function (ev) {
    //   console.log(`change: ${ev.value}`);
    // });

    pane.addBinding(CONFIG, "lightIntensity", {
      min: 0,
      max: 10,
    });
    pane.addBinding(CONFIG.lightPosition, "0", {
      min: -5,
      max: 5,
    });
    pane.addBinding(CONFIG.lightPosition, "1", {
      min: -5,
      max: 5,
    });
    pane.addBinding(CONFIG.lightPosition, "2", {
      min: -5,
      max: 5,
    });
  }

  function update() {
    renderer.render(scene, camera);
    if (nengaState.dynamicLights) {
      world.lights.directionalLight.intensity = CONFIG.lightIntensity;
    }

    if (nengaState.state === "loaded") {
      openAnimation();
    }

    // if (window.pointerState) {
    //   // world.lights.directionalLight.position.set(
    //   //   pointerState.mouse.x,
    //   //   pointerState.mouse.y,
    //   //   world.lights.directionalLight.position.z
    //   // );
    //   // world.lights.pointLight.lookAt(new THREE.Vector3(0, 0, 0));
    //   // world.lights.pointLight.position.set(
    //   //   pointerState.mouse.x,
    //   //   pointerState.mouse.y,
    //   //   world.lights.pointLight.position.z
    //   // );
    // }
    if (nengaState.debug) {
      world.lights.directionalLight.position.set(
        CONFIG.lightPosition[0],
        CONFIG.lightPosition[1],
        CONFIG.lightPosition[2]
      );
      world.lights.directionalLight.intensity = CONFIG.lightIntensity;
      world.lights.directionalLight.target.position.set(0, 0, 0);
      // world.lights.directionalLight.lookAt(new THREE.Vector3(0, 0, 0));

      stats.update();
    }
  }
  function start() {
    renderer.setAnimationLoop(update);
  }
  function stop() {
    renderer.setAnimationLoop(null);
  }

  function onResize() {
    camera.aspect = renderTarget.offsetWidth / renderTarget.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(renderTarget.offsetWidth, renderTarget.offsetHeight);
    renderer.render(scene, camera);

    scene.remove(denimPlane);
    denimPlane = world.createDenimPlane();
    scene.add(denimPlane);
    world.materials.denimMaterial.map.repeat.set(
      CONFIG.denimScale *
        (renderTarget.offsetWidth / renderTarget.offsetHeight),
      CONFIG.denimScale
    );
    world.materials.denimMaterial.normalMap.repeat.set(
      CONFIG.denimScale *
        (renderTarget.offsetWidth / renderTarget.offsetHeight),
      CONFIG.denimScale
    );
    console.debug(world.materials.denimMaterial);
  }
  function saveAsImage() {
    let link = document.createElement("a");
    link.download = "nengastudio.png";

    // console.log(
    //   renderer.domElement.toBlob(function (blob) {
    //     console.log(blob);
    //   })
    // );

    renderer.domElement.toBlob(function (blob) {
      link.href = URL.createObjectURL(blob);
      link.click();
    }, "image/png");
  }
  function clear() {
    console.debug("clearDecals()");
    interactivity.decals.forEach(function (d) {
      scene.remove(d);
    });
    interactivity.decals.length = 0;
    interactivity.stitches.forEach(function (d) {
      scene.remove(d);
    });
    interactivity.stitches.length = 0;
  }

  return {
    start,
    stop,
    renderer,
    saveAsImage,
    onResize,
    clear,
    // openAnimation,
  };
}
