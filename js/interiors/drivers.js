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

    // =========================================================================
    // 🔀 ตู้แร็คแขวนผนัง Switch Hub KSP-SW-DRIVERS (ตำแหน่งมาร์คสีแดง ผนังฝั่งตะวันตก)
    // =========================================================================
    function makeDriversSwitchRack(x, y, z) {
      const swg = new THREE.Group();
      swg.position.set(x, y, z);
      // West wall mounting: back faces -X (towards wall), front door faces +X (into Room 1)
      swg.rotation.y = -Math.PI / 2;

      function maintBox(w, h, d, color, metalness = 0.4, roughness = 0.5) {
        return new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({ color, metalness, roughness })
        );
      }

      // 1. Metal Wall Mounting Bracket / Backplate (touches wall at -X)
      const bracket = maintBox(0.74, 0.58, 0.04, 0x0f172a);
      bracket.position.set(0, 0, 0.20);
      swg.add(bracket);

      // 2. 6U Wallmount Cabinet Frame (Black / Dark Slate with cyan edge highlight)
      const cab = maintBox(0.72, 0.54, 0.42, 0x1e293b);
      cab.position.set(0, 0, 0);
      addEdges(cab, 0x0284c7);
      cab.userData.serverId = 'ksp-sw-drivers';
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
      doorGlass.userData.serverId = 'ksp-sw-drivers';
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
      for (let px = -0.25; px <= 0.25; px += 0.025) {
        const jack = maintBox(0.014, 0.018, 0.01, 0x475569);
        jack.position.set(px, 0.13, -0.192);
        swg.add(jack);
      }

      // Unit B: 1U Managed Switch Hub (KSP-SW-DRIVERS, y = 0.0)
      const swUnit = maintBox(0.62, 0.08, 0.34, 0x0284c7);
      swUnit.position.set(0, 0.0, -0.04);
      addEdges(swUnit, 0x38bdf8);
      swUnit.userData.serverId = 'ksp-sw-drivers';
      swg.add(swUnit);

      // Switch Faceplate (Dark Metallic)
      const faceplate = maintBox(0.60, 0.07, 0.015, 0x0f172a);
      faceplate.position.set(0, 0.0, -0.205);
      faceplate.userData.serverId = 'ksp-sw-drivers';
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

      // 16 RJ-45 Gigabit Ports with Activity LEDs
      for (let px = -0.10; px <= 0.24; px += 0.022) {
        const port = maintBox(0.013, 0.018, 0.008, 0x334155);
        port.position.set(px, -0.01, -0.212);
        port.userData.serverId = 'ksp-sw-drivers';
        swg.add(port);

        const led = maintBox(0.007, 0.007, 0.004, 0x22c55e);
        led.material = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        led.position.set(px, 0.015, -0.213);
        swg.add(led);
      }

      // Short looped patch cables between Patch Panel and Switch Ports
      for (let px = -0.08; px <= 0.22; px += 0.044) {
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

    // ติดตั้งตู้แร็ค Switch Hub ที่ผนังฝั่งตะวันตก (ตำแหน่งมาร์คสีแดง: offX - 5.75, y = 2.05, z = 1.35)
    makeDriversSwitchRack(offX - 5.75, 2.05, 1.35);
    L.push({
      text: '🔀 KSP-SW-DRIVERS (10.10.100.8)',
      pos: V(offX - 5.5, 2.65, 1.35),
      cls: 'int-label server-badge clickable',
      serverId: 'ksp-sw-drivers'
    });

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
        ['🖥️', 'คอมพิวเตอร์ประจำอาคาร', '2 เครื่อง (คลิกดูสเปก PC ได้)'],
        ['🔀', 'KSP-SW-DRIVERS: สวิตช์ฮับตึก พขร. (10.10.100.8)', '🟢 ออนไลน์ (ศูนย์สั่งการ 1669)', 'server-ksp-sw-drivers', 'free']
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
