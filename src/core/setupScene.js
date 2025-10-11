import * as THREE from "three";
import { OrbitControls } from "../utils/OrbitControls.js";

export function setupScene() {
  const canvas = document.querySelector("#experience-canvas");
  if (!canvas) {
    console.error("❌ Could not find #experience-canvas in the DOM!");
  }

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });

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

  // Initial camera position
  if (window.innerWidth < 768) {
    camera.position.set(-22.65, 12.41, -22.56);
    controls.target.set(0.14, 2.78, -0.13);
  } else {
    camera.position.set(-11.06, 8.22, -11.10);
    controls.target.set(-0.31, 3.49, 0.41);
  }

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0x444444, 0x111111, 0.2);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.1);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  scene.background = new THREE.Color(0x000000);

  return { scene, camera, renderer, controls, canvas, sizes };
}
