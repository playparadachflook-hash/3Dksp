/* =========================================================================
 * แพทย์แผนไทย (Thai Traditional Medicine - ห้องนวด 12 เตียง • ห้องซาวน่า • ห้องทำงาน • โถงทางเข้า • ห้องน้ำ)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  const thaimedState = {
    beds: Array.from({ length: 12 }, (_, i) => ({
      id: `thaimed-bed-${i + 1}`,
      name: `เตียงนวด ${i + 1}`,
      occupied: false
    })),
    saunaActive: true
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

  function buildThaimedInterior() {
    const g = new THREE.Group();
    const L = [];

    const WH = 2.4;
    const wThick = 0.18;

    // 1. พื้นแต่ละโซนตามผัง
    floor(g, 6.4, 3.0, '#fefce8', '#cbd5e1', 0.6, 0, 7.5);
    floor(g, 4.0, 11.8, '#f8fafc', '#cbd5e1', 0.6, 0, 0.1);
    floor(g, 4.0, 2.2, '#e0f2fe', '#93c5fd', 0.6, 0, -6.9);
    floor(g, 8.0, 7.0, '#fffbeb', '#fef3c7', 0.6, -6.0, -4.5);
    floor(g, 8.0, 7.0, '#f0fdf4', '#bbf7d0', 0.6, -6.0, 2.5);
    floor(g, 8.0, 7.0, '#fefce8', '#fef08a', 0.6, 6.0, -4.5);
    floor(g, 8.0, 7.0, '#f8fafc', '#cbd5e1', 0.6, 6.0, 2.5);

    // 2. ฟังก์ชันสร้างประตูไม้แผนไทย
    function makeThaimedDoor(x, z, w, d, rotY = 0) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const isHoriz = w >= d;
      const pad = maintBox(w, 0.04, d, 0xe2e8f0);
      pad.position.set(0, 0.02, 0);
      dg.add(pad);
      const leafW = isHoriz ? w * 0.82 : 0.07;
      const leafD = isHoriz ? 0.07 : d * 0.82;
      const leaf = maintBox(leafW, 1.95, leafD, 0xd97706);
      leaf.position.set(0, 0.98, 0);
      leaf.rotation.y = rotY;
      dg.add(leaf);
      g.add(dg);
    }

    // 3. กำแพงรอบนอกอาคาร
    g.add(maintAt(maintWall(20.0, WH, wThick, 0x1e293b), 0, WH / 2, -7.91));
    g.add(maintAt(maintWall(wThick, WH, 14.0, 0x1e293b), -9.91, WH / 2, -1.0));
    g.add(maintAt(maintWall(wThick, WH, 14.0, 0x1e293b), 9.91, WH / 2, -1.0));

    g.add(maintAt(maintWall(6.8, WH, wThick, 0x1e293b), -6.6, WH / 2, 5.91));
    g.add(maintAt(maintWall(6.8, WH, wThick, 0x1e293b), 6.6, WH / 2, 5.91));

    g.add(
      maintAt(maintWall(2.0, 0.35, wThick, 0x1e293b), -2.2, WH - 0.175, 5.91),
      maintAt(maintWall(2.0, 0.35, wThick, 0x1e293b), 2.2, WH - 0.175, 5.91)
    );
    makeThaimedDoor(0, 5.91, 2.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตูทางเข้าหลัก', V(0, 1.45, 5.91), 'room', null, 'ประตูทางเข้าหลักอาคารแพทย์แผนไทย'));

    g.add(maintAt(maintWall(wThick, WH, 3.0, 0x1e293b), -3.2, WH / 2, 7.5));
    g.add(maintAt(maintWall(wThick, WH, 3.0, 0x1e293b), 3.2, WH / 2, 7.5));
    g.add(
      maintAt(maintWall(2.0, WH, wThick, 0x1e293b), -2.2, WH / 2, 8.91),
      maintAt(maintWall(2.4, 0.45, wThick, 0x1e293b), 0, WH - 0.225, 8.91),
      maintAt(maintWall(2.0, WH, wThick, 0x1e293b), 2.2, WH / 2, 8.91)
    );

    g.add(
      maintAt(maintBox(0.65, 0.44, 2.2, 0x0284c7), -2.6, 0.22, 7.5),
      maintAt(maintBox(0.08, 0.46, 2.2, 0x0369a1), -2.95, 0.65, 7.5),
      maintAt(maintBox(0.65, 0.44, 2.2, 0x0284c7), 2.6, 0.22, 7.5),
      maintAt(maintBox(0.08, 0.46, 2.2, 0x0369a1), 2.95, 0.65, 7.5)
    );
    L.push(maintTag('🪑 ที่นั่ง', V(-2.6, 1.15, 7.5), 'sub', null, 'ม้านั่งพักคอยสำหรับผู้มารับบริการ (ฝั่งซ้าย)'));
    L.push(maintTag('🪑 ที่นั่ง', V(2.6, 1.15, 7.5), 'sub', null, 'ม้านั่งพักคอยสำหรับผู้มารับบริการ (ฝั่งขวา)'));
    L.push(maintTag('🏛️ โถงทางเข้า', V(0, 1.35, 7.5), 'room', null, 'โถงทางเข้าและจุดพักคอยด้านหน้าอาคาร'));

    // 4. กำแพงกั้นห้องภายใน
    g.add(maintAt(maintWall(8.0, WH, wThick, 0x1e293b), -6.0, WH / 2, -1.0));
    g.add(maintAt(maintWall(8.0, WH, wThick, 0x1e293b), 6.0, WH / 2, -1.0));

    g.add(
      maintAt(maintWall(wThick, WH, 3.1, 0x1e293b), -2.0, WH / 2, -4.25),
      maintAt(maintWall(wThick, 0.35, 1.4, 0x1e293b), -2.0, WH - 0.175, -2.0),
      maintAt(maintWall(wThick, WH, 3.1, 0x1e293b), -2.0, WH / 2, 0.25),
      maintAt(maintWall(wThick, 0.35, 1.4, 0x1e293b), -2.0, WH - 0.175, 2.5),
      maintAt(maintWall(wThick, WH, 2.8, 0x1e293b), -2.0, WH / 2, 4.6)
    );
    makeThaimedDoor(-2.0, -2.0, 0.45, 1.4, 0.35);
    L.push(maintTag('🚪 ประตู', V(-2.0, 1.45, -2.0), 'sub', null, 'ประตูเข้าห้องเก็บอุปกรณ์'));
    makeThaimedDoor(-2.0, 2.5, 0.45, 1.4, 0.35);
    L.push(maintTag('🚪 ประตู', V(-2.0, 1.45, 2.5), 'sub', null, 'ประตูเข้าห้องนวดแผนไทย'));

    g.add(
      maintAt(maintWall(wThick, WH, 3.1, 0x1e293b), 2.0, WH / 2, -4.25),
      maintAt(maintWall(wThick, 0.35, 1.4, 0x1e293b), 2.0, WH - 0.175, -2.0),
      maintAt(maintWall(wThick, WH, 3.1, 0x1e293b), 2.0, WH / 2, 0.25),
      maintAt(maintWall(wThick, 0.35, 1.4, 0x1e293b), 2.0, WH - 0.175, 2.5),
      maintAt(maintWall(wThick, WH, 2.8, 0x1e293b), 2.0, WH / 2, 4.6)
    );
    makeThaimedDoor(2.0, -2.0, 0.45, 1.4, -0.35);
    L.push(maintTag('🚪 ประตู', V(2.0, 1.45, -2.0), 'sub', null, 'ประตูเข้าห้องเก็บอุปกรณ์ ห้องซาวน่า'));
    makeThaimedDoor(2.0, 2.5, 0.45, 1.4, -0.35);
    L.push(maintTag('🚪 ประตู', V(2.0, 1.45, 2.5), 'sub', null, 'ประตูเข้าห้องทำงานแพทย์แผนไทย'));

    g.add(
      maintAt(maintWall(1.3, WH, wThick, 0x1e293b), -1.35, WH / 2, -5.8),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 0, WH - 0.175, -5.8),
      maintAt(maintWall(1.3, WH, wThick, 0x1e293b), 1.35, WH / 2, -5.8),
      maintAt(maintWall(wThick, WH, 2.2, 0x475569), 0, WH / 2, -6.9)
    );
    makeThaimedDoor(0, -5.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚻 ห้องน้ำชายและหญิง', V(0, 1.55, -5.8), 'room', null, 'ห้องน้ำชายและหญิงสำหรับผู้มารับบริการและเจ้าหน้าที่'));

    g.add(
      maintAt(maintBox(0.7, 0.82, 0.5, 0xf1f5f9), -0.9, 0.41, -6.1),
      maintAt(maintBox(0.7, 0.82, 0.5, 0xf1f5f9), 0.9, 0.41, -6.1),
      maintAt(maintBox(0.45, 0.72, 0.65, 0xffffff), -1.0, 0.36, -7.4),
      maintAt(maintBox(0.45, 0.72, 0.65, 0xffffff), 1.0, 0.36, -7.4)
    );

    // 5. ห้องนวดแผนไทย (เตียงนวด 12 เตียง)
    function makeMassageBed(x, z, num, bedId, isOccupied) {
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);

      const padCol = isOccupied ? 0xe11d48 : 0x15803d;
      const padTop = isOccupied ? 0xf43f5e : 0xca8a04;

      bg.add(
        maintAt(maintBox(1.15, 0.38, 2.05, 0x78350f), 0, 0.19, 0),
        maintAt(maintBox(1.05, 0.14, 1.95, padCol), 0, 0.45, 0),
        maintAt(maintBox(0.45, 0.15, 0.28, padTop), 0, 0.58, -0.75),
        maintAt(maintBox(0.65, 0.04, 0.45, 0xfef08a), 0, 0.54, 0.55),
        maintAt(maintBox(0.24, 0.18, 0.24, 0x94a3b8), 0.72, 0.15, -0.6),
        maintAt(maintBox(0.12, 0.12, 0.12, 0xfef3c7), 0.72, 0.30, -0.6)
      );

      if (isOccupied) {
        const patient = makePerson({ role: 'patient', shirtColor: 0x9333ea, pose: 'sit', rotY: 0 });
        patient.position.set(0, 0.25, 0);
        bg.add(patient);

        const masseur = makePerson({ role: 'doctor', shirtColor: 0xca8a04, pose: 'sit', rotY: Math.PI / 2 });
        masseur.position.set(-0.65, 0, 0);
        bg.add(masseur);
      }

      g.add(bg);

      L.push(
        maintTag(
          `🛏️ เตียงนวด ${num} (${isOccupied ? '🔴 กำลังนวดรักษา' : '🟢 ว่าง พร้อมใช้'})`,
          V(x, 1.35, z),
          'room ' + (isOccupied ? 'busy' : 'free'),
          bedId,
          `คลิกเพื่อสลับสถานะเตียงนวด ${num}`
        )
      );
    }

    const bedXs = [-9.2, -7.9, -6.6, -5.3, -4.0, -2.8];
    bedXs.forEach((bx, idx) => {
      const num = idx + 1;
      const bState = thaimedState.beds.find((b) => b.id === `thaimed-bed-${num}`);
      makeMassageBed(bx, 0.5, num, `thaimed-bed-${num}`, bState ? bState.occupied : false);
    });
    bedXs.forEach((bx, idx) => {
      const num = idx + 7;
      const bState = thaimedState.beds.find((b) => b.id === `thaimed-bed-${num}`);
      makeMassageBed(bx, 4.2, num, `thaimed-bed-${num}`, bState ? bState.occupied : false);
    });

    L.push(maintTag('🌿 ห้องนวดแผนไทย (12 เตียง)', V(-6.0, 1.85, 2.3), 'sub', null, 'ห้องนวดแผนไทย นวดประคบสมุนไพร และนวดแก้อาการ'));

    // 6. ห้องเก็บอุปกรณ์ (ฝั่งซ้ายบน)
    const storeLeft = new THREE.Group();
    const shelfL1 = makeStorageShelf(4.5, 0.65, 2.05, 0x15803d);
    shelfL1.position.set(-6.5, 0, -7.5);
    storeLeft.add(shelfL1);

    const shelfL2 = makeStorageShelf(3.8, 0.65, 2.05, 0xd97706);
    shelfL2.rotation.y = Math.PI / 2;
    shelfL2.position.set(-9.4, 0, -4.5);
    storeLeft.add(shelfL2);

    storeLeft.add(
      maintAt(maintBox(2.2, 0.82, 1.0, 0x334155), -4.5, 0.41, -4.5),
      maintAt(maintBox(2.26, 0.06, 1.06, 0xf8fafc), -4.5, 0.85, -4.5),
      maintAt(maintBox(0.45, 0.35, 0.45, 0x94a3b8), -5.0, 1.05, -4.5),
      maintAt(maintBox(0.35, 0.18, 0.35, 0x78350f), -4.0, 0.96, -4.5)
    );
    g.add(storeLeft);
    L.push(maintTag('📦 ห้องเก็บอุปกรณ์', V(-6.0, 1.85, -4.5), 'room', null, 'ห้องจัดเก็บสมุนไพรแห้ง ลูกประคบ น้ำมันนวด และเวชภัณฑ์แผนไทย'));

    // 7. ห้องเก็บอุปกรณ์ ห้องซาวน่า (ฝั่งขวาบน)
    const saunaGroup = new THREE.Group();
    saunaGroup.add(
      maintAt(maintBox(4.5, 2.2, 3.5, 0xb45309), 6.8, 1.1, -4.5),
      maintAt(maintBox(4.56, 0.12, 3.56, 0x78350f), 6.8, 2.26, -4.5),
      maintAt(
        new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 1.2, 1.4),
          new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.65,
            roughness: 0.2
          })
        ),
        4.52,
        1.25,
        -4.5
      ),
      maintAt(maintBox(0.55, 0.85, 0.55, 0x1e293b), 8.5, 0.425, -5.6),
      maintAt(maintBox(0.35, 0.45, 0.35, 0xd97706), 8.5, 0.85, -5.6),
      maintAt(maintBox(3.4, 0.44, 0.65, 0xd97706), 6.8, 0.22, -3.4),
      maintAt(maintBox(3.4, 0.44, 0.65, 0xd97706), 6.8, 0.66, -5.6)
    );

    const shelfSauna = makeStorageShelf(3.2, 0.65, 2.05, 0xd97706);
    shelfSauna.rotation.y = Math.PI / 2;
    shelfSauna.position.set(2.6, 0, -4.5);
    saunaGroup.add(shelfSauna);

    g.add(saunaGroup);
    L.push(
      maintTag(
        `🧖 ห้องซาวน่า/อบสมุนไพร (${thaimedState.saunaActive ? '🟢 พร้อมใช้งาน 42°C' : '🔴 พักการใช้งาน'})`,
        V(6.8, 2.05, -4.5),
        'room ' + (thaimedState.saunaActive ? 'free' : 'busy'),
        'thaimed-sauna',
        'คลิกเพื่อสลับสถานะห้องอบสมุนไพรและซาวน่า'
      )
    );
    L.push(maintTag('📦 ห้องเก็บอุปกรณ์', V(3.5, 1.85, -4.5), 'sub', null, 'จุดเก็บผ้าสะอาดและครุภัณฑ์ห้องซาวน่า'));

    // 8. ห้องทำงานแพทย์แผนไทย (ฝั่งขวาล่าง)
    function makeThaiPcSpec(code, name, roleDesc, ip) {
      return {
        code,
        name,
        role: roleDesc,
        user: 'แพทย์แผนไทย / นักวิชาการสาธารณสุข โรงพยาบาลโคกศรีสุพรรณ',
        os: 'Windows 11 Pro 64-bit',
        cpu: 'Intel Core i5-12400 (6C/12T @ 4.4GHz)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'SSD NVMe 512 GB',
        monitor: '24" FHD IPS Display',
        ip: `192.168.16.${ip}`,
        software: 'ระบบแพทย์แผนไทย HOSxP Traditional Thai Medicine • บันทึกเวชระเบียนธาตุเจ้าเรือน • ระบบคลังยาสมุนไพร • e-Prescription',
        peripherals: 'เครื่องอ่าน Smart Card • เครื่องพิมพ์ใบสั่งยาสมุนไพร • เครื่องสแกนบาร์โค้ด • เครื่องสำรองไฟ UPS 1000VA',
        status: '🟢 ออนไลน์ปกติ'
      };
    }

    function createThaiPcDesk(x, z, rotY, spec, labelText, personOpts = null) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      dg.add(
        maintAt(maintBox(1.25, 0.74, 0.75, 0x78350f), 0, 0.37, 0),
        maintAt(maintBox(1.30, 0.06, 0.80, 0xfef3c7), 0, 0.76, 0),
        maintAt(maintBox(0.58, 0.36, 0.05, 0x0f172a), 0, 1.02, -0.22),
        maintAt(maintBox(0.52, 0.30, 0.02, 0x10b981), 0, 1.02, -0.19),
        maintAt(maintBox(0.14, 0.12, 0.12, 0x475569), 0, 0.82, -0.22),
        maintAt(maintBox(0.38, 0.02, 0.14, 0x1e293b), 0, 0.79, 0.12),
        maintAt(maintBox(0.08, 0.02, 0.06, 0x334155), 0.28, 0.79, 0.12),
        maintAt(maintBox(0.22, 0.42, 0.44, 0x1e293b), 0.45, 0.98, -0.08),
        maintAt(maintBox(0.18, 0.08, 0.20, 0x0284c7), -0.45, 0.82, -0.05),
        maintAt(maintBox(0.46, 0.45, 0.46, 0x0284c7), 0, 0.23, 0.62),
        maintAt(maintBox(0.44, 0.48, 0.08, 0x0369a1), 0, 0.65, 0.82)
      );

      dg.traverse((child) => {
        if (child.isMesh) child.userData.pcInfo = spec;
      });
      g.add(dg);

      if (personOpts) {
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

    g.add(
      maintAt(maintWall(wThick, WH, 2.2, 0x1e293b), 5.2, WH / 2, 0.1),
      maintAt(maintWall(1.8, WH, wThick, 0x1e293b), 4.3, WH / 2, 1.2)
    );
    const pcSpec1 = (K.THAIMED_SPECS && K.THAIMED_SPECS['44:8A:5B:91:D2:13']) || {
      code: 'PC-THAI-01',
      name: 'โต๊ะคอมแพทย์แผนไทย 1',
      hostname: 'PAN21',
      ip: '10.10.20.13',
      mac: '44:8A:5B:91:D2:13',
      switchId: 'cisco-sg250',
      switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
      switchPort: 'Port GE11 (VLAN 20)',
      wallOutlet: 'THAI-MED-01 (เต้ารับ LAN ผนังห้องทำงานแพทย์แผนไทย)',
      vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
      role: 'ตรวจวินิจฉัยธาตุเจ้าเรือน แมะจับชีพจร บันทึกเวชระเบียน และสั่งการรักษาทางหัตถการ',
      user: 'นางสาวรัตติยากร สมอดง (แพทย์แผนไทย)',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T @ 4.4GHz)',
      ram: '16 GB DDR4 3200MHz',
      storage: 'SSD NVMe 512 GB',
      monitor: '24" FHD IPS Display',
      software: 'ระบบแพทย์แผนไทย HOSxP Traditional Thai Medicine, บันทึกเวชระเบียนธาตุเจ้าเรือน, ระบบคลังยาสมุนไพร, e-Prescription',
      peripherals: 'เครื่องอ่าน Smart Card, เครื่องพิมพ์ใบสั่งยาสมุนไพร, เครื่องสแกนบาร์โค้ด, เครื่องสำรองไฟ UPS 1000VA',
      status: '🟢 ออนไลน์ปกติ'
    };
    createThaiPcDesk(3.6, 0.0, 0, pcSpec1, 'โต๊ะคอม แพทย์แผนไทย 1 (PAN21)', { role: 'doctor', shirtColor: 0x15803d, pose: 'sit', rotY: 0 });

    const pcSpec2 = makeThaiPcSpec('PC-THAI-02', 'โต๊ะคอมแพทย์แผนไทย 2', 'จ่ายยาสมุนไพร บันทึกผลการรักษา และนัดหมายผู้ป่วย', 11);
    createThaiPcDesk(9.4, 2.0, -Math.PI / 2, pcSpec2, 'โต๊ะคอม แพทย์แผนไทย 2', { role: 'nurse', shirtColor: 0xca8a04, pose: 'sit', rotY: 0 });

    [3.0, 4.8, 6.6, 8.4].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.35, 0.74, 0.75, 0x78350f), tx, 0.37, 4.8),
        maintAt(maintBox(1.40, 0.06, 0.80, 0xfef3c7), tx, 0.76, 4.8),
        maintAt(maintBox(0.44, 0.44, 0.44, 0x0284c7), tx, 0.22, 4.2),
        maintAt(maintBox(0.40, 0.42, 0.08, 0x0369a1), tx, 0.62, 4.0)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, 4.8), 'sub', null, `โต๊ะปฏิบัติงานแพทย์แผนไทย ตัวที่ ${idx + 1}`));
    });

    [5.4, 7.4].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.35, 0.74, 0.75, 0x78350f), tx, 0.37, 2.0),
        maintAt(maintBox(1.40, 0.06, 0.80, 0xfef3c7), tx, 0.76, 2.0),
        maintAt(maintBox(0.44, 0.44, 0.44, 0x059669), tx, 0.22, 1.4),
        maintAt(maintBox(0.40, 0.42, 0.08, 0x047857), tx, 0.62, 1.2)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, 2.0), 'sub', null, `โต๊ะปฏิบัติงานแพทย์แผนไทย ตัวที่ ${idx + 5}`));
    });

    L.push(maintTag('📋 ห้องทำงานแพทย์แผนไทย', V(6.0, 1.85, 2.5), 'room', null, 'ห้องปฏิบัติงานแพทย์แผนไทย จุดตรวจวินิจฉัย และจ่ายยาสมุนไพร'));

    const items = [
      ['🌿', 'ห้องนวดแผนไทย (เตียงนวด 1–12 • ประคบสมุนไพร)', '12 เตียง', null, 'free'],
      ['🧖', 'ห้องซาวน่า / อบสมุนไพรไม้สน (42°C)', thaimedState.saunaActive ? '🟢 พร้อมใช้งาน' : '🔴 พักการใช้งาน', 'thaimed-sauna', thaimedState.saunaActive ? 'free' : 'busy'],
      ['📋', 'ห้องทำงานแพทย์แผนไทย (โต๊ะคอม 1–2 • โต๊ะทำงาน 6 ตัว)', 'พร้อมใช้งาน', null, 'free'],
      ['📦', 'ห้องเก็บอุปกรณ์สมุนไพร (ซ้ายบน) & ห้องเก็บของ (ขวาบน)', '2 ห้อง', null, 'free'],
      ['🚻', 'ห้องน้ำชายและหญิง (โถงบน)', 'พร้อมใช้งาน', null, 'free'],
      ['🏛️', 'โถงทางเข้าด้านหน้า & ม้านั่งพักคอย', '2 ม้านั่ง', null, 'free'],
      ['🖥️', 'PC-THAI-01: โต๊ะคอมแพทย์แผนไทย 1 (PAN21: 10.10.20.13)', 'ดูสเปก', null, 'free', pcSpec1],
      ['🖥️', 'PC-THAI-02: โต๊ะคอมแพทย์แผนไทย 2 (จ่ายยาสมุนไพร)', 'ดูสเปก', null, 'free', pcSpec2],
      ['🪑', 'โต๊ะทำงานแพทย์แผนไทย', '6 ตัว'],
      ['🚪', 'ประตูทางเข้าหลักและประตูห้องภายใน', '7 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 26,
      title: '🌿 ผังภายในแพทย์แผนไทย: ห้องนวด 12 เตียง • ห้องซาวน่า • ห้องทำงาน • โถงทางเข้า • ห้องน้ำ',
      sub: 'คลิกเตียงนวดเพื่อสลับสถานะกำลังรักษา • คลิกป้าย "🖥️ โต๊ะคอม" เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 24.5, 20.0), target: V(0, 0, 0.5) }
    };
  }

  function toggleThaimedStatus(id) {
    if (id.startsWith('thaimed-bed-')) {
      const bed = thaimedState.beds.find((b) => b.id === id);
      if (bed) {
        bed.occupied = !bed.occupied;
        return true;
      }
    }
    if (id === 'thaimed-sauna') {
      thaimedState.saunaActive = !thaimedState.saunaActive;
      return true;
    }
    return false;
  }

  K.Interiors.register('thaimed', buildThaimedInterior, toggleThaimedStatus);
})();
