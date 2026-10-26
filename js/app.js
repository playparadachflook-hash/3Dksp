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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = true;
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
  controls.dampingFactor = 0.08;
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
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
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
    // Top border (solid)
    const bTop = M.box(exteriorGroup, rectW + bThick * 2, bHeight, bThick, borderMat, centerX, bHeight / 2 - 0.1, pMin.z - bThick / 2);

    // Front/Bottom border with openings for Entrance Gate (left, px: 135) and Secondary Gate (px: 330)
    const zBottom = pMax.z + bThick / 2;
    // Segment 1 (left of Gate, px: 50..103)
    const seg1W = 8.0;
    const bBot1 = M.box(exteriorGroup, seg1W, bHeight, bThick, borderMat, -64.5 + seg1W / 2, bHeight / 2 - 0.1, zBottom);
    // Segment 2 (between Gate 1 and Gate 2, px: 167..303)
    const seg2W = 20.5;
    const bBot2 = M.box(exteriorGroup, seg2W, bHeight, bThick, borderMat, -47.0 + seg2W / 2, bHeight / 2 - 0.1, zBottom);
    // Segment 3 (right of Gate 2, px: 357..910)
    const seg3W = 83.0;
    const bBot3 = M.box(exteriorGroup, seg3W, bHeight, bThick, borderMat, -18.5 + seg3W / 2, bHeight / 2 - 0.1, zBottom);
    [bLeft, bRight, bTop, bBot1, bBot2, bBot3].forEach(m => addSharpEdges(m, 0x1e293b));

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
        const isOutdoor = b.id === 'parking-flag' || !!b.openAir;
        const pResult = M.buildCarport(b.w, b.d, {
          seed: M.hash(b.id),
          openAir: isOutdoor,
          hasSign: b.id === 'garage-main',
          signTitle: '🚑 โรงจอดรถโรงพยาบาลและยานพาหนะ (พขร.)'
        });
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
      } else if (b.type === 'buddha') {
        const buddhaModel = M.buildBuddhaShrine(b.w, b.d, b.h || 4.8);
        addGroupEdges(buddhaModel, 0xb45309);
        bGroup.add(buddhaModel);
      } else if (b.type === 'garden-ipd') {
        const gardenModel = M.buildGardenIpd(b.w, b.d);
        addGroupEdges(gardenModel, 0x15803d);
        bGroup.add(gardenModel);
      } else if (b.type === 'garden-sign') {
        const parkModel = M.buildParkSign(b.w, b.d);
        addGroupEdges(parkModel, 0x15803d);
        bGroup.add(parkModel);
      } else if (b.type === 'median') {
        const medianModel = M.buildMedian(b.w, b.d);
        addGroupEdges(medianModel, 0x15803d);
        bGroup.add(medianModel);
      } else if (b.type === 'drivers') {
        const driversModel = M.buildDriversExterior(b.w, b.d);
        addGroupEdges(driversModel, 0x1e293b);
        bGroup.add(driversModel);
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
              addSharpEdges(wr, 0x0369a1);
              if (!(b.id === 'opd' && f === 0)) {
                const wl = M.box(bGroup, 0.1, 0.95, b.d * 0.78, windowMat, -b.w / 2 - 0.05, winY, 0);
                addSharpEdges(wl, 0x0369a1);
              }
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
        if (b.id === 'er') {
          // =========================================================================
          // ทางรถขึ้นหน้าตึก ER แบบมีหลังคาคลุม (Covered Ambulance Drive-up Ramp & Canopy)
          // =========================================================================
          const erRampGroup = new THREE.Group();
          const rW = 16.0;   // แท่นเทียบรถฉุกเฉินกว้าง 16 ม.
          const rD = 6.2;    // ยื่นออกมาจากหน้าตึก 6.2 ม.
          const rH = 0.52;   // ยกระดับ 0.52 ม. เสมอระดับพื้นตึก ER สะดวกต่อการเข็นเตียง
          const rampZ = frontZ + rD / 2;
          const slopeW = 4.2; // ความยาวทางลาดขึ้น-ลง 4.2 ม.

          const driveMat = M.mat(0x334155, { roughness: 0.85 }); // ผิวทางวิ่งคอนกรีต/แอสฟัลต์
          const curbMat = M.mat(0xfacc15, { roughness: 0.5 });   // ขอบกันทางลาดสีเหลืองเตือนภัย

          // 1. แท่นจอดเทียบรถฉุกเฉินตรงกลาง (Raised Platform)
          const platMesh = M.box(erRampGroup, rW, rH, rD, driveMat, 0, rH / 2, rampZ);
          addSharpEdges(platMesh, 0x0f172a);

          // ขอบกันตกสีเหลือง-ดำด้านหน้า (Safety Curb)
          const curbSouth = M.box(erRampGroup, rW, 0.22, 0.28, curbMat, 0, rH + 0.11, rampZ + rD / 2 - 0.14);
          addSharpEdges(curbSouth, 0xb45309);

          // 2. ทางลาดขึ้นฝั่งทิศตะวันตก (West Approach Slope)
          const z0 = rampZ - rD / 2, z1 = rampZ + rD / 2;
          const wSlopeGeo = new THREE.BufferGeometry();
          const sX0 = -rW / 2, sX1 = -rW / 2 - slopeW;
          const wVerts = new Float32Array([
            // Top slope quad (2 triangles)
            sX1, 0, z0,   sX0, rH, z0,   sX0, rH, z1,
            sX1, 0, z0,   sX0, rH, z1,   sX1, 0, z1,
            // Front vertical side
            sX1, 0, z1,   sX0, rH, z1,   sX0, 0, z1,
            // Rear vertical side
            sX1, 0, z0,   sX0, 0, z0,    sX0, rH, z0,
            // Bottom base quad
            sX1, 0, z0,   sX1, 0, z1,    sX0, 0, z1,
            sX1, 0, z0,   sX0, 0, z1,    sX0, 0, z0
          ]);
          wSlopeGeo.setAttribute('position', new THREE.BufferAttribute(wVerts, 3));
          wSlopeGeo.computeVertexNormals();
          const wSlopeMesh = new THREE.Mesh(wSlopeGeo, driveMat);
          wSlopeMesh.castShadow = true;
          wSlopeMesh.receiveShadow = true;
          erRampGroup.add(wSlopeMesh);
          addSharpEdges(wSlopeMesh, 0x0f172a);

          // 3. ทางลาดลงฝั่งทิศตะวันออก (East Exit Slope)
          const eSlopeGeo = new THREE.BufferGeometry();
          const eX0 = rW / 2, eX1 = rW / 2 + slopeW;
          const eVerts = new Float32Array([
            // Top slope quad
            eX0, rH, z0,   eX1, 0, z0,   eX1, 0, z1,
            eX0, rH, z0,   eX1, 0, z1,   eX0, rH, z1,
            // Front vertical side
            eX0, 0, z1,   eX0, rH, z1,   eX1, 0, z1,
            // Rear vertical side
            eX0, rH, z0,  eX0, 0, z0,    eX1, 0, z0,
            // Bottom base quad
            eX0, 0, z0,   eX0, 0, z1,    eX1, 0, z1,
            eX0, 0, z0,   eX1, 0, z1,    eX1, 0, z0
          ]);
          eSlopeGeo.setAttribute('position', new THREE.BufferAttribute(eVerts, 3));
          eSlopeGeo.computeVertexNormals();
          const eSlopeMesh = new THREE.Mesh(eSlopeGeo, driveMat);
          eSlopeMesh.castShadow = true;
          eSlopeMesh.receiveShadow = true;
          erRampGroup.add(eSlopeMesh);
          addSharpEdges(eSlopeMesh, 0x0f172a);

          // 4. โครงหลังคาคลุมทางรถขึ้นขนาดใหญ่ (Grand Ambulance Canopy)
          const canopyW = rW + slopeW * 1.5; // คลุมตลอดแนวแท่นและทางลาด (~22 ม.)
          const canopyD = rD + 0.8;          // ยื่นคลุมแนวทางวิ่งรถทั้งหมด (~7 ม.)
          const canopyH = 4.6;               // ความสูงโปร่ง 4.6 ม. รถพยาบาลทรงสูงเข้าได้สะดวก
          const canopyY = rH + canopyH;
          const canopyMat = M.mat(0xffffff, { roughness: 0.45 });
          const cRoofMesh = M.box(erRampGroup, canopyW, 0.5, canopyD, canopyMat, 0, canopyY, rampZ);
          addSharpEdges(cRoofMesh, 0x1e293b);

          // ขอบบัวสีแดงฉุกเฉินรอบหลังคา (Red Emergency Fascia Trim)
          const trimRed = M.mat(0xdc2626, { roughness: 0.35 });
          const fTrim = M.box(erRampGroup, canopyW + 0.12, 0.6, 0.12, trimRed, 0, canopyY, rampZ + canopyD / 2 + 0.06);
          const lTrim = M.box(erRampGroup, 0.12, 0.6, canopyD + 0.12, trimRed, -canopyW / 2 - 0.06, canopyY, rampZ);
          const rTrim = M.box(erRampGroup, 0.12, 0.6, canopyD + 0.12, trimRed, canopyW / 2 + 0.06, canopyY, rampZ);
          [fTrim, lTrim, rTrim].forEach(m => addSharpEdges(m, 0x7f1d1d));

          // ป้ายไฟหน้าหลังคา: "🚑 EMERGENCY • แผนกอุบัติเหตุ-ฉุกเฉิน"
          const erSignTex = M.canvasTexture(1024, 160, (ctx, cw, ch) => {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(0, 0, cw, ch);
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 10;
            ctx.strokeRect(6, 6, cw - 12, ch - 12);
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = 'bold 62px Prompt, Tahoma, sans-serif';
            ctx.fillText('🚑 EMERGENCY • อุบัติเหตุ-ฉุกเฉิน', cw / 2, ch / 2);
          });
          const erSignBox = M.box(erRampGroup, 11.5, 0.95, 0.08, new THREE.MeshStandardMaterial({ map: erSignTex, roughness: 0.4 }), 0, canopyY + 0.6, rampZ + canopyD / 2 + 0.08);
          addSharpEdges(erSignBox, 0x7f1d1d);

          // 5. เสาเหล็กกล่องค้ำยันโครงสร้างหลังคา (Structural Support Columns)
          const pillarMat = M.mat(0x334155, { metalness: 0.6, roughness: 0.25 });
          const pillarXs = [-canopyW / 2 + 1.2, -canopyW * 0.2, canopyW * 0.2, canopyW / 2 - 1.2];
          pillarXs.forEach(px => {
            const pillar = M.box(erRampGroup, 0.42, canopyY, 0.42, pillarMat, px, canopyY / 2, rampZ + canopyD / 2 - 0.35);
            addSharpEdges(pillar, 0x0f172a);
            const pBase = M.box(erRampGroup, 0.65, 0.38, 0.65, curbMat, px, 0.19, rampZ + canopyD / 2 - 0.35);
            addSharpEdges(pBase, 0xb45309);
          });

          // 6. ประตูเลื่อนอัตโนมัติฉุกเฉินบานคู่ขนาดใหญ่ (Wide Emergency Automatic Sliding Doors)
          const erDoorGlass = M.mat(0x0284c7, { roughness: 0.1, metalness: 0.8 });
          const erDoor = M.box(erRampGroup, 4.6, 2.5, 0.1, erDoorGlass, 0, rH + 1.25, frontZ + 0.06);
          addSharpEdges(erDoor, 0x0f172a);
          // กากบาทสีแดงเหนือประตู
          const crossV = M.box(erRampGroup, 0.38, 1.2, 0.06, M.mat(0xdc2626), 0, rH + 3.15, frontZ + 0.08);
          const crossH = M.box(erRampGroup, 1.2, 0.38, 0.06, M.mat(0xdc2626), 0, rH + 3.15, frontZ + 0.08);
          addSharpEdges(crossV, 0x7f1d1d);
          addSharpEdges(crossH, 0x7f1d1d);

          // 7. รถพยาบาลฉุกเฉินจอดเทียบอยู่บนทางลาดใต้หลังคา (Ambulance Van)
          const ambulance = M.makeCar(0xffffff, 'van');
          ambulance.position.set(-2.2, rH + 0.02, rampZ);
          ambulance.rotation.y = Math.PI / 2; // หันหน้าไปทางทิศตะวันออกตามทิศทางวิ่งออก
          erRampGroup.add(ambulance);

          bGroup.add(erRampGroup);
        } else if (b.id === 'opd') {
          // =========================================================================
          // ทางรถขึ้นหน้าตึก OPD แบบมีหลังคาคลุม (Covered Drive-up Ramp & Porte-Cochère for OPD)
          // ตำแหน่ง: หันหน้าออกมาทางตึก ER (ฝั่งทิศตะวันตก West Facade) ตามที่ผู้ใช้สั่งการ
          // =========================================================================
          const opdRampGroup = new THREE.Group();
          const rDepth = 5.8;  // ยื่นออกมาจากผนังฝั่ง ER 5.8 ม. เป็นแท่นเทียบรถ
          const rLength = 13.5; // ความยาวแท่นเทียบรถ 13.5 ม.
          const rH = 0.52;     // ยกระดับ 0.52 ม. เสมอระดับพื้นตึกผู้ป่วยนอก สะดวกต่อรถเข็นและคนไข้
          const rampCenterZ = 10.0; // กึ่งกลางแนวแท่นเทียบรถฝั่งทางเชื่อมไปทางทิศใต้
          const rampX = -b.w / 2 - rDepth / 2; // -10.0 - 2.9 = -12.9 (ยื่นออกไปทาง ER)
          const slopeLen = 3.8; // ความยาวทางลาดขึ้น-ลง 3.8 ม.

          const driveMat = M.mat(0x334155, { roughness: 0.85 }); // ผิวทางวิ่งแอสฟัลต์/คอนกรีตเรียบ
          const curbMat = M.mat(0x0284c7, { roughness: 0.45 });  // ขอบกันทางลาดสีฟ้าคลินิก Medical Blue

          // 1. แท่นจอดเทียบรถตรงกลาง (Raised Platform Facing ER)
          const platMesh = M.box(opdRampGroup, rDepth, rH, rLength, driveMat, rampX, rH / 2, rampCenterZ);
          addSharpEdges(platMesh, 0x0f172a);

          // ขอบกันตกสีฟ้าด้านหน้า (Outer Safety Curb facing ER)
          const curbWest = M.box(opdRampGroup, 0.26, 0.24, rLength, curbMat, -b.w / 2 - rDepth + 0.13, rH + 0.12, rampCenterZ);
          addSharpEdges(curbWest, 0x0369a1);

          // ทางม้าลายคนเดินข้ามบนแท่นเทียบรถ (Zebra Crosswalk into Main Doors)
          for (let zx = rampCenterZ - 2.2; zx <= rampCenterZ + 2.2; zx += 1.1) {
            const zebra = M.box(opdRampGroup, rDepth * 0.72, 0.02, 0.55, M.mat(0xffffff, { roughness: 0.4 }), rampX, rH + 0.01, zx);
            addSharpEdges(zebra, 0x94a3b8);
          }

          // 2. ทางลาดขึ้นฝั่งทิศใต้ (South Approach Slope - รับรถที่เลี้ยวมาจากถนนหลักและหน้า ER)
          const x0 = -b.w / 2, x1 = -b.w / 2 - rDepth;
          const sZ0 = rampCenterZ + rLength / 2;
          const sZ1 = sZ0 + slopeLen;
          const sSlopeGeo = new THREE.BufferGeometry();
          const sVerts = new Float32Array([
            // Top slope quad (2 triangles)
            x0, rH, sZ0,   x1, rH, sZ0,   x1, 0, sZ1,
            x0, rH, sZ0,   x1, 0, sZ1,    x0, 0, sZ1,
            // Outer side (facing ER at x1)
            x1, 0, sZ0,    x1, rH, sZ0,   x1, 0, sZ1,
            // Inner side (at building wall x0)
            x0, 0, sZ0,    x0, 0, sZ1,    x0, rH, sZ0,
            // Bottom base quad
            x0, 0, sZ0,    x1, 0, sZ0,    x1, 0, sZ1,
            x0, 0, sZ0,    x1, 0, sZ1,    x0, 0, sZ1
          ]);
          sSlopeGeo.setAttribute('position', new THREE.BufferAttribute(sVerts, 3));
          sSlopeGeo.computeVertexNormals();
          const sSlopeMesh = new THREE.Mesh(sSlopeGeo, driveMat);
          sSlopeMesh.castShadow = true;
          sSlopeMesh.receiveShadow = true;
          opdRampGroup.add(sSlopeMesh);
          addSharpEdges(sSlopeMesh, 0x0f172a);

          // 3. ทางลาดลงฝั่งทิศเหนือ (North Exit Slope - ทางวิ่งออกไปสู่ฝั่งทางเชื่อม)
          const nZ0 = rampCenterZ - rLength / 2;
          const nZ1 = nZ0 - slopeLen;
          const nSlopeGeo = new THREE.BufferGeometry();
          const nVerts = new Float32Array([
            // Top slope quad
            x0, rH, nZ0,   x0, 0, nZ1,    x1, rH, nZ0,
            x1, rH, nZ0,   x0, 0, nZ1,    x1, 0, nZ1,
            // Outer side (facing ER at x1)
            x1, 0, nZ0,    x1, 0, nZ1,    x1, rH, nZ0,
            // Inner side (at building wall x0)
            x0, 0, nZ0,    x0, rH, nZ0,   x0, 0, nZ1,
            // Bottom base quad
            x0, 0, nZ0,    x1, 0, nZ1,    x1, 0, nZ0,
            x0, 0, nZ0,    x0, 0, nZ1,    x1, 0, nZ1
          ]);
          nSlopeGeo.setAttribute('position', new THREE.BufferAttribute(nVerts, 3));
          nSlopeGeo.computeVertexNormals();
          const nSlopeMesh = new THREE.Mesh(nSlopeGeo, driveMat);
          nSlopeMesh.castShadow = true;
          nSlopeMesh.receiveShadow = true;
          opdRampGroup.add(nSlopeMesh);
          addSharpEdges(nSlopeMesh, 0x0f172a);

          // 4. โครงหลังคาคลุมทางรถขึ้นขนาดใหญ่ (Grand OPD Porte-Cochère Canopy Facing ER)
          const canopyDepth = rDepth + 1.2;  // ยื่นคลุมออกไปทาง ER (~7.0 ม.)
          const canopyLength = rLength + slopeLen * 2; // คลุมยาวตลอดแนวแท่นและทางลาด (~21.1 ม.)
          const canopyX = -b.w / 2 - canopyDepth / 2;  // กึ่งกลางแนวหลังคา
          const canopyZ = rampCenterZ;
          const canopyH = 4.8;               // ความสูงโปร่ง 4.8 ม. รองรับรถตู้/รถพยาบาล/รถรับส่ง
          const canopyY = rH + canopyH;
          const canopyMat = M.mat(0xffffff, { roughness: 0.45 });
          const cRoofMesh = M.box(opdRampGroup, canopyDepth, 0.52, canopyLength, canopyMat, canopyX, canopyY, canopyZ);
          addSharpEdges(cRoofMesh, 0x1e293b);

          // ขอบบัวสีน้ำเงินแพทย์รอบหลังคา (Deep Medical Blue Fascia Trim)
          const trimBlue = M.mat(0x0284c7, { roughness: 0.35 });
          const wTrim = M.box(opdRampGroup, 0.14, 0.65, canopyLength + 0.14, trimBlue, canopyX - canopyDepth / 2 - 0.07, canopyY, canopyZ);
          const sTrim = M.box(opdRampGroup, canopyDepth + 0.14, 0.65, 0.14, trimBlue, canopyX, canopyY, canopyZ + canopyLength / 2 + 0.07);
          const nTrim = M.box(opdRampGroup, canopyDepth + 0.14, 0.65, 0.14, trimBlue, canopyX, canopyY, canopyZ - canopyLength / 2 - 0.07);
          [wTrim, sTrim, nTrim].forEach(m => addSharpEdges(m, 0x0369a1));

          // แถบไฟเพดาน LED ใต้หลังคาคลุม (Under-Canopy Lighting Panels)
          const ledMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
          [-canopyLength * 0.28, 0, canopyLength * 0.28].forEach(lz => {
            const ledStrip = M.box(opdRampGroup, canopyDepth * 0.6, 0.04, 3.2, ledMat, canopyX, canopyY - 0.28, canopyZ + lz);
            addSharpEdges(ledStrip, 0xfef08a);
          });

          // ป้ายไฟหน้าหลังคา (หันหน้าออกไปทาง ER): "🏥 อาคารผู้ป่วยนอก • OPD & SERVICES"
          const opdSignTex = M.canvasTexture(1024, 160, (ctx, cw, ch) => {
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(0, 0, cw, ch);
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 10;
            ctx.strokeRect(6, 6, cw - 12, ch - 12);
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = 'bold 54px Prompt, Tahoma, sans-serif';
            ctx.fillText('🏥 อาคารผู้ป่วยนอก • OPD & SERVICES', cw / 2, ch / 2);
          });
          const opdSignBox = M.box(opdRampGroup, 0.08, 1.05, 14.0, new THREE.MeshStandardMaterial({ map: opdSignTex, roughness: 0.4 }), canopyX - canopyDepth / 2 - 0.1, canopyY + 0.72, canopyZ);
          addSharpEdges(opdSignBox, 0x0369a1);

          // ป้ายไฟด้านข้างฝั่งใต้รับรถจากถนนหลัก: "⬅ ทางเข้า OPD"
          const approachSignTex = M.canvasTexture(512, 160, (ctx, cw, ch) => {
            ctx.fillStyle = '#0369a1';
            ctx.fillRect(0, 0, cw, ch);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 8;
            ctx.strokeRect(6, 6, cw - 12, ch - 12);
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = 'bold 44px Prompt, Tahoma, sans-serif';
            ctx.fillText('⬅ ทางเข้า OPD', cw / 2, ch / 2);
          });
          const sSignBox = M.box(opdRampGroup, 4.5, 0.95, 0.08, new THREE.MeshStandardMaterial({ map: approachSignTex, roughness: 0.4 }), canopyX, canopyY + 0.65, canopyZ + canopyLength / 2 + 0.09);
          addSharpEdges(sSignBox, 0x0369a1);

          // 5. เสาเหล็กกล่องค้ำยันโครงสร้างหลังคา (Structural Support Columns facing ER)
          const pillarMat = M.mat(0x334155, { metalness: 0.6, roughness: 0.25 });
          const colX = canopyX - canopyDepth / 2 + 0.38;
          const colZs = [canopyZ - canopyLength / 2 + 1.4, canopyZ - canopyLength * 0.18, canopyZ + canopyLength * 0.18, canopyZ + canopyLength / 2 - 1.4];
          colZs.forEach(cz => {
            const pillar = M.box(opdRampGroup, 0.45, canopyY, 0.45, pillarMat, colX, canopyY / 2, cz);
            addSharpEdges(pillar, 0x0f172a);
            const pBase = M.box(opdRampGroup, 0.72, 0.42, 0.72, curbMat, colX, 0.21, cz);
            addSharpEdges(pBase, 0x0369a1);
          });

          // 6. ประตูเลื่อนอัตโนมัติกระจกทางเข้าหลัก (Grand Automatic Sliding Doors on West Wall)
          const opdDoorGlass = M.mat(0x0284c7, { roughness: 0.1, metalness: 0.8 });
          const opdDoor = M.box(opdRampGroup, 0.1, 2.7, 5.2, opdDoorGlass, -b.w / 2 + 0.06, rH + 1.35, rampCenterZ);
          addSharpEdges(opdDoor, 0x0f172a);
          // ป้ายเหนือประตูทางเข้า
          const doorHeader = M.box(opdRampGroup, 0.15, 0.45, 5.6, M.mat(0x0284c7), -b.w / 2 + 0.08, rH + 2.92, rampCenterZ);
          addSharpEdges(doorHeader, 0x0369a1);

          // 7. รถยนต์รับ-ส่งผู้ป่วยจอดเทียบอยู่บนทางลาดใต้หลังคา (Patient Drop-off Vehicle)
          const patientCar = M.makeCar(0x2563eb, 'sedan');
          patientCar.position.set(rampX, rH + 0.02, rampCenterZ - 1.2);
          patientCar.rotation.y = 0; // หันหน้าไปตามแนวทางวิ่งเข้าเทียบ
          opdRampGroup.add(patientCar);

          bGroup.add(opdRampGroup);
        } else {
          const doorW = Math.min(2.8, b.w * 0.4);
          const doorMesh = M.box(bGroup, doorW, 2.1, 0.08, M.mat(0x0369a1, { roughness: 0.1 }), 0, 1.05, frontZ + 0.05);
          addSharpEdges(doorMesh, 0x0f172a);
          const canopy = M.box(bGroup, doorW + 1.4, 0.25, 1.8, 0x475569, 0, 2.45, frontZ + 0.9);
          addSharpEdges(canopy, 0x0f172a);
        }

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

    // 4.5 Connecting Corridors between main hospital wings (ทางเชื่อมระหว่างตึก)
    const corrBaseMat = M.mat(0xffffff, { roughness: 0.45 });
    const corrRoofMat = M.mat(0xd6d0c4, { roughness: 0.4 });
    const corrPlinthMat = M.mat(0x475569, { roughness: 0.6 });
    const corrWinMat = M.mat(0x0284c7, { roughness: 0.12, metalness: 0.75 });
    const corrEdgeDark = 0x334155;

    (K.CORRIDORS || []).forEach(corr => {
      const pos = toWorld(corr.px, corr.py);
      const cGroup = new THREE.Group();
      cGroup.position.set(pos.x, 0, pos.z);

      const h = corr.h || 4.2;
      const plinthH = 0.45;

      // 1. Plinth Foundation
      const plinth = M.box(cGroup, corr.w + 0.15, plinthH, corr.d + 0.15, corrPlinthMat, 0, plinthH / 2, 0);
      addSharpEdges(plinth, 0x0f172a);

      // 2. Main Corridor Wall Body
      const cWall = M.box(cGroup, corr.w, h, corr.d, corrBaseMat, 0, h / 2, 0);
      addSharpEdges(cWall, corrEdgeDark);

      // 3. Architectural Glass Window Strips (North and South sides)
      const winFront = M.box(cGroup, corr.w * 0.9, 1.5, 0.1, corrWinMat, 0, 2.1, corr.d / 2 + 0.05);
      const winRear = M.box(cGroup, corr.w * 0.9, 1.5, 0.1, corrWinMat, 0, 2.1, -corr.d / 2 - 0.05);
      addSharpEdges(winFront, 0x0369a1);
      addSharpEdges(winRear, 0x0369a1);

      // Vertical mullions for wider spans (such as ER-OPD)
      if (corr.w > 3.2) {
        [-corr.w * 0.25, corr.w * 0.25].forEach(mx => {
          const mFront = M.box(cGroup, 0.08, 1.52, 0.12, corrPlinthMat, mx, 2.1, corr.d / 2 + 0.05);
          const mRear = M.box(cGroup, 0.08, 1.52, 0.12, corrPlinthMat, mx, 2.1, -corr.d / 2 - 0.05);
          addSharpEdges(mFront, 0x0f172a);
          addSharpEdges(mRear, 0x0f172a);
        });
      }

      // 4. Roof Trim & Parapet
      const cRoof = M.box(cGroup, corr.w + 0.4, 0.35, corr.d + 0.4, corrRoofMat, 0, h + 0.175, 0);
      addSharpEdges(cRoof, 0x1e293b);

      exteriorGroup.add(cGroup);
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
        while (curr && !curr.userData?.pcInfo && !curr.userData?.serverId) {
          curr = curr.parent;
        }
        if (curr && curr.userData?.serverId) {
          openServerModal(curr.userData.serverId);
          return;
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
  let currentPcIp = '';
  let currentPcObject = null;

  function parseIpInfo(ipStr) {
    if (!ipStr) return { cleanIp: '-', extra: '', gateway: '-' };
    const match = String(ipStr).match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    const cleanIp = match ? match[1] : String(ipStr).trim();

    let extra = '';
    const parenMatch = String(ipStr).match(/\(([^)]+)\)/);
    if (parenMatch) {
      extra = parenMatch[1].replace(/🟢|🔴|🟡|ออนไลน์ปกติ|ออนไลน์/g, '').trim();
    }

    let gateway = '-';
    if (cleanIp.startsWith('10.10.100.')) {
      gateway = '10.10.100.1 (MikroTik Core)';
      if (!extra) extra = 'VLAN 100 - Network Management';
    } else if (cleanIp.startsWith('10.10.20.')) {
      gateway = '10.10.20.1 (Core Gateway)';
      if (!extra) extra = 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์';
    } else if (cleanIp.startsWith('10.10.10.')) {
      gateway = '10.10.10.1 (Core Gateway)';
      if (!extra) extra = 'VLAN 10 - Server Subnet';
    } else if (cleanIp.startsWith('10.10.150.')) {
      gateway = '10.10.150.1 (Management Gateway)';
      if (!extra) extra = 'VLAN 150 - IPMI / Hardware Out-of-band';
    } else if (cleanIp.startsWith('192.168.10.')) {
      gateway = '192.168.10.1 (OPD Gateway)';
      if (!extra) extra = 'VLAN 10 - OPD & Clinic Network';
    } else if (cleanIp.startsWith('192.168.12.')) {
      gateway = '192.168.12.1 (Finance/Psych Gateway)';
      if (!extra) extra = 'VLAN 12 - Finance & Admin';
    } else if (cleanIp.startsWith('192.168.14.')) {
      gateway = '192.168.14.1 (Pharmacy Gateway)';
      if (!extra) extra = 'VLAN 14 - Pharmacy Network';
    } else if (cleanIp.startsWith('192.168.15.')) {
      gateway = '192.168.15.1 (Dental Gateway)';
      if (!extra) extra = 'VLAN 15 - Dental Network';
    } else if (cleanIp.startsWith('192.168.16.')) {
      gateway = '192.168.16.1 (ThaiMed/Maint Gateway)';
      if (!extra) extra = 'VLAN 16 - Thai Medicine';
    } else if (cleanIp.startsWith('192.168.18.')) {
      gateway = '192.168.18.1 (Kitchen Gateway)';
      if (!extra) extra = 'VLAN 18 - Kitchen & Nutrition';
    } else if (cleanIp.startsWith('192.168.30.')) {
      gateway = '192.168.30.1 (Physio Gateway)';
      if (!extra) extra = 'VLAN 30 - Physical Therapy';
    } else if (cleanIp.startsWith('192.168.40.')) {
      gateway = '192.168.40.1 (IPD Gateway)';
      if (!extra) extra = 'VLAN 40 - Inpatient Ward';
    } else if (cleanIp.startsWith('192.168.50.')) {
      gateway = '192.168.50.1 (Meeting Hall Gateway)';
      if (!extra) extra = 'VLAN 50 - Conference & Hall';
    } else if (cleanIp.startsWith('192.168.90.')) {
      gateway = '192.168.90.1 (Power/SCADA Gateway)';
      if (!extra) extra = 'VLAN 90 - SCADA & Power Monitoring';
    } else {
      gateway = '192.168.1.1';
      if (!extra) extra = 'VLAN เครือข่ายโรงพยาบาล';
    }

    return { cleanIp, extra, gateway };
  }

  function showPcModal(pc) {
    if (!pc) return;
    currentPcObject = pc;
    const modal = document.getElementById('pc-modal');
    if (!modal) return;

    // 1. General & Header Info
    document.getElementById('pc-name').innerText = pc.name || 'โต๊ะคอมพิวเตอร์';
    document.getElementById('pc-code').innerText = `รหัสครุภัณฑ์: ${pc.code || '-'}`;
    document.getElementById('pc-role').innerText = pc.role || '-';

    const hostEl = document.getElementById('pc-hostname');
    if (hostEl) {
      if (pc.hostname) {
        hostEl.innerText = pc.hostname;
        hostEl.style.display = 'inline-block';
      } else {
        hostEl.style.display = 'none';
      }
    }

    // 2. Dedicated IP & Remote Connection Box
    const netInfo = parseIpInfo(pc.ip);
    currentPcIp = netInfo.cleanIp;

    const ipTextEl = document.getElementById('pc-ip-text');
    if (ipTextEl) ipTextEl.innerText = netInfo.cleanIp;

    const gwEl = document.getElementById('pc-gateway-text');
    if (gwEl) gwEl.innerText = netInfo.gateway;

    const vlanEl = document.getElementById('pc-vlan-text');
    if (vlanEl) vlanEl.innerText = netInfo.extra || 'VLAN มาตรฐานโรงพยาบาล';

    const rdpSpan = document.getElementById('pc-rdp-cmd');
    if (rdpSpan) rdpSpan.innerText = `mstsc /v:${netInfo.cleanIp}`;

    const pingSpan = document.getElementById('pc-ping-cmd');
    if (pingSpan) pingSpan.innerText = `ping -t ${netInfo.cleanIp}`;

    // 2.0 MAC Address & Switch Port Mapping Info
    const macRow = document.getElementById('pc-mac-row');
    const macTextEl = document.getElementById('pc-mac-text');
    const switchBox = document.getElementById('pc-switch-box');
    const dhcpBox = document.getElementById('pc-dhcp-box');

    const macRecord = (pc.mac && K.getPcByMac ? K.getPcByMac(pc.mac) : null);
    const macVal = pc.mac || macRecord?.mac || '';

    if (macVal) {
      if (macRow) {
        macRow.style.display = 'flex';
        if (macTextEl) macTextEl.innerText = macVal;
      }
      if (switchBox) {
        switchBox.style.display = 'block';
        const sNameEl = document.getElementById('pc-switch-name');
        if (sNameEl) sNameEl.innerText = pc.switchName || macRecord?.switchName || 'Cisco SG250-26 (10.10.100.2)';
        const sPortEl = document.getElementById('pc-switch-port');
        if (sPortEl) sPortEl.innerText = pc.switchPort || macRecord?.switchPort || 'Port GE8 (VLAN 20)';
        const sOutletEl = document.getElementById('pc-switch-outlet');
        if (sOutletEl) sOutletEl.innerText = pc.wallOutlet || macRecord?.wallOutlet || 'OPD-ADM-02 (ห้องงานประกันสุขภาพ)';
      }
      if (dhcpBox) {
        dhcpBox.style.display = 'flex';
      }
    } else {
      if (macRow) macRow.style.display = 'none';
      if (switchBox) switchBox.style.display = 'none';
      if (dhcpBox) dhcpBox.style.display = 'none';
    }

    // 2.1 Database Deadlock Status Check
    const deadlock = (K.getDeadlock ? K.getDeadlock(netInfo.cleanIp) || K.getDeadlock(pc.code) : null);
    const dlBanner = document.getElementById('pc-deadlock-banner');
    const remoteStatusEl = document.getElementById('pc-remote-status');
    const toggleDlBtn = document.getElementById('pc-toggle-deadlock-btn');

    if (deadlock) {
      if (dlBanner) {
        dlBanner.classList.remove('hidden');
        const dlServer = document.getElementById('dl-server');
        if (dlServer) dlServer.innerText = deadlock.dbServer || '10.10.10.251:3306 (MariaDB Primary Master)';
        const dlTable = document.getElementById('dl-table');
        if (dlTable) dlTable.innerText = deadlock.table || 'ovst, vn_stat';
        const dlThread = document.getElementById('dl-thread');
        if (dlThread) dlThread.innerText = '#' + (deadlock.threadId || '84920');
        const dlDuration = document.getElementById('dl-duration');
        if (dlDuration) dlDuration.innerText = deadlock.lockTime || (deadlock.lockSeconds ? `${deadlock.lockSeconds} วินาที` : 'ค้างอยู่');
        const dlBlocking = document.getElementById('dl-blocking');
        if (dlBlocking) dlBlocking.innerText = `${deadlock.blockingIp || '-'} (${deadlock.blockingPc || 'เครื่องลูกข่ายอื่น'})`;
        const dlQuery = document.getElementById('dl-query-sql');
        if (dlQuery) dlQuery.innerText = deadlock.waitingQuery || "UPDATE ovst SET oq_status = '2' WHERE vn = '671026084922';";
        const dlKill = document.getElementById('dl-kill-cmd');
        if (dlKill) dlKill.innerText = `KILL ${deadlock.threadId || '84920'};`;
      }
      if (remoteStatusEl) {
        remoteStatusEl.innerText = '⚠️ DEADLOCK (ติดล็อค DB)';
        remoteStatusEl.classList.add('status-deadlock');
      }
      if (toggleDlBtn) {
        toggleDlBtn.innerText = '✅ ปลดล็อค Deadlock เครื่องนี้';
      }
    } else {
      if (dlBanner) dlBanner.classList.add('hidden');
      if (remoteStatusEl) {
        remoteStatusEl.classList.remove('status-deadlock');
        remoteStatusEl.innerText = (pc.status && pc.status.includes('ออนไลน์')) ? '🟢 พร้อมรับรีโมท' : (pc.status || '🟢 พร้อมรับรีโมท');
      }
      if (toggleDlBtn) {
        toggleDlBtn.innerText = '⚠️ จำลอง Deadlock เครื่องนี้';
      }
    }

    const copyBtnText = document.getElementById('pc-copy-btn-text');
    if (copyBtnText) copyBtnText.innerText = 'คัดลอก IP';
    const copyBtn = document.getElementById('pc-copy-ip-btn');
    if (copyBtn) copyBtn.classList.remove('copied');

    // 3. Hardware Specifications Grid
    document.getElementById('pc-specs').innerHTML = `
      <div><small>CPU / ประมวลผล</small><strong>${pc.cpu || '-'}</strong></div>
      <div><small>RAM / หน่วยความจำ</small><strong>${pc.ram || '-'}</strong></div>
      <div><small>Storage / ความจุ</small><strong>${pc.storage || '-'}</strong></div>
      <div><small>จอภาพ (Monitor)</small><strong>${pc.monitor || '-'}</strong></div>
      <div><small>ระบบปฏิบัติการ (OS)</small><strong>${pc.os || '-'}</strong></div>
      <div><small>ผู้รับผิดชอบ / ใช้งาน</small><strong>${pc.user || '-'}</strong></div>
    `;

    // 4. Clinical Systems, Software & Peripherals
    document.getElementById('pc-software').innerHTML = `
      <small>ซอฟต์แวร์ระบบโรงพยาบาล & อุปกรณ์ต่อพ่วง</small>
      <strong>💿 ${pc.software || '-'}</strong>
      <div style="font-size:11px;color:#475569;margin-top:3px;">🔌 อุปกรณ์ต่อพ่วง: ${pc.peripherals || '-'}</div>
    `;
    modal.classList.remove('hidden');
  }

  function closePcModal() {
    const modal = document.getElementById('pc-modal');
    if (modal) modal.classList.add('hidden');
  }

  const pcCloseBtn = document.getElementById('pc-close');
  if (pcCloseBtn) pcCloseBtn.onclick = closePcModal;

  // Remote IP Copy Event Handlers
  const pcCopyIpBtn = document.getElementById('pc-copy-ip-btn');
  if (pcCopyIpBtn) {
    pcCopyIpBtn.onclick = () => {
      if (!currentPcIp || currentPcIp === '-') return;
      navigator.clipboard.writeText(currentPcIp).then(() => {
        const copyBtnText = document.getElementById('pc-copy-btn-text');
        if (copyBtnText) copyBtnText.innerText = 'คัดลอกแล้ว!';
        pcCopyIpBtn.classList.add('copied');
        showToast(`📋 คัดลอก IP: ${currentPcIp} เรียบร้อยแล้ว (พร้อมวางในโปรแกรมรีโมท)`);
        setTimeout(() => {
          if (copyBtnText) copyBtnText.innerText = 'คัดลอก IP';
          pcCopyIpBtn.classList.remove('copied');
        }, 2200);
      }).catch(() => {
        showToast(`IP: ${currentPcIp}`);
      });
    };
  }

  const pcCopyRdpBtn = document.getElementById('pc-copy-rdp-btn');
  if (pcCopyRdpBtn) {
    pcCopyRdpBtn.onclick = () => {
      if (!currentPcIp || currentPcIp === '-') return;
      const cmd = `mstsc /v:${currentPcIp}`;
      navigator.clipboard.writeText(cmd).then(() => {
        showToast(`🖥️ คัดลอกคำสั่ง Remote Desktop: ${cmd}`);
      }).catch(() => {
        showToast(cmd);
      });
    };
  }

  const pcCopyPingBtn = document.getElementById('pc-copy-ping-btn');
  if (pcCopyPingBtn) {
    pcCopyPingBtn.onclick = () => {
      if (!currentPcIp || currentPcIp === '-') return;
      const cmd = `ping -t ${currentPcIp}`;
      navigator.clipboard.writeText(cmd).then(() => {
        showToast(`⚡ คัดลอกคำสั่ง Ping: ${cmd}`);
      }).catch(() => {
        showToast(cmd);
      });
    };
  }

  // Deadlock Banner Actions
  const dlCopyQueryBtn = document.getElementById('dl-copy-query-btn');
  if (dlCopyQueryBtn) {
    dlCopyQueryBtn.onclick = () => {
      const q = document.getElementById('dl-query-sql')?.innerText || '';
      if (!q) return;
      navigator.clipboard.writeText(q).then(() => {
        showToast('📋 คัดลอกคำสั่ง SQL ที่รอค้างเรียบร้อยแล้ว');
      });
    };
  }

  const dlKillBtn = document.getElementById('dl-kill-btn');
  if (dlKillBtn) {
    dlKillBtn.onclick = () => {
      const cmd = document.getElementById('dl-kill-cmd')?.innerText || 'KILL 84920;';
      navigator.clipboard.writeText(cmd).then(() => {
        showToast(`⚡ คัดลอกคำสั่ง MySQL: ${cmd} สำเร็จ (พร้อมรันเพื่อปลด Deadlock)`);
      });
    };
  }

  const dlResolveBtn = document.getElementById('dl-resolve-btn');
  if (dlResolveBtn) {
    dlResolveBtn.onclick = () => {
      if (currentPcIp && K.clearDeadlock) {
        K.clearDeadlock(currentPcIp);
        showToast(`✅ ปลดล็อคสถานะ Deadlock สำหรับ IP ${currentPcIp} เรียบร้อยแล้ว`);
        if (currentPcObject) showPcModal(currentPcObject);
        refreshCurrentInteriorIfActive();
        updateDeadlockStatusEverywhere();
      }
    };
  }

  const pcToggleDlBtn = document.getElementById('pc-toggle-deadlock-btn');
  if (pcToggleDlBtn) {
    pcToggleDlBtn.onclick = () => {
      if (!currentPcIp || currentPcIp === '-') return;
      if (K.toggleDeadlock) {
        const isNowDl = K.toggleDeadlock(currentPcIp, {
          pcCode: currentPcObject?.code,
          pcName: currentPcObject?.name,
          location: currentPcObject?.role
        });
        showToast(isNowDl ? `⚠️ จำลอง Deadlock ที่ IP: ${currentPcIp}` : `✅ เคลียร์ Deadlock ที่ IP: ${currentPcIp}`);
        if (currentPcObject) showPcModal(currentPcObject);
        refreshCurrentInteriorIfActive();
        updateDeadlockStatusEverywhere();
      }
    };
  }

  // MAC Address Copy Handler
  const pcCopyMacBtn = document.getElementById('pc-copy-mac-btn');
  if (pcCopyMacBtn) {
    pcCopyMacBtn.onclick = () => {
      const macVal = document.getElementById('pc-mac-text')?.innerText;
      if (!macVal || macVal === '-') return;
      navigator.clipboard.writeText(macVal).then(() => {
        const copyBtnText = document.getElementById('pc-copy-mac-btn-text');
        if (copyBtnText) copyBtnText.innerText = 'คัดลอกแล้ว!';
        pcCopyMacBtn.classList.add('copied');
        showToast(`📋 คัดลอก MAC Address: ${macVal} เรียบร้อยแล้ว`);
        setTimeout(() => {
          if (copyBtnText) copyBtnText.innerText = 'คัดลอก MAC';
          pcCopyMacBtn.classList.remove('copied');
        }, 2200);
      });
    };
  }

  // Switch View Link Handler
  const pcSwitchViewBtn = document.getElementById('pc-switch-view-btn');
  if (pcSwitchViewBtn) {
    pcSwitchViewBtn.onclick = () => {
      const sId = currentPcObject?.switchId || 'cisco-sg250';
      closePcModal();
      openServerModal(sId);
      setTimeout(() => {
        showSimulatedConsole(sId);
      }, 350);
    };
  }

  // DHCP Renew / Dynamic IP Tracking Handler
  const pcDhcpRenewBtn = document.getElementById('pc-dhcp-renew-btn');
  if (pcDhcpRenewBtn) {
    pcDhcpRenewBtn.onclick = () => {
      const macVal = currentPcObject?.mac || 'D8:5E:D3:4A:2C:9B';
      const currIp = currentPcIp || '10.10.20.147';
      const lastNum = parseInt(currIp.split('.').pop(), 10) || 147;
      const nextNum = lastNum === 147 ? 148 : (lastNum === 148 ? 149 : 147);
      const newIp = `10.10.20.${nextNum}`;

      if (K.updatePcIpByMac) {
        K.updatePcIpByMac(macVal, newIp);
        if (currentPcObject) {
          currentPcObject.ip = newIp;
          showPcModal(currentPcObject);
        }
        showToast(`🔄 เครื่อง ${currentPcObject?.hostname || 'TONOLI-PC'} รีบูต/เปิดเครื่องใหม่\nได้รับ IP ใหม่จาก DHCP: ${newIp} (ระบบอัปเดตตาม MAC ทันที)`);
        refreshCurrentInteriorIfActive();
      }
    };
  }

  // Listen for MAC IP dynamic tracking updates
  window.addEventListener('kss-mac-ip-updated', (e) => {
    if (currentPcObject && currentPcObject.mac === e.detail.mac) {
      currentPcObject.ip = e.detail.ip;
      showPcModal(currentPcObject);
    }
  });

  // --- Toast Notification ---
  function showToast(msg) {
    const toast = document.getElementById('toast-notify');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // --- Copy Helper ---
  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg || '✓ คัดลอกสำเร็จ');
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg || '✓ คัดลอกสำเร็จ');
    } catch (e) {
      alert('คัดลอก: ' + text);
    }
    document.body.removeChild(ta);
  }

  // --- Deadlock Status & Navigation Helpers ---
  function refreshCurrentInteriorIfActive() {
    if (state.mode === 'interior' && state.currentBuilding) {
      enterInterior(state.currentBuilding, true);
    }
  }

  function updateDeadlockStatusEverywhere() {
    const btn = document.getElementById('btn-deadlock-alert');
    const countEl = document.getElementById('deadlock-count');
    const list = (K.getAllDeadlocks ? K.getAllDeadlocks() : []);
    if (btn && countEl) {
      if (list.length > 0) {
        btn.classList.remove('hidden');
        countEl.innerText = list.length;
        btn.title = `ตรวจพบ ${list.length} เครื่องติด Database Deadlock ใน HOSxP (คลิกเพื่อดูและปลดล็อค)`;
      } else {
        btn.classList.add('hidden');
      }
    }
    const serverModal = document.getElementById('server-modal');
    if (serverModal && !serverModal.classList.contains('hidden')) {
      renderServerCards();
    }
  }

  function inspectDeadlockedPc(dl) {
    if (!dl) return;
    const bId = dl.buildingId || 'opd';
    const b = (K.BUILDINGS || []).find(x => x.id === bId || x.interior === bId);
    if (b) {
      selectBuilding(b);
      enterInterior(b);
      setTimeout(() => {
        showPcModal({
          code: dl.pcCode,
          name: dl.pcName,
          ip: dl.ip,
          role: dl.location,
          status: '⚠️ DEADLOCK (ติดล็อค DB)'
        });
      }, 450);
    } else {
      showPcModal({
        code: dl.pcCode,
        name: dl.pcName,
        ip: dl.ip,
        role: dl.location,
        status: '⚠️ DEADLOCK (ติดล็อค DB)'
      });
    }
  }

  // --- Server & Controller Dashboard Logic ---
  let activeServerFilter = 'all';
  let activeServerSearch = '';
  const revealedPasswords = new Set();

  function renderServerCards(targetServerId = null) {
    const container = document.getElementById('server-cards-grid');
    if (!container) return;
    const devices = K.SERVER_DEVICES || [];
    container.innerHTML = '';

    const filtered = devices.filter(d => {
      const matchType = activeServerFilter === 'all' || d.type === activeServerFilter;
      const q = activeServerSearch.toLowerCase().trim();
      const matchSearch = !q ||
        d.name.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.role.toLowerCase().includes(q) ||
        d.typeName.toLowerCase().includes(q);
      return matchType && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div>ไม่พบอุปกรณ์เครื่องแม่ข่ายที่ตรงกับคำค้นหา</div>
        </div>
      `;
      return;
    }

    const allDls = (K.getAllDeadlocks ? K.getAllDeadlocks() : []);

    filtered.forEach(d => {
      const card = document.createElement('div');
      card.className = 'server-card';
      card.id = `server-card-${d.id}`;
      if (targetServerId && d.id === targetServerId) {
        card.style.borderColor = '#38bdf8';
        card.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.5)';
      }

      const isPassRevealed = revealedPasswords.has(d.id);
      const displayPass = isPassRevealed ? d.password : '••••••••••••';
      const isDbHost = (d.id === 'proxmox-dell' || d.id === 'proxmox-hpe');
      const dlBadge = (isDbHost && allDls.length > 0)
        ? `<span class="sc-deadlock-pill" title="มี ${allDls.length} เครื่องลูกข่ายติดปัญหา Deadlock ในฐานข้อมูล">⚠️ ${allDls.length} Deadlock Conflict</span>`
        : '';

      card.innerHTML = `
        <div class="sc-header">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="sc-type-pill sc-type-${d.type}">${d.typeName}</span>
            <span class="sc-loc-pill">📍 ${d.location}</span>
            ${dlBadge}
          </div>
          <span class="sc-status-pill">🟢 Online (${d.ping})</span>
        </div>

        <div>
          <h4 class="sc-title">${d.no ? `[#${d.no}] ` : ''}${d.name}</h4>
          <div class="sc-model">${d.model}</div>
        </div>

        <div class="sc-role">${d.role}</div>

        <div class="sc-ip-box">
          <span style="color:#94a3b8;font-size:11px;">📡 IP Address & Port:</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="sc-ip-val">${d.ip}</span>
            <button class="sc-copy-btn" data-copy="${d.ip}" title="คัดลอก IP">📋</button>
          </div>
        </div>

        <div class="sc-cred-box">
          <div class="sc-cred-row">
            <span class="sc-cred-label">👤 Username:</span>
            <div class="sc-cred-val-wrap">
              <span class="sc-cred-val">${d.username}</span>
              <button class="sc-copy-btn" data-copy="${d.username}" title="คัดลอก Username">📋</button>
            </div>
          </div>
          <div class="sc-cred-row">
            <span class="sc-cred-label">🔑 Password:</span>
            <div class="sc-cred-val-wrap">
              <span class="sc-cred-val" id="pass-txt-${d.id}">${displayPass}</span>
              <button class="sc-eye-btn" data-toggle-pass="${d.id}" title="${isPassRevealed ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}">${isPassRevealed ? '👁️‍🗨️' : '👁️'}</button>
              <button class="sc-copy-btn" data-copy="${d.password}" title="คัดลอก Password">📋</button>
            </div>
          </div>
        </div>

        <div class="sc-telemetry">
          <div class="sc-tel-item">
            <small>CPU Load</small>
            <strong>${d.cpuUsage}%</strong>
          </div>
          <div class="sc-tel-item">
            <small>Memory</small>
            <strong>${d.ramUsage}%</strong>
          </div>
          <div class="sc-tel-item">
            <small>Temp / อุณหภูมิ</small>
            <strong>${d.temp}</strong>
          </div>
        </div>

        <div class="sc-actions">
          <button class="sc-btn-login" data-login-url="${d.url}" title="เปิดหน้าต่างเข้าสู่ระบบ Web GUI จริง">
            🚀 เข้าสู่ระบบ Web Console
          </button>
          <button class="sc-btn-sim" data-sim-id="${d.id}" title="เปิดหน้าจอควบคุมจำลองแบบ Real-time">
            🖥️ หน้าจอควบคุม
          </button>
        </div>
      `;

      // Event listeners for card buttons
      card.querySelectorAll('.sc-copy-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const val = btn.getAttribute('data-copy');
          copyText(val, `✓ คัดลอก "${val}" สำเร็จ`);
        };
      });

      const eyeBtn = card.querySelector(`[data-toggle-pass="${d.id}"]`);
      if (eyeBtn) {
        eyeBtn.onclick = (e) => {
          e.stopPropagation();
          if (revealedPasswords.has(d.id)) {
            revealedPasswords.delete(d.id);
          } else {
            revealedPasswords.add(d.id);
          }
          const passEl = document.getElementById(`pass-txt-${d.id}`);
          const isRev = revealedPasswords.has(d.id);
          if (passEl) passEl.innerText = isRev ? d.password : '••••••••••••';
          eyeBtn.innerText = isRev ? '👁️‍🗨️' : '👁️';
          eyeBtn.title = isRev ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน';
        };
      }

      const loginBtn = card.querySelector('.sc-btn-login');
      if (loginBtn) {
        loginBtn.onclick = (e) => {
          e.stopPropagation();
          const url = loginBtn.getAttribute('data-login-url');
          showToast(`🚀 กำลังเปิดเข้าสู่ระบบ: ${url}\n(User: ${d.username})`);
          window.open(url, '_blank');
        };
      }

      const simBtn = card.querySelector('.sc-btn-sim');
      if (simBtn) {
        simBtn.onclick = (e) => {
          e.stopPropagation();
          showSimulatedConsole(d.id);
        };
      }

      container.appendChild(card);
    });

    // Update Deadlock Alert Banner in Server Modal
    const serverDlBanner = document.getElementById('server-deadlock-banner');
    if (serverDlBanner) {
      if (allDls.length > 0) {
        serverDlBanner.classList.remove('hidden');
        const firstDl = allDls[0];
        const descEl = document.getElementById('server-deadlock-desc');
        if (descEl) {
          descEl.innerText = `พบเครื่องลูกข่าย ${firstDl.pcCode || ''} (IP: ${firstDl.ip}) กำลังรอแถวข้อมูลตาราง ${firstDl.table || 'ovst'} ที่ติดล็อค (${firstDl.lockTime || '184 วินาที'})`;
        }
        const jumpBtn = document.getElementById('server-deadlock-jump-btn');
        if (jumpBtn) {
          jumpBtn.onclick = () => {
            closeServerModal();
            inspectDeadlockedPc(firstDl);
          };
        }
      } else {
        serverDlBanner.classList.add('hidden');
      }
    }

    if (targetServerId) {
      setTimeout(() => {
        const el = document.getElementById(`server-card-${targetServerId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  function openServerModal(targetServerId = null) {
    const modal = document.getElementById('server-modal');
    if (!modal) return;
    if (targetServerId) {
      activeServerFilter = 'all';
      document.querySelectorAll('#server-filter-pills .filter-btn').forEach(b => {
        if (b.getAttribute('data-type') === 'all') b.classList.add('active');
        else b.classList.remove('active');
      });
    }
    renderServerCards(targetServerId);
    modal.classList.remove('hidden');
  }
  window.openServerModal = openServerModal;

  function closeServerModal() {
    const modal = document.getElementById('server-modal');
    if (modal) modal.classList.add('hidden');
  }
  window.closeServerModal = closeServerModal;

  // Filter & Search bindings
  const filterPills = document.querySelectorAll('#server-filter-pills .filter-btn');
  filterPills.forEach(btn => {
    btn.onclick = () => {
      filterPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeServerFilter = btn.getAttribute('data-type') || 'all';
      renderServerCards();
    };
  });

  const searchInput = document.getElementById('server-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      activeServerSearch = e.target.value;
      renderServerCards();
    };
  }

  const serverCloseBtn = document.getElementById('server-modal-close');
  if (serverCloseBtn) serverCloseBtn.onclick = closeServerModal;

  const serverRefreshBtn = document.getElementById('server-refresh-btn');
  if (serverRefreshBtn) {
    serverRefreshBtn.onclick = () => {
      serverRefreshBtn.innerHTML = '⏳ กำลัง Ping...';
      setTimeout(() => {
        serverRefreshBtn.innerHTML = '🔄 ทดสอบเชื่อมต่อ';
        showToast('🟢 ตรวจสอบสถานะการเชื่อมต่อ: 9/9 เครื่อง ตอบสนองปกติ (Ping < 2ms)');
        renderServerCards();
      }, 600);
    };
  }

  const btnServerToolbar = document.getElementById('btn-server');
  if (btnServerToolbar) {
    btnServerToolbar.onclick = () => {
      openServerModal();
    };
  }

  // --- Simulated Console / Web GUI Preview ---
  function showSimulatedConsole(devId) {
    const d = (K.SERVER_DEVICES || []).find(x => x.id === devId);
    if (!d) return;

    const modal = document.getElementById('server-console-modal');
    if (!modal) return;

    document.getElementById('cs-icon').innerText = d.type === 'firewall' ? '🛡️' : (d.type === 'controller' ? '⚡' : '🖥️');
    document.getElementById('cs-title').innerText = `${d.name} — Web Management Console`;
    document.getElementById('cs-subtitle').innerText = d.url;

    const openRealBtn = document.getElementById('cs-open-real-btn');
    if (openRealBtn) {
      openRealBtn.onclick = () => {
        window.open(d.url, '_blank');
      };
    }

    const bodyEl = document.getElementById('cs-body');
    let contentHtml = '';

    if (d.id === 'proxmox-dell' || d.id === 'proxmox-hpe') {
      const isDell = d.id === 'proxmox-dell';
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#e06000;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">PROXMOX VE</span>
              <strong style="font-size:15px;color:#f8fafc;">${isDell ? 'pve-dell-t440' : 'pve-hpe-dl360'} (Cluster Node)</strong>
              <span class="chip" style="background:#22c55e;color:#052e16;">🟢 Standalone Node / Quorum OK</span>
            </div>
            <div style="font-size:12px;color:#94a3b8;">
              Logged in as: <strong style="color:#38bdf8;">${d.username}@pam</strong> | Uptime: ${d.uptime}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 2fr;gap:14px;">
            <div style="background:#0f172a;border-radius:8px;padding:12px;">
              <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">📁 Virtual Machines & CTs</div>
              <ul style="list-style:none;margin:0;padding:0;font-size:12px;display:flex;flex-direction:column;gap:6px;">
                <li style="background:#1e293b;padding:6px 10px;border-radius:6px;display:flex;justify-content:space-between;">
                  <span>🖥️ 100 (HOSxP-Database-Master)</span>
                  <span style="color:#22c55e;">🟢 Running</span>
                </li>
                <li style="background:#1e293b;padding:6px 10px;border-radius:6px;display:flex;justify-content:space-between;">
                  <span>🖥️ 101 (PACS-Imaging-Archive)</span>
                  <span style="color:#22c55e;">🟢 Running</span>
                </li>
                <li style="background:#1e293b;padding:6px 10px;border-radius:6px;display:flex;justify-content:space-between;">
                  <span>🖥️ 102 (LIS-Laboratory-Gateway)</span>
                  <span style="color:#22c55e;">🟢 Running</span>
                </li>
                <li style="background:#1e293b;padding:6px 10px;border-radius:6px;display:flex;justify-content:space-between;">
                  <span>🖥️ 103 (Active-Directory-DC)</span>
                  <span style="color:#22c55e;">🟢 Running</span>
                </li>
                <li style="background:#1e293b;padding:6px 10px;border-radius:6px;display:flex;justify-content:space-between;">
                  <span>🖥️ 104 (Smart-Hospital-API)</span>
                  <span style="color:#22c55e;">🟢 Running</span>
                </li>
              </ul>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;">
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                <div style="background:#0f172a;padding:12px;border-radius:8px;text-align:center;">
                  <small style="color:#94a3b8;">CPU Usage</small>
                  <div style="font-size:20px;font-weight:700;color:#38bdf8;margin:4px 0;">${d.cpuUsage}%</div>
                  <small style="color:#64748b;">${d.cpu}</small>
                </div>
                <div style="background:#0f172a;padding:12px;border-radius:8px;text-align:center;">
                  <small style="color:#94a3b8;">RAM Usage</small>
                  <div style="font-size:20px;font-weight:700;color:#22c55e;margin:4px 0;">${d.ramUsage}%</div>
                  <small style="color:#64748b;">${d.ram}</small>
                </div>
                <div style="background:#0f172a;padding:12px;border-radius:8px;text-align:center;">
                  <small style="color:#94a3b8;">Storage RAID</small>
                  <div style="font-size:20px;font-weight:700;color:#f59e0b;margin:4px 0;">${d.storageUsage}%</div>
                  <small style="color:#64748b;">${d.storage}</small>
                </div>
              </div>

              <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12px;">
                <strong style="color:#f8fafc;">📋 ข้อมูลการเข้าสู่ระบบ:</strong>
                <div style="margin-top:6px;display:flex;gap:18px;color:#cbd5e1;">
                  <div>URL: <code style="color:#38bdf8;">${d.url}</code></div>
                  <div>User: <code style="color:#f8fafc;">${d.username}</code></div>
                  <div>Password: <code style="color:#f8fafc;">${d.password}</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'idrac-dell') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">DELL iDRAC9</span>
              <strong style="font-size:15px;color:#f8fafc;">Integrated Dell Remote Access Controller 9 Enterprise</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 System Health: Healthy</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Power State</small>
              <div style="font-size:18px;font-weight:700;color:#22c55e;">🟢 ON (Operational)</div>
              <small style="color:#64748b;">${d.power}</small>
            </div>
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Thermal & Fans</small>
              <div style="font-size:18px;font-weight:700;color:#38bdf8;">${d.temp} / 3,240 RPM</div>
              <small style="color:#64748b;">Sensor Fan 1–4 Normal</small>
            </div>
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Virtual Console</small>
              <div style="font-size:18px;font-weight:700;color:#f59e0b;">HTML5 Active</div>
              <small style="color:#64748b;">KVM Redirection Ready</small>
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเชื่อมต่อรีโมตคอนโทรลเลอร์:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.150.12</strong></div>
              <div>Username: <strong style="color:#f8fafc;">root</strong></div>
              <div>Password: <strong style="color:#f8fafc;">Ks@042766054$</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ilo-hpe') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#059669;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">HPE iLO 5</span>
              <strong style="font-size:15px;color:#f8fafc;">HPE Integrated Lights-Out 5 (iLO 5) Advanced</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 Overall Security: OK</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Server Subsystem</small>
              <div style="font-size:16px;font-weight:700;color:#22c55e;">HPE ProLiant DL360</div>
              <small style="color:#64748b;">1U Dual-Socket Rack</small>
            </div>
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Diagnostic Status</small>
              <div style="font-size:16px;font-weight:700;color:#38bdf8;">Sensors 3D (All OK)</div>
              <small style="color:#64748b;">Processors, Memory, Temp</small>
            </div>
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Redundant Power</small>
              <div style="font-size:16px;font-weight:700;color:#f59e0b;">Dual Flex Slot (Good)</div>
              <small style="color:#64748b;">Platinum 500W Redundant</small>
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเชื่อมต่อ iLO คอนโทรลเลอร์:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.150.11</strong></div>
              <div>Username: <strong style="color:#f8fafc;">Administrator</strong></div>
              <div>Password: <strong style="color:#f8fafc;">Q68TBKFB</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'fortigate') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#dc2626;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">FORTINET FORTIOS</span>
              <strong style="font-size:15px;color:#f8fafc;">FortiGate Next-Generation Firewall</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 Security Fabric: Active</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Network Throughput</small>
              <div style="font-size:18px;font-weight:700;color:#38bdf8;">380 Mbps</div>
              <small style="color:#64748b;">WAN 1 Gbps Fiber Link</small>
            </div>
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Threat Prevention</small>
              <div style="font-size:18px;font-weight:700;color:#22c55e;">0 Critical Alerts</div>
              <small style="color:#64748b;">IPS, Antivirus, WebFilter</small>
            </div>
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">SSL-VPN Tunnels</small>
              <div style="font-size:18px;font-weight:700;color:#f59e0b;">14 Active Users</div>
              <small style="color:#64748b;">Site-to-Site MoPH Connected</small>
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ FortiGate Admin GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">147.50.107.210</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">qwertyuiop</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'cisco-sg250') {
      const tonoliRecord = K.getPcByMac ? K.getPcByMac('D8:5E:D3:4A:2C:9B') : null;
      const tonoliIp = tonoliRecord?.currentIp || '10.10.20.147';
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">CISCO SMART SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location} (ตู้ Rack A)</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 26-Port Gigabit Core Switch (VLAN Manager)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Firmware & OS</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">v2.5.9.15</div>
              <small style="color:#64748b;">Cisco SG250-26</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">22 / 26 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">VLANs Configured</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">VLAN 10, 20, 100, 150</div>
              <small style="color:#64748b;">802.1Q Multi-VLAN</small>
            </div>
          </div>

          <!-- Health Insurance Department (VLAN 20) Switch Port Table -->
          <div style="background:#022c22;border:1.5px solid #22c55e;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="background:#22c55e;color:#052e16;padding:2px 8px;border-radius:6px;font-weight:800;font-size:11px;">VLAN 20 • ACTIVE PORTS</span>
                <strong style="color:#86efac;font-size:13px;">กลุ่มคอมพิวเตอร์ห้องงานประกันสุขภาพยุทธศาสตร์ (4 เครื่อง)</strong>
              </div>
              <span style="font-size:11px;color:#a7f3d0;font-weight:600;">⚡ 1000 Mbps Full Duplex (Links Up 🟢)</span>
            </div>
            
            <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;font-size:11px;">
              <div style="background:rgba(0,0,0,0.35);padding:8px 10px;border-radius:6px;border:1px solid #166534;">
                <div style="display:flex;justify-content:space-between;color:#86efac;font-weight:700;margin-bottom:3px;">
                  <span>🔌 Port GE7: คอมประกันสุขภาพ 1</span>
                  <span style="color:#fef08a;">NIRUN-PC</span>
                </div>
                <div style="color:#cbd5e1;display:flex;gap:12px;">
                  <span>IP: <strong style="color:#38bdf8;">10.10.20.21</strong></span>
                  <span>MAC: <strong style="color:#fbbf24;font-family:monospace;">14:B3:1F:28:9A:11</strong></span>
                  <span>เต้ารับ: <strong style="color:#f8fafc;">OPD-ADM-01</strong></span>
                </div>
              </div>

              <div style="background:rgba(0,0,0,0.35);padding:8px 10px;border-radius:6px;border:1px solid #166534;">
                <div style="display:flex;justify-content:space-between;color:#86efac;font-weight:700;margin-bottom:3px;">
                  <span>🔌 Port GE8: คอมประกันสุขภาพ 2</span>
                  <span style="color:#fef08a;">TONOLI-PC</span>
                </div>
                <div style="color:#cbd5e1;display:flex;gap:12px;">
                  <span>IP: <strong style="color:#38bdf8;">10.10.20.147</strong></span>
                  <span>MAC: <strong style="color:#fbbf24;font-family:monospace;">D8:5E:D3:4A:2C:9B</strong></span>
                  <span>เต้ารับ: <strong style="color:#f8fafc;">OPD-ADM-02</strong></span>
                </div>
              </div>

              <div style="background:rgba(0,0,0,0.35);padding:8px 10px;border-radius:6px;border:1px solid #166534;">
                <div style="display:flex;justify-content:space-between;color:#86efac;font-weight:700;margin-bottom:3px;">
                  <span>🔌 Port GE9: คอมประกันสุขภาพ 3</span>
                  <span style="color:#fef08a;">พี่ติ๊ก</span>
                </div>
                <div style="color:#cbd5e1;display:flex;gap:12px;">
                  <span>IP: <strong style="color:#38bdf8;">10.10.20.111</strong></span>
                  <span>MAC: <strong style="color:#fbbf24;font-family:monospace;">2C:F0:5D:8B:4E:33</strong></span>
                  <span>เต้ารับ: <strong style="color:#f8fafc;">OPD-ADM-03</strong></span>
                </div>
              </div>

              <div style="background:rgba(0,0,0,0.35);padding:8px 10px;border-radius:6px;border:1px solid #166534;">
                <div style="display:flex;justify-content:space-between;color:#86efac;font-weight:700;margin-bottom:3px;">
                  <span>🔌 Port GE10: คอมประกันสุขภาพ 4</span>
                  <span style="color:#fef08a;">DESKTOP-HOGODQJ</span>
                </div>
                <div style="color:#cbd5e1;display:flex;gap:12px;">
                  <span>IP: <strong style="color:#38bdf8;">10.10.20.135</strong></span>
                  <span>MAC: <strong style="color:#fbbf24;font-family:monospace;">50:EB:71:A9:3D:44</strong></span>
                  <span>เต้ารับ: <strong style="color:#f8fafc;">OPD-ADM-04</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์หลัก Cisco SG250-26 (Port Matrix 1–26):</div>
            <div style="display:grid;grid-template-columns:repeat(13, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 26}, (_, i) => {
                const pNum = i + 1;
                const isInsurancePort = (pNum >= 7 && pNum <= 10);
                const isConnected = pNum <= 22;
                let desc = `GE${pNum}`;
                if (pNum === 1) desc = 'Fortigate';
                else if (pNum === 2) desc = 'MikroTik';
                else if (pNum === 3) desc = 'Dell T440';
                else if (pNum === 4) desc = 'HPE DL360';
                else if (pNum === 5) desc = 'NAS Storage';
                else if (pNum === 6) desc = 'iDRAC Host';
                else if (pNum === 7) desc = 'NIRUN-PC';
                else if (pNum === 8) desc = 'TONOLI-PC';
                else if (pNum === 9) desc = 'พี่ติ๊ก';
                else if (pNum === 10) desc = 'HOGODQJ';
                else if (pNum >= 11 && pNum <= 22) desc = `Dist ${pNum}`;
                else if (pNum >= 25) desc = 'SFP Fiber';

                const borderCol = isInsurancePort ? '#4ade80' : (isConnected ? '#22c55e' : '#475569');
                const bgCol = isInsurancePort ? 'rgba(34,197,94,0.35)' : (isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)');
                return `
                  <div style="background:${bgCol};border:1.5px solid ${borderCol};border-radius:5px;padding:4px 2px;${isInsurancePort ? 'box-shadow:0 0 10px rgba(74,222,128,0.5);' : ''}">
                    <div style="color:${isInsurancePort ? '#86efac' : (isConnected ? '#4ade80' : '#64748b')};font-weight:700;">#${pNum}</div>
                    <div style="color:${isInsurancePort ? '#fef08a' : '#94a3b8'};font-size:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Cisco Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.2</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-opd') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location} (ตู้แร็คแขวนผนังช่อง 1)</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 24 Ports Managed Switch</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN31LB20R3'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">18 / 24 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 24 (Trunk)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับห้องเภสัช (Switch Port Matrix 1–24):</div>
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 24}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 18;
                let desc = `Port ${pNum}`;
                if (pNum >= 1 && pNum <= 7) desc = `คอมจ่ายยา ${pNum}`;
                else if (pNum === 8) desc = 'เครื่องพิมพ์ฉลาก';
                else if (pNum === 9) desc = 'เครื่องพิมพ์ใบสั่ง';
                else if (pNum === 24) desc = 'Uplink Core';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.6</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-xray') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location}</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 24 Ports Managed Switch (PACS/DICOM)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN32LB90X7'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">16 / 24 Ports</div>
              <small style="color:#64748b;">1 Gbps (Jumbo Frame)</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 24 (Fiber SFP)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับห้อง X-Ray (Switch Port Matrix 1–24):</div>
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 24}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 16 || pNum === 24;
                let desc = `Port ${pNum}`;
                if (pNum === 1) desc = 'DR X-Ray Unit';
                else if (pNum === 2) desc = 'PACS Workstation 1';
                else if (pNum === 3) desc = 'PACS Workstation 2';
                else if (pNum === 4) desc = 'PC X-Ray (RIS)';
                else if (pNum === 5) desc = 'PC X-Ray 1';
                else if (pNum === 6) desc = 'Dry Laser Imager';
                else if (pNum === 7) desc = 'CR Digitizer';
                else if (pNum === 8) desc = 'Portable DR Unit';
                else if (pNum === 9) desc = 'Worklist Server';
                else if (pNum === 10) desc = 'AP Wi-Fi X-Ray';
                else if (pNum === 11) desc = 'IP Phone X-Ray';
                else if (pNum === 12) desc = 'CCTV ห้องตรวจ';
                else if (pNum === 13) desc = 'CCTV ห้องควบคุม';
                else if (pNum === 14) desc = 'Barcode Printer';
                else if (pNum === 15) desc = 'เครื่องพิมพ์ผล X-Ray';
                else if (pNum === 16) desc = 'สำรอง Mobile X-Ray';
                else if (pNum === 24) desc = 'Uplink Core SFP';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.7</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-drivers') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location}</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 16 Ports Managed Switch</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN32LB80W1'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">10 / 16 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 16 (Fiber SFP)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับตึก พขร. (Switch Port Matrix 1–16):</div>
            <div style="display:grid;grid-template-columns:repeat(8, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 16}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 10 || pNum === 16;
                let desc = `Port ${pNum}`;
                if (pNum === 1) desc = 'PC 1669 Dispatch';
                else if (pNum === 2) desc = 'PC GPS Tracker';
                else if (pNum === 3) desc = 'Radio Base 1669';
                else if (pNum === 4) desc = 'CCTV โรงรถ 1';
                else if (pNum === 5) desc = 'CCTV โรงรถ 2';
                else if (pNum === 6) desc = 'CCTV สนง. พขร.';
                else if (pNum === 7) desc = 'AP Wi-Fi ตึก พขร.';
                else if (pNum === 8) desc = 'IP Phone 1669';
                else if (pNum === 9) desc = 'Printer ใบสั่งรถ';
                else if (pNum === 10) desc = 'สำรอง EMS Unit';
                else if (pNum === 16) desc = 'Uplink Core SFP';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.8</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-pcu') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location}</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 24 Ports Managed Switch (Primary Care)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN32LB95P4'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">15 / 24 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 24 (Fiber SFP)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับกลุ่มงาน PCU (Switch Port Matrix 1–24):</div>
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 24}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 15 || pNum === 24;
                let desc = `Port ${pNum}`;
                if (pNum === 1) desc = 'PC ห้องตรวจ 1 (Vaccine)';
                else if (pNum === 2) desc = 'PC ห้องตรวจ 2 (Doctor)';
                else if (pNum === 3) desc = 'PC ห้องตรวจ 3';
                else if (pNum === 4) desc = 'PC คัดกรอง PCU 1';
                else if (pNum === 5) desc = 'PC คัดกรอง PCU 2';
                else if (pNum === 6) desc = 'PC ทันตกรรม PCU';
                else if (pNum === 7) desc = 'PC ส่งเสริมสุขภาพ';
                else if (pNum === 8) desc = 'PC เยี่ยมบ้าน HOSxP';
                else if (pNum === 9) desc = 'TV เรียกคิวหน้าห้อง';
                else if (pNum === 10) desc = 'AP Wi-Fi โถง PCU';
                else if (pNum === 11) desc = 'IP Phone คัดกรอง';
                else if (pNum === 12) desc = 'IP Phone ห้องตรวจ 2';
                else if (pNum === 13) desc = 'CCTV ทางเดิน PCU';
                else if (pNum === 14) desc = 'CCTV หน้าห้องตรวจ';
                else if (pNum === 15) desc = 'Printer ฉลาก/ใบสั่ง';
                else if (pNum === 24) desc = 'Uplink Core SFP';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.9</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-ipd') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location}</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 24 Ports Managed Switch (Inpatient Ward)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN32LB98D2'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">18 / 24 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 24 (Fiber SFP)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับตึกผู้ป่วยใน (Switch Port Matrix 1–24):</div>
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 24}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 18 || pNum === 24;
                let desc = `Port ${pNum}`;
                if (pNum === 1) desc = 'PC โต๊ะคอม IPC 1';
                else if (pNum === 2) desc = 'PC โต๊ะคอม IPC 2';
                else if (pNum === 3) desc = 'PC โต๊ะคอม IPC 3';
                else if (pNum === 4) desc = 'Nurse Call Master';
                else if (pNum === 5) desc = 'Nurse Call Gateway';
                else if (pNum === 6) desc = 'Smart Ward Tablet 1';
                else if (pNum === 7) desc = 'Smart Ward Tablet 2';
                else if (pNum === 8) desc = 'CCTV หอผู้ป่วย 1';
                else if (pNum === 9) desc = 'CCTV หอผู้ป่วย 2';
                else if (pNum === 10) desc = 'CCTV Nurse Station';
                else if (pNum === 11) desc = 'AP Wi-Fi วอร์ดใน';
                else if (pNum === 12) desc = 'AP Wi-Fi แยกโรค';
                else if (pNum === 13) desc = 'IP Phone Nurse Station';
                else if (pNum === 14) desc = 'IP Phone แพทย์เวร';
                else if (pNum === 15) desc = 'Printer ใบ Admit IPD';
                else if (pNum === 16) desc = 'Printer ฉลากยา IPD';
                else if (pNum === 17) desc = 'ห้องแยกโรค Isolation 1';
                else if (pNum === 18) desc = 'ห้องแยกโรค Isolation 2';
                else if (pNum === 24) desc = 'Uplink Core SFP';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.11</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-psych') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location}</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 24 Ports Managed Switch (Psychiatric & Substance Clinic)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN32LB99K5'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">14 / 24 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 24 (Fiber SFP)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับตึกจิตเวชและยาเสพติด (Switch Port Matrix 1–24):</div>
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 24}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 13 || pNum === 24;
                let desc = `Port ${pNum}`;
                if (pNum === 1) desc = 'PC ห้องหัวหน้า (PC-01)';
                else if (pNum === 2) desc = 'PC บำบัดยาเสพติด 1 (PC-02)';
                else if (pNum === 3) desc = 'PC บำบัดยาเสพติด 2 (PC-03)';
                else if (pNum === 4) desc = 'PC คัดกรองสุขภาพจิต (PC-04)';
                else if (pNum === 5) desc = 'Printer เวชระเบียนจิตเวช';
                else if (pNum === 6) desc = 'Printer ฉลากยาเมทาโดน';
                else if (pNum === 7) desc = 'CCTV ทางเดินหน้าห้อง';
                else if (pNum === 8) desc = 'CCTV ห้องสงบอารมณ์ 1';
                else if (pNum === 9) desc = 'CCTV ห้องสงบอารมณ์ 2';
                else if (pNum === 10) desc = 'AP Wi-Fi ตึกจิตเวช';
                else if (pNum === 11) desc = 'IP Phone ห้องทำงาน';
                else if (pNum === 12) desc = 'IP Phone ห้องบำบัดกลุ่ม';
                else if (pNum === 13) desc = 'Smart TV สื่อกิจกรรมบำบัด';
                else if (pNum === 24) desc = 'Uplink Core SFP';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.12</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-admin') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location}</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 24 Ports Managed Switch (General Administration)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN32LB99M8'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">16 / 24 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 24 (Fiber SFP)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับห้องกลุ่มงานบริหารทั่วไป (Switch Port Matrix 1–24):</div>
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 24}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 15 || pNum === 24;
                let desc = `Port ${pNum}`;
                if (pNum === 1) desc = 'PC สารบรรณ (PC-ADM-01)';
                else if (pNum === 2) desc = 'PC การเงิน (PC-ADM-02)';
                else if (pNum === 3) desc = 'PC พัสดุ e-GP (PC-ADM-03)';
                else if (pNum === 4) desc = 'PC บุคคล HRMS (PC-ADM-04)';
                else if (pNum === 5) desc = 'PC แผนงาน (PC-ADM-05)';
                else if (pNum === 6) desc = 'PC ยานพาหนะ (PC-ADM-06)';
                else if (pNum === 7) desc = 'PC ตรวจสอบภายใน (PC-ADM-07)';
                else if (pNum === 8) desc = 'โต๊ะทำงานธุรการสารบรรณ';
                else if (pNum === 9) desc = 'Laser Printer สารบรรณ';
                else if (pNum === 10) desc = 'Laser Printer การเงิน/เช็ค';
                else if (pNum === 11) desc = 'Scanner ความเร็วสูง e-Doc';
                else if (pNum === 12) desc = 'AP Wi-Fi กลุ่มงานบริหาร';
                else if (pNum === 13) desc = 'IP Phone สารบรรณกลาง';
                else if (pNum === 14) desc = 'IP Phone การเงิน/บัญชี';
                else if (pNum === 15) desc = 'CCTV ทางเดินหน้าห้องบริหาร';
                else if (pNum === 24) desc = 'Uplink Core SFP';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.13</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-rompho1') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location}</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 24 Ports Managed Switch (Rompho 3 - Floor 1)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN32LB99R1'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">17 / 24 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 24 (Fiber SFP)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับตึกร่มโพธิ์ ชั้น 1 (Switch Port Matrix 1–24):</div>
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 24}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 16 || pNum === 24;
                let desc = `Port ${pNum}`;
                if (pNum === 1) desc = 'PC ห้องคลอด 1 (PC-ROM-01)';
                else if (pNum === 2) desc = 'PC พัฒนาการเด็ก (PC-DEV-01)';
                else if (pNum === 3) desc = 'PC ระบาดวิทยา (PC-EPI-01)';
                else if (pNum === 4) desc = 'จอ GIS Dashboard 506';
                else if (pNum === 5) desc = 'Nurse Call ห้องคลอด Master';
                else if (pNum === 6) desc = 'Nurse Call ห้องพักคลอด Gateway';
                else if (pNum === 7) desc = 'OR Delivery 1 Monitor';
                else if (pNum === 8) desc = 'Baby Incubator Telemetry';
                else if (pNum === 9) desc = 'Printer สูติบัตร/แจ้งเกิด';
                else if (pNum === 10) desc = 'Printer เวชระเบียนสูติ';
                else if (pNum === 11) desc = 'AP Wi-Fi แผนกห้องคลอด';
                else if (pNum === 12) desc = 'AP Wi-Fi ทางเดินหน้าอาคาร';
                else if (pNum === 13) desc = 'IP Phone เคาน์เตอร์คลอด';
                else if (pNum === 14) desc = 'IP Phone ห้องพักแพทย์';
                else if (pNum === 15) desc = 'CCTV ทางเดินหน้าห้องคลอด';
                else if (pNum === 16) desc = 'CCTV ประตูเข้า-ออกอาคาร';
                else if (pNum === 24) desc = 'Uplink Core SFP';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.14</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (d.id === 'ksp-sw-kitchen') {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">ARUBA / HPE SWITCH</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.ip}) — จุดติดตั้ง: ${d.location}</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 24 Ports Managed Switch (Nutrition & Kitchen)</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Serial Number (S/N)</small>
              <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;">${d.serial || 'CN32LB99K7'}</div>
              <small style="color:#64748b;">HPE Hardware Tag</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:14px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Active Ports</small>
              <div style="font-size:14px;font-weight:700;color:#f59e0b;">12 / 24 Ports</div>
              <small style="color:#64748b;">1 Gbps Full-Duplex</small>
            </div>
            <div style="background:#0f172a;padding:10px;border-radius:8px;">
              <small style="color:#94a3b8;">Uplink to Core</small>
              <div style="font-size:14px;font-weight:700;color:#a855f7;">Port 24 (Fiber SFP)</div>
              <small style="color:#64748b;">→ Cisco SG250 Core</small>
            </div>
          </div>

          <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;">🔌 แผงพอร์ตสวิตช์ฮับโรงครัวและโภชนาการ (Switch Port Matrix 1–24):</div>
            <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:6px;font-size:10px;text-align:center;">
              ${Array.from({length: 24}, (_, i) => {
                const pNum = i + 1;
                const isConnected = pNum <= 11 || pNum === 24;
                let desc = `Port ${pNum}`;
                if (pNum === 1) desc = 'PC หัวหน้าโรงครัว (PC-KIT-02)';
                else if (pNum === 2) desc = 'PC เจ้าหน้าที่โรงครัว (PC-KIT-01)';
                else if (pNum === 3) desc = 'Printer ใบสั่งอาหารผู้ป่วย';
                else if (pNum === 4) desc = 'Printer ฉลากอาหารเฉพาะโรค';
                else if (pNum === 5) desc = 'ระบบตู้แช่วัตถุดิบ IoT Temp';
                else if (pNum === 6) desc = 'เครื่องชั่งดิจิทัลโภชนาการ';
                else if (pNum === 7) desc = 'AP Wi-Fi อาคารโรงครัว';
                else if (pNum === 8) desc = 'IP Phone ห้องหัวหน้าโรงครัว';
                else if (pNum === 9) desc = 'IP Phone โถงประกอบอาหาร';
                else if (pNum === 10) desc = 'CCTV พื้นที่ทำอาหารกลาง';
                else if (pNum === 11) desc = 'CCTV คลังวัตถุดิบ/ของแห้ง';
                else if (pNum === 24) desc = 'Uplink Core SFP';
                return `
                  <div style="background:${isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(51,65,85,0.4)'};border:1px solid ${isConnected ? '#22c55e' : '#475569'};border-radius:5px;padding:4px 2px;">
                    <div style="color:${isConnected ? '#4ade80' : '#64748b'};font-weight:700;">#${pNum}</div>
                    <div style="color:#94a3b8;font-size:8.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">พารามิเตอร์การเข้าสู่ระบบ Switch Management Web GUI:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP: <strong style="color:#38bdf8;">10.10.100.15</strong></div>
              <div>Username: <strong style="color:#f8fafc;">admin</strong></div>
              <div>Password: <strong style="color:#f8fafc;">ksp@12345</strong></div>
            </div>
          </div>
        </div>
      `;
    } else {
      contentHtml = `
        <div style="background:#182234;border:1px solid #334155;border-radius:10px;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:12px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#0284c7;color:#fff;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">${d.typeName.toUpperCase()}</span>
              <strong style="font-size:15px;color:#f8fafc;">${d.name} (${d.model})</strong>
            </div>
            <span class="chip" style="background:#22c55e;color:#052e16;">🟢 Status: Operational</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:14px;">
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Location / จุดติดตั้ง</small>
              <div style="font-size:16px;font-weight:700;color:#38bdf8;">${d.location}</div>
              <small style="color:#64748b;">Central Hospital Rack</small>
            </div>
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">System Uptime</small>
              <div style="font-size:16px;font-weight:700;color:#22c55e;">${d.uptime}</div>
              <small style="color:#64748b;">Ping latency ${d.ping}</small>
            </div>
            <div style="background:#0f172a;padding:12px;border-radius:8px;">
              <small style="color:#94a3b8;">Power & Health</small>
              <div style="font-size:16px;font-weight:700;color:#f59e0b;">Normal (OK)</div>
              <small style="color:#64748b;">${d.power}</small>
            </div>
          </div>

          <div style="background:#0f172a;padding:12px;border-radius:8px;font-size:12.5px;">
            <div style="color:#94a3b8;margin-bottom:6px;">ข้อมูลเชื่อมต่อสำหรับเข้าสู่ระบบ:</div>
            <div style="display:flex;gap:20px;color:#f8fafc;">
              <div>IP / URL: <strong style="color:#38bdf8;">${d.ip}</strong></div>
              <div>Username: <strong style="color:#f8fafc;">${d.username}</strong></div>
              <div>Password: <strong style="color:#f8fafc;">${d.password}</strong></div>
            </div>
          </div>
        </div>
      `;
    }

    bodyEl.innerHTML = contentHtml;
    modal.classList.remove('hidden');
  }
  window.showSimulatedConsole = showSimulatedConsole;

  const csCloseBtn = document.getElementById('cs-close-btn');
  if (csCloseBtn) {
    csCloseBtn.onclick = () => {
      const modal = document.getElementById('server-console-modal');
      if (modal) modal.classList.add('hidden');
    };
  }

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

    // Performance: Disable sun shadow pass while inside interior rooms for smooth 60fps
    sunLight.castShadow = false;

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

      // Deadlock Tag Check
      const dl = (l.pcInfo && K.getDeadlock) ? (K.getDeadlock(l.pcInfo.ip) || K.getDeadlock(l.pcInfo.code)) : null;
      if (dl) {
        labelDiv.className += ' deadlock';
        labelDiv.innerHTML = `⚠️ <strong>DEADLOCK</strong> • ${l.text}`;
        labelDiv.title = `⚠️ เครื่องนี้ติด Database Deadlock (${dl.table})! คลิกเพื่อดูรายละเอียดและสั่ง Kill Thread`;
        labelDiv.onclick = (e) => {
          e.stopPropagation();
          showPcModal(l.pcInfo);
        };
      } else if (l.serverId) {
        labelDiv.title = 'คลิกเพื่อตรวจสอบสถานะ & เข้าสู่ระบบ';
        labelDiv.onclick = (e) => {
          e.stopPropagation();
          openServerModal(l.serverId);
        };
      } else if (l.toggleId) {
        const isServerToggle = l.toggleId === 'open-server-dashboard' || l.toggleId === 'opd-server';
        labelDiv.title = isServerToggle ? 'คลิกเพื่อเปิดระบบตรวจสอบสถานะเครื่องแม่ข่าย & เข้าสู่ระบบ' : 'คลิกเพื่อสลับสถานะ ว่าง / ไม่ว่าง';
        labelDiv.onclick = (e) => {
          e.stopPropagation();
          if (isServerToggle) {
            openServerModal();
            return;
          }
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
      let icon = '📌';
      let title = '';
      let status = '';
      let toggleId = null;
      let badgeCls = '';
      let pcInfo = null;

      if (Array.isArray(it)) {
        icon = it[0] || '📌';
        title = it[1] || '';
        status = it[2] || '';
        toggleId = it[3] || null;
        badgeCls = it[4] || '';
        pcInfo = it[5] || null;
      } else if (typeof it === 'object' && it !== null) {
        icon = it.icon || (it.name && it.name.includes('คอม') ? '🖥️' : (it.name && it.name.includes('ห้อง') ? '🚪' : '📌'));
        title = it.name || it.title || '';
        status = it.status || '';
        toggleId = it.toggleId || it.id || null;
        badgeCls = it.badgeCls || (status.includes('🔴') || status.includes('ไม่ว่าง') || status.includes('ตรวจ') || status.includes('ประชุม') ? 'busy' : 'free');
        pcInfo = it.pcInfo || null;
      }

      // Deadlock Status Check in Interior Item List
      const dl = (pcInfo && K.getDeadlock) ? (K.getDeadlock(pcInfo.ip) || K.getDeadlock(pcInfo.code)) : null;
      if (dl) {
        badgeCls = 'deadlock';
        status = `⚠️ Deadlock (${dl.table || 'DB Lock'})`;
      }

      if (toggleId) {
        li.className = 'clickable';
        const isServerToggle = toggleId === 'open-server-dashboard' || toggleId === 'opd-server' || toggleId.startsWith('server-');
        li.title = isServerToggle ? 'คลิกเพื่อเปิดระบบตรวจสอบสถานะเครื่องแม่ข่าย & เข้าสู่ระบบ' : 'คลิกเพื่อสลับสถานะ ว่าง / ไม่ว่าง';
        li.onclick = () => {
          if (isServerToggle) {
            const sId = toggleId.startsWith('server-') ? toggleId.replace('server-', '') : null;
            openServerModal(sId);
            return;
          }
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
      li.innerHTML = `<span class="e">${icon}</span><span class="t">${title}</span><span class="q ${badgeCls}">${status}</span>`;
      listEl.appendChild(li);
    });

    document.getElementById('interior-bar').classList.remove('hidden');
    document.getElementById('interior-items').classList.remove('hidden');

    // Floor Switcher UI (สำหรับอาคารหลายชั้น เช่น ตึกร่มโพธิ์ 3)
    const floorSelectorEl = document.getElementById('int-floor-selector');
    if (floorSelectorEl) {
      if (data.floors && data.floors.length > 1) {
        floorSelectorEl.innerHTML = '';
        data.floors.forEach(f => {
          const btn = document.createElement('button');
          btn.className = 'floor-btn' + (f.num === data.currentFloor ? ' active' : '');
          btn.innerText = f.label || `ชั้น ${f.num}`;
          btn.title = `คลิกเพื่อสลับไปยัง ${f.label || 'ชั้น ' + f.num}`;
          btn.onclick = () => {
            if (f.num !== data.currentFloor) {
              if (data.onSelectFloor) {
                data.onSelectFloor(f.num);
              }
              enterInterior(b, true);
            }
          };
          floorSelectorEl.appendChild(btn);
        });
        floorSelectorEl.classList.remove('hidden');
      } else {
        floorSelectorEl.innerHTML = '';
        floorSelectorEl.classList.add('hidden');
      }
    }

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

    // Restore sun shadow in exterior mode
    sunLight.castShadow = true;

    interiorGroup.visible = false;
    clearInteriorScene();
    exteriorGroup.visible = true;
    pinObjects.forEach(p => { p.obj.visible = true; if (p.obj.element) p.obj.element.style.display = ''; });

    document.getElementById('interior-bar').classList.add('hidden');
    document.getElementById('interior-items').classList.add('hidden');
    const floorSelectorEl = document.getElementById('int-floor-selector');
    if (floorSelectorEl) floorSelectorEl.classList.add('hidden');

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

  // Deadlock Toolbar Button Handler & Global Event Listener
  const btnDlAlert = document.getElementById('btn-deadlock-alert');
  if (btnDlAlert) {
    btnDlAlert.onclick = () => {
      const list = (K.getAllDeadlocks ? K.getAllDeadlocks() : []);
      if (list.length > 0) {
        inspectDeadlockedPc(list[0]);
      } else {
        showToast('✓ ไม่พบรายการ Deadlock ในระบบ');
      }
    };
  }

  window.addEventListener('kss-deadlock-change', () => {
    updateDeadlockStatusEverywhere();
    refreshCurrentInteriorIfActive();
  });

  // Initial check for active deadlocks on load
  updateDeadlockStatusEverywhere();

  // --- Animation Loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    controls.update();

    // Thai flag waving animation (only in exterior mode to maximize frame rate)
    if (state.mode === 'exterior' && flagAnimationObj && flagAnimationObj.userData.base) {
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
