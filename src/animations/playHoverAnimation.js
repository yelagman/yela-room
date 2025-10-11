import * as THREE from "three";
import gsap from "gsap";

/**
 * Plays hover and interaction animations for scene objects.
 * 
 * @param {THREE.Object3D} object - The hovered object
 * @param {boolean} isHovering - Whether the hover is entering or leaving
 * @param {Object} context - shared references { scene, raycasterObjects }
 */
export function playHoverAnimation(object, isHovering, context = {}) {
  const { scene, raycasterObjects } = context;

  // Cancel ongoing tweens on this object
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);
  if (object.material?.color) gsap.killTweensOf(object.material.color);

  const hoverType = object.userData.hoverType;
  if (!hoverType) return;

  // --- Helper: restore original transform ---
  const restore = () => {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.25,
      ease: "power2.out",
    });
    gsap.to(object.position, {
      x: object.userData.initialPosition.x,
      y: object.userData.initialPosition.y,
      z: object.userData.initialPosition.z,
      duration: 0.35,
      ease: "power2.out",
    });
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x,
      y: object.userData.initialRotation.y,
      z: object.userData.initialRotation.z,
      duration: 0.35,
      ease: "power2.out",
    });
    if (object.material?.color && object.userData.originalColor) {
      gsap.to(object.material.color, {
        r: object.userData.originalColor.r,
        g: object.userData.originalColor.g,
        b: object.userData.originalColor.b,
        duration: 0.25,
      });
    }
  };

  // --- Exit hover ---
  if (!isHovering) {
    object.userData.rideHovered = false;
    restore();
    return;
  }

  // --- Save original color if not already ---
  if (object.material?.color && !object.userData.originalColor) {
    object.userData.originalColor = object.material.color.clone();
  }

  // --- Hover behaviors ---
  switch (hoverType.toLowerCase()) {
    // 🎸 GUITAR
    case "guitar": {
      if (object.userData.guitarPlaying || object.userData.guitarCooldown) return;
      object.userData.guitarPlaying = true;

      const startRotZ = object.rotation.z % (Math.PI * 2);
      const startY = object.position.y;
      const lift = 0.5;
      const spins = 2;
      const proxy = { angle: 0 };

      const idx = raycasterObjects.indexOf(object);
      if (idx !== -1) raycasterObjects.splice(idx, 1);

      gsap.to(proxy, {
        angle: -Math.PI * 2 * spins,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          object.rotation.z = startRotZ + proxy.angle;
          const progress = -proxy.angle / (Math.PI * 2 * spins);
          object.position.y = startY + Math.sin(progress * Math.PI) * lift;
        },
        onComplete: () => {
          object.rotation.z = startRotZ;
          object.position.y = startY;
          object.userData.guitarPlaying = false;
          object.userData.guitarCooldown = true;
          setTimeout(() => {
            object.userData.guitarCooldown = false;
            if (!raycasterObjects.includes(object)) raycasterObjects.push(object);
          }, 500);
        },
      });
      break;
    }

    // 🖼️ JUMP (frames, small objects)
    case "jump": {
      const scaleFactor = object.userData.hoverScale || 1.4;
      gsap.to(object.scale, {
        x: object.userData.initialScale.x * scaleFactor,
        y: object.userData.initialScale.y * scaleFactor,
        z: object.userData.initialScale.z * scaleFactor,
        duration: 0.5,
        ease: "power2.out",
      });
      break;
    }

    // ℹ️ INFO (small icons)
    case "info": {
      gsap.to(object.scale, {
        x: object.userData.initialScale.x * 1.25,
        y: object.userData.initialScale.y * 1.25,
        z: object.userData.initialScale.z * 1.25,
        duration: 0.35,
        ease: "power2.out",
      });
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x - 0.12,
        duration: 0.35,
        ease: "power2.out",
      });
      break;
    }

    // 🚗 RIDE (animated rotation + lift)
    case "ride": {
      if (object.userData.ridePlaying || object.userData.rideCooldown) return;
      object.userData.ridePlaying = true;

      const startRotZ = object.rotation.z % (Math.PI * 2);
      const startY = object.position.y;
      const lift = 1;
      const proxy = { angle: 0 };

      const idx = raycasterObjects.indexOf(object);
      if (idx !== -1) raycasterObjects.splice(idx, 1);

      gsap.to(proxy, {
        angle: -Math.PI * 2,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          object.rotation.z = startRotZ + proxy.angle;
          const progress = -proxy.angle / (2 * Math.PI);
          object.position.y = startY + Math.sin(progress * Math.PI) * lift;
        },
        onComplete: () => {
          object.rotation.z = startRotZ;
          object.position.y = startY;
          object.userData.ridePlaying = false;
          object.userData.rideCooldown = true;
          setTimeout(() => {
            object.userData.rideCooldown = false;
            if (!raycasterObjects.includes(object)) raycasterObjects.push(object);
          }, 500);
        },
      });
      break;
    }

    // 🎶 BOWIE (vinyl lift + spin)
    case "bowie": {
      if (!object.name.includes("Bowie_Cover")) return;
      if (object.userData.bowiePlaying || object.userData.bowieCooldown) return;
      object.userData.bowiePlaying = true;

      const vinyl = scene.getObjectByName("Bowie_Vinyl_Fourth_Raycaster_Hover_Bowie");
      const turntable = scene.getObjectByName("Vinyl_Player_Third");
      if (!vinyl || !turntable) return;

      const vinylStartPos = vinyl.position.clone();
      const vinylStartRotY = vinyl.rotation.y;
      const vinylTargetPos = turntable.position.clone().add(new THREE.Vector3(0, 0.05, 0));
      const lift = 0.1, drop = 0.05, liftAfter = 0.5;

      const tl = gsap.timeline({
        onComplete: () => {
          object.userData.bowiePlaying = false;
          object.userData.bowieCooldown = true;
          setTimeout(() => (object.userData.bowieCooldown = false), 500);
        },
      });

      tl.to(vinyl.position, { y: vinyl.position.y + lift, duration: 0.5, ease: "power2.out" })
        .to(vinyl.position, { x: vinylTargetPos.x, z: vinylTargetPos.z, duration: 1.5, ease: "power2.inOut" })
        .to(vinyl.position, { y: vinylTargetPos.y - drop, duration: 0.5, ease: "power2.in" })
        .to(vinyl.rotation, { y: vinylStartRotY + Math.PI * 3, duration: 5, ease: "none" })
        .to(vinyl.position, { y: vinylTargetPos.y + liftAfter, duration: 0.5, ease: "power2.out" })
        .to(vinyl.position, { x: vinylStartPos.x, y: vinylStartPos.y, z: vinylStartPos.z, duration: 1.5, ease: "power2.inOut" })
        .to(vinyl.rotation, { y: vinylStartRotY, duration: 0.5, ease: "power2.inOut" }, "<");
      break;
    }

    // 💿 VINYLS (slide + return)
    case "vinyls": {
      if (object.userData.vinylPlaying || object.userData.vinylCooldown) return;
      object.userData.vinylPlaying = true;

      const startX = object.position.x;
      const offsetX = -0.3;

      const tl = gsap.timeline({
        onComplete: () => {
          object.userData.vinylPlaying = false;
          object.userData.vinylCooldown = true;
          setTimeout(() => (object.userData.vinylCooldown = false), 100);
        },
      });

      tl.to(object.position, { x: startX + offsetX, duration: 0.4, ease: "power2.out" })
        .to(object.position, { x: startX, duration: 0.4, ease: "power2.in" });
      break;
    }

    // 🪄 DEFAULT gentle pop
    default:
      gsap.to(object.scale, {
        y: object.userData.initialScale.y * 1.5,
        duration: 0.35,
        ease: "power2.out",
      });
  }
}
