import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from './utils/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap";


const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
}
let touchHappened = false;

document.querySelectorAll(".modal-exit-button").forEach((button) => {

  button.addEventListener('touchend', (e) => {
    touchHappened = true;
    e.preventDefault();
    const modal = e.target.closest('.modal');
    hideModal(modal);
  }, { passive: false });

  button.addEventListener('click', (e) => {
    if (touchHappened) return;
    e.preventDefault();
    const modal = e.target.closest('.modal');
    hideModal(modal);
  }, { passive: false });
});

let isModalOpen = false;

const showModal = (modal) => {
  if (!modal) return;
  modal.style.display = "block";
  isModalOpen = true;
  controls.enabled = false;

  if (currentHoveredObject) {
    playHoverAnimation(currentHoveredObject, false);
    currentIntersects = [];
    currentHoveredObject = null;
  }

  document.body.style.cursor = 'default';

  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });
};


const hideModal = (modal) => {

  isModalOpen = false;
  controls.enabled = true;

  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    },

  });
};

const manager = new THREE.LoadingManager();

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");

manager.onLoad = function () {

  loadingScreenButton.style.border = "8px solid #414833";
  loadingScreenButton.style.background = "#656D4A";
  loadingScreenButton.style.color = "#e6dede";
  loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
  loadingScreenButton.textContent = "Enter!";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition =
    "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
  let isDisabled = false;

  function handleEnter(withSound = true) {
    if (isDisabled) return;
    loadingScreenButton.style.cursor = "default";
    loadingScreenButton.style.border = "8px solid #414833";
    loadingScreenButton.style.background = "#656D4A";
    loadingScreenButton.style.color = "#e6dede";
    loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
    loadingScreenButton.textContent = "bonjour :)";
    loadingScreen.style.background = "#333D29"; // A4AC86
    isDisabled = true;


    // if (!withSound) {
    //   isMuted = true;
    //   // updateMuteState(true);

    //   soundOnSvg.style.display = "none";
    //   soundOffSvg.style.display = "block";
    // } else {
    //   // backgroundMusic.play();
    // }

    // Reveal animation
    playReveal();
  }

  loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });

  loadingScreenButton.addEventListener("touchend", (e) => {
    touchHappened = true;
    e.preventDefault();
    handleEnter();
  });

  loadingScreenButton.addEventListener("click", (e) => {
    if (touchHappened) return;
    handleEnter(true);
  });

  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });

};

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
        isModalOpen = false;
        playIntroAnimation();
        loadingScreen.remove();
      },
    },
    "-=0.1"
  );
}





const yAxisFans = [];
const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;
let chair;
let flowers = [];
let backpack;




const socialLinks = {
  "Github": 'https://github.com/yelagman',
  "LinkedIn": 'https://www.linkedin.com/in/yelaman-moldagali/',
  "Instagram": 'https://www.instagram.com/jibaliba/',
  'Scholar': 'https://dl.acm.org/profile/99660897391',
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// loaders
const textureLoader = new THREE.TextureLoader();


// model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

const textureMap = {
  First: {
    day: '/textures/first_texture_set.webp'
  },
  Second: {
    day: '/textures/second_texture_set.webp'
  },
  Third: {
    day: '/textures/third_texture_set.webp'
  },
  Fourth: {
    day: '/textures/fourth_texture_set.webp'
  },
  Fifth: {
    day: '/textures/fifth_texture_set.webp'
  },
  Sixth: {
    day: '/textures/sixth_texture_set.webp'
  },
};

const loadedTextures = {
  day: {}

};

Object.entries(textureMap).forEach(([key, paths]) => {

  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;

});

const videoElement = document.createElement('video');
videoElement.src = '/video/oned.mp4';
videoElement.loop = true;
videoElement.autoplay = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;


window.addEventListener('mousemove', (e) => {
  touchHappened = false;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
});


window.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1;
  },
  { passive: false }
);

window.addEventListener(
  'touchend',
  (e) => {
    e.preventDefault();
    handleRaycasterInteraction();
  },
  { passive: false }
);

function handleRaycasterInteraction() {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes('My_Work')) {
      showModal(modals.work);
    } else if (object.name.includes('About')) {
      showModal(modals.about);
    } else if (object.name.includes('Contact')) {
      showModal(modals.contact);
    }

    if (object.userData.hoverType === 'keys') {
      animateKey(object);
    }
  }
}

window.addEventListener('click', handleRaycasterInteraction);

const animatedObjects = {};


