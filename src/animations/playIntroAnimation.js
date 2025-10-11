import gsap from "gsap";

/**
 * Plays the intro animation after the loading screen disappears.
 * - Animates "animatedObjects" into view.
 * - Keeps social icons separate for better timing.
 * 
 * @param {Object} animatedObjects - dictionary of scene objects keyed by name
 */
export function playIntroAnimation(animatedObjects) {
  const mainDuration = 1.5;  // same
  const socialDuration = 1.2;
  const staggerMain = 0.3;
  const staggerSocial = 0.2;

  // Main timeline (non-social objects)
  const t1 = gsap.timeline({
    defaults: { duration: mainDuration, ease: "back.out(1.6)" },
  });

  Object.entries(animatedObjects).forEach(([key, obj], index) => {
    if (!["Github", "Instagram", "Scholar", "LinkedIn"].includes(key)) {
      t1.fromTo(
        obj.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: obj.userData.initialScale.x,
          y: obj.userData.initialScale.y,
          z: obj.userData.initialScale.z,
        },
        index * staggerMain
      );
    }
  });

  // Social icons timeline
  const t2 = gsap.timeline({
    defaults: { duration: socialDuration, ease: "back.out(2)" },
  });

  Object.entries(animatedObjects).forEach(([key, obj], index) => {
    if (["Github", "Instagram", "Scholar", "LinkedIn"].includes(key)) {
      t2.fromTo(
        obj.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: obj.userData.initialScale.x,
          y: obj.userData.initialScale.y,
          z: obj.userData.initialScale.z,
        },
        index * staggerSocial
      );
    }
  });

  // Optional: run both timelines in parallel
  t1.play();
  t2.play();
}
