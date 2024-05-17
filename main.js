// import "./style.css";
import threeInit from "/src/threeInit.js";

import { gsap } from "gsap";

// import * as THREE from "three";

console.debug("main.js");

const about = {
  trigger: document.getElementById("about-trigger"),
  el: document.getElementById("about"),
  open: function () {
    about.el.showModal();
    gsap.fromTo(
      about.el,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      }
    );
    ui.hide();
  },
  close: function () {
    about.el.close();
    // ui.show();
  },
  addEventListeners: function () {
    about.trigger.addEventListener("click", () => {
      console.debug("about.trigger:click");
      about.open();
    });
    about.el.addEventListener("close", () => {
      console.debug("about.el:close");
      ui.show();
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
      if (tool.classList.contains("active")) tool.classList.remove("active");
    }
    // add active to index
    ui.tools.els[index].classList.add("active");
  },
  hide: async (_hard) => {
    let hard = _hard || false;
    // ui.el.classList.add("hidden");
    ui.el.classList.add("prevent-click");

    if (hard) {
      gsap.set(".tool", {
        opacity: 0,
        translateX: "-100%",
      });
      gsap.set(".action", {
        opacity: 0,
        top: "-2em",
      });
    } else
      await gsap
        .timeline({})
        .to(
          ".tool",
          {
            opacity: 0,
            translateX: "-100%",
            duration: 0.08,
            stagger: 0.04,
            ease: "power2.out",
          },
          0
        )
        .to(
          ".action",
          {
            opacity: 0,
            top: "-2em",
            duration: 0.08,
            stagger: 0.04,
            ease: "power2.out",
          },
          ">"
        );
  },
  show: () => {
    // ui.el.classList.remove("hidden");
    ui.el.classList.remove("prevent-click");

    gsap
      .timeline()
      .fromTo(
        ".tool",
        {
          opacity: 0,
          translateX: "-100%",
        },
        {
          opacity: 1,
          translateX: "0%",

          duration: 0.16,
          stagger: 0.08,
          ease: "power2.out",
        },
        0
      )
      .fromTo(
        ".action",
        {
          opacity: 0,
          top: "-2em%",
        },
        {
          opacity: 1,
          top: "0em",

          duration: 0.16,
          stagger: 0.08,
          ease: "power2.out",
        },
        ">"
      );
  },
  hideTools: async () => {
    await gsap.timeline({}).to(
      ".tool",
      {
        opacity: 0,
        translateX: "-100%",
        duration: 0.08,
        stagger: 0.04,
        ease: "power2.out",
      },
      0
    );
  },
  showTools: () => {
    gsap.timeline().fromTo(
      ".tool",
      {
        opacity: 0,
        translateX: "-100%",
      },
      {
        opacity: 1,
        translateX: "0%",

        duration: 0.16,
        stagger: 0.08,
        ease: "power2.out",
      },
      0
    );
  },
};

// window.deviceState = {
//   hasPointer: undefined,
//   isTouch: undefined,
// };

window.addEventListener("load", async () => {
  console.debug("window:load");

  ui.init();
  ui.hide(true);

  // CREAFT THE EXPERIENCE
  const renderTarget = document.getElementById("threejs");
  window.nengaExperience = await threeInit(renderTarget);
  nengaExperience.start();
  about.addEventListeners();

  window.addEventListener("resize", (event) => {
    nengaExperience.onResize();
  });
});
