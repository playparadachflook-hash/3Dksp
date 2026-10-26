/* =========================================================================
 * ตึกร่มโพธิ์ 3 (Rompho 3 Building - 3 Floors)
 * ชั้นที่ 1: แผนกห้องคลอดและสูติกรรม (Labor & Delivery) + งานพัฒนาการเด็ก + งานระบาดวิทยา + ทางเดินสีฟ้า
 * ชั้นที่ 2: ศูนย์ไตเทียม (Hemodialysis Unit 17 เตียง) + ระบบน้ำ RO
 * ชั้นที่ 3: หอผู้ป่วยพิเศษ (VIP Inpatient Ward 13 ห้อง)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, walkwayStrip, makePerson } = C;

  const ROMPHO_PC_SPECS = (K.ROMPHO_SPECS && K.ROMPHO_SPECS['3C:52:82:7D:6E:19']) || {
    name: 'โต๊ะคอมห้องคลอด 1',
    code: 'PC-ROM-01',
    hostname: 'LR-PC',
    ip: '10.10.40.30',
    mac: '3C:52:82:7D:6E:19',
    switchId: 'ksp-sw-rompho1',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-ROMPHO1 - ห้องพักแพทย์)',
    switchIp: '10.10.100.14',
    switchPort: 'Port 1 (VLAN 40)',
    wallOutlet: 'ROM1-LR-01 (เต้ารับ LAN ผนังเคาน์เตอร์สูติกรรมห้องคลอด)',
    vlan: 'VLAN 40 - แผนกผู้ป่วยใน สูติกรรม และห้องคลอด (LR)',
    role: 'เครื่องบันทึกข้อมูลการคลอด ทะเบียนทารกแรกเกิด และระบบเวชระเบียนสูติ-นรีเวชกรรม',
    user: 'พยาบาลวิชาชีพประจำห้องคลอด',
    os: 'Windows 11 Pro 64-bit',
    cpu: 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)',
    ram: '16 GB DDR4 3200MHz',
    storage: '512 GB M.2 NVMe PCIe SSD (High Speed)',
    monitor: 'Dell 24" Full HD IPS (Anti-Glare, ComfortView Plus)',
    software: 'HOSxP / HIS Delivery & Maternity Module, ระบบสูติบัตรและแจ้งเกิดออนไลน์, EHR, Neonatal Monitor Link',
    peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, เครื่องพิมพ์สูติบัตร, UPS 1000VA',
    status: '🟢 ออนไลน์ปกติ',
    specs: [
      ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
      ['RAM', '16 GB DDR4 3200MHz'],
      ['Storage', '512 GB M.2 NVMe PCIe SSD (High Speed)'],
      ['Monitor', 'Dell 24" Full HD IPS (Anti-Glare, ComfortView Plus)'],
      ['OS', 'Windows 11 Pro 64-bit'],
      ['Network', 'LAN Gigabit + Secure Hospital VLAN (Maternity Suite)']
    ]
  };

  const HEMO_PC_SPECS_1 = {
    name: 'โต๊ะพยาบาลไตเทียม 1 (เวชระเบียน & สั่งยา)',
    code: 'PC-HEMO-01',
    role: 'บันทึกประวัติการฟอกเลือด เวชระเบียนผู้ป่วยไตวายเรื้อรัง (HD Electronic Record) สั่งจ่ายสารน้ำและยา',
    specs: [
      ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
      ['RAM', '16 GB DDR4 3200MHz'],
      ['Storage', '512 GB M.2 NVMe SSD (High Speed)'],
      ['Monitor', 'Dell 24" Full HD IPS (Anti-Glare)'],
      ['OS', 'Windows 11 Pro 64-bit'],
      ['Network', 'LAN Gigabit + Hospital Medical VLAN (Hemodialysis Center)']
    ],
    software: [
      'HOSxP / HIS Hemodialysis Management System',
      'EHR Electronic Health Record',
      'KTTR (ระบบทะเบียนบำบัดทดแทนไตแห่งประเทศไทย)',
      'LIS Lab Information System Link',
      'Microsoft Edge / Hospital Intranet'
    ]
  };

  const HEMO_PC_SPECS_2 = {
    name: 'โต๊ะพยาบาลไตเทียม 2 (ระบบควบคุมและมอนิเตอร์)',
    code: 'PC-HEMO-02',
    role: 'มอนิเตอร์สัญญาณชีพผู้ป่วยขณะฟอกเลือด ตรวจสอบพารามิเตอร์เครื่องไตเทียม และควบคุมระบบน้ำบริสุทธิ์ RO',
    specs: [
      ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
      ['RAM', '16 GB DDR4 3200MHz'],
      ['Storage', '512 GB M.2 NVMe SSD (High Speed)'],
      ['Monitor', 'Dell 24" Full HD IPS Dual-Screen Support'],
      ['OS', 'Windows 11 Pro 64-bit'],
      ['Network', 'LAN Gigabit + Isolated Medical Equipment Network']
    ],
    software: [
      'Dialysis Machine Central Monitoring Network',
      'RO Water Quality & Conductivity Online Logger',
      'HOSxP Hemodialysis Care',
      'Vital Signs Telemetry Link',
      'Microsoft Edge / Antivirus Enterprise'
    ]
  };

  const VIP_PC_SPECS = {
    name: 'เค้าเตอร์โต๊ะคอมห้องพิเศษ (PC-VIP-01)',
    code: 'PC-VIP-01',
    hostname: 'ROMPHO3',
    ip: '10.10.40.24',
    mac: '3C:52:82:7D:6E:24',
    switchId: 'ksp-sw-rompho1',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-ROMPHO1 - ตึกร่มโพธิ์)',
    switchIp: '10.10.100.14',
    switchPort: 'Port 3 (10/100/1000Base-T / VLAN 40 Untagged)',
    wallOutlet: 'Outlet ID: ROMPHO-FL3-NURSE-01 (เต้ารับ LAN เค้าเตอร์พยาบาลห้องพิเศษ ชั้น 3)',
    vlan: 'VLAN 40 - แผนกผู้ป่วยใน สูติกรรม และหอผู้ป่วยพิเศษ (VIP Ward)',
    gateway: '10.10.40.1 (IPD Gateway)',
    role: 'ระบบบริหารจัดการหอผู้ป่วยพิเศษ บันทึกเวชระเบียนผู้ป่วยใน (IPD Charting) และระบบจัดสรรห้องพักพิเศษ',
    user: 'นางสาวนิดา ว่องไวสงฆ์ (พยาบาลวิชาชีพชำนาญการ)',
    cpu: 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)',
    ram: '16 GB DDR4 3200MHz',
    storage: '512 GB M.2 NVMe SSD (High Speed)',
    monitor: 'Dell 24" Full HD IPS (Anti-Glare, ComfortView Plus)',
    os: 'Windows 11 Pro 64-bit',
    status: '🟢 ออนไลน์ปกติ',
    software: 'HOSxP / HIS Inpatient Department (IPD Ward) • ระบบบริหารจัดการจองห้องพักพิเศษและคำนวณค่าบริการ • EHR Electronic Health Record & Nursing Note • LIS Lab & X-Ray PACS Viewer Integration',
    specs: [
      ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
      ['RAM', '16 GB DDR4 3200MHz'],
      ['Storage', '512 GB M.2 NVMe SSD (High Speed)'],
      ['Monitor', 'Dell 24" Full HD IPS (Anti-Glare, ComfortView Plus)'],
      ['OS', 'Windows 11 Pro 64-bit'],
      ['Network', 'LAN Gigabit + Hospital Medical VLAN (VIP Ward)']
    ]
  };

  const CHILD_DEV_PC_SPECS = {
    name: 'โต๊ะคอมพัฒนาการเด็ก (Child Development)',
    code: 'PC-DEV-01',
    role: 'บันทึกการตรวจประเมินพัฒนาการเด็กปฐมวัย DSPM / DAIM และเชื่อมโยงข้อมูลสุขภาพเด็กดี',
    specs: [
      ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
      ['RAM', '16 GB DDR4 3200MHz'],
      ['Storage', '512 GB M.2 NVMe PCIe SSD'],
      ['Monitor', 'Dell 24" Full HD IPS (Anti-Glare, ComfortView Plus)'],
      ['OS', 'Windows 11 Pro 64-bit'],
      ['Network', 'LAN Gigabit + Hospital Healthcare VLAN']
    ],
    software: [
      'HOSxP Child Health & DSPM Assessment Module',
      'ระบบบันทึกพัฒนาการเด็กปฐมวัย (KidDiary)',
      'HDC Health Data Center Link',
      'Microsoft Edge / Hospital Intranet'
    ]
  };

  const EPI_PC_SPECS = {
    name: 'โต๊ะคอมระบาดวิทยา (Epidemiology & Surveillance)',
    code: 'PC-EPI-01',
    role: 'ระบบเฝ้าระวังและสอบสวนโรคทางระบาดวิทยา การรายงานโรค 506 และแผนที่ระบาดวิทยา GIS',
    specs: [
      ['CPU', 'Intel Core i7-12700 (12 Cores / 20 Threads, up to 4.90 GHz)'],
      ['RAM', '32 GB DDR4 3200MHz (รองรับการวิเคราะห์ข้อมูลระบาดวิทยาและแผนที่ GIS)'],
      ['Storage', '1 TB M.2 NVMe PCIe 4.0 SSD (High-Speed Analytics)'],
      ['Monitor', 'Dell UltraSharp 27" 4K IPS (Dual-Display setup)'],
      ['GPU', 'NVIDIA GeForce RTX 3050 8GB'],
      ['OS', 'Windows 11 Pro 64-bit Workstation'],
      ['Network', 'LAN Gigabit Dedicated Epi VLAN + Redundant Uplink']
    ],
    software: [
      'CD-Online / Digital Disease Surveillance (ระบบรายงาน 506)',
      'ArcGIS Pro / QGIS (แผนที่ระบาดวิทยาเชิงพื้นที่)',
      'HOSxP Epidemiology & Outbreak Investigation Module',
      'Epi Info / R-Studio Analytics',
      'Microsoft Edge / Security Portal'
    ]
  };

  const romphoState = {
    currentFloor: 1,
    // Floor 1
    beds: Array.from({ length: 19 }, (_, i) => ({
      id: `rompho-bed-${i + 1}`,
      name: i < 16 ? `เตียงพักคลอด ${i + 1}` : `เตียงเตรียมคลอด ${i - 15}`,
      occupied: i === 1 || i === 4 || i === 8 || i === 17
    })),
    or1Occupied: false,
    staffRoomOccupied: false,
    doctorRoom1Occupied: false,
    doctorRoom2Occupied: false,
    childDevOccupied: false,
    epiOccupied: false,

    // Floor 2
    hemoBeds: Array.from({ length: 17 }, (_, i) => ({
      id: `hemo-bed-${i + 1}`,
      name: `เตียงฟอกไต ${i + 1}`,
      occupied: i === 0 || i === 2 || i === 5 || i === 8 || i === 11 || i === 14
    })),
    roRunning: true,

    // Floor 3
    vipRooms: [
      { id: 'vip-301', num: '301', name: 'ห้องพิเศษ 301', occupied: false },
      { id: 'vip-302', num: '302', name: 'ห้องพิเศษ 302', occupied: true },
      { id: 'vip-303', num: '303', name: 'ห้องพิเศษ 303', occupied: false },
      { id: 'vip-304', num: '304', name: 'ห้องพิเศษ 304', occupied: true },
      { id: 'vip-305', num: '305', name: 'ห้องพิเศษ 305', occupied: false },
      { id: 'vip-306', num: '306', name: 'ห้องพิเศษ 306', occupied: true },
      { id: 'vip-307', num: '307', name: 'ห้องพิเศษ 307', occupied: false },
      { id: 'vip-308', num: '308', name: 'ห้องพิเศษ 308', occupied: false },
      { id: 'vip-309', num: '309', name: 'ห้องพิเศษ 309', occupied: true },
      { id: 'vip-311', num: '311', name: 'ห้องพิเศษ 311', occupied: false },
      { id: 'vip-312', num: '312', name: 'ห้องพิเศษ 312', occupied: true },
      { id: 'vip-313', num: '313', name: 'ห้องพิเศษ 313', occupied: false },
      { id: 'vip-314', num: '314', name: 'ห้องพิเศษ 314', occupied: false }
    ],
    vipMeetingOccupied: false,
    vipStaffRestOccupied: false
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

  function buildRomphoInterior(b) {
    const g = new THREE.Group();
    const L = [];
    const W = 27.0, D = 18.5;
    const WH = 2.4;
    const wThick = 0.18;
    const xMin = -W / 2;
    const xMax = W / 2;
    const zMin = -D / 2;
    const zMax = D / 2;

    // =========================================================================
    // ชั้น 3: หอผู้ป่วยพิเศษ (VIP Inpatient Ward)
    // =========================================================================
    if (romphoState.currentFloor === 3) {
      function makeRomphoDoor(x, z, w, d, rotY = 0) {
        const dg = new THREE.Group();
        dg.position.set(x, 0, z);
        const isHoriz = w >= d;
        const pad = maintBox(w, 0.04, d, 0xe2e8f0);
        pad.position.set(0, 0.02, 0);
        dg.add(pad);
        const leafW = isHoriz ? w * 0.85 : 0.07;
        const leafD = isHoriz ? 0.07 : d * 0.85;
        const leaf = maintBox(leafW, 1.95, leafD, 0xd97706);
        leaf.position.set(0, 0.98, 0);
        leaf.rotation.y = rotY;
        dg.add(leaf);
        const winW = isHoriz ? 0.22 : 0.08;
        const winD = isHoriz ? 0.08 : 0.22;
        const win = maintBox(winW, 0.38, winD, 0xbae6fd);
        win.position.set(0, 1.25, 0);
        dg.add(win);
        g.add(dg);
      }

      function makeYellowWardrobe(x, z, rotY = 0) {
        const wg = new THREE.Group();
        wg.position.set(x, 0, z);
        wg.rotation.y = rotY;
        const body = maintBox(0.85, 1.85, 0.60, 0xfacc15);
        body.position.set(0, 0.925, 0);
        const topTrim = maintBox(0.88, 0.05, 0.63, 0xd97706);
        topTrim.position.set(0, 1.85, 0);
        const baseTrim = maintBox(0.86, 0.08, 0.61, 0x78350f);
        baseTrim.position.set(0, 0.04, 0);
        const groove = maintBox(0.02, 1.65, 0.02, 0xd97706);
        groove.position.set(0, 0.95, 0.31);
        const hL = maintBox(0.03, 0.20, 0.03, 0x334155);
        hL.position.set(-0.06, 1.05, 0.32);
        const hR = maintBox(0.03, 0.20, 0.03, 0x334155);
        hR.position.set(0.06, 1.05, 0.32);
        wg.add(body, topTrim, baseTrim, groove, hL, hR);
        return wg;
      }

      function makeVipRoomSuite(x1, z1, x2, z2, room) {
        const rw = Math.abs(x2 - x1);
        const rd = Math.abs(z2 - z1);
        const cx = (x1 + x2) / 2;
        const cz = (z1 + z2) / 2;
        const isLeft = x1 < 0;

        floor(g, rw, rd, '#fffbeb', '#fde68a', 0.6, cx, cz);

        const bedX = isLeft ? x1 + 2.4 : x2 - 2.4;
        const bedZ = cz;
        const bg = new THREE.Group();
        bg.position.set(bedX, 0, bedZ);
        bg.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;

        const bw = 0.95, bd = 1.95;
        const frame = maintBox(bw, 0.42, bd, 0x64748b);
        frame.position.set(0, 0.21, 0);
        bg.add(frame);

        const matCol = room.occupied ? 0xf43f5e : 0x10b981;
        const sheet = maintBox(bw - 0.06, 0.16, bd - 0.06, matCol);
        sheet.position.set(0, 0.50, 0);
        bg.add(sheet);

        const head = maintBox(bw + 0.04, 0.45, 0.06, 0x0284c7);
        head.position.set(0, 0.65, -bd / 2 + 0.03);
        const pillow = maintBox(bw * 0.65, 0.08, 0.32, 0xffffff);
        pillow.position.set(0, 0.62, -bd / 2 + 0.26);
        const blanket = maintBox(bw - 0.04, 0.08, bd * 0.58, room.occupied ? 0xfecdd3 : 0xd1fae5);
        blanket.position.set(0, 0.62, bd * 0.18);
        bg.add(head, pillow, blanket);

        const sTable = maintBox(0.42, 0.65, 0.42, 0xffffff);
        sTable.position.set(bw / 2 + 0.30, 0.325, -bd / 2 + 0.3);
        bg.add(sTable);

        const pole = maintCyl(0.015, 0.015, 1.7, 0x94a3b8);
        pole.position.set(-bw / 2 - 0.18, 0.85, -bd / 2 + 0.25);
        bg.add(pole);
        const ivBag = maintBox(0.08, 0.18, 0.05, 0x38bdf8);
        ivBag.position.set(-bw / 2 - 0.18, 1.55, -bd / 2 + 0.25);
        bg.add(ivBag);

        if (room.occupied) {
          const pat = makePerson({ role: 'patient', pose: 'lie', rotY: 0 });
          bg.add(pat);
          const nurse = makePerson({ role: 'nurse', pose: 'stand', rotY: -Math.PI / 2 });
          nurse.position.set(bw / 2 + 0.35, 0, 0.1);
          bg.add(nurse);
        }
        g.add(bg);

        const sofaX = isLeft ? x1 + 4.9 : x2 - 4.9;
        const relSofa = maintBox(1.8, 0.52, 0.75, 0x475569);
        relSofa.position.set(sofaX, 0.26, cz);
        g.add(relSofa);

        const tv = maintBox(1.1, 0.65, 0.06, 0x0f172a);
        tv.position.set(isLeft ? x1 + 0.12 : x2 - 0.12, 1.45, cz);

        const yellowWardrobe = makeYellowWardrobe(
          isLeft ? x2 - 2.5 : x1 + 2.5,
          cz,
          isLeft ? -Math.PI / 2 : Math.PI / 2
        );
        g.add(tv, yellowWardrobe);

        const toilet = maintBox(0.42, 0.42, 0.55, 0xffffff);
        toilet.position.set(isLeft ? x2 - 1.1 : x1 + 1.1, 0.21, cz + 0.35);
        const sink = maintBox(0.5, 0.8, 0.4, 0xffffff);
        sink.position.set(isLeft ? x2 - 1.1 : x1 + 1.1, 0.4, cz - 0.4);
        g.add(toilet, sink);

        const statusText = room.occupied ? '🔴 มีผู้ป่วยพัก' : '🟢 ว่าง';
        L.push({
          text: `${room.name} (${statusText})`,
          pos: V(cx, 1.85, cz),
          cls: `int-label ${room.occupied ? 'busy' : 'free'} toggleable`,
          toggleId: room.id
        });
      }

      function createVipPcDesk(x, z, rotY, spec, labelText, personOpts = null) {
        const dg = new THREE.Group();
        dg.position.set(x, 0, z);
        dg.rotation.y = rotY;

        dg.add(
          maintAt(maintBox(2.2, 0.76, 0.85, 0xffffff), 0, 0.38, 0),
          maintAt(maintBox(2.24, 0.05, 0.90, 0x0284c7), 0, 0.78, 0),
          maintAt(maintBox(2.24, 0.35, 0.06, 0x38bdf8), 0, 0.95, -0.42)
        );

        const mon = maintBox(0.55, 0.34, 0.04, 0x0f172a);
        mon.position.set(0, 0.98, -0.15);
        const scr = maintBox(0.51, 0.30, 0.01, 0x0284c7);
        scr.position.set(0, 0.98, -0.12);
        const stand = maintBox(0.06, 0.16, 0.06, 0x475569);
        stand.position.set(0, 0.86, -0.15);
        const base = maintBox(0.24, 0.02, 0.18, 0x475569);
        base.position.set(0, 0.79, -0.15);
        dg.add(mon, scr, stand, base);

        const kb = maintBox(0.42, 0.015, 0.15, 0x1e293b);
        kb.position.set(0, 0.81, 0.12);
        const mouse = maintBox(0.06, 0.015, 0.09, 0x1e293b);
        mouse.position.set(0.30, 0.81, 0.12);
        dg.add(kb, mouse);

        const pcCase = maintBox(0.18, 0.40, 0.38, 0x1e293b);
        pcCase.position.set(0.85, 0.38, 0.05);
        dg.add(pcCase);

        const chair = maintBox(0.48, 0.46, 0.48, 0x334155);
        chair.position.set(0, 0.23, 0.58);
        const back = maintBox(0.48, 0.46, 0.06, 0x334155);
        back.position.set(0, 0.69, 0.79);
        dg.add(chair, back);

        if (personOpts) {
          const staff = makePerson(personOpts);
          staff.position.set(0, 0, 0.55);
          dg.add(staff);
        }

        dg.traverse((child) => {
          if (child.isMesh) child.userData.pcInfo = spec;
        });

        g.add(dg);

        if (labelText) {
          L.push({
            text: labelText,
            pos: V(x, 1.95, z),
            cls: 'int-label pc-tag',
            pcInfo: spec
          });
        }
        return dg;
      }

      floor(g, 2.8, 18.5, '#f8fafc', '#cbd5e1', 0.6, -2.8, 0);
      walkwayStrip(g, -2.8, 0, 17.5, 1.5, Math.PI / 2);

      floor(g, 11.2, 5.1, '#f8fafc', '#cbd5e1', 0.6, 4.2, 0.6);
      floor(g, 3.7, 5.1, '#e0f2fe', '#93c5fd', 0.6, 11.65, 0.6);

      floor(g, 14.9, 2.0, '#fef3c7', '#fde68a', 0.6, 6.05, 8.25);
      floor(g, 9.3, 2.1, '#f8fafc', '#cbd5e1', 0.6, -8.85, 8.20);

      g.add(
        maintAt(maintWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zMin + wThick / 2),
        maintAt(maintWall(9.3, WH, wThick, 0x1e293b), -8.85, WH / 2, zMax - wThick / 2),
        maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -2.8, WH - 0.175, zMax - wThick / 2),
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, zMax - wThick / 2),
        maintAt(maintWall(wThick, WH, D, 0x1e293b), xMin + wThick / 2, WH / 2, 0),
        maintAt(maintWall(wThick, WH, D, 0x1e293b), xMax - wThick / 2, WH / 2, 0)
      );
      makeRomphoDoor(-2.8, zMax - wThick / 2, 1.4, 0.45, 0.3);
      L.push(maintTag('🚪 ประตู', V(-2.8, 1.45, zMax - 0.35), 'room', null, 'ประตูทางเข้าโถงชั้น 3 (ล่าง)'));

      const leftZBounds = [
        -9.25, -7.20, -5.15, -3.10, -1.05, 1.00, 3.05, 5.10, 7.15, 9.25
      ];
      for (let i = 1; i < leftZBounds.length; i++) {
        g.add(maintAt(maintWall(9.3, WH, wThick, 0x1e293b), -8.85, WH / 2, leftZBounds[i]));
      }

      const vipLeftRooms = [
        romphoState.vipRooms[7],
        romphoState.vipRooms[6],
        romphoState.vipRooms[5],
        romphoState.vipRooms[4],
        romphoState.vipRooms[3],
        romphoState.vipRooms[2],
        romphoState.vipRooms[1],
        romphoState.vipRooms[0]
      ];

      for (let i = 0; i < 8; i++) {
        const topZ = leftZBounds[i];
        const btmZ = leftZBounds[i + 1];
        const midZ = (topZ + btmZ) / 2;
        const hSpan = btmZ - topZ;

        g.add(
          maintAt(maintWall(wThick, WH, (hSpan - 1.1) / 2, 0x1e293b), -4.2, WH / 2, topZ + (hSpan - 1.1) / 4),
          maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -4.2, WH - 0.175, midZ),
          maintAt(maintWall(wThick, WH, (hSpan - 1.1) / 2, 0x1e293b), -4.2, WH / 2, btmZ - (hSpan - 1.1) / 4)
        );
        makeRomphoDoor(-4.2, midZ, 0.45, 1.1, 0.35);
        L.push(maintTag('🚪 ประตู', V(-3.85, 1.45, midZ), 'room', null, `ประตู${vipLeftRooms[i].name}`));

        makeVipRoomSuite(-13.5, topZ, -4.2, btmZ, vipLeftRooms[i]);
      }

      const elevGroup = new THREE.Group();
      elevGroup.position.set(-8.85, 0, 8.20);
      const elevFrame = maintBox(2.2, 2.2, 0.14, 0x64748b);
      elevFrame.position.set(0, 1.1, 0);
      const elevDoorL = maintBox(0.8, 2.0, 0.05, 0x94a3b8);
      elevDoorL.position.set(-0.41, 1.0, 0.06);
      const elevDoorR = maintBox(0.8, 2.0, 0.05, 0x94a3b8);
      elevDoorR.position.set(0.41, 1.0, 0.06);
      const elevDisplay = maintBox(0.32, 0.16, 0.05, 0x0284c7);
      elevDisplay.position.set(0, 2.05, 0.09);
      elevGroup.add(elevFrame, elevDoorL, elevDoorR, elevDisplay);
      g.add(elevGroup);
      L.push({ text: '🛗 ลิฟต์ชั้น 3', pos: V(-8.85, 2.1, 8.20), cls: 'int-label room-title' });

      g.add(
        maintAt(maintWall(wThick, WH, 0.70, 0x1e293b), -1.4, WH / 2, -8.90),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -1.4, WH - 0.175, -8.00),
        maintAt(maintWall(wThick, WH, 0.70, 0x1e293b), -1.4, WH / 2, -7.10),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -1.4, WH - 0.175, -5.55),
        maintAt(maintWall(wThick, WH, 1.30, 0x1e293b), -1.4, WH / 2, -4.35),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -1.4, WH - 0.175, -3.15),
        maintAt(maintWall(wThick, WH, 0.60, 0x1e293b), -1.4, WH / 2, -2.25),
        maintAt(maintWall(wThick, WH, 3.0, 0x1e293b), -1.4, WH / 2, -0.45),
        maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -1.4, WH - 0.175, 2.20),
        maintAt(maintWall(wThick, WH, 0.4, 0x1e293b), -1.4, WH / 2, 2.95),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -1.4, WH - 0.175, 4.20),
        maintAt(maintWall(wThick, WH, 1.0, 0x1e293b), -1.4, WH / 2, 5.25),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -1.4, WH - 0.175, 6.25),
        maintAt(maintWall(wThick, WH, 0.5, 0x1e293b), -1.4, WH / 2, 7.00),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -1.4, WH - 0.175, 8.25),
        maintAt(maintWall(wThick, WH, 0.45, 0x1e293b), -1.4, WH / 2, 9.025)
      );
      makeRomphoDoor(-1.4, -8.00, 0.45, 1.1, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, -8.00), 'room', null, 'ประตูห้องพิเศษ 309'));
      makeRomphoDoor(-1.4, -5.55, 0.45, 1.1, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, -5.55), 'room', null, 'ประตูห้องพิเศษ 311'));
      makeRomphoDoor(-1.4, -3.15, 0.45, 1.1, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, -3.15), 'room', null, 'ประตูห้องพิเศษ 312'));
      makeRomphoDoor(-1.4, 2.20, 0.45, 1.2, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, 2.20), 'room', null, 'ประตูเข้าเคาน์เตอร์พยาบาล'));
      makeRomphoDoor(-1.4, 4.20, 0.45, 1.1, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, 4.20), 'room', null, 'ประตูห้องพิเศษ 313'));
      makeRomphoDoor(-1.4, 6.25, 0.45, 1.1, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, 6.25), 'room', null, 'ประตูห้องพิเศษ 314'));
      makeRomphoDoor(-1.4, 8.25, 0.45, 1.1, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, 8.25), 'room', null, 'ประตูห้องพักเจ้าหน้าที่'));

      g.add(
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, -6.75),
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, -4.35),
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, -1.95),
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, 3.15),
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, 5.25),
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, 7.25)
      );

      makeVipRoomSuite(-1.4, -9.25, 13.5, -6.75, romphoState.vipRooms[8]);
      makeVipRoomSuite(-1.4, -6.75, 13.5, -4.35, romphoState.vipRooms[9]);
      makeVipRoomSuite(-1.4, -4.35, 13.5, -1.95, romphoState.vipRooms[10]);
      makeVipRoomSuite(-1.4, 3.15, 13.5, 5.25, romphoState.vipRooms[11]);
      makeVipRoomSuite(-1.4, 5.25, 13.5, 7.25, romphoState.vipRooms[12]);

      createVipPcDesk(-0.8, 0.4, Math.PI / 2, VIP_PC_SPECS, '🖥️ เค้าเตอร์โต๊ะคอมห้องพิเศษ (ROMPHO3: 10.10.40.24)', { role: 'nurse', pose: 'sit', rotY: Math.PI / 2 });

      const nurseCounter = maintBox(8.0, 1.05, 0.65, 0x0284c7);
      nurseCounter.position.set(5.2, 0.525, -1.4);
      const counterTop = maintBox(8.05, 0.06, 0.75, 0xffffff);
      counterTop.position.set(5.2, 1.05, -1.4);
      g.add(nurseCounter, counterTop);
      L.push({ text: '👩‍⚕️ เค้าเตอร์พยาบาล', pos: V(5.2, 1.85, -1.4), cls: 'int-label zone-er' });

      const meetTable = maintBox(3.0, 0.74, 1.2, 0xd97706);
      meetTable.position.set(5.0, 0.37, 0.6);
      [-0.9, 0, 0.9].forEach((ox) => {
        const chairU = maintBox(0.42, 0.45, 0.42, 0x334155);
        chairU.position.set(5.0 + ox, 0.225, 0.0);
        const chairD = maintBox(0.42, 0.45, 0.42, 0x334155);
        chairD.position.set(5.0 + ox, 0.225, 1.2);
        g.add(chairU, chairD);
      });
      g.add(meetTable);
      L.push({ text: '📊 โต๊ะประชุม', pos: V(5.0, 1.6, 0.6), cls: 'int-label sub-tag' });

      const storShelf = maintBox(0.65, 1.8, 2.8, 0x64748b);
      storShelf.position.set(9.2, 0.9, 0.6);
      g.add(storShelf);
      L.push({ text: 'ชั้นเก็บของ', pos: V(9.2, 1.6, 0.6), cls: 'int-label sub-tag' });

      const t1 = maintBox(1.7, 0.74, 0.8, 0x64748b);
      t1.position.set(2.8, 0.37, 2.3);
      const c1 = maintBox(0.42, 0.45, 0.42, 0x334155);
      c1.position.set(2.8, 0.225, 2.7);
      const t2 = maintBox(1.7, 0.74, 0.8, 0x64748b);
      t2.position.set(6.6, 0.37, 2.3);
      const c2 = maintBox(0.42, 0.45, 0.42, 0x334155);
      c2.position.set(6.6, 0.225, 2.7);
      g.add(t1, c1, t2, c2);

      g.add(
        maintAt(maintWall(wThick, WH, 1.8, 0x1e293b), 9.8, WH / 2, -1.05),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), 9.8, WH - 0.175, 0.4),
        maintAt(maintWall(wThick, WH, 2.2, 0x1e293b), 9.8, WH / 2, 2.05)
      );
      makeRomphoDoor(9.8, 0.4, 0.45, 1.1, 0.35);
      L.push(maintTag('🚪 ประตู', V(9.45, 1.45, 0.4), 'room', null, 'ประตูห้องน้ำเจ้าหน้าที่'));
      const staffWc = maintBox(0.45, 0.45, 0.65, 0xffffff);
      staffWc.position.set(12.0, 0.225, 0.6);
      g.add(staffWc);
      L.push({ text: '🚻 ห้องน้ำเจ้าหน้าที่', pos: V(11.6, 1.95, 0.6), cls: 'int-label room-title' });

      L.push({ text: '☕ ห้องพักเจ้าหน้าที่', pos: V(6.05, 1.95, 8.25), cls: 'int-label zone-pcu' });
      const sofaSt = maintBox(3.4, 0.65, 0.85, 0x334155);
      sofaSt.position.set(3.5, 0.325, 8.25);
      const dineSt = maintBox(2.4, 0.74, 0.9, 0xd97706);
      dineSt.position.set(8.8, 0.37, 8.25);
      const fridgeSt = maintBox(0.7, 1.5, 0.65, 0xe2e8f0);
      fridgeSt.position.set(12.5, 0.75, 8.25);
      g.add(sofaSt, dineSt, fridgeSt);

      const items = [
        ['🏢', 'ตึกร่มโพธิ์ 3 - ชั้น 3', 'หอผู้ป่วยพิเศษ (VIP Ward - ขยาย 10-15%)'],
        ['🛌', 'ห้องพิเศษ 13 ห้อง (301-308, 309, 311-314)', 'ตู้สีเหลืองเป็นระเบียบ คลิกห้องสลับ ว่าง/มีผู้ป่วย'],
        ['🟡', 'ตู้สีเหลืองประจำห้องพิเศษ', 'ตู้เก็บของสีเหลือง 13 ตู้ จัดวางเป็นระเบียบเรียบร้อย'],
        ['🖥️', 'PC-VIP-01: เค้าเตอร์โต๊ะคอมห้องพิเศษ (ROMPHO3: 10.10.40.24)', 'ดูสเปก', null, 'free', VIP_PC_SPECS],
        ['👩‍⚕️', 'เค้าเตอร์พยาบาลห้องพิเศษ', '1 จุด'],
        ['📊', 'โต๊ะประชุมแพทย์-พยาบาล', '1 ชุด (6 ที่นั่ง)'],
        ['🗄️', 'ชั้นเก็บของและเวชภัณฑ์', '1 จุด'],
        ['🪑', 'โต๊ะทำงานเจ้าหน้าที่', '2 ตัว'],
        ['☕', 'ห้องพักเจ้าหน้าที่', '1 ห้อง'],
        ['🛗', 'ลิฟต์ชั้น 3', '1 จุด'],
        ['🚻', 'ห้องน้ำเจ้าหน้าที่', '1 ห้อง'],
        ['🚪', 'ประตูทางเข้าและประตูห้องพักพิเศษ', '16 จุด ตามผัง']
      ];

      return {
        group: g,
        labels: L,
        title: 'ตึกร่มโพธิ์ 3 - ชั้น 3 (หอผู้ป่วยพิเศษ)',
        sub: 'ผังหอผู้ป่วยพิเศษ: ขยายขนาด 10-15% ห้องพิเศษ 13 ห้อง (พร้อมตู้สีเหลืองเป็นระเบียบ) • เค้าเตอร์พยาบาล • โต๊ะคอมห้องพิเศษ • โต๊ะประชุม • ลิฟต์ • ห้องพักเจ้าหน้าที่',
        floors: [
          { num: 1, label: 'ชั้น 1 (ห้องคลอด • ช่อง 1 พัฒนาการเด็ก • ช่อง 2 ระบาดวิทยา)' },
          { num: 2, label: 'ชั้น 2 (ศูนย์ไตเทียม)' },
          { num: 3, label: 'ชั้น 3 (หอผู้ป่วยพิเศษ)' }
        ],
        currentFloor: 3,
        onSelectFloor: (f) => {
          romphoState.currentFloor = f;
        },
        items,
        cam: { pos: V(0, 24.0, 20.0), target: V(0, 0, 0.5) }
      };
    }

    // =========================================================================
    // ชั้น 2: ศูนย์ไตเทียม (Hemodialysis Unit)
    // =========================================================================
    if (romphoState.currentFloor === 2) {
      function makeRomphoDoor(x, z, w, d, rotY = 0) {
        const dg = new THREE.Group();
        dg.position.set(x, 0, z);
        const isHoriz = w >= d;
        const pad = maintBox(w, 0.04, d, 0xe2e8f0);
        pad.position.set(0, 0.02, 0);
        dg.add(pad);
        const leafW = isHoriz ? w * 0.85 : 0.07;
        const leafD = isHoriz ? 0.07 : d * 0.85;
        const leaf = maintBox(leafW, 1.95, leafD, 0x0284c7);
        leaf.position.set(0, 0.98, 0);
        leaf.rotation.y = rotY;
        dg.add(leaf);
        const winW = isHoriz ? 0.22 : 0.08;
        const winD = isHoriz ? 0.08 : 0.22;
        const win = maintBox(winW, 0.38, winD, 0xbae6fd);
        win.position.set(0, 1.25, 0);
        dg.add(win);
        g.add(dg);
      }

      function makeHemoStation(x, z, num, bedId, isOccupied, rotY = 0) {
        const bg = new THREE.Group();
        bg.position.set(x, 0, z);
        bg.rotation.y = rotY;

        const bw = 0.95, bd = 1.95;
        const frame = maintBox(bw, 0.42, bd, 0x64748b);
        frame.position.set(0, 0.21, 0);
        bg.add(frame);

        const matCol = isOccupied ? 0xf43f5e : 0x059669;
        const sheet = maintBox(bw - 0.06, 0.16, bd - 0.06, matCol);
        sheet.position.set(0, 0.50, 0);
        bg.add(sheet);

        const head = maintBox(bw + 0.02, 0.45, 0.06, 0x0284c7);
        head.position.set(0, 0.65, -bd / 2 + 0.03);
        const pillow = maintBox(bw * 0.65, 0.08, 0.32, 0xffffff);
        pillow.position.set(0, 0.62, -bd / 2 + 0.26);
        const blanket = maintBox(bw - 0.04, 0.08, bd * 0.58, isOccupied ? 0xfecdd3 : 0xa7f3d0);
        blanket.position.set(0, 0.62, bd * 0.18);
        bg.add(head, pillow, blanket);

        const machineGroup = new THREE.Group();
        machineGroup.position.set(bw / 2 + 0.42, 0, -0.2);

        const mcBody = maintBox(0.48, 1.25, 0.42, 0xf8fafc);
        mcBody.position.set(0, 0.625, 0);
        const mcScreen = maintBox(0.36, 0.26, 0.04, 0x0284c7);
        mcScreen.position.set(0, 1.38, -0.12);
        const mcPump = maintCyl(0.08, 0.08, 0.04, 0xef4444, 16);
        mcPump.rotation.x = Math.PI / 2;
        mcPump.position.set(-0.10, 0.95, 0.22);
        const filterCyl = maintCyl(0.045, 0.045, 0.35, 0x38bdf8, 14);
        filterCyl.position.set(0.12, 0.95, 0.22);
        const jugA = maintBox(0.14, 0.24, 0.14, 0xef4444);
        jugA.position.set(-0.12, 0.12, 0.22);
        const jugB = maintBox(0.14, 0.24, 0.14, 0x3b82f6);
        jugB.position.set(0.12, 0.12, 0.22);
        const mcPole = maintCyl(0.015, 0.015, 1.8, 0x94a3b8);
        mcPole.position.set(-0.20, 0.9, -0.15);
        const saline = maintBox(0.08, 0.18, 0.05, 0x38bdf8);
        saline.position.set(-0.20, 1.65, -0.15);

        machineGroup.add(mcBody, mcScreen, mcPump, filterCyl, jugA, jugB, mcPole, saline);
        bg.add(machineGroup);

        if (isOccupied) {
          const pat = makePerson({ role: 'patient', pose: 'lie', rotY: 0 });
          bg.add(pat);
          const nurse = makePerson({ role: 'nurse', pose: 'stand', rotY: -Math.PI / 2 });
          nurse.position.set(bw / 2 + 0.38, 0, 0.45);
          bg.add(nurse);
        }

        g.add(bg);

        const statusText = isOccupied ? '🔴 กำลังฟอกเลือด' : '🟢 ว่าง';
        L.push({
          text: `เตียงฟอกไต ${num} (${statusText})`,
          pos: V(x, 1.85, z),
          cls: `int-label ${isOccupied ? 'busy' : 'free'} toggleable`,
          toggleId: bedId
        });
        return bg;
      }

      function createNurseDesk(x, z, rotY, spec, labelText, personOpts = null) {
        const dg = new THREE.Group();
        dg.position.set(x, 0, z);
        dg.rotation.y = rotY;

        dg.add(
          maintAt(maintBox(2.2, 0.76, 0.85, 0xffffff), 0, 0.38, 0),
          maintAt(maintBox(2.24, 0.05, 0.90, 0x0284c7), 0, 0.78, 0),
          maintAt(maintBox(2.24, 0.35, 0.06, 0x38bdf8), 0, 0.95, -0.42)
        );

        const mon = maintBox(0.55, 0.34, 0.04, 0x0f172a);
        mon.position.set(0, 0.98, -0.15);
        const scr = maintBox(0.51, 0.30, 0.01, 0x0284c7);
        scr.position.set(0, 0.98, -0.12);
        const stand = maintBox(0.06, 0.16, 0.06, 0x475569);
        stand.position.set(0, 0.86, -0.15);
        const base = maintBox(0.24, 0.02, 0.18, 0x475569);
        base.position.set(0, 0.79, -0.15);
        dg.add(mon, scr, stand, base);

        const kb = maintBox(0.42, 0.015, 0.15, 0x1e293b);
        kb.position.set(0, 0.81, 0.12);
        const mouse = maintBox(0.06, 0.015, 0.09, 0x1e293b);
        mouse.position.set(0.30, 0.81, 0.12);
        dg.add(kb, mouse);

        const pcCase = maintBox(0.18, 0.40, 0.38, 0x1e293b);
        pcCase.position.set(0.85, 0.38, 0.05);
        dg.add(pcCase);

        const chair = maintBox(0.48, 0.46, 0.48, 0x334155);
        chair.position.set(0, 0.23, 0.58);
        const back = maintBox(0.48, 0.46, 0.06, 0x334155);
        back.position.set(0, 0.69, 0.79);
        dg.add(chair, back);

        if (personOpts) {
          const staff = makePerson(personOpts);
          staff.position.set(0, 0, 0.55);
          dg.add(staff);
        }

        dg.traverse((child) => {
          if (child.isMesh) child.userData.pcInfo = spec;
        });

        g.add(dg);

        if (labelText) {
          L.push({
            text: labelText,
            pos: V(x, 1.95, z),
            cls: 'int-label pc-tag',
            pcInfo: spec
          });
        }
        return dg;
      }

      floor(g, 9.1, 2.1, '#e0f2fe', '#93c5fd', 0.6, -8.95, -8.20);
      floor(g, 9.1, 2.1, '#f0fdf4', '#bbf7d0', 0.6, -8.95, -6.10);
      floor(g, 9.1, 3.0, '#f1f5f9', '#94a3b8', 0.6, -8.95, -3.55);
      floor(g, 9.1, 3.0, '#fffbeb', '#fde68a', 0.6, -8.95, -0.55);
      floor(g, 9.1, 1.7, '#fef3c7', '#fde68a', 0.6, -8.95, 1.80);
      floor(g, 9.1, 1.7, '#fef3c7', '#fde68a', 0.6, -8.95, 3.50);
      floor(g, 9.1, 1.65, '#fef3c7', '#fde68a', 0.6, -8.95, 5.175);

      floor(g, 3.0, 15.25, '#f8fafc', '#cbd5e1', 0.6, -2.9, -1.625);
      walkwayStrip(g, -2.9, -1.625, 14.5, 1.5, Math.PI / 2);

      floor(g, 2.8, 3.25, '#fef3c7', '#fde68a', 0.6, -12.1, 7.625);
      floor(g, 24.2, 3.25, '#f8fafc', '#cbd5e1', 0.6, 1.4, 7.625);

      floor(g, 5.4, 3.25, '#f8fafc', '#cbd5e1', 0.6, 6.3, -7.625);
      floor(g, 4.5, 3.25, '#e0f2fe', '#93c5fd', 0.6, 11.25, -7.625);
      floor(g, 14.9, 9.6, '#f0fdfa', '#99f6e4', 0.6, 6.05, -1.20);
      floor(g, 7.6, 2.4, '#fffbeb', '#fde68a', 0.6, 2.4, 4.8);
      floor(g, 7.3, 2.4, '#e0f2fe', '#93c5fd', 0.6, 9.85, 4.8);

      g.add(
        maintAt(maintWall(9.1, WH, wThick, 0x1e293b), -8.95, WH / 2, zMin + wThick / 2),
        maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -2.9, WH - 0.175, zMin + wThick / 2),
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, zMin + wThick / 2)
      );
      makeRomphoDoor(-2.9, zMin + wThick / 2, 1.4, 0.45, 0.3);
      L.push(maintTag('🚪 ประตู', V(-2.9, 1.45, zMin + 0.35), 'room', null, 'ประตูทางเข้าหลักโถงชั้น 2 (บน)'));

      g.add(maintAt(maintWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zMax - wThick / 2));
      g.add(
        maintAt(maintWall(wThick, WH, D, 0x1e293b), xMin + wThick / 2, WH / 2, 0),
        maintAt(maintWall(wThick, WH, D, 0x1e293b), xMax - wThick / 2, WH / 2, 0)
      );

      g.add(
        maintAt(maintWall(wThick, WH, 0.50, 0x1e293b), -4.4, WH / 2, -9.00),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -4.4, WH - 0.175, -8.20),
        maintAt(maintWall(wThick, WH, 1.00, 0x1e293b), -4.4, WH / 2, -7.15),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -4.4, WH - 0.175, -6.10),
        maintAt(maintWall(wThick, WH, 1.45, 0x1e293b), -4.4, WH / 2, -4.825),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -4.4, WH - 0.175, -3.55),
        maintAt(maintWall(wThick, WH, 1.90, 0x1e293b), -4.4, WH / 2, -2.05),
        maintAt(maintWall(wThick, 0.35, 1.1, 0x1e293b), -4.4, WH - 0.175, -0.55),
        maintAt(maintWall(wThick, WH, 1.25, 0x1e293b), -4.4, WH / 2, 0.625),
        maintAt(maintWall(wThick, 0.35, 1.0, 0x1e293b), -4.4, WH - 0.175, 1.80),
        maintAt(maintWall(wThick, WH, 0.70, 0x1e293b), -4.4, WH / 2, 2.65),
        maintAt(maintWall(wThick, 0.35, 1.0, 0x1e293b), -4.4, WH - 0.175, 3.50),
        maintAt(maintWall(wThick, WH, 0.675, 0x1e293b), -4.4, WH / 2, 4.3375),
        maintAt(maintWall(wThick, 0.35, 1.0, 0x1e293b), -4.4, WH - 0.175, 5.175),
        maintAt(maintWall(wThick, WH, 0.325, 0x1e293b), -4.4, WH / 2, 5.8375)
      );
      makeRomphoDoor(-4.4, -8.20, 0.45, 1.1, 0.35);
      L.push(maintTag('🚪 ประตู', V(-4.05, 1.45, -8.20), 'room', null, 'ประตูห้องล้างตัวกรอง'));
      makeRomphoDoor(-4.4, -6.10, 0.45, 1.1, 0.35);
      L.push(maintTag('🚪 ประตู', V(-4.05, 1.45, -6.10), 'room', null, 'ประตูห้องเก็บตัวกรอง'));
      makeRomphoDoor(-4.4, -3.55, 0.45, 1.1, 0.35);
      L.push(maintTag('🚪 ประตู', V(-4.05, 1.45, -3.55), 'room', null, 'ประตูห้องระบบน้ำ RO'));
      makeRomphoDoor(-4.4, -0.55, 0.45, 1.1, 0.35);
      L.push(maintTag('🚪 ประตู', V(-4.05, 1.45, -0.55), 'room', null, 'ประตูห้องเก็บเวชภัณฑ์'));
      makeRomphoDoor(-4.4, 1.80, 0.45, 1.0, 0.35);
      L.push(maintTag('🚪 ประตู', V(-4.05, 1.45, 1.80), 'room', null, 'ประตูห้องพักเจ้าหน้าที่ 3'));
      makeRomphoDoor(-4.4, 3.50, 0.45, 1.0, 0.35);
      L.push(maintTag('🚪 ประตู', V(-4.05, 1.45, 3.50), 'room', null, 'ประตูห้องพักเจ้าหน้าที่ 2'));
      makeRomphoDoor(-4.4, 5.175, 0.45, 1.0, 0.35);
      L.push(maintTag('🚪 ประตู', V(-4.05, 1.45, 5.175), 'room', null, 'ประตูห้องพักเจ้าหน้าที่ 1'));

      g.add(
        maintAt(maintWall(9.1, WH, wThick, 0x1e293b), -8.95, WH / 2, -7.15),
        maintAt(maintWall(9.1, WH, wThick, 0x1e293b), -8.95, WH / 2, -5.05),
        maintAt(maintWall(9.1, WH, wThick, 0x1e293b), -8.95, WH / 2, -2.05),
        maintAt(maintWall(9.1, WH, wThick, 0x1e293b), -8.95, WH / 2, 0.95),
        maintAt(maintWall(9.1, WH, wThick, 0x1e293b), -8.95, WH / 2, 2.65),
        maintAt(maintWall(9.1, WH, wThick, 0x1e293b), -8.95, WH / 2, 4.35)
      );

      g.add(
        maintAt(maintWall(9.1, WH, wThick, 0x1e293b), -8.95, WH / 2, 6.0),
        maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -2.9, WH - 0.175, 6.0),
        maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, 6.0)
      );
      makeRomphoDoor(-2.9, 6.0, 1.4, 0.45, 0.3);
      L.push(maintTag('🚪 ประตู', V(-2.9, 1.45, 6.0), 'room', null, 'ประตูเชื่อมโถงทางเข้าชั้น 2'));

      g.add(
        maintAt(maintWall(wThick, WH, 1.1, 0x1e293b), -10.7, WH / 2, 6.55),
        maintAt(maintWall(wThick, 0.35, 1.0, 0x1e293b), -10.7, WH - 0.175, 7.6),
        maintAt(maintWall(wThick, WH, 1.15, 0x1e293b), -10.7, WH / 2, 8.675)
      );
      makeRomphoDoor(-10.7, 7.6, 0.45, 1.0, 0.35);
      L.push(maintTag('🚪 ประตู', V(-10.35, 1.45, 7.6), 'room', null, 'ประตูเข้าห้องพระ'));

      g.add(
        maintAt(maintWall(wThick, WH, 6.05, 0x1e293b), -1.4, WH / 2, -6.225),
        maintAt(maintWall(wThick, WH, 5.00, 0x1e293b), -1.4, WH / 2, -0.70),
        maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -1.4, WH - 0.175, 2.4),
        maintAt(maintWall(wThick, WH, 1.2, 0x1e293b), -1.4, WH / 2, 3.6),
        maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -1.4, WH - 0.175, 4.8),
        maintAt(maintWall(wThick, WH, 0.6, 0x1e293b), -1.4, WH / 2, 5.7)
      );
      makeRomphoDoor(-1.4, 2.4, 0.45, 1.2, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, 2.4), 'room', null, 'ประตูเข้าห้องฟอกไต (จากโถงกลาง)'));
      makeRomphoDoor(-1.4, 4.8, 0.45, 1.2, -0.35);
      L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, 4.8), 'room', null, 'ประตูเข้าห้องพักญาติ'));

      g.add(
        maintAt(maintWall(0.9, WH, wThick, 0x1e293b), -3.95, WH / 2, -7.4),
        maintAt(maintWall(1.2, 0.35, wThick, 0x1e293b), -2.9, WH - 0.175, -7.4),
        maintAt(maintWall(0.9, WH, wThick, 0x1e293b), -1.85, WH / 2, -7.4)
      );
      makeRomphoDoor(-2.9, -7.4, 1.2, 0.45, 0.3);
      L.push(maintTag('🚪 ประตู', V(-2.9, 1.45, -7.4), 'room', null, 'ประตูโถงทางเดินชั้น 2'));

      g.add(
        maintAt(maintWall(8.8, WH, wThick, 0x1e293b), 3.0, WH / 2, -6.0),
        maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 8.1, WH - 0.175, -6.0),
        maintAt(maintWall(4.7, WH, wThick, 0x1e293b), 11.15, WH / 2, -6.0)
      );
      makeRomphoDoor(8.1, -6.0, 1.4, 0.45, 0.3);
      L.push(maintTag('🚪 ประตู', V(8.1, 1.45, -6.0), 'room', null, 'ประตูทางเข้าห้องฟอกไต (บน)'));

      g.add(
        maintAt(maintWall(wThick, WH, 3.25, 0x1e293b), 3.6, WH / 2, -7.625),
        maintAt(maintWall(wThick, WH, 3.25, 0x1e293b), 9.0, WH / 2, -7.625),
        maintAt(maintWall(wThick, WH, 1.0, 0x1e293b), 9.6, WH / 2, -8.75),
        maintAt(maintWall(wThick, 0.35, 1.0, 0x1e293b), 9.6, WH - 0.175, -7.75),
        maintAt(maintWall(wThick, WH, 1.25, 0x1e293b), 9.6, WH / 2, -6.625)
      );
      makeRomphoDoor(9.6, -7.75, 0.45, 1.0, 0.35);
      L.push(maintTag('🚪 ประตู', V(9.25, 1.45, -7.75), 'room', null, 'ประตูห้องน้ำเจ้าหน้าที่'));

      g.add(
        maintAt(maintWall(10.8, WH, wThick, 0x1e293b), 4.0, WH / 2, 3.6),
        maintAt(maintWall(1.2, 0.35, wThick, 0x1e293b), 10.0, WH - 0.175, 3.6),
        maintAt(maintWall(2.9, WH, wThick, 0x1e293b), 12.05, WH / 2, 3.6)
      );
      makeRomphoDoor(10.0, 3.6, 1.2, 0.45, 0.3);
      L.push(maintTag('🚪 ประตู', V(10.0, 1.45, 3.6), 'room', null, 'ประตูเข้าห้องน้ำผู้ป่วย'));

      g.add(maintAt(maintWall(wThick, WH, 2.4, 0x1e293b), 6.2, WH / 2, 4.8));

      L.push({ text: '🔬 ห้องล้างตัวกรอง+เก็บอุปกรณ์', pos: V(-8.95, 1.95, -8.20), cls: 'int-label room-title' });
      const dialyzerWashSink = maintBox(3.4, 0.85, 0.7, 0x94a3b8);
      dialyzerWashSink.position.set(-8.95, 0.425, -8.6);
      const reprocessMachine = maintBox(1.2, 1.35, 0.6, 0x0284c7);
      reprocessMachine.position.set(-12.4, 0.675, -8.20);
      g.add(dialyzerWashSink, reprocessMachine);

      L.push({ text: '📦 ห้องเก็บตัวกรอง+เก็บอุปกรณ์', pos: V(-8.95, 1.95, -6.10), cls: 'int-label room-title' });
      const dialyzerRack1 = maintBox(3.8, 1.8, 0.55, 0x64748b);
      dialyzerRack1.position.set(-8.95, 0.9, -6.5);
      const dialyzerRack2 = maintBox(3.8, 1.8, 0.55, 0x64748b);
      dialyzerRack2.position.set(-8.95, 0.9, -5.7);
      g.add(dialyzerRack1, dialyzerRack2);

      L.push({
        text: `💧 ห้องระบบน้ำ RO (${romphoState.roRunning ? '🟢 ปกติ' : '🔴 ปิดซ่อม'})`,
        pos: V(-8.95, 2.1, -3.55),
        cls: `int-label ${romphoState.roRunning ? 'free' : 'busy'} toggleable`,
        toggleId: 'hemo-ro-system'
      });
      const roGroup = new THREE.Group();
      roGroup.position.set(-8.95, 0, -3.55);
      const tank1 = maintCyl(0.45, 0.45, 1.7, 0x3b82f6, 16);
      tank1.position.set(-2.0, 0.85, -0.6);
      const tank2 = maintCyl(0.45, 0.45, 1.7, 0x0284c7, 16);
      tank2.position.set(-0.8, 0.85, -0.6);
      const tank3 = maintCyl(0.40, 0.40, 1.6, 0x0ea5e9, 16);
      tank3.position.set(0.5, 0.8, -0.6);
      const brineTank = maintCyl(0.38, 0.38, 1.0, 0xffffff, 16);
      brineTank.position.set(1.6, 0.5, -0.6);
      const roMem1 = maintCyl(0.14, 0.14, 2.4, 0x94a3b8, 14);
      roMem1.rotation.z = Math.PI / 2;
      roMem1.position.set(0, 1.35, 0.6);
      const roMem2 = maintCyl(0.14, 0.14, 2.4, 0x94a3b8, 14);
      roMem2.rotation.z = Math.PI / 2;
      roMem2.position.set(0, 1.00, 0.6);
      const pump1 = maintBox(0.48, 0.60, 0.75, 0x1e293b);
      pump1.position.set(-1.6, 0.30, 0.6);
      const roPanel = maintBox(0.55, 1.25, 0.2, 0x334155);
      roPanel.position.set(1.6, 0.9, 0.6);
      const roScreen = maintBox(0.32, 0.22, 0.02, romphoState.roRunning ? 0x22c55e : 0xef4444);
      roScreen.position.set(1.6, 1.15, 0.71);
      roGroup.add(tank1, tank2, tank3, brineTank, roMem1, roMem2, pump1, roPanel, roScreen);
      g.add(roGroup);

      L.push({ text: '💉 ห้องเก็บเวชภัณฑ์ห้องไต', pos: V(-8.95, 1.95, -0.55), cls: 'int-label room-title' });
      const supplyRackL = maintBox(0.65, 1.8, 2.4, 0x94a3b8);
      supplyRackL.position.set(-12.8, 0.9, -0.55);
      const supplyBoxes = maintBox(3.2, 1.2, 1.4, 0xd97706);
      supplyBoxes.position.set(-8.95, 0.6, -0.55);
      g.add(supplyRackL, supplyBoxes);

      L.push({ text: '☕ ห้องพักเจ้าหน้าที่ 3', pos: V(-8.95, 1.85, 1.80), cls: 'int-label sub-tag' });
      const sofaS3 = maintBox(2.0, 0.55, 0.75, 0x475569);
      sofaS3.position.set(-11.8, 0.275, 1.80);
      const deskS3 = maintBox(1.3, 0.74, 0.6, 0x64748b);
      deskS3.position.set(-6.8, 0.37, 1.80);
      g.add(sofaS3, deskS3);

      L.push({ text: '☕ ห้องพักเจ้าหน้าที่ 2', pos: V(-8.95, 1.85, 3.50), cls: 'int-label sub-tag' });
      const sofaS2 = maintBox(2.0, 0.55, 0.75, 0x475569);
      sofaS2.position.set(-11.8, 0.275, 3.50);
      const deskS2 = maintBox(1.3, 0.74, 0.6, 0x64748b);
      deskS2.position.set(-6.8, 0.37, 3.50);
      g.add(sofaS2, deskS2);

      L.push({ text: '☕ ห้องพักเจ้าหน้าที่ 1', pos: V(-8.95, 1.85, 5.175), cls: 'int-label sub-tag' });
      const sofaS1 = maintBox(2.0, 0.55, 0.75, 0x475569);
      sofaS1.position.set(-11.8, 0.275, 5.175);
      const deskS1 = maintBox(1.3, 0.74, 0.6, 0x64748b);
      deskS1.position.set(-6.8, 0.37, 5.175);
      g.add(sofaS1, deskS1);

      L.push({ text: '🙏 ห้องพระ', pos: V(-12.1, 1.95, 7.625), cls: 'int-label room-title' });
      const altarGroup = new THREE.Group();
      altarGroup.position.set(-12.1, 0, 7.625);
      const altarBase = maintBox(1.8, 0.65, 0.85, 0x78350f);
      altarBase.position.set(0, 0.325, 0);
      const altarTop = maintBox(1.2, 0.35, 0.55, 0x92400e);
      altarTop.position.set(0, 0.825, -0.1);
      const buddhaStatue = maintCyl(0.16, 0.24, 0.48, 0xfacc15, 12);
      buddhaStatue.position.set(0, 1.24, -0.1);
      const vaseL = maintCyl(0.04, 0.06, 0.22, 0xfef08a);
      vaseL.position.set(-0.40, 1.11, -0.1);
      const vaseR = maintCyl(0.04, 0.06, 0.22, 0xfef08a);
      vaseR.position.set(0.40, 1.11, -0.1);
      const incense = maintCyl(0.08, 0.08, 0.08, 0xd97706);
      incense.position.set(0, 1.04, 0.12);
      const prayerCushion = maintBox(0.70, 0.08, 0.60, 0xfbbf24);
      prayerCushion.position.set(0, 0.04, 0.95);
      altarGroup.add(altarBase, altarTop, buddhaStatue, vaseL, vaseR, incense, prayerCushion);
      g.add(altarGroup);

      L.push({ text: '🛗 ลิฟต์ชั้น 2', pos: V(-9.2, 2.05, 6.0), cls: 'int-label room-title' });
      const elevGroup = new THREE.Group();
      elevGroup.position.set(-9.2, 0, 6.0);
      const elevFrame = maintBox(2.0, 2.2, 0.12, 0x64748b);
      elevFrame.position.set(0, 1.1, 0);
      const elevDoorL = maintBox(0.70, 2.0, 0.04, 0x94a3b8);
      elevDoorL.position.set(-0.36, 1.0, 0.05);
      const elevDoorR = maintBox(0.70, 2.0, 0.04, 0x94a3b8);
      elevDoorR.position.set(0.36, 1.0, 0.05);
      const elevDisplay = maintBox(0.30, 0.15, 0.04, 0x0284c7);
      elevDisplay.position.set(0, 2.05, 0.08);
      elevGroup.add(elevFrame, elevDoorL, elevDoorR, elevDisplay);
      g.add(elevGroup);

      const waitXs = [-6.0, -2.9, 0.2, 3.3];
      waitXs.forEach((wx) => {
        const bench = maintBox(2.0, 0.42, 0.55, 0x0284c7);
        bench.position.set(wx, 0.21, 8.2);
        const backRest = maintBox(2.0, 0.42, 0.06, 0x0369a1);
        backRest.position.set(wx, 0.55, 8.45);
        g.add(bench, backRest);
      });
      L.push({ text: '🪑 ที่นั่งคอย (4 จุด)', pos: V(-1.5, 1.55, 8.2), cls: 'int-label sub-tag' });

      const signGroup = new THREE.Group();
      signGroup.position.set(4.2, 1.45, 5.95);
      const signBoard = maintBox(3.0, 0.65, 0.08, 0x0284c7);
      const signTextPad = maintBox(2.8, 0.50, 0.10, 0xffffff);
      signGroup.add(signBoard, signTextPad);
      g.add(signGroup);
      L.push({ text: '🏷️ ศูนย์ไตเทียม (ป้ายไตเทียม)', pos: V(4.2, 1.95, 6.0), cls: 'int-label zone-pcu' });

      L.push({ text: '🛠️ ห้องเตรียมอุปกรณ์', pos: V(6.3, 1.95, -7.625), cls: 'int-label room-title' });
      const prepTable = maintBox(3.0, 0.85, 0.8, 0x94a3b8);
      prepTable.position.set(6.3, 0.425, -8.4);
      g.add(prepTable);

      L.push({ text: '🚻 ห้องน้ำเจ้าหน้าที่', pos: V(11.25, 1.95, -7.625), cls: 'int-label room-title' });
      const staffToilet = maintBox(0.45, 0.45, 0.65, 0xffffff);
      staffToilet.position.set(12.4, 0.225, -7.625);
      g.add(staffToilet);

      L.push({ text: '🏥 ห้องฟอกไต (ศูนย์ไตเทียม 17 เตียง)', pos: V(6.05, 2.3, -1.20), cls: 'int-label zone-er' });

      const bedLeftZs = [2.8, 2.0, 1.2, 0.4, -0.4, -1.2, -2.0, -2.8, -3.6];
      bedLeftZs.forEach((bz, idx) => {
        const bedNum = idx + 1;
        makeHemoStation(0.6, bz, bedNum, `hemo-bed-${bedNum}`, romphoState.hemoBeds[idx].occupied, Math.PI / 2);
      });

      const bedRightZs = [-3.4, -2.5, -1.6, -0.7, 0.2, 1.1, 2.0, 2.9];
      bedRightZs.forEach((bz, idx) => {
        const bedNum = idx + 10;
        makeHemoStation(11.5, bz, bedNum, `hemo-bed-${bedNum}`, romphoState.hemoBeds[idx + 9].occupied, -Math.PI / 2);
      });

      createNurseDesk(5.8, -2.0, 0, HEMO_PC_SPECS_2, '🖥️ โต๊ะพยาบาล 2 (มอนิเตอร์)', { role: 'nurse', pose: 'sit', rotY: 0 });
      createNurseDesk(5.8, 1.2, 0, HEMO_PC_SPECS_1, '🖥️ โต๊ะพยาบาล 1 (เวชระเบียน)', { role: 'nurse', pose: 'sit', rotY: 0 });

      L.push({ text: '🛋️ ห้องพักญาติ', pos: V(2.4, 1.95, 4.8), cls: 'int-label room-title' });
      const relSofa = maintBox(3.8, 0.65, 0.9, 0x475569);
      relSofa.position.set(2.4, 0.325, 5.0);
      const relTable = maintBox(1.8, 0.45, 0.7, 0xd97706);
      relTable.position.set(2.4, 0.225, 4.2);
      g.add(relSofa, relTable);

      L.push({ text: '🚻 ห้องน้ำผู้ป่วย', pos: V(9.85, 1.95, 4.8), cls: 'int-label room-title' });
      const patToilet = maintBox(0.5, 0.45, 0.7, 0xffffff);
      patToilet.position.set(12.2, 0.225, 4.8);
      const patGrabBar = maintBox(0.04, 0.8, 0.6, 0x94a3b8);
      patGrabBar.position.set(11.5, 0.4, 4.8);
      const patSink = maintBox(0.65, 0.8, 0.45, 0xffffff);
      patSink.position.set(8.2, 0.4, 5.2);
      g.add(patToilet, patGrabBar, patSink);

      const items = [
        ['🏢', 'ตึกร่มโพธิ์ 3 - ชั้น 2', 'ศูนย์ไตเทียม (Hemodialysis Unit - ขยาย 10-15%)'],
        ['🛏️', 'เตียงฟอกไตและเครื่องไตเทียม', '17 เตียง (คลิกเตียงเพื่อสลับ ว่าง/กำลังฟอก)'],
        ['🖥️', 'PC-HEMO-01: โต๊ะพยาบาล 1 (เวชระเบียน)', 'ดูสเปก', null, 'free', HEMO_PC_SPECS_1],
        ['🖥️', 'PC-HEMO-02: โต๊ะพยาบาล 2 (มอนิเตอร์)', 'ดูสเปก', null, 'free', HEMO_PC_SPECS_2],
        ['💧', 'ห้องระบบน้ำ RO (Reverse Osmosis)', 'ระบบบริสุทธิ์สูง 2 ขั้นตอน', 'hemo-ro-system', romphoState.roRunning ? 'free' : 'busy'],
        ['🔬', 'ห้องล้างตัวกรอง+เก็บอุปกรณ์', '1 ห้อง'],
        ['📦', 'ห้องเก็บตัวกรอง+เก็บอุปกรณ์', '1 ห้อง'],
        ['💉', 'ห้องเก็บเวชภัณฑ์ห้องไต', '1 ห้อง'],
        ['☕', 'ห้องพักเจ้าหน้าที่ (ห้อง 1, 2, 3)', '3 ห้อง'],
        ['🛋️', 'ห้องพักญาติ', '1 ห้อง'],
        ['🙏', 'ห้องพระประจำชั้น', 'โต๊ะหมู่บูชาและพระพุทธรูป'],
        ['🛗', 'ลิฟต์ชั้น 2', '1 จุด'],
        ['🪑', 'ที่นั่งคอยผู้มารับบริการ', '4 จุด (โถงทางเข้า)'],
        ['🏷️', 'ป้ายศูนย์ไตเทียม', 'ติดตั้งหน้าโถง'],
        ['🛠️', 'ห้องเตรียมอุปกรณ์', '1 ห้อง'],
        ['🚻', 'ห้องน้ำเจ้าหน้าที่ & ห้องน้ำผู้ป่วย', '2 ห้อง'],
        ['🚪', 'ประตูทางเข้าและประตูห้องภายใน', '16 จุด ตามผัง']
      ];

      return {
        group: g,
        labels: L,
        title: 'ตึกร่มโพธิ์ 3 - ชั้น 2 (ศูนย์ไตเทียม)',
        sub: 'ผังชั้น 2 ศูนย์ไตเทียม: ขยายขนาด 10-15% ห้องฟอกไต 17 เตียง • โต๊ะพยาบาล 1-2 • ห้องระบบน้ำ RO • ห้องล้าง/เก็บตัวกรอง • ห้องเก็บเวชภัณฑ์ • ห้องพักเจ้าหน้าที่ 1-3 • ห้องพักญาติ • ลิฟต์ • ห้องพระ',
        floors: [
          { num: 1, label: 'ชั้น 1 (ห้องคลอด • ช่อง 1 พัฒนาการเด็ก • ช่อง 2 ระบาดวิทยา)' },
          { num: 2, label: 'ชั้น 2 (ศูนย์ไตเทียม)' },
          { num: 3, label: 'ชั้น 3 (หอผู้ป่วยพิเศษ)' }
        ],
        currentFloor: 2,
        onSelectFloor: (f) => {
          romphoState.currentFloor = f;
        },
        items,
        cam: { pos: V(0, 24.0, 20.0), target: V(0, 0, 0.5) }
      };
    }

    // =========================================================================
    // ชั้น 1: แผนกห้องคลอดและสูติกรรม (Labor & Delivery)
    // =========================================================================
    function makeRomphoDoor(x, z, w, d, rotY = 0) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const isHoriz = w >= d;
      const pad = maintBox(w, 0.04, d, 0xe2e8f0);
      pad.position.set(0, 0.02, 0);
      dg.add(pad);
      const leafW = isHoriz ? w * 0.85 : 0.07;
      const leafD = isHoriz ? 0.07 : d * 0.85;
      const leaf = maintBox(leafW, 1.95, leafD, 0x0284c7);
      leaf.position.set(0, 0.98, 0);
      leaf.rotation.y = rotY;
      dg.add(leaf);
      const winW = isHoriz ? 0.22 : 0.08;
      const winD = isHoriz ? 0.08 : 0.22;
      const win = maintBox(winW, 0.38, winD, 0xbae6fd);
      win.position.set(0, 1.25, 0);
      dg.add(win);
      g.add(dg);
    }

    function makeRomphoBed(x, z, num, bedId, isOccupied, rotY = 0) {
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);
      bg.rotation.y = rotY;

      const bw = 0.94, bd = 1.95;
      const frame = maintBox(bw, 0.42, bd, 0x64748b);
      frame.position.set(0, 0.21, 0);
      bg.add(frame);
      const matCol = isOccupied ? 0xf43f5e : 0x10b981;
      const sheet = maintBox(bw - 0.06, 0.16, bd - 0.06, matCol);
      sheet.position.set(0, 0.50, 0);
      bg.add(sheet);
      const head = maintBox(bw + 0.04, 0.45, 0.06, 0x0284c7);
      head.position.set(0, 0.65, -bd / 2 + 0.03);
      bg.add(head);
      const foot = maintBox(bw + 0.04, 0.35, 0.06, 0x0284c7);
      foot.position.set(0, 0.60, bd / 2 - 0.03);
      bg.add(foot);
      const pillow = maintBox(bw * 0.65, 0.08, 0.32, 0xffffff);
      pillow.position.set(0, 0.62, -bd / 2 + 0.26);
      bg.add(pillow);
      const blanket = maintBox(bw - 0.04, 0.08, bd * 0.58, isOccupied ? 0xfecdd3 : 0xd1fae5);
      blanket.position.set(0, 0.62, bd * 0.18);
      bg.add(blanket);

      const sideTable = maintBox(0.42, 0.65, 0.42, 0xf8fafc);
      sideTable.position.set(bw / 2 + 0.30, 0.325, -bd / 2 + 0.3);
      bg.add(sideTable);

      const pole = maintCyl(0.015, 0.015, 1.7, 0x94a3b8);
      pole.position.set(-bw / 2 - 0.18, 0.85, -bd / 2 + 0.25);
      bg.add(pole);
      const ivBag = maintBox(0.08, 0.18, 0.05, 0x38bdf8);
      ivBag.position.set(-bw / 2 - 0.18, 1.55, -bd / 2 + 0.25);
      bg.add(ivBag);

      if (isOccupied) {
        const pat = makePerson({ role: 'patient', pose: 'lie', rotY: 0 });
        bg.add(pat);
        const nurse = makePerson({ role: 'nurse', pose: 'stand', rotY: -Math.PI / 2 });
        nurse.position.set(bw / 2 + 0.35, 0, 0.1);
        bg.add(nurse);
      }

      g.add(bg);

      const statusText = isOccupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง';
      L.push({
        text: `เตียง ${num} (${statusText})`,
        pos: V(x, 1.85, z),
        cls: `int-label ${isOccupied ? 'busy' : 'free'} toggleable`,
        toggleId: bedId
      });
      return bg;
    }

    function createRomphoPcDesk(x, z, rotY, spec, labelText, personOpts = null) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      dg.add(
        maintAt(maintBox(2.2, 0.76, 0.82, 0xffffff), 0, 0.38, 0),
        maintAt(maintBox(2.24, 0.05, 0.86, 0x0284c7), 0, 0.78, 0),
        maintAt(maintBox(2.24, 0.35, 0.06, 0x38bdf8), 0, 0.95, -0.40)
      );

      const mon = maintBox(0.55, 0.34, 0.04, 0x0f172a);
      mon.position.set(0, 0.98, -0.15);
      const scr = maintBox(0.51, 0.30, 0.01, 0x0284c7);
      scr.position.set(0, 0.98, -0.12);
      const stand = maintBox(0.06, 0.16, 0.06, 0x475569);
      stand.position.set(0, 0.86, -0.15);
      const base = maintBox(0.24, 0.02, 0.18, 0x475569);
      base.position.set(0, 0.79, -0.15);
      dg.add(mon, scr, stand, base);

      const kb = maintBox(0.42, 0.015, 0.15, 0x1e293b);
      kb.position.set(0, 0.81, 0.12);
      const mouse = maintBox(0.06, 0.015, 0.09, 0x1e293b);
      mouse.position.set(0.30, 0.81, 0.12);
      dg.add(kb, mouse);

      const pcCase = maintBox(0.18, 0.40, 0.38, 0x1e293b);
      pcCase.position.set(0.85, 0.38, 0.05);
      dg.add(pcCase);

      const chair = maintBox(0.48, 0.46, 0.48, 0x334155);
      chair.position.set(0, 0.23, 0.58);
      const back = maintBox(0.48, 0.46, 0.06, 0x334155);
      back.position.set(0, 0.69, 0.79);
      dg.add(chair, back);

      if (personOpts) {
        const staff = makePerson(personOpts);
        staff.position.set(0, 0, 0.55);
        dg.add(staff);
      }

      if (spec) {
        dg.traverse((ch) => { if (ch.isMesh) ch.userData.pcInfo = spec; });
      }

      g.add(dg);

      if (labelText) {
        L.push({
          text: labelText,
          pos: V(x, 1.95, z),
          cls: 'int-label pc-tag',
          pcInfo: spec
        });
      }
      return dg;
    }

    floor(g, 9.3, 3.25, '#f0fdf4', '#bbf7d0', 0.6, -8.85, -7.625);
    floor(g, 9.3, 7.60, '#ecfdf5', '#a7f3d0', 0.6, -8.85, -2.20);
    floor(g, 9.3, 2.50, '#f0fdf4', '#bbf7d0', 0.6, -8.85, 2.85);
    floor(g, 9.3, 2.50, '#eff6ff', '#bfdbfe', 0.6, -8.85, 5.35);
    floor(g, 9.3, 2.65, '#eff6ff', '#bfdbfe', 0.6, -8.85, 7.925);

    floor(g, 2.8, 18.5, '#f8fafc', '#cbd5e1', 0.6, -2.8, 0);
    walkwayStrip(g, -2.8, 0, 17.5, 1.5, Math.PI / 2);

    floor(g, 13.0, 4.85, '#e0f2fe', '#bae6fd', 0.6, 5.1, -6.825);
    floor(g, 1.9, 4.85, '#fefce8', '#fef08a', 0.6, 12.55, -6.825);
    floor(g, 14.9, 3.90, '#f8fafc', '#cbd5e1', 0.6, 6.05, -2.45);
    floor(g, 14.9, 5.70, '#f8fafc', '#cbd5e1', 0.6, 6.05, 2.35);
    floor(g, 3.5, 2.60, '#e0f2fe', '#93c5fd', 0.6, 11.75, 2.30);
    floor(g, 8.5, 4.05, '#fef3c7', '#fde68a', 0.6, 9.25, 7.225);

    g.add(
      maintAt(maintWall(9.3, WH, wThick, 0x1e293b), -8.85, WH / 2, zMin + wThick / 2),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -2.8, WH - 0.175, zMin + wThick / 2),
      maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, zMin + wThick / 2)
    );
    makeRomphoDoor(-2.8, zMin + wThick / 2, 1.4, 0.45, 0.3);
    L.push(maintTag('🚪 ประตู', V(-2.8, 1.45, zMin + 0.35), 'room', null, 'ประตูทางเข้าหลักโถงห้องคลอด (บน)'));

    g.add(
      maintAt(maintWall(9.3, WH, wThick, 0x1e293b), -8.85, WH / 2, zMax - wThick / 2),
      maintAt(maintWall(1.2, 0.35, wThick, 0x1e293b), -3.5, WH - 0.175, zMax - wThick / 2),
      maintAt(maintWall(0.4, WH, wThick, 0x1e293b), -2.7, WH / 2, zMax - wThick / 2),
      maintAt(maintWall(1.2, 0.35, wThick, 0x1e293b), -1.9, WH - 0.175, zMax - wThick / 2),
      maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, zMax - wThick / 2)
    );
    makeRomphoDoor(-3.5, zMax - wThick / 2, 1.2, 0.45, -0.3);
    L.push(maintTag('🚪 ประตู', V(-3.5, 1.45, zMax - 0.35), 'room', null, 'ประตูทางเข้า-ออกโถงล่าง (ซ้าย)'));
    makeRomphoDoor(-1.9, zMax - wThick / 2, 1.2, 0.45, 0.3);
    L.push(maintTag('🚪 ประตู', V(-1.9, 1.45, zMax - 0.35), 'room', null, 'ประตูทางเข้า-ออกโถงล่าง (ขวา)'));

    g.add(maintAt(maintWall(wThick, WH, D, 0x1e293b), xMin + wThick / 2, WH / 2, 0));

    g.add(
      maintAt(maintWall(wThick, WH, 6.2, 0x1e293b), xMax - wThick / 2, WH / 2, -6.15),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), xMax - wThick / 2, WH - 0.175, -2.45),
      maintAt(maintWall(wThick, WH, 2.6, 0x1e293b), xMax - wThick / 2, WH / 2, -0.55),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), xMax - wThick / 2, WH - 0.175, 1.35),
      maintAt(maintWall(wThick, WH, 2.6, 0x1e293b), xMax - wThick / 2, WH / 2, 3.25),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), xMax - wThick / 2, WH - 0.175, 5.15),
      maintAt(maintWall(wThick, WH, 3.5, 0x1e293b), xMax - wThick / 2, WH / 2, 7.50)
    );
    makeRomphoDoor(xMax - wThick / 2, -2.45, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(xMax - 0.35, 1.45, -2.45), 'room', null, 'ประตูเชื่อมงานพัฒนาการเด็ก'));
    makeRomphoDoor(xMax - wThick / 2, 1.35, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(xMax - 0.35, 1.45, 1.35), 'room', null, 'ประตูเชื่อมงานระบาดวิทยา (บน)'));
    makeRomphoDoor(xMax - wThick / 2, 5.15, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(xMax - 0.35, 1.45, 5.15), 'room', null, 'ประตูเชื่อมงานระบาดวิทยา (ล่าง)'));

    g.add(
      maintAt(maintWall(wThick, WH, 1.6, 0x1e293b), -4.2, WH / 2, -8.45),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -4.2, WH - 0.175, -7.05),
      maintAt(maintWall(wThick, WH, 2.0, 0x1e293b), -4.2, WH / 2, -5.45),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -4.2, WH - 0.175, -3.85),
      maintAt(maintWall(wThick, WH, 5.6, 0x1e293b), -4.2, WH / 2, -0.45),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -4.2, WH - 0.175, 2.95),
      maintAt(maintWall(wThick, WH, 1.0, 0x1e293b), -4.2, WH / 2, 4.05),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -4.2, WH - 0.175, 5.15),
      maintAt(maintWall(wThick, WH, 1.0, 0x1e293b), -4.2, WH / 2, 6.25),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -4.2, WH - 0.175, 7.35),
      maintAt(maintWall(wThick, WH, 0.7, 0x1e293b), -4.2, WH / 2, 8.30)
    );
    makeRomphoDoor(-4.2, -7.05, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(-3.85, 1.45, -7.05), 'room', null, 'ประตูเข้าห้องพักคลอด 1'));
    makeRomphoDoor(-4.2, -3.85, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(-3.85, 1.45, -3.85), 'room', null, 'ประตูเข้าห้องพักคลอด 16 เตียง'));
    makeRomphoDoor(-4.2, 2.95, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(-3.85, 1.45, 2.95), 'room', null, 'ประตูเข้าห้องพักคลอด 2'));
    makeRomphoDoor(-4.2, 5.15, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(-3.85, 1.45, 5.15), 'room', null, 'ประตูเข้าห้องพักแพทย์ 1'));
    makeRomphoDoor(-4.2, 7.35, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(-3.85, 1.45, 7.35), 'room', null, 'ประตูเข้าห้องพักแพทย์ 2'));

    g.add(
      maintAt(maintWall(wThick, WH, 3.65, 0x1e293b), -1.4, WH / 2, -7.425),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -1.4, WH - 0.175, -5.00),
      maintAt(maintWall(wThick, WH, 2.6, 0x1e293b), -1.4, WH / 2, -3.10),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -1.4, WH - 0.175, -1.20),
      maintAt(maintWall(wThick, WH, 1.3, 0x1e293b), -1.4, WH / 2, 0.05),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -1.4, WH - 0.175, 1.30),
      maintAt(maintWall(wThick, WH, 4.0, 0x1e293b), -1.4, WH / 2, 3.90),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), -1.4, WH - 0.175, 6.50),
      maintAt(maintWall(wThick, WH, 1.6, 0x1e293b), -1.4, WH / 2, 7.90)
    );
    makeRomphoDoor(-1.4, -5.00, 0.45, 1.2, -0.35);
    L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, -5.00), 'room', null, 'ประตูเข้าห้องผ่าคลอด 1'));
    makeRomphoDoor(-1.4, -1.20, 0.45, 1.2, -0.35);
    L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, -1.20), 'room', null, 'ประตูเข้าห้องเตรียมคลอด'));
    makeRomphoDoor(-1.4, 1.30, 0.45, 1.2, -0.35);
    L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, 1.30), 'room', null, 'ประตูเข้าจุดบริการห้องคลอด (บน)'));
    makeRomphoDoor(-1.4, 6.50, 0.45, 1.2, -0.35);
    L.push(maintTag('🚪 ประตู', V(-1.75, 1.45, 6.50), 'room', null, 'ประตูเข้าจุดบริการห้องคลอด (ล่าง)'));

    L.push({ text: '🚶‍♂️ ทางเดินกลาง', pos: V(-2.8, 0.35, 0), cls: 'int-label walkway-tag' });

    g.add(maintAt(maintWall(9.3, WH, wThick, 0x1e293b), -8.85, WH / 2, -6.0));

    g.add(
      maintAt(maintWall(1.2, WH, wThick, 0x1e293b), -12.9, WH / 2, 1.6),
      maintAt(maintWall(1.2, 0.35, wThick, 0x1e293b), -11.7, WH - 0.175, 1.6),
      maintAt(maintWall(6.9, WH, wThick, 0x1e293b), -7.65, WH / 2, 1.6)
    );
    makeRomphoDoor(-11.7, 1.6, 1.2, 0.45, 0.3);
    L.push(maintTag('🚪 ประตู', V(-11.7, 1.45, 1.6), 'room', null, 'ประตูเชื่อมต่อระหว่างห้องพักคลอด'));

    g.add(maintAt(maintWall(9.3, WH, wThick, 0x1e293b), -8.85, WH / 2, 4.1));
    g.add(maintAt(maintWall(9.3, WH, wThick, 0x1e293b), -8.85, WH / 2, 6.6));

    g.add(
      maintAt(maintWall(11.0, WH, wThick, 0x1e293b), 4.1, WH / 2, -4.4),
      maintAt(maintWall(1.2, 0.35, wThick, 0x1e293b), 10.2, WH - 0.175, -4.4),
      maintAt(maintWall(0.8, WH, wThick, 0x1e293b), 11.2, WH / 2, -4.4)
    );
    makeRomphoDoor(10.2, -4.4, 1.2, 0.45, 0.3);
    L.push(maintTag('🚪 ประตู', V(10.2, 1.45, -4.4), 'room', null, 'ประตูห้องผ่าคลอด (ทางออกคลังอุปกรณ์)'));

    g.add(maintAt(maintWall(wThick, WH, 4.85, 0x1e293b), 11.6, WH / 2, -6.825));
    g.add(maintAt(maintWall(14.9, WH, wThick, 0x1e293b), 6.05, WH / 2, -0.5));

    g.add(
      maintAt(maintWall(3.5, WH, wThick, 0x1e293b), 11.75, WH / 2, 1.0),
      maintAt(maintWall(3.5, WH, wThick, 0x1e293b), 11.75, WH / 2, 3.6),
      maintAt(maintWall(wThick, WH, 0.9, 0x1e293b), 10.0, WH / 2, 1.45),
      maintAt(maintWall(wThick, 0.35, 1.0, 0x1e293b), 10.0, WH - 0.175, 2.4),
      maintAt(maintWall(wThick, WH, 0.7, 0x1e293b), 10.0, WH / 2, 3.25)
    );
    makeRomphoDoor(10.0, 2.4, 0.45, 1.0, 0.35);
    L.push(maintTag('🚪 ประตู', V(9.65, 1.45, 2.4), 'room', null, 'ประตูเข้าห้องน้ำ'));

    g.add(
      maintAt(maintWall(8.5, WH, wThick, 0x1e293b), 9.25, WH / 2, 5.2),
      maintAt(maintWall(wThick, WH, 1.0, 0x1e293b), 5.0, WH / 2, 5.7),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), 5.0, WH - 0.175, 6.8),
      maintAt(maintWall(wThick, WH, 1.85, 0x1e293b), 5.0, WH / 2, 8.325)
    );
    makeRomphoDoor(5.0, 6.8, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(4.65, 1.45, 6.8), 'room', null, 'ประตูเข้าห้องพักเจ้าหน้าที่'));

    L.push({ text: '👶 ห้องพักคลอด', pos: V(-8.85, 1.95, -7.625), cls: 'int-label room-title' });
    makeRomphoBed(-10.5, -7.625, 1, 'rompho-bed-1', romphoState.beds[0].occupied);
    const docDesk1 = maintBox(1.3, 0.74, 0.65, 0x475569);
    docDesk1.position.set(-6.2, 0.37, -7.625);
    const cab1 = maintBox(0.55, 1.6, 1.3, 0x94a3b8);
    cab1.position.set(-12.8, 0.8, -7.625);
    g.add(docDesk1, cab1);

    L.push({ text: '🛌 ห้องพักคลอด (16 เตียง)', pos: V(-8.85, 2.2, -2.20), cls: 'int-label zone-pcu' });
    const topRowXs = [-12.0, -10.7, -9.4, -8.1, -6.8, -5.5];
    topRowXs.forEach((bx, idx) => {
      makeRomphoBed(bx, -4.6, idx + 1, romphoState.beds[idx].id, romphoState.beds[idx].occupied, 0);
    });
    makeRomphoBed(-12.2, -2.4, 7, romphoState.beds[6].id, romphoState.beds[6].occupied, Math.PI / 2);
    makeRomphoBed(-12.2, -0.3, 8, romphoState.beds[7].id, romphoState.beds[7].occupied, Math.PI / 2);
    const midRowXs = [-10.2, -8.7, -7.2, -5.7];
    midRowXs.forEach((bx, idx) => {
      makeRomphoBed(bx, -2.4, idx + 9, romphoState.beds[idx + 8].id, romphoState.beds[idx + 8].occupied, 0);
    });
    midRowXs.forEach((bx, idx) => {
      makeRomphoBed(bx, -0.3, idx + 13, romphoState.beds[idx + 12].id, romphoState.beds[idx + 12].occupied, 0);
    });

    L.push({ text: '👶 ห้องพักคลอด', pos: V(-8.85, 1.95, 2.85), cls: 'int-label room-title' });
    const recBed = maintBox(1.0, 0.55, 2.0, 0x0284c7);
    recBed.position.set(-8.2, 0.275, 2.85);
    const sink1 = maintBox(0.65, 0.85, 0.5, 0xffffff);
    sink1.position.set(-12.8, 0.425, 2.85);
    g.add(recBed, sink1);

    L.push({ text: '👨‍⚕️ ห้องพักแพทย์', pos: V(-8.85, 1.95, 5.35), cls: 'int-label room-title' });
    const docSofa1 = maintBox(2.0, 0.55, 0.8, 0x334155);
    docSofa1.position.set(-11.6, 0.275, 5.35);
    const docTable1 = maintBox(1.3, 0.74, 0.65, 0x475569);
    docTable1.position.set(-7.2, 0.37, 5.35);
    g.add(docSofa1, docTable1);

    L.push({ text: '👩‍⚕️ ห้องพักแพทย์', pos: V(-8.85, 1.95, 7.925), cls: 'int-label room-title' });
    const docSofa2 = maintBox(2.0, 0.55, 0.8, 0x334155);
    docSofa2.position.set(-11.6, 0.275, 7.925);
    const docTable2 = maintBox(1.3, 0.74, 0.65, 0x475569);
    docTable2.position.set(-7.2, 0.37, 7.925);
    g.add(docSofa2, docTable2);

    // =========================================================================
    // 🔀 ตู้แร็คแขวนผนัง Switch Hub KSP-SW-ROMPHO1 (ตำแหน่งมาร์คสีส้ม ผนังห้องพักแพทย์ ชั้น 1)
    // =========================================================================
    function makeRompho1SwitchRack(x, y, z) {
      const swg = new THREE.Group();
      swg.position.set(x, y, z);
      swg.rotation.y = -Math.PI / 2; // หมุน -90 องศา ให้แผ่นหลังชิดผนังทิศตะวันตก (X = -13.41) และประตูกระจกหันหน้าเข้าห้อง (+X)

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
      cab.userData.serverId = 'ksp-sw-rompho1';
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
      doorGlass.userData.serverId = 'ksp-sw-rompho1';
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

      // Unit B: 1U Managed Switch Hub (KSP-SW-ROMPHO1, y = 0.0)
      const swUnit = rackBox(0.62, 0.08, 0.34, 0x0284c7);
      swUnit.position.set(0, 0.0, -0.04);
      addEdges(swUnit, 0x38bdf8);
      swUnit.userData.serverId = 'ksp-sw-rompho1';
      swg.add(swUnit);

      // Switch Faceplate (Dark Metallic)
      const faceplate = rackBox(0.60, 0.07, 0.015, 0x0f172a);
      faceplate.position.set(0, 0.0, -0.205);
      faceplate.userData.serverId = 'ksp-sw-rompho1';
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
        port.userData.serverId = 'ksp-sw-rompho1';
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
      const conduit = rackBox(0.08, 0.90, 0.05, 0xf1f5f9);
      conduit.position.set(0, 0.72, 0.18);
      addEdges(conduit, 0x94a3b8);
      swg.add(conduit);

      g.add(swg);
      return swg;
    }

    // ติดตั้งตู้แร็ค Switch Hub ที่ผนังห้องพักแพทย์ (ตำแหน่งมาร์คสีส้ม: x = -13.21, y = 2.05, z = 7.35)
    makeRompho1SwitchRack(-13.21, 2.05, 7.35);
    L.push({
      text: '🔀 KSP-SW-ROMPHO1 (10.10.100.14)',
      pos: V(-12.95, 2.70, 7.35),
      cls: 'int-label server-badge clickable',
      serverId: 'ksp-sw-rompho1'
    });

    L.push({ text: '🏥 ห้องผ่าคลอด 1', pos: V(5.1, 2.1, -6.825), cls: 'int-label zone-er' });
    const orTableGroup = new THREE.Group();
    orTableGroup.position.set(5.1, 0, -6.825);
    const basePillar = maintCyl(0.28, 0.32, 0.65, 0x64748b, 16);
    basePillar.position.set(0, 0.325, 0);
    const orPad = maintBox(0.9, 0.15, 2.1, 0x0284c7);
    orPad.position.set(0, 0.72, 0);
    const stirL = maintCyl(0.015, 0.015, 0.45, 0x94a3b8);
    stirL.position.set(-0.48, 0.9, 0.6);
    const stirR = maintCyl(0.015, 0.015, 0.45, 0x94a3b8);
    stirR.position.set(0.48, 0.9, 0.6);
    orTableGroup.add(basePillar, orPad, stirL, stirR);
    g.add(orTableGroup);

    const lampArm = maintBox(0.06, 0.06, 1.8, 0xe2e8f0);
    lampArm.position.set(5.1, 2.1, -6.825);
    const lampHead1 = maintCyl(0.38, 0.38, 0.09, 0xf1f5f9, 16);
    lampHead1.position.set(5.1, 2.05, -7.6);
    const lampLight1 = maintCyl(0.32, 0.32, 0.02, 0xfef08a, 16);
    lampLight1.position.set(5.1, 2.0, -7.6);
    const lampHead2 = maintCyl(0.38, 0.38, 0.09, 0xf1f5f9, 16);
    lampHead2.position.set(5.1, 2.05, -6.0);
    const lampLight2 = maintCyl(0.32, 0.32, 0.02, 0xfef08a, 16);
    lampLight2.position.set(5.1, 2.0, -6.0);
    g.add(lampArm, lampHead1, lampLight1, lampHead2, lampLight2);

    const anesth = maintBox(0.7, 1.45, 0.7, 0x334155);
    anesth.position.set(2.2, 0.725, -8.2);
    const anesthScreen = maintBox(0.42, 0.28, 0.04, 0x38bdf8);
    anesthScreen.position.set(2.2, 1.4, -7.85);
    const babyWarmer = maintBox(0.75, 1.1, 0.85, 0xffffff);
    babyWarmer.position.set(8.2, 0.55, -8.2);
    const babyLight = maintBox(0.5, 0.1, 0.5, 0xfef08a);
    babyLight.position.set(8.2, 1.5, -8.2);
    g.add(anesth, anesthScreen, babyWarmer, babyLight);

    L.push({ text: 'ชั้นเก็บอุปกรณ์', pos: V(12.55, 1.95, -6.825), cls: 'int-label sub-tag' });
    const shelfRight = maintBox(0.8, 1.8, 4.2, 0x94a3b8);
    shelfRight.position.set(12.55, 0.9, -6.825);
    L.push({ text: 'ชั้นเก็บอุปกรณ์', pos: V(5.0, 1.6, -3.8), cls: 'int-label sub-tag' });
    const shelfHoriz = maintBox(5.0, 1.2, 0.65, 0x94a3b8);
    shelfHoriz.position.set(5.0, 0.6, -3.8);
    g.add(shelfRight, shelfHoriz);

    L.push({ text: '🛏️ ห้องเตรียมคลอด (3 เตียง)', pos: V(6.05, 2.0, -2.45), cls: 'int-label zone-pcu' });
    const bed3Zs = [-3.4, -2.45, -1.5];
    bed3Zs.forEach((bz, idx) => {
      makeRomphoBed(0.6, bz, idx + 17, romphoState.beds[idx + 16].id, romphoState.beds[idx + 16].occupied, Math.PI / 2);
    });

    createRomphoPcDesk(-0.7, 3.4, Math.PI / 2, ROMPHO_PC_SPECS, '🖥️ โต๊ะคอมห้องคลอด 1 (LR-PC)', { role: 'nurse', pose: 'sit', rotY: Math.PI / 2 });

    L.push({ text: 'โต๊ะ', pos: V(5.0, 1.55, 1.8), cls: 'int-label sub-tag' });
    const tableTop = maintBox(2.0, 0.74, 0.9, 0xd97706);
    tableTop.position.set(5.0, 0.37, 1.8);
    const chairTop1 = maintBox(0.42, 0.45, 0.42, 0x334155);
    chairTop1.position.set(5.0, 0.225, 1.2);
    const chairTop2 = maintBox(0.42, 0.45, 0.42, 0x334155);
    chairTop2.position.set(5.0, 0.225, 2.4);

    L.push({ text: 'โต๊ะ', pos: V(5.0, 1.55, 4.2), cls: 'int-label sub-tag' });
    const tableBtm = maintBox(2.0, 0.74, 0.9, 0xd97706);
    tableBtm.position.set(5.0, 0.37, 4.2);
    const chairBtm1 = maintBox(0.42, 0.45, 0.42, 0x334155);
    chairBtm1.position.set(5.0, 0.225, 3.6);
    const chairBtm2 = maintBox(0.42, 0.45, 0.42, 0x334155);
    chairBtm2.position.set(5.0, 0.225, 4.8);
    g.add(tableTop, chairTop1, chairTop2, tableBtm, chairBtm1, chairBtm2);

    L.push({ text: '🚻 ห้องน้ำ', pos: V(11.75, 1.95, 2.30), cls: 'int-label room-title' });
    const toilet = maintBox(0.45, 0.45, 0.65, 0xffffff);
    toilet.position.set(12.6, 0.225, 2.30);
    const washBasin = maintBox(0.55, 0.8, 0.45, 0xffffff);
    washBasin.position.set(10.8, 0.4, 1.6);
    g.add(toilet, washBasin);

    L.push({ text: '☕ ห้องพักเจ้าหน้าที่', pos: V(9.25, 1.95, 7.225), cls: 'int-label zone-pcu' });
    const staffSofa = maintBox(2.8, 0.65, 0.95, 0x334155);
    staffSofa.position.set(9.25, 0.325, 8.2);
    const staffDine = maintBox(1.8, 0.74, 1.0, 0xd97706);
    staffDine.position.set(9.25, 0.37, 6.2);
    const fridge = maintBox(0.7, 1.5, 0.65, 0xe2e8f0);
    fridge.position.set(12.5, 0.75, 6.2);
    const lockers = maintBox(0.55, 1.7, 2.0, 0x64748b);
    lockers.position.set(5.8, 0.85, 7.225);
    g.add(staffSofa, staffDine, fridge, lockers);

    floor(g, 12.0, 18.5, '#f8fafc', '#e2e8f0', 0.6, 19.5, 0.0);

    g.add(
      maintAt(maintWall(12.0, WH, wThick, 0x1e293b), 19.5, WH / 2, zMin + wThick / 2),
      maintAt(maintWall(wThick, WH, 8.5, 0x1e293b), 25.5 - wThick / 2, WH / 2, -5.0),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), 25.5 - wThick / 2, WH - 0.175, 0.0),
      maintAt(maintWall(wThick, WH, 8.5, 0x1e293b), 25.5 - wThick / 2, WH / 2, 5.0),
      maintAt(maintWall(5.4, WH, wThick, 0x1e293b), 16.2, WH / 2, zMax - wThick / 2),
      maintAt(maintWall(1.2, 0.35, wThick, 0x1e293b), 19.5, WH - 0.175, zMax - wThick / 2),
      maintAt(maintWall(5.4, WH, wThick, 0x1e293b), 22.8, WH / 2, zMax - wThick / 2)
    );
    makeRomphoDoor(25.5 - wThick / 2, 0.0, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(25.5 - 0.35, 1.45, 0.0), 'room', null, 'ประตูด้านข้างอาคารปีกขวา'));
    makeRomphoDoor(19.5, zMax - wThick / 2, 1.2, 0.45, 0.3);
    L.push(maintTag('🚪 ประตู', V(19.5, 1.45, zMax), 'room', null, 'ประตูเชื่อมห้องว่าง - ช่อง 1 พัฒนาการเด็ก'));

    L.push({ text: '📦 ห้องว่าง (รอจัดสรรแผนก)', pos: V(19.5, 2.2, 0.0), cls: 'int-label zone-pcu' });

    floor(g, 27.0, 2.5, '#e0f2fe', '#bae6fd', 0.8, 0.0, 10.5);
    floor(g, 2.2, 16.0, '#e0f2fe', '#bae6fd', 0.8, 12.4, 19.75);

    walkwayStrip(g, -0.75, 10.5, 25.5, 1.5, 0);
    walkwayStrip(g, 12.4, 19.75, 16.0, 1.5, Math.PI / 2);

    g.add(
      maintAt(maintWall(24.8, 0.9, 0.15, 0x64748b), -1.1, 0.45, 11.75),
      maintAt(maintWall(0.15, 0.9, 2.5, 0x64748b), -13.5, 0.45, 10.5),
      maintAt(maintWall(0.15, 0.9, 16.0, 0x64748b), 11.3, 0.45, 19.75),
      maintAt(maintWall(2.2, 0.9, 0.15, 0x64748b), 12.4, 0.45, 27.75)
    );
    L.push({ text: '➔ ทางเดินสีฟ้าหน้าห้องคลอด', pos: V(-2.0, 1.5, 10.5), cls: 'int-label walkway-tag' });
    L.push({ text: '⬇️ ทางเดินสีฟ้า (เชื่อมช่อง 1 และช่อง 2)', pos: V(12.4, 1.5, 19.75), cls: 'int-label walkway-tag' });

    floor(g, 12.0, 9.25, '#fef9c3', '#fef08a', 0.6, 19.5, 13.875);

    g.add(
      maintAt(maintWall(wThick, WH, 4.025, 0x1e293b), 13.5 + wThick / 2, WH / 2, 11.26),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), 13.5 + wThick / 2, WH - 0.175, 13.875),
      maintAt(maintWall(wThick, WH, 4.025, 0x1e293b), 13.5 + wThick / 2, WH / 2, 16.49),
      maintAt(maintWall(wThick, WH, 9.25, 0x1e293b), 25.5 - wThick / 2, WH / 2, 13.875),
      maintAt(maintWall(5.4, WH, wThick, 0x1e293b), 16.2, WH / 2, 18.5),
      maintAt(maintWall(1.2, 0.35, wThick, 0x1e293b), 19.5, WH - 0.175, 18.5),
      maintAt(maintWall(5.4, WH, wThick, 0x1e293b), 22.8, WH / 2, 18.5)
    );
    makeRomphoDoor(13.5 + wThick / 2, 13.875, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(13.5 + 0.35, 1.45, 13.875), 'room', null, 'ทางเข้างานพัฒนาการเด็กจากทางเดิน'));
    makeRomphoDoor(19.5, 18.5, 1.2, 0.45, 0.3);
    L.push(maintTag('🚪 ประตู', V(19.5, 1.45, 18.5), 'room', null, 'ประตูเชื่อมช่อง 1 พัฒนาการเด็ก - ช่อง 2 ระบาดวิทยา'));

    L.push({
      text: `🧸 ช่อง 1: งานพัฒนาการเด็ก (${romphoState.childDevOccupied ? '🔴 มีเด็กรับบริการ' : '🟢 พร้อมให้บริการ'})`,
      pos: V(19.5, 2.2, 13.875),
      cls: `int-label ${romphoState.childDevOccupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'rompho-child-dev'
    });
    const mat1 = maintBox(1.6, 0.04, 1.6, 0x38bdf8); mat1.position.set(16.5, 0.02, 11.5);
    const mat2 = maintBox(1.6, 0.04, 1.6, 0xf43f5e); mat2.position.set(18.2, 0.02, 11.5);
    const mat3 = maintBox(1.6, 0.04, 1.6, 0xfacc15); mat3.position.set(16.5, 0.02, 13.2);
    const mat4 = maintBox(1.6, 0.04, 1.6, 0x10b981); mat4.position.set(18.2, 0.02, 13.2);
    const playPen = maintBox(2.2, 0.45, 2.2, 0xec4899); playPen.position.set(17.35, 0.225, 16.0);
    const balls = maintBox(2.0, 0.25, 2.0, 0xfbcfe8); balls.position.set(17.35, 0.28, 16.0);
    const kidTable = maintCyl(0.70, 0.70, 0.52, 0x06b6d4, 16); kidTable.position.set(22.0, 0.26, 12.0);
    const kc1 = maintBox(0.35, 0.32, 0.35, 0xf59e0b); kc1.position.set(22.0, 0.16, 11.2);
    const kc2 = maintBox(0.35, 0.32, 0.35, 0x10b981); kc2.position.set(22.0, 0.16, 12.8);
    const kc3 = maintBox(0.35, 0.32, 0.35, 0x8b5cf6); kc3.position.set(21.2, 0.16, 12.0);
    const kc4 = maintBox(0.35, 0.32, 0.35, 0xf43f5e); kc4.position.set(22.8, 0.16, 12.0);
    const toyShelf = maintBox(0.65, 1.7, 3.2, 0x3b82f6); toyShelf.position.set(24.8, 0.85, 12.0);
    const examBed = maintBox(0.9, 0.70, 1.8, 0x0284c7); examBed.position.set(24.5, 0.35, 16.0);
    const scale = maintBox(0.4, 0.12, 0.6, 0xffffff); scale.position.set(24.5, 0.76, 16.5);
    const pSofa = maintBox(2.2, 0.65, 0.85, 0x475569); pSofa.position.set(16.5, 0.325, 16.5);
    g.add(mat1, mat2, mat3, mat4, playPen, balls, kidTable, kc1, kc2, kc3, kc4, toyShelf, examBed, scale, pSofa);
    createRomphoPcDesk(21.0, 16.3, Math.PI, CHILD_DEV_PC_SPECS, '🖥️ PC-DEV-01: โต๊ะคอมพัฒนาการเด็ก', { role: 'nurse', pose: 'sit', rotY: Math.PI });

    floor(g, 12.0, 9.25, '#f0fdf4', '#bbf7d0', 0.6, 19.5, 23.125);

    g.add(
      maintAt(maintWall(12.0, WH, wThick, 0x1e293b), 19.5, WH / 2, 27.75 - wThick / 2),
      maintAt(maintWall(wThick, WH, 4.025, 0x1e293b), 13.5 + wThick / 2, WH / 2, 20.51),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), 13.5 + wThick / 2, WH - 0.175, 23.125),
      maintAt(maintWall(wThick, WH, 4.025, 0x1e293b), 13.5 + wThick / 2, WH / 2, 25.74),
      maintAt(maintWall(wThick, WH, 4.0, 0x1e293b), 25.5 - wThick / 2, WH / 2, 20.5),
      maintAt(maintWall(wThick, 0.35, 1.2, 0x1e293b), 25.5 - wThick / 2, WH - 0.175, 23.125),
      maintAt(maintWall(wThick, WH, 4.0, 0x1e293b), 25.5 - wThick / 2, WH / 2, 25.75)
    );
    makeRomphoDoor(13.5 + wThick / 2, 23.125, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(13.5 + 0.35, 1.45, 23.125), 'room', null, 'ทางเข้างานระบาดวิทยาจากทางเดิน'));
    makeRomphoDoor(25.5 - wThick / 2, 23.125, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(25.5 - 0.35, 1.45, 23.125), 'room', null, 'ประตูด้านข้างงานระบาดวิทยา'));

    L.push({
      text: `🔬 ช่อง 2: งานระบาดวิทยา (${romphoState.epiOccupied ? '🔴 มีประชุมสอบสวนโรค' : '🟢 พร้อมปฏิบัติการ'})`,
      pos: V(19.5, 2.2, 23.125),
      cls: `int-label ${romphoState.epiOccupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'rompho-epi'
    });
    const epiTable = maintBox(3.4, 0.74, 1.4, 0x0f172a); epiTable.position.set(21.5, 0.37, 22.7);
    const epiTableTop = maintBox(3.45, 0.04, 1.45, 0x0284c7); epiTableTop.position.set(21.5, 0.74, 22.7);
    g.add(epiTable, epiTableTop);
    [-1.1, 0, 1.1].forEach((ox) => {
      const cU = maintBox(0.42, 0.45, 0.42, 0x334155); cU.position.set(21.5 + ox, 0.225, 21.7);
      const cD = maintBox(0.42, 0.45, 0.42, 0x334155); cD.position.set(21.5 + ox, 0.225, 23.7);
      g.add(cU, cD);
    });
    const dashFrame = maintBox(0.06, 1.4, 2.8, 0x0f172a); dashFrame.position.set(25.35, 1.6, 22.7);
    const dashScreen = maintBox(0.04, 1.3, 2.7, 0x0284c7); dashScreen.position.set(25.32, 1.6, 22.7);
    g.add(dashFrame, dashScreen);
    L.push({ text: '🗺️ จอแดชบอร์ดระบาดวิทยา GIS 506', pos: V(25.1, 2.3, 22.7), cls: 'int-label pc-tag' });
    const ppeCabinet = maintBox(0.65, 1.85, 2.4, 0x475569); ppeCabinet.position.set(24.8, 0.925, 26.0);
    const blueCooler = maintBox(0.55, 0.45, 0.75, 0x3b82f6); blueCooler.position.set(21.2, 0.225, 26.0);
    const redCooler = maintBox(0.55, 0.45, 0.75, 0xef4444); redCooler.position.set(19.6, 0.225, 26.0);
    const yellowKit = maintBox(0.45, 0.35, 0.55, 0xf59e0b); yellowKit.position.set(18.0, 0.175, 26.0);
    const whiteBoard = maintBox(2.2, 1.1, 0.04, 0xffffff); whiteBoard.position.set(17.5, 1.4, 18.65);
    g.add(ppeCabinet, blueCooler, redCooler, yellowKit, whiteBoard);
    L.push({ text: 'กล่องเก็บสิ่งส่งตรวจ VTM / PPE', pos: V(20.4, 1.55, 26.0), cls: 'int-label sub-tag' });
    createRomphoPcDesk(16.5, 21.0, 0, EPI_PC_SPECS, '🖥️ PC-EPI-01: โต๊ะคอมระบาดวิทยา', { role: 'doctor', pose: 'sit', rotY: 0 });

    const items = [
      ['🏢', 'ตึกร่มโพธิ์ 3 - ชั้น 1', 'แผนกห้องคลอด, ช่อง 1 พัฒนาการเด็ก, ช่อง 2 ระบาดวิทยา'],
      ['🏥', 'ห้องผ่าคลอด 1 (OR Delivery)', '1 ห้อง (เตียงผ่าคลอด, โคมไฟคู่, เครื่องดมยา, ตู้อุ่นทารก)', 'rompho-or-1', romphoState.or1Occupied ? 'busy' : 'free'],
      ['🛌', 'เตียงพักคลอด หอผู้ป่วยคลอด', '16 เตียง (คลิกเตียงเพื่อสลับ ว่าง/ไม่ว่าง)'],
      ['🛏️', 'เตียงเตรียมคลอด / สังเกตอาการ', '3 เตียง (คลิกเตียงเพื่อสลับ ว่าง/ไม่ว่าง)'],
      ['🖥️', 'PC-ROM-01: โต๊ะคอมห้องคลอด 1 (LR-PC: 10.10.40.30)', 'ดูสเปก', null, 'free', ROMPHO_PC_SPECS],
      ['📦', 'ห้องว่าง (รอจัดสรรแผนก)', '1 ห้อง (ปีกขวาเดิม กว้าง 12m x 18.5m)'],
      ['🧸', 'ช่อง 1: งานพัฒนาการเด็ก (Child Development)', '1 ห้อง (DSPM, เบาะฝึกพัฒนาการ, โต๊ะตรวจประเมิน)', 'rompho-child-dev', romphoState.childDevOccupied ? 'busy' : 'free'],
      ['🖥️', 'PC-DEV-01: โต๊ะคอมพัฒนาการเด็ก', 'ดูสเปก', null, 'free', CHILD_DEV_PC_SPECS],
      ['🔬', 'ช่อง 2: งานระบาดวิทยา (Epidemiology)', '1 ห้อง (ศูนย์สอบสวนโรค SRRT, จอ GIS Dashboard, ตู้ PPE, กล่อง VTM)', 'rompho-epi', romphoState.epiOccupied ? 'busy' : 'free'],
      ['🖥️', 'PC-EPI-01: โต๊ะคอมระบาดวิทยา', 'ดูสเปก', null, 'free', EPI_PC_SPECS],
      ['🚶', 'ทางเดินสีฟ้าหน้าอาคาร (แบบตึก ER)', 'ทางเดินสีฟ้าพร้อมเส้นประขาวและแถบเหลือง เชื่อมหน้าห้องคลอดและเลี้ยวลงเชื่อมช่อง 1-2'],
      ['👶', 'ห้องพักคลอด 1 & 2', '2 ห้อง'],
      ['👨‍⚕️', 'ห้องพักแพทย์ 1', '1 ห้อง', 'rompho-doc-1', romphoState.doctorRoom1Occupied ? 'busy' : 'free'],
      ['👩‍⚕️', 'ห้องพักแพทย์ 2', '1 ห้อง', 'rompho-doc-2', romphoState.doctorRoom2Occupied ? 'busy' : 'free'],
      ['☕', 'ห้องพักเจ้าหน้าที่', '1 ห้อง', 'rompho-staff-room', romphoState.staffRoomOccupied ? 'busy' : 'free'],
      ['🗄️', 'ชั้นเก็บอุปกรณ์ห้องคลอด', '2 จุด (ฝั่งขวาสุด และใต้ห้องผ่าคลอด)'],
      ['🪑', 'โต๊ะทำงานเคาน์เตอร์บริการ', '2 ตัว'],
      ['🚻', 'ห้องน้ำ', '1 ห้อง'],
      ['🚪', 'ประตูทางเข้าและประตูห้องภายใน', '22 จุด ตามผัง'],
      ['🔀', 'KSP-SW-ROMPHO1: สวิตช์ฮับตึกร่มโพธิ์ ชั้น 1 (10.10.100.14)', '🟢 ออนไลน์ (ห้องพักแพทย์ 2 / ห้องคลอด)', 'server-ksp-sw-rompho1', 'free']
    ];

    return {
      group: g,
      labels: L,
      title: 'ตึกร่มโพธิ์ 3 - ชั้น 1 (ห้องคลอด • ช่อง 1 พัฒนาการเด็ก • ช่อง 2 ระบาดวิทยา)',
      sub: 'ผังชั้น 1: แผนกห้องคลอดและสูติกรรม • ทางเดินสีฟ้าแบบตึก ER • ปีกขวาเดิม (ห้องว่างรอจัดสรร) • ช่อง 1: งานพัฒนาการเด็ก (ชุดตรวจ DSPM, บ่อบอล) • ช่อง 2: งานระบาดวิทยา (ทีมสอบสวนโรค SRRT, จอ GIS 506)',
      floors: [
        { num: 1, label: 'ชั้น 1 (ห้องคลอด • ช่อง 1 พัฒนาการเด็ก • ช่อง 2 ระบาดวิทยา)' },
        { num: 2, label: 'ชั้น 2 (ศูนย์ไตเทียม)' },
        { num: 3, label: 'ชั้น 3 (หอผู้ป่วยพิเศษ)' }
      ],
      currentFloor: 1,
      onSelectFloor: (f) => {
        romphoState.currentFloor = f;
      },
      items,
      cam: { pos: V(6.0, 38.0, 38.0), target: V(6.0, 0, 9.25) }
    };
  }

  function toggleRomphoStatus(id) {
    if (id.startsWith('server-')) {
      const sId = id.replace('server-', '');
      if (window.openServerModal) window.openServerModal(sId);
      return false;
    }
    if (id.startsWith('vip-')) {
      const vRoom = romphoState.vipRooms.find((r) => r.id === id);
      if (vRoom) {
        vRoom.occupied = !vRoom.occupied;
        return true;
      }
    }
    if (id.startsWith('hemo-bed-')) {
      const hBed = romphoState.hemoBeds.find((b) => b.id === id);
      if (hBed) {
        hBed.occupied = !hBed.occupied;
        return true;
      }
    }
    if (id === 'hemo-ro-system') {
      romphoState.roRunning = !romphoState.roRunning;
      return true;
    }
    if (id.startsWith('rompho-bed-')) {
      const bed = romphoState.beds.find((b) => b.id === id);
      if (bed) {
        bed.occupied = !bed.occupied;
        return true;
      }
    }
    if (id === 'rompho-or-1') {
      romphoState.or1Occupied = !romphoState.or1Occupied;
      return true;
    }
    if (id === 'rompho-staff-room') {
      romphoState.staffRoomOccupied = !romphoState.staffRoomOccupied;
      return true;
    }
    if (id === 'rompho-doc-1') {
      romphoState.doctorRoom1Occupied = !romphoState.doctorRoom1Occupied;
      return true;
    }
    if (id === 'rompho-doc-2') {
      romphoState.doctorRoom2Occupied = !romphoState.doctorRoom2Occupied;
      return true;
    }
    if (id === 'rompho-child-dev') {
      romphoState.childDevOccupied = !romphoState.childDevOccupied;
      return true;
    }
    if (id === 'rompho-epi') {
      romphoState.epiOccupied = !romphoState.epiOccupied;
      return true;
    }
    if (id === 'rompho-switch-floor-1') {
      romphoState.currentFloor = 1;
      return true;
    }
    if (id === 'rompho-switch-floor-2') {
      romphoState.currentFloor = 2;
      return true;
    }
    if (id === 'rompho-switch-floor-3') {
      romphoState.currentFloor = 3;
      return true;
    }
    return false;
  }

  K.Interiors.register('rompho', buildRomphoInterior, toggleRomphoStatus);
})();
