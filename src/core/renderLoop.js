/**
 * Main render loop for the scene.
 * Handles object animations and hover updates every frame.
 *
 * @param {Object} options
 * @param {THREE.WebGLRenderer} options.renderer
 * @param {THREE.Scene} options.scene
 * @param {THREE.Camera} options.camera
 * @param {Object} options.controls
 * @param {Object} options.interactionManager
 * @param {Object} options.animations - { fans, chair, flowers, backpack }
 * @param {Function} options.isModalOpen - returns true if a modal is open
 */
export function startRenderLoop({
  renderer,
  scene,
  camera,
  controls,
  interactionManager,
  animations,
  isModalOpen,
}) {
  const { fans, chair, flowers, backpack } = animations;

  function render(timestamp) {
    controls.update();

    // --- Fan rotation ---
    fans.forEach((fan) => {
      fan.rotation.y += 0.02;
    });

    // --- Chair sway ---
    if (chair) {
      const time = timestamp * 0.001;
      const baseAmplitude = Math.PI / 8;
      const rotationOffset =
        baseAmplitude *
        Math.sin(time * 0.5) *
        (1 - Math.abs(Math.sin(time * 0.5)) * 0.3);

      chair.rotation.y = chair.userData.initialRotation.y + rotationOffset;
    }

    // --- Flower swaying ---
    if (flowers.length > 0) {
      const time = timestamp * 0.001;
      const maxAngle = Math.PI / 2;
      const speedFactor = 0.3;

      const angle = Math.sin(time * speedFactor) * maxAngle;

      flowers.forEach((flower) => {
        flower.rotation.y = flower.userData.initialRotation.y + angle;
        flower.rotation.x = flower.userData.initialRotation.x;
        flower.rotation.z = flower.userData.initialRotation.z;
        flower.position.y = flower.userData.initialPosition.y;
      });
    }

    // --- Backpack oscillation ---
    if (backpack) {
      const time = timestamp * 0.001;
      const maxAngle = Math.PI / 30;
      const speedFactor = 1;

      backpack.rotation.x =
        backpack.userData.initialRotation.x +
        Math.sin(time * speedFactor) * maxAngle;

      backpack.rotation.y = backpack.userData.initialRotation.y;
      backpack.rotation.z = backpack.userData.initialRotation.z;
    }

    // --- Hover updates (only when no modal) ---
    if (!isModalOpen()) {
      interactionManager.updateHover();
    }

    // --- Render the scene ---
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
