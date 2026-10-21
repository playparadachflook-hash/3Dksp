/* =========================================================================
 * ห้องยา (Pharmacy - โซนจ่ายยา • โต๊ะคอมจ่ายยา 1–7 • โต๊ะจัดยา • คลังยา • คลังน้ำเกลือ+ตู้แช่ยา • ห้องพักเจ้าหน้าที่)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  const pharmacyState = {
    dispensingOpen: true,
    mainStoreOpen: true,
    coldStoreActive: true
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

  function buildPharmacyInterior() {
    const g = new THREE.Group();
    const L = [];
    const WH = 2.4;

    const xMin = -12.0, xMax = 12.0;
    const zMin = -8.5,  zMax = 8.5;
    const wThick = 0.18;

    // 1. พื้นแต่ละโซนตามผัง
    floor(g, 5.2, 17.0, '#f0fdf4', '#bbf7d0', 0.6, -9.4, 0);
    floor(g, 9.6, 7.7, '#fefce8', '#cbd5e1', 0.6, -2.0, -4.65);
    floor(g, 4.0, 7.7, '#fffbeb', '#cbd5e1', 0.6, 4.8, -4.65);
    floor(g, 5.2, 7.7, '#e0f2fe', '#93c5fd', 0.6, 9.4, -4.65);
    floor(g, 16.3, 9.3, '#f8fafc', '#cbd5e1', 0.6, 1.35, 3.85);
    floor(g, 2.5, 9.3, '#f5f3ff', '#ddd6fe', 0.6, 10.75, 3.85);

    // 2. ผนังรอบนอกอาคารห้องยา
    const zTopWall = zMin + wThick / 2; // -8.41
    const zBtmWall = zMax - wThick / 2; // +8.41
    const xLftWall = xMin + wThick / 2; // -11.91
    const xRgtWall = xMax - wThick / 2; // +11.91

    // ผนังบน
    g.add(
      maintAt(maintWall(21.8, WH, wThick, 0x1e293b), -1.1, WH / 2, zTopWall),
      maintAt(maintWall(0.6, WH, wThick, 0x1e293b), 11.7, WH / 2, zTopWall),
      maintAt(maintWall(1.6, 0.35, wThick, 0x1e293b), 10.6, WH - 0.175, zTopWall)
    );

    // ผนังขวาสุด
    g.add(maintAt(maintWall(wThick, WH, 17.0, 0x1e293b), xRgtWall, WH / 2, 0));

    // ผนังล่าง
    g.add(
      maintAt(maintWall(0.4, WH, wThick, 0x1e293b), -11.8, WH / 2, zBtmWall),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -10.9, WH - 0.175, zBtmWall),
      maintAt(maintWall(6.7, WH, wThick, 0x1e293b), -6.85, WH / 2, zBtmWall),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -2.8, WH - 0.175, zBtmWall),
      maintAt(maintWall(14.1, WH, wThick, 0x1e293b), 4.95, WH / 2, zBtmWall)
    );

    // ผนังซ้ายสุด
    g.add(
      maintAt(maintWall(wThick, WH, 1.3, 0x1e293b), xLftWall, WH / 2, -7.85),
      maintAt(maintWall(wThick, 0.90, 13.8, 0x1e293b), xLftWall, 0.45, -0.3),
      maintAt(maintWall(wThick, 0.40, 13.8, 0x1e293b), xLftWall, WH - 0.20, -0.3),
      maintAt(maintWall(wThick, WH, 1.9, 0x1e293b), xLftWall, WH / 2, 7.55)
    );

    // 3. ผนังกั้นภายในห้องยา
    g.add(
      maintAt(maintWall(0.18, WH, 12.9, 0x1e293b), -6.8, WH / 2, -2.05),
      maintAt(maintWall(0.18, 0.35, 1.6, 0x1e293b), -6.8, WH - 0.175, 5.2),
      maintAt(maintWall(0.18, WH, 2.3, 0x2563eb), -6.8, WH / 2, 7.15)
    );

    g.add(
      maintAt(maintWall(7.6, WH, 0.18, 0x1e293b), -3.0, WH / 2, -0.8),
      maintAt(maintWall(1.6, 0.35, 0.18, 0x1e293b), 1.6, WH - 0.175, -0.8),
      maintAt(maintWall(0.7, WH, 0.18, 0x1e293b), 2.75, WH / 2, -0.8),
      maintAt(maintWall(1.6, 0.35, 0.18, 0x1e293b), 3.9, WH - 0.175, -0.8),
      maintAt(maintWall(7.3, WH, 0.18, 0x1e293b), 8.35, WH / 2, -0.8)
    );

    g.add(maintAt(maintWall(0.16, WH, 7.6, 0x1e293b), 2.8, WH / 2, -4.6));
    g.add(
      maintAt(maintWall(0.16, WH, 0.7, 0x1e293b), 6.8, WH / 2, -8.05),
      maintAt(maintWall(0.16, 0.35, 1.6, 0x1e293b), 6.8, WH - 0.175, -7.0),
      maintAt(maintWall(0.16, WH, 5.3, 0x1e293b), 6.8, WH / 2, -3.55)
    );

    g.add(
      maintAt(maintWall(0.16, WH, 1.8, 0x475569), 9.5, WH / 2, 0.1),
      maintAt(maintWall(0.16, 0.35, 1.6, 0x475569), 9.5, WH - 0.175, 1.8),
      maintAt(maintWall(0.16, WH, 5.7, 0x475569), 9.5, WH / 2, 5.45)
    );

    function makePharDoor(x, z, w, d, rotY = 0) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const isHoriz = w >= d;
      const pad = maintBox(w, 0.04, d, 0xe2e8f0);
      pad.position.set(0, 0.02, 0);
      dg.add(pad);
      const leaf = maintBox(isHoriz ? w * 0.82 : 0.07, 1.95, isHoriz ? 0.07 : d * 0.82, 0xd97706);
      leaf.position.set(0, 0.98, 0);
      leaf.rotation.y = rotY;
      dg.add(leaf);
      g.add(dg);
    }

    makePharDoor(-10.9, zBtmWall - 0.05, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-10.9, 1.45, zBtmWall - 0.35), 'sub', null, 'ประตูเข้า-ออกโซนจ่ายยา (ฝั่งซ้ายล่าง)'));

    makePharDoor(-6.8, 5.2, 0.45, 1.5, -0.38);
    L.push(maintTag('🚪 ประตู', V(-6.8, 1.45, 5.2), 'sub', null, 'ประตูเชื่อมระหว่างโซนจ่ายยากับโถงห้องยา'));

    makePharDoor(-2.8, zBtmWall - 0.05, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-2.8, 1.45, zBtmWall - 0.35), 'room', null, 'ประตูทางเข้าหลักห้องยา (ฝั่งด้านหน้า)'));

    makePharDoor(1.6, -0.8, 1.5, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(1.6, 1.45, -0.8), 'sub', null, 'ประตูเข้าคลังยาห้องใหญ่'));

    makePharDoor(3.9, -0.8, 1.5, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(3.9, 1.45, -0.8), 'sub', null, 'ประตูเข้าคลังยาห้องกลาง'));

    makePharDoor(6.8, -7.0, 0.45, 1.5, 0.38);
    L.push(maintTag('🚪 ประตู', V(6.8, 1.45, -7.0), 'sub', null, 'ประตูเชื่อมคลังยากับคลังน้ำเกลือ'));

    makePharDoor(10.6, zTopWall + 0.05, 1.5, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(10.6, 1.45, zTopWall + 0.35), 'sub', null, 'ประตูโหลดสินค้าคลังน้ำเกลือ'));

    makePharDoor(9.5, 1.8, 0.45, 1.5, -0.38);
    L.push(maintTag('🚪 ประตูห้องพักเจ้าหน้าที่', V(9.5, 1.45, 1.8), 'sub', null, 'ประตูเข้าห้องพักเจ้าหน้าที่ห้องยา'));

    function makePharPcSpec(num, stationName, roleDesc) {
      return {
        code: `PC-PHAR-0${num}`,
        name: `โต๊ะคอมจ่ายยา ${num} (${stationName})`,
        role: roleDesc,
        user: 'เภสัชกร / เจ้าพนักงานเภสัชกรรม โรงพยาบาลโคกศรีสุพรรณ',
        os: 'Windows 11 Pro 64-bit',
        cpu: 'Intel Core i5-12400 (6C/12T @ 4.4GHz)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'SSD NVMe 512 GB',
        monitor: '24" FHD IPS Monitor',
        ip: `192.168.14.${10 + num}`,
        software: 'ระบบห้องยาโรงพยาบาล (HOSxP Pharmacy) • ระบบตรวจสอบอันตรกิริยาระหว่างยา (Drug Interaction) • ระบบ e-Prescription',
        peripherals: 'เครื่องพิมพ์สติกเกอร์ฉลากยาความเร็วสูง TSC • เครื่องสแกนบาร์โค้ดยา • เครื่องสำรองไฟ UPS 1000VA',
        status: '🟢 ออนไลน์ปกติ'
      };
    }

    function createPharPcDesk(x, z, rotY, spec, labelText, personOpts = null) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      dg.add(
        maintAt(maintBox(1.2, 0.74, 0.75, 0x334155), 0, 0.37, 0),
        maintAt(maintBox(1.25, 0.06, 0.8, 0xf8fafc), 0, 0.76, 0),
        maintAt(maintBox(0.58, 0.36, 0.05, 0x0f172a), 0, 1.02, -0.22),
        maintAt(maintBox(0.52, 0.3, 0.02, 0x38bdf8), 0, 1.02, -0.19),
        maintAt(maintBox(0.14, 0.12, 0.12, 0x475569), 0, 0.82, -0.22),
        maintAt(maintBox(0.38, 0.02, 0.14, 0x1e293b), 0, 0.79, 0.12),
        maintAt(maintBox(0.22, 0.42, 0.44, 0x1e293b), 0.42, 0.98, -0.08),
        maintAt(maintBox(0.28, 0.2, 0.28, 0x64748b), -0.42, 0.88, -0.05),
        maintAt(maintBox(0.46, 0.45, 0.46, 0x2563eb), 0, 0.23, 0.62),
        maintAt(maintBox(0.44, 0.48, 0.08, 0x1d4ed8), 0, 0.65, 0.82)
      );
      dg.traverse((child) => {
        if (child.isMesh) child.userData.pcInfo = spec;
      });
      g.add(dg);

      if (personOpts && pharmacyState.dispensingOpen) {
        const staff = makePerson(personOpts);
        staff.position.set(0, 0, 0.62);
        dg.add(staff);
      }

      L.push(
        maintTag(
          `🖥️ ${labelText}`,
          V(x, 1.65, z),
          'pc',
          null,
          `คลิกเพื่อดูสเปก ${labelText} (${spec.code})`,
          spec
        )
      );
    }

    const pharCntX0 = xLftWall + 0.06;
    const pharCntX1 = -10.05;
    const pharCntW = pharCntX1 - pharCntX0;
    const pharCntCX = (pharCntX0 + pharCntX1) / 2;
    const pharDeskX = pharCntX0 + 0.38;
    const pharChairX = pharCntX1 - 0.48;

    const pharZ0 = -7.2;
    const pharZ1 = 6.6;
    const pharD = pharZ1 - pharZ0;
    const pharCZ = (pharZ0 + pharZ1) / 2;

    const pharCntFloorCol = pharmacyState.dispensingOpen ? 0xdcfce7 : 0xfecaca;
    g.add(maintAt(maintBox(pharCntW, 0.03, pharD, pharCntFloorCol), pharCntCX, 0.015, pharCZ));

    g.add(
      maintAt(maintBox(0.68, 0.92, pharD - 0.08, 0x0284c7), pharDeskX, 0.46, pharCZ),
      maintAt(maintBox(0.82, 0.06, pharD - 0.02, 0xf8fafc), pharDeskX - 0.04, 0.95, pharCZ),
      maintAt(maintBox(pharCntW - 0.08, 1.15, 0.16, 0x0284c7), pharCntCX, 0.575, pharZ0 + 0.08),
      maintAt(maintBox(pharCntW - 0.04, 0.06, 0.20, 0xf8fafc), pharCntCX, 1.16, pharZ0 + 0.08),
      maintAt(maintBox(pharCntW - 0.08, 1.15, 0.16, 0x0284c7), pharCntCX, 0.575, pharZ1 - 0.08),
      maintAt(maintBox(pharCntW - 0.04, 0.06, 0.20, 0xf8fafc), pharCntCX, 1.16, pharZ1 - 0.08)
    );

    const pharDividersZ = [-3.75, -0.30, 3.15];
    pharDividersZ.forEach((dz) => {
      g.add(
        maintAt(maintBox(pharCntW - 0.12, 0.45, 0.06, 0x0369a1), pharCntCX, 1.18, dz),
        maintAt(
          new THREE.Mesh(
            new THREE.BoxGeometry(pharCntW - 0.20, 0.24, 0.03),
            new THREE.MeshStandardMaterial({
              color: 0xbae6fd,
              transparent: true,
              opacity: 0.6,
              roughness: 0.2
            })
          ),
          pharCntCX,
          1.52,
          dz
        )
      );
    });

    L.push(
      maintTag(
        `💰 เคาน์เตอร์จ่ายยา ช่อง 1–4 (${pharmacyState.dispensingOpen ? '🟢 เปิดให้บริการ' : '🔴 พักให้บริการ'})`,
        V(pharCntCX, 2.15, pharCZ),
        'room ' + (pharmacyState.dispensingOpen ? 'free' : 'busy'),
        'pharmacy-dispense',
        'คลิกเพื่อสลับสถานะเคาน์เตอร์จ่ายยา'
      )
    );

    const pcSpec1 = makePharPcSpec(1, 'เคาน์เตอร์ช่อง 1', 'ตรวจสอบใบสั่งยาและส่งมอบยาผู้ป่วยนอก');
    const pcSpec2 = makePharPcSpec(2, 'เคาน์เตอร์ช่อง 2', 'ตรวจสอบใบสั่งยาและส่งมอบยาผู้ป่วยนอก');
    const pcSpec3 = makePharPcSpec(3, 'เคาน์เตอร์ช่อง 3', 'ตรวจสอบใบสั่งยาและส่งมอบยาผู้ป่วยนอก');
    const pcSpec4 = makePharPcSpec(4, 'เคาน์เตอร์ช่อง 4', 'ตรวจสอบใบสั่งยาและส่งมอบยาผู้ป่วยนอก');

    const pharStations = [
      { num: 4, z: -5.475, color: 0x10b981, spec: pcSpec4 },
      { num: 3, z: -2.025, color: 0x0284c7, spec: pcSpec3 },
      { num: 2, z: 1.425, color: 0x2563eb, spec: pcSpec2 },
      { num: 1, z: 4.875, color: 0x7c3aed, spec: pcSpec1 }
    ];

    pharStations.forEach((st) => {
      const sz = st.z;
      const sNum = st.num;
      const spec = st.spec;

      g.add(
        maintAt(
          new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.78, 2.7),
            new THREE.MeshStandardMaterial({
              color: 0xbae6fd,
              transparent: true,
              opacity: 0.55,
              roughness: 0.15
            })
          ),
          pharCntX0 + 0.04,
          1.36,
          sz
        ),
        maintAt(maintBox(0.38, 0.04, 0.65, 0x94a3b8), pharCntX0 + 0.16, 0.97, sz),
        maintAt(maintBox(0.08, 0.20, 0.55, 0x0f172a), pharCntX0 + 0.04, 1.05, sz)
      );

      g.add(
        maintAt(maintBox(0.42, 0.14, 0.44, 0x1e293b), pharDeskX + 0.04, 0.88, sz - 0.75),
        maintAt(maintBox(0.04, 0.04, 0.16, 0x94a3b8), pharDeskX + 0.24, 0.88, sz - 0.75),
        maintAt(maintBox(0.24, 0.18, 0.28, 0x334155), pharDeskX + 0.04, 1.07, sz - 0.75),
        maintAt(maintBox(0.12, 0.02, 0.18, 0x94a3b8), pharDeskX + 0.04, 1.15, sz - 0.75),
        maintAt(maintBox(0.08, 0.22, 0.12, 0x0284c7), pharDeskX + 0.12, 1.08, sz - 0.38),
        maintAt(maintBox(0.32, 0.08, 0.38, 0x0284c7), pharDeskX + 0.04, 1.01, sz + 0.75)
      );

      const pcGrp = new THREE.Group();
      pcGrp.add(
        maintAt(maintBox(0.05, 0.36, 0.58, 0x0f172a), pharDeskX - 0.05, 1.25, sz),
        maintAt(maintBox(0.02, 0.30, 0.52, 0x38bdf8), pharDeskX - 0.02, 1.25, sz),
        maintAt(maintBox(0.12, 0.26, 0.14, 0x475569), pharDeskX - 0.06, 1.08, sz),
        maintAt(maintBox(0.14, 0.02, 0.42, 0x1e293b), pharDeskX + 0.18, 0.99, sz),
        maintAt(maintBox(0.08, 0.02, 0.06, 0x334155), pharDeskX + 0.18, 0.99, sz + 0.28),
        maintAt(maintBox(0.38, 0.38, 0.18, 0x1e293b), pharDeskX - 0.05, 1.16, sz + 0.38)
      );
      pcGrp.traverse((child) => {
        if (child.isMesh) child.userData.pcInfo = spec;
      });
      g.add(pcGrp);

      g.add(
        maintAt(maintBox(0.48, 0.46, 0.48, 0x1e293b), pharChairX, 0.23, sz),
        maintAt(maintBox(0.08, 0.48, 0.46, 0x1e293b), pharChairX + 0.22, 0.65, sz)
      );

      if (pharmacyState.dispensingOpen) {
        const staff = makePerson({
          role: 'nurse',
          shirtColor: st.color,
          pose: 'sit',
          rotY: -Math.PI / 2
        });
        staff.position.set(pharChairX, 0, sz);
        g.add(staff);
      }

      L.push(
        maintTag(
          `🖥️ โต๊ะคอมจ่ายยา ${sNum} (เคาน์เตอร์ช่อง ${sNum})`,
          V(pharCntCX, 1.70, sz),
          'pc',
          null,
          `คลิกเพื่อดูสเปกคอมพิวเตอร์ ${spec.name} (${spec.code})`,
          spec
        ),
        maintTag(
          `🪟 ช่องจ่ายยา ${sNum}`,
          V(pharCntX0 - 0.25, 1.45, sz),
          'sub',
          null,
          `ช่องกระจกส่งมอบยาและให้คำแนะนำการใช้ยา ช่องที่ ${sNum}`
        )
      );
    });

    const pcSpec5 = makePharPcSpec(5, 'จุดตรวจสอบและจ่ายยาช่อง 5', 'ตรวจสอบความถูกต้องและพิมพ์ฉลากยา');
    createPharPcDesk(-5.1, 7.55, Math.PI, pcSpec5, 'โต๊ะคอมจ่ายยา 5', { role: 'nurse', shirtColor: 0x0d9488, pose: 'sit', rotY: 0 });

    const pcSpec7 = makePharPcSpec(7, 'จุดให้คำปรึกษาด้านยาช่อง 7', 'ให้คำแนะนำการใช้ยาเฉพาะโรคและยาเทคนิคพิเศษ');
    createPharPcDesk(5.8, 7.55, Math.PI, pcSpec7, 'โต๊ะคอมจ่ายยา 7', { role: 'nurse', shirtColor: 0xca8a04, pose: 'sit', rotY: 0 });

    const pcSpec6 = makePharPcSpec(6, 'จุดจัดเตรียมและจ่ายยาช่อง 6', 'จัดเตรียมยาผู้ป่วยนอกและบันทึกประวัติแพ้ยา');
    createPharPcDesk(8.2, 7.55, Math.PI, pcSpec6, 'โต๊ะคอมจ่ายยา 6', { role: 'nurse', shirtColor: 0xdb2777, pose: 'sit', rotY: 0 });

    const prepTable = new THREE.Group();
    prepTable.add(
      maintAt(maintBox(1.25, 0.82, 8.0, 0xe2e8f0), -8.85, 0.41, -0.5),
      maintAt(maintBox(1.32, 0.06, 8.08, 0xffffff), -8.85, 0.85, -0.5)
    );
    for (let tz = -3.8; tz <= 2.8; tz += 1.3) {
      prepTable.add(
        maintAt(maintBox(0.48, 0.12, 0.85, 0x38bdf8), -9.10, 0.94, tz),
        maintAt(maintBox(0.48, 0.12, 0.85, 0xfbbf24), -8.60, 0.94, tz)
      );
    }
    g.add(prepTable);
    L.push(maintTag('💊 โต๊ะจัดยา', V(-8.85, 1.45, -0.5), 'room', null, 'โต๊ะจัดเตรียมยาและตรวจนับเม็ดยา'));

    const topMedShelf = makeStorageShelf(4.6, 0.65, 2.05, 0x0284c7);
    topMedShelf.position.set(-9.2, 0, -7.85);
    g.add(topMedShelf);
    L.push(maintTag('💊 ชั้นวางยา', V(-9.2, 2.25, -7.85), 'sub', null, 'ชั้นวางยาเม็ดและยาน้ำ (ด้านบน)'));

    const rightMedShelfTop = makeStorageShelf(4.3, 0.65, 2.05, 0x16a34a);
    rightMedShelfTop.rotation.y = Math.PI / 2;
    rightMedShelfTop.position.set(-7.2, 0, -5.5);
    g.add(rightMedShelfTop);
    L.push(maintTag('💊 ชั้นวางยา', V(-7.2, 2.25, -5.5), 'sub', null, 'ชั้นวางยาสำเร็จรูป (ฝั่งขวาบน)'));

    const rightMedShelfBottom = makeStorageShelf(4.3, 0.65, 2.05, 0x0d9488);
    rightMedShelfBottom.rotation.y = Math.PI / 2;
    rightMedShelfBottom.position.set(-7.2, 0, -0.7);
    g.add(rightMedShelfBottom);
    L.push(maintTag('💊 ชั้นวางยา', V(-7.2, 2.25, -0.7), 'sub', null, 'ชั้นวางยาสำเร็จรูป (ฝั่งขวากลาง)'));

    const medCabinet = new THREE.Group();
    medCabinet.add(
      maintAt(maintBox(2.5, 2.0, 0.65, 0x0f172a), -8.7, 1.0, 7.85),
      maintAt(
        new THREE.Mesh(
          new THREE.BoxGeometry(2.35, 1.85, 0.05),
          new THREE.MeshStandardMaterial({
            color: 0x93c5fd,
            transparent: true,
            opacity: 0.55,
            roughness: 0.2
          })
        ),
        -8.7,
        1.0,
        7.5
      )
    );
    g.add(medCabinet);
    L.push(maintTag('🗄️ ตู้เก็บยา', V(-8.7, 2.25, 7.85), 'sub', null, 'ตู้เก็บยาควบคุมพิเศษและยาอันตราย'));

    const mainStore = new THREE.Group();
    [-5.4, -3.4, -1.4].forEach((sx) => {
      const sh = makeStorageShelf(5.3, 0.75, 2.1, 0xd97706);
      sh.rotation.y = Math.PI / 2;
      sh.position.set(sx, 0, -4.65);
      mainStore.add(sh);
    });
    g.add(mainStore);
    L.push(
      maintTag(
        `📦 คลังยา (${pharmacyState.mainStoreOpen ? '🟢 เปิดเบิกจ่าย' : '🔴 ปิดตรวจนับ'})`,
        V(-2.0, 2.35, -4.65),
        'room ' + (pharmacyState.mainStoreOpen ? 'free' : 'busy'),
        'pharmacy-main-store',
        'คลิกเพื่อสลับสถานะคลังยาห้องใหญ่'
      )
    );

    const midStore = new THREE.Group();
    [4.0, 5.6].forEach((sx) => {
      const sh = makeStorageShelf(5.3, 0.75, 2.1, 0x4f46e5);
      sh.rotation.y = Math.PI / 2;
      sh.position.set(sx, 0, -4.65);
      midStore.add(sh);
    });
    g.add(midStore);
    L.push(maintTag('📦 คลังยา', V(4.8, 2.35, -4.65), 'room', null, 'คลังเวชภัณฑ์และยาน้ำสำรอง'));

    const salineGroup = new THREE.Group();
    for (let bx = 8.2; bx <= 10.8; bx += 1.3) {
      salineGroup.add(
        maintAt(maintBox(1.1, 0.15, 1.1, 0xb45309), bx, 0.075, -6.5),
        maintAt(maintBox(0.95, 1.25, 0.95, 0x0284c7), bx, 0.775, -6.5),
        maintAt(maintBox(0.9, 0.12, 0.9, 0xffffff), bx, 1.45, -6.5)
      );
    }
    [8.4, 10.4].forEach((fx) => {
      salineGroup.add(
        maintAt(maintBox(1.25, 1.95, 0.8, 0x0f172a), fx, 0.98, -2.5),
        maintAt(
          new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 1.7, 0.05),
            new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              transparent: true,
              opacity: 0.65,
              roughness: 0.15
            })
          ),
          fx,
          0.98,
          -2.08
        ),
        maintAt(maintBox(0.24, 0.1, 0.04, 0x22c55e), fx, 1.75, -2.06)
      );
    });
    g.add(salineGroup);
    L.push(
      maintTag(
        `🧊 คลังน้ำเกลือ+ตู้แช่ยา (${pharmacyState.coldStoreActive ? '🟢 อุณหภูมิปกติ 4°C' : '🔴 แจ้งเตือนอุณหภูมิ'})`,
        V(9.4, 2.35, -4.65),
        'room ' + (pharmacyState.coldStoreActive ? 'free' : 'busy'),
        'pharmacy-cold-store',
        'คลิกเพื่อสลับสถานะตู้แช่ยาและคลังน้ำเกลือ'
      )
    );

    [-5.4, -3.6, -1.8].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.2, 0.74, 0.75, 0xd97706), tx, 0.37, 0.8),
        maintAt(maintBox(1.26, 0.06, 0.8, 0xfef3c7), tx, 0.76, 0.8),
        maintAt(maintBox(0.46, 0.45, 0.46, 0x334155), tx, 0.23, 0.35)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, 0.8), 'sub', null, `โต๊ะปฏิบัติงานเภสัชกรรม ตัวที่ ${idx + 1}`));
    });

    const benchGroup = new THREE.Group();
    benchGroup.add(
      maintAt(maintBox(3.6, 0.44, 0.85, 0x2563eb), 5.2, 0.22, 0.1),
      maintAt(maintBox(3.6, 0.46, 0.08, 0x1d4ed8), 5.2, 0.65, -0.32)
    );
    g.add(benchGroup);
    L.push(maintTag('🪑 ที่นั่ง', V(5.2, 1.25, 0.1), 'room', null, 'ม้านั่งพักคอยสำหรับผู้มารับบริการ'));

    g.add(
      maintAt(maintBox(0.75, 0.74, 1.4, 0xd97706), 3.8, 0.37, 4.5),
      maintAt(maintBox(0.8, 0.06, 1.46, 0xfef3c7), 3.8, 0.76, 4.5),
      maintAt(maintBox(0.46, 0.45, 0.46, 0x334155), 3.25, 0.23, 4.5)
    );
    L.push(maintTag('🪑 โต๊ะ', V(3.8, 1.25, 4.5), 'sub', null, 'โต๊ะทำงานและตรวจเช็กสต็อกยา'));

    [-0.6, 1.0, 2.6].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.2, 0.74, 0.75, 0xd97706), tx, 0.37, 6.8),
        maintAt(maintBox(1.26, 0.06, 0.8, 0xfef3c7), tx, 0.76, 6.8),
        maintAt(maintBox(0.46, 0.45, 0.46, 0x334155), tx, 0.23, 6.35)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, 6.8), 'sub', null, `โต๊ะปฏิบัติงานเภสัชกรรม ตัวที่ ${idx + 4}`));
    });

    const staffRoom = new THREE.Group();
    staffRoom.add(
      maintAt(maintBox(0.85, 0.42, 2.2, 0x0284c7), 11.2, 0.21, 5.2),
      maintAt(maintBox(0.12, 0.52, 2.2, 0x0369a1), 11.65, 0.62, 5.2),
      maintAt(maintBox(0.85, 0.52, 0.12, 0x0369a1), 11.2, 0.62, 4.1),
      maintAt(maintBox(0.85, 0.52, 0.12, 0x0369a1), 11.2, 0.62, 6.3),
      maintAt(maintBox(0.65, 0.38, 1.1, 0xfef3c7), 10.35, 0.19, 5.2),
      maintAt(maintBox(0.65, 0.86, 1.6, 0x475569), 10.65, 0.43, 0.1),
      maintAt(maintBox(0.7, 0.06, 1.65, 0xf8fafc), 10.65, 0.88, 0.1),
      maintAt(maintBox(0.35, 0.48, 0.35, 0x38bdf8), 10.65, 1.15, -0.4),
      maintAt(maintBox(0.42, 0.28, 0.38, 0x0f172a), 10.65, 1.05, 0.5),
      maintAt(maintBox(0.6, 1.95, 1.5, 0x1e293b), 11.45, 0.98, 2.4)
    );
    g.add(staffRoom);
    L.push(maintTag('🛋️ ห้องพักเจ้าหน้าที่', V(10.75, 1.85, 4.8), 'room', null, 'ห้องพักผ่อนและรับประทานอาหารสำหรับเจ้าหน้าที่ห้องยา'));

    const items = [
      [
        '💊',
        'โซนจ่ายยา (โต๊ะคอมจ่ายยา 1–4 หันหน้าซ้าย • โต๊ะจัดยา • ชั้นวางยา)',
        pharmacyState.dispensingOpen ? '🟢 เปิดบริการจ่ายยา' : '🔴 พักบริการ',
        'pharmacy-dispense',
        pharmacyState.dispensingOpen ? 'free' : 'busy'
      ],
      [
        '📦',
        'คลังยาห้องใหญ่ & คลังยาห้องกลาง',
        pharmacyState.mainStoreOpen ? '🟢 พร้อมเบิกจ่าย' : '🔴 ปิดตรวจนับ',
        'pharmacy-main-store',
        pharmacyState.mainStoreOpen ? 'free' : 'busy'
      ],
      [
        '🧊',
        'คลังน้ำเกลือ + ตู้แช่ยา (2–8°C)',
        pharmacyState.coldStoreActive ? '🟢 พร้อมใช้งาน' : '🔴 แจ้งเตือน',
        'pharmacy-cold-store',
        pharmacyState.coldStoreActive ? 'free' : 'busy'
      ],
      ['🖥️', 'PC-PHAR-01: โต๊ะคอมจ่ายยา 1 (หันซ้ายเข้าช่องจ่ายยา 1)', 'ดูสเปก', null, 'free', pcSpec1],
      ['🖥️', 'PC-PHAR-02: โต๊ะคอมจ่ายยา 2 (หันซ้ายเข้าช่องจ่ายยา 2)', 'ดูสเปก', null, 'free', pcSpec2],
      ['🖥️', 'PC-PHAR-03: โต๊ะคอมจ่ายยา 3 (หันซ้ายเข้าช่องจ่ายยา 3)', 'ดูสเปก', null, 'free', pcSpec3],
      ['🖥️', 'PC-PHAR-04: โต๊ะคอมจ่ายยา 4 (หันซ้ายเข้าช่องจ่ายยา 4)', 'ดูสเปก', null, 'free', pcSpec4],
      ['🖥️', 'PC-PHAR-05: โต๊ะคอมจ่ายยา 5 (หันเข้ากำแพงล่าง)', 'ดูสเปก', null, 'free', pcSpec5],
      ['🖥️', 'PC-PHAR-06: โต๊ะคอมจ่ายยา 6 (หันเข้ากำแพงล่าง)', 'ดูสเปก', null, 'free', pcSpec6],
      ['🖥️', 'PC-PHAR-07: โต๊ะคอมจ่ายยา 7 (หันเข้ากำแพงล่าง)', 'ดูสเปก', null, 'free', pcSpec7],
      ['🪟', 'ช่องจ่ายยาผู้ป่วยนอก 1–4', '4 ช่อง'],
      ['💊', 'โต๊ะจัดยาเกาะกลาง & ชั้นวางยา', '4 จุด'],
      ['🛋️', 'ห้องพักเจ้าหน้าที่ (โซฟา • ล็อกเกอร์ • ไมโครเวฟ)', 'พร้อมใช้งาน'],
      ['🪑', 'โต๊ะทำงานและที่นั่งพักคอย', '8 จุด'],
      ['🚪', 'ประตูทางเข้า-ออกและเชื่อมโซน', '8 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 26,
      title: '💊 ผังภายในห้องยา: โซนจ่ายยา (คอม 1–4 หันซ้าย) • คลังยา • คลังน้ำเกลือ • คอม 5–7 • ห้องพักเจ้าหน้าที่',
      sub: 'คลิกป้ายสถานะเพื่อสลับเปิด/พักบริการ • คลิกป้าย "🖥️ โต๊ะคอมจ่ายยา 1–7" เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 24.5, 20.5), target: V(0, 0, 0.4) }
    };
  }

  function togglePharmacyStatus(id) {
    if (id === 'pharmacy-dispense') {
      pharmacyState.dispensingOpen = !pharmacyState.dispensingOpen;
      return true;
    }
    if (id === 'pharmacy-main-store') {
      pharmacyState.mainStoreOpen = !pharmacyState.mainStoreOpen;
      return true;
    }
    if (id === 'pharmacy-cold-store') {
      pharmacyState.coldStoreActive = !pharmacyState.coldStoreActive;
      return true;
    }
    return false;
  }

  K.Interiors.register('pharmacy', buildPharmacyInterior, togglePharmacyStatus);
})();
