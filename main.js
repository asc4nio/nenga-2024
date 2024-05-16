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

const ui = {
  container: document.getElementById("controls"),
  tools: document.getElementsByClassName("tool"),
  selectToolByIndex: (index) => {
    window.nengaState.currentTool = index;

    for (let tool of ui.tools) {
      tool.classList.remove("active");
    }
    // ui.tools.foreach((element) => {
    //   element.classList.remove("active");
    // });

    ui.tools[index].classList.add("active");
  },
  addEventListeners: function () {
    for (let i = 0; i < ui.tools.length; i++) {
      ui.tools[i].addEventListener("click", () => {
        ui.selectToolByIndex(i);
      });
    }

    // document.getElementById("tool-0").addEventListener("click", () => {
    //   console.debug("tool-0:click");
    // });
    // document.getElementById("tool-1").addEventListener("click", () => {
    //   console.debug("tool-1:click");
    //   window.nengaState.currentTool = 1;
    // });
    // document.getElementById("tool-2").addEventListener("click", () => {
    //   console.debug("tool-2:click");
    //   window.nengaState.currentTool = 2;
    // });
    // document.getElementById("tool-3").addEventListener("click", () => {
    //   console.debug("tool-3:click");
    //   window.nengaState.currentTool = 3;
    // });
    // document.getElementById("tool-4").addEventListener("click", () => {
    //   console.debug("tool-4:click");
    //   window.nengaState.currentTool = 4;
    // });
    // document.getElementById("tool-5").addEventListener("click", () => {
    //   console.debug("tool-5:click");
    //   window.nengaState.currentTool = 5;
    // });
  },
};

// window.deviceState = {
//   hasPointer: undefined,
//   isTouch: undefined,
// };

window.addEventListener("load", async () => {
  console.debug("window:load");
  about.addEventListeners();
  ui.addEventListeners();

  // CREAFT THE EXPERIENCE
  const renderTarget = document.getElementById("threejs");
  window.nengaExperience = await threeInit(renderTarget);
  nengaExperience.start();

  window.addEventListener("resize", (event) => {
    nengaExperience.onResize();
  });
});
