/* =========================================================================
 * โรงครัว (Kitchen - ครัวทำอาหารเตรียมวัตถุดิบ • โต๊ะทำครัว • ชั้นเก็บอุปกรณ์/ของแห้ง • ห้องเครื่องปรุง & โต๊ะคอมโรงครัว)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  const kitchenState = {
    cookingActive: true,
    storeOpen: true
  };

  function maintBox(w, h, d, col) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.mat(col, { roughness: 0.5 }));
    m.castShadow = m.receiveShadow = true;
    addEdges(m, 0x334155);
    return m;
  }

  function maintWall(w, h, d, col) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.mat(col, { roughness: 0.55 }));
    m.castShadow = m.receiveShadow = true;
    addEdges(m, 0x1e293b);
    return m;
  }

  function maintCyl(rt, rb, h, col, seg = 14) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M.mat(col, { roughness: 0.45 }));
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  function maintAt(obj, x, y, z) {
    obj.position.set(x, y, z);
    return obj;
  }

  function maintTag(text, pos, kind, toggleId = null, _tip = null, pcInfo = null) {
    let cls = 'int-label';
    if (pcInfo || kind === 'pc') cls += ' pc-tag';
    else if (toggleId) cls += ' ' + (kind.includes('busy') ? 'busy' : 'free') + ' toggleable';
    else if (kind === 'room') cls += ' room-title';
    else cls += ' sub-tag';
    return { text, pos, cls, toggleId, pcInfo };
  }

  function makeStorageShelf(w = 1.5, d = 0.55, h = 1.85, boxColor = 0x3b82f6) {
    const sg = new THREE.Group();
    const postMat = 0x475569;
    const shelfMat = 0x94a3b8;
    [-w / 2 + 0.05, w / 2 - 0.05].forEach((px) => {
      [-d / 2 + 0.05, d / 2 - 0.05].forEach((pz) => {
        sg.add(maintAt(maintBox(0.06, h, 0.06, postMat), px, h / 2, pz));
      });
    });
    [0.25, 0.8, 1.35, 1.82].forEach((sy, idx) => {
      sg.add(maintAt(maintBox(w, 0.04, d, shelfMat), 0, sy, 0));
      if (idx < 3) {
        [-w * 0.28, 0, w * 0.28].forEach((bx, bIdx) => {
          const col = bIdx === 1 ? 0xf59e0b : boxColor;
          sg.add(maintAt(maintBox(w * 0.24, 0.38, d * 0.76, col), bx, sy + 0.21, 0));
        });
      }
    });
    return sg;
  }

  function buildKitchenInterior() {
    const g = new THREE.Group();
    const L = [];
    const WH = 2.15;

    // 1. พื้นอาคารโรงครัว (รูปตัว L ตามผัง:
    // - ปีกซ้ายบน: X = -9.5 .. -4.2 (กว้าง 5.3 ม.), Z = -4.5 .. +0.2 (ลึก 4.7 ม.)
    // - โถงครัวหลัก: X = -4.2 .. +9.5 (กว้าง 13.7 ม.), Z = -4.5 .. +4.8 (ลึก 9.3 ม.)
    // - โซนห้องเครื่องปรุง/สำนักงานมุมขวาล่าง: X = +3.8 .. +9.5 (กว้าง 5.7 ม.), Z = -1.1 .. +4.8 (ลึก 5.9 ม.)
    floor(g, 5.3, 4.7, '#fefce8', '#cbd5e1', 0.6, -6.85, -2.15);
    floor(g, 13.7, 9.3, '#f8fafc', '#cbd5e1', 0.6, 2.65, 0.15);
    floor(g, 5.7, 5.9, '#eff6ff', '#93c5fd', 0.6, 6.65, 1.85);

    // 2. กำแพงกรอบนอกและกำแพงกั้นห้องตามผัง
    // กำแพงบนสุดยาวตลอด (X: -9.5 .. +9.5, Z = -4.5)
    g.add(maintAt(maintWall(19.0, WH, 0.18, 0x1e293b), 0, WH / 2, -4.5));
    // กำแพงซ้ายสุดของปีกซ้ายบน (X = -9.5, Z: -4.5 .. +0.2)
    g.add(maintAt(maintWall(0.18, WH, 4.7, 0x1e293b), -9.5, WH / 2, -2.15));
    // กำแพงล่างของปีกซ้ายบน (Z = +0.2, X: -9.5 .. -4.2) เว้นช่องประตูที่ X: -5.9 .. -4.4
    g.add(
      maintAt(maintWall(3.6, WH, 0.18, 0x1e293b), -7.7, WH / 2, 0.2),
      maintAt(maintWall(0.2, WH, 0.18, 0x1e293b), -4.3, WH / 2, 0.2),
      maintAt(maintWall(1.5, 0.35, 0.18, 0x1e293b), -5.15, WH - 0.175, 0.2)
    );

    // กำแพงกั้นแนวตั้งที่ X = -4.2:
    // - ช่วงบนกั้นระหว่างห้องเก็บอุปกรณ์กับโถงครัวหลัก (Z: -4.5 .. +1.9)
    // - ช่วงล่างเว้นช่องประตูทางเข้าหลัก (Z: +1.9 .. +4.3) และปิดท้าย (Z: +4.3 .. +4.8)
    g.add(
      maintAt(maintWall(0.18, WH, 6.4, 0x1e293b), -4.2, WH / 2, -1.3),
      maintAt(maintWall(0.18, WH, 0.5, 0x1e293b), -4.2, WH / 2, 4.55),
      maintAt(maintWall(0.18, 0.35, 2.4, 0x1e293b), -4.2, WH - 0.175, 3.1)
    );

    // กำแพงล่างสุดของโถงครัวหลัก (Z = +4.8, X: -4.2 .. +9.5)
    g.add(maintAt(maintWall(13.7, WH, 0.18, 0x1e293b), 2.65, WH / 2, 4.8));
    // กำแพงขวาสุดของโถงครัวหลัก (X = +9.5, Z: -4.5 .. +4.8)
    g.add(maintAt(maintWall(0.18, WH, 9.3, 0x1e293b), 9.5, WH / 2, 0.15));

    // กำแพงกั้นห้องมุมขวาล่าง (X = +3.8, Z: -1.1 .. +4.8 และ Z = -1.1, X: +3.8 .. +9.5)
    // เว้นช่องประตูที่ผนัง X = +3.8 ช่วง Z: +0.15 .. +1.55 (กึ่งกลาง Z = +0.85)
    g.add(
      maintAt(maintWall(0.16, WH, 1.25, 0x475569), 3.8, WH / 2, -0.475),
      maintAt(maintWall(0.16, WH, 3.25, 0x475569), 3.8, WH / 2, 3.175),
      maintAt(maintWall(0.16, 0.35, 1.4, 0x475569), 3.8, WH - 0.175, 0.85),
      maintAt(maintWall(5.7, WH, 0.16, 0x475569), 6.65, WH / 2, -1.1)
    );

    // ฟังก์ชันสร้างกรอบประตูคร่อมผนังตามแบบผัง
    function makePlanDoor(x, z, w, d, leafRotY = 0.35) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const pad = maintBox(w, 0.05, d, 0xe2e8f0);
      pad.position.set(0, 0.025, 0);
      dg.add(pad);
      const isHoriz = w > d;
      const leaf = maintBox(isHoriz ? w * 0.8 : 0.08, 1.82, isHoriz ? 0.08 : d * 0.8, 0xd97706);
      leaf.position.set(0, 0.92, 0);
      leaf.rotation.y = leafRotY;
      dg.add(leaf);
      g.add(dg);
    }

    // 3. ประตูทั้ง 3 จุดตามผัง
    // (1) ประตูห้องเก็บอุปกรณ์/ของแห้ง ฝั่งซ้ายบน (X = -5.15, Z = +0.2)
    makePlanDoor(-5.15, 0.2, 1.55, 0.85, 0.35);
    L.push(maintTag('🚪 ประตู', V(-5.15, 1.45, 0.2), 'sub', null, 'ประตูห้องเก็บอุปกรณ์และของแห้ง'));

    // (2) ประตูหลักเข้าโถงโรงครัว ฝั่งซ้ายล่าง (X = -4.2, Z = +3.1)
    makePlanDoor(-4.2, 3.1, 1.15, 2.35, 0.38);
    L.push(maintTag('🚪 ประตู', V(-4.2, 1.45, 3.1), 'room', null, 'ประตูทางเข้าหลักอาคารโรงครัว'));

    // (3) ประตูห้องเครื่องปรุง/โต๊ะคอมโรงครัว ฝั่งขวาล่าง (X = +3.8, Z = +0.85)
    makePlanDoor(3.8, 0.85, 1.45, 0.85, -0.35);
    L.push(maintTag('🚪 ประตู', V(3.8, 1.45, 0.85), 'sub', null, 'ประตูเข้าห้องเครื่องปรุงและโต๊ะคอมโรงครัว'));

    // 4. ภายในห้องซ้ายบน: "ชั้นเก็บอุปกรณ์" และ "โต๊ะคอมหัวหน้า"
    const equipShelf = makeStorageShelf(3.5, 1.05, 1.85, 0x0284c7);
    equipShelf.position.set(-6.85, 0, -3.1);
    g.add(equipShelf);
    L.push(
      maintTag(
        `🗄️ ชั้นเก็บอุปกรณ์ (${kitchenState.storeOpen ? '🟢 พร้อมใช้งาน' : '🔴 ปิดตรวจนับ'})`,
        V(-6.85, 2.15, -3.1),
        'room ' + (kitchenState.storeOpen ? 'free' : 'busy'),
        'kitchen-store',
        'คลิกเพื่อสลับสถานะห้องเก็บอุปกรณ์'
      )
    );

    const headKitchenPcSpec = {
      code: 'PC-KIT-02',
      name: 'โต๊ะคอมหัวหน้า (หัวหน้างานโภชนาการและโรงครัว)',
      role: 'บริหารงานโภชนาการ วางแผนเมนูอาหารผู้ป่วย ตรวจสอบงบประมาณและอนุมัติการเบิกวัตถุดิบ',
      user: 'หัวหน้างานโภชนาการ โรงพยาบาลโคกศรีสุพรรณ',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i7-12700 (12C/20T @ 4.9GHz)',
      ram: '16 GB DDR4 3200MHz',
      storage: 'SSD NVMe 512 GB',
      monitor: '24" FHD IPS Monitor',
      ip: '192.168.18.41',
      software: 'ระบบบริหารงานโภชนาการ HOSxP • ระบบสารบรรณอิเล็กทรอนิกส์ • ระบบคลังพัสดุและงบประมาณ',
      peripherals: 'เครื่องพิมพ์เลเซอร์ขาว-ดำ • เครื่องสำรองไฟ UPS 1000VA',
      status: '🟢 ออนไลน์ปกติ'
    };

    const headPcGroup = new THREE.Group();
    const hkX = -7.45;
    const hkZ = -0.85;
    headPcGroup.add(
      maintAt(maintBox(2.15, 0.74, 0.85, 0x1e293b), hkX, 0.37, hkZ),
      maintAt(maintBox(2.22, 0.06, 0.92, 0xf8fafc), hkX, 0.76, hkZ),
      maintAt(maintBox(0.62, 0.38, 0.05, 0x0f172a), hkX, 1.04, hkZ - 0.22),
      maintAt(maintBox(0.56, 0.32, 0.02, 0x38bdf8), hkX, 1.04, hkZ - 0.19),
      maintAt(maintBox(0.16, 0.12, 0.14, 0x475569), hkX, 0.83, hkZ - 0.22),
      maintAt(maintBox(0.4, 0.02, 0.15, 0x0f172a), hkX, 0.8, hkZ + 0.1),
      maintAt(maintBox(0.24, 0.44, 0.44, 0x0f172a), hkX + 0.68, 1.0, hkZ - 0.08),
      maintAt(maintBox(0.5, 0.46, 0.5, 0x0284c7), hkX, 0.23, hkZ + 0.62),
      maintAt(maintBox(0.48, 0.5, 0.08, 0x0369a1), hkX, 0.66, hkZ + 0.84)
    );
    headPcGroup.traverse((child) => {
      if (child.isMesh) child.userData.pcInfo = headKitchenPcSpec;
    });
    g.add(headPcGroup);

    const headChef = makePerson({
      role: 'doctor',
      shirtColor: 0x0284c7,
      pose: 'sit',
      rotY: 0
    });
    headChef.position.set(hkX, 0, hkZ + 0.62);
    g.add(headChef);

    L.push(
      maintTag(
        '🖥️ โต๊ะคอมหัวหน้า (คลิกดูสเปก)',
        V(hkX, 1.75, hkZ),
        'pc',
        null,
        'คลิกเพื่อดูสเปกคอมพิวเตอร์โต๊ะคอมหัวหน้า (PC-KIT-02)',
        headKitchenPcSpec
      )
    );

    // =========================================================================
    // 🔀 ตู้แร็คแขวนผนัง Switch Hub KSP-SW-KITCHEN (ตำแหน่งมาร์คสีส้ม หน้าห้องหัวหน้าโรงครัว)
    // =========================================================================
    function makeKitchenSwitchRack(x, y, z) {
      const swg = new THREE.Group();
      swg.position.set(x, y, z);
      swg.rotation.y = Math.PI; // หมุน 180 องศา ให้แผ่นหลังชิดผนังหน้าห้อง (Z = 0.29) และประตูกระจกหันหน้าออก (+Z)

      function rackBox(w, h, d, color, metalness = 0.4, roughness = 0.5) {
        return new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({ color, metalness, roughness })
        );
      }

      // 1. Metal Wall Mounting Bracket / Backplate (touches wall at local +Z)
      const bracket = rackBox(0.74, 0.58, 0.04, 0x0f172a);
      bracket.position.set(0, 0, 0.20);
      swg.add(bracket);

      // 2. 6U Wallmount Cabinet Frame (Black / Dark Slate with cyan edge highlight)
      const cab = rackBox(0.72, 0.54, 0.42, 0x1e293b);
      cab.position.set(0, 0, 0);
      addEdges(cab, 0x0284c7);
      cab.userData.serverId = 'ksp-sw-kitchen';
      swg.add(cab);

      // 3. Side Ventilation Louvers
      [-0.365, 0.365].forEach((sx) => {
        const vent = rackBox(0.01, 0.28, 0.24, 0x0f172a);
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
      doorGlass.userData.serverId = 'ksp-sw-kitchen';
      swg.add(doorGlass);

      const doorBorder = rackBox(0.68, 0.50, 0.02, 0x0f172a);
      doorBorder.position.set(0, 0, -0.21);
      addEdges(doorBorder, 0x38bdf8);
      swg.add(doorBorder);

      const keyLock = rackBox(0.03, 0.05, 0.02, 0x94a3b8);
      keyLock.position.set(0.29, 0, -0.22);
      swg.add(keyLock);

      // 5. Internal Rack Units:
      // Unit A: 1U Patch Panel (y = +0.13)
      const patchPanel = rackBox(0.62, 0.07, 0.30, 0x0f172a);
      patchPanel.position.set(0, 0.13, -0.04);
      addEdges(patchPanel, 0x475569);
      swg.add(patchPanel);
      for (let px = -0.25; px <= 0.25; px += 0.022) {
        const jack = rackBox(0.014, 0.018, 0.01, 0x475569);
        jack.position.set(px, 0.13, -0.192);
        swg.add(jack);
      }

      // Unit B: 1U Managed Switch Hub (KSP-SW-KITCHEN, y = 0.0)
      const swUnit = rackBox(0.62, 0.08, 0.34, 0x0284c7);
      swUnit.position.set(0, 0.0, -0.04);
      addEdges(swUnit, 0x38bdf8);
      swUnit.userData.serverId = 'ksp-sw-kitchen';
      swg.add(swUnit);

      // Switch Faceplate (Dark Metallic)
      const faceplate = rackBox(0.60, 0.07, 0.015, 0x0f172a);
      faceplate.position.set(0, 0.0, -0.205);
      faceplate.userData.serverId = 'ksp-sw-kitchen';
      swg.add(faceplate);

      // Aruba/HPE Brand Cyan Bar
      const brandBar = rackBox(0.12, 0.02, 0.005, 0x38bdf8);
      brandBar.position.set(-0.21, 0.02, -0.214);
      swg.add(brandBar);

      // Power Status LED (Green)
      const pwrLed = rackBox(0.01, 0.01, 0.005, 0x22c55e);
      pwrLed.material = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      pwrLed.position.set(-0.25, 0.02, -0.214);
      swg.add(pwrLed);

      // 24 RJ-45 Gigabit Ports with Activity LEDs
      for (let px = -0.12; px <= 0.25; px += 0.016) {
        const port = rackBox(0.011, 0.018, 0.008, 0x334155);
        port.position.set(px, -0.01, -0.212);
        port.userData.serverId = 'ksp-sw-kitchen';
        swg.add(port);

        const led = rackBox(0.006, 0.006, 0.004, 0x22c55e);
        led.material = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        led.position.set(px, 0.015, -0.213);
        swg.add(led);
      }

      // Short looped patch cables between Patch Panel and Switch Ports
      for (let px = -0.10; px <= 0.23; px += 0.033) {
        const cable = rackBox(0.008, 0.10, 0.012, 0x38bdf8);
        cable.position.set(px, 0.065, -0.20);
        swg.add(cable);
      }

      // Unit C: 1U Horizontal Cable Manager (y = -0.11)
      const cableMgr = rackBox(0.62, 0.06, 0.26, 0x1e293b);
      cableMgr.position.set(0, -0.11, -0.04);
      swg.add(cableMgr);

      // Unit D: Power Distribution Strip (PDU) at the bottom (y = -0.20)
      const pdu = rackBox(0.60, 0.05, 0.15, 0x0f172a);
      pdu.position.set(0, -0.20, 0.02);
      swg.add(pdu);
      const pduLight = rackBox(0.012, 0.012, 0.006, 0xef4444);
      pduLight.material = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      pduLight.position.set(-0.24, -0.20, -0.06);
      swg.add(pduLight);

      // 6. PVC Cable Trunking Conduit going up to ceiling
      const conduit = rackBox(0.08, 0.55, 0.05, 0xf1f5f9);
      conduit.position.set(0, 0.54, 0.18);
      addEdges(conduit, 0x94a3b8);
      swg.add(conduit);

      g.add(swg);
      return swg;
    }

    // ติดตั้งตู้แร็ค Switch Hub ที่ผนังหน้าห้องหัวหน้าโรงครัว (ตำแหน่งมาร์คสีส้ม: x = -8.5, y = 1.35, z = 0.49)
    makeKitchenSwitchRack(-8.5, 1.35, 0.49);
    L.push({
      text: '🔀 KSP-SW-KITCHEN (10.10.100.15)',
      pos: V(-8.5, 2.05, 0.75),
      cls: 'int-label server-badge clickable',
      serverId: 'ksp-sw-kitchen'
    });

    // 5. โถงครัวหลัก: "ครัวทำอาหารเตรียมวัตถุดิบ"
    const cookX = 2.6;
    const cookZ = -3.1;
    const cookW = 13.0;
    const cookD = 1.25;
    const cookFloorCol = kitchenState.cookingActive ? 0xffedd5 : 0xf1f5f9;
    g.add(
      maintAt(maintBox(cookW, 0.04, cookD + 0.2, cookFloorCol), cookX, 0.025, cookZ),
      maintAt(maintBox(cookW - 0.2, 0.86, cookD, 0x94a3b8), cookX, 0.43, cookZ),
      maintAt(maintBox(cookW - 0.1, 0.06, cookD + 0.06, 0xe2e8f0), cookX, 0.89, cookZ),
      maintAt(maintBox(5.5, 0.42, 1.15, 0xcbd5e1), 0.2, 1.92, cookZ),
      maintAt(maintCyl(0.32, 0.32, 0.38, 0x475569, 16), -1.4, 1.1, cookZ),
      maintAt(maintCyl(0.32, 0.32, 0.38, 0x475569, 16), -0.3, 1.1, cookZ),
      maintAt(maintCyl(0.28, 0.28, 0.32, 0x334155, 16), 0.8, 1.07, cookZ),
      maintAt(maintBox(1.8, 0.08, 0.75, 0x64748b), 4.6, 0.93, cookZ),
      maintAt(maintBox(1.4, 0.05, 0.65, 0xfef08a), 7.2, 0.93, cookZ)
    );

    if (kitchenState.cookingActive) {
      const chef1 = makePerson({ role: 'nurse', shirtColor: 0xffffff, pose: 'stand', rotY: Math.PI });
      chef1.position.set(-0.8, 0, -2.0);
      const chef2 = makePerson({ role: 'nurse', shirtColor: 0xffffff, pose: 'stand', rotY: Math.PI });
      chef2.position.set(5.2, 0, -2.0);
      g.add(chef1, chef2);
    }

    L.push(
      maintTag(
        `🍳 ครัวทำอาหารเตรียมวัตถุดิบ (${kitchenState.cookingActive ? '🟢 กำลังประกอบอาหาร' : '🔴 พักครัว'})`,
        V(cookX, 2.35, cookZ),
        'room ' + (kitchenState.cookingActive ? 'free' : 'busy'),
        'kitchen-cook',
        'คลิกเพื่อสลับสถานะครัวทำอาหารเตรียมวัตถุดิบ'
      )
    );

    // 6. "โต๊ะทำครัว" 2 จุด
    g.add(
      maintAt(maintBox(1.1, 0.84, 3.6, 0x94a3b8), -3.45, 0.42, -0.35),
      maintAt(maintBox(1.18, 0.06, 3.68, 0xf1f5f9), -3.45, 0.87, -0.35),
      maintAt(maintBox(0.65, 0.12, 0.95, 0xcbd5e1), -3.45, 0.96, -1.1),
      maintAt(maintBox(0.65, 0.12, 0.95, 0xcbd5e1), -3.45, 0.96, 0.4)
    );
    L.push(maintTag('🔪 โต๊ะทำครัว', V(-3.45, 1.45, -0.35), 'room', null, 'โต๊ะทำครัวและจัดเตรียมถาดอาหาร (ฝั่งซ้าย)'));

    g.add(
      maintAt(maintBox(1.15, 0.84, 3.8, 0x94a3b8), -0.35, 0.42, 0.95),
      maintAt(maintBox(1.22, 0.06, 3.88, 0xf1f5f9), -0.35, 0.87, 0.95),
      maintAt(maintBox(0.7, 0.14, 1.0, 0x38bdf8), -0.35, 0.97, 0.1),
      maintAt(maintBox(0.7, 0.14, 1.0, 0xfbbf24), -0.35, 0.97, 1.75)
    );
    L.push(maintTag('🔪 โต๊ะทำครัว', V(-0.35, 1.45, 0.95), 'room', null, 'โต๊ะทำครัวกลางโถงโรงครัว'));

    // 7. ภายในห้องมุมขวาล่าง:
    const spiceShelfTop = makeStorageShelf(3.9, 1.0, 1.8, 0x16a34a);
    spiceShelfTop.position.set(5.95, 0, -0.45);
    g.add(spiceShelfTop);
    L.push(maintTag('🧂 ชั้นเก็บเครื่องปรุง', V(5.95, 2.05, -0.45), 'room', null, 'ชั้นเก็บเครื่องปรุง (ด้านบน)'));

    const spiceShelfRight = makeStorageShelf(2.9, 1.05, 1.8, 0xea580c);
    spiceShelfRight.rotation.y = Math.PI / 2;
    spiceShelfRight.position.set(8.8, 0, 3.1);
    g.add(spiceShelfRight);
    L.push(maintTag('🧂 ชั้นเก็บเครื่องปรุง', V(8.8, 2.05, 3.1), 'room', null, 'ชั้นเก็บเครื่องปรุง (ชิดผนังขวาล่าง)'));

    [2.05, 3.35].forEach((tz, idx) => {
      g.add(
        maintAt(maintBox(1.95, 0.74, 0.82, 0xd97706), 5.3, 0.37, tz),
        maintAt(maintBox(2.02, 0.06, 0.88, 0xfef3c7), 5.3, 0.76, tz),
        maintAt(maintBox(0.45, 0.45, 0.45, 0x334155), 5.3, 0.23, tz + 0.55)
      );
      L.push(maintTag('🪑 โต๊ะ', V(5.3, 1.25, tz), 'sub', null, `โต๊ะปฏิบัติงานโภชนาการ ตัวที่ ${idx + 1}`));
    });

    const kitchenPcSpec = {
      code: 'PC-KIT-01',
      name: 'โต๊ะคอมโรงครัว (งานโภชนาการและอาหารผู้ป่วยใน)',
      role: 'บริหารจัดการรายการอาหารผู้ป่วยในเฉพาะโรค คำนวณโภชนาการ และเบิกจ่ายวัตถุดิบโรงครัว',
      user: 'นักโภชนาการ / เจ้าหน้าที่งานโภชนาการ โรงพยาบาลโคกศรีสุพรรณ',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T @ 4.4GHz)',
      ram: '16 GB DDR4 3200MHz',
      storage: 'SSD NVMe 512 GB',
      monitor: '24" FHD IPS Monitor',
      ip: '192.168.18.45',
      software: 'ระบบโภชนาการโรงพยาบาล (HOSxP Nutrition & Diet) • ระบบเบิกจ่ายคลังวัตถุดิบอาหาร',
      peripherals: 'เครื่องพิมพ์ฉลากถาดอาหารผู้ป่วย • เครื่องสำรองไฟ UPS 1000VA',
      status: '🟢 ออนไลน์ปกติ'
    };

    const kitPcGroup = new THREE.Group();
    const kpX = 8.8;
    const kpZ = 0.15;
    kitPcGroup.add(
      maintAt(maintBox(1.1, 0.74, 2.3, 0x334155), kpX, 0.37, kpZ),
      maintAt(maintBox(1.16, 0.06, 2.36, 0xf8fafc), kpX, 0.76, kpZ),
      maintAt(maintBox(0.05, 0.38, 0.62, 0x0f172a), kpX + 0.25, 1.04, kpZ),
      maintAt(maintBox(0.02, 0.32, 0.56, 0x38bdf8), kpX + 0.22, 1.04, kpZ),
      maintAt(maintBox(0.14, 0.12, 0.16, 0x475569), kpX + 0.25, 0.83, kpZ),
      maintAt(maintBox(0.15, 0.02, 0.4, 0x1e293b), kpX - 0.1, 0.8, kpZ),
      maintAt(maintBox(0.44, 0.44, 0.24, 0x1e293b), kpX + 0.15, 1.0, kpZ - 0.65),
      maintAt(maintBox(0.48, 0.46, 0.48, 0x2563eb), kpX - 0.82, 0.23, kpZ),
      maintAt(maintBox(0.08, 0.48, 0.46, 0x1d4ed8), kpX - 1.04, 0.65, kpZ)
    );
    kitPcGroup.traverse((child) => {
      if (child.isMesh) child.userData.pcInfo = kitchenPcSpec;
    });
    g.add(kitPcGroup);

    const dietitian = makePerson({
      role: 'nurse',
      shirtColor: 0x0ea5e9,
      pose: 'sit',
      rotY: Math.PI / 2
    });
    dietitian.position.set(kpX - 0.82, 0, kpZ);
    g.add(dietitian);

    L.push(
      maintTag(
        '🖥️ โต๊ะคอมโรงครัว (คลิกดูสเปก)',
        V(kpX, 1.75, kpZ),
        'pc',
        null,
        'คลิกเพื่อดูสเปกคอมพิวเตอร์โต๊ะคอมโรงครัว (PC-KIT-01)',
        kitchenPcSpec
      )
    );

    const items = [
      [
        '🍳',
        'ครัวทำอาหารเตรียมวัตถุดิบ (แนวยาวด้านบน)',
        kitchenState.cookingActive ? '🟢 กำลังประกอบอาหาร' : '🔴 พักครัว',
        'kitchen-cook',
        kitchenState.cookingActive ? 'free' : 'busy'
      ],
      [
        '🗄️',
        'ชั้นเก็บอุปกรณ์ (ห้องฝั่งซ้ายบน)',
        kitchenState.storeOpen ? '🟢 พร้อมใช้งาน' : '🔴 ปิดตรวจนับ',
        'kitchen-store',
        kitchenState.storeOpen ? 'free' : 'busy'
      ],
      [
        '🖥️',
        'PC-KIT-02: โต๊ะคอมหัวหน้า (ห้องฝั่งซ้ายบน)',
        'ดูสเปก',
        null,
        'free',
        headKitchenPcSpec
      ],
      [
        '🖥️',
        'PC-KIT-01: โต๊ะคอมโรงครัว (ชิดผนังขวา)',
        'ดูสเปก',
        null,
        'free',
        kitchenPcSpec
      ],
      ['🔪', 'โต๊ะทำครัว (ฝั่งซ้าย & กลางโถง)', '2 จุด'],
      ['🧂', 'ชั้นเก็บเครื่องปรุง (ด้านบน & ด้านขวาล่าง)', '2 จุด'],
      ['🪑', 'โต๊ะปฏิบัติงานในห้องเครื่องปรุง', '2 ตัว'],
      ['🚪', 'ประตูทางเข้า-ออกและเชื่อมโซน', '3 บาน'],
      ['🔀', 'KSP-SW-KITCHEN: สวิตช์ฮับโรงครัว (10.10.100.15)', '🟢 ออนไลน์ (หน้าห้องหัวหน้าโรงครัว)', 'server-ksp-sw-kitchen', 'free']
    ];

    return {
      group: g,
      labels: L,
      size: 21,
      title:
        '🍳 ผังภายในโรงครัว: ครัวทำอาหารเตรียมวัตถุดิบ • โต๊ะทำครัว • ชั้นเก็บอุปกรณ์ & โต๊ะคอมหัวหน้า • ชั้นเก็บเครื่องปรุง & โต๊ะคอมโรงครัว',
      sub: 'คลิกป้าย "ครัวทำอาหารเตรียมวัตถุดิบ" หรือ "ชั้นเก็บอุปกรณ์" เพื่อสลับสถานะ • คลิกป้าย "🖥️ โต๊ะคอมหัวหน้า" หรือ "🖥️ โต๊ะคอมโรงครัว" เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 18.5, 16.5), target: V(0, 0, 0.2) }
    };
  }

  function toggleKitchenStatus(id) {
    if (id.startsWith('server-')) {
      const sId = id.replace('server-', '');
      if (window.openServerModal) window.openServerModal(sId);
      return false;
    }
    if (id === 'kitchen-cook') {
      kitchenState.cookingActive = !kitchenState.cookingActive;
      return true;
    }
    if (id === 'kitchen-store') {
      kitchenState.storeOpen = !kitchenState.storeOpen;
      return true;
    }
    return false;
  }

  K.Interiors.register('kitchen', buildKitchenInterior, toggleKitchenStatus);
})();
