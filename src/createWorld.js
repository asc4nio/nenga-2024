import * as THREE from "three";
import { CONFIG } from "/src/config.js";

export default function createWorld(resources, scene, renderTarget) {
  let lights = createLights();
  let materials = createMaterials();
  //   placeDummy();

  // SET LIGHTS
  function createLights() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const directionalLightIntensity = 5;
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      directionalLightIntensity
    );
    directionalLight.position.set(-1, 0.5, 1);
    scene.add(directionalLight);

    return {
      directionalLight,
    };
  }
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
        depthTest: true,
        depthWrite: false,
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
    let sphere = new THREE.Mesh(geometry, materials.denimMaterial);
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
    createDenimPlane,
  };
}
