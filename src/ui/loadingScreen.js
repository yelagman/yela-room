import gsap from "gsap";
import * as THREE from "three";

/**
 * Creates and manages the loading screen experience.
 * 
 * Handles button animations, loading complete reveal, and 
 * triggers scene intro after assets load.
 *
 * @param {Object} options
 * @param {THREE.LoadingManager} options.manager - shared THREE loading manager
 * @param {Function} options.playIntroAnimation - called after reveal completes
 * @returns {Object} loadingScreenManager
 */
export function createLoadingScreen({ manager, playIntroAnimation }) {
  const loadingScreen = document.querySelector(".loading-screen");
  const loadingScreenButton = document.querySelector(".loading-screen-button");

  let touchHappened = false;
  let isDisabled = false;

  // --- Define enter behavior ---
  function handleEnter() {
    if (isDisabled) return;
    isDisabled = true;
    loadingScreenButton.style.cursor = "default";
    loadingScreenButton.textContent = "bonjour :)";
    loadingScreen.style.background = "#333D29";
    playReveal();
  }

  // --- Define reveal animation ---
  function playReveal() {
    const tl = gsap.timeline();

    tl.to(loadingScreen, {
      scale: 0.5,
      duration: 1.2,
      delay: 0.25,
      ease: "back.in(1.8)",
    }).to(
      loadingScreen,
      {
        y: "200vh",
        transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
        duration: 1.2,
        ease: "back.in(1.8)",
        onComplete: () => {
          playIntroAnimation();
          loadingScreen.remove();
        },
      },
      "-=0.1"
    );
  }

  // --- LoadingManager configuration ---
  manager.onLoad = () => {
    Object.assign(loadingScreenButton.style, {
      border: "8px solid #414833",
      background: "#656D4A",
      color: "#e6dede",
      boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      cursor: "pointer",
      transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    });

    loadingScreenButton.textContent = "Enter!";

    // --- Event listeners ---
    loadingScreenButton.addEventListener("mouseenter", () => {
      loadingScreenButton.style.transform = "scale(1.3)";
    });

    loadingScreenButton.addEventListener("mouseleave", () => {
      loadingScreenButton.style.transform = "none";
    });

    loadingScreenButton.addEventListener("touchend", (e) => {
      touchHappened = true;
      e.preventDefault();
      handleEnter();
    });

    loadingScreenButton.addEventListener("click", (e) => {
      if (touchHappened) return;
      handleEnter();
    });
  };

  // --- Public API ---
  return {
    playReveal,
    handleEnter,
  };
}
