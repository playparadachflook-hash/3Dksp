/* =========================================================================
 * ตึกกายภาพ (Physical Therapy)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, walkwayStrip, makePerson } = C;

  const physioState = {
    rooms: [
      { id: 'pt-room-1', name: 'ห้องทำกายภาพ', occupied: true }
    ],
    beds: [
      { id: 'pt-bed-4', num: 4, name: 'เตียง 4 (กายภาพ)', x: 5.2, z: -1.5, occupied: true },
      { id: 'pt-bed-3', num: 3, name: 'เตียง 3 (กายภาพ)', x: 5.2, z: 1.1,  occupied: false },
      { id: 'pt-bed-2', num: 2, name: 'เตียง 2 (กายภาพ)', x: 5.2, z: 3.7,  occupied: true },
      { id: 'pt-bed-1', num: 1, name: 'เตียง 1 (กายภาพ)', x: 5.2, z: 6.3,  occupied: true }
    ]
  };

  function buildPhysioInterior() {
    const g = new THREE.Group();
    const L = [];
    const pcList = [];

    floor(g, 15.0, 19.6, '#f8fafc', '#cbd5e1', 1.0, 0, 0);
    floor(g, 7.4, 6.2, '#f1f5f9', '#cbd5e1', 1.0, -3.75, -6.6);
    floor(g, 7.4, 6.2, '#eff6ff', '#bfdbfe', 1.0, 3.75, -6.6);

    walkwayStrip(g, 0.0, 3.2, 12.2, 1.55, Math.PI / 2);
    L.push({ text: '⬆️ ทางเดิน ⬇️', pos: V(0.0, 0.35, 3.2), cls: 'int-label walkway-tag' });
    L.push({ text: '🦽 ห้องกายภาพ (งานกายภาพบำบัด)', pos: V(0.0, 2.35, -10.1), cls: 'int-label zone-pcu' });

    const wallMat = M.mat(0xf8fafc, { roughness: 0.5 });
    const outerWallMat = M.mat(0x1e293b, { roughness: 0.6 });
    const doorMat = M.mat(0xd97706, { roughness: 0.5 });
    const WH = 1.65;

    function wall(x1, z1, x2, z2, thick = 0.16, h = WH, isOuter = false) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const mesh = M.box(g, len, h, thick, isOuter ? outerWallMat : wallMat, (x1 + x2) / 2, h / 2, (z1 + z2) / 2);
      mesh.rotation.y = -Math.atan2(dz, dx);
      addEdges(mesh, 0x0f172a);
      return mesh;
    }

    function doorWay(x, z, rotY = 0, w = 1.25, showLabel = true) {
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

    function makePcSpec(code, name, role, ipOrSuffix, software, isNotebook = false, extra = {}) {
      const ip = String(ipOrSuffix).indexOf('.') !== -1 ? ipOrSuffix : `192.168.30.${ipOrSuffix}`;
      const spec = {
        code,
        name,
        role,
        cpu: isNotebook ? 'Intel Core i7-1355U (Notebook)' : 'Intel Core i5-13500 (14 Cores)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'NVMe M.2 SSD 512 GB',
        monitor: isNotebook ? '15.6" FHD IPS Anti-Glare (Built-in)' : 'Dell 24" IPS Full HD (Eye-Care)',
        os: 'Windows 11 Pro 64-bit (Hospital Domain)',
        ip,
        status: '🟢 ออนไลน์ (เชื่อมต่อระบบ HOSxP Rehab)',
        software,
        peripherals: isNotebook ? 'เมาส์ไร้สาย • เครื่องอ่านบัตรประชาชน Smart Card พกพา' : 'เครื่องอ่านบัตรประชาชน Smart Card • เครื่องพิมพ์ใบนัดกายภาพ',
        user: role,
        hostname: extra.hostname,
        mac: extra.mac,
        switchId: extra.switchId,
        switchName: extra.switchName,
        switchPort: extra.switchPort,
        wallOutlet: extra.wallOutlet,
        gateway: extra.gateway || '10.10.20.1 (Core Gateway)',
        vlan: extra.vlan || 'VLAN 20 - งานการพยาบาล กายภาพบำบัดและสารสนเทศยุทธศาสตร์'
      };
      pcList.push(spec);
      return spec;
    }

    function workDesk(opts) {
      const {
        x, z, w = 1.25, d = 0.65, rotY = 0,
        hasPC = true, isNotebook = false, label = null, staffRole = 'nurse',
        hasVisitor = false, pcInfo = null, labelY = 1.58
      } = opts;
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      const top = M.box(dg, w, 0.05, d, M.mat(0xd9b382, { roughness: 0.55 }), 0, 0.72, 0);
      addEdges(top, 0x78350f);
      const legM = M.mat(0x334155);
      [[-w / 2 + 0.06, -d / 2 + 0.06], [w / 2 - 0.06, -d / 2 + 0.06], [-w / 2 + 0.06, d / 2 - 0.06], [w / 2 - 0.06, d / 2 - 0.06]].forEach(([lx, lz]) => {
        M.box(dg, 0.05, 0.7, 0.05, legM, lx, 0.35, lz);
      });

      if (hasPC) {
        const dark = M.mat(0x0f172a);
        if (isNotebook) {
          M.box(dg, 0.38, 0.018, 0.26, M.mat(0x475569, { metalness: 0.5 }), 0, 0.755, 0.04);
          const lid = M.box(dg, 0.38, 0.25, 0.015, dark, 0, 0.88, 0.16);
          lid.rotation.x = -0.2;
          const scr = M.box(dg, 0.34, 0.21, 0.016, M.mat(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.88, 0.155);
          scr.rotation.x = -0.2;
        } else {
          M.box(dg, 0.46, 0.3, 0.03, dark, 0, 0.94, 0.15);
          M.box(dg, 0.42, 0.26, 0.032, M.mat(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.94, 0.15);
          M.box(dg, 0.05, 0.12, 0.05, dark, 0, 0.78, 0.15);
          M.box(dg, 0.28, 0.015, 0.1, M.mat(0x334155), 0, 0.755, -0.04);
          M.box(dg, 0.16, 0.36, 0.36, dark, w / 2 - 0.14, 0.52, 0);
        }
      }

      M.box(dg, 0.42, 0.06, 0.42, M.mat(0x1e293b), 0, 0.44, -0.45);
      M.box(dg, 0.42, 0.44, 0.05, M.mat(0x1e293b), 0, 0.68, -0.64);
      const staff = makePerson({ role: staffRole, pose: 'sit', rotY: 0 });
      staff.position.set(0, 0, -0.45);
      dg.add(staff);

      if (hasVisitor) {
        M.box(dg, 0.38, 0.42, 0.38, M.mat(0x475569), 0, 0.21, 0.58);
        const pat = makePerson({ role: 'patient', pose: 'sit', rotY: Math.PI });
        pat.position.set(0, 0, 0.58);
        dg.add(pat);
      }

      if (pcInfo) {
        dg.userData.pcInfo = pcInfo;
        dg.traverse((ch) => {
          if (ch.isMesh) ch.userData.pcInfo = pcInfo;
        });
      }

      g.add(dg);
      if (label) {
        if (hasPC && pcInfo) {
          L.push({
            text: `🖥️ ${label} (คลิกดูสเปก)`,
            pos: V(x, labelY, z),
            cls: 'int-label pc-tag',
            pcInfo
          });
        } else {
          L.push({ text: label, pos: V(x, 1.48, z), cls: 'int-label sub-tag' });
        }
      }
      return dg;
    }

    function physioBed(opts) {
      const { x, z, rotY = Math.PI / 2, occupied = true, label = null, statusId = null, labelY = 1.85 } = opts;
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);
      bg.rotation.y = rotY;

      const bw = 0.95, bd = 1.95;
      const frame = M.box(bg, bw, 0.1, bd, M.mat(0xe2e8f0), 0, 0.46, 0);
      addEdges(frame, 0x475569);
      const mattColor = occupied ? 0xfecdd3 : 0x6ee7b7;
      const matt = M.box(bg, bw - 0.06, 0.12, bd - 0.08, M.mat(mattColor, { roughness: 0.6 }), 0, 0.56, 0);
      addEdges(matt, occupied ? 0xe11d48 : 0x059669);
      M.box(bg, bw * 0.65, 0.08, 0.28, M.mat(0xffffff), 0, 0.65, -bd / 2 + 0.24);

      const legM = M.mat(0x64748b);
      [[-bw / 2 + 0.06, -bd / 2 + 0.06], [bw / 2 - 0.06, -bd / 2 + 0.06], [-bw / 2 + 0.06, bd / 2 - 0.06], [bw / 2 - 0.06, bd / 2 - 0.06]].forEach(([lx, lz]) => {
        M.box(bg, 0.05, 0.46, 0.05, legM, lx, 0.23, lz);
      });

      if (occupied) {
        const pat = makePerson({ role: 'patient', pose: 'lie', rotY: 0 });
        pat.position.set(0, 0.02, 0);
        bg.add(pat);

        const therapist = makePerson({ role: 'nurse', pose: 'stand', rotY: -Math.PI / 2 });
        therapist.position.set(bw / 2 + 0.34, 0, -0.15);
        bg.add(therapist);
      }

      g.add(bg);
      if (label) {
        const statusTxt = occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง';
        L.push({
          text: `${label}: ${statusTxt}`,
          pos: V(x, labelY, z),
          cls: `int-label ${occupied ? 'busy' : 'free'} toggleable`,
          toggleId: statusId
        });
      }
      return bg;
    }

    wall(-7.5, -9.8, 7.5, -9.8, 0.2, WH, true);
    wall(-7.5, -9.8, -7.5, 9.8, 0.2, WH, true);
    wall(7.5, -9.8, 7.5, 9.8, 0.2, WH, true);
    wall(-7.5, 9.8, -1.2, 9.8, 0.2, WH, true);
    wall(1.2, 9.8, 7.5, 9.8, 0.2, WH, true);
    doorWay(0.0, 9.8, 0, 2.2, true);

    wall(0.0, -9.8, 0.0, -3.4, 0.16, WH);
    wall(-7.5, -3.4, -1.6, -3.4, 0.16, WH);
    wall(-0.3, -3.4, 0.0, -3.4, 0.16, WH);
    doorWay(-0.95, -3.4, 0, 1.25, true);

    wall(0.0, -3.4, 0.3, -3.4, 0.16, WH);
    wall(1.6, -3.4, 7.5, -3.4, 0.16, WH);
    doorWay(0.95, -3.4, 0, 1.25, true);

    L.push({ text: '📦 ห้องเก็บอุปกรณ์', pos: V(-3.8, 1.95, -6.5), cls: 'int-label room-title' });
    const shelfMat = M.mat(0x94a3b8);
    const cab1 = M.box(g, 4.8, 1.45, 0.55, shelfMat, -4.2, 0.725, -9.2);
    addEdges(cab1, 0x334155);
    const cab2 = M.box(g, 0.55, 1.45, 3.6, shelfMat, -6.9, 0.725, -6.5);
    addEdges(cab2, 0x334155);
    [-5.8, -4.6, -3.4, -2.2].forEach((bx, idx) => {
      M.box(g, 0.7, 0.42, 0.42, M.mat(idx % 2 === 0 ? 0x38bdf8 : 0xfbbf24), bx, 1.65, -9.2);
    });

    workDesk({
      x: 1.65, z: -8.1, w: 1.45, d: 0.7, rotY: 0,
      hasPC: false, label: 'โต๊ะหัวหน้า', staffRole: 'doctor'
    });

    workDesk({
      x: 4.1, z: -5.5, w: 1.4, d: 0.68, rotY: -Math.PI / 2,
      hasPC: false, label: 'โต๊ะ', staffRole: 'nurse'
    });

    workDesk({
      x: 6.35, z: -5.5, w: 1.55, d: 0.68, rotY: -Math.PI / 2,
      hasPC: true, isNotebook: true, label: 'กายภาพ Notebook', staffRole: 'nurse',
      pcInfo: makePcSpec('NB-PT-01', 'โน้ตบุ๊กงานกายภาพบำบัด (กายภาพ Notebook)', 'นักกายภาพบำบัดบันทึกประเมิน ADL และติดตามผู้ป่วยเยี่ยมบ้าน (IMC)', '104', 'ระบบ Intermediate Care (IMC) • ระบบบันทึกการฟื้นฟูสมรรถภาพชุมชน', true)
    });

    wall(-4.3, -2.8, -4.3, -0.4, 0.14, WH);
    wall(-7.5, 0.4, -4.3, 0.4, 0.14, WH);
    wall(-7.5, -2.8, -4.3, -2.8, 0.14, WH);
    const ptRoom = physioState.rooms[0] || { id: 'pt-room-1', occupied: true };
    physioBed({
      x: -5.9, z: -1.2, rotY: Math.PI / 2,
      occupied: ptRoom.occupied,
      label: 'ห้องทำกายภาพ',
      statusId: ptRoom.id,
      labelY: 2.05
    });
    M.box(g, 0.5, 0.85, 0.45, M.mat(0x38bdf8), -6.9, 0.425, -2.2);

    const tmGroup = new THREE.Group();
    tmGroup.position.set(-5.9, 0, 3.0);
    const tmBase = M.box(tmGroup, 2.1, 0.16, 0.92, M.mat(0x1e293b), 0, 0.1, 0);
    addEdges(tmBase, 0x0f172a);
    M.box(tmGroup, 1.85, 0.03, 0.68, M.mat(0x334155), 0.05, 0.19, 0);
    M.box(tmGroup, 0.1, 1.15, 0.08, M.mat(0x64748b), -0.88, 0.65, -0.4);
    M.box(tmGroup, 0.1, 1.15, 0.08, M.mat(0x64748b), -0.88, 0.65, 0.4);
    M.box(tmGroup, 1.1, 0.06, 0.06, M.mat(0x94a3b8), -0.38, 0.98, -0.4);
    M.box(tmGroup, 1.1, 0.06, 0.06, M.mat(0x94a3b8), -0.38, 0.98, 0.4);
    const tmConsole = M.box(tmGroup, 0.32, 0.24, 0.86, M.mat(0x0f172a), -0.88, 1.24, 0);
    tmConsole.rotation.z = -0.35;
    addEdges(tmConsole, 0x38bdf8);
    const runner = makePerson({ role: 'patient', pose: 'stand', rotY: -Math.PI / 2 });
    runner.position.set(0.05, 0.18, 0);
    tmGroup.add(runner);
    const trainer = makePerson({ role: 'nurse', pose: 'stand', rotY: Math.PI });
    trainer.position.set(-0.2, 0, -0.85);
    tmGroup.add(trainer);
    g.add(tmGroup);
    L.push({ text: '🏃 ลู่วิ่ง (ฝึกเดินฟื้นฟู)', pos: V(-5.9, 1.85, 3.0), cls: 'int-label room-title' });

    workDesk({
      x: -2.8, z: 4.2, w: 1.65, d: 0.7, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม กายภาพ 2 (กายภาพ)', staffRole: 'nurse',
      pcInfo: makePcSpec(
        'PC-PT-02',
        'โต๊ะคอมพิวเตอร์ กายภาพ 2',
        'นักกายภาพบำบัดบันทึกผลการทำหัตถการและประเมินสมรรถภาพกล้ามเนื้อ',
        '10.10.20.131',
        'ระบบ HOSxP Physical Therapy Note • ระบบนัดหมายผู้ป่วยกายภาพบำบัด',
        false,
        {
          hostname: 'กายภาพ',
          mac: '8C:EC:4B:D1:95:2F',
          switchId: 'ksp-sw-rompho1',
          switchName: 'Aruba / HPE 2530 24G (KSP-SW-ROMPHO1 - สวิตช์ตึกร่มโพธิ์/กายภาพ)',
          switchPort: 'Port 8 (10/100/1000Base-T / VLAN 20 Untagged)',
          wallOutlet: 'Outlet ID: PT-TREAT-02 (เต้ารับ LAN โต๊ะบันทึกการรักษาและนัดหมายกายภาพ)',
          vlan: 'VLAN 20 - งานการพยาบาล กายภาพบำบัดและสารสนเทศยุทธศาสตร์',
          gateway: '10.10.20.1 (Core Gateway)'
        }
      )
    });

    const triageCounter = M.box(g, 0.85, 0.88, 2.1, M.mat(0xfef08a), -2.8, 0.44, 6.8);
    addEdges(triageCounter, 0xca8a04);
    const ptTriageStaff = makePerson({ role: 'nurse', pose: 'sit', rotY: Math.PI / 2 });
    ptTriageStaff.position.set(-3.45, 0, 6.8);
    g.add(ptTriageStaff);
    M.box(g, 0.38, 0.42, 0.38, M.mat(0x64748b), -2.0, 0.21, 6.8);
    const ptTriagePat = makePerson({ role: 'patient', pose: 'sit', rotY: -Math.PI / 2 });
    ptTriagePat.position.set(-2.0, 0, 6.8);
    g.add(ptTriagePat);
    L.push({ text: '📋 เค้าเตอร์ซักประวัติ (มีเจ้าหน้าที่ประจำ)', pos: V(-2.8, 1.85, 6.8), cls: 'int-label room-title' });

    workDesk({
      x: -5.3, z: 8.85, w: 1.75, d: 0.7, rotY: 0,
      hasPC: true, label: 'โต๊ะคอม กายภาพ 1 (KAYAPAP-PC)', staffRole: 'nurse',
      pcInfo: makePcSpec(
        'PC-PT-01',
        'โต๊ะคอมพิวเตอร์ กายภาพ 1',
        'เจ้าหน้าที่/นักกายภาพบำบัดรับบัตรคิว ตรวจสอบสิทธิ และลงทะเบียนผู้ป่วย',
        '10.10.20.92',
        'ระบบ HOSxP Rehab Queue • ระบบตรวจสอบสิทธิ สปสช. Smart Card',
        false,
        {
          hostname: 'KAYAPAP-PC',
          mac: '88:AE:DD:8A:45:E7',
          switchId: 'ksp-sw-rompho1',
          switchName: 'Aruba / HPE 2530 24G (KSP-SW-ROMPHO1 - สวิตช์ตึกร่มโพธิ์/กายภาพ)',
          switchPort: 'Port 7 (10/100/1000Base-T / VLAN 20 Untagged)',
          wallOutlet: 'Outlet ID: PT-ADM-01 (เต้ารับ LAN จุดลงทะเบียน/คัดกรองกายภาพ)',
          vlan: 'VLAN 20 - งานการพยาบาล กายภาพบำบัดและสารสนเทศยุทธศาสตร์',
          gateway: '10.10.20.1 (Core Gateway)'
        }
      )
    });

    physioState.beds.forEach((bed) => {
      physioBed({
        x: bed.x,
        z: bed.z,
        rotY: Math.PI / 2,
        occupied: bed.occupied,
        label: `เตียง ${bed.num}`,
        statusId: bed.id,
        labelY: 1.85
      });
      const curtain = M.box(g, 2.2, 1.25, 0.05, M.glass(0xbae6fd, 0.45), bed.x, 0.65, bed.z - 1.3);
      addEdges(curtain, 0x0284c7);
    });

    const eqGroup = new THREE.Group();
    eqGroup.position.set(4.8, 0, 8.6);
    const eqBase = M.box(eqGroup, 2.6, 0.12, 1.25, M.mat(0xe0f2fe), 0, 0.06, 0);
    addEdges(eqBase, 0x0284c7);
    const rack = M.box(eqGroup, 1.1, 0.95, 0.5, M.mat(0x64748b), -0.65, 0.48, -0.2);
    addEdges(rack, 0x334155);
    const ball1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), M.mat(0x3b82f6, { roughness: 0.4 }));
    ball1.position.set(0.35, 0.38, -0.15);
    eqGroup.add(ball1);
    const ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), M.mat(0xec4899, { roughness: 0.4 }));
    ball2.position.set(0.95, 0.32, 0.1);
    eqGroup.add(ball2);
    g.add(eqGroup);
    L.push({ text: '🏋️ อุปกรณ์กายภาพ', pos: V(4.8, 1.65, 8.6), cls: 'int-label room-title' });

    const items = [];
    physioState.rooms.forEach((r) => {
      items.push([
        '💆',
        r.name,
        r.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง',
        r.id,
        r.occupied ? 'busy' : 'free'
      ]);
    });
    physioState.beds.slice().reverse().forEach((b) => {
      items.push([
        '🛏️',
        b.name,
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
    items.push(['🏃', 'ลู่วิ่งไฟฟ้าฝึกเดิน (มีผู้ป่วยใช้งาน)', '1 เครื่อง']);
    items.push(['📋', 'เค้าเตอร์ซักประวัติ (มีเจ้าหน้าที่ประจำ)', 'เปิดบริการ']);
    items.push(['🏋️', 'ชุดอุปกรณ์กายภาพบำบัด', 'ครบชุด']);
    items.push(['📦', 'ห้องเก็บอุปกรณ์กายภาพ', '1 ห้อง']);

    return {
      group: g,
      labels: L,
      size: 22,
      title: '🦽 ผังภายในตึกกายภาพ (ห้องกายภาพบำบัด)',
      sub: 'คลิกป้าย "ว่าง/ไม่ว่าง" เพื่อสลับสถานะเตียง/ห้องทำกายภาพ • คลิกป้าย "🖥️ โต๊ะคอม / Notebook" เพื่อดูสเปก',
      items,
      cam: { pos: V(0, 21, 18.5), target: V(0, 0, 0.5) }
    };
  }

  function togglePhysioStatus(id) {
    const ptRoom = physioState.rooms.find((r) => r.id === id);
    if (ptRoom) {
      ptRoom.occupied = !ptRoom.occupied;
      return true;
    }
    const ptBed = physioState.beds.find((b) => b.id === id);
    if (ptBed) {
      ptBed.occupied = !ptBed.occupied;
      return true;
    }
    return false;
  }

  K.Interiors.register('physio', buildPhysioInterior, togglePhysioStatus);
})();
