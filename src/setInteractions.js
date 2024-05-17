import * as THREE from "three";
import { CONFIG, TOOLS } from "/src/config.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";

export default async function setInteractions(
  target,
  scene,
  renderTarget,
  camera,
  world,
  audio
) {
  window.pointerState = {
    isPointerDown: false,
    dragStartPos: new THREE.Vector2(),
    lastDecalPos: undefined,
    isShooting: false,
    mouse: new THREE.Vector2(),
  };
  const intersectionState = {
    intersects: false,
    point: new THREE.Vector3(),
  };

  // const intersects = [];
  var stitches = [];
  var decals = [];

  const raycaster = new THREE.Raycaster();
  // const mouse = new THREE.Vector2();

  addListeners(renderTarget);
  // sewAnimation(world.sun.points);

  // RAYCASTER
  function checkRaycasterIntersection(mesh, event) {
    // console.debug("checkRaycasterIntersection", x, y);
    if (mesh === undefined) return;

    // update normalized pointer position
    pointerState.mouse.x = (event.pageX / renderTarget.offsetWidth) * 2 - 1;
    pointerState.mouse.y = -(event.pageY / renderTarget.offsetHeight) * 2 + 1;

    raycaster.setFromCamera(pointerState.mouse, camera);
    const intersects = raycaster.intersectObject(mesh, false);

    if (intersects.length > 0) {
      const p = intersects[0].point;
      if (pointerState.lastDecalPos === undefined) {
        pointerState.lastDecalPos = new THREE.Vector3();
        pointerState.lastDecalPos.copy(p);
      }
      return p;
    } else return null;
  }

  // STITCHES
  function createStitch(target, orientation, position, toolIndex) {
    const scale = TOOLS[nengaState.currentTool].params.scale;
    const size = new THREE.Vector3(scale, scale, 1);
    const material = world.materials.stitchesMaterials[toolIndex].clone();

    material.color = new THREE.Color(TOOLS[nengaState.currentTool].color);

    const mesh = new THREE.Mesh(
      new DecalGeometry(target, position, orientation, size),
      material
    );
    return mesh;
  }
  function sew(target, intersection) {
    console.debug("sew()", intersection);

    //set direction
    let direction = new THREE.Vector3();
    direction.subVectors(pointerState.lastDecalPos, intersection);

    //set orientation
    const orientation = new THREE.Euler();
    let dir = (Math.atan2(direction.x, direction.y) + Math.PI / 2) * -1;
    orientation.z = dir * 1;

    // set position
    const position = new THREE.Vector3();
    position.copy(intersection);

    // sew
    let mesh = createStitch(
      target,
      orientation,
      position,
      nengaState.currentTool
    );
    mesh.position.z += 0.002;
    stitches.push(mesh);
    scene.add(mesh);

    audio.sound.stop();
    audio.sound.play();

    // store last stitch position
    window.pointerState.lastDecalPos = position;
  }
  function canSew(event) {
    let currentToolRadius = TOOLS[nengaState.currentTool].params.radius;
    let currentShootRadius = renderTarget.offsetHeight / currentToolRadius;

    let diffX = Math.abs(event.pageX - pointerState.dragStartPos.x);
    let diffY = Math.abs(event.pageY - pointerState.dragStartPos.y);

    return diffX > currentShootRadius || diffY > currentShootRadius;
  }
  // DECALS
  function createDecal(target, orientation, position) {
    const scale = TOOLS[nengaState.currentTool].params.scale;
    const size = new THREE.Vector3(scale, scale, 1);
    const material =
      world.materials.decalsMaterials[nengaState.currentTool - 3].clone();

    const mesh = new THREE.Mesh(
      new DecalGeometry(target, position, orientation, size),
      material
    );
    mesh.renderOrder = 1;
    return mesh;
  }
  function placeDecal(scene, target, intersection) {
    console.debug("placeDecal()", intersection);

    const orientation = new THREE.Euler();

    // set position
    const position = new THREE.Vector3();
    position.copy(intersection);
    // position.x = intersection.x;
    // position.y = intersection.y;
    // position.z = 0;
    // position.z = -0.01;

    // sew
    let mesh = createDecal(target, orientation, position);
    mesh.position.z += 0.002;
    decals.push(mesh);
    scene.add(mesh);
  }

  //ANIMATION
  async function sewAnimation(points) {
    let animatedStitches = new THREE.Group();
    scene.add(animatedStitches);

    // for (let point of points) {
    for (let i = 0; i < points.length; i++) {
      const orientation = new THREE.Euler();
      orientation.set(0, 0, points[i].rotation + Math.PI * 0);

      const position = new THREE.Vector3();
      position.x = points[i].position.x;
      position.y = points[i].position.y;

      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(CONFIG.sunStepEvery);

      // sew
      // let mesh = createStitch(target, orientation, position, 3);

      const scale = TOOLS[6].params.scale;
      const size = new THREE.Vector3(scale, scale, 1);
      const material = world.materials.stitchesMaterials[3].clone();

      material.color = new THREE.Color(TOOLS[6].color);

      const mesh = new THREE.Mesh(
        new DecalGeometry(target, position, orientation, size),
        material
      );

      mesh.position.z += 0.002;
      animatedStitches.add(mesh);
    }
    nengaState.preventInteractions = false;
  }

  // EVENT LISTENERS
  function addListeners(renderTarget) {
    renderTarget.addEventListener("pointerdown", function (event) {
      if (nengaState.preventInteractions) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      console.warn(event);
      // console.debug("pointerdown");
      pointerState.isPointerDown = true;

      if (TOOLS[nengaState.currentTool].type == "decal") {
        let intersection = checkRaycasterIntersection(target, event);
        if (intersection == null) return;
        placeDecal(scene, target, intersection);
      } else if (TOOLS[nengaState.currentTool].type == "sewing") {
        pointerState.dragStartPos.x = event.pageX;
        pointerState.dragStartPos.y = event.pageY;
      }
    });

    renderTarget.addEventListener("pointermove", (event) => {
      if (nengaState.preventInteractions) return;
      // if (event.pointerType === "mouse" && event.button !== 0) return;

      // console.debug("pointermove");

      // proceed if pointer has clicked
      if (pointerState.isPointerDown && event.isPrimary) {
        let intersection = checkRaycasterIntersection(target, event);
        if (intersection == null) return;

        // check tool type
        if (TOOLS[nengaState.currentTool].type == "sewing" && canSew(event)) {
          pointerState.isShooting = true;
          sew(target, intersection);

          // update pointer drag position
          pointerState.dragStartPos.x = event.pageX;
          pointerState.dragStartPos.y = event.pageY;

          ui.hide();
          // ui.hideTools();
        }
      }
    });

    renderTarget.addEventListener("pointerup", function (event) {
      if (nengaState.preventInteractions) return;
      // if (event.pointerType === "mouse" && event.button !== 0) return;

      // console.debug("pointerup");
      pointerState.isPointerDown = false;

      if (TOOLS[nengaState.currentTool].type == "sewing") {
        pointerState.lastDecalPos = undefined;
        pointerState.isShooting = false;

        ui.show();
        // ui.showTools();
      }
    });
  }

  return {
    stitches,
    decals,
    sewAnimation,
  };
}
