import * as THREE from "three";

/**
 * Handles user interaction: mouse, touch, raycasting, hover, and object clicks.
 *
 * @param {Object} options
 * @param {HTMLCanvasElement} options.canvas - The main rendering canvas
 * @param {THREE.Camera} options.camera
 * @param {THREE.Scene} options.scene
 * @param {Array<THREE.Object3D>} options.raycasterObjects
 * @param {Function} options.playHoverAnimation
 * @param {Function} options.animateKey
 * @param {Object} options.socialLinks - external link mapping
 * @param {Object} options.modalManager - { showModal, isModalOpen }
 * @param {Object} options.modals - { work, about, contact }
 * @returns {Object} interactionManager - exposes pointer and state
 */
export function createInteractionManager({
  canvas,
  camera,
  scene,
  raycasterObjects,
  playHoverAnimation,
  animateKey,
  socialLinks,
  modalManager,
  modals,
}) {
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  let touchHappened = false;
  let currentIntersects = [];
  let currentHoveredObject = null;

  // --- Mouse move tracking ---
  window.addEventListener("mousemove", (e) => {
    touchHappened = false;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // --- Touch start ---
  canvas.addEventListener(
    "touchstart",
    (e) => {
      touchHappened = true;
      pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    },
    { passive: false }
  );

  // --- Touch end (tap) ---
  canvas.addEventListener(
    "touchend",
    (e) => {
      touchHappened = true;
      handleRaycasterInteraction();
      setTimeout(() => {
        touchHappened = false;
      }, 400);
    },
    { passive: true }
  );

  // --- Click handling ---
  window.addEventListener("click", (e) => {
    if (touchHappened) return;
    handleRaycasterInteraction(e);
  });

  /**
   * Runs when the user taps/clicks an object
   */
  function handleRaycasterInteraction() {
    if (modalManager.isModalOpen()) return;

    if (currentIntersects.length > 0) {
      const object = currentIntersects[0].object;

      // --- External links ---
      Object.entries(socialLinks).forEach(([key, url]) => {
        if (object.name.includes(key)) {
          const newWindow = window.open();
          newWindow.opener = null;
          newWindow.location = url;
          newWindow.target = "_blank";
          newWindow.rel = "noopener noreferrer";
        }
      });

      // --- Modal triggers ---
      if (object.name.includes("My_Work")) modalManager.showModal(modals.work);
      else if (object.name.includes("About")) modalManager.showModal(modals.about);
      else if (object.name.includes("Contact")) modalManager.showModal(modals.contact);

      // --- Animate key press ---
      if (object.userData.hoverType === "keys") {
        animateKey(object);
      }
    }
  }

  /**
   * Call this each frame from your render loop.
   */
  function updateHover() {
    if (modalManager.isModalOpen()) return;

    raycaster.setFromCamera(pointer, camera);
    currentIntersects = raycaster.intersectObjects(raycasterObjects);

    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;

      // Find correct hover root
      const hoverRoot = currentIntersectObject.userData.hoverType
        ? currentIntersectObject
        : currentIntersectObject.parent?.userData.hoverType
        ? currentIntersectObject.parent
        : currentIntersectObject;

      const isBowieVinyl = hoverRoot.name.includes("Bowie_Vinyl");

      if (!isBowieVinyl) {
        if (!currentHoveredObject || hoverRoot.uuid !== currentHoveredObject.uuid) {
          if (currentHoveredObject && !currentHoveredObject.userData.bowiePlaying) {
            playHoverAnimation(currentHoveredObject, false, { scene, raycasterObjects });
          }

          playHoverAnimation(hoverRoot, true, { scene, raycasterObjects });
          currentHoveredObject = hoverRoot;
        }
      }

      document.body.style.cursor = hoverRoot.name.includes("Pointer")
        ? "pointer"
        : "default";
    } else {
      if (currentHoveredObject && !currentHoveredObject.userData.bowiePlaying) {
        playHoverAnimation(currentHoveredObject, false);
      }
      currentHoveredObject = null;
      document.body.style.cursor = "default";
    }
  }

  return {
    pointer,
    raycaster,
    updateHover,
    get currentIntersects() {
      return currentIntersects;
    },
    get currentHoveredObject() {
      return currentHoveredObject;
    },
  };
}