// replace your loader.load with this
loader.load('/models/Room_Portfolio.glb', (glb) => {

  glb.scene.traverse((child) => {
    if (child.isMesh) {

      // inside loader.load(...) glb.scene.traverse block, replace your Hover handling with this:
      if (child.name.includes('Hover')) {
        child.userData.initialScale = child.scale.clone();
        child.userData.initialPosition = child.position.clone();
        child.userData.initialRotation = child.rotation.clone();

        const hoverMatch = child.name.match(/Hover_(.+)/i);
        child.userData.hoverType = hoverMatch ? hoverMatch[1].toLowerCase() : null;
        console.log(child.userData.hoverType);
      }

      if (child.name.includes('Chair')) {
        chair = child;
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }

      if (child.name.includes("Flower")) {
        child.userData.initialRotation = child.rotation.clone();
        child.userData.initialPosition = child.position.clone();
        flowers.push(child);
      }

      if (child.name.includes("Backpack")) {
        backpack = child;
        child.userData.initialRotation = child.rotation.clone(); // store original rotation
        child.userData.initialPosition = child.position.clone(); // optional
      }



      if (child.name.includes('Mouse') || child.name.includes('Books') || child.name.includes('Camera') || child.name.includes('Rubix_Cube')) {
        child.userData.hoverScale = 1.5;
      } else if (child.name.includes('Backpack')) {
        child.userData.hoverScale = 1.2;
      } else {
        child.userData.hoverScale = 1.4; // default
      }


      if (child.name.includes('Raycaster')) {
        raycasterObjects.push(child);
      }

      if (child.name.includes('Computer')) {
        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        })
      }

      if (child.name.includes("Fan")) {
        if (child.name.includes("Fan_1") || child.name.includes("Fan_2")) {
          yAxisFans.push(child);
        }
      }

      if (child.name.includes("Animate")) {
        child.userData.initialScale = child.scale.clone();
        child.scale.set(0, 0, 0); // invisible

        let key;
        const nameParts = child.name.split('_');
        if (nameParts[1] === "Pointer") key = nameParts[2];
        else if (nameParts[1] === "Hanging") key = `Hanging_Plank_${nameParts[3]}_${nameParts[4]}`; // fixed
        else key = nameParts[1];

        animatedObjects[key] = child;
      }

      if (child.name.includes("Picture")) {

        const group = child.parent; // this is the frame+picture group
        group.userData.hoverType = "jump";
        group.userData.initialScale = group.scale.clone();
        group.userData.initialPosition = group.position.clone();
        group.userData.initialRotation = group.rotation.clone();

        raycasterObjects.push(group); // so hovering works on either

        const frameIndex = child.name.match(/Picture_(\d+)/)?.[1]; // e.g. "1", "2", "3"

        // pick your texture based on the frame index
        const imageTexture = textureLoader.load(`/images/frame_${frameIndex}.webp`);
        imageTexture.flipY = false;
        imageTexture.colorSpace = THREE.SRGBColorSpace;

        child.material = new THREE.MeshBasicMaterial({
          map: imageTexture
        });

        // optional: sharpen the texture look
        child.material.map.minFilter = THREE.LinearFilter;
      }

      // Your existing textureMap logic
      Object.keys(textureMap).forEach(key => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });

          child.material = material;

          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }
      });
    }
  });

  scene.add(glb.scene);
  // playIntroAnimation();
});

function playIntroAnimation() {
  const mainDuration = 1.5; // longer duration for smoothness
  const socialDuration = 1.2;
  const staggerMain = 0.3; // bigger stagger between objects
  const staggerSocial = 0.2;

  // Main timeline for other objects
  const t1 = gsap.timeline({
    defaults: { duration: mainDuration, ease: "back.out(1.6)" },
  });

  Object.entries(animatedObjects).forEach(([key, obj], index) => {
    if (!["Github", "Instagram", "Scholar", "LinkedIn"].includes(key)) {
      t1.fromTo(
        obj.scale,
        { x: 0, y: 0, z: 0 },
        { x: obj.userData.initialScale.x, y: obj.userData.initialScale.y, z: obj.userData.initialScale.z },
        index * staggerMain
      );
    }
  });

  // Separate timeline for social icons
  const t2 = gsap.timeline({
    defaults: { duration: socialDuration, ease: "back.out(2)" },
  });

  Object.entries(animatedObjects).forEach(([key, obj], index) => {
    if (["Github", "Instagram", "Scholar", "LinkedIn"].includes(key)) {
      t2.fromTo(
        obj.scale,
        { x: 0, y: 0, z: 0 },
        { x: obj.userData.initialScale.x, y: obj.userData.initialScale.y, z: obj.userData.initialScale.z },
        index * staggerSocial
      );
    }
  });
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


const controls = new OrbitControls(camera, renderer.domElement);

controls.minDistance = 7;
controls.maxDistance = 35;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = Math.PI;
controls.maxAzimuthAngle = -Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

//Set starting camera position
if (window.innerWidth < 768) {
  camera.position.set(
    -22.655035547043727,
    12.413063677755082,
    -22.563443353610793
  );
  controls.target.set(
    0.13963047308339835,
    2.7850734218738755,
    -0.13492116145836436
  );
} else {
  camera.position.set(-11.059719378477169, 8.219456455644604, -11.10326319514104);
  controls.target.set(
    -0.30901342006289345,
    3.4855197968636262,
    0.40605864397920005
  );
}

// event listeners
window.addEventListener('resize', () => {

  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // updating camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // updating renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

})

// Much darker lighting
const hemiLight = new THREE.HemisphereLight(0x444444, 0x111111, 0.2); // very dim ambient light
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.1); // barely noticeable directional light
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = true;
scene.add(dirLight);

