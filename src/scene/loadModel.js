// src/scene/loadModel.js
import * as THREE from "three";

/**
 * Optimized GLB loading that preserves ALL interactive logic:
 * - Hover targets & scale rules
 * - Chair / Flowers / Backpack refs
 * - Fans rotation lists
 * - Animated_* groups (incl. Hanging_Plank_* keys)
 * - Picture frames (deferred image textures)
 * - Texture set assignment (First..Sixth), with deferred non-critical loads
 * - Computer video screen
 *
 * Perf changes:
 * - Collect meshes in arrays first; assign heavy textures in requestIdleCallback (or setTimeout fallback)
 * - Apply only already-loaded textures synchronously; defer the rest
 * - Keep MeshBasicMaterial to avoid tone mapping cost
 */
export function loadModel({
  gltfLoader,
  scene,
  textureLoader,
  loadedTextures,   // { day: { First, Second, ... } }
  textureMap,       // { First: { day: '...' }, ... }  (your existing shape)
  videoTexture,
  yAxisFans,
  raycasterObjects,
  animatedObjects,
  setRefs,
}) {
  const defer =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? window.requestIdleCallback
      : (cb) => setTimeout(cb, 0);

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      "models/Room_Portfolio.glb",
      (glb) => {
        const root = glb.scene;

        // Refs
        let chair = null;
        const flowers = [];
        let backpack = null;

        // Batch collections for deferred work
        const pictureFrameMeshes = [];                 // [{ mesh, frameIndex }]
        const textureSetMeshesByKey = new Map();       // key -> Mesh[]

        // Helper to collect texture-set meshes
        const addTextureSetMesh = (key, mesh) => {
          if (!textureSetMeshesByKey.has(key)) textureSetMeshesByKey.set(key, []);
          textureSetMeshesByKey.get(key).push(mesh);
        };

        // --- First pass: wire up behavior, collect targets, keep light on main thread
        root.traverse((child) => {
          if (!child.isMesh) return;

          // --- Hover setup (unchanged)
          if (child.name.includes("Hover")) {
            child.userData.initialScale = child.scale.clone();
            child.userData.initialPosition = child.position.clone();
            child.userData.initialRotation = child.rotation.clone();

            const hoverMatch = child.name.match(/Hover_(.+)/i);
            child.userData.hoverType = hoverMatch ? hoverMatch[1].toLowerCase() : null;
          }

          // --- Chair
          if (child.name.includes("Chair")) {
            chair = child;
            child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
          }

          // --- Flowers
          if (child.name.includes("Flower")) {
            child.userData.initialRotation = child.rotation.clone();
            child.userData.initialPosition = child.position.clone();
            flowers.push(child);
          }

          // --- Backpack
          if (child.name.includes("Backpack")) {
            backpack = child;
            child.userData.initialRotation = child.rotation.clone();
            child.userData.initialPosition = child.position.clone();
          }

          // --- Hover scale rules (unchanged)
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

          // --- Raycaster objects
          if (child.name.includes("Raycaster")) {
            raycasterObjects.push(child);
          }

          // --- Computer video screen
          if (child.name.includes("Computer")) {
            child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
          }

          // --- Fans
          if (child.name.includes("Fan")) {
            if (child.name.includes("Fan_1") || child.name.includes("Fan_2")) {
              yAxisFans.push(child);
            }
          }

          // --- Animated (hidden at start), incl. Hanging_Plank_*
          if (child.name.includes("Animate")) {
            child.userData.initialScale = child.scale.clone();
            child.scale.set(0, 0, 0);

            let key;
            const parts = child.name.split("_");
            if (parts[1] === "Pointer") key = parts[2];
            else if (parts[1] === "Hanging") key = `Hanging_Plank_${parts[3]}_${parts[4]}`;
            else key = parts[1];

            animatedObjects[key] = child;
          }

          // --- Picture frames (collect and defer texture decode)
          if (child.name.includes("Picture")) {
            const group = child.parent;
            group.userData.hoverType = "jump";
            group.userData.initialScale = group.scale.clone();
            group.userData.initialPosition = group.position.clone();
            group.userData.initialRotation = group.rotation.clone();

            raycasterObjects.push(group);

            const frameIndex = child.name.match(/Picture_(\d+)/)?.[1];
            if (frameIndex) {
              pictureFrameMeshes.push({ mesh: child, frameIndex });
            }
          }

          // --- Texture sets (First, Second, etc.)
          // Apply only textures that are ALREADY present in loadedTextures.day (critical set).
          Object.keys(textureMap).forEach((key) => {
            if (child.name.includes(key)) {
              const alreadyLoaded = loadedTextures?.day?.[key];
              if (alreadyLoaded) {
                const material = new THREE.MeshBasicMaterial({ map: alreadyLoaded });
                material.map.minFilter = THREE.LinearFilter;
                child.material = material;
              } else {
                // Defer loading non-critical sets
                addTextureSetMesh(key, child);
              }
            }
          });
        });

        // Add to scene immediately (fast first paint)
        scene.add(root);

        // Return refs
        if (setRefs) setRefs({ chair, flowers, backpack });

        // --- Deferred work: picture frame images (offscreen) ---
        defer(() => {
          // Load in small batches to avoid long tasks
          const batch = 4;
          let i = 0;

          const loadNextBatch = () => {
            const end = Math.min(i + batch, pictureFrameMeshes.length);
            for (; i < end; i++) {
              const { mesh, frameIndex } = pictureFrameMeshes[i];
              const imageTexture = textureLoader.load(`images/frame_${frameIndex}.webp`, (tex) => {
                tex.flipY = false;
                tex.colorSpace = THREE.SRGBColorSpace;
                const mat = new THREE.MeshBasicMaterial({ map: tex });
                mat.map.minFilter = THREE.LinearFilter;
                mesh.material = mat;
              });
            }
            if (i < pictureFrameMeshes.length) defer(loadNextBatch);
          };

          if (pictureFrameMeshes.length) loadNextBatch();
        });

        // --- Deferred work: non-critical texture sets ---
        defer(() => {
          textureSetMeshesByKey.forEach((meshes, key) => {
            // If texture became available (lazy loaded earlier), use it; otherwise load now.
            const useOrLoadTexture = (done) => {
              const preloaded = loadedTextures?.day?.[key];
              if (preloaded) return done(preloaded);

              // Load from your textureMap path (day variant)
              const path = textureMap[key]?.day || textureMap[key]; // support both shapes
              const tex = textureLoader.load(path, (t) => {
                t.flipY = false;
                t.colorSpace = THREE.SRGBColorSpace;
                loadedTextures.day[key] = t; // cache for reuse
                done(t);
              });
            };

            useOrLoadTexture((tex) => {
              // Assign in small batches
              const batch = 8;
              let j = 0;
              const applyBatch = () => {
                const end = Math.min(j + batch, meshes.length);
                for (; j < end; j++) {
                  const m = meshes[j];
                  const mat = new THREE.MeshBasicMaterial({ map: tex });
                  mat.map.minFilter = THREE.LinearFilter;
                  m.material = mat;
                }
                if (j < meshes.length) defer(applyBatch);
              };
              applyBatch();
            });
          });
        });

        resolve(root);
      },
      undefined,
      (error) => reject(error)
    );
  });
}
