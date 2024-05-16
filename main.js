import "./style.css";
import threeInit from "/src/threeInit.js";
// import * as THREE from "three";

console.debug("main.js");

const about = {
  trigger: document.getElementById("about-trigger"),
  el: document.getElementById("about"),
  open: function () {
    about.el.showModal();
  },
  close: function () {
    about.el.close();
  },
  addEventListeners: function () {
    about.trigger.addEventListener("click", () => {
      console.debug("about.trigger:click");
      about.open();
    });
  },
};

window.ui = {
  el: undefined,
  container: undefined,
  tools: { els: undefined },
  init: () => {
    ui.el = document.getElementById("ui");
    ui.container = document.getElementById("controls");
    ui.tools.els = document.getElementsByClassName("tool");
    ui.addEventListeners();
  },
  addEventListeners: function () {
    for (let i = 0; i < ui.tools.els.length; i++) {
      ui.tools.els[i].addEventListener("click", () => {
        ui.selectToolByIndex(i);
      });
    }
    document.getElementById("tool-save").addEventListener("click", () => {
      nengaExperience.saveAsImage();
    });
    document.getElementById("tool-clear").addEventListener("click", () => {
      nengaExperience.clear();
    });
  },
  selectToolByIndex: (index) => {
    window.nengaState.currentTool = index;
    // remove active class
    for (let tool of ui.tools.els) {
      tool.classList.remove("active");
    }
    // add active to index
    ui.tools.els[index].classList.add("active");
  },
  hide: () => {
    ui.el.classList.add("hidden");
  },
  show: () => {
    ui.el.classList.remove("hidden");
  },
};

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

  ui.init();
  about.addEventListeners();

  window.addEventListener("resize", (event) => {
    nengaExperience.onResize();
  });
});
