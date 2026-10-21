/* =========================================================================
 * หอประชุม (Auditorium / Conference Hall)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  const hallState = {
    occupied: true
  };

  function buildHallInterior() {
    const g = new THREE.Group();
    const L = [];
    const WH = 2.0;

    floor(g, 19.0, 17.0, '#f8fafc', '#cbd5e1', 1.0, 0, 1.0);
    floor(g, 12.5,  2.0, '#f1f5f9', '#cbd5e1', 0.5, -3.25, -8.5);
    floor(g,  6.5,  2.0, '#eff6ff', '#93c5fd', 0.5,  6.25, -8.5);
    floor(g, 10.4,  7.0, '#fefce8', '#fde047', 0.5, -0.2,   3.0);

    const wallMat = M.mat(0xf8fafc, { roughness: 0.5 });
    const outerWallMat = M.mat(0x1e293b, { roughness: 0.6 });
    const doorMat = M.mat(0xd97706, { roughness: 0.5 });

    function wall(x1, z1, x2, z2, thick = 0.2, h = WH, isOuter = false) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.05) return;
      const wMesh = M.box(
        g, len, h, thick,
        isOuter ? outerWallMat : wallMat,
        (x1 + x2) / 2, h / 2, (z1 + z2) / 2
      );
      wMesh.rotation.y = -Math.atan2(dz, dx);
      addEdges(wMesh, isOuter ? 0x0f172a : 0x475569);
      return wMesh;
    }

    function doorBox(x, z, rotY = 0, w = 1.4, protrudeX = 0, protrudeZ = 0) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;
      const base = M.box(dg, w, 0.05, 0.75, M.mat(0xe2e8f0), 0, 0.025, 0);
      addEdges(base, 0x334155);
      const panel = M.box(dg, w * 0.82, 1.55, 0.07, doorMat, -w * 0.18, 0.78, 0.25);
      panel.rotation.y = 0.52;
      addEdges(panel, 0x78350f);
      g.add(dg);
      L.push({
        text: '🚪 ประตู',
        pos: V(x + protrudeX, 1.68, z + protrudeZ),
        cls: 'int-label sub-tag'
      });
    }

    wall(-9.5, -9.5, 9.5, -9.5, 0.22, WH, true);
    wall(-9.5,  9.5, 9.5,  9.5, 0.22, WH, true);

    wall(-9.5, -7.5, 6.6, -7.5, 0.18, WH, false);
    wall( 8.2, -7.5, 9.5, -7.5, 0.18, WH, false);
    doorBox(7.4, -7.5, 0, 1.35, 0, 0.2);

    wall(3.0, -9.5, 3.0, -7.5, 0.16, WH, false);

    wall(-9.5, -9.5, -9.5, -9.1, 0.22, WH, true);
    wall(-9.5, -7.9, -9.5, -7.5, 0.22, WH, true);
    doorBox(-9.5, -8.5, Math.PI / 2, 1.15, -0.35, 0);

    wall(-9.5, -7.5, -9.5, -0.2, 0.22, WH, true);
    wall(-9.5,  2.2, -9.5,  4.8, 0.22, WH, true);
    wall(-9.5,  7.2, -9.5,  9.5, 0.22, WH, true);
    doorBox(-9.5, 1.0, Math.PI / 2, 2.1, -0.45, 0);
    doorBox(-9.5, 6.0, Math.PI / 2, 2.1, -0.45, 0);

    wall(9.5, -9.5, 9.5, -0.2, 0.22, WH, true);
    wall(9.5,  2.2, 9.5,  4.8, 0.22, WH, true);
    wall(9.5,  7.2, 9.5,  9.5, 0.22, WH, true);
    doorBox(9.5, 1.0, -Math.PI / 2, 2.1, 0.45, 0);
    doorBox(9.5, 6.0, -Math.PI / 2, 2.1, 0.45, 0);

    const avSpec = {
      code: 'PC-HALL-01',
      name: 'ชุดคอมพิวเตอร์และมิกเซอร์ควบคุมไฟ-เครื่องเสียงหอประชุม (AV & Lighting Control)',
      role: 'เจ้าหน้าที่โสตทัศนศึกษา ควบคุมระบบเสียง ไมโครโฟน จอโปรเจคเตอร์ และระบบไฟเวที',
      cpu: 'Intel Core i7-13700 (16 Cores) + Yamaha Digital Mixer TF1',
      ram: '16 GB DDR4 3200MHz',
      storage: 'NVMe M.2 SSD 1 TB',
      monitor: 'จอคู่ Dual Dell 24" IPS Full HD + จอโปรเจคเตอร์เวที',
      os: 'Windows 11 Pro 64-bit • ระบบควบคุมโสตทัศนูปกรณ์ห้องประชุม',
      ip: '192.168.50.10',
      status: '🟢 ออนไลน์ (พร้อมใช้งานระบบเสียงและไฟเวที)',
      software: 'ระบบจัดการเสียงดิจิทัล • ระบบควบคุมไฟเวที DMX • ระบบประชุมทางไกล (Zoom / Webex Conference)',
      peripherals: 'เครื่องขยายเสียงเพาเวอร์แอมป์ • ชุดไมโครโฟนไร้สาย 4 ตัว • กล้อง PTZ บันทึกภาพการประชุม',
      user: 'งานโสตทัศนศึกษาและประชาสัมพันธ์ โรงพยาบาลโคกศรีสุพรรณ'
    };

    const avDesk = M.box(g, 3.2, 0.78, 0.72, M.mat(0x334155), 5.4, 0.39, -8.85);
    addEdges(avDesk, 0x0f172a);
    const mixer = M.box(g, 1.1, 0.14, 0.48, M.mat(0x0f172a), 4.7, 0.85, -8.85);
    addEdges(mixer, 0x38bdf8);
    const avMon = M.box(g, 0.65, 0.38, 0.05, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 6.1, 1.02, -9.05);
    addEdges(avMon, 0x1e293b);
    avDesk.userData.pcInfo = avSpec;
    mixer.userData.pcInfo = avSpec;
    avMon.userData.pcInfo = avSpec;

    const avTech = makePerson({ role: 'nurse', shirtColor: 0x2563eb, pose: 'sit', rotY: Math.PI });
    avTech.position.set(5.4, 0, -8.25);
    g.add(avTech);

    L.push({
      text: '🎛️ ห้องควบคุมไฟและเครื่องเสียง (คลิกดูสเปก)',
      pos: V(6.2, 2.05, -8.55),
      cls: 'int-label pc-tag',
      pcInfo: avSpec
    });

    const stageW = 10.0, stageD = 4.3, stageH = 0.52;
    const stageX = -0.2, stageZ = -5.35;
    const stagePlatform = M.box(g, stageW, stageH, stageD, M.mat(0xb45309, { roughness: 0.55 }), stageX, stageH / 2, stageZ);
    addEdges(stagePlatform, 0x451a03);
    const stageCarpet = M.box(g, stageW - 0.5, 0.04, stageD - 0.4, M.mat(0xdc2626, { roughness: 0.7 }), stageX, stageH + 0.02, stageZ);
    addEdges(stageCarpet, 0x991b1b);
    M.box(g, 1.1, 0.26, 0.6, M.mat(0x92400e), stageX - stageW / 2 - 0.55, 0.13, -4.2);
    M.box(g, 1.1, 0.26, 0.6, M.mat(0x92400e), stageX + stageW / 2 + 0.55, 0.13, -4.2);

    const podium = M.box(g, 0.85, 1.15, 0.6, M.mat(0x78350f), stageX + 2.6, stageH + 0.575, -4.3);
    addEdges(podium, 0x451a03);
    const backdrop = M.box(g, 6.8, 1.55, 0.08, M.mat(0x0284c7), stageX, stageH + 0.95, -7.32);
    addEdges(backdrop, 0x1e3a8a);
    [-4.3, 3.9].forEach((sx) => {
      const spk = M.box(g, 0.58, 1.35, 0.52, M.mat(0x0f172a), sx, stageH + 0.675, -4.0);
      addEdges(spk, 0x475569);
    });

    if (hallState.occupied) {
      const speaker = makePerson({ role: 'doctor', pose: 'stand', rotY: 0 });
      speaker.position.set(stageX + 2.6, stageH, -4.85);
      g.add(speaker);
    }

    L.push({
      text: `🎤 เวที (${hallState.occupied ? '🔴 กำลังจัดประชุม/อบรม' : '🟢 ว่าง'})`,
      pos: V(stageX, 2.35, stageZ),
      cls: `int-label ${hallState.occupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'hall-stage'
    });

    const rows = 5;
    const cols = 10;
    const seatMat = M.mat(0x2563eb, { roughness: 0.5 });
    const legMat = M.mat(0x334155);

    for (let r = 0; r < rows; r++) {
      const rz = 0.2 + r * 1.35;
      for (let c = 0; c < cols; c++) {
        const aisleGap = c >= 5 ? 0.4 : 0;
        const cx = -4.6 + c * 0.94 + aisleGap;

        const cg = new THREE.Group();
        cg.position.set(cx, 0, rz);
        const seat = M.box(cg, 0.52, 0.08, 0.5, seatMat, 0, 0.44, 0);
        addEdges(seat, 0x1e3a8a);
        const back = M.box(cg, 0.52, 0.48, 0.08, seatMat, 0, 0.7, 0.22);
        addEdges(back, 0x1e3a8a);
        M.box(cg, 0.06, 0.44, 0.44, legMat, -0.22, 0.22, 0);
        M.box(cg, 0.06, 0.44, 0.44, legMat,  0.22, 0.22, 0);

        if (hallState.occupied && ((r + c) % 3 === 0 || (r === 0 && c % 2 === 0))) {
          const attendee = makePerson({
            role: (r + c) % 2 === 0 ? 'nurse' : 'relative',
            shirtColor: (r + c) % 4 === 0 ? 0x0ea5e9 : (r + c) % 4 === 1 ? 0x10b981 : 0xf59e0b,
            pose: 'sit',
            rotY: Math.PI
          });
          attendee.position.set(0, 0, 0);
          cg.add(attendee);
        }
        g.add(cg);
      }
    }

    L.push({
      text: '🪑 เก้าอี้ แถวละ 10 ตัว • จำนวน 5 แถว (รวม 50 ตัว)',
      pos: V(-0.2, 1.95, 2.9),
      cls: 'int-label room-title'
    });

    const items = [
      [
        '🎤',
        'เวทีหอประชุม (Stage)',
        hallState.occupied ? '🔴 กำลังใช้งาน' : '🟢 ว่าง',
        'hall-stage',
        hallState.occupied ? 'busy' : 'free'
      ],
      [
        '🖥️',
        'PC-HALL-01: ห้องควบคุมไฟและเครื่องเสียง',
        'ดูสเปก',
        null,
        'free',
        avSpec
      ],
      ['🪑', 'เก้าอี้ผู้เข้าร่วมประชุม (แถวละ 10 ตัว × 5 แถว)', '50 ตัว'],
      ['🚪', 'ประตูทางเข้า-ออกหอประชุม (ซ้าย 3 • ขวา 2 • ห้องควบคุม 1)', '6 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 22,
      title: '🎤 ผังภายในหอประชุม: เวที • เก้าอี้แถวละ 10 ตัว จำนวน 5 แถว • ห้องควบคุมไฟและเครื่องเสียง',
      sub: 'คลิกป้าย "เวที" เพื่อสลับสถานะว่าง/กำลังจัดประชุม • คลิกป้าย "🎛️ ห้องควบคุมไฟและเครื่องเสียง" เพื่อดูสเปกอุปกรณ์',
      items,
      cam: { pos: V(0, 22, 19.5), target: V(0, 0, 0.2) }
    };
  }

  function toggleHallStatus(id) {
    if (id === 'hall-stage') {
      hallState.occupied = !hallState.occupied;
      return true;
    }
    return false;
  }

  K.Interiors.register('hall', buildHallInterior, toggleHallStatus);
})();
