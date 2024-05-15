import "./style.css";
import threeInit from "/src/threeInit.js";
// import * as THREE from "three";

console.debug("main.js");

// window.deviceState = {
//   hasPointer: undefined,
//   isTouch: undefined,
// };

window.addEventListener("load", async () => {
  console.debug("window:load");
  // CREAFT THE EXPERIENCE
  const renderTarget = document.getElementById("threejs");
  window.nengaExperience = await threeInit(renderTarget);
  nengaExperience.start();

  window.addEventListener("resize", (event) => {
    nengaExperience.onResize();
  });
});
