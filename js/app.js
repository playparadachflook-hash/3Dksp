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
