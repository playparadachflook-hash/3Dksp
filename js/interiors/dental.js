/* =========================================================================
 * ทันตกรรม (Dental Clinic - ห้องตรวจ 1–4 • ห้อง X-ray ฟัน • ห้องพักเจ้าหน้าที่+ห้องประชุม • ห้องเก็บอุปกรณ์)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  const dentalState = {
    rooms: [
      { id: 'dental-room-1', name: 'ห้องตรวจทันตกรรม 1', occupied: false },
      { id: 'dental-room-2', name: 'ห้องตรวจทันตกรรม 2', occupied: false },
      { id: 'dental-room-3', name: 'ห้องตรวจทันตกรรม 3', occupied: false },
      { id: 'dental-room-4', name: 'ห้องตรวจทันตกรรม 4', occupied: false }
    ],
    xrayActive: false,
    staffRoomOccupied: false
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

  function buildDentalInterior() {
    const g = new THREE.Group();
    const L = [];

    const W = 20.0, D = 20.0;
    const WH = 2.4;
    const wThick = 0.18;
    const xMin = -W / 2;
    const xMax = W / 2;
    const zMin = -D / 2;
    const zMax = D / 2;

    // 1. พื้นแต่ละโซนตามผัง
    floor(g, 12.4, 3.2, '#f8fafc', '#cbd5e1', 0.6, -3.8, -8.4);
    floor(g, 7.6, 3.2, '#fefce8', '#cbd5e1', 0.6, 6.2, -8.4);
    floor(g, 20.0, 6.0, '#f0fdf4', '#bbf7d0', 0.6, 0, -3.8);
    floor(g, 5.4, 3.2, '#e0f2fe', '#93c5fd', 0.6, 7.3, -0.4);
    floor(g, 4.2, 5.6, '#f8fafc', '#cbd5e1', 0.6, -7.9, 2.0);
    floor(g, 7.1, 4.0, '#ecfeff', '#a5f3fc', 0.6, 0.05, 1.2);
    floor(g, 6.4, 3.6, '#f8fafc', '#cbd5e1', 0.6, 6.8, 3.0);
    floor(g, 6.6, 5.2, '#ecfeff', '#a5f3fc', 0.6, -6.7, 7.4);
    floor(g, 6.8, 5.2, '#f0fdfa', '#99f6e4', 0.6, 0.0, 7.4);
    floor(g, 6.6, 5.2, '#ecfeff', '#a5f3fc', 0.6, 6.7, 7.4);

    // 2. ฟังก์ชันสร้างประตูภายในกรอบ
    function makeDentalDoor(x, z, w, d, rotY = 0) {
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
    g.add(maintAt(maintWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zMin + wThick / 2));

    const zBtmW = zMax - wThick / 2;
    g.add(maintAt(maintWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zBtmW));

    const xLftW = xMin + wThick / 2;
    g.add(
      maintAt(maintWall(wThick, WH, 3.8, 0x1e293b), xLftW, WH / 2, -8.1),
      maintAt(maintWall(wThick, 0.35, 1.4, 0x1e293b), xLftW, WH - 0.175, -5.6),
      maintAt(maintWall(wThick, WH, 6.6, 0x1e293b), xLftW, WH / 2, -1.6),
      maintAt(maintWall(wThick, 0.35, 1.4, 0x1e293b), xLftW, WH - 0.175, 2.4),
      maintAt(maintWall(wThick, WH, 6.8, 0x1e293b), xLftW, WH / 2, 6.6)
    );
    makeDentalDoor(xLftW + 0.04, -5.6, 0.45, 1.4, 0.35);
    L.push(maintTag('🚪 ประตู', V(xLftW + 0.35, 1.45, -5.6), 'room', null, 'ประตูทางเข้าอาคารทันตกรรม (ฝั่งซ้ายบน)'));
    makeDentalDoor(xLftW + 0.04, 2.4, 0.45, 1.4, 0.35);
    L.push(maintTag('🚪 ประตู', V(xLftW + 0.35, 1.45, 2.4), 'room', null, 'ประตูทางเข้าอาคารทันตกรรม (ฝั่งซ้ายล่าง)'));

    const xRgtW = xMax - wThick / 2;
    g.add(
      maintAt(maintWall(wThick, WH, 3.8, 0x1e293b), xRgtW, WH / 2, -8.1),
      maintAt(maintWall(wThick, 0.35, 1.4, 0x1e293b), xRgtW, WH - 0.175, -5.6),
      maintAt(maintWall(wThick, WH, 14.8, 0x1e293b), xRgtW, WH / 2, 2.5)
    );
    makeDentalDoor(xRgtW - 0.04, -5.6, 0.45, 1.4, -0.35);
    L.push(maintTag('🚪 ประตู', V(xRgtW - 0.35, 1.45, -5.6), 'room', null, 'ประตูทางเข้าอาคารทันตกรรม (ฝั่งขวาบน)'));

    // 4. กำแพงกั้นห้องภายใน
    g.add(maintAt(maintWall(wThick, WH, 3.2, 0x1e293b), 2.4, WH / 2, -8.4));

    g.add(
      maintAt(maintWall(10.3, WH, wThick, 0x1e293b), -4.85, WH / 2, -6.8),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 1.0, WH - 0.175, -6.8),
      maintAt(maintWall(1.2, WH, wThick, 0x1e293b), 2.3, WH / 2, -6.8),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 3.6, WH - 0.175, -6.8),
      maintAt(maintWall(5.7, WH, wThick, 0x1e293b), 7.15, WH / 2, -6.8)
    );
    makeDentalDoor(1.0, -6.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(1.0, 1.45, -6.8), 'sub', null, 'ประตูห้องพักเจ้าหน้าที่+ห้องประชุม'));
    makeDentalDoor(3.6, -6.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(3.6, 1.45, -6.8), 'sub', null, 'ประตูห้องเก็บอุปกรณ์'));

    g.add(maintAt(maintWall(5.4, WH, wThick, 0x1e293b), 7.3, WH / 2, -2.0));
    g.add(maintAt(maintWall(wThick, WH, 3.2, 0x1e293b), 4.6, WH / 2, -0.4));
    g.add(
      maintAt(maintWall(1.1, WH, wThick, 0x1e293b), 5.15, WH / 2, 1.2),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 6.4, WH - 0.175, 1.2),
      maintAt(maintWall(2.9, WH, wThick, 0x1e293b), 8.55, WH / 2, 1.2)
    );
    makeDentalDoor(6.4, 1.2, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(6.4, 1.45, 1.2), 'sub', null, 'ประตูห้อง x-ray ฟัน'));

    g.add(maintAt(maintWall(7.1, WH, wThick, 0x1e293b), 0.05, WH / 2, -0.8));
    g.add(maintAt(maintWall(wThick, WH, 4.0, 0x1e293b), -3.5, WH / 2, 1.2));
    g.add(maintAt(maintWall(wThick, WH, 4.0, 0x1e293b), 3.6, WH / 2, 1.2));
    g.add(
      maintAt(maintWall(5.0, WH, wThick, 0x1e293b), -1.0, WH / 2, 3.2),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 2.2, WH - 0.175, 3.2),
      maintAt(maintWall(0.7, WH, wThick, 0x1e293b), 3.25, WH / 2, 3.2)
    );
    makeDentalDoor(2.2, 3.2, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(2.2, 1.45, 3.2), 'sub', null, 'ประตูห้องตรวจทันตกรรม 4'));

    g.add(maintAt(maintWall(6.5, WH, wThick, 0x1e293b), -6.75, WH / 2, -0.8));

    g.add(
      maintAt(maintWall(1.1, WH, wThick, 0x1e293b), -9.45, WH / 2, 4.8),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -8.2, WH - 0.175, 4.8),
      maintAt(maintWall(5.5, WH, wThick, 0x1e293b), -4.75, WH / 2, 4.8),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -2.0, WH - 0.175, 4.8),
      maintAt(maintWall(5.9, WH, wThick, 0x1e293b), 1.65, WH / 2, 4.8),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 4.6, WH - 0.175, 4.8),
      maintAt(maintWall(4.7, WH, wThick, 0x1e293b), 7.65, WH / 2, 4.8)
    );
    makeDentalDoor(-8.2, 4.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-8.2, 1.45, 4.8), 'sub', null, 'ประตูเข้าห้องตรวจทันตกรรม 1'));
    makeDentalDoor(-2.0, 4.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-2.0, 1.45, 4.8), 'sub', null, 'ประตูเข้าห้องตรวจทันตกรรม 2'));
    makeDentalDoor(4.6, 4.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(4.6, 1.45, 4.8), 'sub', null, 'ประตูเข้าห้องตรวจทันตกรรม 3'));

    g.add(maintAt(maintWall(wThick, WH, 5.2, 0x1e293b), -3.4, WH / 2, 7.4));
    g.add(maintAt(maintWall(wThick, WH, 5.2, 0x1e293b), 3.4, WH / 2, 7.4));

    // 5. สเปกคอมพิวเตอร์และฟังก์ชันสร้างโต๊ะคอมพิวเตอร์ทันตกรรม
    function makeDentalPcSpec(code, name, roleDesc, ip) {
      return {
        code,
        name,
        role: roleDesc,
        user: 'ทันตแพทย์ / เจ้าพนักงานทันตสาธารณสุข โรงพยาบาลโคกศรีสุพรรณ',
        os: 'Windows 11 Pro 64-bit',
        cpu: 'Intel Core i5-12400 (6C/12T @ 4.4GHz)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'SSD NVMe 512 GB',
        monitor: '24" FHD IPS Medical Display',
        ip: `192.168.15.${ip}`,
        software: 'ระบบทันตกรรม HOSxP Dental • โปรแกรม Dent3D Tooth Charting • โปรแกรมดูฟิล์มเอกซเรย์ฟัน Dental PACS & Panoramic Viewer • e-Prescription',
        peripherals: 'เซ็นเซอร์เอกซเรย์ในช่องปาก (Digital Intraoral Sensor) • เครื่องอ่านสมาร์ทการ์ด • เครื่องพิมพ์ฉลาก • เครื่องสำรองไฟ UPS 1000VA',
        status: '🟢 ออนไลน์ปกติ'
      };
    }

    function createDentalPcDesk(x, z, rotY, spec, labelText, personOpts = null) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      dg.add(
        maintAt(maintBox(1.25, 0.74, 0.75, 0x334155), 0, 0.37, 0),
        maintAt(maintBox(1.30, 0.06, 0.80, 0xf8fafc), 0, 0.76, 0),
        maintAt(maintBox(0.58, 0.36, 0.05, 0x0f172a), 0, 1.02, -0.22),
        maintAt(maintBox(0.52, 0.30, 0.02, 0x38bdf8), 0, 1.02, -0.19),
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

    const pcSpecHall = makeDentalPcSpec('PC-DEN-06', 'โต๊ะคอมทันตกรรม 1 (โถงเวชระเบียน)', 'ลงทะเบียนผู้ป่วย คัดกรองอาการช่องปาก และบันทึกนัดหมาย', 11);
    createDentalPcDesk(-9.4, -2.5, Math.PI / 2, pcSpecHall, 'โต๊ะคอมทันตกรรม 1 (โถง)', { role: 'nurse', shirtColor: 0x0284c7, pose: 'sit', rotY: 0 });

    const pcSpec4 = makeDentalPcSpec('PC-DEN-04', 'โต๊ะคอมทันตกรรม 4', 'บันทึกการรักษาทันตกรรม ห้องตรวจ 4 ตรวจภาพรังสีฟันดิจิทัล', 14);
    createDentalPcDesk(-2.6, 2.0, Math.PI / 2, pcSpec4, 'โต๊ะคอมทันตกรรม 4', { role: 'doctor', shirtColor: 0x0ea5e9, pose: 'sit', rotY: 0 });

    const pcSpec5 = makeDentalPcSpec('PC-DEN-05', 'โต๊ะคอมทันตกรรม 5', 'จุดวางแผนการรักษาทันตกรรมและให้คำปรึกษาการดูแลสุขภาพช่องปาก', 15);
    createDentalPcDesk(9.4, 3.2, -Math.PI / 2, pcSpec5, 'โต๊ะคอมทันตกรรม 5', { role: 'nurse', shirtColor: 0x10b981, pose: 'sit', rotY: 0 });

    const pcSpec1 = makeDentalPcSpec('PC-DEN-01', 'โต๊ะคอมทันตกรรม 1 (ห้องตรวจ 1)', 'บันทึกประวัติทันตกรรม การอุดฟัน ถอนฟัน และทันตกรรมหัตถการ', 12);
    createDentalPcDesk(-5.4, 5.25, 0, pcSpec1, 'โต๊ะคอมทันตกรรม 1', { role: 'doctor', shirtColor: 0x0284c7, pose: 'sit', rotY: 0 });

    const pcSpec2 = makeDentalPcSpec('PC-DEN-02', 'โต๊ะคอมทันตกรรม 2 (ห้องตรวจ 2)', 'บันทึกประวัติทันตกรรม งานขูดหินปูน และรักษารากฟัน', 13);
    createDentalPcDesk(1.0, 5.25, 0, pcSpec2, 'โต๊ะคอมทันตกรรม 2', { role: 'doctor', shirtColor: 0x059669, pose: 'sit', rotY: 0 });

    const pcSpec3 = makeDentalPcSpec('PC-DEN-03', 'โต๊ะคอมทันตกรรม 3 (ห้องตรวจ 3)', 'บันทึกประวัติทันตกรรม งานทันตกรรมประดิษฐ์และศัลยกรรมช่องปาก', 16);
    createDentalPcDesk(7.4, 5.25, 0, pcSpec3, 'โต๊ะคอมทันตกรรม 3', { role: 'doctor', shirtColor: 0x7c3aed, pose: 'sit', rotY: 0 });

    // 6. โมเดลยูนิตทำฟัน ประจำห้องตรวจ 1–4
    function makeDentalUnit(x, z, rotY, roomName, roomId, isOccupied) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      const uphCol = isOccupied ? 0xf43f5e : 0x06b6d4;
      const uphDark = isOccupied ? 0xe11d48 : 0x0891b2;

      dg.add(
        maintAt(maintBox(0.95, 0.12, 1.45, 0xe2e8f0), 0, 0.06, 0),
        maintAt(maintBox(0.38, 0.32, 0.48, 0x94a3b8), 0, 0.24, -0.05),
        maintAt(maintBox(0.70, 0.16, 0.85, uphCol), 0, 0.45, 0.12),
        maintAt(maintBox(0.64, 0.14, 0.82, uphDark), 0, 0.52, -0.45),
        maintAt(maintBox(0.34, 0.10, 0.28, uphDark), 0, 0.58, -0.92),
        maintAt(maintBox(0.08, 0.08, 0.65, 0x64748b), -0.38, 0.56, 0.08),
        maintAt(maintBox(0.08, 0.08, 0.65, 0x64748b), 0.38, 0.56, 0.08),
        maintAt(maintBox(0.24, 0.05, 0.22, 0x1e293b), 0.55, 0.025, 0.5),

        maintAt(maintBox(0.08, 1.65, 0.08, 0x94a3b8), -0.55, 0.85, -0.35),
        maintAt(maintBox(0.55, 0.08, 0.08, 0x94a3b8), -0.32, 1.68, -0.35),
        maintAt(maintBox(0.36, 0.14, 0.22, 0xf8fafc), -0.15, 1.65, -0.15),
        maintAt(maintBox(0.28, 0.04, 0.16, 0xfef08a), -0.15, 1.58, -0.15),

        maintAt(maintBox(0.06, 0.95, 0.06, 0x94a3b8), 0.55, 0.50, -0.15),
        maintAt(maintBox(0.58, 0.06, 0.42, 0xffffff), 0.62, 0.96, -0.05),
        maintAt(maintBox(0.48, 0.02, 0.32, 0x94a3b8), 0.62, 1.00, -0.05),
        maintAt(maintBox(0.04, 0.04, 0.28, 0x38bdf8), 0.48, 1.03, -0.05),
        maintAt(maintBox(0.04, 0.04, 0.28, 0x38bdf8), 0.56, 1.03, -0.05),
        maintAt(maintBox(0.04, 0.04, 0.24, 0xd1d5db), 0.64, 1.03, -0.05),

        maintAt(maintBox(0.28, 0.85, 0.28, 0xf1f5f9), -0.55, 0.44, 0.35),
        maintAt(maintBox(0.24, 0.12, 0.24, 0x38bdf8), -0.55, 0.90, 0.35),
        maintAt(maintBox(0.06, 0.22, 0.06, 0x94a3b8), -0.55, 1.02, 0.22),

        maintAt(maintBox(0.42, 0.42, 0.42, 0x0284c7), 0.82, 0.21, -0.65),
        maintAt(maintBox(0.38, 0.32, 0.08, 0x0369a1), 0.82, 0.58, -0.82),

        maintAt(maintBox(0.42, 0.46, 0.42, 0x059669), -0.85, 0.23, -0.55),
        maintAt(maintBox(0.38, 0.32, 0.08, 0x047857), -0.85, 0.60, -0.72)
      );

      if (isOccupied) {
        const patient = makePerson({ role: 'patient', shirtColor: 0x9333ea, pose: 'sit', rotY: 0 });
        patient.position.set(0, 0.22, 0.1);
        dg.add(patient);

        const dentist = makePerson({ role: 'doctor', shirtColor: 0x0284c7, pose: 'sit', rotY: -Math.PI / 4 });
        dentist.position.set(0.82, 0, -0.65);
        dg.add(dentist);

        const asst = makePerson({ role: 'nurse', shirtColor: 0x10b981, pose: 'stand', rotY: Math.PI / 3 });
        asst.position.set(-0.85, 0, -0.35);
        dg.add(asst);
      }

      g.add(dg);

      L.push(
        maintTag(
          `🦷 ${roomName} (${isOccupied ? '🔴 กำลังรักษาคนไข้' : '🟢 ว่าง พร้อมให้บริการ'})`,
          V(x, 1.85, z),
          'room ' + (isOccupied ? 'busy' : 'free'),
          roomId,
          `คลิกเพื่อสลับสถานะการครองเตียง/ห้องตรวจ ${roomName}`
        )
      );
    }

    const r1State = dentalState.rooms.find((r) => r.id === 'dental-room-1');
    makeDentalUnit(-6.7, 7.6, 0, 'ห้องตรวจทันตกรรม 1', 'dental-room-1', r1State ? r1State.occupied : false);

    const r2State = dentalState.rooms.find((r) => r.id === 'dental-room-2');
    makeDentalUnit(0.0, 7.6, 0, 'ห้องตรวจทันตกรรม 2', 'dental-room-2', r2State ? r2State.occupied : false);

    const r3State = dentalState.rooms.find((r) => r.id === 'dental-room-3');
    makeDentalUnit(6.7, 7.6, 0, 'ห้องตรวจทันตกรรม 3', 'dental-room-3', r3State ? r3State.occupied : false);

    const r4State = dentalState.rooms.find((r) => r.id === 'dental-room-4');
    makeDentalUnit(0.3, 1.0, 0, 'ห้องตรวจทันตกรรม 4', 'dental-room-4', r4State ? r4State.occupied : false);

    // 7. ห้อง x-ray ฟัน
    const xrayRoom = new THREE.Group();
    xrayRoom.add(
      maintAt(maintBox(0.35, 2.15, 0.35, 0xf1f5f9), 7.8, 1.08, -0.6),
      maintAt(maintBox(1.10, 0.08, 1.10, 0x64748b), 7.8, 0.04, -0.6),
      maintAt(maintBox(1.25, 0.22, 0.38, 0x0284c7), 7.8, 1.78, -0.6),
      maintAt(maintBox(0.24, 0.35, 0.24, 0x0369a1), 7.25, 1.60, -0.6),
      maintAt(maintBox(0.22, 0.35, 0.08, 0x38bdf8), 8.35, 1.60, -0.6),
      maintAt(maintBox(0.26, 0.06, 0.22, 0x94a3b8), 7.8, 1.35, -0.6),
      maintAt(maintBox(0.38, 0.04, 0.04, 0x64748b), 7.8, 1.25, -0.45),
      maintAt(maintBox(1.15, 0.85, 0.08, 0x475569), 5.6, 0.425, 0.2),
      maintAt(
        new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 0.85, 0.05),
          new THREE.MeshStandardMaterial({
            color: 0x93c5fd,
            transparent: true,
            opacity: 0.65,
            roughness: 0.1
          })
        ),
        5.6,
        1.25,
        0.2
      ),
      maintAt(maintBox(0.45, 1.45, 0.45, 0x334155), 9.2, 0.725, 0.5),
      maintAt(maintBox(0.48, 0.82, 0.12, 0x1d4ed8), 9.2, 0.95, 0.5)
    );
    g.add(xrayRoom);

    L.push(
      maintTag(
        `☢️ ห้อง x-ray ฟัน (${dentalState.xrayActive ? '🔴 กำลังถ่ายภาพรังสี' : '🟢 พร้อมใช้งาน Standby'})`,
        V(7.3, 1.95, -0.4),
        'room ' + (dentalState.xrayActive ? 'busy' : 'free'),
        'dental-xray',
        'คลิกเพื่อสลับสถานะเครื่องเอกซเรย์ฟัน'
      )
    );

    // 8. ห้องพักเจ้าหน้าที่+ห้องประชุม
    const staffMeetGroup = new THREE.Group();
    staffMeetGroup.add(
      maintAt(maintBox(3.4, 0.74, 1.3, 0x334155), -4.5, 0.37, -8.5),
      maintAt(maintBox(3.5, 0.06, 1.36, 0xf8fafc), -4.5, 0.76, -8.5),
      maintAt(maintBox(2.6, 1.15, 0.05, 0xffffff), -4.5, 1.65, -9.85),
      maintAt(maintBox(2.7, 1.25, 0.02, 0x0284c7), -4.5, 1.65, -9.87)
    );
    [-5.6, -4.5, -3.4].forEach((cx) => {
      staffMeetGroup.add(
        maintAt(maintBox(0.42, 0.44, 0.42, 0x0284c7), cx, 0.22, -9.35),
        maintAt(maintBox(0.40, 0.42, 0.08, 0x0369a1), cx, 0.62, -9.55),
        maintAt(maintBox(0.42, 0.44, 0.42, 0x0284c7), cx, 0.22, -7.65),
        maintAt(maintBox(0.40, 0.42, 0.08, 0x0369a1), cx, 0.62, -7.45)
      );
    });
    staffMeetGroup.add(
      maintAt(maintBox(2.2, 0.42, 0.85, 0x059669), -8.4, 0.21, -8.5),
      maintAt(maintBox(2.2, 0.52, 0.12, 0x047857), -8.4, 0.62, -8.9),
      maintAt(maintBox(1.1, 0.36, 0.65, 0xfef3c7), -8.4, 0.18, -7.6),
      maintAt(maintBox(1.6, 0.86, 0.65, 0x475569), -0.6, 0.43, -9.5),
      maintAt(maintBox(1.66, 0.06, 0.7, 0xf8fafc), -0.6, 0.88, -9.5),
      maintAt(maintBox(0.35, 0.46, 0.35, 0x38bdf8), -0.3, 1.15, -9.5),
      maintAt(maintBox(0.42, 0.28, 0.38, 0x0f172a), -0.9, 1.05, -9.5)
    );
    g.add(staffMeetGroup);
    L.push(maintTag('🛋️ ห้องพักเจ้าหน้าที่+ห้องประชุม', V(-3.8, 1.95, -8.4), 'room', 'dental-staff', 'ห้องพักผ่อนและห้องประชุมกลุ่มงานทันตกรรม'));

    // 9. ห้องเก็บอุปกรณ์
    const equipStoreGroup = new THREE.Group();
    const shelfRight1 = makeStorageShelf(2.8, 0.65, 2.05, 0x0284c7);
    shelfRight1.position.set(6.2, 0, -9.5);
    equipStoreGroup.add(shelfRight1);

    const shelfRight2 = makeStorageShelf(2.4, 0.65, 2.05, 0x059669);
    shelfRight2.rotation.y = Math.PI / 2;
    shelfRight2.position.set(9.4, 0, -8.2);
    equipStoreGroup.add(shelfRight2);

    equipStoreGroup.add(
      maintAt(maintBox(1.6, 0.84, 0.75, 0x94a3b8), 3.8, 0.42, -9.4),
      maintAt(maintBox(1.65, 0.06, 0.80, 0xe2e8f0), 3.8, 0.86, -9.4),
      maintAt(maintBox(0.55, 0.38, 0.52, 0x0284c7), 3.8, 1.08, -9.4),
      maintAt(maintBox(0.38, 0.28, 0.05, 0x38bdf8), 3.8, 1.08, -9.1)
    );
    g.add(equipStoreGroup);
    L.push(maintTag('📦 ห้องเก็บอุปกรณ์', V(6.2, 1.95, -8.4), 'room', null, 'ห้องเก็บวัสดุ ครุภัณฑ์ และเครื่องนึ่งฆ่าเชื้อทันตกรรม Autoclave'));

    // 10. ชั้นเก็บอุปกรณ์ทันตกรรม
    const dentalInstShelf = new THREE.Group();
    dentalInstShelf.add(
      maintAt(maintBox(0.65, 2.05, 3.8, 0x0284c7), -3.85, 1.025, 1.2),
      maintAt(
        new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 1.95, 3.65),
          new THREE.MeshStandardMaterial({
            color: 0xbae6fd,
            transparent: true,
            opacity: 0.55,
            roughness: 0.15
          })
        ),
        -4.18,
        1.025,
        1.2
      )
    );
    for (let sz = -0.2; sz <= 2.6; sz += 0.9) {
      dentalInstShelf.add(
        maintAt(maintBox(0.45, 0.08, 0.72, 0x94a3b8), -3.85, 0.65, sz),
        maintAt(maintBox(0.45, 0.08, 0.72, 0x38bdf8), -3.85, 1.25, sz),
        maintAt(maintBox(0.45, 0.08, 0.72, 0x10b981), -3.85, 1.75, sz)
      );
    }
    g.add(dentalInstShelf);
    L.push(maintTag('🗄️ ชั้นเก็บอุปกรณ์ทันตกรรม', V(-3.85, 2.25, 1.2), 'sub', null, 'ชั้นกระจกจัดเก็บหัวกรอฟัน คีมถอนฟัน และเครื่องมือปลอดเชื้อ'));

    // 11. โต๊ะเตรียมอุปกรณ์ทันตกรรม
    const prepGroup = new THREE.Group();
    prepGroup.add(
      maintAt(maintBox(3.2, 0.82, 1.1, 0x334155), 6.8, 0.41, -4.2),
      maintAt(maintBox(3.3, 0.06, 1.16, 0xf8fafc), 6.8, 0.85, -4.2),
      maintAt(maintBox(0.65, 0.10, 0.45, 0x94a3b8), 5.8, 0.93, -4.2),
      maintAt(maintBox(0.65, 0.10, 0.45, 0x38bdf8), 6.8, 0.93, -4.2),
      maintAt(maintBox(0.65, 0.10, 0.45, 0x10b981), 7.8, 0.93, -4.2),
      maintAt(maintBox(0.55, 0.28, 0.45, 0x0284c7), 8.8, 1.02, -4.2)
    );
    g.add(prepGroup);
    L.push(maintTag('🛠️ โต๊ะเตรียมอุปกรณ์ทันตกรรม', V(6.8, 1.35, -4.2), 'room', null, 'โต๊ะจัดเตรียมเครื่องมือทันตกรรม เซ็ตปลอดเชื้อ และล้างอัลตราโซนิก (โถงขวาบน)'));

    // 12. โต๊ะในโถงกลาง
    [-5.2, -1.2].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.5, 0.74, 0.85, 0x334155), tx, 0.37, -5.2),
        maintAt(maintBox(1.56, 0.06, 0.90, 0xf8fafc), tx, 0.76, -5.2),
        maintAt(maintBox(0.45, 0.44, 0.45, 0x0284c7), tx - 0.4, 0.22, -4.6),
        maintAt(maintBox(0.45, 0.44, 0.45, 0x0284c7), tx + 0.4, 0.22, -4.6)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, -5.2), 'sub', null, `โต๊ะให้คำปรึกษาและซักประวัติทันตกรรม แถว 1 ตัวที่ ${idx + 1}`));
    });

    [-5.2, -2.2].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.5, 0.74, 0.85, 0x334155), tx, 0.37, -3.2),
        maintAt(maintBox(1.56, 0.06, 0.90, 0xf8fafc), tx, 0.76, -3.2),
        maintAt(maintBox(0.45, 0.44, 0.45, 0x059669), tx - 0.4, 0.22, -2.6),
        maintAt(maintBox(0.45, 0.44, 0.45, 0x059669), tx + 0.4, 0.22, -2.6)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, -3.2), 'sub', null, `โต๊ะให้คำปรึกษาและซักประวัติทันตกรรม แถว 2 ตัวที่ ${idx + 1}`));
    });

    const pcSpec6 = makeDentalPcSpec(
      'PC-DEN-06',
      'โต๊ะคอมทันตกรรม 6',
      'จุดประสานงานการรักษา พิมพ์เอกสารใบส่งตัว และจัดการคิวตรวจทันตกรรม',
      17
    );
    createDentalPcDesk(0.8, -3.2, 0, pcSpec6, 'โต๊ะคอมทันตกรรม 6', { role: 'nurse', shirtColor: 0x0ea5e9, pose: 'sit', rotY: 0 });

    const items = [
      ['🦷', 'ห้องตรวจทันตกรรม 1 (ยูนิตทำฟัน 1 • โต๊ะคอมทันตกรรม 1)', r1State && r1State.occupied ? '🔴 กำลังรักษา' : '🟢 ว่าง พร้อมใช้', 'dental-room-1', r1State && r1State.occupied ? 'busy' : 'free'],
      ['🦷', 'ห้องตรวจทันตกรรม 2 (ยูนิตทำฟัน 2 • โต๊ะคอมทันตกรรม 2)', r2State && r2State.occupied ? '🔴 กำลังรักษา' : '🟢 ว่าง พร้อมใช้', 'dental-room-2', r2State && r2State.occupied ? 'busy' : 'free'],
      ['🦷', 'ห้องตรวจทันตกรรม 3 (ยูนิตทำฟัน 3 • โต๊ะคอมทันตกรรม 3)', r3State && r3State.occupied ? '🔴 กำลังรักษา' : '🟢 ว่าง พร้อมใช้', 'dental-room-3', r3State && r3State.occupied ? 'busy' : 'free'],
      ['🦷', 'ห้องตรวจทันตกรรม 4 (ยูนิตทำฟัน 4 • โต๊ะคอมทันตกรรม 4)', r4State && r4State.occupied ? '🔴 กำลังรักษา' : '🟢 ว่าง พร้อมใช้', 'dental-room-4', r4State && r4State.occupied ? 'busy' : 'free'],
      ['☢️', 'ห้อง x-ray ฟัน (Panoramic & 3D CBCT X-Ray)', dentalState.xrayActive ? '🔴 กำลังเอกซเรย์' : '🟢 พร้อมใช้งาน Standby', 'dental-xray', dentalState.xrayActive ? 'busy' : 'free'],
      ['🛋️', 'ห้องพักเจ้าหน้าที่+ห้องประชุม', 'พร้อมใช้งาน', 'dental-staff', 'free'],
      ['📦', 'ห้องเก็บอุปกรณ์ทันตกรรม & Autoclave', 'พร้อมใช้งาน', null, 'free'],
      ['🗄️', 'ชั้นเก็บอุปกรณ์ทันตกรรม (กระจกทรงสูง)', 'พร้อมใช้งาน', null, 'free'],
      ['🛠️', 'โต๊ะเตรียมอุปกรณ์ทันตกรรม & อัลตราโซนิก', 'พร้อมใช้งาน', null, 'free'],
      ['🖥️', 'PC-DEN-01: โต๊ะคอมทันตกรรม 1 (ห้องตรวจ 1)', 'ดูสเปก', null, 'free', pcSpec1],
      ['🖥️', 'PC-DEN-02: โต๊ะคอมทันตกรรม 2 (ห้องตรวจ 2)', 'ดูสเปก', null, 'free', pcSpec2],
      ['🖥️', 'PC-DEN-03: โต๊ะคอมทันตกรรม 3 (ห้องตรวจ 3)', 'ดูสเปก', null, 'free', pcSpec3],
      ['🖥️', 'PC-DEN-04: โต๊ะคอมทันตกรรม 4 (ห้องตรวจ 4)', 'ดูสเปก', null, 'free', pcSpec4],
      ['🖥️', 'PC-DEN-05: โต๊ะคอมทันตกรรม 5 (จุดนัดหมาย)', 'ดูสเปก', null, 'free', pcSpec5],
      ['🖥️', 'PC-DEN-06: โต๊ะคอมทันตกรรม 6 (โถงกลาง)', 'ดูสเปก', null, 'free', pcSpec6],
      ['🖥️', 'PC-DEN-01-OPD: โต๊ะคอมทันตกรรม 1 (โถงเวชระเบียน)', 'ดูสเปก', null, 'free', pcSpecHall],
      ['🪑', 'โต๊ะซักประวัติและให้คำปรึกษาโถงกลาง', '4 โต๊ะ (แถว 1: 2 ตัว, แถว 2: 2 ตัว)'],
      ['🚪', 'ประตูทางเข้า-ออกและประตูห้องตรวจ', '10 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 26,
      title: '🦷 ผังภายในกลุ่มงานทันตกรรม: ห้องตรวจ 1–4 • ห้อง X-ray ฟัน • ห้องพักเจ้าหน้าที่+ห้องประชุม • ห้องเก็บอุปกรณ์',
      sub: 'คลิกป้ายห้องตรวจหรือยูนิตทำฟันเพื่อสลับสถานะ • คลิกป้าย "🖥️ โต๊ะคอม" เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 26.5, 22.0), target: V(0, 0, 0.2) }
    };
  }

  function toggleDentalStatus(id) {
    if (id.startsWith('dental-room-')) {
      const dRoom = dentalState.rooms.find((r) => r.id === id);
      if (dRoom) {
        dRoom.occupied = !dRoom.occupied;
        return true;
      }
    }
    if (id === 'dental-xray') {
      dentalState.xrayActive = !dentalState.xrayActive;
      return true;
    }
    if (id === 'dental-staff') {
      dentalState.staffRoomOccupied = !dentalState.staffRoomOccupied;
      return true;
    }
    return false;
  }

  K.Interiors.register('dental', buildDentalInterior, toggleDentalStatus);
})();
