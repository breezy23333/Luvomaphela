/* global THREE */
"use strict";

(() => {
  const $ = (id) => document.getElementById(id);

  function showError(message) {
    $("start-screen").hidden = true;
    $("pause-screen").hidden = true;
    $("error-screen").hidden = false;
    $("error-message").textContent = message;
  }

  if (typeof THREE === "undefined") {
    showError("Three.js could not load. Check your connection and reload.");
    return;
  }

  try {
    startGame();
  } catch (error) {
    console.error(error);
    showError("The game could not start. " + error.message);
  }

  function startGame() {
    // ---------------------------------
    // SCENE
    // ---------------------------------

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9dd7ef);
    scene.fog = new THREE.Fog(0x9dd7ef, 90, 310);

    const camera = new THREE.PerspectiveCamera(
      75,
      innerWidth / innerHeight,
      0.1,
      600
    );

    camera.rotation.order = "YXZ";

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputEncoding = THREE.sRGBEncoding;

    $("game-container").appendChild(renderer.domElement);

    const canvas = renderer.domElement;

    scene.add(new THREE.HemisphereLight(0xdcefff, 0x647748, 0.9));

    const sun = new THREE.DirectionalLight(0xffedc9, 0.95);
    sun.position.set(80, 120, 40);
    scene.add(sun);

    // ---------------------------------
    // MATERIALS
    // ---------------------------------

    const materials = {
      grass: new THREE.MeshLambertMaterial({ color: 0x78ae4a }),
      dirt: new THREE.MeshLambertMaterial({ color: 0x956744 }),
      stone: new THREE.MeshLambertMaterial({ color: 0x939b9c }),
      wood: new THREE.MeshLambertMaterial({ color: 0x795333 }),
      leaf: new THREE.MeshLambertMaterial({ color: 0x4d913d }),
      water: new THREE.MeshLambertMaterial({
        color: 0x479fd2,
        transparent: true,
        opacity: 0.7,
        depthWrite: false
      })
    };

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const grassFaces = [
      materials.dirt,
      materials.dirt,
      materials.grass,
      materials.dirt,
      materials.dirt,
      materials.dirt
    ];

    // ---------------------------------
    // TERRAIN
    // ---------------------------------

    function hash(x, z) {
      const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
      return value - Math.floor(value);
    }

    function noise(x, z) {
      const ix = Math.floor(x);
      const iz = Math.floor(z);
      let fx = x - ix;
      let fz = z - iz;

      fx = fx * fx * (3 - 2 * fx);
      fz = fz * fz * (3 - 2 * fz);

      const a = THREE.MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), fx);
      const b = THREE.MathUtils.lerp(
        hash(ix, iz + 1),
        hash(ix + 1, iz + 1),
        fx
      );

      return THREE.MathUtils.lerp(a, b, fz);
    }

    function fbm(x, z) {
      let total = 0;
      let amplitude = 1;
      let frequency = 0.02;
      let weight = 0;

      for (let i = 0; i < 5; i++) {
        total += noise(x * frequency, z * frequency) * amplitude;
        weight += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }

      return total / weight;
    }

    function terrainHeight(x, z) {
      return (
        fbm(x, z) * 12 +
        Math.pow(fbm(x + 999, z - 222), 2.1) * 55
      );
    }

    const WORLD_SIZE = 400;
    const SEGMENTS = 200;
    const HALF = WORLD_SIZE / 2;
    const CELL = WORLD_SIZE / SEGMENTS;
    const WATER_LEVEL = 6;

    const terrainGeometry = new THREE.PlaneGeometry(
      WORLD_SIZE,
      WORLD_SIZE,
      SEGMENTS,
      SEGMENTS
    );

    terrainGeometry.rotateX(-Math.PI / 2);

    const positions = terrainGeometry.attributes.position;
    const heights = new Float32Array(positions.count);
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const height = terrainHeight(x, z);

      heights[i] = height;
      positions.setY(i, height);

      const color = new THREE.Color(
        height < 8 ? 0xc3b986 : height > 35 ? 0x929b88 : 0x73a94c
      );

      color.multiplyScalar(0.9 + hash(x, z) * 0.16);
      color.toArray(colors, i * 3);
    }

    terrainGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    terrainGeometry.computeVertexNormals();

    const terrain = new THREE.Mesh(
      terrainGeometry,
      new THREE.MeshLambertMaterial({ vertexColors: true })
    );

    scene.add(terrain);

    // Match collision height to the actual terrain triangles.
    function groundHeight(x, z) {
      const gx = THREE.MathUtils.clamp((x + HALF) / CELL, 0, SEGMENTS);
      const gz = THREE.MathUtils.clamp((z + HALF) / CELL, 0, SEGMENTS);

      const ix = Math.min(Math.floor(gx), SEGMENTS - 1);
      const iz = Math.min(Math.floor(gz), SEGMENTS - 1);
      const u = gx - ix;
      const v = gz - iz;
      const stride = SEGMENTS + 1;

      const a = heights[iz * stride + ix];
      const b = heights[(iz + 1) * stride + ix];
      const c = heights[(iz + 1) * stride + ix + 1];
      const d = heights[iz * stride + ix + 1];

      return u + v <= 1
        ? a + (d - a) * u + (b - a) * v
        : c + (b - c) * (1 - u) + (d - c) * (1 - v);
    }

    const lake = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
      materials.water
    );

    lake.rotation.x = -Math.PI / 2;
    lake.position.y = WATER_LEVEL;
    scene.add(lake);

    // ---------------------------------
    // BLOCKS AND TREES
    // ---------------------------------

    const blocks = new Map();
    let selectedBlock = "grass";
    let placedCount = 0;

    const blockKey = (x, y, z) => `${x},${y},${z}`;

    function addBlock(x, y, z, type, placed = false) {
      const key = blockKey(x, y, z);
      if (blocks.has(key)) return null;

      const mesh = new THREE.Mesh(
        cubeGeometry,
        type === "grass" ? grassFaces : materials[type]
      );

      mesh.position.set(x, y, z);
      mesh.userData = { key, type, placed };
      blocks.set(key, mesh);
      scene.add(mesh);

      if (placed) placedCount++;
      return mesh;
    }

    function removeBlock(mesh) {
      if (mesh.userData.placed) placedCount--;
      blocks.delete(mesh.userData.key);
      scene.remove(mesh);

      // Geometry and materials are shared: do not dispose them here.
    }

    for (let i = 0; i < 85; i++) {
      const x = Math.round((hash(i + 12, 71) - 0.5) * 340);
      const z = Math.round((hash(83, i + 42) - 0.5) * 340);
      const ground = groundHeight(x, z);

      if (ground < WATER_LEVEL + 1 || Math.hypot(x, z - 20) < 9) {
        continue;
      }

      const base = Math.ceil(ground);
      const trunkHeight = 4 + Math.floor(hash(x, z) * 3);

      for (let y = 0; y < trunkHeight; y++) {
        addBlock(x, base + y, z, "wood");
      }

      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          for (let dy = -1; dy <= 2; dy++) {
            if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) <= 4) {
              addBlock(x + dx, base + trunkHeight + dy, z + dz, "leaf");
            }
          }
        }
      }
    }

    // ---------------------------------
    // PLAYER AND COLLISION
    // ---------------------------------

    const player = {
      position: new THREE.Vector3(),
      height: 1.75,
      eye: 1.6,
      radius: 0.3,
      velocityY: 0,
      grounded: false
    };

    let yaw = 0;
    let pitch = -0.08;
    let locked = false;
    let started = false;
    let ready = false;
    let jumpRequested = false;

    const keys = new Set();

    function overlapsBlock(position, x, y, z) {
      const epsilon = 0.0001;

      return (
        position.x + player.radius > x - 0.5 + epsilon &&
        position.x - player.radius < x + 0.5 - epsilon &&
        position.z + player.radius > z - 0.5 + epsilon &&
        position.z - player.radius < z + 0.5 - epsilon &&
        position.y + player.height > y - 0.5 + epsilon &&
        position.y < y + 0.5 - epsilon
      );
    }

    function collides(position) {
      for (
        let x = Math.floor(position.x - player.radius - 0.5);
        x <= Math.ceil(position.x + player.radius + 0.5);
        x++
      ) {
        for (
          let z = Math.floor(position.z - player.radius - 0.5);
          z <= Math.ceil(position.z + player.radius + 0.5);
          z++
        ) {
          for (
            let y = Math.floor(position.y - 0.5);
            y <= Math.ceil(position.y + player.height + 0.5);
            y++
          ) {
            if (
              blocks.has(blockKey(x, y, z)) &&
              overlapsBlock(position, x, y, z)
            ) {
              return true;
            }
          }
        }
      }

      return false;
    }

    function floorAt(x, z) {
      const r = player.radius;

      return Math.max(
        WATER_LEVEL,
        groundHeight(x - r, z - r),
        groundHeight(x + r, z - r),
        groundHeight(x - r, z + r),
        groundHeight(x + r, z + r)
      );
    }

    function updateCamera() {
      camera.position.copy(player.position);
      camera.position.y += player.eye;
      camera.rotation.set(pitch, yaw, 0, "YXZ");
      camera.updateMatrixWorld();
    }

    function respawn() {
      player.position.set(0, floorAt(0, 20) + 0.02, 20);

      // Find free space if the player built over the spawn point.
      while (collides(player.position) && player.position.y < 150) {
        player.position.y += 1;
      }

      player.velocityY = 0;
      player.grounded = false;
      yaw = 0;
      pitch = -0.08;
      keys.clear();
      updateCamera();
    }

    const candidate = new THREE.Vector3();

    function moveHorizontal(axis, distance) {
      if (!distance) return;

      candidate.copy(player.position);
      candidate[axis] += distance;
      candidate[axis] = THREE.MathUtils.clamp(
        candidate[axis],
        -HALF + 2,
        HALF - 2
      );

      const floor = floorAt(candidate.x, candidate.z);
      const rise = floor - player.position.y;

      if (rise > 0) {
        if (!player.grounded || rise > 0.45) return;
        candidate.y = floor;
      }

      if (!collides(candidate)) player.position.copy(candidate);
    }

    function updatePlayer(dt) {
      let sideways = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));
      let forward = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));

      const length = Math.hypot(sideways, forward);

      if (length > 0) {
        sideways /= length;
        forward /= length;
      }

      const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 7 : 4.5;

      const dx = (
        Math.cos(yaw) * sideways - Math.sin(yaw) * forward
      ) * speed * dt;

      const dz = (
        -Math.sin(yaw) * sideways - Math.cos(yaw) * forward
      ) * speed * dt;

      if (jumpRequested && player.grounded) {
        player.velocityY = 7.8;
        player.grounded = false;
      }

      jumpRequested = false;

      // Short physics steps prevent passing through blocks.
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const step = dt / steps;

      for (let i = 0; i < steps; i++) {
        moveHorizontal("x", dx / steps);
        moveHorizontal("z", dz / steps);

        player.velocityY = Math.max(-30, player.velocityY - 22 * step);

        const deltaY = player.velocityY * step;
        candidate.copy(player.position);
        candidate.y += deltaY;

        player.grounded = false;

        if (collides(candidate)) {
          // Move as close as possible to the surface we hit.
          let low = 0;
          let high = 1;

          for (let iteration = 0; iteration < 10; iteration++) {
            const middle = (low + high) / 2;
            candidate.copy(player.position);
            candidate.y += deltaY * middle;

            if (collides(candidate)) high = middle;
            else low = middle;
          }

          player.position.y += deltaY * low;
          player.grounded = deltaY < 0;
          player.velocityY = 0;
        } else {
          player.position.copy(candidate);
        }

        const floor = floorAt(player.position.x, player.position.z);

        if (player.position.y <= floor) {
          player.position.y = floor;
          player.velocityY = 0;
          player.grounded = true;
        }
      }

      updateCamera();
    }

    // ---------------------------------
    // MENUS AND POINTER LOCK
    // ---------------------------------

    let messageTimer;

    function message(value) {
      clearTimeout(messageTimer);
      $("game-message").textContent = value;
      messageTimer = setTimeout(() => {
        $("game-message").textContent = "";
      }, 3500);
    }

    function closeHelp() {
      $("controls-panel").hidden = true;
      $("help-button").setAttribute("aria-expanded", "false");
    }

    function syncUI() {
      $("start-screen").hidden = started;
      $("pause-screen").hidden = !started || locked;

      ["game-hud", "hotbar", "block-label"].forEach((id) => {
        $(id).hidden = !started;
      });

      $("crosshair").hidden = !locked;
      outline.visible = false;
    }

    function lockFailure() {
      message("Mouse capture failed. Click Enter world or Resume to try again.");
    }

    function requestPlay() {
      if (!ready) return;

      if (!canvas.requestPointerLock) {
        message("This browser does not support mouse capture. Use a desktop browser.");
        return;
      }

      closeHelp();

      try {
        const request = canvas.requestPointerLock();
        if (request && request.catch) request.catch(lockFailure);
      } catch {
        lockFailure();
      }
    }

    function pauseGame() {
      keys.clear();
      jumpRequested = false;

      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    }

    document.addEventListener("pointerlockchange", () => {
      locked = document.pointerLockElement === canvas;
      if (locked) started = true;
      keys.clear();
      jumpRequested = false;
      syncUI();
    });

    document.addEventListener("pointerlockerror", lockFailure);

    $("play-button").addEventListener("click", requestPlay);
    $("resume-button").addEventListener("click", requestPlay);
    $("pause-button").addEventListener("click", pauseGame);

    $("respawn-button").addEventListener("click", () => {
      respawn();
      requestPlay();
    });

    $("help-button").addEventListener("click", () => {
      const opening = $("controls-panel").hidden;
      if (opening) pauseGame();

      $("controls-panel").hidden = !opening;
      $("help-button").setAttribute("aria-expanded", String(opening));
    });

    $("close-help-button").addEventListener("click", closeHelp);

    window.addEventListener("blur", pauseGame);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseGame();
    });

    document.addEventListener("mousemove", (event) => {
      if (!locked) return;

      yaw -= event.movementX * 0.002;
      pitch = THREE.MathUtils.clamp(
        pitch - event.movementY * 0.002,
        -Math.PI / 2 + 0.03,
        Math.PI / 2 - 0.03
      );

      updateCamera();
    });

    // ---------------------------------
    // HOTBAR AND KEYBOARD
    // ---------------------------------

    const slots = [...document.querySelectorAll(".slot")];
    const types = ["grass", "stone", "dirt", "water", "wood"];

    function selectBlock(type) {
      if (!types.includes(type)) return;
      selectedBlock = type;

      slots.forEach((slot) => {
        const active = slot.dataset.block === type;
        slot.classList.toggle("selected", active);
        slot.setAttribute("aria-pressed", String(active));
      });

      $("selected-block-name").textContent =
        type[0].toUpperCase() + type.slice(1);
    }

    slots.forEach((slot) => {
      slot.addEventListener("click", () => selectBlock(slot.dataset.block));
    });

    document.addEventListener("keydown", (event) => {
      if (!locked) return;

      if ([
        "KeyW", "KeyA", "KeyS", "KeyD", "Space",
        "ShiftLeft", "ShiftRight", "KeyH", "KeyP"
      ].includes(event.code)) {
        event.preventDefault();
      }

      keys.add(event.code);

      if (event.code === "Space" && !event.repeat) {
        jumpRequested = true;
      }

      const digit = /^Digit([1-5])$/.exec(event.code);
      if (digit) selectBlock(types[Number(digit[1]) - 1]);

      if (event.code === "KeyP") pauseGame();

      if (event.code === "KeyH" && !event.repeat) {
        pauseGame();
        $("controls-panel").hidden = false;
        $("help-button").setAttribute("aria-expanded", "true");
      }
    });

    document.addEventListener("keyup", (event) => {
      keys.delete(event.code);
    });

    canvas.addEventListener("wheel", (event) => {
      if (!locked) return;
      event.preventDefault();

      const index = types.indexOf(selectedBlock);
      const direction = event.deltaY > 0 ? 1 : -1;
      selectBlock(types[(index + direction + types.length) % types.length]);
    }, { passive: false });

    // ---------------------------------
    // BUILDING AND MINING
    // ---------------------------------

    const raycaster = new THREE.Raycaster();
    raycaster.far = 8;
    const screenCenter = new THREE.Vector2();

    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.015, 1.015, 1.015)),
      new THREE.LineBasicMaterial({ color: 0xf4ffbb })
    );

    outline.visible = false;
    scene.add(outline);

    function aim() {
      camera.updateMatrixWorld();
      raycaster.setFromCamera(screenCenter, camera);

      const nearby = [];

      for (const block of blocks.values()) {
        if (block.position.distanceToSquared(camera.position) < 110) {
          nearby.push(block);
        }
      }

      // Find the nearest hit, including terrain, to avoid building through hills.
      const hits = raycaster.intersectObjects([terrain, ...nearby], false);
      return hits[0] || null;
    }

    function build(event) {
      if (!locked || (event.button !== 0 && event.button !== 2)) return;
      if (event.target.closest?.("button, a")) return;

      event.preventDefault();

      const hit = aim();
      if (!hit) return;

      const hitTerrain = hit.object === terrain;

      if (event.button === 2) {
        if (hitTerrain) {
          message("The landscape is fixed. You can remove trees and placed blocks.");
        } else {
          removeBlock(hit.object);
        }
        return;
      }

      if (placedCount >= 2500) {
        message("Building limit reached. Remove some placed blocks first.");
        return;
      }

      let x;
      let y;
      let z;

      if (hitTerrain) {
        x = Math.round(hit.point.x);
        z = Math.round(hit.point.z);

        // Keep the block base above the nearby terrain surface.
        const surface = Math.max(
          groundHeight(x - 0.5, z - 0.5),
          groundHeight(x + 0.5, z - 0.5),
          groundHeight(x - 0.5, z + 0.5),
          groundHeight(x + 0.5, z + 0.5)
        );

        y = Math.ceil(surface + 0.5);
      } else {
        const position = hit.object.position.clone().add(hit.face.normal);
        x = Math.round(position.x);
        y = Math.round(position.y);
        z = Math.round(position.z);
      }

      if (Math.abs(x) > HALF - 2 || Math.abs(z) > HALF - 2 || y > 140) {
        message("You’ve reached the building boundary.");
        return;
      }

      if (blocks.has(blockKey(x, y, z))) return;

      if (overlapsBlock(player.position, x, y, z)) {
        message("Step back before placing a block here.");
        return;
      }

      addBlock(x, y, z, selectedBlock, true);
    }

    document.addEventListener("mousedown", build);

    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    document.addEventListener("contextmenu", (event) => {
      if (locked) event.preventDefault();
    });

    // ---------------------------------
    // START AND RENDER LOOP
    // ---------------------------------

    window.addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    });

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      ready = false;
      pauseGame();
      showError("The graphics connection was interrupted. Reload the game.");
    });

    respawn();
    selectBlock("grass");

    const clock = new THREE.Clock();
    let aimElapsed = 0;

    function animate() {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      if (locked && ready) {
        updatePlayer(dt);
        aimElapsed += dt;

        if (aimElapsed >= 0.08) {
          aimElapsed = 0;
          const hit = aim();

          outline.visible = Boolean(hit && hit.object !== terrain);

          if (outline.visible) {
            outline.position.copy(hit.object.position);
          }
        }
      }

      renderer.render(scene, camera);
    }

    ready = true;
    $("play-button").disabled = false;
    $("loading-status").textContent =
      "World ready • Changes last until you reload.";

    $("controls-panel").insertAdjacentHTML(
      "beforeend",
      "<p>Shift — Run</p><p>Mouse wheel — Select block</p>" +
      "<p>H — Controls · P — Pause</p>"
    );

    syncUI();
    animate();
  }
})();