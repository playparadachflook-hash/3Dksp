// =========================================================================
// OPD INTERIOR MODULE (ตึกผู้ป่วยนอก & บริหาร)
// =========================================================================
(function () {
  const K = window.KSS;
  const M = K.M;
  const C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  // --- STATE FOR OPD INTERIOR ---
  const opdState = {
    examRooms: [
      { id: 'opd-exam-1', name: 'ห้องตรวจ 1 (CASKCAP)', occupied: false, doc: 'พญ.ณัชชา' },
      { id: 'opd-exam-2', name: 'ห้องตรวจ 2', occupied: true,  doc: 'พญ.ศิรินทิพย์' },
      { id: 'opd-exam-3', name: 'ห้องตรวจ 3 (DOCTOR-OPD3)', occupied: false, doc: 'นพ.อดิเทพ' },
      { id: 'opd-exam-4', name: 'ห้องตรวจ 4 (DOCTOR4)', occupied: true,  doc: 'นพ.ธนากร' },
      { id: 'opd-exam-5', name: 'ห้องตรวจ 5 (DOCTOR5)', occupied: false, doc: 'นพ.วรวิต' },
      { id: 'opd-exam-6', name: 'ห้องตรวจ 6', occupied: false, doc: 'พญ.ณัฐธิดา' }
    ],
    ekgOccupied: false,
    screeningActive: true,
    serverOnline: true,
    confMedOccupied: false,
    confGovOccupied: false,
    directorOccupied: true
  };

  function buildOpdInterior(b) {
    const g = new THREE.Group();
    const L = [];

    // Expanded interior dimensions: 48.0m x 26.0m (expanded for spacious and comfortable rooms)
    const W = 48.0;
    const D = 26.0;
    const WH = 3.2;
    const wThick = 0.18;
    const xMin = -W / 2; // -24.0
    const xMax = W / 2;  //  24.0
    const zMin = -D / 2; // -13.0
    const zMax = D / 2;  //  13.0

    // Floors with distinct zones
    // 1. General polished clinical floor (clean floor throughout, no blue strips)
    floor(g, W, D, '#f8fafc', '#e2e8f0', 0.6, 0, 0);

    // 2. Exam rooms sage green floor (expanded: width 23.4m, depth 5.0m)
    const examFloorTex = M.tileTexture('#ecfdf5', '#a7f3d0', 23.4 / 0.5, 5.0 / 0.5);
    const mExamFloor = M.box(g, 23.4, 0.105, 5.0, M.mat(0xffffff, { map: examFloorTex, roughness: 0.6 }), -12.3, -0.047, -6.5);
    addEdges(mExamFloor, 0x059669);

    // 3. Buddha room teak wood floor (expanded: width 5.2m, depth 7.8m)
    const woodTex = M.tileTexture('#78350f', '#451a03', 5.2 / 0.4, 7.8 / 0.4);
    const mWoodFloor = M.box(g, 5.2, 0.11, 7.8, M.mat(0xffffff, { map: woodTex, roughness: 0.4 }), -3.2, -0.045, 8.9);
    addEdges(mWoodFloor, 0x92400e);

    // 4. Server room anti-static ESD dark tiles (expanded: width 4.0m, depth 5.0m)
    const serverTex = M.tileTexture('#0f172a', '#0284c7', 4.0 / 0.4, 5.0 / 0.4);
    const mServerFloor = M.box(g, 4.0, 0.11, 5.0, M.mat(0xffffff, { map: serverTex, roughness: 0.5 }), 12.5, -0.045, 4.7);
    addEdges(mServerFloor, 0x0284c7);

    // 5. Restrooms moisture-resistant ceramic floor (expanded: width 12.3m, depth 4.6m)
    const wcTex = M.tileTexture('#e2e8f0', '#94a3b8', 12.3 / 0.4, 4.6 / 0.4);
    const mWcFloor = M.box(g, 12.3, 0.11, 4.6, M.mat(0xffffff, { map: wcTex, roughness: 0.7 }), 17.65, -0.045, -1.5);
    addEdges(mWcFloor, 0x64748b);

    // 6. Director & Admin rooms warm carpet flooring (expanded: width 6.3m, depth 4.3m)
    const carpetTex = M.tileTexture('#fef3c7', '#d97706', 6.3 / 0.5, 4.3 / 0.5);
    const mDirFloor = M.box(g, 6.3, 0.11, 4.3, M.mat(0xffffff, { map: carpetTex, roughness: 0.8 }), 20.65, -0.045, 10.65);
    addEdges(mDirFloor, 0xb45309);

    // Materials
    const mWall = M.mat(0xffffff, { roughness: 0.85 });
    const mWallPart = M.mat(0xf1f5f9, { roughness: 0.85 });
    const mDark = M.mat(0x0f172a);
    const mSteel = M.mat(0x94a3b8, { metalness: 0.6, roughness: 0.3 });
    const mGold = M.mat(0xf59e0b, { metalness: 0.75, roughness: 0.25 });
    const mWood = M.mat(0xb45309, { roughness: 0.5 });
    const mTeak = M.mat(0x78350f, { roughness: 0.6 });
    const mGlass = M.mat(0x38bdf8, { transparent: true, opacity: 0.45, roughness: 0.1 });
    const mBlueSeat = M.mat(0x0284c7, { roughness: 0.6 });
    const mLeather = M.mat(0x1e293b, { roughness: 0.4 });

    function wall(x1, z1, x2, z2, thick = 0.16, h = WH, isOuter = false) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
      const mat = isOuter ? mWall : mWallPart;
      const m = M.box(g, thick, h, len, mat, cx, h / 2, cz);
      m.rotation.y = angle;
      addEdges(m, isOuter ? 0x94a3b8 : 0xcbd5e1);
      return m;
    }

    function doorWay(x, z, rotY = 0, w = 1.1) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;
      const frameM = M.mat(0x475569);
      M.box(dg, 0.08, WH, 0.08, frameM, -w / 2, WH / 2, 0);
      M.box(dg, 0.08, WH, 0.08, frameM, w / 2, WH / 2, 0);
      M.box(dg, w, 0.08, 0.08, frameM, 0, 2.2, 0);
      M.box(dg, w, WH - 2.2, 0.14, mWallPart, 0, 2.2 + (WH - 2.2) / 2, 0);
      const leaf = M.box(dg, w - 0.08, 2.14, 0.04, M.mat(0x38bdf8, { transparent: true, opacity: 0.4 }), 0.15, 1.07, 0.2);
      leaf.rotation.y = -0.45;
      g.add(dg);
    }

    function doubleDoorWay(x, z, rotY = 0, w = 1.8) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;
      const frameM = M.mat(0x1e293b);
      M.box(dg, 0.09, WH, 0.09, frameM, -w / 2, WH / 2, 0);
      M.box(dg, 0.09, WH, 0.09, frameM, w / 2, WH / 2, 0);
      M.box(dg, w, 0.09, 0.09, frameM, 0, 2.2, 0);
      M.box(dg, w, WH - 2.2, 0.14, mWallPart, 0, 2.2 + (WH - 2.2) / 2, 0);
      const leafL = M.box(dg, w / 2 - 0.05, 2.14, 0.05, M.mat(0x334155, { metalness: 0.6 }), -w / 4, 1.07, 0.15);
      leafL.rotation.y = -0.35;
      const leafR = M.box(dg, w / 2 - 0.05, 2.14, 0.05, M.mat(0x334155, { metalness: 0.6 }), w / 4, 1.07, 0.15);
      leafR.rotation.y = 0.35;
      g.add(dg);
    }

    function makeChair(parent, x, z, rotY = 0, color = 0x0284c7) {
      const cg = new THREE.Group();
      cg.position.set(x, 0, z);
      cg.rotation.y = rotY;
      const cmat = M.mat(color, { roughness: 0.6 });
      M.box(cg, 0.44, 0.05, 0.44, cmat, 0, 0.45, 0);
      M.box(cg, 0.44, 0.45, 0.05, cmat, 0, 0.7, -0.2);
      [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([lx, lz]) => {
        M.box(cg, 0.03, 0.45, 0.03, mSteel, lx, 0.225, lz);
      });
      parent.add(cg);
      return cg;
    }

    function makeExecutiveChair(parent, x, z, rotY = 0) {
      const cg = new THREE.Group();
      cg.position.set(x, 0, z);
      cg.rotation.y = rotY;
      M.box(cg, 0.56, 0.08, 0.54, mLeather, 0, 0.48, 0);
      M.box(cg, 0.54, 0.72, 0.08, mLeather, 0, 0.88, -0.24);
      M.box(cg, 0.08, 0.24, 0.42, mLeather, -0.26, 0.68, 0);
      M.box(cg, 0.08, 0.24, 0.42, mLeather, 0.26, 0.68, 0);
      M.box(cg, 0.08, 0.46, 0.08, mSteel, 0, 0.23, 0);
      M.box(cg, 0.52, 0.03, 0.52, mSteel, 0, 0.06, 0);
      parent.add(cg);
      return cg;
    }

    function workDesk(opts) {
      const {
        x, z, w = 1.25, d = 0.65, rotY = 0,
        hasPC = true, label = null, pcInfo = null, hasChair = true, hasVisitor = false
      } = opts;
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      const topM = M.mat(0xe2e8f0, { roughness: 0.5 });
      const deskTop = M.box(dg, w, 0.05, d, topM, 0, 0.72, 0);
      addEdges(deskTop, 0x475569);
      M.box(dg, w - 0.06, 0.7, d - 0.06, M.mat(0x94a3b8), 0, 0.35, 0);

      if (hasPC) {
        const mon = M.box(dg, 0.44, 0.3, 0.03, mDark, 0, 0.94, -d / 2 + 0.12);
        addEdges(mon, 0x38bdf8);
        M.box(dg, 0.4, 0.25, 0.01, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.94, -d / 2 + 0.14);
        M.box(dg, 0.05, 0.12, 0.05, mDark, 0, 0.78, -d / 2 + 0.12);
        M.box(dg, 0.32, 0.02, 0.12, mDark, 0, 0.75, 0.06);
        M.box(dg, 0.18, 0.38, 0.38, M.mat(0x1e293b), w / 2 - 0.16, 0.2, 0);
      }

      if (hasChair) {
        makeChair(dg, 0, 0.52, Math.PI, 0x334155);
      }
      if (hasVisitor) {
        makeChair(dg, 0, -0.52, 0, 0x0284c7);
      }

      if (pcInfo) {
        dg.traverse((ch) => { if (ch.isMesh) ch.userData.pcInfo = pcInfo; });
        if (label) {
          L.push({
            text: label,
            pos: V(x, 1.45, z),
            cls: 'int-label pc-tag',
            pcInfo
          });
        }
      }

      g.add(dg);
      return dg;
    }

    // DOCTOR DESK: Specifically designed for ห้องตรวจ 1-6 flush against the right wall (+X inside room)
    function doctorDesk(opts) {
      const {
        x, z, rotY = 0, w = 1.3, d = 0.7,
        label = null, pcInfo = null
      } = opts;
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      // Desk body
      const topM = M.mat(0xf8fafc, { roughness: 0.4 });
      const deskTop = M.box(dg, w, 0.06, d, topM, 0, 0.74, 0);
      addEdges(deskTop, 0x0284c7);
      M.box(dg, w - 0.06, 0.71, d - 0.06, M.mat(0xcbd5e1), 0, 0.355, 0);

      // Computer monitor against wall (+X) facing doctor (-X)
      const mon = M.box(dg, 0.03, 0.34, 0.48, mDark, w / 2 - 0.1, 0.98, 0);
      addEdges(mon, 0x0ea5e9);
      M.box(dg, 0.01, 0.28, 0.42, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.5 }), w / 2 - 0.12, 0.98, 0);
      M.box(dg, 0.06, 0.14, 0.06, mDark, w / 2 - 0.1, 0.81, 0);
      // Keyboard & mouse
      M.box(dg, 0.14, 0.02, 0.34, mDark, w / 2 - 0.28, 0.77, 0);
      M.box(dg, 0.08, 0.02, 0.05, mDark, w / 2 - 0.28, 0.77, 0.24);
      // CPU tower underneath
      M.box(dg, 0.4, 0.4, 0.2, M.mat(0x0f172a), 0, 0.22, d / 2 - 0.15);

      // Doctor chair (facing right towards desk/PC)
      makeChair(dg, -0.65, 0, Math.PI / 2, 0x1e293b);
      // Patient consultation chair (facing desk)
      makeChair(dg, 0, -0.68, 0, 0x0284c7);

      // Medical items on desk (prescription pad, stethoscope)
      M.box(dg, 0.2, 0.02, 0.15, M.mat(0xffffff), 0, 0.78, 0.15);
      M.cyl(dg, 0.04, 0.04, 0.02, 12, mSteel, 0.15, 0.78, -0.15);

      if (pcInfo) {
        dg.traverse((ch) => { if (ch.isMesh) ch.userData.pcInfo = pcInfo; });
        if (label) {
          L.push({
            text: label,
            pos: V(x, 1.5, z),
            cls: 'int-label pc-tag',
            pcInfo
          });
        }
      }

      g.add(dg);
      return dg;
    }

    function examBed(x, z, rotY = 0, label = null) {
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);
      bg.rotation.y = rotY;

      // Bed frame
      M.box(bg, 0.9, 0.45, 2.0, mSteel, 0, 0.225, 0);
      // Mattress & sheet
      const mat = M.box(bg, 0.86, 0.14, 1.96, M.mat(0xecfdf5, { roughness: 0.6 }), 0, 0.52, 0);
      addEdges(mat, 0x10b981);
      // Pillow
      M.box(bg, 0.6, 0.08, 0.35, M.mat(0xffffff), 0, 0.61, -0.72);
      // Stainless steel side safety rails
      M.box(bg, 0.04, 0.26, 1.2, mSteel, -0.44, 0.65, 0);
      M.box(bg, 0.04, 0.26, 1.2, mSteel, 0.44, 0.65, 0);
      // IV Drip stand
      const iv = new THREE.Group();
      iv.position.set(-0.55, 0, -0.85);
      M.cyl(iv, 0.015, 0.015, 1.8, 8, mSteel, 0, 0.9, 0);
      M.box(iv, 0.35, 0.04, 0.35, mSteel, 0, 0.02, 0);
      M.cyl(iv, 0.08, 0.08, 0.25, 10, M.mat(0x38bdf8, { transparent: true, opacity: 0.6 }), 0, 1.7, 0);
      bg.add(iv);

      g.add(bg);
      return bg;
    }

    function waitingBenches(x, z, count, rotY = 0) {
      const wg = new THREE.Group();
      wg.position.set(x, 0, z);
      wg.rotation.y = rotY;
      const spacing = 0.55;
      const totalW = count * spacing;
      // Steel gang beam
      M.box(wg, totalW, 0.05, 0.08, mSteel, 0, 0.38, 0);
      [-totalW / 2 + 0.2, 0, totalW / 2 - 0.2].forEach((lx) => {
        M.box(wg, 0.04, 0.38, 0.45, mSteel, lx, 0.19, 0);
      });
      // Individual seats
      for (let i = 0; i < count; i++) {
        const sx = -totalW / 2 + spacing * (i + 0.5);
        const seat = M.box(wg, 0.46, 0.05, 0.42, mBlueSeat, sx, 0.44, 0);
        addEdges(seat, 0x0369a1);
        M.box(wg, 0.46, 0.42, 0.05, mBlueSeat, sx, 0.68, -0.19);
      }
      g.add(wg);
      return wg;
    }

    function bpStation(x, z, num, rotY = 0) {
      const bpg = new THREE.Group();
      bpg.position.set(x, 0, z);
      bpg.rotation.y = rotY;
      // Compact table
      const tb = M.box(bpg, 0.8, 0.04, 0.6, M.mat(0xf1f5f9), 0, 0.72, 0);
      addEdges(tb, 0x64748b);
      M.box(bpg, 0.76, 0.7, 0.56, M.mat(0xcbd5e1), 0, 0.35, 0);
      // Automatic Blood Pressure Monitor
      const mon = M.box(bpg, 0.32, 0.24, 0.28, M.mat(0xffffff), 0, 0.86, 0);
      addEdges(mon, 0x0284c7);
      // Arm tunnel cylinder
      M.cyl(bpg, 0.09, 0.09, 0.29, 16, M.mat(0x334155), 0, 0.86, 0, Math.PI / 2);
      // Digital readout
      M.box(bpg, 0.18, 0.12, 0.01, M.mat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.6 }), 0, 0.94, -0.145);
      // Patient stool
      makeChair(bpg, 0, 0.55, Math.PI, 0x0284c7);

      L.push({
        text: `💓 BP ${num} (จุดวัดความดัน)`,
        pos: V(x, 1.45, z),
        cls: 'int-label sub-tag'
      });

      g.add(bpg);
      return bpg;
    }

    function serverRackDetailed(rackId, x, z, rotY = 0) {
      const rg = new THREE.Group();
      rg.position.set(x, 0, z);
      rg.rotation.y = rotY;

      // 42U Rack cabinet chassis
      const cab = M.box(rg, 0.82, 2.25, 0.95, M.mat(0x0f172a, { metalness: 0.85, roughness: 0.2 }), 0, 1.125, 0);
      addEdges(cab, 0x0284c7);

      // Top ventilation & internal rack rails
      M.box(rg, 0.76, 0.04, 0.88, M.mat(0x1e293b), 0, 2.23, 0);
      M.box(rg, 0.04, 2.1, 0.04, M.mat(0x64748b, { metalness: 0.9 }), -0.36, 1.1, 0.42);
      M.box(rg, 0.04, 2.1, 0.04, M.mat(0x64748b, { metalness: 0.9 }), 0.36, 1.1, 0.42);

      // Front glass door (semi-transparent)
      const door = M.box(rg, 0.74, 2.15, 0.02, M.mat(0x38bdf8, { transparent: true, opacity: 0.28, roughness: 0.1 }), 0, 1.1, 0.47);
      addEdges(door, 0x38bdf8);

      if (rackId === 'rack-a') {
        // --- Rack A: Dell T440, iDRAC 9, Fortigate 100F, NAS-KSP ---
        // 1. Proxmox Server DELL T440 (Hypervisor Node 1)
        const dellSrv = M.box(rg, 0.7, 0.28, 0.82, M.mat(0x1e293b, { metalness: 0.7 }), 0, 1.62, 0);
        addEdges(dellSrv, 0x2563eb);
        dellSrv.userData.serverId = 'proxmox-dell';
        M.box(rg, 0.68, 0.26, 0.02, M.mat(0x0f172a), 0, 1.62, 0.42);
        M.box(rg, 0.12, 0.04, 0.01, M.mat(0x0284c7), -0.22, 1.68, 0.435);
        M.box(rg, 0.04, 0.02, 0.01, M.mat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.9 }), 0.22, 1.68, 0.435);

        // 2. iDRAC Remote Controller unit
        const idrac = M.box(rg, 0.7, 0.08, 0.8, M.mat(0x0284c7), 0, 1.40, 0);
        addEdges(idrac, 0x38bdf8);
        idrac.userData.serverId = 'idrac-dell';
        M.box(rg, 0.06, 0.02, 0.01, M.mat(0xf59e0b, { emissive: 0xf59e0b, emissiveIntensity: 0.9 }), 0.22, 1.40, 0.42);

        // 3. Fortigate Firewall (Next-Gen UTM)
        const fg = M.box(rg, 0.7, 0.10, 0.75, M.mat(0xf8fafc), 0, 1.18, 0);
        addEdges(fg, 0xdc2626);
        fg.userData.serverId = 'fortigate';
        M.box(rg, 0.68, 0.03, 0.01, M.mat(0xdc2626, { emissive: 0xdc2626, emissiveIntensity: 0.8 }), 0, 1.20, 0.40);
        for (let p = -0.24; p <= 0.24; p += 0.06) {
          M.box(rg, 0.03, 0.02, 0.01, M.mat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.8 }), p, 1.16, 0.40);
        }

        // 4. NAS-KSP Storage Array (8-Bay Storage)
        const nas = M.box(rg, 0.7, 0.22, 0.82, M.mat(0x334155), 0, 0.84, 0);
        addEdges(nas, 0x10b981);
        nas.userData.serverId = 'nas-ksp';
        for (let bay = -0.25; bay <= 0.25; bay += 0.072) {
          M.box(rg, 0.055, 0.16, 0.02, M.mat(0x1e293b), bay, 0.84, 0.42);
          M.box(rg, 0.015, 0.015, 0.005, M.mat(0x10b981, { emissive: 0x10b981, emissiveIntensity: 0.9 }), bay, 0.90, 0.435);
        }

        // Heavy Rack UPS & Battery Module
        M.box(rg, 0.7, 0.28, 0.85, M.mat(0x0f172a), 0, 0.38, 0);
        M.box(rg, 0.14, 0.08, 0.01, M.mat(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.7 }), 0.2, 0.38, 0.43);

      } else {
        // --- Rack B: Proxmox HPE DL360, iLO 5, Mikrotik Router, Cisco SG250, Aruba 1930 ---
        // 1. Proxmox Server HPE DL360 (1U Enterprise Server)
        const hpeSrv = M.box(rg, 0.7, 0.10, 0.84, M.mat(0x334155, { metalness: 0.8 }), 0, 1.70, 0);
        addEdges(hpeSrv, 0x10b981);
        hpeSrv.userData.serverId = 'proxmox-hpe';
        M.box(rg, 0.68, 0.08, 0.02, M.mat(0x0f172a), 0, 1.70, 0.43);
        M.box(rg, 0.06, 0.02, 0.01, M.mat(0x059669), -0.24, 1.70, 0.445);

        // 2. HPE iLO 5 Dedicated Remote Controller
        const ilo = M.box(rg, 0.7, 0.08, 0.8, M.mat(0x1e293b), 0, 1.54, 0);
        addEdges(ilo, 0x10b981);
        ilo.userData.serverId = 'ilo-hpe';
        M.box(rg, 0.06, 0.02, 0.01, M.mat(0x10b981, { emissive: 0x10b981, emissiveIntensity: 0.9 }), 0.22, 1.54, 0.42);

        // 3. Mikrotik Cloud Core Router
        const mkt = M.box(rg, 0.7, 0.09, 0.75, M.mat(0xf1f5f9), 0, 1.34, 0);
        addEdges(mkt, 0x0284c7);
        mkt.userData.serverId = 'mikrotik';
        M.box(rg, 0.12, 0.03, 0.01, M.mat(0x0f172a), -0.22, 1.34, 0.40);
        for (let p = -0.1; p <= 0.25; p += 0.04) {
          M.box(rg, 0.025, 0.02, 0.01, M.mat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.8 }), p, 1.34, 0.40);
        }

        // 4. Cisco SG250 Core Switch
        const cisco = M.box(rg, 0.7, 0.09, 0.75, M.mat(0x0284c7), 0, 1.14, 0);
        addEdges(cisco, 0x38bdf8);
        cisco.userData.serverId = 'cisco-sg250';
        for (let p = -0.25; p <= 0.25; p += 0.035) {
          M.box(rg, 0.02, 0.018, 0.01, M.mat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.8 }), p, 1.14, 0.40);
        }

        // 5. Aruba Instant On 1930 PoE Switch
        const aruba = M.box(rg, 0.7, 0.09, 0.75, M.mat(0xe2e8f0), 0, 0.94, 0);
        addEdges(aruba, 0xf97316);
        aruba.userData.serverId = 'aruba-1930';
        for (let p = -0.25; p <= 0.25; p += 0.035) {
          M.box(rg, 0.02, 0.018, 0.01, M.mat(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.8 }), p, 0.94, 0.40);
        }

        // Lower Cable Management & Patch Panels
        M.box(rg, 0.7, 0.09, 0.75, M.mat(0x1e293b), 0, 0.70, 0);
        M.box(rg, 0.7, 0.14, 0.85, M.mat(0x0f172a), 0, 0.48, 0);
      }

      g.add(rg);
      return rg;
    }

    function serverRack(x, z, rotY = 0) {
      return serverRackDetailed('rack-a', x, z, rotY);
    }

    function confTable(opts) {
      const { x, z, w = 3.6, d = 1.4, seats = 8 } = opts;
      const tg = new THREE.Group();
      tg.position.set(x, 0, z);
      const top = M.box(tg, w, 0.06, d, mWood, 0, 0.74, 0);
      addEdges(top, 0x78350f);
      M.box(tg, w - 0.4, 0.71, d - 0.4, mLeather, 0, 0.355, 0);
      // Chairs along top & bottom
      const perSide = Math.floor(seats / 2);
      const step = (w - 0.6) / (perSide > 1 ? perSide - 1 : 1);
      for (let i = 0; i < perSide; i++) {
        const cx = -(w - 0.6) / 2 + i * step;
        makeExecutiveChair(tg, cx, -d / 2 - 0.35, 0);
        makeExecutiveChair(tg, cx, d / 2 + 0.35, Math.PI);
      }
      g.add(tg);
      return tg;
    }

    function buddhaAltar(x, z) {
      const ag = new THREE.Group();
      ag.position.set(x, 0, z);
      // Tiered Altar tables (โต๊ะหมู่บูชา)
      M.box(ag, 2.0, 0.4, 1.0, mTeak, 0, 0.2, 0);
      M.box(ag, 1.5, 0.3, 0.7, mTeak, 0, 0.55, -0.15);
      M.box(ag, 0.9, 0.3, 0.45, mTeak, 0, 0.85, -0.25);
      // Golden Buddha statue
      const bg = new THREE.Group();
      bg.position.set(0, 1.0, -0.25);
      // Base
      M.cyl(bg, 0.24, 0.28, 0.08, 16, mGold, 0, 0.04, 0);
      // Torso & head
      M.cyl(bg, 0.13, 0.17, 0.32, 12, mGold, 0, 0.24, 0);
      M.cyl(bg, 0.07, 0.07, 0.14, 12, mGold, 0, 0.47, 0);
      // Ushnisha & aura flame
      M.cyl(bg, 0.02, 0.04, 0.1, 8, mGold, 0, 0.59, 0);
      ag.add(bg);

      // Lotus vases, candles & incense burner
      M.cyl(ag, 0.05, 0.04, 0.22, 10, mGold, -0.55, 0.8, -0.2);
      M.cyl(ag, 0.05, 0.04, 0.22, 10, mGold, 0.55, 0.8, -0.2);
      M.cyl(ag, 0.06, 0.05, 0.12, 12, mGold, 0, 0.76, 0.1);

      // Offering flowers (pink lotus)
      M.cyl(ag, 0.08, 0.02, 0.12, 8, M.mat(0xf472b6), -0.55, 0.95, -0.2);
      M.cyl(ag, 0.08, 0.02, 0.12, 8, M.mat(0xf472b6), 0.55, 0.95, -0.2);

      // Prayer kneeling mats (เบาะกราบ)
      [-0.55, 0, 0.55].forEach((mx) => {
        M.box(ag, 0.42, 0.04, 0.42, M.mat(0xd97706), mx, 0.02, 0.8);
      });

      g.add(ag);
      return ag;
    }

    function restroomFixtures(gender, x, z, w, d) {
      const rg = new THREE.Group();
      rg.position.set(x, 0, z);
      // Washbasin counter
      const basinCounter = M.box(rg, w - 0.6, 0.78, 0.6, M.mat(0xf8fafc), 0, 0.39, -d / 2 + 0.45);
      addEdges(basinCounter, 0x64748b);
      // Mirror
      M.box(rg, w - 0.7, 0.9, 0.02, mGlass, 0, 1.3, -d / 2 + 0.1);
      // Cubicles at the rear (+Z)
      const cubW = 1.1;
      const numCub = Math.min(4, Math.floor((w - 0.6) / cubW));
      for (let i = 0; i < numCub; i++) {
        const cx = -(numCub - 1) * cubW / 2 + i * cubW;
        // Cubicle partition
        M.box(rg, 0.04, 2.0, 1.4, M.mat(0xcbd5e1), cx - cubW / 2, 1.0, d / 2 - 0.7);
        // Toilet bowl
        M.box(rg, 0.4, 0.42, 0.54, M.mat(0xffffff), cx, 0.21, d / 2 - 0.45);
      }
      if (gender === 'male') {
        // Urinals
        [-0.8, 0, 0.8].forEach((ux) => {
          M.box(rg, 0.34, 0.65, 0.26, M.mat(0xffffff), ux, 0.75, 0);
          M.box(rg, 0.03, 0.85, 0.38, M.mat(0x94a3b8), ux - 0.24, 0.8, 0);
          M.box(rg, 0.03, 0.85, 0.38, M.mat(0x94a3b8), ux + 0.24, 0.8, 0);
        });
      }
      g.add(rg);
      return rg;
    }

    // ==========================================
    // SPECIFICATIONS FOR COMPUTERS (OPD_PC_SPECS)
    // ==========================================
    const pcSpec = (code, name, role, user, ipSuffix, sw = 'HOSxP v3.6 / Windows 11', extra = {}) => ({
      code,
      name,
      role,
      user,
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
      ram: '16 GB DDR4-3200',
      storage: '512 GB M.2 NVMe SSD',
      monitor: '23.8" IPS Full HD (1920x1080)',
      ip: String(ipSuffix).includes('.') ? ipSuffix : `192.168.10.${ipSuffix}`,
      software: sw,
      peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, UPS 850VA',
      status: '🟢 ออนไลน์ปกติ',
      ...extra
    });

    // --- OUTER WALLS ---
    wall(xMin, zMin, xMax, zMin, wThick, WH, true); // North wall
    wall(xMin, zMax, xMax, zMax, wThick, WH, true); // South wall
    wall(xMin, zMin, xMin, zMax, wThick, WH, true); // West wall
    wall(xMax, zMin, xMax, zMax, wThick, WH, true); // East wall

    // ==========================================
    // 1. LEFT WING: OPD CLINIC & EXAM ROOMS 1-6
    // Expanded: x = -24.0 to -0.6 (Width = 23.4m)
    // ==========================================
    // Rear Nurse Rest Room along top: z = -13.0 to -9.0, x = -24.0 to -0.6 (Depth = 4.0m)
    wall(-24.0, -9.0, -0.6, -9.0, wThick, WH); // Wall separating rest room & exam rooms
    // Doors into rest room from Room 6 and Room 1
    doorWay(-22.0, -9.0, 0, 1.1);
    doorWay(-2.5, -9.0, 0, 1.1);
    // Door from rest room into the new corridor on left of EKG
    doorWay(-0.6, -11.0, Math.PI / 2, 1.1);

    // Front wall of exam rooms: z = -4.0, x = -24.0 to -0.6 (Exam rooms depth = 5.0m: -9.0 to -4.0)
    // Openings for doors in front of Rooms 6, 5, 4, 3, 2, 1
    const examDoorsX = [-22.05, -18.15, -14.25, -10.35, -6.45, -2.55];
    let lastWx = -24.0;
    examDoorsX.forEach((dx) => {
      wall(lastWx, -4.0, dx - 0.6, -4.0, wThick, WH);
      doorWay(dx, -4.0, 0, 1.2);
      lastWx = dx + 0.6;
    });
    wall(lastWx, -4.0, -0.6, -4.0, wThick, WH);

    // Vertical dividing walls between Exam rooms:
    // Room 6: [-24.0, -20.1] (width 3.9m)
    // Room 5: [-20.1, -16.2] (width 3.9m)
    // Room 4: [-16.2, -12.3] (width 3.9m)
    // Room 3: [-12.3,  -8.4] (width 3.9m)
    // Room 2: [ -8.4,  -4.5] (width 3.9m)
    // Room 1: [ -4.5,  -0.6] (width 3.9m, right wall at -0.6)
    const examDividers = [-20.1, -16.2, -12.3, -8.4, -4.5];
    examDividers.forEach((vx) => {
      // Interconnecting doors between exam rooms
      wall(vx, -9.0, vx, -7.0, wThick, WH);
      doorWay(vx, -6.5, Math.PI / 2, 1.0);
      wall(vx, -6.0, vx, -4.0, wThick, WH);
    });

    // Right wall of Room 1 and Nurse Rest Room (bordering new corridor at x = -0.6):
    wall(-0.6, -13.0, -0.6, -11.6, wThick, WH);
    // doorway at -11.0 into corridor
    wall(-0.6, -10.4, -0.6, -7.0, wThick, WH);
    doorWay(-0.6, -6.5, Math.PI / 2, 1.0); // Door from Room 1 into corridor
    wall(-0.6, -6.0, -0.6, -4.0, wThick, WH);

    // Populate Exam Rooms 1 to 6
    // USER MANDATE: "ห้องตรวจ 1-6 มีคอมพิวเตอร์ 1 เครื่องชิดกำแพงขวา"
    const examRoomDefs = [
      { num: 6, xL: -24.0, xR: -20.1, doc: 'พญ.ณัฐธิดา', specCode: 'PC-EXAM-06', ip: '66' },
      { 
        num: 5, xL: -20.1, xR: -16.2, doc: 'นพ.วรวิต สิทธิวิทยานิชย์', specCode: 'PC-EXAM-05', 
        ip: '10.10.30.39', hostname: 'DOCTOR5', mac: 'D4:5D:64:8B:11:05',
        switchId: 'ksp-sw-opd', switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
        switchPort: 'Port 5 (VLAN 30)', wallOutlet: 'OPD-EXAM-05 (ห้องตรวจโรค 5)'
      },
      { 
        num: 4, xL: -16.2, xR: -12.3, doc: 'นพ.ธนากร วากลาง', specCode: 'PC-EXAM-04', 
        ip: '10.10.30.38', hostname: 'DOCTOR4', mac: 'D4:5D:64:8B:11:04',
        switchId: 'ksp-sw-opd', switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
        switchPort: 'Port 4 (VLAN 30)', wallOutlet: 'OPD-EXAM-04 (ห้องตรวจโรค 4)'
      },
      { 
        num: 3, xL: -12.3, xR:  -8.4, doc: 'นพ.อดิเทพ จันทราภรณ์', specCode: 'PC-EXAM-03', 
        ip: '10.10.30.40', hostname: 'DOCTOR-OPD3', mac: 'D4:5D:64:8B:11:03',
        switchId: 'ksp-sw-opd', switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
        switchPort: 'Port 3 (VLAN 30)', wallOutlet: 'OPD-EXAM-03 (ห้องตรวจโรค 3)'
      },
      { num: 2, xL:  -8.4, xR:  -4.5, doc: 'พญ.ศิรินทิพย์', specCode: 'PC-EXAM-02', ip: '62' },
      { 
        num: 1, xL:  -4.5, xR:  -0.6, doc: 'พญ.ณัชชา สัตยา', specCode: 'PC-EXAM-01', 
        ip: '10.10.30.43', hostname: 'CASKCAP', mac: 'D4:5D:64:8B:11:01',
        switchId: 'ksp-sw-opd', switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
        switchPort: 'Port 1 (VLAN 30)', wallOutlet: 'OPD-EXAM-01 (ห้องตรวจโรค 1)'
      }
    ];

    examRoomDefs.forEach((r) => {
      const roomMidX = (r.xL + r.xR) / 2;
      // 1. Doctor desk FLUSH AGAINST RIGHT WALL (x = r.xR - 0.45)
      doctorDesk({
        x: r.xR - 0.45,
        z: -5.5,
        rotY: 0,
        label: `🖳 คอมห้องตรวจ ${r.num}${r.hostname ? ' (' + r.hostname + ')' : ''}`,
        pcInfo: pcSpec(
          r.specCode, 
          `คอมห้องตรวจ ${r.num}`, 
          `ระบบเวชระเบียนและสั่งการรักษาแพทย์ ห้องตรวจ ${r.num}`, 
          `แพทย์ตรวจโรค (${r.doc})`, 
          r.ip, 
          'HOSxP Doctor Station / Electronic Medical Record (EMR)',
          {
            hostname: r.hostname,
            mac: r.mac,
            switchId: r.switchId,
            switchName: r.switchName,
            switchPort: r.switchPort,
            wallOutlet: r.wallOutlet,
            gateway: '10.10.30.1 (OPD Gateway)',
            vlan: 'VLAN 30 - ห้องตรวจแพทย์และบริการผู้ป่วยนอก (OPD)'
          }
        )
      });

      // 2. Exam bed on the left side of room
      examBed(r.xL + 1.0, -6.5, 0);

      // 3. Washbasin / hand sanitation cabinet
      M.box(g, 0.45, 0.78, 0.45, M.mat(0xf8fafc), r.xL + 0.4, 0.39, -8.3);
      M.cyl(g, 0.02, 0.02, 0.12, 8, mSteel, r.xL + 0.4, 0.84, -8.3);

      // 4. Interactive Room Status Badge
      const isOcc = opdState.examRooms.find((er) => er.id === `opd-exam-${r.num}`).occupied;
      L.push({
        text: `🚪 ห้องตรวจ ${r.num} (${r.doc}) ${isOcc ? '🔴 กำลังตรวจ' : '🟢 ว่าง'}`,
        pos: V(roomMidX, 2.3, -6.5),
        cls: `int-label toggleable ${isOcc ? 'busy' : 'free'}`,
        toggleId: `opd-exam-${r.num}`
      });
    });

    // Nurses' Rest Room (ห้องพักพยาบาล) along top
    L.push({
      text: '🛋️ ห้องพักพยาบาล (Staff Lounge)',
      pos: V(-12.3, 2.2, -11.0),
      cls: 'int-label room-title'
    });
    // Rest room furniture
    M.box(g, 4.0, 0.45, 0.85, mLeather, -15.0, 0.225, -11.2); // Sofa
    M.box(g, 1.6, 0.35, 0.7, mWood, -15.0, 0.175, -10.0);    // Coffee table
    M.box(g, 0.5, 1.4, 0.5, M.mat(0x38bdf8), -8.0, 0.7, -11.2); // Water dispenser
    M.box(g, 3.2, 2.0, 0.5, mSteel, -4.0, 1.0, -11.2);       // Staff lockers

    // =======================================================
    // CORRIDOR ON THE LEFT OF EKG (ปรับให้ห้อง EKG ฝั่งซ้ายเป็นทางเดิน)
    // x from -0.6 to 2.2, z from -13.0 to -4.0 (Width: 2.8m)
    // =======================================================
    doorWay(0.8, -13.0, 0, 1.4); // North doorway/exit of corridor
    L.push({
      text: '🚶 ทางเดิน (เชื่อมต่อข้างห้อง EKG)',
      pos: V(0.8, 2.2, -8.5),
      cls: 'int-label sub-tag'
    });

    // Desks in Hallway outside exam rooms:
    // USER MANDATE: "คอมOPD1-6และคอมจุดคัดกรองให้หันหน้าไปทางทิศใต้"
    // rotY = Math.PI (Staff sits on North side facing SOUTH +Z towards waiting patients!)
    const hallDesks = [
      { x: -22.0, z: -2.8, num: 6, code: 'PC-OPD-06', ip: '46' },
      { x: -18.1, z: -2.8, num: 5, code: 'PC-OPD-05', ip: '45' },
      { 
        x: -14.2, z: -2.8, num: 4, code: 'PC-OPD-04', 
        ip: '10.10.20.129', hostname: 'OPD4-PC', mac: '90:1B:0E:3C:44:29',
        switchId: 'ksp-sw-opd', switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
        switchPort: 'Port 14 (VLAN 20)', wallOutlet: 'OPD-NURSE-04 (โต๊ะซักประวัติหน้าห้องตรวจ 4)',
        gateway: '10.10.20.1 (Core Gateway)', vlan: 'VLAN 20 - งานการพยาบาลและสารสนเทศยุทธศาสตร์',
        user: 'นางสาวจรัญญา วรรณกาฬ/หญ (พยาบาลวิชาชีพ)'
      },
      { 
        x: -10.3, z: -2.8, num: 3, code: 'PC-OPD-03', 
        ip: '10.10.30.28', hostname: 'IT-1', mac: '90:1B:0E:3C:30:28',
        switchId: 'ksp-sw-opd', switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
        switchPort: 'Port 13 (VLAN 30)', wallOutlet: 'OPD-NURSE-03 (โต๊ะซักประวัติหน้าห้องตรวจ 3)',
        gateway: '10.10.30.1 (OPD Gateway)', vlan: 'VLAN 30 - ห้องตรวจแพทย์และบริการผู้ป่วยนอก (OPD)',
        user: 'เจ้าหน้าที่ประจำจุดคัดกรอง/ห้องตรวจ 3'
      },
      { x:  -6.4, z: -2.8, num: 2, code: 'PC-OPD-02', ip: '42' },
      { x:  -2.5, z: -2.8, num: 1, code: 'PC-OPD-01', ip: '41' }
    ];
    hallDesks.forEach((hd) => {
      workDesk({
        x: hd.x,
        z: hd.z,
        w: 1.25,
        d: 0.65,
        rotY: Math.PI, // หันหน้าไปทางทิศใต้ (South)
        label: `🖳 คอม OPD ${hd.num}${hd.hostname ? ' (' + hd.hostname + ')' : ''}`,
        pcInfo: pcSpec(
          hd.code, 
          `คอม OPD ${hd.num}`, 
          `จุดบริการซักประวัติและเรียกคิวหน้าห้องตรวจ ${hd.num}`, 
          hd.user || `พยาบาลวิชาชีพ/ผู้ช่วยพยาบาล`, 
          hd.ip, 
          'HOSxP Queue & OPD Station',
          {
            hostname: hd.hostname,
            mac: hd.mac,
            switchId: hd.switchId,
            switchName: hd.switchName,
            switchPort: hd.switchPort,
            wallOutlet: hd.wallOutlet,
            gateway: hd.gateway || (hd.ip && String(hd.ip).startsWith('10.10.30') ? '10.10.30.1 (OPD Gateway)' : '10.10.20.1 (Core Gateway)'),
            vlan: hd.vlan || (hd.ip && String(hd.ip).startsWith('10.10.30') ? 'VLAN 30 - ห้องตรวจแพทย์และบริการผู้ป่วยนอก (OPD)' : 'VLAN 20 - งานการพยาบาลและสารสนเทศยุทธศาสตร์')
          }
        )
      });
    });

    // Far Left Desk: คอม OPD 7
    // USER MANDATE: "คอมOPD7ให้หันไปทางทิศตะวันออก"
    // rotY = -Math.PI / 2 (Staff sits near West wall facing EAST +X towards waiting area!)
    workDesk({
      x: -23.2,
      z: 0.8,
      w: 1.3,
      d: 0.65,
      rotY: -Math.PI / 2, // หันไปทางทิศตะวันออก (East)
      label: '🖳 คอม OPD 7',
      pcInfo: pcSpec('PC-OPD-07', 'คอม OPD 7', 'จุดคัดกรองเบื้องต้น/ประสานงานผู้ป่วยนอก', 'เจ้าหน้าที่เวชสถิติ/พยาบาล', '47')
    });

    // ==========================================
    // 2. WAITING LOBBY (เพิ่มเป็น 60 ที่นั่ง), SCREENING & BUDDHA ROOM
    // ==========================================
    // USER MANDATE: "ที่นั่งจุดพักคอยผู้มารับบริการเพิ่มเป็น60ตัว"
    // Block A: Upper Waiting Seats (20 seats back-to-back: 10 facing +Z, 10 facing -Z)
    waitingBenches(-12.0, -1.2, 10, 0);       // 10 seats facing +Z (South)
    waitingBenches(-12.0, -0.4, 10, Math.PI); // 10 seats facing -Z (North)

    // Block B: Middle Waiting Seats (20 seats back-to-back: 10 facing +Z, 10 facing -Z)
    waitingBenches(-12.0, 0.8, 10, 0);        // 10 seats facing +Z (South)
    waitingBenches(-12.0, 1.6, 10, Math.PI);  // 10 seats facing -Z (North)

    L.push({
      text: '🪑 จุดพักคอยผู้รับบริการ (โซน 1–2: 40 ที่นั่ง)',
      pos: V(-12.0, 1.8, 0.2),
      cls: 'int-label sub-tag'
    });

    // Screening Counters & BP Kiosks: z = 3.8
    // USER MANDATE: "และคอมจุดคัดกรองให้หันหน้าไปทางทิศใต้"
    // จุดคัดกรอง 1 (หันหน้าไปทางทิศใต้)
    const scr1 = M.box(g, 1.8, 0.85, 0.8, M.mat(0x0284c7), -20.5, 0.425, 3.8);
    addEdges(scr1, 0x0369a1);
    makePerson({ role: 'nurse', shirtColor: 0xffffff, pantsColor: 0xffffff, pose: 'stand', rotY: Math.PI }).position.set(-20.5, 0, 3.2);
    L.push({ text: '📋 จุดคัดกรอง 1', pos: V(-20.5, 1.7, 3.8), cls: 'int-label room-title' });

    // จุดคัดกรอง 2 + คอม OPD 8 (หันหน้าไปทางทิศใต้: rotY = Math.PI)
    workDesk({
      x: -17.5,
      z: 3.8,
      w: 1.5,
      d: 0.75,
      rotY: Math.PI, // หันหน้าไปทางทิศใต้
      label: '🖳 คอม OPD 8 (OPD-BP)',
      pcInfo: pcSpec(
        'PC-OPD-08', 
        'คอม OPD 8', 
        'ระบบคัดกรอง ประเมินสัญญาณชีพ และบันทึกประวัติแรกรับ', 
        'นางสมรักษ์ ไชยนา (พยาบาลวิชาชีพชำนาญการ)', 
        '10.10.20.76', 
        'HOSxP Triage & Vital Signs',
        {
          hostname: 'OPD-BP',
          mac: '90:1B:0E:3C:44:76',
          switchId: 'ksp-sw-opd',
          switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
          switchPort: 'Port 18 (VLAN 20)',
          wallOutlet: 'OPD-BP-02 (จุดวัดความดันและคัดกรอง 2)',
          gateway: '10.10.20.1 (Core Gateway)',
          vlan: 'VLAN 20 - งานการพยาบาลและสารสนเทศยุทธศาสตร์'
        }
      )
    });
    L.push({ text: '🩺 จุดคัดกรอง 2 (คอม OPD 8: OPD-BP)', pos: V(-17.5, 1.8, 3.8), cls: 'int-label room-title' });

    // 6 Blood Pressure Kiosks (BP 1 to BP 6)
    const bpPositions = [-14.5, -12.3, -10.1, -7.9, -5.7, -3.5];
    bpPositions.forEach((bpx, idx) => {
      bpStation(bpx, 3.8, idx + 1);
    });

    // Block C: Lower Waiting Seats (20 seats back-to-back: 10 facing +Z, 10 facing -Z)
    waitingBenches(-12.0, 6.2, 10, 0);        // 10 seats facing +Z (South)
    waitingBenches(-12.0, 7.0, 10, Math.PI);  // 10 seats facing -Z (North)
    L.push({
      text: '🪑 จุดพักคอยวัดความดัน/รอพบแพทย์ (โซน 3: 20 ที่นั่ง)',
      pos: V(-12.0, 1.8, 6.6),
      cls: 'int-label sub-tag'
    });

    // Buddha Room (ห้องพระ)
    // Walls: x = -5.8 to -0.6, z = 5.0 to 12.8 (spacious 5.2m x 7.8m)
    wall(-5.8, 5.0, -0.6, 5.0, wThick, WH); // North wall of Buddha room
    wall(-5.8, 5.0, -5.8, 12.8, wThick, WH); // West wall of Buddha room with door
    doorWay(-5.8, 6.8, Math.PI / 2, 1.2);
    buddhaAltar(-3.2, 11.2);
    L.push({
      text: '🙏 ห้องพระ (จุดสักการะประจำโรงพยาบาล)',
      pos: V(-3.2, 2.2, 8.5),
      cls: 'int-label room-title'
    });

    // ==========================================
    // 3. RIGHT WING: ROW 1 (TOP / NORTH)
    // z = -13.0 to -5.5 (depth = 7.5m, expanded and roomy!)
    // ==========================================
    // EKG Room: located at x = 2.2 to 7.5 (width = 5.3m, depth = 7.5m)
    wall(2.2, -13.0, 2.2, -5.5, wThick, WH); // West wall of EKG (bordering corridor)
    wall(7.5, -13.0, 7.5, -5.5, wThick, WH); // East wall of EKG
    wall(2.2, -5.5, 7.5, -5.5, wThick, WH);  // South wall of EKG
    doorWay(2.2, -8.5, Math.PI / 2, 1.1);   // Door from corridor into EKG
    doorWay(4.85, -5.5, 0, 1.1);           // Door from South hallway into EKG

    // คอม EKG & 2 Exam beds
    workDesk({
      x: 3.2,
      z: -9.0,
      w: 1.2,
      d: 0.65,
      rotY: -Math.PI / 2,
      label: '🖳 คอม EKG',
      pcInfo: pcSpec('PC-EKG-01', 'คอมห้อง EKG', 'ระบบตรวจบันทึกคลื่นไฟฟ้าหัวใจและส่งต่อแพทย์เฉพาะทาง', 'เจ้าหน้าที่ตรวจ EKG', '71', 'ECG Analysis Software / PACS Link')
    });
    examBed(6.2, -10.5, 0);
    examBed(6.2, -7.5, 0);

    L.push({
      text: `🫀 ห้อง EKG ${opdState.ekgOccupied ? '🔴 กำลังบันทึก' : '🟢 ว่าง'}`,
      pos: V(4.85, 2.2, -9.0),
      cls: `int-label toggleable ${opdState.ekgOccupied ? 'busy' : 'free'}`,
      toggleId: 'opd-ekg'
    });

    // Nursing Administration: x = 7.5 to 13.5, z = -13.0 to -5.5 (width = 6.0m)
    wall(13.5, -13.0, 13.5, -5.5, wThick, WH);
    wall(7.5, -5.5, 13.5, -5.5, wThick, WH);
    doorWay(10.5, -5.5, 0, 1.1);

    // 4 Nurse PCs: คอม 1, 2, 3, 4
    const nurseDesks = [
      { 
        x: 9.0,  z: -10.5, num: 1, 
        ip: '10.10.20.163', hostname: 'KIANG', mac: 'B4:2E:99:A1:7B:63',
        switchId: 'ksp-sw-opd', switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
        switchPort: 'Port 21 (VLAN 20)', wallOutlet: 'OPD-NS-01 (ห้องกลุ่มงานการพยาบาล โต๊ะ 1)',
        user: 'นายคำพัน ศรีทองแท้ (พยาบาลวิชาชีพชำนาญการ)'
      },
      { x: 9.0,  z:  -8.0, num: 2, ip: '82' },
      { 
        x: 12.0, z: -10.5, num: 3, 
        ip: '10.10.20.159', hostname: 'เหมียว', mac: 'B4:2E:99:A1:7B:59',
        switchId: 'ksp-sw-opd', switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
        switchPort: 'Port 23 (VLAN 20)', wallOutlet: 'OPD-NS-03 (ห้องกลุ่มงานการพยาบาล โต๊ะ 3)',
        user: 'นางสาวปัณฑิกา ภักดีมวล (พยาบาลวิชาชีพชำนาญการ)'
      },
      { x: 12.0, z:  -8.0, num: 4, ip: '84' }
    ];
    nurseDesks.forEach((nd) => {
      workDesk({
        x: nd.x,
        z: nd.z,
        w: 1.2,
        d: 0.65,
        rotY: 0,
        label: `🖳 คอมพยาบาล ${nd.num}${nd.hostname ? ' (' + nd.hostname + ')' : ''}`,
        pcInfo: pcSpec(
          `PC-NURSE-0${nd.num}`, 
          `คอมพยาบาล ${nd.num}`, 
          `งานบริหารการพยาบาลและตารางปฏิบัติงาน`, 
          nd.user || `กลุ่มงานการพยาบาล`, 
          nd.ip,
          'HOSxP Nursing System / Staff Scheduling',
          {
            hostname: nd.hostname,
            mac: nd.mac,
            switchId: nd.switchId,
            switchName: nd.switchName,
            switchPort: nd.switchPort,
            wallOutlet: nd.wallOutlet,
            gateway: '10.10.20.1 (Core Gateway)',
            vlan: 'VLAN 20 - งานการพยาบาลและสารสนเทศยุทธศาสตร์'
          }
        )
      });
    });
    L.push({
      text: '👩‍⚕️ ห้องกลุ่มงานการพยาบาล',
      pos: V(10.5, 2.2, -9.0),
      cls: 'int-label room-title'
    });

    // Nurse Head Office (ห้องคอม 5): x = 13.5 to 17.5, z = -13.0 to -5.5 (width = 4.0m)
    wall(17.5, -13.0, 17.5, -5.5, wThick, WH);
    wall(13.5, -5.5, 17.5, -5.5, wThick, WH);
    doorWay(15.5, -5.5, 0, 1.1);
    workDesk({
      x: 15.5,
      z: -8.5,
      w: 1.4,
      d: 0.75,
      rotY: 0,
      hasVisitor: true,
      label: '🖳 คอมพยาบาล 5 (หัวหน้า)',
      pcInfo: pcSpec('PC-NURSE-05', 'คอมพยาบาล 5', 'ห้องหัวหน้ากลุ่มงานการพยาบาล', 'หัวหน้าพยาบาล', '85')
    });
    L.push({
      text: '💼 ห้องหัวหน้ากลุ่มการพยาบาล',
      pos: V(15.5, 2.2, -10.5),
      cls: 'int-label sub-tag'
    });

    // =========================================================================
    // GENERAL ADMINISTRATION OFFICE: ห้องกลุ่มงานบริหารทั่วไป (ห้องบริหาร)
    // x = 17.5 to 23.8, z = -13.0 to -5.5 (width = 6.3m, depth = 7.5m)
    // ตามแบบแปลน: โต๊ะทำงานธุรการ (โต๊ะ) + คอม 7, 6, 5 แถวบน | คอม 1, 2, 3, 4 แถวล่าง
    // =========================================================================
    wall(17.5, -5.5, 23.8, -5.5, wThick, WH);
    doorWay(22.0, -5.5, 0, 1.1); // ประตูเข้าห้องบริหารที่มุมขวาล่างตามผัง

    // ตู้เก็บแฟ้มเอกสารและสารบรรณชิดผนังฝั่งขวา
    M.box(g, 0.45, 2.2, 3.2, mSteel, 23.5, 1.1, -9.0);

    // North Row: โต๊ะ, คอม 7, คอม 6, คอม 5 (z = -10.5)
    // 1. โต๊ะทำงานธุรการ (โต๊ะ)
    const admDesk0 = workDesk({
      x: 18.5,
      z: -10.5,
      w: 1.15,
      d: 0.65,
      rotY: Math.PI,
      hasPC: false,
      hasChair: true
    });
    M.box(admDesk0, 0.28, 0.08, 0.35, M.mat(0x38bdf8), 0, 0.78, 0); // ถาดเอกสารสารบรรณ

    // 2. คอมบริหาร 7
    workDesk({
      x: 19.8,
      z: -10.5,
      w: 1.15,
      d: 0.65,
      rotY: Math.PI,
      label: '🖳 คอมบริหาร 7',
      pcInfo: pcSpec('PC-ADM-07', 'คอมบริหาร 7', 'งานตรวจสอบเอกสารเบิกจ่ายและควบคุมภายใน', 'กลุ่มงานบริหารทั่วไป', '97', 'e-Document / ERP')
    });

    // 3. คอมบริหาร 6
    workDesk({
      x: 21.1,
      z: -10.5,
      w: 1.15,
      d: 0.65,
      rotY: Math.PI,
      label: '🖳 คอมบริหาร 6',
      pcInfo: pcSpec('PC-ADM-06', 'คอมบริหาร 6', 'งานอาคารสถานที่ ยานพาหนะ และพัสดุครุภัณฑ์', 'กลุ่มงานบริหารทั่วไป', '96', 'e-Document / Asset Management')
    });

    // 4. คอมบริหาร 5
    workDesk({
      x: 22.4,
      z: -10.5,
      w: 1.15,
      d: 0.65,
      rotY: Math.PI,
      label: '🖳 คอมบริหาร 5',
      pcInfo: pcSpec('PC-ADM-05', 'คอมบริหาร 5', 'งานแผนงาน ยุทธศาสตร์ และสารสนเทศบริหาร', 'กลุ่มงานบริหารทั่วไป', '95', 'e-Plan / HDC / KPI Monitor')
    });

    // South Row: คอม 1, คอม 2, คอม 3, คอม 4 (z = -7.5)
    // 5. คอมบริหาร 1
    workDesk({
      x: 18.5,
      z: -7.5,
      w: 1.15,
      d: 0.65,
      rotY: 0,
      label: '🖳 คอมบริหาร 1',
      pcInfo: pcSpec('PC-ADM-01', 'คอมบริหาร 1', 'งานสารบรรณ รับ-ส่งหนังสือราชการอิเล็กทรอนิกส์', 'กลุ่มงานบริหารทั่วไป', '91', 'e-Document / สารบรรณอิเล็กทรอนิกส์')
    });

    // 6. คอมบริหาร 2
    workDesk({
      x: 19.8,
      z: -7.5,
      w: 1.15,
      d: 0.65,
      rotY: 0,
      label: '🖳 คอมบริหาร 2',
      pcInfo: pcSpec('PC-ADM-02', 'คอมบริหาร 2', 'งานการเงิน บัญชี และงบประมาณแผ่นดิน', 'กลุ่มงานบริหารทั่วไป', '92', 'New GFMIS Thai / ระบบการเงิน')
    });

    // 7. คอมบริหาร 3
    workDesk({
      x: 21.1,
      z: -7.5,
      w: 1.15,
      d: 0.65,
      rotY: 0,
      label: '🖳 คอมบริหาร 3',
      pcInfo: pcSpec('PC-ADM-03', 'คอมบริหาร 3', 'งานจัดซื้อจัดจ้างและตรวจรับพัสดุภาครัฐ (e-GP)', 'กลุ่มงานบริหารทั่วไป', '93', 'e-GP / ระบบจัดซื้อจัดจ้างภาครัฐ')
    });

    // 8. คอมบริหาร 4
    workDesk({
      x: 22.4,
      z: -7.5,
      w: 1.15,
      d: 0.65,
      rotY: 0,
      label: '🖳 คอมบริหาร 4',
      pcInfo: pcSpec('PC-ADM-04', 'คอมบริหาร 4', 'งานบริหารทรัพยากรบุคคล (HR) และสิทธิประโยชน์', 'กลุ่มงานบริหารทั่วไป', '94', 'DPIS / HRMS')
    });

    L.push({
      text: '🏢 ห้องกลุ่มงานบริหารทั่วไป (ห้องบริหาร)',
      pos: V(20.65, 2.2, -9.0),
      cls: 'int-label room-title'
    });

    // =========================================================================
    // 🔀 ตู้แร็คแขวนผนัง Switch Hub KSP-SW-ADMIN (ตำแหน่งมาร์คสีส้ม ผนังห้องบริหาร)
    // =========================================================================
    function makeAdminSwitchRack(x, y, z) {
      const swg = new THREE.Group();
      swg.position.set(x, y, z);
      swg.rotation.y = Math.PI; // หมุน 180 องศา ให้แผ่นหลังชิดผนังเหนือ (Z = -12.91) และประตูกระจกหันหน้าเข้าห้อง (+Z)

      function maintBox(w, h, d, color, metalness = 0.4, roughness = 0.5) {
        return new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({ color, metalness, roughness })
        );
      }

      // 1. Metal Wall Mounting Bracket / Backplate (touches wall at local +Z)
      const bracket = maintBox(0.74, 0.58, 0.04, 0x0f172a);
      bracket.position.set(0, 0, 0.20);
      swg.add(bracket);

      // 2. 6U Wallmount Cabinet Frame (Black / Dark Slate with cyan edge highlight)
      const cab = maintBox(0.72, 0.54, 0.42, 0x1e293b);
      cab.position.set(0, 0, 0);
      addEdges(cab, 0x0284c7);
      cab.userData.serverId = 'ksp-sw-admin';
      swg.add(cab);

      // 3. Side Ventilation Louvers
      [-0.365, 0.365].forEach((sx) => {
        const vent = maintBox(0.01, 0.28, 0.24, 0x0f172a);
        vent.position.set(sx, 0, 0);
        swg.add(vent);
      });

      // 4. Front Tempered Glass Door (Smoked translucent glass with frame)
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.2
      });
      const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.46, 0.02), glassMat);
      doorGlass.position.set(0, 0, -0.215);
      doorGlass.userData.serverId = 'ksp-sw-admin';
      swg.add(doorGlass);

      const doorBorder = maintBox(0.68, 0.50, 0.02, 0x0f172a);
      doorBorder.position.set(0, 0, -0.21);
      addEdges(doorBorder, 0x38bdf8);
      swg.add(doorBorder);

      const keyLock = maintBox(0.03, 0.05, 0.02, 0x94a3b8);
      keyLock.position.set(0.29, 0, -0.22);
      swg.add(keyLock);

      // 5. Internal Rack Units:
      // Unit A: 1U Patch Panel (y = +0.13)
      const patchPanel = maintBox(0.62, 0.07, 0.30, 0x0f172a);
      patchPanel.position.set(0, 0.13, -0.04);
      addEdges(patchPanel, 0x475569);
      swg.add(patchPanel);
      for (let px = -0.25; px <= 0.25; px += 0.022) {
        const jack = maintBox(0.014, 0.018, 0.01, 0x475569);
        jack.position.set(px, 0.13, -0.192);
        swg.add(jack);
      }

      // Unit B: 1U Managed Switch Hub (KSP-SW-ADMIN, y = 0.0)
      const swUnit = maintBox(0.62, 0.08, 0.34, 0x0284c7);
      swUnit.position.set(0, 0.0, -0.04);
      addEdges(swUnit, 0x38bdf8);
      swUnit.userData.serverId = 'ksp-sw-admin';
      swg.add(swUnit);

      // Switch Faceplate (Dark Metallic)
      const faceplate = maintBox(0.60, 0.07, 0.015, 0x0f172a);
      faceplate.position.set(0, 0.0, -0.205);
      faceplate.userData.serverId = 'ksp-sw-admin';
      swg.add(faceplate);

      // Aruba/HPE Brand Cyan Bar
      const brandBar = maintBox(0.12, 0.02, 0.005, 0x38bdf8);
      brandBar.position.set(-0.21, 0.02, -0.214);
      swg.add(brandBar);

      // Power Status LED (Green)
      const pwrLed = maintBox(0.01, 0.01, 0.005, 0x22c55e);
      pwrLed.material = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      pwrLed.position.set(-0.25, 0.02, -0.214);
      swg.add(pwrLed);

      // 24 RJ-45 Gigabit Ports with Activity LEDs
      for (let px = -0.12; px <= 0.25; px += 0.016) {
        const port = maintBox(0.011, 0.018, 0.008, 0x334155);
        port.position.set(px, -0.01, -0.212);
        port.userData.serverId = 'ksp-sw-admin';
        swg.add(port);

        const led = maintBox(0.006, 0.006, 0.004, 0x22c55e);
        led.material = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        led.position.set(px, 0.015, -0.213);
        swg.add(led);
      }

      // Short looped patch cables between Patch Panel and Switch Ports
      for (let px = -0.10; px <= 0.23; px += 0.033) {
        const cable = maintBox(0.008, 0.10, 0.012, 0x38bdf8);
        cable.position.set(px, 0.065, -0.20);
        swg.add(cable);
      }

      // Unit C: 1U Horizontal Cable Manager (y = -0.11)
      const cableMgr = maintBox(0.62, 0.06, 0.26, 0x1e293b);
      cableMgr.position.set(0, -0.11, -0.04);
      swg.add(cableMgr);

      // Unit D: Power Distribution Strip (PDU) at the bottom (y = -0.20)
      const pdu = maintBox(0.60, 0.05, 0.15, 0x0f172a);
      pdu.position.set(0, -0.20, 0.02);
      swg.add(pdu);
      const pduLight = maintBox(0.012, 0.012, 0.006, 0xef4444);
      pduLight.material = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      pduLight.position.set(-0.24, -0.20, -0.06);
      swg.add(pduLight);

      // 6. PVC Cable Trunking Conduit going up to ceiling
      const conduit = maintBox(0.08, 0.90, 0.05, 0xf1f5f9);
      conduit.position.set(0, 0.72, 0.18);
      addEdges(conduit, 0x94a3b8);
      swg.add(conduit);

      g.add(swg);
      return swg;
    }

    // ติดตั้งตู้แร็ค Switch Hub ที่ผนังห้องบริหาร (ตำแหน่งมาร์คสีส้ม: x = 18.5, y = 2.05, z = -12.71)
    makeAdminSwitchRack(18.5, 2.05, -12.71);
    L.push({
      text: '🔀 KSP-SW-ADMIN (10.10.100.13)',
      pos: V(18.5, 2.70, -12.45),
      cls: 'int-label server-badge clickable',
      serverId: 'ksp-sw-admin'
    });

    // ==========================================
    // 4. RIGHT WING: ROW 2 (HA & RESTROOMS)
    // z = -3.8 to 0.8 (depth = 4.6m, expanded!)
    // ==========================================
    wall(5.5, -3.8, 23.8, -3.8, wThick, WH);
    wall(5.5,  0.8, 23.8,  0.8, wThick, WH);
    wall(5.5, -3.8,  5.5,  0.8, wThick, WH); // West wall

    // Dividers:
    // Room HA: x = 5.5 to 11.5 (width = 6.0m)
    // Female WC: x = 11.5 to 17.5 (width = 6.0m)
    // Male WC: x = 17.5 to 23.8 (width = 6.3m)
    wall(11.5, -3.8, 11.5, 0.8, wThick, WH);
    wall(17.5, -3.8, 17.5, 0.8, wThick, WH);

    // Doors for Row 2
    doorWay(8.5,  0.8, 0, 1.1); // HA
    doorWay(14.5, 0.8, 0, 1.1); // Female WC
    doorWay(20.5, 0.8, 0, 1.1); // Male WC

    // HA Room Furniture
    workDesk({
      x: 8.5,
      z: -1.5,
      w: 1.4,
      d: 0.7,
      rotY: 0,
      hasVisitor: true,
      label: '🖳 คอม HA 1',
      pcInfo: pcSpec('PC-HA-01', 'คอมงานพัฒนาคุณภาพ (HA)', 'บริหารจัดการข้อมูลมาตรฐานคุณภาพโรงพยาบาลและการรับรอง HA', 'ทีมนำพัฒนาคุณภาพ (HA)', '75')
    });
    M.box(g, 4.0, 2.2, 0.5, mSteel, 8.5, 1.1, -3.4); // Archive file cabinets
    L.push({ text: '📋 ห้อง HA (พัฒนาคุณภาพโรงพยาบาล)', pos: V(8.5, 2.2, -1.5), cls: 'int-label room-title' });

    // Restrooms
    restroomFixtures('female', 14.5, -1.5, 5.6, 4.2);
    L.push({ text: '🚺 ห้องน้ำหญิง', pos: V(14.5, 2.2, -1.5), cls: 'int-label sub-tag' });

    restroomFixtures('male', 20.65, -1.5, 5.8, 4.2);
    L.push({ text: '🚹 ห้องน้ำชาย', pos: V(20.65, 2.2, -1.5), cls: 'int-label sub-tag' });

    // ==========================================
    // 5. RIGHT WING: ROW 3 (SERVER & CONFERENCES)
    // z = 2.2 to 7.2 (depth = 5.0m, expanded and roomy!)
    // ==========================================
    wall(5.5, 2.2, 23.8, 2.2, wThick, WH);
    wall(5.5, 7.2, 23.8, 7.2, wThick, WH);
    wall(5.5, 2.2,  5.5, 7.2, wThick, WH);

    // Dividers:
    // IT Admin Room (คอม 1-4): x = 5.5 to 10.5 (width = 5.0m)
    // Server Room (ประตู 2 บาน): x = 10.5 to 14.5 (width = 4.0m)
    // Meeting Room องค์กรแพทย์: x = 14.5 to 19.2 (width = 4.7m)
    // Meeting Room ธรรมาภิบาล: x = 19.2 to 23.8 (width = 4.6m)
    wall(10.5, 2.2, 10.5, 7.2, wThick, WH);
    wall(14.5, 2.2, 14.5, 7.2, wThick, WH);
    wall(19.2, 2.2, 19.2, 7.2, wThick, WH);

    // Doors for Row 3
    doorWay(8.0, 7.2, 0, 1.1);           // IT Admin
    doubleDoorWay(12.5, 7.2, 0, 1.8);    // Server Room: ประตู 2 บาน!
    doorWay(16.85, 7.2, 0, 1.1);         // Meeting 1
    doorWay(21.5, 7.2, 0, 1.1);          // Meeting 2

    // IT Admin & Health Insurance Room Desks (คอม 1, 2, 3 along left wall, คอม 4 in center)
    const itAdminPCs = [
      { 
        x: 6.4, z: 3.3, num: 1, 
        ip: '10.10.20.21',
        hostname: 'NIRUN-PC',
        mac: '14:B3:1F:28:9A:11',
        switchId: 'cisco-sg250',
        switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
        switchPort: 'Port GE7 (GigabitEthernet 7 / VLAN 20 Untagged)',
        wallOutlet: 'Outlet ID: OPD-ADM-01 (ช่องเต้ารับ LAN ผนังห้องประกันสุขภาพ)',
        vlan: 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์',
        role: 'งานประกันสุขภาพ ลงทะเบียนสิทธิ ตรวจสอบความถูกต้องเวชระเบียนผู้ป่วย',
        user: 'คุณนิรันดร์ (เจ้าหน้าที่งานประกันสุขภาพ)',
        sw: 'HOSxP v3.6 • โปรแกรม e-Claim สปสช. • NHSO Smart Card Authen • ระบบตรวจสอบสิทธิการรักษา'
      },
      { 
        x: 6.4, z: 4.7, num: 2, 
        ip: '10.10.20.147',
        hostname: 'TONOLI-PC',
        mac: 'D8:5E:D3:4A:2C:9B',
        switchId: 'cisco-sg250',
        switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
        switchPort: 'Port GE8 (GigabitEthernet 8 / VLAN 20 Untagged)',
        wallOutlet: 'Outlet ID: OPD-ADM-02 (ช่องเต้ารับ LAN ผนังห้องประกันสุขภาพ)',
        vlan: 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์',
        role: 'งานประกันสุขภาพ ตรวจสอบสิทธิ เรียกเก็บเงินชดเชย (e-Claim) และวิเคราะห์ยุทธศาสตร์',
        user: 'เจ้าหน้าที่งานประกันสุขภาพ (TONOLI-PC)',
        sw: 'HOSxP v3.6 • โปรแกรม e-Claim สปสช. • Financial Data Hub (FDH) • NHSO Smart Card Agent'
      },
      { 
        x: 6.4, z: 6.1, num: 3, 
        ip: '10.10.20.111',
        hostname: 'พี่ติ๊ก',
        mac: '2C:F0:5D:8B:4E:33',
        switchId: 'cisco-sg250',
        switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
        switchPort: 'Port GE9 (GigabitEthernet 9 / VLAN 20 Untagged)',
        wallOutlet: 'Outlet ID: OPD-ADM-03 (ช่องเต้ารับ LAN ผนังห้องประกันสุขภาพ)',
        vlan: 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์',
        role: 'งานประกันสุขภาพ ประสานสิทธิ์ ชดเชยค่าบริการทางการแพทย์ และสรุปรายงานลูกหนี้สิทธิ',
        user: 'พี่ติ๊ก (เจ้าหน้าที่งานประกันสุขภาพ)',
        sw: 'HOSxP v3.6 • ระบบ e-Claim สปสช. • MOPH Claim • Smart Card Agent'
      },
      { 
        x: 8.8, z: 4.7, num: 4, 
        ip: '10.10.20.135',
        hostname: 'DESKTOP-HOGODQJ',
        mac: '50:EB:71:A9:3D:44',
        switchId: 'cisco-sg250',
        switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
        switchPort: 'Port GE10 (GigabitEthernet 10 / VLAN 20 Untagged)',
        wallOutlet: 'Outlet ID: OPD-ADM-04 (ช่องเต้ารับ LAN ผนังห้องประกันสุขภาพ)',
        vlan: 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์',
        role: 'งานประกันสุขภาพและเวชสารสนเทศยุทธศาสตร์ จัดทำข้อมูล 43 แฟ้ม และตรวจสอบข้อมูล HDC',
        user: 'เจ้าหน้าที่งานประกันสุขภาพยุทธศาสตร์ (DESKTOP-HOGODQJ)',
        sw: 'HOSxP v3.6 • โปรแกรมตรวจสอบ 43 แฟ้ม OPPP • FDH Data Validator • e-Claim'
      }
    ];
    itAdminPCs.forEach((p) => {
      const spec = pcSpec(
        `PC-ADM-0${p.num}`,
        `คอมประกันสุขภาพ ${p.num} (${p.hostname})`,
        p.role,
        p.user,
        p.ip,
        p.sw,
        {
          hostname: p.hostname,
          mac: p.mac,
          switchId: p.switchId,
          switchName: p.switchName,
          switchPort: p.switchPort,
          wallOutlet: p.wallOutlet,
          vlan: p.vlan,
          dhcpTracking: true,
          status: '🟢 ออนไลน์ปกติ (Dynamic IP Sync)'
        }
      );

      window.KSS = window.KSS || {};
      window.KSS.INSURANCE_SPECS = window.KSS.INSURANCE_SPECS || {};
      window.KSS.INSURANCE_SPECS[p.mac] = spec;
      if (p.num === 2) {
        window.KSS.TONOLI_PC_SPEC = spec;
      }

      workDesk({
        x: p.x,
        z: p.z,
        w: 1.15,
        d: 0.6,
        rotY: p.num === 4 ? 0 : Math.PI / 2,
        label: `🖳 คอมประกันสุขภาพ ${p.num} (${p.hostname})`,
        pcInfo: spec
      });
    });
    L.push({ text: '💻 ห้องงานประกันสุขภาพยุทธศาสตร์ (4 เครื่อง)', pos: V(8.0, 2.2, 4.7), cls: 'int-label sub-tag' });

    // Server Room (ห้อง Server & Network Control Center)
    serverRackDetailed('rack-a', 11.8, 3.6, 0);
    serverRackDetailed('rack-b', 13.2, 3.6, 0);
    // UPS Battery bank & Wall Cooling Unit
    M.box(g, 1.6, 1.5, 0.7, M.mat(0x1e293b), 12.5, 0.75, 6.4);
    M.box(g, 1.0, 0.45, 0.3, M.mat(0xffffff), 12.5, 2.5, 2.4);

    // Main Server Room Interactive Tag
    L.push({
      text: `🖥️ ห้องแม่ข่าย Server (คลิกตรวจสอบสถานะ & Login)`,
      pos: V(12.5, 2.35, 4.7),
      cls: `int-label server-main-tag clickable ${opdState.serverOnline ? 'free' : 'busy'}`,
      toggleId: 'open-server-dashboard'
    });

    // Rack A: Dell Server, iDRAC, Fortigate, NAS
    L.push({
      text: '🖥️ Proxmox Dell (10.10.10.251:8006)',
      pos: V(11.8, 1.82, 3.0),
      cls: 'int-label server-badge clickable',
      serverId: 'proxmox-dell'
    });
    L.push({
      text: '⚡ iDRAC Dell (10.10.150.12)',
      pos: V(11.8, 1.45, 3.0),
      cls: 'int-label server-badge clickable',
      serverId: 'idrac-dell'
    });
    L.push({
      text: '🛡️ Fortigate (147.50.107.210)',
      pos: V(11.8, 1.18, 3.0),
      cls: 'int-label server-badge clickable',
      serverId: 'fortigate'
    });
    L.push({
      text: '💾 NAS-KSP (10.10.10.240)',
      pos: V(11.8, 0.82, 3.0),
      cls: 'int-label server-badge clickable',
      serverId: 'nas-ksp'
    });

    // Rack B: HPE Server, iLO, Mikrotik, Cisco/Aruba
    L.push({
      text: '🖥️ Proxmox HPE (10.10.10.250:8006)',
      pos: V(13.2, 1.85, 3.0),
      cls: 'int-label server-badge clickable',
      serverId: 'proxmox-hpe'
    });
    L.push({
      text: '⚡ iLO HPE (10.10.150.11)',
      pos: V(13.2, 1.54, 3.0),
      cls: 'int-label server-badge clickable',
      serverId: 'ilo-hpe'
    });
    L.push({
      text: '🌐 Mikrotik (10.10.100.1)',
      pos: V(13.2, 1.30, 3.0),
      cls: 'int-label server-badge clickable',
      serverId: 'mikrotik'
    });
    L.push({
      text: '🔀 Cisco SG250 / Aruba 1930',
      pos: V(13.2, 1.05, 3.0),
      cls: 'int-label server-badge clickable',
      serverId: 'cisco-sg250'
    });

    // Medical Org Meeting Room (ห้องประชุมองค์กรแพทย์)
    confTable({ x: 16.85, z: 4.5, w: 3.4, d: 1.4, seats: 8 });
    workDesk({
      x: 18.2,
      z: 6.3,
      w: 1.1,
      d: 0.55,
      rotY: Math.PI,
      label: '🖳 คอมห้องประชุมองค์กรแพทย์ 1',
      pcInfo: pcSpec('PC-CONF-01', 'ห้องประชุมองค์กรแพทย์ 1', 'ระบบนำเสนอและฉายภาพการประชุมองค์กรแพทย์', 'องค์กรแพทย์', '101', 'Zoom / Microsoft Teams / PACS Viewer')
    });
    L.push({
      text: `🩺 ห้องประชุมองค์กรแพทย์ ${opdState.confMedOccupied ? '🔴 มีการประชุม' : '🟢 ว่าง'}`,
      pos: V(16.85, 2.2, 4.5),
      cls: `int-label toggleable ${opdState.confMedOccupied ? 'busy' : 'free'}`,
      toggleId: 'opd-conf-med'
    });

    // Good Governance Meeting Room (ห้องประชุมธรรมาภิบาล)
    confTable({ x: 21.5, z: 4.5, w: 3.4, d: 1.4, seats: 8 });
    workDesk({
      x: 22.8,
      z: 6.3,
      w: 1.1,
      d: 0.55,
      rotY: Math.PI,
      label: '🖳 คอมห้องประชุมธรรมรักษ์ 1',
      pcInfo: pcSpec('PC-CONF-02', 'ห้องประชุมธรรมรักษ์ 1', 'ระบบบันทึกและถ่ายทอดการประชุมธรรมาภิบาลและจริยธรรม', 'คณะกรรมการธรรมาภิบาล', '102')
    });
    L.push({
      text: `⚖️ ห้องประชุมธรรมรักษ์ ${opdState.confGovOccupied ? '🔴 มีการประชุม' : '🟢 ว่าง'}`,
      pos: V(21.5, 2.2, 4.5),
      cls: `int-label toggleable ${opdState.confGovOccupied ? 'busy' : 'free'}`,
      toggleId: 'opd-conf-gov'
    });

    // ==========================================
    // 6. RIGHT WING: ROW 4 (IT, DOCTORS, DIRECTOR)
    // z = 8.5 to 12.8 (depth = 4.3m, expanded!)
    // ==========================================
    wall(5.5, 8.5, 23.8, 8.5, wThick, WH);
    wall(5.5, 8.5,  5.5, 12.8, wThick, WH);

    // Dividers:
    // IT Room: x = 5.5 to 11.5 (width = 6.0m)
    // Doctors' Lounge: x = 11.5 to 17.5 (width = 6.0m)
    // Director's Office: x = 17.5 to 23.8 (width = 6.3m)
    wall(11.5, 8.5, 11.5, 12.8, wThick, WH);
    wall(17.5, 8.5, 17.5, 12.8, wThick, WH);

    // Doors for Row 4 (on north wall)
    doorWay(8.5,  8.5, 0, 1.1);
    doorWay(14.5, 8.5, 0, 1.1);
    doorWay(19.5, 8.5, 0, 1.1);

    // IT Room (คอม IT 2, คอม IT 3 on left wall; คอม IT 1 on right wall)
    workDesk({
      x: 6.4,
      z: 9.8,
      w: 1.2,
      d: 0.65,
      rotY: Math.PI / 2,
      label: '🖳 คอม IT 2 (admin)',
      pcInfo: {
        code: 'PC-IT-02',
        name: 'คอม IT 2',
        role: 'บริหารระบบเครือข่าย Firewall และความมั่นคงปลอดภัยไซเบอร์',
        user: 'นักวิชาการคอมพิวเตอร์ (Admin)',
        os: 'Windows 11 Pro 64-bit / Linux Network Tools',
        cpu: 'Intel Core i7-12700 (12C/20T, 4.9GHz)',
        ram: '32 GB DDR4-3200',
        storage: '1 TB M.2 NVMe SSD',
        monitor: 'Dual 24" IPS Full HD (1920x1080)',
        ip: '10.10.100.22 (VLAN 100 - Network Management)',
        software: 'Cisco CLI / MikroTik WinBox / FortiClient / PRTG Network Monitor / Wireshark',
        peripherals: 'Console Cable (RJ45-to-USB), Optical Fiber Power Meter, UPS 1000VA True Online',
        status: '🟢 ออนไลน์ปกติ (Link 1Gbps Duplex)'
      }
    });
    workDesk({
      x: 6.4,
      z: 11.4,
      w: 1.2,
      d: 0.65,
      rotY: Math.PI / 2,
      label: '🖳 คอม IT 3 (admin)',
      pcInfo: {
        code: 'PC-IT-03',
        name: 'คอม IT 3',
        role: 'ผู้ดูแลระบบฐานข้อมูลโรงพยาบาล HOSxP และคลังข้อมูล HDC',
        user: 'ผู้ดูแลระบบสารสนเทศ (Admin)',
        os: 'Windows 11 Pro 64-bit / Ubuntu Server CLI',
        cpu: 'Intel Core i7-12700 (12C/20T, 4.9GHz)',
        ram: '32 GB DDR4-3200',
        storage: '1 TB M.2 NVMe SSD',
        monitor: 'Dual 24" IPS Full HD (1920x1080)',
        ip: '10.10.10.23 (VLAN 10 - Database & Server Network)',
        software: 'MySQL Workbench / Navicat Premium / Proxmox VE Web Console / HeidiSQL',
        peripherals: 'External Backup SSD 2TB, Smart Card Reader, UPS 1000VA True Online',
        status: '🟢 ออนไลน์ปกติ'
      }
    });
    workDesk({
      x: 10.6,
      z: 10.6,
      w: 1.2,
      d: 0.65,
      rotY: -Math.PI / 2,
      label: '🖳 คอม IT 1 (admin)',
      pcInfo: {
        code: 'PC-IT-01',
        name: 'คอม IT 1',
        role: 'รับแจ้งซ่อมคอมพิวเตอร์ จัดการสิทธิ์ผู้ใช้งาน และสนับสนุนเทคนิค',
        user: 'เจ้าหน้าที่คอมพิวเตอร์',
        os: 'Windows 11 Pro 64-bit',
        cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
        ram: '16 GB DDR4-3200',
        storage: '512 GB M.2 NVMe SSD',
        monitor: '23.8" IPS Full HD (1920x1080)',
        ip: '10.10.100.21 (VLAN 100 - IT Management)',
        software: 'Helpdesk Ticketing / Remote Support (AnyDesk/RustDesk) / HOSxP Admin Tools',
        peripherals: 'Headset Call Center, Thermal Label Printer, UPS 850VA',
        status: '🟢 ออนไลน์ปกติ'
      }
    });
    // Hardware diagnostic bench
    M.box(g, 2.2, 0.8, 0.75, mSteel, 8.5, 0.4, 12.2);
    L.push({ text: '🛠️ ห้องปฏิบัติการคอมพิวเตอร์ (IT)', pos: V(8.5, 2.2, 10.5), cls: 'int-label room-title' });

    // Doctors' Lounge (ห้องพักแพทย์)
    M.box(g, 3.4, 0.45, 0.9, mLeather, 14.5, 0.225, 11.8); // Large lounge sofa
    M.box(g, 1.6, 0.35, 0.7, mWood, 14.5, 0.175, 10.5);     // Coffee table
    M.box(g, 0.5, 1.4, 0.5, M.mat(0x38bdf8), 16.4, 0.7, 9.2); // Water dispenser
    L.push({ text: '🛋️ ห้องพักแพทย์ (Doctors\' Lounge)', pos: V(14.5, 2.2, 10.5), cls: 'int-label room-title' });

    // Hospital Director's Office (ห้องผู้อำนวยการโรงพยาบาล)
    // Enclosed private restroom in top-right corner: x = 21.4 to 23.8, z = 8.5 to 10.2
    wall(21.4, 8.5, 21.4, 10.2, wThick, WH);
    wall(21.4, 10.2, 23.8, 10.2, wThick, WH);
    doorWay(21.4, 9.35, Math.PI / 2, 0.85); // Door into private WC
    M.box(g, 0.4, 0.42, 0.5, M.mat(0xffffff), 22.8, 0.21, 9.35); // Toilet
    M.box(g, 0.45, 0.75, 0.38, M.mat(0xf8fafc), 22.0, 0.375, 8.85); // Sink

    // Director's executive desk
    const dirDesk = M.box(g, 2.0, 0.08, 1.0, mWood, 19.8, 0.74, 10.8);
    addEdges(dirDesk, 0x78350f);
    M.box(g, 1.9, 0.7, 0.9, mLeather, 19.8, 0.35, 10.8);
    makeExecutiveChair(g, 19.8, 11.7, Math.PI);
    makeChair(g, 19.0, 9.9, 0, 0x334155);
    makeChair(g, 20.6, 9.9, 0, 0x334155);

    // Executive credenza behind director
    M.box(g, 2.6, 1.9, 0.5, mTeak, 19.8, 0.95, 12.3);
    // National flag & Royal portrait
    M.box(g, 0.7, 0.9, 0.02, M.mat(0xfef08a), 22.4, 1.7, 12.5);

    L.push({
      text: `👑 ห้องผู้อำนวยการโรงพยาบาล ${opdState.directorOccupied ? '🔴 ปฏิบัติราชการ' : '🟢 พร้อมต้อนรับ'}`,
      pos: V(19.8, 2.3, 10.5),
      cls: `int-label toggleable ${opdState.directorOccupied ? 'busy' : 'free'}`,
      toggleId: 'opd-director'
    });

    // Build items list for interior panel (Array schema for KSS.app.js)
    const itemsList = [
      ['🚪', 'ห้องตรวจ 1 (CASKCAP: 10.10.30.43 - พญ.ณัชชา)', opdState.examRooms[0].occupied ? '🔴 กำลังตรวจ' : '🟢 ว่าง', 'opd-exam-1', opdState.examRooms[0].occupied ? 'busy' : 'free'],
      ['🚪', 'ห้องตรวจ 2 (พญ.ศิรินทิพย์)', opdState.examRooms[1].occupied ? '🔴 กำลังตรวจ' : '🟢 ว่าง', 'opd-exam-2', opdState.examRooms[1].occupied ? 'busy' : 'free'],
      ['🚪', 'ห้องตรวจ 3 (DOCTOR-OPD3: 10.10.30.40 - นพ.อดิเทพ)', opdState.examRooms[2].occupied ? '🔴 กำลังตรวจ' : '🟢 ว่าง', 'opd-exam-3', opdState.examRooms[2].occupied ? 'busy' : 'free'],
      ['🚪', 'ห้องตรวจ 4 (DOCTOR4: 10.10.30.38 - นพ.ธนากร)', opdState.examRooms[3].occupied ? '🔴 กำลังตรวจ' : '🟢 ว่าง', 'opd-exam-4', opdState.examRooms[3].occupied ? 'busy' : 'free'],
      ['🚪', 'ห้องตรวจ 5 (DOCTOR5: 10.10.30.39 - นพ.วรวิต)', opdState.examRooms[4].occupied ? '🔴 กำลังตรวจ' : '🟢 ว่าง', 'opd-exam-5', opdState.examRooms[4].occupied ? 'busy' : 'free'],
      ['🚪', 'ห้องตรวจ 6 (พญ.ณัฐธิดา)', opdState.examRooms[5].occupied ? '🔴 กำลังตรวจ' : '🟢 ว่าง', 'opd-exam-6', opdState.examRooms[5].occupied ? 'busy' : 'free'],
      ['🫀', 'ห้องตรวจคลื่นไฟฟ้าหัวใจ (EKG)', opdState.ekgOccupied ? '🔴 กำลังบันทึก' : '🟢 ว่าง', 'opd-ekg', opdState.ekgOccupied ? 'busy' : 'free'],
      ['🖥️', 'ห้องแม่ข่ายคอมพิวเตอร์ (Server & Controllers)', '🟢 ตรวจสอบสถานะ 9/9 เครื่อง (คลิกเพื่อ Login)', 'open-server-dashboard', 'free'],
      ['🖥️', '  • Proxmox Server DELL T440 (10.10.10.251:8006)', '🟢 Node 1 Online', 'server-proxmox-dell', 'free'],
      ['⚡', '  • iDRAC DELL Remote Controller (10.10.150.12)', '🟢 IPMI Ready', 'server-idrac-dell', 'free'],
      ['🖥️', '  • Proxmox Server HPE DL360 (10.10.10.250:8006)', '🟢 Node 2 Online', 'server-proxmox-hpe', 'free'],
      ['⚡', '  • iLO HPE Remote Controller (10.10.150.11)', '🟢 IPMI Ready', 'server-ilo-hpe', 'free'],
      ['🛡️', '  • Fortigate Firewall (147.50.107.210)', '🟢 UTM Active', 'server-fortigate', 'free'],
      ['💾', '  • NAS-KSP Storage Array (10.10.10.240)', '🟢 Storage OK', 'server-nas-ksp', 'free'],
      ['🌐', '  • Mikrotik Router & Gateway (10.10.100.1)', '🟢 Gateway OK', 'server-mikrotik', 'free'],
      ['🔀', '  • Cisco SG250 Core Switch (10.10.100.2)', '🟢 Core Switch', 'server-cisco-sg250', 'free'],
      ['🔀', '  • Aruba 1930 PoE Switch (10.10.150.3)', '🟢 PoE Switch', 'server-aruba-1930', 'free'],
      ['🔀', 'KSP-SW-ADMIN: สวิตช์ฮับห้องบริหาร (10.10.100.13)', '🟢 ออนไลน์ (ห้องกลุ่มงานบริหารทั่วไป)', 'server-ksp-sw-admin', 'free'],
      ['🩺', 'ห้องประชุมองค์กรแพทย์', opdState.confMedOccupied ? '🔴 มีการประชุม' : '🟢 ว่าง', 'opd-conf-med', opdState.confMedOccupied ? 'busy' : 'free'],
      ['⚖️', 'ห้องประชุมธรรมาภิบาล', opdState.confGovOccupied ? '🔴 มีการประชุม' : '🟢 ว่าง', 'opd-conf-gov', opdState.confGovOccupied ? 'busy' : 'free'],
      ['👑', 'ห้องผู้อำนวยการโรงพยาบาล', opdState.directorOccupied ? '🔴 ปฏิบัติราชการ' : '🟢 พร้อมต้อนรับ', 'opd-director', opdState.directorOccupied ? 'busy' : 'free']
    ];

    return {
      group: g,
      labels: L,
      size: { w: W, d: D, h: WH },
      title: '🩺 ผังภายใน ตึกผู้ป่วยนอก (OPD & บริหาร)',
      sub: 'ห้องตรวจ 1–6 (คอมชิดกำแพงขวา), ทางเดินข้างห้อง EKG, จุดคัดกรอง, ความดัน BP, ที่นั่งพักคอย 60 ตัว, ห้องพระ, ห้อง EKG, กลุ่มการพยาบาล, ห้องบริหาร (7 โต๊ะคอม), ห้อง Server, ห้องประชุม, ห้อง IT, พักแพทย์, และห้อง ผอ.',
      items: itemsList,
      cam: { pos: V(0, 34, 34), target: V(0, 1.0, 0) }
    };
  }

  function toggleOpdStatus(id) {
    if (id.startsWith('opd-exam-')) {
      const r = opdState.examRooms.find((x) => x.id === id);
      if (r) {
        r.occupied = !r.occupied;
        return true;
      }
    }
    if (id === 'opd-ekg') {
      opdState.ekgOccupied = !opdState.ekgOccupied;
      return true;
    }
    if (id === 'open-server-dashboard' || id === 'opd-server' || id.startsWith('server-')) {
      const sId = id.startsWith('server-') ? id.replace('server-', '') : null;
      if (window.openServerModal) {
        window.openServerModal(sId);
      }
      return false;
    }
    if (id === 'opd-conf-med') {
      opdState.confMedOccupied = !opdState.confMedOccupied;
      return true;
    }
    if (id === 'opd-conf-gov') {
      opdState.confGovOccupied = !opdState.confGovOccupied;
      return true;
    }
    if (id === 'opd-director') {
      opdState.directorOccupied = !opdState.directorOccupied;
      return true;
    }
    return false;
  }

  const opdComplexState = {
    currentZone: 1 // 1: OPD, 2: Pharmacy, 3: Finance, 4: Dental
  };

  function buildOpdComplexInterior(b) {
    let result = null;
    const zone = opdComplexState.currentZone || 1;

    if (zone === 1) {
      result = buildOpdInterior(b);
    } else if (zone === 2 && K.Interiors && K.Interiors.registry && K.Interiors.registry['pharmacy']) {
      result = K.Interiors.registry['pharmacy'](b);
    } else if (zone === 3 && K.Interiors && K.Interiors.registry && K.Interiors.registry['finance']) {
      result = K.Interiors.registry['finance'](b);
    } else if (zone === 4 && K.Interiors && K.Interiors.registry && K.Interiors.registry['dental']) {
      result = K.Interiors.registry['dental'](b);
    } else {
      result = buildOpdInterior(b);
    }

    if (result) {
      result.floors = [
        { num: 1, label: '🩺 ผู้ป่วยนอก (OPD & บริหาร)' },
        { num: 2, label: '💊 ห้องยา (Pharmacy)' },
        { num: 3, label: '💰 การเงิน (Finance)' },
        { num: 4, label: '🦷 ทันตกรรม (Dental)' }
      ];
      result.currentFloor = opdComplexState.currentZone;
      result.onSelectFloor = (z) => {
        opdComplexState.currentZone = z;
      };
    }

    return result;
  }

  K.Interiors.register('opd', buildOpdComplexInterior, toggleOpdStatus);
})();
