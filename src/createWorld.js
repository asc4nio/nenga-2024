import * as THREE from "three";
import { CONFIG } from "/src/config.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

export default function createWorld(resources, scene, renderTarget) {
  let lights = createLights();
  let materials = createMaterials();
  let sun = createSun();
  // placeDummy();
  // placeSun();

  // SET LIGHTS
  function createLights() {
    // ambient
    // scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    /*
    // directional
    const directionalLightIntensity = 5;
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      directionalLightIntensity
    );
    directionalLight.position.set(-1, 0.5, 1);
    // directionalLight.position.set(0, 0, 1);
    // directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(directionalLight);
*/

    // target
    // const targetObject = new THREE.Object3D();
    // targetObject.position.set(0, 0, 0);
    // scene.add(targetObject);

    // directional
    const directionalLightIntensity = CONFIG.lightIntensity;
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      directionalLightIntensity
    );
    directionalLight.position.set(
      CONFIG.lightPosition[0],
      CONFIG.lightPosition[1],
      CONFIG.lightPosition[2]
    );
    // directionalLight.lookAt(new THREE.Vector3(0, 0, 0));

    scene.add(directionalLight);

    // pointLight
    // const pointLight = new THREE.PointLight(0x0bcbab, 0.5, 1);
    // pointLight.position.set(0, 0, 0.25);
    // pointLight.lookAt(new THREE.Vector3(0, 0, 0));
    // scene.add(pointLight);

    return {
      directionalLight,
      // pointLight,
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
      normalScale: new THREE.Vector2(2, 2),
      // roughnessMap: resources.denim.roughness,
      // bumpMap: resources.denim.bump,
      // transparent: true,
      // depthTest: true,
      // depthWrite: false,
    });

    let stitchesMaterials = [];
    // STITCHES TEXTURES TRANFORM
    for (const [key, value] of Object.entries(resources.stitches)) {
      value.colorSpace = THREE.SRGBColorSpace;
    }
    // STITCHES MATERIALS
    for (let stitch of resources.stitches) {
      let material = new THREE.MeshStandardMaterial({
        map: stitch.diffuse,
        normalMap: stitch.normal,
        transparent: true,
        // normalScale: new THREE.Vector2(-1, -1),
        // metalness: 0,
        roughness: 0.5,
        // depthTest: true,
        // depthWrite: false,
      });
      // material.needsUpdate = true;
      stitchesMaterials.push(material);
    }

    let decalsMaterials = [];
    // DECALS TEXTURES TRANFORM
    for (let value of resources.decals) {
      value.colorSpace = THREE.SRGBColorSpace;
    }
    for (let value of resources.decals) {
      let material = new THREE.MeshStandardMaterial({
        map: value.diffuse,
        transparent: true,
      });
      decalsMaterials.push(material);
    }

    console.warn(decalsMaterials);

    return {
      denimMaterial,
      stitchesMaterials,
      decalsMaterials,
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
    // materials.denimMaterial.opacity = 0;
    const mesh = new THREE.Mesh(geometry, materials.denimMaterial);
    return mesh;
  }

  function createSun() {
    const svgScale = CONFIG.sunScale;
    const divisions = CONFIG.sunDivisions;

    const paths = resources.sun.paths;
    const shapes = SVGLoader.createShapes(paths[0]);

    // extract points from svg
    let sunPoints = [];
    for (let i = 0; i < divisions; i++) {
      let point = {
        position: shapes[0].getPointAt(i / divisions),
        rotation: shapes[0].getTangentAt(i / divisions).angle(),
      };
      sunPoints.push(point);
    }
    // console.warn("sunPoints", sunPoints);

    // process points
    for (let point of sunPoints) {
      point.position.x *= svgScale;
      point.position.y *= svgScale;
      point.position.z *= svgScale;
      point.position.x -= svgScale;
      point.position.y -= svgScale;
    }

    return { shape: shapes[0], points: sunPoints };
  }

  function placeSun() {
    const svgScale = CONFIG.sunScale;

    // MESH
    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      // depthWrite: false,
    });
    const geometry = new THREE.ShapeGeometry(sun.shape);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.x -= svgScale;
    mesh.position.y -= svgScale;
    mesh.position.z = 0.001;
    mesh.scale.set(svgScale, svgScale, svgScale);

    scene.add(mesh);

    //POINTS
    let pointGroup = new THREE.Group();
    const pointMaterial = new THREE.MeshStandardMaterial();
    const pointGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);

    // viev points
    // for (let point of sun.points) {
    //   let sphere = new THREE.Mesh(pointGeometry, pointMaterial);
    //   sphere.position.x = point.position.x;
    //   sphere.position.y = point.position.y;
    //   sphere.rotation.z = point.rotation;
    //   pointGroup.add(sphere);
    // }
    // scene.add(pointGroup);
  }

  return {
    lights,
    materials,
    sun,
    createDenimPlane,
  };
}
