import { CONFIG } from "/src/config.js";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { Pane } from "tweakpane";

import loadResources from "/src/loadResources.js";
import createWorld from "/src/createWorld.js";
import setInteractions from "/src/setInteractions.js";

export default async function threeInit(renderTarget) {
  // CREATE STATE INSTANCE
  window.nengaState = {
    currentTool: 0,
    currentColor: 0,
  };
  // INIT THREEJS
  const renderer = createRenderer();
  const scene = new THREE.Scene();
  const camera = createCamera();
  // LOAD RESOURCES
  const loader = createLoader();
  const resources = await loadResources(loader).catch((err) => {
    console.log(err);
  });
  // THAN CREATE THE WORLD
  const world = createWorld(resources, scene, renderTarget);

  let denimPlane = world.createDenimPlane();
  scene.add(denimPlane);

  // THAN SET THE INTERACTIONS
  setInteractions(denimPlane, scene, renderTarget, camera, world.materials);

  if (window.location.hash === "#debug") debug(world);

  // CREATE LOADER
  function createLoader() {
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
    const loader = new THREE.TextureLoader(manager);

    return loader;
  }
  // CREATE RENDERER
  function createRenderer() {
    let renderer = new THREE.WebGLRenderer({
      // antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(renderTarget.offsetWidth, renderTarget.offsetHeight);
    renderer.setClearColor(new THREE.Color(0xffffff));
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
    let camDist = camera.position.z - 1;

    let heightToFit = 1; // desired height to fit
    camera.fov = 2 * Math.atan(heightToFit / (2 * camDist)) * (180 / Math.PI);
    camera.updateProjectionMatrix();

    // let controls = new OrbitControls(camera, renderTarget);

    return camera;
  }
  // SET DEBUG ENVIRONMENT
  function debug() {
    const directionalLightHelper = new THREE.DirectionalLightHelper(
      world.lights.directionalLight,
      world.lights.directionalLight.intensity * 0.1
    );
    scene.add(directionalLightHelper);

    const pane = new Pane({
      container: document.getElementById("someContainer"),
    });
    pane.addBinding(nengaState, "currentTool", {
      step: 1,
      min: 0,
      max: 1,
    });
    pane.addBinding(nengaState, "currentColor", {
      step: 1,
      min: 0,
      max: CONFIG.palette.length - 1,
    });

    // for (let i = 0; i < CONFIG.palette.length; i++) {
    //   pane.addBinding(CONFIG.palette, i.toString());
    // }

    // const paneCurrentTool = pane.addBinding(nengaState, "currentTool", {
    //   step: 1,
    // });
    // paneCurrentTool.on("change", function (ev) {
    //   console.log(`change: ${ev.value}`);
    // });
  }
  /**
   * METHODS
   */
  function update() {
    renderer.render(scene, camera);
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

  return {
    start,
    stop,
    renderer,
    saveAsImage,
    onResize,
  };
}
