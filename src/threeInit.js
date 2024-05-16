import { CONFIG, TOOLS } from "/src/config.js";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { Pane } from "tweakpane";
import Stats from "three/addons/libs/stats.module.js";

import loadResources from "/src/loadResources.js";
import createWorld from "/src/createWorld.js";
import setInteractions from "/src/setInteractions.js";

import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

export default async function threeInit(renderTarget) {
  // CREATE STATE INSTANCE
  window.nengaState = {
    debug: window.location.hash.includes("#debug"),
    orbitControls: false,
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
    loaders.svgLoader
  ).catch((err) => {
    console.log(err);
  });

  // THAN CREATE THE WORLD
  const world = createWorld(resources, scene, renderTarget);

  let denimPlane = world.createDenimPlane();
  scene.add(denimPlane);

  // THAN SET THE INTERACTIONS
  const interactivity = setInteractions(
    denimPlane,
    scene,
    renderTarget,
    camera,
    world
  );

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

    return { textureLoader, svgLoader };
  }
  // CREATE RENDERER
  function createRenderer() {
    let renderer = new THREE.WebGLRenderer({
      // antialias: true,
      preserveDrawingBuffer: true,
      alpha: true,
    });
    renderer.setSize(renderTarget.offsetWidth, renderTarget.offsetHeight);
    // renderer.setClearColor(new THREE.Color(0xffffff));
    renderer.setClearColor(0x000000, 0); // the default

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
    }

    return camera;
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
  }

  function update() {
    renderer.render(scene, camera);
    if (window.pointerState) {
      // world.lights.directionalLight.position.set(
      //   pointerState.mouse.x,
      //   pointerState.mouse.y,
      //   world.lights.directionalLight.position.z
      // );
      // world.lights.pointLight.lookAt(new THREE.Vector3(0, 0, 0));
      // world.lights.pointLight.position.set(
      //   pointerState.mouse.x,
      //   pointerState.mouse.y,
      //   world.lights.pointLight.position.z
      // );
    }
    if (nengaState.debug) stats.update();
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

    // scene.remove(denimPlane);
    // denimPlane = world.createDenimPlane();
    // scene.add(denimPlane);
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
  };
}
