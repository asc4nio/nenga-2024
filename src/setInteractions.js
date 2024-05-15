import * as THREE from "three";
import { CONFIG } from "/src/config.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";

export default function setInteractions(
  target,
  scene,
  renderTarget,
  camera,
  materials
) {
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

    raycaster.setFromCamera(mouse, camera);
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
    const material =
      materials.stitchesMaterials[nengaState.currentTool].clone();
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
    mesh.position.z += 0.002;
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
