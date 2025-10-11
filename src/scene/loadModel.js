import * as THREE from "three";

/**
 * Loads your main GLB scene and sets up all interactive meshes.
 * Preserves all traversal logic, naming rules, and texture applications exactly.
 */
export function loadModel({
  gltfLoader,
  scene,
  textureLoader,
  loadedTextures,
  textureMap,
  videoTexture,
  yAxisFans,
  raycasterObjects,
  animatedObjects,
  setRefs, // callback to store refs like chair, flowers, backpack
}) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      "models/Room_Portfolio.glb",
      (glb) => {
        let chair = null;
        const flowers = [];
        let backpack = null;

        glb.scene.traverse((child) => {
          if (!child.isMesh) return;

          // --- Hover setup ---
          if (child.name.includes("Hover")) {
            child.userData.initialScale = child.scale.clone();
            child.userData.initialPosition = child.position.clone();
            child.userData.initialRotation = child.rotation.clone();

            const hoverMatch = child.name.match(/Hover_(.+)/i);
            child.userData.hoverType = hoverMatch
              ? hoverMatch[1].toLowerCase()
              : null;
          }

          // --- Chair ---
          if (child.name.includes("Chair")) {
            chair = child;
            child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
          }

          // --- Flowers ---
          if (child.name.includes("Flower")) {
            child.userData.initialRotation = child.rotation.clone();
            child.userData.initialPosition = child.position.clone();
            flowers.push(child);
          }

          // --- Backpack ---
          if (child.name.includes("Backpack")) {
            backpack = child;
            child.userData.initialRotation = child.rotation.clone();
            child.userData.initialPosition = child.position.clone();
          }

          // --- Hover scale rules ---
          if (
            child.name.includes("Mouse") ||
            child.name.includes("Books") ||
            child.name.includes("Camera") ||
            child.name.includes("Rubix_Cube")
          ) {
            child.userData.hoverScale = 1.5;
          } else if (child.name.includes("Backpack")) {
            child.userData.hoverScale = 1.2;
          } else {
            child.userData.hoverScale = 1.4;
          }

          // --- Raycaster objects ---
          if (child.name.includes("Raycaster")) {
            raycasterObjects.push(child);
          }

          // --- Computer screen video texture ---
          if (child.name.includes("Computer")) {
            child.material = new THREE.MeshBasicMaterial({
              map: videoTexture,
            });
          }

          // --- Fans ---
          if (child.name.includes("Fan")) {
            if (child.name.includes("Fan_1") || child.name.includes("Fan_2")) {
              yAxisFans.push(child);
            }
          }

          // --- Animated (hidden at start) ---
          if (child.name.includes("Animate")) {
            child.userData.initialScale = child.scale.clone();
            child.scale.set(0, 0, 0);

            let key;
            const parts = child.name.split("_");
            if (parts[1] === "Pointer") key = parts[2];
            else if (parts[1] === "Hanging")
              key = `Hanging_Plank_${parts[3]}_${parts[4]}`;
            else key = parts[1];

            animatedObjects[key] = child;
          }

          // --- Picture frames ---
          if (child.name.includes("Picture")) {
            const group = child.parent;
            group.userData.hoverType = "jump";
            group.userData.initialScale = group.scale.clone();
            group.userData.initialPosition = group.position.clone();
            group.userData.initialRotation = group.rotation.clone();

            raycasterObjects.push(group);

            const frameIndex = child.name.match(/Picture_(\d+)/)?.[1];
            const imageTexture = textureLoader.load(
              `images/frame_${frameIndex}.webp`
            );
            imageTexture.flipY = false;
            imageTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({ map: imageTexture });
            child.material.map.minFilter = THREE.LinearFilter;
          }

          // --- Texture sets (First, Second, etc.) ---
          Object.keys(textureMap).forEach((key) => {
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
        });

        scene.add(glb.scene);

        if (setRefs) setRefs({ chair, flowers, backpack });
        resolve(glb.scene);
      },
      undefined,
      (error) => reject(error)
    );
  });
}