// Optional: even darker background to match
scene.background = new THREE.Color(0x000000); // pure black




// replace old playHoverAnimation with this one
function playHoverAnimation(object, isHovering) {
  if (!object || !object.userData) return;

  // cancel any in-flight tweens targeting this object's props
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);
  if (object.material && object.material.color) gsap.killTweensOf(object.material.color);

  const hoverType = object.userData.hoverType;
  if (!hoverType) return; // skip if no hover type found


  // helper: restore original transform
  function restore() {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.25,
      ease: 'power2.out'
    });
    gsap.to(object.position, {
      x: object.userData.initialPosition.x,
      y: object.userData.initialPosition.y,
      z: object.userData.initialPosition.z,
      duration: 0.35,
      ease: 'power2.out'
    });
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x,
      y: object.userData.initialRotation.y,
      z: object.userData.initialRotation.z,
      duration: 0.35,
      ease: 'power2.out'
    });
    // restore color if we changed it
    if (object.material && object.material.color && object.userData.originalColor) {
      gsap.to(object.material.color, {
        r: object.userData.originalColor.r,
        g: object.userData.originalColor.g,
        b: object.userData.originalColor.b,
        duration: 0.25
      });
    }
  }

  if (!isHovering) {
    object.userData.rideHovered = false; // reset hover state so next hover can trigger again
    restore();
    return;
  }


  // Ensure original color saved if needed
  if (object.material && object.material.color && !object.userData.originalColor) {
    object.userData.originalColor = object.material.color.clone();
  }

  // Animation presets by hoverType
  switch (hoverType.toLowerCase()) {
    case 'guitar': {
      if (object.userData.guitarPlaying || object.userData.guitarCooldown) return;

      object.userData.guitarHovered = true;
      object.userData.guitarPlaying = true;

      const startRotationZ = object.rotation.z % (Math.PI * 2); // normalize
      const startY = object.position.y; // original Y
      const liftHeight = 0.5; // significant lift
      const spins = 2; // number of full Z spins

      const proxy = { angle: 0 }; // animate 0 → -2π * spins

      // temporarily remove from raycaster to avoid double triggers
      const idx = raycasterObjects.indexOf(object);
      if (idx !== -1) raycasterObjects.splice(idx, 1);

      gsap.to(proxy, {
        angle: -Math.PI * 2 * spins,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          // spin
          object.rotation.z = startRotationZ + proxy.angle;

          // smooth lift and drop using sine
          const progress = -proxy.angle / (Math.PI * 2 * spins); // 0 → 1
          object.position.y = startY + Math.sin(progress * Math.PI) * liftHeight;
        },
        onComplete: () => {
          // reset rotation & position
          object.rotation.z = startRotationZ;
          object.position.y = startY;

          object.userData.guitarPlaying = false;
          object.userData.guitarCooldown = true;

          setTimeout(() => {
            object.userData.guitarCooldown = false;
            object.userData.guitarHovered = false;

            if (!raycasterObjects.includes(object)) {
              raycasterObjects.push(object);
            }
            console.log("[guitar] spin finished, ready for next hover");
          }, 500);
        }
      });

      break;
    }


    case 'jump': {
      // Cancel any in-flight tweens
      gsap.killTweensOf(object.scale);

      // Use the custom hoverScale if defined
      const scaleFactor = object.userData.hoverScale || 1.4;

      gsap.to(object.scale, {
        x: object.userData.initialScale.x * scaleFactor,
        y: object.userData.initialScale.y * scaleFactor,
        z: object.userData.initialScale.z * scaleFactor,
        duration: 0.5,
        ease: "power2.out"
      });
      break;
    }

    case 'info':
      // simple pop (works for small icons)
      gsap.to(object.scale, { x: object.userData.initialScale.x * 1.25, y: object.userData.initialScale.y * 1.25, z: object.userData.initialScale.z * 1.25, duration: 0.35, ease: 'bounce.Out' });
      gsap.to(object.rotation, { x: object.userData.initialRotation.x - 0.12, duration: 0.35, ease: 'power2.out' });
      break;


    case 'ride': {
      if (object.userData.ridePlaying || object.userData.rideCooldown) return;

      object.userData.rideHovered = true;
      object.userData.ridePlaying = true;

      const startRotationZ = object.rotation.z % (Math.PI * 2); // normalize
      const startY = object.position.y; // original Y
      const liftHeight = 1; // how high it rises

      const proxy = { angle: 0 }; // animate 0 → -2π

      // temporarily remove from raycaster
      const idx = raycasterObjects.indexOf(object);
      if (idx !== -1) raycasterObjects.splice(idx, 1);

      gsap.to(proxy, {
        angle: -Math.PI * 2,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          // rotation
          object.rotation.z = startRotationZ + proxy.angle;

          // smooth Y lift using sine curve (0 → π)
          const progress = -proxy.angle / (2 * Math.PI); // 0 → 1
          object.position.y = startY + Math.sin(progress * Math.PI) * liftHeight;
        },
        onComplete: () => {
          // reset rotation and Y
          object.rotation.z = startRotationZ;
          object.position.y = startY;

          object.userData.ridePlaying = false;
          object.userData.rideCooldown = true;

          setTimeout(() => {
            object.userData.rideCooldown = false;
            object.userData.rideHovered = false;

            if (!raycasterObjects.includes(object)) {
              raycasterObjects.push(object);
            }
            console.log("[ride] spin finished, ready for next hover");
          }, 500);
        }
      });

      break;
    }

    case 'bowie': {
      if (!object.name.includes("Bowie_Cover")) return;
      if (object.userData.bowiePlaying || object.userData.bowieCooldown) return;

      object.userData.bowiePlaying = true;

      const vinyl = scene.getObjectByName("Bowie_Vinyl_Fourth_Raycaster_Hover_Bowie");
      const turntable = scene.getObjectByName("Vinyl_Player_Third");

      if (!vinyl || !turntable) return;

      // Store original position & rotation
      const vinylStartPos = vinyl.position.clone();
      const vinylStartRotY = vinyl.rotation.y;

      // Target position for vinyl above turntable
      const vinylTargetPos = turntable.position.clone().add(new THREE.Vector3(0, 0.05, 0));
      const preLift = 0.1;   // lift vinyl high to avoid obstacles
      const dropY = 0.05;     // how much it drops onto the turntable
      const liftAfterSpin = 0.5; // lift after spinning

      const timeline = gsap.timeline({
        onComplete: () => {
          object.userData.bowiePlaying = false;
          object.userData.bowieCooldown = true;
          setTimeout(() => { object.userData.bowieCooldown = false; }, 500);
        }
      });

      // 1. Pre-lift to avoid obstacles
      timeline.to(vinyl.position, {
        y: vinyl.position.y + preLift,
        duration: 0.5,
        ease: "power2.out"
      });

      // 2. Move horizontally above turntable (keep lifted)
      timeline.to(vinyl.position, {
        x: vinylTargetPos.x,
        z: vinylTargetPos.z,
        duration: 1.5,
        ease: "power2.inOut"
      });

      // 3. Drop vinyl down onto turntable (use dropY)
      timeline.to(vinyl.position, {
        y: vinylTargetPos.y - dropY,
        duration: 0.5,
        ease: "power2.in"
      });

      // 4. Spin vinyl along Y-axis while on turntable
      timeline.to(vinyl.rotation, {
        y: vinylStartRotY + Math.PI * 3,
        duration: 5,
        ease: "none"
      });

      // 5. Lift vinyl back up slightly after spin
      timeline.to(vinyl.position, {
        y: vinylTargetPos.y + liftAfterSpin,
        duration: 0.5,
        ease: "power2.out"
      });

      // 6. Return vinyl to original position
      timeline.to(vinyl.position, {
        x: vinylStartPos.x,
        y: vinylStartPos.y,
        z: vinylStartPos.z,
        duration: 1.5,
        ease: "power2.inOut"
      });

      // 7. Reset vinyl rotation
      timeline.to(vinyl.rotation, {
        y: vinylStartRotY,
        duration: 0.5,
        ease: "power2.inOut"
      }, "<");

      break;
    }

    case 'vinyls': {
      if (object.userData.vinylPlaying || object.userData.vinylCooldown) return;

      object.userData.vinylPlaying = true;

      const startX = object.position.x;
      const offsetX = -0.3; // how far it moves on X-axis

      const timeline = gsap.timeline({
        onComplete: () => {
          object.userData.vinylPlaying = false;
          object.userData.vinylCooldown = true;
          setTimeout(() => { object.userData.vinylCooldown = false; }, 100);
        }
      });

      // Move vinyl along X and return
      timeline.to(object.position, {
        x: startX + offsetX,
        duration: 0.4,
        ease: "power2.out"
      }).to(object.position, {
        x: startX,
        duration: 0.4,
        ease: "power2.in"
      });

      break;
    }


    default:
      // default gentle pop + settle
      gsap.to(object.scale, { y: object.userData.initialScale.y * 1.5, duration: 0.35, ease: 'power2.out' });
      break;
  }
}

