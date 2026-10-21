/* =========================================================================
 * โรงไฟฟ้า (Power Plant / Backup Generator Room)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, walkwayStrip } = C;

  const powerState = {
    running: false
  };

  function powerWarningSignTexture() {
    return M.canvasTexture(640, 240, (c, w, h) => {
      c.fillStyle = '#facc15';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = '#1e293b';
      c.lineWidth = 14;
      c.strokeRect(7, 7, w - 14, h - 14);
      c.fillStyle = '#dc2626';
      c.fillRect(16, 16, w - 32, 68);
      c.fillStyle = '#ffffff';
      c.textBaseline = 'middle';
      M.fitText(c, '⚠️ อันตราย! ไฟฟ้าแรงสูง (DANGER)', 36, 50, w - 72, 40, 700);
      c.fillStyle = '#0f172a';
      M.fitText(c, 'ห้องเครื่องผลิตไฟฟ้าสำรอง (GENERATOR ROOM)', 36, 128, w - 72, 30, 700);
      c.fillStyle = '#b91c1c';
      M.fitText(c, 'ห้ามบุคคลภายนอกเข้าก่อนได้รับอนุญาต', 36, 182, w - 72, 30, 700);
    });
  }

  function buildPowerInterior() {
    const g = new THREE.Group();
    const L = [];
    const WH = 2.2;

    floor(g, 9.0, 7.4, '#f1f5f9', '#cbd5e1', 0.5, 0, 0);
    floor(g, 1.5, 2.2, '#fef9c3', '#fde047', 0.5, -5.0, 1.55);

    walkwayStrip(g, -2.2, 1.55, 4.4, 1.1, 0);

    const wallMat = M.mat(0xf8fafc, { roughness: 0.5 });
    const outerWallMat = M.mat(0x1e293b, { roughness: 0.6 });
    const doorMat = M.mat(0xd97706, { roughness: 0.5 });

    function wall(x1, z1, x2, z2, thick = 0.2, h = WH, isOuter = true) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.05) return;
      const wMesh = M.box(
        g, len, h, thick,
        isOuter ? outerWallMat : wallMat,
        (x1 + x2) / 2, h / 2, (z1 + z2) / 2
      );
      wMesh.rotation.y = -Math.atan2(dz, dx);
      addEdges(wMesh, 0x0f172a);
      return wMesh;
    }

    wall(-4.5, -3.7,  4.5, -3.7, 0.22, WH, true);
    wall(-4.5,  3.7,  4.5,  3.7, 0.22, WH, true);
    wall( 4.5, -3.7,  4.5,  3.7, 0.22, WH, true);
    wall(-4.5, -3.7, -4.5, 0.65, 0.22, WH, true);
    wall(-4.5, 2.45, -4.5,  3.7, 0.22, WH, true);

    const doorFrame = M.box(g, 0.85, 0.06, 1.95, M.mat(0x475569), -4.5, 0.03, 1.55);
    addEdges(doorFrame, 0x0f172a);
    wall(-5.05, 0.65, -4.5, 0.65, 0.14, WH, false);
    wall(-5.05, 2.45, -4.5, 2.45, 0.14, WH, false);
    const doorPanel = M.box(g, 0.08, 1.75, 1.45, doorMat, -4.35, 0.88, 1.25);
    doorPanel.rotation.y = 0.48;
    addEdges(doorPanel, 0x78350f);
    L.push({ text: '🚪 ประตู', pos: V(-4.75, 1.65, 1.55), cls: 'int-label sub-tag' });

    const signTex = powerWarningSignTexture();
    const warnSignBoard = M.box(g, 0.08, 0.72, 1.85, M.mat(0xfacc15), -5.08, 1.95, 1.55);
    addEdges(warnSignBoard, 0xb91c1c);
    const warnSignFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.78, 0.66),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    warnSignFace.position.set(-5.13, 1.95, 1.55);
    warnSignFace.rotation.y = -Math.PI / 2;
    g.add(warnSignFace);

    M.cyl(g, 0.04, 0.22, 0.65, M.mat(0xef4444), -5.35, 0.325, 0.75, 14);
    M.cyl(g, 0.04, 0.22, 0.65, M.mat(0xef4444), -5.35, 0.325, 2.35, 14);
    L.push({
      text: '⚠️ ป้ายเตือนหน้าประตู: อันตราย! ไฟฟ้าแรงสูง ห้ามเข้าก่อนได้รับอนุญาต',
      pos: V(-5.15, 2.65, 1.55),
      cls: 'int-label busy'
    });

    const genX = 2.0, genZ = 0.0;
    const genW = 3.4, genD = 5.6;

    const hazardPad = M.box(g, genW + 0.5, 0.04, genD + 0.5, M.mat(0xfacc15), genX, 0.02, genZ);
    addEdges(hazardPad, 0xca8a04);
    const concretePad = M.box(g, genW + 0.2, 0.22, genD + 0.2, M.mat(0x475569), genX, 0.12, genZ);
    addEdges(concretePad, 0x1e293b);
    const steelSkid = M.box(g, genW, 0.26, genD, M.mat(0x1e293b, { metalness: 0.5, roughness: 0.4 }), genX, 0.35, genZ);
    addEdges(steelSkid, 0x0f172a);

    const bodyColor = powerState.running ? 0xf59e0b : 0xeab308;
    const genBody = M.box(g, genW - 0.2, 1.65, genD - 0.2, M.mat(bodyColor, { roughness: 0.4, metalness: 0.2 }), genX, 1.3, genZ);
    addEdges(genBody, 0x78350f);

    [-1.8, -0.6, 0.6, 1.8].forEach((oz) => {
      const panelL = M.box(g, 0.06, 1.15, 0.92, M.mat(0x334155), genX - (genW - 0.16) / 2, 1.32, oz);
      const panelR = M.box(g, 0.06, 1.15, 0.92, M.mat(0x334155), genX + (genW - 0.16) / 2, 1.32, oz);
      addEdges(panelL, 0x0f172a);
      addEdges(panelR, 0x0f172a);
    });

    const rad = M.box(g, genW - 0.6, 1.25, 0.12, M.mat(0x0f172a), genX, 1.32, -genD / 2 + 0.12);
    addEdges(rad, 0x475569);
    [-0.65, 0.65].forEach((ox) => {
      const muffler = M.cyl(g, 0.26, 0.26, 1.6, M.mat(0x64748b, { metalness: 0.6 }), genX + ox, 2.32, -0.8, 16);
      muffler.rotation.x = Math.PI / 2;
      addEdges(muffler, 0x1e293b);
      const stack = M.cyl(g, 0.12, 0.12, 0.75, M.mat(0x475569, { metalness: 0.7 }), genX + ox, 2.65, -1.35, 14);
      addEdges(stack, 0x1e293b);
    });

    const statusColor = powerState.running ? 0xef4444 : 0x22c55e;
    const ctrlWindow = M.box(g, 0.08, 0.55, 0.75, M.mat(0x0f172a), genX - (genW - 0.14) / 2, 1.45, 1.8);
    addEdges(ctrlWindow, 0x38bdf8);
    M.cyl(g, 0.12, 0.12, 0.22, M.mat(statusColor, { emissive: statusColor, emissiveIntensity: 0.7 }), genX, 2.24, 1.9, 14);

    const atsSpec = {
      code: 'GEN-KSS-01',
      name: 'ชุดควบคุมเครื่องผลิตไฟฟ้าสำรองอัตโนมัติ (ATS & Diesel Generator 500 kVA)',
      role: 'ช่างไฟฟ้าและวิศวกรรมโรงพยาบาล ควบคุมการจ่ายกระแสไฟฟ้าสำรองฉุกเฉินทั้งโรงพยาบาล',
      cpu: 'DeepSea DSE8610 MKII Auto Mains (Utility) Failure Controller',
      ram: 'Cummins / Perkins 500 kVA (400 kW) 3-Phase 380/220V 50Hz',
      storage: 'ถังน้ำมันดีเซลสำรอง 1,000 ลิตร (รองรับการจ่ายไฟต่อเนื่อง 24 ชม.)',
      monitor: 'หน้าจอ LCD Digital Telemetry แสดงแรงดันไฟ (V), กระแส (A), ความถี่ (Hz)',
      os: 'ระบบสลับแหล่งจ่ายไฟอัตโนมัติ (Automatic Transfer Switch - ATS ภายใน 10 วินาที)',
      ip: '192.168.90.10 (SCADA Power Monitoring)',
      status: powerState.running ? '🔴 กำลังเดินเครื่องจ่ายไฟสำรองฉุกเฉิน (Running)' : '🟢 พร้อมใช้งานอัตโนมัติ (Standby Mode)',
      software: 'ระบบตรวจจับไฟตก/ไฟดับอัตโนมัติ • ระบบจ่ายไฟสำรองห้องฉุกเฉิน (ER), ห้องผ่าตัด, ICU และหอผู้ป่วยใน (IPD)',
      peripherals: 'แบตเตอรี่สตาร์ท 24V DC • เครื่องชาร์จอัตโนมัติ • ถังดับเพลิงเคมีแห้ง CO2 ประจำห้องเครื่อง',
      user: 'งานช่างและซ่อมบำรุง โรงพยาบาลโคกศรีสุพรรณ'
    };

    const atsCabinet = M.box(g, 0.65, 1.65, 1.25, M.mat(0xcbd5e1), -1.8, 0.825, -2.85);
    addEdges(atsCabinet, 0x334155);
    atsCabinet.userData.pcInfo = atsSpec;
    genBody.userData.pcInfo = atsSpec;

    L.push({
      text: `⚡ เครื่องผลิตไฟฟ้าสำรอง (${powerState.running ? '🔴 กำลังจ่ายไฟสำรอง' : '🟢 พร้อมใช้งาน Standby'})`,
      pos: V(genX, 2.75, genZ),
      cls: `int-label ${powerState.running ? 'busy' : 'free'} toggleable`,
      toggleId: 'power-gen'
    });
    L.push({
      text: '🖥️ ตู้ควบคุม ATS / ดูสเปกเครื่องผลิตไฟฟ้าสำรอง',
      pos: V(-1.8, 1.95, -2.85),
      cls: 'int-label pc-tag',
      pcInfo: atsSpec
    });

    const items = [
      [
        '⚡',
        'เครื่องผลิตไฟฟ้าสำรอง (500 kVA)',
        powerState.running ? '🔴 กำลังจ่ายไฟ' : '🟢 พร้อมใช้งาน',
        'power-gen',
        powerState.running ? 'busy' : 'free'
      ],
      [
        '🖥️',
        'GEN-KSS-01: รายละเอียดสเปกเครื่องผลิตไฟฟ้าสำรอง & ตู้ ATS',
        'ดูสเปก',
        null,
        'free',
        atsSpec
      ],
      ['⚠️', 'ป้ายเตือนหน้าประตู (อันตรายไฟฟ้าแรงสูง ห้ามเข้า)', 'ติดตั้งแล้ว'],
      ['🚪', 'ประตูทางเข้าโรงไฟฟ้า (ฝั่งซ้ายล่าง)', '1 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 12,
      title: '⚡ ผังภายในโรงไฟฟ้า (ห้องเครื่องผลิตไฟฟ้าสำรอง)',
      sub: 'คลิกป้าย "เครื่องผลิตไฟฟ้าสำรอง" เพื่อสลับสถานะ • คลิกป้าย "🖥️ ตู้ควบคุม ATS" หรือตัวเครื่องเพื่อดูสเปก',
      items,
      cam: { pos: V(-7.5, 9.5, 8.5), target: V(0, 0.6, 0.2) }
    };
  }

  function togglePowerStatus(id) {
    if (id === 'power-gen') {
      powerState.running = !powerState.running;
      return true;
    }
    return false;
  }

  K.Interiors.register('power', buildPowerInterior, togglePowerStatus);
})();
