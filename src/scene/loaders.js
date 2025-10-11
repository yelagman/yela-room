import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Sets up all Three.js loaders:
 * - DRACO, GLTF, and Texture loaders
 * - Loads all texture maps (day variants)
 * - Creates video texture for the "frog" video
 * Preserves all paths, color spaces, and properties exactly.
 */
export function initLoaders(manager) {
  // --- TEXTURE LOADER ---
  const textureLoader = new THREE.TextureLoader();

  // --- DRACO LOADER ---
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/");

  // --- GLTF LOADER ---
  const gltfLoader = new GLTFLoader(manager);
  gltfLoader.setDRACOLoader(dracoLoader);

  // --- TEXTURE MAPS (identical to your old structure) ---
  const textureMap = {
    First: {
      day: "textures/first_texture_set.webp",
    },
    Second: {
      day: "textures/second_texture_set.webp",
    },
    Third: {
      day: "textures/third_texture_set.webp",
    },
    Fourth: {
      day: "textures/fourth_texture_set.webp",
    },
    Fifth: {
      day: "textures/fifth_texture_set.webp",
    },
    Sixth: {
      day: "textures/sixth_texture_set.webp",
    },
  };

  const loadedTextures = { day: {} };

  Object.entries(textureMap).forEach(([key, paths]) => {
    const dayTexture = textureLoader.load(paths.day);
    dayTexture.flipY = false;
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTextures.day[key] = dayTexture;
  });

  // --- VIDEO TEXTURE ---
  const videoElement = document.createElement("video");
  videoElement.src = "video/frog.mp4";
  videoElement.loop = true;
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.play();

  const videoTexture = new THREE.VideoTexture(videoElement);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.flipY = false;

  // Return everything ready to use
  return {
    gltfLoader,
    textureLoader,
    loadedTextures,
    videoTexture,
    textureMap,
  };
}
