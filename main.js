import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import { Pane } from "tweakpane";
import { CONFIG } from "/src/nengaConfig.js";

console.debug("main.js");

// CREAFT THE EXPERIENCE
async function createExperience(renderTarget) {
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
  scene.add(world.denimPlane);
  // THAN SET THE INTERACTIONS
  const interactivity = setInteractions(
    world.denimPlane,
    scene,
    renderTarget,
    camera,
    world.materials
  );

  debug(world);

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
    // renderer.setClearColor(new THREE.Color(0xffffff));
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
    let camDist = camera.position.z - 0;

    let heightToFit = 1; // desired height to fit
    camera.fov = 2 * Math.atan(heightToFit / (2 * camDist)) * (180 / Math.PI);
    camera.updateProjectionMatrix();

    // let controls = new OrbitControls(camera, renderTarget);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.1;

    function update() {
      // controls.update();
    }

    return { camera, update };
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
    });
    pane.addBinding(nengaState, "currentColor", {
      step: 1,
    });
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
    camera.update();
    renderer.render(scene, camera.camera);
  }
  function start() {
    renderer.setAnimationLoop(update);
  }
  function stop() {
    renderer.setAnimationLoop(null);
  }

  function onResize() {
    camera.camera.aspect = renderTarget.offsetWidth / renderTarget.offsetHeight;
    camera.camera.updateProjectionMatrix();

    renderer.setSize(renderTarget.offsetWidth, renderTarget.offsetHeight);
    renderer.render(scene, camera.camera);
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
// LOAD RESOURCES
async function loadResources(loader) {
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
// SET SCENE OBJECTS
function createWorld(resources, scene, renderTarget) {
  let lights = createLights();
  let materials = createMaterials();
  let denimPlane = createDenimPlane();

  // SET LIGHTS
  function createLights() {
    // scene.add(new THREE.AmbientLight(0xffffff, 1));

    const directionalLightIntensity = 8;
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      directionalLightIntensity
    );
    directionalLight.position.set(-1, 1, 1);
    scene.add(directionalLight);

    return {
      directionalLight,
    };
  }
  // function setLights() {
  //   // scene.add(new THREE.AmbientLight(0xffffff, 1));

  //   const directionalLightIntensity = 8;
  //   const directionalLight = new THREE.DirectionalLight(
  //     0xffffff,
  //     directionalLightIntensity
  //   );
  //   directionalLight.position.set(-1, 1, 1);
  //   scene.add(directionalLight);

  //   const directionalLightHelper = new THREE.DirectionalLightHelper(
  //     directionalLight,
  //     directionalLightIntensity * 0.1
  //   );
  //   scene.add(directionalLightHelper);
  // }
  // CREATE MATERIALS
  function createMaterials() {
    // DENIM TEXTURES TRANFORM
    for (const [key, value] of Object.entries(resources.denim)) {
      value.wrapS = THREE.RepeatWrapping;
      value.wrapT = THREE.RepeatWrapping;
      value.repeat.set(
        CONFIG.denimScale *
          (renderTarget.offsetWidth / renderTarget.offsetHeight),
        CONFIG.denimScale
      );
      value.colorSpace = THREE.SRGBColorSpace;
    }
    // DENIM MATERIAL
    const denimMaterial = new THREE.MeshStandardMaterial({
      map: resources.denim.diffuse,
      normalMap: resources.denim.normal,
      roughnessMap: resources.denim.roughness,
      bumpMap: resources.denim.bump,
      normalScale: new THREE.Vector2(2, 2),
      transparent: true,
      // depthTest: true,
      // depthWrite: false,
    });

    // STITCHES TEXTURES TRANFORM
    for (const [key, value] of Object.entries(resources.stitches)) {
      value.colorSpace = THREE.SRGBColorSpace;
    }
    // STITCHES MATERIALS
    let stitchesMaterials = [];
    for (let stitch of resources.stitches) {
      let material = new THREE.MeshStandardMaterial({
        map: stitch.diffuse,
        normalMap: stitch.normal,
        transparent: true,
        metalness: 0,
        roughness: 0,
      });
      stitchesMaterials.push(material);
    }

    return {
      denimMaterial,
      stitchesMaterials,
    };
  }
  // DUMMY OBJECT
  function placeDummy() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 16);
    let sphere = new THREE.Mesh(geometry, resources.denimMaterial);
    scene.add(sphere);
  }
  // DENIM PLANE
  function createDenimPlane() {
    const geometry = new THREE.PlaneGeometry(
      (1 * renderTarget.offsetWidth) / renderTarget.offsetHeight,
      1
    );
    const mesh = new THREE.Mesh(geometry, materials.denimMaterial);
    // scene.add(mesh);
    return mesh;
  }
  return {
    lights,
    materials,
    denimPlane,
  };
}
// MAKE THE MAGIC HAPPEN
function setInteractions(target, scene, renderTarget, camera, materials) {
  window.pointerState = {
    isPointerDown: false,
    dragStartPos: new THREE.Vector2(),
    lastDecalPos: undefined,
    isShooting: false,
  };
  const intersectionState = {
    intersects: false,
    point: new THREE.Vector3(),
  };

  const intersects = [];
  var stitches = [];

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  addListeners(renderTarget);

  // RAYCASTER
  function checkRaycasterIntersection(x, y, mesh) {
    // console.debug("checkRaycasterIntersection", x, y);

    if (mesh === undefined) return;

    mouse.x = (x / renderTarget.offsetWidth) * 2 - 1;
    mouse.y = -(y / renderTarget.offsetHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera.camera);
    raycaster.intersectObject(mesh, false, intersects);

    if (intersects.length > 0) {
      const p = intersects[0].point;
      intersectionState.point.copy(p);

      if (pointerState.lastDecalPos === undefined) {
        pointerState.lastDecalPos = new THREE.Vector3();
        pointerState.lastDecalPos.copy(intersectionState.point);
      }
      intersectionState.intersects = true;

      intersects.length = 0;
    } else {
      // console.debug(intersects)
      intersectionState.intersects = false;
    }
  }
  // STITCHES
  function createStitch(target, orientation, position) {
    const scale = CONFIG.stitches[nengaState.currentTool].scale;
    const size = new THREE.Vector3(scale, scale, 1);
    const material = materials.stitchesMaterials[nengaState.currentTool];
    material.color = new THREE.Color(CONFIG.palette[nengaState.currentColor]);

    const mesh = new THREE.Mesh(
      new DecalGeometry(target, position, orientation, size),
      material
    );
    return mesh;
  }
  function sew(scene, target, intersectionState) {
    console.debug("sew()", intersectionState.point);

    //set direction
    let direction = new THREE.Vector3();
    direction.subVectors(pointerState.lastDecalPos, intersectionState.point);

    //set orientation
    const orientation = new THREE.Euler();
    let dir = (Math.atan2(direction.x, direction.y) + Math.PI / 2) * -1;
    orientation.z = dir;
    // set position
    const position = new THREE.Vector3();
    position.copy(intersectionState.point);

    let mesh = createStitch(target, orientation, position);
    stitches.push(mesh);
    scene.add(mesh);

    window.pointerState.lastDecalPos = position;
  }
  function canSew() {
    let currentToolRadius = CONFIG.stitches[nengaState.currentTool].radius;
    let currentShootRadius = renderTarget.offsetHeight / currentToolRadius;

    let diffX = Math.abs(event.pageX - pointerState.dragStartPos.x);
    let diffY = Math.abs(event.pageY - pointerState.dragStartPos.y);

    return diffX > currentShootRadius || diffY > currentShootRadius;
  }

  // EVENT LISTENERS
  function addListeners(renderTarget) {
    renderTarget.addEventListener("pointerdown", function (event) {
      // console.debug("pointerdown");

      pointerState.isPointerDown = true;
      pointerState.dragStartPos.x = event.pageX;
      pointerState.dragStartPos.y = event.pageY;
    });

    renderTarget.addEventListener("pointermove", (event) => {
      // console.debug("pointermove");

      if (pointerState.isPointerDown && event.isPrimary) {
        checkRaycasterIntersection(event.clientX, event.clientY, target);
        if (canSew() == false) return;
        if (intersectionState.intersects) {
          pointerState.isShooting = true;
          sew(scene, target, intersectionState);
        }
        pointerState.dragStartPos.x = event.pageX;
        pointerState.dragStartPos.y = event.pageY;
      }
    });

    renderTarget.addEventListener("pointerup", function (event) {
      // console.debug("pointerup");
      pointerState.isPointerDown = false;
      pointerState.lastDecalPos = undefined;
      pointerState.isShooting = false;
    });
  }

  return {
    // stitches,
    // createStitch,
    // addListeners,
  };
}

/**
 * ON PAGE LOAD
 */
window.addEventListener("load", async () => {
  console.debug("window:load");
  const renderTarget = document.getElementById("threejs");
  window.nengaExperience = await createExperience(renderTarget);
  nengaExperience.start();

  window.addEventListener("resize", (event) => {
    nengaExperience.onResize();
  });
});
