/* =========================================================================
 * ตึกผู้ป่วยใน (IPD - Inpatient Department 1 ชั้น)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, walkwayStrip, makePerson } = C;

  const ipdBedConfigs = [
    // โซนซ้ายสุด (Bay 1: เตียง 1–3 หันหัวเตียงชิดผนังซ้าย X = -18.0)
    [1,  -16.6,  1.3,  Math.PI / 2, true],
    [2,  -16.6, -0.6,  Math.PI / 2, true],
    [3,  -16.6, -5.2,  Math.PI / 2, false],
    // โซนซ้ายถัดมา ฝั่งซ้าย (Bay 2 ซ้าย: เตียง 4–7 หันหัวเตียงชิดผนัง X = -12.8)
    [4,  -11.4,  1.3,  Math.PI / 2, true],
    [5,  -11.4, -0.6,  Math.PI / 2, false],
    [6,  -11.4, -4.85, Math.PI / 2, true],
    [7,  -11.4, -6.75, Math.PI / 2, true],
    // โซนซ้ายถัดมา ฝั่งขวา (Bay 2 ขวา: เตียง 8–11 หันหัวเตียงชิดผนัง X = -6.2)
    [8,   -7.6,  1.3, -Math.PI / 2, true],
    [9,   -7.6, -0.6, -Math.PI / 2, true],
    [10,  -7.6, -4.85,-Math.PI / 2, false],
    [11,  -7.6, -6.75,-Math.PI / 2, true],
    // โซนซ้ายติดแกนกลาง (Bay 3: เตียง 12–15 หันหัวเตียงชิดผนังกลาง X = -0.25)
    [12,  -1.65, 1.3, -Math.PI / 2, true],
    [13,  -1.65,-0.6, -Math.PI / 2, false],
    [14,  -1.65,-4.85,-Math.PI / 2, true],
    [15,  -1.65,-6.75,-Math.PI / 2, true],
    // โซนขวาติดแกนกลาง (Bay 4: เตียง 16–19 หันหัวเตียงชิดผนังกลาง X = +0.25)
    [16,   1.65, 1.3,  Math.PI / 2, true],
    [17,   1.65,-0.6,  Math.PI / 2, true],
    [18,   1.65,-4.85, Math.PI / 2, false],
    [19,   1.65,-6.75, Math.PI / 2, true],
    // โซนขวาถัดมา ฝั่งซ้าย (Bay 5 ซ้าย: เตียง 20–23 หันหัวเตียงชิดผนัง X = +6.2)
    [20,   7.6,  1.3,  Math.PI / 2, false],
    [21,   7.6, -0.6,  Math.PI / 2, true],
    [22,   7.6, -4.85, Math.PI / 2, true],
    [23,   7.6, -6.75, Math.PI / 2, false],
    // โซนขวาถัดมา ฝั่งขวา (Bay 5 ขวา: เตียง 24–27 หันหัวเตียงชิดผนัง X = +12.8)
    [24,  11.4,  1.3, -Math.PI / 2, true],
    [25,  11.4, -0.6, -Math.PI / 2, true],
    [26,  11.4, -4.85,-Math.PI / 2, false],
    [27,  11.4, -6.75,-Math.PI / 2, true],
    // โซนขวาสุด (Bay 6: เตียง 28–30 หันหัวเตียงชิดผนังขวา X = +18.0)
    [28,  16.6,  1.3, -Math.PI / 2, true],
    [29,  16.6, -0.6, -Math.PI / 2, false],
    [30,  16.6, -5.2, -Math.PI / 2, true]
  ];

  const ipdState = {
    beds: ipdBedConfigs.map(([num, x, z, rotY, occupied]) => ({
      id: `ipd-bed-${num}`,
      num,
      name: `เตียง ${num}`,
      x,
      z,
      rotY,
      occupied
    })),
    isoRooms: [
      { id: 'ipd-iso-1', name: 'ห้องแยกโรค 1 (ฝั่งขวาบน)', x: 21.0, z: 0.35, occupied: true },
      { id: 'ipd-iso-2', name: 'ห้องแยกโรค 2 (ฝั่งซ้ายล่าง)', x: -20.75, z: 6.4, occupied: true },
      { id: 'ipd-iso-3', name: 'ห้องแยกโรค 3 (ฝั่งขวาล่าง 1)', x: 11.1, z: 6.4, occupied: false },
      { id: 'ipd-iso-4', name: 'ห้องแยกโรค 4 (ฝั่งขวาล่าง 2)', x: 16.25, z: 6.4, occupied: true },
      { id: 'ipd-iso-5', name: 'ห้องแยกโรค 5 (ฝั่งขวาล่าง 3)', x: 21.4, z: 6.4, occupied: false }
    ]
  };

  function buildIpdInterior() {
    const g = new THREE.Group();
    const L = [];
    const pcList = [];

    floor(g, 19.0, 4.0, '#f8fafc', '#cbd5e1', 1.0, 0, -10.5);
    floor(g, 24.0, 11.0, '#f0f9ff', '#bae6fd', 1.0, -12.0, -3.0);
    floor(g, 24.0, 11.0, '#f0f9ff', '#bae6fd', 1.0,  12.0, -3.0);
    floor(g, 48.0, 1.8, '#e2e8f0', '#94a3b8', 1.0, 0, 3.4);
    floor(g, 48.0, 6.2, '#f8fafc', '#cbd5e1', 1.0, 0, 7.4);

    floor(g, 6.0, 4.3, '#fef9c3', '#fde047', 0.5,  21.0,  0.35);
    floor(g, 6.5, 4.2, '#fef9c3', '#fde047', 0.5, -20.75, 6.4);
    floor(g, 5.2, 4.2, '#fef9c3', '#fde047', 0.5,  11.1,  6.4);
    floor(g, 5.1, 4.2, '#fef9c3', '#fde047', 0.5,  16.25, 6.4);
    floor(g, 5.2, 4.2, '#fef9c3', '#fde047', 0.5,  21.4,  6.4);

    walkwayStrip(g, 0,     3.4, 47.2, 1.3, 0);
    walkwayStrip(g, 0,    -3.0, 35.0, 1.1, 0);
    walkwayStrip(g, -3.5, -3.0, 10.2, 1.0, Math.PI / 2);
    walkwayStrip(g,  3.5, -3.0, 10.2, 1.0, Math.PI / 2);

    L.push({ text: '🚶 ทางเดิน', pos: V(0, 0.35, 3.4), cls: 'int-label walkway-tag' });

    const wallMat = M.mat(0xf8fafc, { roughness: 0.5 });
    const outerWallMat = M.mat(0x1e293b, { roughness: 0.6 });
    const doorMat = M.mat(0xd97706, { roughness: 0.5 });
    const WH = 1.65;

    function wall(x1, z1, x2, z2, thick = 0.16, h = WH, isOuter = false) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.05) return;
      const wMesh = M.box(
        g, len, h, thick,
        isOuter ? outerWallMat : wallMat,
        (x1 + x2) / 2, h / 2, (z1 + z2) / 2
      );
      wMesh.rotation.y = -Math.atan2(dz, dx);
      addEdges(wMesh, isOuter ? 0x0f172a : 0x64748b);
      return wMesh;
    }

    function doorWay(x, z, rotY = 0, w = 1.15, showLabel = true) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;
      M.box(dg, w, 0.04, 0.26, 0x475569, 0, 0.02, 0);
      const panel = M.box(dg, w * 0.85, 1.45, 0.06, doorMat, -w * 0.2, 0.73, 0.28);
      panel.rotation.y = 0.55;
      addEdges(panel, 0x78350f);
      g.add(dg);
      if (showLabel) {
        L.push({ text: 'ประตู', pos: V(x, 1.55, z), cls: 'int-label sub-tag' });
      }
    }

    function makePcSpec(code, name, role, ipSuffix, software) {
      return {
        code,
        name,
        role,
        cpu: 'Intel Core i5-13500 (14 Cores, Up to 4.8 GHz)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'NVMe M.2 SSD 512 GB',
        monitor: 'Dell 24" IPS Full HD (Eye-Care)',
        os: 'Windows 11 Pro 64-bit (Hospital Domain)',
        ip: `192.168.40.${ipSuffix}`,
        status: '🟢 ออนไลน์ (เชื่อมต่อระบบ HOSxP IPD)',
        software,
        peripherals: 'เครื่องอ่านบัตรประชาชน Smart Card • เครื่องพิมพ์สติ๊กเกอร์บาร์โค้ดผู้ป่วยใน • เครื่องสแกนบาร์โค้ด',
        user: role
      };
    }

    function workDesk(opts) {
      const {
        x, z, w = 1.25, d = 0.62, rotY = 0,
        hasPC = true, label = null, staffRole = 'nurse',
        pcInfo = null
      } = opts;
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      const topM = M.mat(hasPC ? 0xe2e8f0 : 0xd6b588, { roughness: 0.5 });
      const legM = M.mat(0x334155);
      const deskTop = M.box(dg, w, 0.06, d, topM, 0, 0.74, 0);
      addEdges(deskTop, 0x475569);
      M.box(dg, w - 0.08, 0.72, d - 0.08, M.mat(0x94a3b8), 0, 0.36, 0);

      if (hasPC) {
        const dark = M.mat(0x0f172a);
        const mon = M.box(dg, 0.44, 0.3, 0.03, dark, 0, 0.96, d / 2 - 0.1);
        addEdges(mon, 0x38bdf8);
        const scrGlow = M.box(dg, 0.4, 0.25, 0.01, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.96, d / 2 - 0.12);
        M.box(dg, 0.05, 0.12, 0.05, dark, 0, 0.8, d / 2 - 0.08);
        M.box(dg, 0.3, 0.02, 0.12, dark, 0, 0.78, -0.02);
        M.box(dg, 0.18, 0.38, 0.38, M.mat(0x1e293b), w / 2 - 0.16, 0.2, 0);
        if (pcInfo) {
          dg.userData.pcInfo = pcInfo;
          deskTop.userData.pcInfo = pcInfo;
          mon.userData.pcInfo = pcInfo;
          scrGlow.userData.pcInfo = pcInfo;
          pcList.push(pcInfo);
        }
      }

      M.box(dg, 0.42, 0.06, 0.42, legM, 0, 0.45, -d / 2 - 0.26);
      M.box(dg, 0.42, 0.45, 0.06, legM, 0, 0.7, -d / 2 - 0.46);
      const nurse = makePerson({ role: staffRole, pose: 'sit', rotY: 0 });
      nurse.position.set(0, 0, -d / 2 - 0.26);
      dg.add(nurse);

      g.add(dg);
      if (label) {
        L.push({
          text: pcInfo ? `🖥️ ${label}` : label,
          pos: V(x, 1.42, z),
          cls: pcInfo ? 'int-label pc-tag' : 'int-label sub-tag',
          pcInfo: pcInfo || null
        });
      }
      return dg;
    }

    function ipdBed(opts) {
      const {
        x, z, rotY = 0, occupied = false,
        label = null, statusId = null, showStaff = false
      } = opts;
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);
      bg.rotation.y = rotY;

      const bw = 0.86, bd = 1.85;
      const frame = M.box(bg, bw, 0.45, bd, M.mat(0x64748b), 0, 0.225, 0);
      addEdges(frame, 0x1e293b);
      const sheetColor = occupied ? 0xfee2e2 : 0xecfdf5;
      const mattress = M.box(bg, bw - 0.06, 0.14, bd - 0.06, M.mat(sheetColor), 0, 0.52, 0);
      addEdges(mattress, occupied ? 0xdc2626 : 0x16a34a);
      M.box(bg, bw, 0.35, 0.06, M.mat(0x1e40af), 0, 0.65, -bd / 2 + 0.03);
      M.box(bg, bw, 0.25, 0.06, M.mat(0x1e40af), 0, 0.6, bd / 2 - 0.03);
      M.box(bg, bw * 0.62, 0.08, 0.28, M.mat(0xffffff), 0, 0.62, -bd / 2 + 0.24);

      if (occupied) {
        const pat = makePerson({ role: 'patient', pose: 'lie', rotY: 0 });
        bg.add(pat);
        if (showStaff) {
          const nurse = makePerson({ role: 'nurse', pose: 'stand', rotY: -Math.PI / 2 });
          nurse.position.set(bw / 2 + 0.32, 0, -0.15);
          bg.add(nurse);
        }
        M.cyl(bg, 0.02, 0.02, 1.6, M.mat(0x94a3b8, { metalness: 0.6 }), -bw / 2 - 0.14, 0.8, -bd / 2 + 0.22, 8);
        M.box(bg, 0.1, 0.18, 0.06, M.mat(0x38bdf8, { transparent: true, opacity: 0.8 }), -bw / 2 - 0.14, 1.45, -bd / 2 + 0.22);
      }

      g.add(bg);
      if (label) {
        const statusText = occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง';
        L.push({
          text: `${label} (${statusText})`,
          pos: V(x, 1.75, z),
          cls: `int-label ${occupied ? 'busy' : 'free'} ${statusId ? 'toggleable' : ''}`,
          toggleId: statusId
        });
      }
      return bg;
    }

    function buildToiletStall(x, z, side = 'left') {
      const tg = new THREE.Group();
      tg.position.set(x, 0, z);
      const base = M.box(tg, 1.35, 0.06, 1.15, M.mat(0xdbeafe), 0, 0.03, 0);
      addEdges(base, 0x2563eb);
      M.cyl(tg, 0.18, 0.15, 0.42, M.mat(0xffffff), side === 'left' ? -0.25 : 0.25, 0.21, 0, 12);
      M.box(tg, 0.16, 0.38, 0.34, M.mat(0xffffff), side === 'left' ? -0.45 : 0.45, 0.52, 0);
      g.add(tg);
    }

    // โซนด้านบนสุด: จุดนั่งคอย
    wall(-9.5, -12.5,  9.5, -12.5, 0.20, WH, true);
    wall(-9.5, -12.5, -9.5,  -8.5, 0.20, WH, true);
    wall( 9.5, -12.5,  9.5,  -8.5, 0.20, WH, true);

    [-5.6, 0, 5.6].forEach((bx, idx) => {
      const bench = M.box(g, 3.6, 0.46, 0.85, M.mat(0x0284c7), bx, 0.23, -10.8);
      addEdges(bench, 0x1e3a8a);
      M.box(g, 3.6, 0.48, 0.1, M.mat(0x0369a1), bx, 0.68, -11.18);
      [-1.0, 0.9].forEach((ox, i) => {
        const rel = makePerson({
          role: 'relative',
          shirtColor: (idx + i) % 2 === 0 ? 0xf59e0b : 0x10b981,
          pose: 'sit',
          rotY: 0
        });
        rel.position.set(bx + ox, 0, -10.75);
        g.add(rel);
      });
      L.push({ text: '🪑 ที่นั่ง', pos: V(bx, 1.55, -10.8), cls: 'int-label sub-tag' });
    });

    // หอผู้ป่วยในหลัก
    wall(-24.0, -8.5, -4.3, -8.5, 0.22, WH, true);
    wall( -2.7, -8.5,  2.7, -8.5, 0.22, WH, true);
    wall(  4.3, -8.5, 24.0, -8.5, 0.22, WH, true);
    doorWay(-3.5, -8.5, 0, 1.35, true);
    doorWay( 3.5, -8.5, 0, 1.35, true);

    wall(-24.0, -8.5, -24.0, 10.5, 0.22, WH, true);
    wall( 24.0, -8.5,  24.0, 10.5, 0.22, WH, true);

    wall(-0.25, -8.5, -0.25, 2.5, 0.16, WH);
    wall( 0.25, -8.5,  0.25, 2.5, 0.16, WH);

    [-18.0, -12.8, -6.2].forEach((wx) => {
      wall(wx, -8.5, wx, -4.0, 0.16, WH);
      wall(wx, -2.0, wx,  2.5, 0.16, WH);
      wall(wx - 0.35, -4.0, wx + 0.35, -4.0, 0.14, WH);
      wall(wx - 0.35, -2.0, wx + 0.35, -2.0, 0.14, WH);
    });

    [6.2, 12.8, 18.0].forEach((wx) => {
      wall(wx, -8.5, wx, -4.0, 0.16, WH);
      wall(wx, -2.0, wx,  2.5, 0.16, WH);
      wall(wx - 0.35, -4.0, wx + 0.35, -4.0, 0.14, WH);
      wall(wx - 0.35, -2.0, wx + 0.35, -2.0, 0.14, WH);
    });

    [-6.8, -5.2, -3.6, -2.0].forEach((tz) => {
      buildToiletStall(-22.2, tz, 'left');
      wall(-24.0, tz + 0.75, -20.8, tz + 0.75, 0.12, 1.35);
    });
    L.push({ text: '🚻 ห้องน้ำผู้ป่วย (ฝั่งซ้าย 4 ห้อง)', pos: V(-21.8, 1.85, -4.4), cls: 'int-label room-title' });

    [-7.2, -5.8, -4.4, -3.0].forEach((tz) => {
      buildToiletStall(22.2, tz, 'right');
      wall(20.8, tz + 0.65, 24.0, tz + 0.65, 0.12, 1.35);
    });
    L.push({ text: '🚻 ห้องน้ำผู้ป่วย (ฝั่งขวา 4 ห้อง)', pos: V(21.8, 1.85, -5.2), cls: 'int-label room-title' });

    wall(18.0, -1.8, 20.2, -1.8, 0.18, WH);
    wall(21.8, -1.8, 24.0, -1.8, 0.18, WH);
    doorWay(21.0, -1.8, 0, 1.25, true);

    ipdState.beds.forEach((b, idx) => {
      ipdBed({
        x: b.x,
        z: b.z,
        rotY: b.rotY,
        occupied: b.occupied,
        label: b.name,
        statusId: b.id,
        showStaff: idx % 3 === 0
      });
    });

    wall(-24.0, 2.5, -4.3, 2.5, 0.22, WH, true);
    wall( -2.7, 2.5,  2.7, 2.5, 0.22, WH, true);
    wall(  4.3, 2.5, 24.0, 2.5, 0.22, WH, true);
    doorWay(-3.5, 2.5, 0, 1.35, true);
    doorWay( 3.5, 2.5, 0, 1.35, true);

    // โซนด้านล่างของทางเดิน
    wall(-24.0, 4.3, -15.2, 4.3, 0.22, WH, true);
    wall(-13.6, 4.3, -10.6, 4.3, 0.22, WH, true);
    wall( -9.0, 4.3,   1.8, 4.3, 0.22, WH, true);
    wall(  3.4, 4.3,   5.7, 4.3, 0.22, WH, true);
    wall(  7.3, 4.3,  24.0, 4.3, 0.22, WH, true);

    doorWay(-14.4, 4.3, 0, 1.3, true);
    doorWay( -9.8, 4.3, 0, 1.3, true);
    doorWay(  2.6, 4.3, 0, 1.3, true);
    doorWay(  6.5, 4.3, 0, 1.3, true);

    wall(-24.0, 10.5, 24.0, 10.5, 0.22, WH, true);

    wall(-17.5, 4.3, -17.5, 8.5, 0.18, WH);
    wall(-24.0, 8.5, -15.2, 8.5, 0.18, WH);
    wall(-13.6, 8.5, -11.5, 8.5, 0.18, WH);
    doorWay(-14.4, 8.5, 0, 1.3, true);

    wall(-11.5, 4.3, -11.5, 8.7, 0.18, WH);
    wall(-11.5, 10.1, -11.5, 10.5, 0.18, WH);
    doorWay(-11.5, 9.4, Math.PI / 2, 1.25, true);

    wall(4.5, 4.3, 4.5, 10.5, 0.18, WH);

    workDesk({
      x: -10.4, z: 7.3, w: 1.85, d: 0.65, rotY: -Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม IPC 1', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-IPD-01', 'โต๊ะคอมพิวเตอร์ IPC 1 (หอผู้ป่วยใน - รับใหม่/จำหน่ายผู้ป่วย)', 'พยาบาลวิชาชีพบันทึกข้อมูลรับผู้ป่วยใน (Admit), ย้ายเตียง และสรุปวันนอน', '301', 'ระบบ HOSxP IPD Admission • ระบบบริหารจัดการเตียงผู้ป่วยใน (Bed Management)')
    });

    workDesk({
      x: -6.2, z: 5.15, w: 1.85, d: 0.65, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม IPC 2', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-IPD-02', 'โต๊ะคอมพิวเตอร์ IPC 2 (หอผู้ป่วยใน - บันทึกทางการพยาบาล/สั่งยา IPD)', 'พยาบาลวิชาชีพตรวจสอบคำสั่งการรักษาของแพทย์ (Doctor Order) และเบิกยาผู้ป่วยใน', '302', 'ระบบ HOSxP IPD Nurse Note • ระบบ e-MAR & เบิกยาหอผู้ป่วยใน')
    });

    workDesk({
      x: -2.3, z: 5.15, w: 1.85, d: 0.65, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม IPC 3', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-IPD-03', 'โต๊ะคอมพิวเตอร์ IPC 3 (หอผู้ป่วยใน - แพทย์ตรวจเยี่ยม/ดูผลแล็บ & X-Ray)', 'แพทย์และพยาบาลตรวจสอบผลตรวจทางห้องปฏิบัติการ (LIS) และภาพเอกซเรย์ (PACS) ของผู้ป่วยใน', '303', 'ระบบ HOSxP IPD Doctor Chart • ระบบ PACS & LIS Viewer หอผู้ป่วยใน')
    });

    const nsCounter = M.box(g, 4.8, 0.92, 1.15, M.mat(0xdbeafe), -3.5, 0.46, 7.8);
    addEdges(nsCounter, 0x2563eb);
    M.box(g, 4.9, 0.06, 1.25, M.mat(0xffffff), -3.5, 0.95, 7.8);
    const headNurse = makePerson({ role: 'nurse', pose: 'stand', rotY: Math.PI });
    headNurse.position.set(-4.3, 0, 8.7);
    g.add(headNurse);
    const wardDoc = makePerson({ role: 'doctor', pose: 'stand', rotY: Math.PI });
    wardDoc.position.set(-2.7, 0, 8.7);
    g.add(wardDoc);
    L.push({ text: '👩‍⚕️ Nurse Station (เคาน์เตอร์พยาบาลผู้ป่วยใน)', pos: V(-3.5, 2.05, 7.8), cls: 'int-label room-title' });

    const ncsBase = M.box(g, 0.85, 0.88, 2.2, M.mat(0xe0f2fe), 3.95, 0.44, 7.4);
    addEdges(ncsBase, 0x0284c7);
    const ncsWallPanel = M.box(g, 0.12, 0.75, 1.65, M.mat(0x1e293b), 4.34, 1.35, 7.4);
    addEdges(ncsWallPanel, 0x38bdf8);
    const ncsPhone = M.box(g, 0.5, 0.25, 0.68, M.mat(0xef4444), 3.9, 1.0, 6.85);
    addEdges(ncsPhone, 0x991b1b);
    M.box(g, 0.48, 0.22, 0.78, M.mat(0x1e293b), 3.9, 0.99, 7.85);
    M.cyl(g, 0.08, 0.08, 0.08, M.mat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.6 }), 3.85, 1.12, 7.68, 12);
    M.cyl(g, 0.08, 0.08, 0.08, M.mat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.6 }), 3.85, 1.12, 8.02, 12);
    L.push({ text: '📟 Nurse Call System (ระบบเรียกพยาบาล)', pos: V(3.85, 2.1, 7.4), cls: 'int-label room-title' });

    wall(8.5,  4.3,  8.5,  8.5, 0.18, WH);
    wall(13.7, 4.3, 13.7,  8.5, 0.18, WH);
    wall(18.8, 4.3, 18.8,  8.5, 0.18, WH);
    wall(8.5,  8.5, 10.3, 8.5, 0.18, WH);
    wall(11.9, 8.5, 15.4, 8.5, 0.18, WH);
    wall(17.0, 8.5, 20.6, 8.5, 0.18, WH);
    wall(22.2, 8.5, 24.0, 8.5, 0.18, WH);
    doorWay(11.1, 8.5, 0, 1.25, true);
    doorWay(16.2, 8.5, 0, 1.25, true);
    doorWay(21.4, 8.5, 0, 1.25, true);

    ipdState.isoRooms.forEach((iso) => {
      ipdBed({
        x: iso.x,
        z: iso.z,
        rotY: 0,
        occupied: iso.occupied,
        label: null,
        statusId: null,
        showStaff: iso.occupied
      });
      const mon = M.box(g, 0.55, 1.15, 0.45, M.mat(0xfef08a), iso.x + 1.45, 0.58, iso.z - 0.8);
      addEdges(mon, 0xca8a04);
      L.push({
        text: `🩺 ${iso.name}: ${iso.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง'}`,
        pos: V(iso.x, 2.05, iso.z),
        cls: `int-label ${iso.occupied ? 'busy' : 'free'} toggleable`,
        toggleId: iso.id
      });
    });

    const items = [];
    ipdState.isoRooms.forEach((r) => {
      items.push([
        '🩺',
        r.name,
        r.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง',
        r.id,
        r.occupied ? 'busy' : 'free'
      ]);
    });
    ipdState.beds.forEach((b) => {
      items.push([
        '🛏️',
        `${b.name} (ผู้ป่วยใน)`,
        b.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง',
        b.id,
        b.occupied ? 'busy' : 'free'
      ]);
    });
    pcList.forEach((pc) => {
      items.push([
        '🖥️',
        `${pc.code}: ${pc.name}`,
        'ดูสเปก',
        null,
        'free',
        pc
      ]);
    });
    items.push(['👩‍⚕️', 'Nurse Station (เคาน์เตอร์พยาบาล)', 'เปิดบริการ']);
    items.push(['📟', 'Nurse Call System (ระบบเรียกพยาบาล)', 'ออนไลน์']);
    items.push(['🚻', 'ห้องน้ำผู้ป่วย (ฝั่งซ้าย 4 • ฝั่งขวา 4)', '8 ห้อง']);
    items.push(['🪑', 'จุดที่นั่งคอยญาติผู้ป่วยด้านหน้า', '3 จุด']);

    return {
      group: g,
      labels: L,
      size: 50,
      title: '🛏️ ผังภายในตึกผู้ป่วยใน (IPD - อาคาร 1 ชั้น): เตียง 1–30 • Nurse Station • ห้องแยกโรค',
      sub: 'คลิกป้าย "ว่าง/ไม่ว่าง" เพื่อสลับสถานะเตียง 1–30 และห้องแยกโรค • คลิกป้าย "🖥️ โต๊ะคอม IPC 1–3" เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 34, 29), target: V(0, 0, -0.5) }
    };
  }

  function toggleIpdStatus(id) {
    const ipdBedItem = ipdState.beds.find((b) => b.id === id);
    if (ipdBedItem) {
      ipdBedItem.occupied = !ipdBedItem.occupied;
      return true;
    }
    const ipdIso = ipdState.isoRooms.find((r) => r.id === id);
    if (ipdIso) {
      ipdIso.occupied = !ipdIso.occupied;
      return true;
    }
    return false;
  }

  K.Interiors.register('ipd', buildIpdInterior, toggleIpdStatus);
})();
