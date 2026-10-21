/* =========================================================================
 * ตึก พขร. (สำนักงานกลุ่มงานยานพาหนะและโรงจอดรถพยาบาล)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, WALL_H, T, floor, screenTexture, makePerson, addEdges } = C;

  const driversState = {
    amb1Ready: true,
    amb2Ready: true,
    vanReady: true,
    dutyOfficer: 'นายสมชาย คำมี (พขร.เวร 1669)'
  };

  function drivers(b) {
    const g = new THREE.Group();
    const L = [];

    // ผังภายในตึก พขร.: อาคารรวมกว้าง 32.0 ม. ลึก 16.0 ม.
    // ฝั่งซ้าย (-16 ถึง -4): โซนสำนักงาน พขร. 2 ห้อง (ห้องศูนย์สั่งการจัดคิวรถ & ห้องหัวหน้า พขร.)
    // ฝั่งขวา (-4 ถึง 16): โซนโรงจอดรถพยาบาลฉุกเฉิน EMS และยานพาหนะโรงพยาบาล
    const W = 32.0, D = 16.0;
    const offW = 12.0, garW = 20.0;
    const offX = -W / 2 + offW / 2; // -10.0
    const garX = -W / 2 + offW + garW / 2; // 6.0

    // 1. พื้นโซนสำนักงาน (กระเบื้องแกรนิตโต้สีเทาอ่อน สะอาด เรียบร้อย)
    floor(g, offW, D, '#f1f5f9', '#cbd5e1', 0.6, offX, 0);

    // 2. พื้นโซนโรงจอดรถ (ผิวแอสฟัลต์สีเข้มพร้อมเส้นจอดสีขาว)
    const garFloorMat = M.mat(0x334155, { roughness: 0.92 });
    M.box(g, garW, 0.08, D, garFloorMat, garX, 0.04, 0);

    // ผนังรอบนอกโซนสำนักงาน
    const wallM = M.mat(0xf8fafc, { roughness: 0.5 });
    const lowM = M.mat(0xe2e8f0, { roughness: 0.6 });
    const glassM = M.glass();
    const wallH = 3.2;

    // ผนังหลัง (North), ผนังซ้าย (West), ผนังหน้า (South) ของสำนักงาน
    M.box(g, offW, wallH, T, wallM, offX, wallH / 2, -D / 2 + T / 2);
    M.box(g, T, wallH, D, wallM, offX - offW / 2 + T / 2, wallH / 2, 0);
    M.box(g, offW, wallH, T, wallM, offX, wallH / 2, D / 2 - T / 2);

    // ผนังกั้นระหว่างสำนักงานกับโรงจอดรถ (พร้อมประตูกระจกเปิดออกสู่โรงรถ)
    const midX = offX + offW / 2; // -4.0
    M.box(g, T, wallH, 6.0, wallM, midX, wallH / 2, -5.0);
    M.box(g, T, wallH, 6.0, wallM, midX, wallH / 2, 5.0);
    // ประตูเชื่อมสำนักงาน-โรงรถ
    M.box(g, 0.08, 2.2, 1.4, M.mat(0x0284c7, { metalness: 0.8, roughness: 0.2 }), midX, 1.1, 0);

    // ผนังกั้นระหว่างห้องจัดคิวรถ (หน้า) กับห้องหัวหน้า พขร. (หลัง)
    M.box(g, offW, wallH, T, wallM, offX, wallH / 2, 0);
    // ประตูระหว่าง 2 ห้อง
    M.box(g, 1.1, 2.1, 0.05, M.mat(0x94a3b8), offX + 2.5, 1.05, 0);

    // ==========================================
    // ห้อง 1: ศูนย์สั่งการและจัดคิวรถพยาบาล 1669 (ห้องหน้า: z > 0)
    // ==========================================
    L.push({ text: '📻 ศูนย์สั่งการและจัดคิวรถพยาบาล 1669', pos: V(offX, 2.7, 4.0), cls: 'int-label room-title' });

    // โต๊ะปฏิบัติการจัดคิวรถพยาบาล พร้อมคอมพิวเตอร์
    const deskWood = M.mat(0x38bdf8, { roughness: 0.4 });
    const deskBase = M.mat(0x1e293b);
    M.box(g, 3.8, 0.75, 1.2, deskWood, offX - 1.5, 0.375, 3.5);
    M.box(g, 0.1, 0.72, 1.2, deskBase, offX - 3.3, 0.36, 3.5);
    M.box(g, 0.1, 0.72, 1.2, deskBase, offX + 0.3, 0.36, 3.5);

    // จอคอมพิวเตอร์ระบบติดตาม GPS รถพยาบาล 2 จอ
    const pcSpecDispatch = {
      code: 'PC-AMB-DISPATCH-01',
      name: 'เครื่องคอมพิวเตอร์ศูนย์จัดคิวและติดตามรถพยาบาล',
      role: 'ระบบรับแจ้งเหตุฉุกเฉิน 1669, จัดคิวรถพยาบาล และ GPS Fleet Tracking',
      user: 'กลุ่มงานยานพาหนะและควบคุมการส่งต่อ (พขร.)',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12500 (6C/12T)',
      ram: '16 GB DDR4-3200',
      storage: 'NVMe SSD 512 GB + HDD 2 TB บันทึกภาพกล้องหน้ารถ',
      monitor: 'Dual 24" IPS FHD (จอแสดงผังคิวรถ + จอแผนที่ GPS 1669)',
      ip: '192.168.10.45 (VLAN 10 - Dispatch Network)',
      software: 'ระบบ EMS 1669 Dispatcher, GPS Real-time Tracking, HOSxP Refer System',
      peripherals: 'วิทยุสื่อสาร Base Station 1669, เครื่องสำรองไฟ UPS 1000VA, เครื่องพิมพ์ใบสั่งรถ',
      status: '🟢 ออนไลน์พร้อมปฏิบัติการ'
    };

    // จอมอนิเตอร์คู่
    [-2.2, -0.8].forEach((mx, mi) => {
      M.box(g, 0.65, 0.42, 0.04, M.mat(0x0f172a), offX + mx, 0.98, 3.7);
      const scr = screenTexture((c, sw, sh) => {
        c.fillStyle = '#0f172a'; c.fillRect(0, 0, sw, sh);
        c.fillStyle = mi === 0 ? '#0284c7' : '#15803d';
        c.fillRect(0, 0, sw, 32);
        c.fillStyle = '#ffffff'; c.font = 'bold 18px sans-serif';
        c.fillText(mi === 0 ? 'EMS 1669 DISPATCH BOARD' : 'GPS VEHICLE FLEET TRACKER', 10, 22);
        c.fillStyle = '#22c55e'; c.font = '16px monospace';
        c.fillText('AMB-01: READY (STATION)', 10, 60);
        c.fillText('AMB-02: READY (STATION)', 10, 85);
        c.fillText('VAN-01: ON STANDBY', 10, 110);
      });
      const scrM = new THREE.Mesh(new THREE.PlaneGeometry(0.61, 0.38), new THREE.MeshBasicMaterial({ map: scr }));
      scrM.position.set(offX + mx, 0.98, 3.67);
      g.add(scrM);
      scrM.userData.pcInfo = pcSpecDispatch;
    });

    L.push({
      text: '🖥️ โต๊ะจัดคิวรถพยาบาล 1669',
      pos: V(offX - 1.5, 1.4, 3.5),
      cls: 'int-label pc-tag',
      pcInfo: pcSpecDispatch
    });

    // วิทยุสื่อสารแม่ข่าย Base Station
    M.box(g, 0.45, 0.22, 0.3, M.mat(0x1e293b), offX + 0.0, 0.86, 3.4);
    M.cyl(g, 0.015, 0.015, 0.65, M.mat(0x94a3b8), offX + 0.15, 1.25, 3.4, 6);

    // เก้าอี้ปฏิบัติงาน & โซฟาพักคอย พขร.
    M.box(g, 0.55, 0.5, 0.55, M.mat(0x1e3a8a), offX - 1.5, 0.45, 2.4); // เก้าอี้หน้าจอ
    // ชุดโซฟานั่งพักผ่อนสำหรับพนักงานขับรถ
    M.box(g, 2.6, 0.45, 0.9, M.mat(0x334155), offX - 1.8, 0.25, 6.2); // โซฟายาว
    M.box(g, 2.6, 0.5, 0.2, M.mat(0x1e293b), offX - 1.8, 0.65, 6.65);
    M.box(g, 1.2, 0.35, 0.6, M.mat(0xe2e8f0), offX - 1.8, 0.18, 5.0); // โต๊ะกลาง
    // ตู้เก็บกุญแจรถราชการ (Key Locker Board)
    M.box(g, 1.4, 1.6, 0.12, M.mat(0x475569), offX - 5.5, 1.6, 4.0);
    L.push({ text: '🔑 ตู้กุญแจรถราชการ', pos: V(offX - 5.5, 1.8, 4.0), cls: 'int-label sub-tag' });

    // ==========================================
    // ห้อง 2: ห้องทำงานหัวหน้ากลุ่มงานยานพาหนะ (ห้องหลัง: z < 0)
    // ==========================================
    L.push({ text: '👔 ห้องทำงานหัวหน้ากลุ่มงานยานพาหนะ', pos: V(offX, 2.7, -4.0), cls: 'int-label room-title' });

    // โต๊ะทำงานและเก้าอี้ประจำตำแหน่งหัวหน้ากลุ่มงานยานพาหนะ (ไม่มีเครื่องคอมพิวเตอร์)
    M.box(g, 2.2, 0.75, 1.1, M.mat(0x92400e), offX, 0.375, -4.2);
    L.push({
      text: '📋 โต๊ะทำงานหัวหน้ากลุ่มงานยานพาหนะ',
      pos: V(offX, 1.2, -4.2),
      cls: 'int-label sub-tag'
    });
    // เก้าอี้ผู้บริหาร
    M.box(g, 0.6, 0.6, 0.6, M.mat(0x1e1b4b), offX, 0.45, -5.2);
    // ตู้เอกสารและคู่มือบำรุงรักษารถ
    M.box(g, 3.2, 2.2, 0.45, M.mat(0x78350f), offX - 3.8, 1.1, -6.8);

    // ==========================================
    // โซน 3: โรงจอดรถพยาบาลและยานพาหนะโรงพยาบาล (Hospital Vehicle Fleet Garage)
    // ==========================================
    L.push({ text: '🚑 โรงจอดรถพยาบาลและยานพาหนะโรงพยาบาล', pos: V(garX, 3.4, 0), cls: 'int-label room-title' });

    // ผนังหลังและเสาโครงสร้างโรงจอดรถ
    M.box(g, garW, wallH, T, wallM, garX, wallH / 2, -D / 2 + T / 2);
    M.box(g, T, wallH, D, wallM, garX + garW / 2 - T / 2, wallH / 2, 0);

    // หลังคาโครงเหล็กโปร่งแสง
    const garRoofM = M.mat(0x94a3b8, { metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0.28 });
    M.box(g, garW + 0.4, 0.15, D + 0.4, garRoofM, garX, wallH + 0.1, 0);

    // เสาเหล็กรับโครงหลังคาด้านหน้า
    const postM = M.mat(0x475569, { metalness: 0.6 });
    const numPosts = 5;
    for (let pi = 0; pi < numPosts; pi++) {
      const px = garX - garW / 2 + (pi * garW) / (numPosts - 1);
      M.cyl(g, 0.12, 0.12, wallH, postM, px, wallH / 2, D / 2 - 0.2, 8);
    }

    // ช่องจอดรถ 4 ช่อง พร้อมตีเส้นสีขาวและยางกั้นล้อ
    const numBays = 4;
    const bayW = garW / numBays; // 5.0m per bay
    const bayNames = [
      'AMB-01 (รถพยาบาลฉุกเฉิน 1)',
      'AMB-02 (รถพยาบาลฉุกเฉิน 2)',
      'VAN-01 (รถตู้ส่งต่อผู้ป่วย)',
      'TRUCK-01 (รถกระบะบริการ)'
    ];

    for (let bi = 0; bi < numBays; bi++) {
      const bx = garX - garW / 2 + (bi + 0.5) * bayW;
      // เส้นข้างช่องจอด
      M.box(g, 0.1, 0.015, D * 0.75, M.mat(0xffffff), garX - garW / 2 + bi * bayW, 0.09, 0);
      // ยางกั้นล้อ
      M.box(g, 2.2, 0.12, 0.2, M.mat(0xf1f5f9), bx, 0.14, -D * 0.3);

      // ป้ายระบุช่องจอด
      L.push({ text: `🅿️ ช่อง ${bi + 1}: ${bayNames[bi]}`, pos: V(bx, 1.8, -D * 0.38), cls: 'int-label sub-tag' });
    }

    // รถยนต์ประจำการในช่องจอด:
    // Bay 1: รถพยาบาลฉุกเฉิน คันที่ 1
    const amb1 = M.makeCar(0xffffff, 'van');
    amb1.position.set(garX - garW / 2 + bayW * 0.5, 0.08, 0.5);
    amb1.rotation.y = Math.PI;
    M.box(amb1, 1.2, 0.12, 0.35, M.mat(0xdc2626, { emissive: 0xef4444, emissiveIntensity: 0.7 }), 0, 2.15, 0.6);
    g.add(amb1);
    L.push({
      text: '🚑 รถพยาบาล EMS-01 (🟢 พร้อมใช้งาน)',
      pos: V(garX - garW / 2 + bayW * 0.5, 2.5, 0.5),
      cls: 'int-label free toggleable',
      toggleId: 'amb1'
    });

    // Bay 2: รถพยาบาลฉุกเฉิน คันที่ 2
    const amb2 = M.makeCar(0xffffff, 'van');
    amb2.position.set(garX - garW / 2 + bayW * 1.5, 0.08, 0.5);
    amb2.rotation.y = Math.PI;
    M.box(amb2, 1.2, 0.12, 0.35, M.mat(0xdc2626, { emissive: 0xef4444, emissiveIntensity: 0.7 }), 0, 2.15, 0.6);
    g.add(amb2);
    L.push({
      text: '🚑 รถพยาบาล EMS-02 (🟢 พร้อมใช้งาน)',
      pos: V(garX - garW / 2 + bayW * 1.5, 2.5, 0.5),
      cls: 'int-label free toggleable',
      toggleId: 'amb2'
    });

    // Bay 3: รถตู้ส่งต่อผู้ป่วย Refer Van
    const van1 = M.makeCar(0xcbd5e1, 'van');
    van1.position.set(garX - garW / 2 + bayW * 2.5, 0.08, 0.5);
    van1.rotation.y = Math.PI;
    g.add(van1);
    L.push({
      text: '🚐 รถตู้ส่งต่อผู้ป่วย (🟢 พร้อมใช้งาน)',
      pos: V(garX - garW / 2 + bayW * 2.5, 2.4, 0.5),
      cls: 'int-label free toggleable',
      toggleId: 'van'
    });

    // Bay 4: รถกระบะบริการทั่วไป
    const pick1 = M.makeCar(0xffffff, 'pickup');
    pick1.position.set(garX - garW / 2 + bayW * 3.5, 0.08, 0.5);
    pick1.rotation.y = Math.PI;
    g.add(pick1);
    L.push({
      text: '🛻 รถกระบะบริการทั่วไป (🟢 ว่าง)',
      pos: V(garX - garW / 2 + bayW * 3.5, 2.2, 0.5),
      cls: 'int-label free'
    });

    // อุปกรณ์ประจำโรงจอด: เปลสนามฉุกเฉินสำรอง & ถังออกซิเจนประจำรถ
    const rackM = M.mat(0x64748b, { metalness: 0.6 });
    M.box(g, 0.8, 1.8, 3.2, rackM, garX + garW / 2 - 0.6, 0.9, -5.0);
    // ถังออกซิเจนการแพทย์สีเขียว 4 ถัง
    for (let oi = 0; oi < 4; oi++) {
      M.cyl(g, 0.12, 0.12, 1.2, M.mat(0x16a34a, { metalness: 0.5 }), garX + garW / 2 - 0.6, 0.65, -6.0 + oi * 0.45, 12);
    }
    L.push({ text: '🫁 คลังถังออกซิเจนสำรองประจำรถ', pos: V(garX + garW / 2 - 0.6, 1.5, -5.0), cls: 'int-label sub-tag' });

    const size = Math.max(W, D);
    return {
      group: g,
      labels: L,
      size,
      title: '🚐 ภายใน' + b.name,
      sub: `กลุ่มงานยานพาหนะและควบคุมการส่งต่อ • ขนาด ${W} × ${D} เมตร`,
      items: [
        ['📻', 'ศูนย์สั่งการจัดคิวรถ 1669', 'เปิดทำการ 24 ชม. พร้อมวิทยุแม่ข่าย'],
        ['🚑', 'รถพยาบาลฉุกเฉินประจำการ', '2 คัน (พร้อมอุปกรณ์กู้ชีพขั้นสูง ALS)'],
        ['🚐', 'รถตู้ส่งต่อผู้ป่วย', '1 คัน (ระบบปรับอากาศ + เปลสนาม)'],
        ['🛻', 'รถกระบะบริการทั่วไป', '1 คัน'],
        ['👨‍✈️', 'พนักงานขับรถ (พขร.)', 'ประจำการผลัดละ 4 นาย'],
        ['🖥️', 'คอมพิวเตอร์ประจำอาคาร', '2 เครื่อง (คลิกดูสเปก PC ได้)']
      ],
      cam: {
        pos: V(size * 0.45 + 5, size * 0.55 + 8, size * 0.65 + 10),
        target: V(0, 1.2, 0)
      }
    };
  }

  function toggleStatus(id) {
    if (id === 'amb1') {
      driversState.amb1Ready = !driversState.amb1Ready;
      return {
        occupied: !driversState.amb1Ready,
        text: driversState.amb1Ready ? '🚑 รถพยาบาล EMS-01 (🟢 พร้อมใช้งาน)' : '🚑 รถพยาบาล EMS-01 (🔴 ออกปฏิบัติการ)',
        cls: driversState.amb1Ready ? 'int-label free toggleable' : 'int-label busy toggleable'
      };
    }
    if (id === 'amb2') {
      driversState.amb2Ready = !driversState.amb2Ready;
      return {
        occupied: !driversState.amb2Ready,
        text: driversState.amb2Ready ? '🚑 รถพยาบาล EMS-02 (🟢 พร้อมใช้งาน)' : '🚑 รถพยาบาล EMS-02 (🔴 ออกปฏิบัติการ)',
        cls: driversState.amb2Ready ? 'int-label free toggleable' : 'int-label busy toggleable'
      };
    }
    if (id === 'van') {
      driversState.vanReady = !driversState.vanReady;
      return {
        occupied: !driversState.vanReady,
        text: driversState.vanReady ? '🚐 รถตู้ส่งต่อผู้ป่วย (🟢 พร้อมใช้งาน)' : '🚐 รถตู้ส่งต่อผู้ป่วย (🔴 อยู่ระหว่างส่งต่อ)',
        cls: driversState.vanReady ? 'int-label free toggleable' : 'int-label busy toggleable'
      };
    }
    return null;
  }

  K.Interiors = K.Interiors || {};
  K.Interiors.register('drivers', drivers, toggleStatus);
})();
