/**
 * Khok Si Suphan Hospital 3D - Main Application Engine
 * Handles Three.js rendering, CSS2DRenderer pins, camera animations, and interior transitions.
 */
(function() {
  const K = window.KSS;
  const M = K.M;

  // Coordinate conversion: Scale image pixels to 3D world meters
  // Reference image: ~967 x 749 px. Origin (0,0) centered on hospital center.
  const SCALE = 0.15;
  const ORIGIN_X = 480;
  const ORIGIN_Y = 370;

  function toWorld(px, py) {
    return {
      x: (px - ORIGIN_X) * SCALE,
      z: (py - ORIGIN_Y) * SCALE
    };
  }

  // --- App State ---
  const state = {
    mode: 'exterior', // 'exterior' | 'interior'
    currentBuilding: null,
    selectedBuildingId: null,
    pinsVisible: true,
    autoRotate: false,
    filterCategory: 'all',
    searchQuery: ''
  };

  // --- Three.js Setup ---
  const container = document.getElementById('scene');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1efe9);
  scene.fog = new THREE.FogExp2(0xf1efe9, 0.0055);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
  
  // Default Isometric Camera Position
  const defaultCam = {
    pos: new THREE.Vector3(75, 80, 95),
    target: new THREE.Vector3(0, 0, 5)
  };
  camera.position.copy(defaultCam.pos);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // Tone mapping for crisp architectural contrast
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  // CSS2DRenderer for Pin Markers & HTML Labels
  const labelRenderer = new THREE.CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = 'label-layer';
  document.body.appendChild(labelRenderer.domElement);

  // Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.06; // Prevent going underground
  controls.minDistance = 10;
  controls.maxDistance = 250;
  controls.target.copy(defaultCam.target);

  // --- Lighting (Ultra-Crisp Shadows & Defined Architectural Edges) ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.56);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.42);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffcf5, 1.48);
  sunLight.position.set(65, 125, 75);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 300;
  const shadowRange = 82;
  sunLight.shadow.camera.left = -shadowRange;
  sunLight.shadow.camera.right = shadowRange;
  sunLight.shadow.camera.top = shadowRange;
  sunLight.shadow.camera.bottom = -shadowRange;
  sunLight.shadow.bias = -0.00015;
  sunLight.shadow.radius = 1.0;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x475569, 0.48);
  fillLight.position.set(-80, 55, -70);
  scene.add(fillLight);

  // Groups
  const exteriorGroup = new THREE.Group();
  scene.add(exteriorGroup);

  const interiorGroup = new THREE.Group();
  interiorGroup.visible = false;
  scene.add(interiorGroup);

  // Mappings for raycasting & pins
  const buildingMeshes = new Map();
  const pinObjects = new Map();
  let flagAnimationObj = null;

  // Helper to add sharp outline edges to a single mesh
  function addSharpEdges(mesh, color = 0x334155, threshold = 22) {
    if (!mesh || !mesh.geometry) return;
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, threshold),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
    );
    wire.userData.isEdge = true;
    mesh.add(wire);
  }

  // Helper to apply sharp edges to an entire 3D group (Guard, Shop, Carport, Sign, etc.)
  function addGroupEdges(group, color = 0x334155) {
    group.traverse(child => {
      if (child.isMesh && !child.userData?.shared && !child.userData?.hasEdge) {
        child.userData.hasEdge = true;
        addSharpEdges(child, color, 25);
      }
    });
  }

  // --- Build Exterior Hospital Grounds ---
  function initExterior() {
    // 1. Outside Surrounding Ground
    const groundGeo = new THREE.PlaneGeometry(360, 360);
    const groundMat = M.mat(0xdedad0, { roughness: 0.95 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.12;
    groundMesh.receiveShadow = true;
    exteriorGroup.add(groundMesh);

    // 2. Rectangular Hospital Platform & Crisp Border Frame (กรอบสี่เหลี่ยมผืนผ้าชัดเจน)
    const pMin = toWorld(50, 50);
    const pMax = toWorld(910, 710);
    const rectW = Math.abs(pMax.x - pMin.x);
    const rectD = Math.abs(pMax.z - pMin.z);
    const centerX = (pMin.x + pMax.x) / 2;
    const centerZ = (pMin.z + pMax.z) / 2;

    // Raised Hospital Base Slab
    const baseSlab = M.box(
      exteriorGroup,
      rectW, 0.22, rectD,
      M.mat(0xf7ebe8, { roughness: 0.82 }),
      centerX, -0.09, centerZ
    );
    addSharpEdges(baseSlab, 0x475569);

    // Crisp 3D Perimeter Border Frame (ขอบกรอบสี่เหลี่ยมรอบโรงพยาบาล)
    const borderMat = M.mat(0x475569, { roughness: 0.5 });
    const bThick = 0.7;
    const bHeight = 0.45;
    // Left & Right borders
    const bLeft = M.box(exteriorGroup, bThick, bHeight, rectD + bThick * 2, borderMat, pMin.x - bThick / 2, bHeight / 2 - 0.1, centerZ);
    const bRight = M.box(exteriorGroup, bThick, bHeight, rectD + bThick * 2, borderMat, pMax.x + bThick / 2, bHeight / 2 - 0.1, centerZ);
    // Top & Bottom borders
    const bTop = M.box(exteriorGroup, rectW + bThick * 2, bHeight, bThick, borderMat, centerX, bHeight / 2 - 0.1, pMin.z - bThick / 2);
    const bBottom = M.box(exteriorGroup, rectW + bThick * 2, bHeight, bThick, borderMat, centerX, bHeight / 2 - 0.1, pMax.z + bThick / 2);
    [bLeft, bRight, bTop, bBottom].forEach(m => addSharpEdges(m, 0x1e293b));

    // 3. Main Access Roads (Straight Orthogonal Roads with Crisp Curbs)
    K.ROADS.forEach(road => {
      for (let i = 0; i < road.pts.length - 1; i++) {
        const p1 = toWorld(road.pts[i][0], road.pts[i][1]);
        const p2 = toWorld(road.pts[i + 1][0], road.pts[i + 1][1]);
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const len = Math.hypot(dx, dz);
        const ang = Math.atan2(dx, dz);

        const roadMesh = M.box(
          exteriorGroup,
          road.w, 0.06, len,
          0xcbd5e1,
          (p1.x + p2.x) / 2, 0.04, (p1.z + p2.z) / 2
        );
        roadMesh.rotation.y = ang;
        addSharpEdges(roadMesh, 0x64748b);
      }
    });

    // 4. Construct Buildings & Features from KSS.BUILDINGS
    K.BUILDINGS.forEach(b => {
      const pos = toWorld(b.px, b.py);
      const bGroup = new THREE.Group();
      bGroup.position.set(pos.x, 0, pos.z);
      if (b.rot) bGroup.rotation.y = (b.rot * Math.PI) / 180;
      bGroup.userData = b;

      // Build model based on type
      if (b.type === 'guard') {
        const gModel = M.buildGuardExterior();
        addGroupEdges(gModel, 0x1e293b);
        bGroup.add(gModel);
      } else if (b.type === 'shop') {
        const sModel = M.buildShopExterior();
        addGroupEdges(sModel, 0x1e293b);
        bGroup.add(sModel);
      } else if (b.type === 'parking') {
        const pResult = M.buildCarport(b.w, b.d, { seed: M.hash(b.id) });
        addGroupEdges(pResult.group, 0x334155);
        bGroup.add(pResult.group);
      } else if (b.type === 'sign') {
        const signModel = M.buildSign();
        addGroupEdges(signModel, 0x14532d);
        bGroup.add(signModel);
      } else if (b.type === 'flag') {
        const flagResult = M.buildFlagPlaza(b.w, b.d);
        addGroupEdges(flagResult.group, 0x475569);
        bGroup.add(flagResult.group);
        flagAnimationObj = flagResult.flag;
      } else if (b.type === 'tank') {
        const tankModel = M.buildTank(b.h || 7);
        addGroupEdges(tankModel, 0x334155);
        bGroup.add(tankModel);
      } else if (b.type === 'pavilion') {
        const pavModel = M.buildPavilion(b.w, b.d, b.h || 3);
        addGroupEdges(pavModel, 0x451a03);
        bGroup.add(pavModel);
      } else {
        // Standard Hospital Building with High-Definition Architectural Details & Sharp Dark Outlines
        const height = b.h || 6;
        const baseMat = M.mat(0xffffff, { roughness: 0.45 }); // Crisp bright white/ivory facade
        const roofMat = M.mat(0xd6d0c4, { roughness: 0.4 });
        const plinthMat = M.mat(0x475569, { roughness: 0.6 }); // Deep slate base for strong ground shadow contrast
        const windowMat = M.mat(0x0284c7, { roughness: 0.12, metalness: 0.75 }); // Reflective glass windows
        const edgeDark = 0x334155; // Strong dark architectural edge line

        // 1. Ground Contact Shadow Pad (Ambient Occlusion effect around building base)
        const shadowPadGeo = new THREE.PlaneGeometry(b.w + 1.2, b.d + 1.2);
        const shadowPadMat = new THREE.MeshBasicMaterial({
          color: 0x1e293b,
          transparent: true,
          opacity: 0.18,
          depthWrite: false
        });
        const shadowPad = new THREE.Mesh(shadowPadGeo, shadowPadMat);
        shadowPad.rotation.x = -Math.PI / 2;
        shadowPad.position.y = 0.03;
        bGroup.add(shadowPad);

        // 2. Dark Foundation Plinth (Contact with ground)
        const plinthH = 0.45;
        const plinth = M.box(bGroup, b.w + 0.25, plinthH, b.d + 0.25, plinthMat, 0, plinthH / 2, 0);
        addSharpEdges(plinth, 0x0f172a);

        // 3. Main Wall Body
        const wallMesh = M.box(bGroup, b.w, height, b.d, baseMat, 0, height / 2, 0);
        addSharpEdges(wallMesh, edgeDark);

        // 4. Architectural Window Bands (แถบกระจกหน้าต่างสะท้อนแสงพร้อมกรอบ)
        const numFloors = Math.max(1, Math.floor(height / 3.2));
        for (let f = 0; f < numFloors; f++) {
          const winY = 1.4 + f * 3.2;
          if (winY + 1.1 < height) {
            if (b.w > 4) {
              const wf = M.box(bGroup, b.w * 0.82, 0.95, 0.1, windowMat, 0, winY, b.d / 2 + 0.05);
              const wb = M.box(bGroup, b.w * 0.82, 0.95, 0.1, windowMat, 0, winY, -b.d / 2 - 0.05);
              addSharpEdges(wf, 0x0369a1);
              addSharpEdges(wb, 0x0369a1);
            }
            if (b.d > 5) {
              const wr = M.box(bGroup, 0.1, 0.95, b.d * 0.78, windowMat, b.w / 2 + 0.05, winY, 0);
              const wl = M.box(bGroup, 0.1, 0.95, b.d * 0.78, windowMat, -b.w / 2 - 0.05, winY, 0);
              addSharpEdges(wr, 0x0369a1);
              addSharpEdges(wl, 0x0369a1);
            }
          }
        }

        // Additional Building Wings / Extensions
        let frontZ = b.d / 2;
        if (b.parts && b.parts.length > 0) {
          const theta = ((b.rot || 0) * Math.PI) / 180;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);
          b.parts.forEach(p => {
            const pPos = toWorld(p.px, p.py);
            const dx = pPos.x - pos.x;
            const dz = pPos.z - pos.z;
            const relX = dx * cosT - dz * sinT;
            const relZ = dx * sinT + dz * cosT;
            const pH = p.h || height * 0.8;
            const pPlinth = M.box(bGroup, p.w + 0.2, plinthH, p.d + 0.2, plinthMat, relX, plinthH / 2, relZ);
            addSharpEdges(pPlinth, 0x0f172a);
            const pMesh = M.box(bGroup, p.w, pH, p.d, baseMat, relX, pH / 2, relZ);
            addSharpEdges(pMesh, edgeDark);
            const pRoof = M.box(bGroup, p.w + 0.5, 0.4, p.d + 0.5, roofMat, relX, pH + 0.2, relZ);
            addSharpEdges(pRoof, 0x1e293b);
            if (Math.abs(relX) < b.w * 0.35 && relZ + p.d / 2 > frontZ) {
              frontZ = relZ + p.d / 2;
            }
          });
        }

        // 5. Ground Entrance Canopy / Doorway (Faces front of building; for rot:90 faces Right)
        const doorW = Math.min(2.8, b.w * 0.4);
        const doorMesh = M.box(bGroup, doorW, 2.1, 0.08, M.mat(0x0369a1, { roughness: 0.1 }), 0, 1.05, frontZ + 0.05);
        addSharpEdges(doorMesh, 0x0f172a);
        const canopy = M.box(bGroup, doorW + 1.4, 0.25, 1.8, 0x475569, 0, 2.45, frontZ + 0.9);
        addSharpEdges(canopy, 0x0f172a);

        // ป้ายเตือนหน้าประตูโรงไฟฟ้า (สำหรับอาคารโรงไฟฟ้า)
        if (b.id === 'power') {
          const warnBoard = M.box(bGroup, 1.65, 0.55, 0.08, M.mat(0xfacc15), 0, 2.85, frontZ + 0.95);
          addSharpEdges(warnBoard, 0xb91c1c);
          const warnStripe = M.box(bGroup, 1.55, 0.18, 0.09, M.mat(0xdc2626), 0, 3.0, frontZ + 0.96);
          addSharpEdges(warnStripe, 0x7f1d1d);
        }

        // 6. Roof Trim & Parapet
        const roofTrim = M.box(bGroup, b.w + 0.65, 0.5, b.d + 0.65, roofMat, 0, height + 0.25, 0);
        addSharpEdges(roofTrim, 0x1e293b);

        // Optional Arch Roof (e.g. โรงยิม)
        if (b.roof === 'arch') {
          const archGeo = new THREE.CylinderGeometry(b.w / 2, b.w / 2, b.d, 24, 1, false, 0, Math.PI);
          const archMesh = new THREE.Mesh(archGeo, M.mat(0x0284c7, { roughness: 0.35 }));
          archMesh.rotation.z = Math.PI / 2;
          archMesh.position.set(0, height + 0.25, 0);
          archMesh.castShadow = true;
          addSharpEdges(archMesh, 0x0f172a);
          bGroup.add(archMesh);
        }

        // Red Cross Symbol on ER
        if (b.redCross) {
          const crossGroup = new THREE.Group();
          crossGroup.position.set(-b.w / 2 - 0.12, height * 0.65, 0);
          crossGroup.rotation.y = -Math.PI / 2;
          const c1 = M.box(crossGroup, 0.85, 2.5, 0.08, M.mat(0xdc2626));
          const c2 = M.box(crossGroup, 2.5, 0.85, 0.08, M.mat(0xdc2626));
          addSharpEdges(c1, 0x7f1d1d);
          addSharpEdges(c2, 0x7f1d1d);
          bGroup.add(crossGroup);
        }
      }

      exteriorGroup.add(bGroup);
      buildingMeshes.set(b.id, bGroup);

      // Create 3D CSS2D Pin Marker for this building
      createPinMarker(b, pos);
    });

    // 5. Fillers: Secondary unnamed buildings (All straight with sharp edges)
    K.FILLERS.forEach(f => {
      const pos = toWorld(f[0], f[1]);
      const w = f[2], d = f[3], h = f[4], rot = f[5] || 0;
      const fGroup = new THREE.Group();
      fGroup.position.set(pos.x, 0, pos.z);
      if (rot) fGroup.rotation.y = (rot * Math.PI) / 180;
      const fPlinth = M.box(fGroup, w + 0.15, 0.3, d + 0.15, 0x64748b, 0, 0.15, 0);
      const fWall = M.box(fGroup, w, h, d, 0xf8fafc, 0, h / 2, 0);
      const fRoof = M.box(fGroup, w + 0.35, 0.3, d + 0.35, 0xd6d0c4, 0, h + 0.15, 0);
      addSharpEdges(fPlinth, 0x1e293b);
      addSharpEdges(fWall, 0x334155);
      addSharpEdges(fRoof, 0x1e293b);
      exteriorGroup.add(fGroup);
    });

    // 6. External neighborhood context buildings (With sharp edges)
    K.CONTEXT.forEach(c => {
      const pos = toWorld(c[0], c[1]);
      const w = c[2], d = c[3], h = c[4];
      const cWall = M.box(exteriorGroup, w, h, d, 0xe5e0d8, pos.x, h / 2, pos.z);
      const cRoof = M.box(exteriorGroup, w + 0.25, 0.25, d + 0.25, 0xcbd5e1, pos.x, h + 0.125, pos.z);
      addSharpEdges(cWall, 0x64748b);
      addSharpEdges(cRoof, 0x475569);
    });

    // 7. Trees & Landscaping
    K.TREES.forEach((pt, i) => {
      const pos = toWorld(pt[0], pt[1]);
      const tree = M.tree(0.85 + (i % 3) * 0.2, i);
      tree.position.set(pos.x, 0, pos.z);
      exteriorGroup.add(tree);
    });
  }

  // --- Create 3D Pin Marker with CSS2D ---
  function createPinMarker(b, pos) {
    const cat = K.CATEGORIES[b.cat] || { color: '#2563eb' };
    const pinWrap = document.createElement('div');
    pinWrap.className = 'pin-wrap';
    pinWrap.style.setProperty('--c', cat.color);

    const pinEl = document.createElement('div');
    pinEl.className = 'pin';
    pinEl.innerHTML = `
      <div class="pin-name">${b.name}</div>
      <div class="pin-head"><span>${b.icon || '🏥'}</span></div>
    `;

    pinWrap.appendChild(pinEl);
    pinWrap.onclick = (e) => {
      e.stopPropagation();
      selectBuilding(b);
    };

    const pin2D = new THREE.CSS2DObject(pinWrap);
    const pinY = (b.h || 5) + 3.2;
    pin2D.position.set(pos.x, pinY, pos.z);

    exteriorGroup.add(pin2D);
    pinObjects.set(b.id, { obj: pin2D, el: pinEl });
  }

  // --- Raycasting for 3D Building Click ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (e) => {
    if (e.target.closest('.panel, .pin-wrap, .int-label, button, input')) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (state.mode === 'interior') {
      const intClickables = [];
      interiorGroup.traverse(child => {
        if (child.isMesh) intClickables.push(child);
      });
      const hits = raycaster.intersectObjects(intClickables);
      if (hits.length > 0) {
        let curr = hits[0].object;
        while (curr && !curr.userData?.pcInfo) {
          curr = curr.parent;
        }
        if (curr && curr.userData?.pcInfo) {
          showPcModal(curr.userData.pcInfo);
          return;
        }
      }
      return;
    }

    if (state.mode !== 'exterior') return;

    const clickables = [];
    buildingMeshes.forEach(group => {
      group.traverse(child => {
        if (child.isMesh && !child.userData?.shared) clickables.push(child);
      });
    });

    const hits = raycaster.intersectObjects(clickables);
    if (hits.length > 0) {
      let curr = hits[0].object;
      while (curr && !curr.userData?.id) {
        curr = curr.parent;
      }
      if (curr && curr.userData?.id) {
        selectBuilding(curr.userData);
      }
    } else {
      closeInfo();
    }
  });

  // --- Computer Specification Modal ---
  function showPcModal(pc) {
    if (!pc) return;
    const modal = document.getElementById('pc-modal');
    if (!modal) return;
    document.getElementById('pc-name').innerText = pc.name || 'โต๊ะคอมพิวเตอร์';
    document.getElementById('pc-code').innerText = `รหัสครุภัณฑ์: ${pc.code || '-'}`;
    document.getElementById('pc-role').innerText = pc.role || '-';
    document.getElementById('pc-specs').innerHTML = `
      <div><small>CPU / ประมวลผล</small><strong>${pc.cpu || '-'}</strong></div>
      <div><small>RAM / หน่วยความจำ</small><strong>${pc.ram || '-'}</strong></div>
      <div><small>Storage / ความจุ</small><strong>${pc.storage || '-'}</strong></div>
      <div><small>จอภาพ (Monitor)</small><strong>${pc.monitor || '-'}</strong></div>
      <div><small>ระบบปฏิบัติการ (OS)</small><strong>${pc.os || '-'}</strong></div>
      <div><small>เครือข่าย / IP</small><strong>${pc.ip || '-'} (${pc.status || 'Online'})</strong></div>
    `;
    document.getElementById('pc-software').innerHTML = `
      <small>ซอฟต์แวร์ระบบโรงพยาบาล & อุปกรณ์ต่อพ่วง</small>
      <strong>💿 ${pc.software || '-'}</strong>
      <div style="font-size:11px;color:#475569;margin-top:3px;">🔌 อุปกรณ์ต่อพ่วง: ${pc.peripherals || '-'} | 👩‍⚕️ ผู้รับผิดชอบ: ${pc.user || '-'}</div>
    `;
    modal.classList.remove('hidden');
  }

  function closePcModal() {
    const modal = document.getElementById('pc-modal');
    if (modal) modal.classList.add('hidden');
  }

  const pcCloseBtn = document.getElementById('pc-close');
  if (pcCloseBtn) pcCloseBtn.onclick = closePcModal;

  // --- Selection & Info Card ---
  function selectBuilding(b) {
    state.selectedBuildingId = b.id;
    state.currentBuilding = b;

    // Highlight Pin
    pinObjects.forEach((p, id) => {
      if (id === b.id) p.el.classList.add('selected');
      else p.el.classList.remove('selected');
    });

    // Populate Info Panel
    const cat = K.CATEGORIES[b.cat] || { label: 'ทั่วไป', color: '#2563eb' };
    const infoCard = document.getElementById('info');
    document.getElementById('info-icon').innerText = b.icon || '🏥';
    document.getElementById('info-icon').style.background = cat.color + '25';
    document.getElementById('info-name').innerText = b.name;
    const catChip = document.getElementById('info-cat');
    catChip.innerText = cat.label;
    catChip.style.backgroundColor = cat.color;
    document.getElementById('info-desc').innerText = b.desc || '-';

    // Meta Specs
    const metaEl = document.getElementById('info-meta');
    metaEl.innerHTML = `
      <div><small>ขนาดอาคาร</small><strong>${b.w} × ${b.d} ม.</strong></div>
      <div><small>ความสูง</small><strong>${b.h ? b.h + ' ม.' : 'ชั้นเดียว'}</strong></div>
    `;

    // Parking slot stats if parking
    if (b.type === 'parking') {
      const stats = K.Interiors.stats(b);
      if (stats) {
        metaEl.innerHTML += `
          <div><small>รถที่จอดอยู่</small><strong class="text-emerald-600">${stats.parked} คัน</strong></div>
          <div><small>ช่องจอดทั้งหมด</small><strong>${stats.total} ช่อง</strong></div>
        `;
      }
    }

    // Enter Interior Button
    const btnEnter = document.getElementById('btn-enter');
    if (b.interior) {
      btnEnter.classList.remove('hidden');
      btnEnter.onclick = () => enterInterior(b);
    } else {
      btnEnter.classList.add('hidden');
    }

    // Zoom Button
    document.getElementById('btn-zoom').onclick = () => zoomToBuilding(b);

    infoCard.classList.remove('hidden');
    renderSidebarList();
  }

  function closeInfo() {
    state.selectedBuildingId = null;
    document.getElementById('info').classList.add('hidden');
    pinObjects.forEach(p => p.el.classList.remove('selected'));
    renderSidebarList();
  }

  document.getElementById('info-close').onclick = closeInfo;

  function zoomToBuilding(b) {
    const pos = toWorld(b.px, b.py);
    const targetY = (b.h || 4) / 2;
    gsap.to(controls.target, {
      x: pos.x, y: targetY, z: pos.z,
      duration: 1.2, ease: 'power2.out'
    });
    gsap.to(camera.position, {
      x: pos.x + 24, y: targetY + 22, z: pos.z + 28,
      duration: 1.2, ease: 'power2.out'
    });
  }

  // --- Interior View Mode ---
  let activeInteriorData = null;

  function clearInteriorScene() {
    interiorGroup.traverse(child => {
      if (child.isCSS2DObject && child.element && child.element.parentNode) {
        child.element.parentNode.removeChild(child.element);
      }
    });
    interiorGroup.clear();
  }

  function enterInterior(b, keepCamera = false) {
    const data = K.Interiors.build(b);
    if (!data) return;

    state.mode = 'interior';
    state.currentBuilding = b;
    activeInteriorData = data;

    document.body.classList.add('mode-interior');

    // Switch Visibility
    exteriorGroup.visible = false;
    pinObjects.forEach(p => { p.obj.visible = false; if (p.obj.element) p.obj.element.style.display = 'none'; });
    clearInteriorScene();
    interiorGroup.add(data.group);
    interiorGroup.visible = true;

    // Interior Labels (CSS2D)
    data.labels.forEach(l => {
      const labelDiv = document.createElement('div');
      labelDiv.className = l.cls || 'int-label';
      labelDiv.innerText = l.text;
      if (l.toggleId) {
        labelDiv.title = 'คลิกเพื่อสลับสถานะ ว่าง / ไม่ว่าง';
        labelDiv.onclick = (e) => {
          e.stopPropagation();
          if (K.Interiors.toggleStatus && K.Interiors.toggleStatus(l.toggleId)) {
            enterInterior(b, true);
          }
        };
      } else if (l.pcInfo) {
        labelDiv.title = 'คลิกเพื่อดูรายละเอียดสเปกคอมพิวเตอร์';
        labelDiv.onclick = (e) => {
          e.stopPropagation();
          showPcModal(l.pcInfo);
        };
      }
      const labelObj = new THREE.CSS2DObject(labelDiv);
      labelObj.position.copy(l.pos);
      interiorGroup.add(labelObj);
    });

    // Populate Interior UI
    document.getElementById('int-title').innerText = data.title;
    document.getElementById('int-sub').innerText = data.sub;
    const listEl = document.getElementById('int-list');
    listEl.innerHTML = '';
    data.items.forEach(it => {
      const li = document.createElement('li');
      const toggleId = it[3];
      const badgeCls = it[4] || '';
      const pcInfo = it[5] || null;
      if (toggleId) {
        li.className = 'clickable';
        li.title = 'คลิกเพื่อสลับสถานะ ว่าง / ไม่ว่าง';
        li.onclick = () => {
          if (K.Interiors.toggleStatus && K.Interiors.toggleStatus(toggleId)) {
            enterInterior(b, true);
          }
        };
      } else if (pcInfo) {
        li.className = 'clickable';
        li.title = 'คลิกเพื่อดูรายละเอียดสเปกคอมพิวเตอร์';
        li.onclick = () => {
          showPcModal(pcInfo);
        };
      }
      li.innerHTML = `<span class="e">${it[0]}</span><span class="t">${it[1]}</span><span class="q ${badgeCls}">${it[2]}</span>`;
      listEl.appendChild(li);
    });

    document.getElementById('interior-bar').classList.remove('hidden');
    document.getElementById('interior-items').classList.remove('hidden');

    if (!keepCamera) {
      controls.maxDistance = 80;
      controls.minDistance = 3;
      gsap.to(controls.target, {
        x: data.cam.target.x, y: data.cam.target.y, z: data.cam.target.z,
        duration: 1.0, ease: 'power2.inOut'
      });
      gsap.to(camera.position, {
        x: data.cam.pos.x, y: data.cam.pos.y, z: data.cam.pos.z,
        duration: 1.0, ease: 'power2.inOut'
      });
    }
  }

  function exitInterior() {
    state.mode = 'exterior';
    document.body.classList.remove('mode-interior');
    closePcModal();

    interiorGroup.visible = false;
    clearInteriorScene();
    exteriorGroup.visible = true;
    pinObjects.forEach(p => { p.obj.visible = true; if (p.obj.element) p.obj.element.style.display = ''; });

    document.getElementById('interior-bar').classList.add('hidden');
    document.getElementById('interior-items').classList.add('hidden');

    controls.maxDistance = 250;
    controls.minDistance = 10;

    if (state.currentBuilding) {
      zoomToBuilding(state.currentBuilding);
    } else {
      resetCameraIso();
    }
  }

  document.getElementById('btn-back').onclick = exitInterior;

  // --- UI Sidebar & Filters ---
  function initSidebar() {
    // Categories Legend
    const legendEl = document.getElementById('legend');
    const allBtn = document.createElement('button');
    allBtn.className = 'active';
    allBtn.innerText = 'ทั้งหมด';
    allBtn.onclick = () => filterCategory('all', allBtn);
    legendEl.appendChild(allBtn);

    Object.entries(K.CATEGORIES).forEach(([catKey, catVal]) => {
      const btn = document.createElement('button');
      btn.innerHTML = `<span class="dot" style="background:${catVal.color}"></span>${catVal.label}`;
      btn.onclick = () => filterCategory(catKey, btn);
      legendEl.appendChild(btn);
    });

    // Search Input
    document.getElementById('search').oninput = (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      renderSidebarList();
    };

    renderSidebarList();
  }

  function filterCategory(catKey, btn) {
    state.filterCategory = catKey;
    document.querySelectorAll('#legend button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSidebarList();
  }

  function renderSidebarList() {
    const listEl = document.getElementById('list');
    listEl.innerHTML = '';

    const filtered = K.BUILDINGS.filter(b => {
      const matchCat = state.filterCategory === 'all' || b.cat === state.filterCategory;
      const matchSearch = !state.searchQuery || 
        b.name.toLowerCase().includes(state.searchQuery) ||
        (b.desc && b.desc.toLowerCase().includes(state.searchQuery));
      return matchCat && matchSearch;
    });

    filtered.forEach(b => {
      const cat = K.CATEGORIES[b.cat] || { color: '#2563eb' };
      const item = document.createElement('div');
      item.className = 'item' + (b.id === state.selectedBuildingId ? ' selected' : '');
      item.innerHTML = `
        <div class="ic" style="background:${cat.color}20">${b.icon || '🏥'}</div>
        <div class="nm">
          <strong>${b.name}</strong>
          <small>${b.interior ? '🔍 สามารถคลิกดูภายในได้' : `${b.w}×${b.d} ม.`}</small>
        </div>
      `;
      item.onclick = () => {
        selectBuilding(b);
        zoomToBuilding(b);
      };
      listEl.appendChild(item);
    });
  }

  // --- Camera Controls & Toolbar Buttons ---
  function resetCameraIso() {
    gsap.to(controls.target, { x: defaultCam.target.x, y: defaultCam.target.y, z: defaultCam.target.z, duration: 1 });
    gsap.to(camera.position, { x: defaultCam.pos.x, y: defaultCam.pos.y, z: defaultCam.pos.z, duration: 1.2 });
    setActiveButton('btn-iso');
  }

  function viewTopDown() {
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1 });
    gsap.to(camera.position, { x: 0.1, y: 140, z: 5, duration: 1.2 });
    setActiveButton('btn-top');
  }

  function rotateCameraStep(angleRad) {
    const offset = camera.position.clone().sub(controls.target);
    const radius = Math.hypot(offset.x, offset.z);
    const currAngle = Math.atan2(offset.z, offset.x);
    const newAngle = currAngle + angleRad;
    const newX = controls.target.x + radius * Math.cos(newAngle);
    const newZ = controls.target.z + radius * Math.sin(newAngle);

    gsap.to(camera.position, {
      x: newX, z: newZ, duration: 0.8, ease: 'power2.out'
    });
  }

  function setActiveButton(id) {
    document.querySelectorAll('#toolbar button').forEach(b => {
      if (b.id === 'btn-iso' || b.id === 'btn-top') b.classList.remove('active');
    });
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  document.getElementById('btn-iso').onclick = resetCameraIso;
  document.getElementById('btn-top').onclick = viewTopDown;
  document.getElementById('btn-rot-left').onclick = () => rotateCameraStep(Math.PI / 4);
  document.getElementById('btn-rot-right').onclick = () => rotateCameraStep(-Math.PI / 4);

  // Auto Rotate
  const btnAuto = document.getElementById('btn-auto');
  btnAuto.onclick = () => {
    state.autoRotate = !state.autoRotate;
    controls.autoRotate = state.autoRotate;
    controls.autoRotateSpeed = 1.6;
    btnAuto.classList.toggle('active', state.autoRotate);
  };

  // Toggle Pins
  const btnPins = document.getElementById('btn-pins');
  btnPins.onclick = () => {
    state.pinsVisible = !state.pinsVisible;
    btnPins.classList.toggle('active', state.pinsVisible);
    const layer = document.querySelector('.label-layer');
    if (layer) layer.style.display = state.pinsVisible ? 'block' : 'none';
  };

  // --- Animation Loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    controls.update();

    // Thai flag waving animation
    if (flagAnimationObj && flagAnimationObj.userData.base) {
      const posAttr = flagAnimationObj.geometry.attributes.position;
      const base = flagAnimationObj.userData.base;
      for (let i = 0; i < posAttr.count; i++) {
        const x = base[i * 3];
        // Wave increases towards edge
        const wave = Math.sin(elapsed * 4.5 + x * 2.5) * 0.14 * (x / 3);
        posAttr.setZ(i, wave);
      }
      posAttr.needsUpdate = true;
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  // --- Resize Handler ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Initialize App ---
  initExterior();
  initSidebar();
  animate();

  // Hide Loading Screen
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 400);
  }
})();
