import gsap from "gsap";

/**
 * Simulates a piano-key-like press animation on an object.
 * Keeps identical behavior and timing from the original.
 *
 * @param {THREE.Object3D} object - The key mesh
 */
export function animateKey(object) {
  if (!object || !object.userData) return;
  if (object.userData.keyPlaying) return;

  object.userData.keyPlaying = true;
  const originalY = object.userData.initialPosition.y;
  const pressDepth = 0.05; // identical

  const tl = gsap.timeline({
    onComplete: () => {
      object.userData.keyPlaying = false;
    },
  });

  tl.to(object.position, {
    y: originalY - pressDepth,
    duration: 0.1,
    ease: "power2.out",
  }).to(object.position, {
    y: originalY,
    duration: 0.1,
    ease: "power2.out",
  });
}
