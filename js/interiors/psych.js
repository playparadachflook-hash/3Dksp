// =========================================================================
// PSYCHIATRIC & SUBSTANCE ABUSE CLINIC INTERIOR (คลินิกจิตเวชและยาเสพติด)
// เรียงห้อง 1-6 แถวยาว แบบตึก ER พร้อมประตูกำแพงเชื่อมระหว่างห้องตามผัง
// =========================================================================
(function () {
  const K = window.KSS;
  const M = K.M;
  const C = K.InteriorsCommon;
  const { V, floor, addEdges } = C;

  const psychState = {
    room1Occupied: false,
    room2Occupied: true,
    room3Occupied: false,
    room4Occupied: false,
    room5Occupied: false,
    room6Occupied: false
  };

  function buildPsychInterior(b) {
    const g = new THREE.Group();
    const L = [];

    // ขนาดผังอาคาร 6 ห้องแถวยาว: กว้าง 30.0m x ลึก 8.0m x สูง 3.2m
    const W = 30.0;
    const D = 8.0;
    const WH = 3.2;
    const wThick = 0.18;
    const xMin = -W / 2; // -15.0
    const xMax = W / 2;  //  15.0
    const zMin = -D / 2; // -4.0
    const zMax = D / 2;  //  4.0

    // พื้นอาคารแยกโซน
    // 1. พื้นใหญ่หลัก
    floor(g, W, D, '#f8fafc', '#e2e8f0', 0.6, 0, 0);

    // 2. พื้นห้อง 1 (ห้องหัวหน้า): ปูไม้ปาร์เกต์อบอุ่น
    const woodTex = M.tileTexture('#78350f', '#451a03', 5.0 / 0.4, 8.0 / 0.4);
    const mWoodFloor = M.box(g, 5.0, 0.105, 8.0, M.mat(0xffffff, { map: woodTex, roughness: 0.4 }), -12.5, -0.047, 0);
    addEdges(mWoodFloor, 0x92400e);

    // 3. พื้นห้อง 2 (ห้องทำงาน): สีเขียวอ่อนคลินิก
    const staffTex = M.tileTexture('#f0fdf4', '#bbf7d0', 5.0 / 0.5, 8.0 / 0.5);
    const mStaffFloor = M.box(g, 5.0, 0.105, 8.0, M.mat(0xffffff, { map: staffTex, roughness: 0.5 }), -7.5, -0.047, 0);
    addEdges(mStaffFloor, 0x16a34a);

    // 4. พื้นห้อง 3 (ห้องให้คำปรึกษา): สีครีมนุ่มนวล
    const counselTex = M.tileTexture('#fefce8', '#fef08a', 5.0 / 0.5, 8.0 / 0.5);
    const mCounselFloor = M.box(g, 5.0, 0.105, 8.0, M.mat(0xffffff, { map: counselTex, roughness: 0.5 }), -2.5, -0.047, 0);
    addEdges(mCounselFloor, 0xca8a04);

    // 5. พื้นห้อง 4 (ห้องพักฟื้น/สงบอารมณ์): สีฟ้าพาสเทล
    const calmTex = M.tileTexture('#f0fdfa', '#99f6e4', 5.0 / 0.5, 8.0 / 0.5);
    const mCalmFloor = M.box(g, 5.0, 0.105, 8.0, M.mat(0xffffff, { map: calmTex, roughness: 0.5 }), 2.5, -0.047, 0);
    addEdges(mCalmFloor, 0x0d9488);

    // 6. พื้นห้อง 5 (ห้องประเมินสุขภาพจิต มีโต๊ะคอมชิดซ้าย): สีฟ้าคลินิก
    const assessTex = M.tileTexture('#f0f9ff', '#bae6fd', 5.0 / 0.5, 8.0 / 0.5);
    const mAssessFloor = M.box(g, 5.0, 0.105, 8.0, M.mat(0xffffff, { map: assessTex, roughness: 0.5 }), 7.5, -0.047, 0);
    addEdges(mAssessFloor, 0x0284c7);

    // 7. พื้นห้อง 6 (ห้องอเนกประสงค์): สีเทาอ่อน
    const r6Tex = M.tileTexture('#f1f5f9', '#cbd5e1', 5.0 / 0.5, 8.0 / 0.5);
    const mR6Floor = M.box(g, 5.0, 0.105, 8.0, M.mat(0xffffff, { map: r6Tex, roughness: 0.6 }), 12.5, -0.047, 0);
    addEdges(mR6Floor, 0x64748b);

    // วัสดุ
    const mWall = M.mat(0xffffff, { roughness: 0.85 });
    const mWallPart = M.mat(0xf1f5f9, { roughness: 0.85 });
    const mDark = M.mat(0x0f172a);
    const mSteel = M.mat(0x94a3b8, { metalness: 0.6, roughness: 0.3 });
    const mWood = M.mat(0xb45309, { roughness: 0.5 });
    const mBlueSeat = M.mat(0x0284c7, { roughness: 0.6 });
    const mLeather = M.mat(0x1e293b, { roughness: 0.4 });
    const mDoorFrame = M.mat(0x475569);
    const mGlass = M.mat(0x38bdf8, { transparent: true, opacity: 0.45, roughness: 0.1 });

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
      M.box(dg, 0.08, WH, 0.08, mDoorFrame, -w / 2, WH / 2, 0);
      M.box(dg, 0.08, WH, 0.08, mDoorFrame, w / 2, WH / 2, 0);
      M.box(dg, w, 0.08, 0.08, mDoorFrame, 0, 2.2, 0);
      M.box(dg, w, WH - 2.2, 0.14, mWallPart, 0, 2.2 + (WH - 2.2) / 2, 0);
      const leaf = M.box(dg, w - 0.08, 2.14, 0.04, mGlass, 0.15, 1.07, 0.2);
      leaf.rotation.y = -0.45;
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
        x, z, w = 1.3, d = 0.65, rotY = 0,
        hasPC = true, label = null, pcInfo = null, hasChair = true, hasVisitor = false,
        isExecutive = false
      } = opts;
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      const topM = isExecutive ? mWood : M.mat(0xe2e8f0, { roughness: 0.5 });
      const deskTop = M.box(dg, w, 0.06, d, topM, 0, 0.74, 0);
      addEdges(deskTop, isExecutive ? 0x78350f : 0x475569);
      M.box(dg, w - 0.06, 0.71, d - 0.06, M.mat(0x94a3b8), 0, 0.355, 0);

      if (hasPC) {
        const mon = M.box(dg, 0.46, 0.32, 0.03, mDark, 0, 0.96, -d / 2 + 0.12);
        addEdges(mon, 0x38bdf8);
        M.box(dg, 0.42, 0.26, 0.01, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.96, -d / 2 + 0.14);
        M.box(dg, 0.06, 0.13, 0.06, mDark, 0, 0.8, -d / 2 + 0.12);
        M.box(dg, 0.34, 0.02, 0.12, mDark, 0, 0.77, 0.06);
        M.box(dg, 0.2, 0.4, 0.4, M.mat(0x1e293b), w / 2 - 0.18, 0.22, 0);
      }

      if (hasChair) {
        if (isExecutive) {
          makeExecutiveChair(dg, 0, 0.6, Math.PI);
        } else {
          makeChair(dg, 0, 0.55, Math.PI, 0x334155);
        }
      }
      if (hasVisitor) {
        makeChair(dg, -0.3, -0.6, 0, 0x0284c7);
        makeChair(dg,  0.3, -0.6, 0, 0x0284c7);
      }

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

    // Specifications helper
    const psychPcSpec = (code, name, role, user, ipSuffix, sw = 'HOSxP v3.6 / Psychiatric SMI-V') => ({
      code,
      name,
      role,
      user,
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
      ram: '16 GB DDR4-3200',
      storage: '512 GB M.2 NVMe SSD',
      monitor: '23.8" IPS Full HD (1920x1080)',
      ip: `192.168.12.${ipSuffix}`,
      software: sw,
      peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, UPS 850VA',
      status: '🟢 ออนไลน์ปกติ'
    });

    // --- ผนังรอบนอกอาคาร (Outer Walls) ---
    // ผนังหลังห้อง (North)
    wall(xMin, zMin, xMax, zMin, wThick, WH, true);
    // ผนังหน้าห้อง (South) พร้อมประตูเข้าแต่ละห้อง (ลบจุดที่มาร์คหน้าห้องออกทั้งหมด)
    // ประตูหน้าห้อง: ห้อง 1-5 ประตูอยู่ซ้ายล่าง, ห้อง 6 ประตูอยู่ขวาล่าง ตามผังวาด
    const frontDoors = [-13.8, -8.8, -3.8, 1.2, 6.2, 13.8];
    let lastFx = xMin;
    frontDoors.forEach((dx) => {
      wall(lastFx, zMax, dx - 0.55, zMax, wThick, WH, true);
      doorWay(dx, zMax, 0, 1.1);
      lastFx = dx + 0.55;
    });
    wall(lastFx, zMax, xMax, zMax, wThick, WH, true);

    // ผนังข้างซ้ายและขวา (West & East)
    wall(xMin, zMin, xMin, zMax, wThick, WH, true);
    wall(xMax, zMin, xMax, zMax, wThick, WH, true);

    // =========================================================================
    // 6 ห้องเรียงแถวยาว (X: -15.0 ถึง 15.0, Z: -4.0 ถึง 4.0) กว้างห้องละ 5.0m
    // Room 1: [-15.0, -10.0]
    // Room 2: [-10.0,  -5.0]
    // Room 3: [ -5.0,   0.0]
    // Room 4: [  0.0,   5.0]
    // Room 5: [  5.0,  10.0]
    // Room 6: [ 10.0,  15.0]
    // =========================================================================

    // --- ผนังกั้นระหว่างห้อง พร้อมประตูกำแพงเชื่อมระหว่างห้อง (Interconnecting Doors) ---
    // USER MANDATE: "ย้ายประตูด้านหลังห้องมาไว้ที่กำแพงเชื่อมแต่ละห้อง"
    // ประตูเชื่อมระหว่างห้องอยู่ที่กำแพงฝั่งบน (ทางทิศเหนือ Z = -2.0)
    const dividersX = [-10.0, -5.0, 0.0, 5.0, 10.0];
    const connDoorZ = -2.0;

    dividersX.forEach((vx) => {
      // ส่วนผนังด้านหลังประตูกั้นห้อง
      wall(vx, zMin, vx, connDoorZ - 0.55, wThick, WH);
      // ประตูเชื่อมต่อระหว่างห้อง
      doorWay(vx, connDoorZ, Math.PI / 2, 1.1);
      // ส่วนผนังด้านหน้าประตูกั้นห้องยาวไปถึงผนังหน้า
      wall(vx, connDoorZ + 0.55, vx, zMax, wThick, WH);
    });

    // =========================================================================
    // รายละเอียดและเฟอร์นิเจอร์ภายในแต่ละห้อง (ตามผังวาดของผู้ใช้)
    // =========================================================================

    // -------------------------------------------------------------------------
    // ห้องที่ 1: ห้องหัวหน้ากลุ่มงานยาเสพติดและจิตเวช (X: -15.0 ถึง -10.0)
    // ผัง: "โต๊ะคอม" ชิดกำแพงขวา
    // -------------------------------------------------------------------------
    const r1Pc = (K.PSYCH_SPECS && K.PSYCH_SPECS['70:85:C2:58:1A:3B']) || {
      code: 'PC-PSYCH-01',
      name: 'คอมหัวหน้ากลุ่มงานจิตเวชและยาเสพติด',
      hostname: 'CONSULT-PC',
      ip: '10.10.20.108',
      mac: '70:85:C2:58:1A:3B',
      switchId: 'ksp-sw-psych',
      switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
      switchPort: 'Port 1 (VLAN 20)',
      wallOutlet: 'PSYCH-RM1-01 (ห้องหัวหน้ากลุ่มงานจิตเวชฯ)',
      vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
      role: 'บริหารจัดการคลินิกสุขภาพจิต กำกับการบำบัดรักษา และระบบงานยาเสพติด',
      user: 'หัวหน้ากลุ่มงานจิตเวชและยาเสพติด',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
      ram: '16 GB DDR4-3200',
      storage: '512 GB M.2 NVMe SSD',
      monitor: '23.8" IPS Full HD (1920x1080)',
      software: 'HOSxP v3.6, Psychiatric SMI-V, Matrix Program, MOPH Claim',
      peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, UPS 850VA',
      status: '🟢 ออนไลน์ปกติ'
    };

    workDesk({
      x: -10.55, // ชิดกำแพงขวา (-10.0)
      z: 0.8,
      w: 1.4,
      d: 0.75,
      rotY: Math.PI / 2, // หันโต๊ะและจอพิงกำแพงขวา หัวหน้านั่งหันหน้าเข้าหาโต๊ะ
      hasPC: true,
      isExecutive: true,
      hasVisitor: true,
      label: '🖳 คอมหัวหน้าจิตเวชฯ (CONSULT-PC)',
      pcInfo: r1Pc
    });
    // ตู้เก็บเอกสารสำคัญและแฟ้มประวัติผู้ป่วยชิดผนังหลัง
    M.box(g, 2.0, 2.0, 0.5, mSteel, -13.5, 1.0, -3.4);
    // ชุดโซฟาปรึกษาครอบครัวผู้ป่วย (Family Consultation Sofa)
    M.box(g, 2.2, 0.45, 0.8, mLeather, -13.6, 0.225, 0.8);
    M.box(g, 1.0, 0.35, 0.5, mWood, -13.6, 0.175, 1.8);

    const r1Occ = psychState.room1Occupied;
    L.push({
      text: `🚪 ห้องที่ 1: ห้องหัวหน้ากลุ่มงานยาเสพติดและจิตเวช ${r1Occ ? '🔴 ปฏิบัติงาน' : '🟢 ว่าง'}`,
      pos: V(-12.5, 2.3, 0),
      cls: `int-label toggleable ${r1Occ ? 'busy' : 'free'}`,
      toggleId: 'psych-room-1'
    });

    // -------------------------------------------------------------------------
    // ห้องที่ 2: ห้องทำงาน (X: -10.0 ถึง -5.0)
    // ผัง: มี "โต๊ะคอม" 2 เครื่อง (ตัวกลาง และ ตัวขวา)
    // -------------------------------------------------------------------------
    const r2Pc1 = (K.PSYCH_SPECS && K.PSYCH_SPECS['A4:BB:6D:3C:99:1F']) || {
      code: 'PC-PSYCH-02',
      name: 'คอมพยาบาลจิตเวช 1',
      hostname: 'CSPC-PAN',
      ip: '10.10.20.27',
      mac: 'A4:BB:6D:3C:99:1F',
      switchId: 'ksp-sw-psych',
      switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
      switchPort: 'Port 2 (VLAN 20)',
      wallOutlet: 'PSYCH-RM2-01 (ห้องทำงานกลุ่มงานจิตเวชฯ)',
      vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
      role: 'งานซักประวัติ ประเมินสุขภาพจิต คัดกรองภาวะวิกฤต และติดตามผู้ป่วยจิตเวช SMI-V',
      user: 'พยาบาลวิชาชีพจิตเวช (คุณปาน)',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
      ram: '16 GB DDR4-3200',
      storage: '512 GB M.2 NVMe SSD',
      monitor: '23.8" IPS Full HD (1920x1080)',
      software: 'HOSxP v3.6, แบบคัดกรอง 2Q/9Q/8Q, Smart Card Agent',
      peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, UPS 850VA',
      status: '🟢 ออนไลน์ปกติ'
    };

    const r2Pc2 = (K.PSYCH_SPECS && K.PSYCH_SPECS['BC:24:11:8E:72:4D']) || {
      code: 'PC-PSYCH-03',
      name: 'คอมงานบำบัดยาเสพติด 2',
      hostname: 'DESKTOP-2JC9KOA',
      ip: '10.10.20.126',
      mac: 'BC:24:11:8E:72:4D',
      switchId: 'ksp-sw-psych',
      switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
      switchPort: 'Port 3 (VLAN 20)',
      wallOutlet: 'PSYCH-RM2-02 (ห้องทำงานกลุ่มงานจิตเวชฯ)',
      vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
      role: 'งานฟื้นฟูสมรรถภาพผู้ติดยาเสพติด ระบบ Matrix Program และคัดกรอง B-Fast',
      user: 'นักจิตวิทยา / นักวิชาการสาธารณสุข',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
      ram: '16 GB DDR4-3200',
      storage: '512 GB M.2 NVMe SSD',
      monitor: '23.8" IPS Full HD (1920x1080)',
      software: 'HOSxP v3.6, Matrix Program บำบัดยาเสพติด, B-Fast System',
      peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, UPS 850VA',
      status: '🟢 ออนไลน์ปกติ'
    };

    // โต๊ะคอมตัวกลาง (PC-PSYCH-02)
    workDesk({
      x: -7.8,
      z: 1.0,
      w: 1.25,
      d: 0.65,
      rotY: Math.PI, // หันหน้าไปทางทิศใต้
      label: '🖳 คอมพยาบาลจิตเวช 1 (CSPC-PAN)',
      pcInfo: r2Pc1
    });
    // โต๊ะคอมตัวขวา (PC-PSYCH-03)
    workDesk({
      x: -5.8,
      z: 1.0,
      w: 1.25,
      d: 0.65,
      rotY: Math.PI, // หันหน้าไปทางทิศใต้
      label: '🖳 คอมบำบัดยาเสพติด 2 (DESKTOP-2JC9KOA)',
      pcInfo: r2Pc2
    });
    // ตู้เก็บแฟ้มเอกสารและตู้เวชระเบียนชิดผนังเหนือ
    M.box(g, 2.6, 2.0, 0.5, mSteel, -7.5, 1.0, -3.4);

    const r2Occ = psychState.room2Occupied;
    L.push({
      text: `💼 ห้องที่ 2: ห้องทำงานกลุ่มงานจิตเวชฯ ${r2Occ ? '🟢 พร้อมบริการ' : '⚪ ว่าง'}`,
      pos: V(-7.5, 2.3, -0.5),
      cls: `int-label toggleable ${r2Occ ? 'free' : 'busy'}`,
      toggleId: 'psych-room-2'
    });

    // -------------------------------------------------------------------------
    // ห้องที่ 3: ว่าง (X: -5.0 ถึง 0.0)
    // ผัง: "ห้องที่ 3 ว่าง" จัดเป็นห้องให้คำปรึกษาและบำบัดกลุ่ม (Counseling Room)
    // -------------------------------------------------------------------------
    // วงเก้าอี้อาร์มแชร์สำหรับพูดคุยให้คำปรึกษาแบบเป็นกันเอง (Group Counseling Circle)
    [[-3.2, 0.0], [-1.8, 0.0], [-2.5, -0.9], [-2.5, 0.9]].forEach(([cx, cz]) => {
      const arm = M.box(g, 0.7, 0.45, 0.7, mLeather, cx, 0.225, cz);
      addEdges(arm, 0x0284c7);
      M.box(g, 0.7, 0.45, 0.15, mLeather, cx, 0.65, cz - 0.28);
    });
    M.cyl(g, 0.45, 0.45, 0.5, 16, mWood, -2.5, 0.25, 0.0);

    const r3Occ = psychState.room3Occupied;
    L.push({
      text: `🧘 ห้องที่ 3: ว่าง (ห้องให้คำปรึกษา/บำบัดกลุ่ม) ${r3Occ ? '🔴 กำลังใช้งาน' : '🟢 ว่าง'}`,
      pos: V(-2.5, 2.3, 0),
      cls: `int-label toggleable ${r3Occ ? 'busy' : 'free'}`,
      toggleId: 'psych-room-3'
    });

    // =========================================================================
    // 🔀 ตู้แร็คแขวนผนัง Switch Hub KSP-SW-PSYCH (ตำแหน่งมาร์คสีแดง ผนังห้องที่ 3)
    // =========================================================================
    function makePsychSwitchRack(x, y, z) {
      const swg = new THREE.Group();
      swg.position.set(x, y, z);
      swg.rotation.y = Math.PI; // หมุน 180 องศา ให้แผ่นหลังชิดผนังเหนือ (Z = -3.91) และประตูกระจกหันหน้าเข้าห้อง (+Z)

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
      cab.userData.serverId = 'ksp-sw-psych';
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
      doorGlass.userData.serverId = 'ksp-sw-psych';
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

      // Unit B: 1U Managed Switch Hub (KSP-SW-PSYCH, y = 0.0)
      const swUnit = maintBox(0.62, 0.08, 0.34, 0x0284c7);
      swUnit.position.set(0, 0.0, -0.04);
      addEdges(swUnit, 0x38bdf8);
      swUnit.userData.serverId = 'ksp-sw-psych';
      swg.add(swUnit);

      // Switch Faceplate (Dark Metallic)
      const faceplate = maintBox(0.60, 0.07, 0.015, 0x0f172a);
      faceplate.position.set(0, 0.0, -0.205);
      faceplate.userData.serverId = 'ksp-sw-psych';
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
        port.userData.serverId = 'ksp-sw-psych';
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

    // ติดตั้งตู้แร็ค Switch Hub ที่ผนังห้องที่ 3 (ตำแหน่งมาร์คสีแดง: x = -3.85, y = 2.05, z = -3.71)
    makePsychSwitchRack(-3.85, 2.05, -3.71);
    L.push({
      text: '🔀 KSP-SW-PSYCH (10.10.100.12)',
      pos: V(-3.85, 2.70, -3.45),
      cls: 'int-label server-badge clickable',
      serverId: 'ksp-sw-psych'
    });

    // -------------------------------------------------------------------------
    // ห้องที่ 4: ว่าง (X: 0.0 ถึง 5.0)
    // ผัง: "ห้องที่ 4 ว่าง" จัดเป็นห้องสงบอารมณ์และสังเกตอาการ (Calming Room)
    // -------------------------------------------------------------------------
    // โซฟาพักผ่อนนุ่มไร้มุมแหลม ปลอดภัยสำหรับผู้ป่วย
    M.box(g, 2.4, 0.48, 1.0, M.mat(0x99f6e4, { roughness: 0.5 }), 2.5, 0.24, 0.0);
    M.box(g, 2.4, 0.5, 0.2, M.mat(0x0d9488), 2.5, 0.65, -0.4);
    // ชั้นวางอุปกรณ์ผ่อนคลายและสื่อดนตรีบำบัด
    M.box(g, 1.2, 1.2, 0.4, mWood, 4.2, 0.6, -3.4);

    const r4Occ = psychState.room4Occupied;
    L.push({
      text: `🛋️ ห้องที่ 4: ว่าง (ห้องพักฟื้น/สงบอารมณ์) ${r4Occ ? '🔴 มีผู้ป่วยพักฟื้น' : '🟢 ว่าง'}`,
      pos: V(2.5, 2.3, 0),
      cls: `int-label toggleable ${r4Occ ? 'busy' : 'free'}`,
      toggleId: 'psych-room-4'
    });

    // -------------------------------------------------------------------------
    // ห้องที่ 5: ว่าง (X: 5.0 ถึง 10.0)
    // ผัง: "ห้องที่ 5 ว่าง" มี "โต๊ะคอม" ชิดกำแพงซ้าย
    // -------------------------------------------------------------------------
    workDesk({
      x: 5.55, // ชิดกำแพงซ้าย (5.0)
      z: 0.8,
      w: 1.3,
      d: 0.65,
      rotY: -Math.PI / 2, // หันโต๊ะและจอพิงกำแพงซ้าย
      hasPC: true,
      hasVisitor: true,
      label: '🖳 คอมประเมินสุขภาพจิต (ห้อง 5)',
      pcInfo: psychPcSpec('PC-PSYCH-04', 'คอมพิวเตอร์ห้อง 5 (ประเมินสุขภาพจิต)', 'ระบบบันทึกแบบประเมินภาวะซึมเศร้า 2Q / 9Q / 8Q และระบบติดตามสารเสพติด บันทึกข้อมูลคัดกรอง', 'นักจิตวิทยา / เจ้าหน้าที่สาธารณสุข', '05')
    });
    // ตู้เก็บเอกสารแบบประเมินและแบบทดสอบทางจิตวิทยา
    M.box(g, 1.6, 1.9, 0.45, mSteel, 9.0, 0.95, -3.4);

    const r5Occ = psychState.room5Occupied;
    L.push({
      text: `📋 ห้องที่ 5: ว่าง (จุดประเมินสุขภาพจิต) ${r5Occ ? '🔴 กำลังประเมิน' : '🟢 ว่าง'}`,
      pos: V(7.5, 2.3, 0),
      cls: `int-label toggleable ${r5Occ ? 'busy' : 'free'}`,
      toggleId: 'psych-room-5'
    });

    // -------------------------------------------------------------------------
    // ห้องที่ 6: ว่าง (X: 10.0 ถึง 15.0)
    // ผัง: "ห้องที่ 6 ว่าง" ประตูอยู่มุมขวาล่าง
    // -------------------------------------------------------------------------
    // ห้องอเนกประสงค์ / จัดเตรียมสื่อกิจกรรมบำบัด
    M.box(g, 2.6, 0.74, 1.2, M.mat(0xf1f5f9), 12.5, 0.37, 0.0);
    makeChair(g, 11.5, 0.0, Math.PI / 2, 0x0284c7);
    makeChair(g, 13.5, 0.0, -Math.PI / 2, 0x0284c7);
    M.box(g, 1.8, 1.9, 0.45, mSteel, 14.0, 0.95, -3.4);

    const r6Occ = psychState.room6Occupied;
    L.push({
      text: `🎨 ห้องที่ 6: ว่าง (ห้องกิจกรรมบำบัด/อเนกประสงค์) ${r6Occ ? '🔴 กำลังใช้งาน' : '🟢 ว่าง'}`,
      pos: V(12.5, 2.3, 0),
      cls: `int-label toggleable ${r6Occ ? 'busy' : 'free'}`,
      toggleId: 'psych-room-6'
    });

    // รายการไอเทมสำหรับ Interior Panel (Array Schema สำหรับ KSS.app.js)
    const itemsList = [
      ['🚪', 'ห้องที่ 1 ห้องหัวหน้ากลุ่มงาน (CONSULT-PC: 10.10.20.108)', psychState.room1Occupied ? '🔴 ปฏิบัติงาน' : '🟢 ว่าง', 'psych-room-1', psychState.room1Occupied ? 'busy' : 'free'],
      ['💼', 'ห้องที่ 2 ห้องทำงาน (CSPC-PAN: 10.10.20.27 / DESKTOP-2JC9KOA: 10.10.20.126)', psychState.room2Occupied ? '🟢 พร้อมบริการ' : '⚪ ว่าง', 'psych-room-2', psychState.room2Occupied ? 'free' : 'busy'],
      ['🧘', 'ห้องที่ 3 ห้องว่าง (ให้คำปรึกษาและบำบัดกลุ่ม • ตู้แร็คสวิตช์)', psychState.room3Occupied ? '🔴 กำลังใช้งาน' : '🟢 ว่าง', 'psych-room-3', psychState.room3Occupied ? 'busy' : 'free'],
      ['🛋️', 'ห้องที่ 4 ห้องว่าง (ห้องพักฟื้นและสงบอารมณ์)', psychState.room4Occupied ? '🔴 มีผู้ป่วยพักฟื้น' : '🟢 ว่าง', 'psych-room-4', psychState.room4Occupied ? 'busy' : 'free'],
      ['📋', 'ห้องที่ 5 ห้องว่าง (จุดประเมินสุขภาพจิต โต๊ะคอมชิดซ้าย)', psychState.room5Occupied ? '🔴 กำลังประเมิน' : '🟢 ว่าง', 'psych-room-5', psychState.room5Occupied ? 'busy' : 'free'],
      ['🎨', 'ห้องที่ 6 ห้องว่าง (ห้องกิจกรรมบำบัด/อเนกประสงค์)', psychState.room6Occupied ? '🔴 กำลังใช้งาน' : '🟢 ว่าง', 'psych-room-6', psychState.room6Occupied ? 'busy' : 'free'],
      ['🔀', 'KSP-SW-PSYCH: สวิตช์ฮับตึกจิตเวชฯ (10.10.100.12)', '🟢 ออนไลน์ (ห้องที่ 3)', 'server-ksp-sw-psych', 'free']
    ];

    return {
      group: g,
      labels: L,
      size: { w: W, d: D, h: WH },
      title: '🧠 ผังภายใน อาคารจิตเวชและยาเสพติด (Psychiatric Clinic)',
      sub: 'ผังแถวยาวเรียงห้อง 1–6 (ห้องหัวหน้า, ห้องทำงาน 2 คอม, ห้อง 3 ว่าง, ห้อง 4 ว่าง, ห้อง 5 มีคอมชิดซ้าย, ห้อง 6 ว่าง) พร้อมประตูกำแพงเชื่อมระหว่างห้อง',
      items: itemsList,
      cam: { pos: V(0, 18, 18), target: V(0, 0, 0) }
    };
  }

  function togglePsychStatus(id) {
    if (id.startsWith('psych-room-')) {
      const num = id.replace('psych-room-', '');
      psychState['room' + num + 'Occupied'] = !psychState['room' + num + 'Occupied'];
      return true;
    }
    return false;
  }

  K.Interiors.register('psych', buildPsychInterior, togglePsychStatus);
})();