function animateKey(object) {
  if (object.userData.keyPlaying) return;

  object.userData.keyPlaying = true;
  const originalY = object.userData.initialPosition.y;
  const pressDepth = 0.05;

  const tl = gsap.timeline({
    onComplete: () => { object.userData.keyPlaying = false; }
  });

  tl.to(object.position, { y: originalY - pressDepth, duration: 0.1, ease: "power2.out" })
    .to(object.position, { y: originalY, duration: 0.1, ease: "power2.out" });
}

const render = (timestamp) => {

  controls.update();

  // console.log(camera.position);
  // console.log("000000000");
  // console.log(controls.target);

  // animating fans
  yAxisFans.forEach((fan) => {
    fan.rotation.y += 0.02;
  })

  if (chair) {
    const time = timestamp * 0.001;
    const baseAmplitude = Math.PI / 8;

    const rotationOffset =
      baseAmplitude *
      Math.sin(time * 0.5) *
      (1 - Math.abs(Math.sin(time * 0.5)) * 0.3);

    chair.rotation.y = chair.userData.initialRotation.y + rotationOffset;
  }


  if (flowers.length > 0) {
    const time = timestamp * 0.001; // seconds
    const maxAngle = Math.PI / 2; // 90 degrees in radians
    const speedFactor = 0.3; // smaller = slower

    const angle = Math.sin(time * speedFactor) * maxAngle; // single value for all flowers

    flowers.forEach((flower) => {
      // synchronized oscillation along Y
      flower.rotation.y = flower.userData.initialRotation.y + angle;

      // keep other rotations and positions intact
      flower.rotation.x = flower.userData.initialRotation.x;
      flower.rotation.z = flower.userData.initialRotation.z;
      flower.position.y = flower.userData.initialPosition.y;
    });
  }

  if (backpack) {
    const time = timestamp * 0.001; // seconds
    const maxAngle = Math.PI / 30; // 20 degrees in radians
    const speedFactor = 1; // controls speed

    // oscillate between -maxAngle and +maxAngle
    backpack.rotation.x = backpack.userData.initialRotation.x + Math.sin(time * speedFactor) * maxAngle;

    // keep Y and Z rotation intact
    backpack.rotation.y = backpack.userData.initialRotation.y;
    backpack.rotation.z = backpack.userData.initialRotation.z;
  }

  if (!isModalOpen) {

    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    currentIntersects = raycaster.intersectObjects(raycasterObjects);

    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;

      // find the hover root
      const hoverRoot = currentIntersectObject.userData.hoverType
        ? currentIntersectObject
        : (currentIntersectObject.parent && currentIntersectObject.parent.userData.hoverType
          ? currentIntersectObject.parent
          : currentIntersectObject);

      // Check if hoverRoot is the Bowie cover
      const isBowieCover = hoverRoot.name.includes("Bowie_Cover");
      const isBowieVinyl = hoverRoot.name.includes("Bowie_Vinyl");

      // Only update hover if it's not the vinyl
      if (!isBowieVinyl) {
        if (!currentHoveredObject || hoverRoot.uuid !== currentHoveredObject.uuid) {
          if (currentHoveredObject && !currentHoveredObject.userData.bowiePlaying) {
            playHoverAnimation(currentHoveredObject, false);
          }

          playHoverAnimation(hoverRoot, true);
          currentHoveredObject = hoverRoot;
        }
      }

      // cursor
      document.body.style.cursor = hoverRoot.name.includes('Pointer') ? 'pointer' : 'default';
    } else {
      if (currentHoveredObject && !currentHoveredObject.userData.bowiePlaying) {
        playHoverAnimation(currentHoveredObject, false);
      }
      currentHoveredObject = null;
      document.body.style.cursor = "default";
    }
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
};

render()