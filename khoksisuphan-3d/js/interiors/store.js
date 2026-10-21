/* =========================================================================
 * อาคารพัสดุ (Store & Logistics Building - 2 Floors)
 * ชั้น 1: คลังยา • สนง.พัสดุ • โต๊ะกลมนั่งรอ • ห้องหัวหน้าพัสดุ • ลิฟต์ส่งของ • เครื่องถ่ายเอกสาร
 * ชั้น 2: คลังเก็บพัสดุอุปกรณ์ของคลังพัสดุโรงพยาบาล • คลังเก็บยาขนาดใหญ่
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  const STORE_PC_SPECS = [
    {
      code: 'PC-STORE-01',
      name: 'โต๊ะคอมพัสดุ 1 (ตรวจรับพัสดุ)',
      role: 'ตรวจรับเวชภัณฑ์และพัสดุเข้าคลัง บันทึกรายการตรวจรับและพิมพ์ใบรับสินค้า',
      specs: [
        ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
        ['RAM', '16 GB DDR4 3200MHz'],
        ['Storage', '512 GB M.2 NVMe PCIe SSD'],
        ['Monitor', 'Dell 24" Full HD IPS (Anti-Glare)'],
        ['OS', 'Windows 11 Pro 64-bit'],
        ['Barcode Scanner', 'Zebra DS2208 2D Barcode Scanner']
      ],
      software: [
        'HOSxP Inventory & Material Management Module',
        'ระบบตรวจรับเวชภัณฑ์และครุภัณฑ์กลาง',
        'Microsoft Excel / Office 365',
        'ระบบสแกนบาร์โค้ดคลังพัสดุ'
      ]
    },
    {
      code: 'PC-STORE-02',
      name: 'โต๊ะคอมพัสดุ 2 (เบิกจ่ายพัสดุ)',
      role: 'จัดการใบขอเบิกพัสดุจากทุกแผนกในโรงพยาบาล ตรวจสอบสต็อก และตัดยอดจ่าย',
      specs: [
        ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
        ['RAM', '16 GB DDR4 3200MHz'],
        ['Storage', '512 GB M.2 NVMe PCIe SSD'],
        ['Monitor', 'Dell 24" Full HD IPS'],
        ['OS', 'Windows 11 Pro 64-bit'],
        ['Printer', 'Brother High-Speed Document Printer']
      ],
      software: [
        'HOSxP Material Dispensing & Requisition System',
        'ระบบเบิกพัสดุออนไลน์โรงพยาบาล (e-Requisition)',
        'ระบบรายงานยอดคงเหลือคลังพัสดุ',
        'Hospital Intranet Portal'
      ]
    },
    {
      code: 'PC-STORE-03',
      name: 'โต๊ะคอมพัสดุ 3 (จัดซื้อจัดจ้าง e-GP)',
      role: 'งานจัดซื้อจัดจ้างภาครัฐด้วยระบบอิเล็กทรอนิกส์ (e-GP) และการบริหารสัญญาพัสดุ',
      specs: [
        ['CPU', 'Intel Core i5-12500 (6 Cores / 12 Threads, up to 4.60 GHz)'],
        ['RAM', '16 GB DDR4 3200MHz'],
        ['Storage', '512 GB M.2 NVMe SSD + 1TB HDD'],
        ['Monitor', 'Dell 24" FHD Dual-Monitor setup'],
        ['OS', 'Windows 11 Pro 64-bit'],
        ['Token', 'Government e-GP Digital Token Key']
      ],
      software: [
        'ระบบจัดซื้อจัดจ้างภาครัฐ (e-GP Phase 5)',
        'ระบบจัดทำสัญญาและหลักประกันสัญญาพัสดุ',
        'HOSxP Procurement & PO Management',
        'Adobe Acrobat Pro (Document Signature)'
      ]
    },
    {
      code: 'PC-STORE-04',
      name: 'โต๊ะคอมหัวหน้าพัสดุ (บริหารคลังกลาง)',
      role: 'กำกับดูแลงานพัสดุ คลังยาและเวชภัณฑ์ ตรวจสอบงบประมาณ และอนุมัติใบสั่งซื้อ (PO)',
      specs: [
        ['CPU', 'Intel Core i7-12700 (12 Cores / 20 Threads, up to 4.90 GHz)'],
        ['RAM', '32 GB DDR4 3200MHz'],
        ['Storage', '1 TB M.2 NVMe PCIe 4.0 SSD'],
        ['Monitor', 'Dell UltraSharp 27" 4K IPS'],
        ['OS', 'Windows 11 Pro 64-bit Workstation'],
        ['Security', 'Smart Card Reader + Fingerprint Scanner']
      ],
      software: [
        'HOSxP Executive Inventory Dashboard',
        'ระบบอนุมัติจัดซื้อจัดจ้างอิเล็กทรอนิกส์ (e-Approval)',
        'ระบบสารสนเทศคลังเวชภัณฑ์ระดับจังหวัด (VMI System)',
        'Microsoft 365 Enterprise'
      ]
    },
    {
      code: 'PC-STORE-05',
      name: 'โต๊ะคอมพัสดุ 5 (ทะเบียนคุมทรัพย์สิน)',
      role: 'จัดทำทะเบียนคุมทรัพย์สิน ครุภัณฑ์โรงพยาบาล รหัสครุภัณฑ์ และคำนวณค่าเสื่อมราคา',
      specs: [
        ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
        ['RAM', '16 GB DDR4 3200MHz'],
        ['Storage', '512 GB M.2 NVMe PCIe SSD'],
        ['Monitor', 'Dell 24" Full HD IPS'],
        ['OS', 'Windows 11 Pro 64-bit'],
        ['Label Printer', 'TSC Barcode & Asset Tag Label Printer']
      ],
      software: [
        'ระบบทะเบียนครุภัณฑ์โรงพยาบาล (Asset Management)',
        'GFMIS Token & Depreciation Calculator',
        'ระบบพิมพ์สติกเกอร์ QR-Code ครุภัณฑ์',
        'HOSxP Asset Register Module'
      ]
    },
    {
      code: 'PC-STORE-06',
      name: 'โต๊ะคอมพัสดุ 6 (คลังยาและโลจิสติกส์)',
      role: 'ควบคุมคลังเก็บยาขนาดใหญ่ เช็ควันหมดอายุ (FEFO) การกระจายยา และอุณหภูมิคลัง',
      specs: [
        ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
        ['RAM', '16 GB DDR4 3200MHz'],
        ['Storage', '512 GB M.2 NVMe PCIe SSD'],
        ['Monitor', 'Dell 24" Full HD IPS'],
        ['OS', 'Windows 11 Pro 64-bit'],
        ['IoT Gateway', 'Wireless Cold Chain & Temp Logger Interface']
      ],
      software: [
        'HOSxP Main Pharmacy & Warehouse Stock Module',
        'ระบบตรวจสอบยาใกล้หมดอายุ (Near-Expiry Alert)',
        'IoT Warehouse Temperature & Humidity Monitor',
        'ระบบโลจิสติกส์และเบิกจ่ายยาภายในโรงพยาบาล'
      ]
    }
  ];

  const storeState = {
    currentFloor: 1,
    liftRunning: false,
    headOccupied: false,
    waitingOccupied: false,
    copierBusy: false
  };

  function maintCyl(rt, rb, h, col, seg = 14) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M.mat(col, { roughness: 0.45 }));
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  function maintTag(text, pos, kind, toggleId = null, _tip = null, pcInfo = null) {
    let cls = 'int-label';
    if (pcInfo || kind === 'pc') cls += ' pc-tag';
    else if (toggleId) cls += ' ' + (kind.includes('busy') ? 'busy' : 'free') + ' toggleable';
    else if (kind === 'room') cls += ' room-title';
    else cls += ' sub-tag';
    return { text, pos, cls, toggleId, pcInfo };
  }

  function buildStoreInterior(b) {
    const g = new THREE.Group();
    const L = [];

    const W = 32.0;
    const D = 18.0;
    const WH = 2.8;
    const wThick = 0.2;
    const xMin = -W / 2;
    const xMax = W / 2;
    const zMin = -D / 2;
    const zMax = D / 2;

    function storeBox(w, h, d, color, opacity = 1) {
      const mat = M.mat(color, { roughness: 0.5, transparent: opacity < 1, opacity });
      const m = M.box(null, w, h, d, mat, 0, 0, 0);
      addEdges(m, 0x475569);
      return m;
    }

    function storeWall(w, h, d, color = 0x1e293b) {
      const mat = M.mat(color, { roughness: 0.6 });
      const m = M.box(null, w, h, d, mat, 0, 0, 0);
      addEdges(m, 0x0f172a);
      return m;
    }

    function storeAt(mesh, x, y, z) {
      mesh.position.set(x, y, z);
      return mesh;
    }

    function storeDoor(x, z, w, d, rotY = 0) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const isHoriz = w >= d;
      const pad = storeBox(w, 0.04, d, 0xe2e8f0);
      pad.position.set(0, 0.02, 0);
      dg.add(pad);
      const leafW = isHoriz ? w * 0.85 : 0.07;
      const leafD = isHoriz ? 0.07 : d * 0.85;
      const leaf = storeBox(leafW, 1.95, leafD, 0x0284c7);
      leaf.position.set(0, 0.98, 0);
      leaf.rotation.y = rotY;
      dg.add(leaf);
      const winW = isHoriz ? 0.22 : 0.08;
      const winD = isHoriz ? 0.08 : 0.22;
      const win = storeBox(winW, 0.38, winD, 0xbae6fd);
      win.position.set(0, 1.25, 0);
      dg.add(win);
      g.add(dg);
    }

    function createStorePcDesk(x, z, rotY, spec, labelText, personOpts) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      const deskTop = storeBox(1.5, 0.05, 0.8, 0xd97706);
      deskTop.position.set(0, 0.725, 0);
      const legL = storeBox(0.05, 0.7, 0.75, 0x334155);
      legL.position.set(-0.7, 0.35, 0);
      const legR = storeBox(0.05, 0.7, 0.75, 0x334155);
      legR.position.set(0.7, 0.35, 0);
      const backPanel = storeBox(1.35, 0.4, 0.03, 0x475569);
      backPanel.position.set(0, 0.45, -0.36);

      const monBase = storeBox(0.24, 0.02, 0.18, 0x0f172a);
      monBase.position.set(0, 0.76, -0.15);
      const monPole = storeBox(0.04, 0.22, 0.04, 0x334155);
      monPole.position.set(0, 0.87, -0.15);
      const monScreen = storeBox(0.55, 0.34, 0.03, 0x0f172a);
      monScreen.position.set(0, 1.05, -0.15);
      const monGlass = storeBox(0.51, 0.30, 0.01, 0x38bdf8);
      monGlass.position.set(0, 1.05, -0.13);

      const pcCase = storeBox(0.2, 0.38, 0.42, 0x1e293b);
      pcCase.position.set(0.5, 0.2, 0.05);
      const kbd = storeBox(0.42, 0.02, 0.14, 0x0f172a);
      kbd.position.set(0, 0.76, 0.15);
      const mouse = storeBox(0.06, 0.02, 0.1, 0x0f172a);
      mouse.position.set(0.28, 0.76, 0.15);

      const chairSeat = storeBox(0.46, 0.06, 0.46, 0x0284c7);
      chairSeat.position.set(0, 0.45, 0.55);
      const chairBack = storeBox(0.44, 0.46, 0.05, 0x0284c7);
      chairBack.position.set(0, 0.72, 0.75);
      const chairStem = storeBox(0.06, 0.38, 0.06, 0x64748b);
      chairStem.position.set(0, 0.22, 0.55);

      dg.add(deskTop, legL, legR, backPanel, monBase, monPole, monScreen, monGlass, pcCase, kbd, mouse, chairSeat, chairBack, chairStem);

      if (personOpts) {
        const staff = makePerson({
          role: personOpts.role || 'nurse',
          shirtColor: personOpts.shirtColor || 0x0284c7,
          pantsColor: personOpts.pantsColor || 0x1e293b,
          pose: 'sit',
          rotY: Math.PI
        });
        staff.position.set(0, 0.02, 0.55);
        dg.add(staff);
      }

      [deskTop, monScreen, monGlass, pcCase].forEach((m) => {
        m.userData = { pcInfo: spec };
      });

      g.add(dg);

      L.push({
        text: labelText,
        pos: V(x, 1.6, z),
        cls: 'int-label pc-tag',
        pcInfo: spec
      });
    }

    function makePalletRack(x, z, d, color) {
      const rack = new THREE.Group();
      rack.position.set(x, 0, z);
      [-0.55, 0.55].forEach((ox) => {
        [-d / 2, d / 2].forEach((oz) => {
          const col = storeBox(0.08, 2.5, 0.08, color);
          col.position.set(ox, 1.25, oz);
          rack.add(col);
        });
      });
      [0.6, 1.4, 2.2].forEach((h) => {
        const shelfBeam = storeBox(1.2, 0.08, d, color);
        shelfBeam.position.set(0, h, 0);
        rack.add(shelfBeam);
        for (let sz = -d / 2 + 0.6; sz < d / 2; sz += 1.2) {
          const boxMat = Math.abs(Math.sin(sz + h)) > 0.5 ? 0xd97706 : 0x0284c7;
          const medBox = storeBox(0.95, 0.45, 0.85, boxMat);
          medBox.position.set(0, h + 0.265, sz);
          rack.add(medBox);
        }
      });
      g.add(rack);
    }

    if (storeState.currentFloor === 2) {
      floor(g, 8.0, 18.0, '#e2e8f0', '#94a3b8', 1.0, -12.0, 0.0);
      floor(g, 24.0, 12.0, '#f8fafc', '#cbd5e1', 0.8, 4.0, -3.0);
      floor(g, 24.0, 6.0, '#f1f5f9', '#cbd5e1', 0.8, 4.0, 6.0);

      g.add(
        storeAt(storeWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zMin + wThick / 2),
        storeAt(storeWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zMax - wThick / 2),
        storeAt(storeWall(wThick, WH, D, 0x1e293b), xMin + wThick / 2, WH / 2, 0),
        storeAt(storeWall(wThick, WH, D, 0x1e293b), xMax - wThick / 2, WH / 2, 0)
      );

      g.add(
        storeAt(storeWall(wThick, WH, 13.8, 0x1e293b), -8.0 + wThick / 2, WH / 2, -2.1),
        storeAt(storeWall(wThick, 0.4, 1.4, 0x1e293b), -8.0 + wThick / 2, WH - 0.2, 5.5),
        storeAt(storeWall(wThick, WH, 2.8, 0x1e293b), -8.0 + wThick / 2, WH / 2, 7.6)
      );
      storeDoor(-8.0 + wThick / 2, 5.5, 0.45, 1.4, 0.35);
      L.push(maintTag('🚪 ประตู', V(-8.0 + 0.35, 1.45, 5.5), 'room', null, 'ประตูเข้าคลังเก็บยาขนาดใหญ่ (ชั้น 2)'));

      g.add(
        storeAt(storeWall(10.5, WH, wThick, 0x1e293b), -2.75, WH / 2, 3.0),
        storeAt(storeWall(2.0, 0.4, wThick, 0x1e293b), 3.5, WH - 0.2, 3.0),
        storeAt(storeWall(11.5, WH, wThick, 0x1e293b), 10.25, WH / 2, 3.0)
      );
      storeDoor(3.5, 3.0, 1.8, 0.45, 0.3);
      L.push(maintTag('🚪 ประตู', V(3.5, 1.45, 3.0), 'room', null, 'ประตูเข้าคลังเก็บพัสดุอุปกรณ์โรงพยาบาล'));

      L.push({ text: '💊 คลังเก็บยาขนาดใหญ่ (ชั้น 2)', pos: V(-12.0, 2.2, 0.0), cls: 'int-label zone-pcu' });
      L.push({ text: '🌡️ คลังยา: 22.0°C / 52% RH', pos: V(-12.0, 2.3, -8.8), cls: 'int-label sub-tag' });
      makePalletRack(-14.2, -4.5, 6.5, 0x0284c7);
      makePalletRack(-14.2, 3.5, 6.5, 0x0284c7);
      makePalletRack(-9.8, -4.5, 6.5, 0xd97706);
      makePalletRack(-9.8, 1.5, 4.0, 0xd97706);
      const palletF2 = storeBox(1.2, 0.12, 1.2, 0x92400e);
      palletF2.position.set(-12.0, 0.06, -5.0);
      const boxOnPalletF2 = storeBox(1.1, 0.8, 1.1, 0xd97706);
      boxOnPalletF2.position.set(-12.0, 0.52, -5.0);
      g.add(palletF2, boxOnPalletF2);

      L.push({
        text: '📦 คลังเก็บพัสดุอุปกรณ์ของคลังพัสดุโรงพยาบาล',
        pos: V(4.0, 2.2, -3.0),
        cls: 'int-label zone-pcu'
      });
      makePalletRack(-1.0, -5.5, 5.5, 0x475569);
      makePalletRack(3.5, -5.5, 5.5, 0x475569);
      makePalletRack(8.0, -5.5, 5.5, 0x475569);
      makePalletRack(12.5, -5.5, 5.5, 0x475569);
      makePalletRack(-1.0, 0.5, 3.5, 0x0284c7);
      makePalletRack(12.5, 0.5, 3.5, 0x0284c7);

      [6.0, 8.5].forEach((px, idx) => {
        const pal = storeBox(1.3, 0.12, 1.3, 0x92400e);
        pal.position.set(px, 0.06, 0.5);
        const pBox = storeBox(1.2, 0.9, 1.2, idx === 0 ? 0xd97706 : 0x0284c7);
        pBox.position.set(px, 0.57, 0.5);
        g.add(pal, pBox);
      });

      const liftShaftF2 = storeBox(5.2, WH, 0.1, 0x1e293b);
      liftShaftF2.position.set(-5.4, WH / 2, -1.5);
      const liftDoorSteelF2 = storeBox(2.4, 2.2, 0.08, 0x334155);
      liftDoorSteelF2.position.set(-5.4, 1.1, -1.45);
      const liftHazardF2 = storeBox(2.6, 0.04, 0.35, 0xfacc15);
      liftHazardF2.position.set(-5.4, 0.02, -1.25);
      g.add(liftShaftF2, liftDoorSteelF2, liftHazardF2);
      L.push({ text: '🛗 ลิฟต์ส่งของ (ชั้น 2)', pos: V(-5.4, 2.2, -1.45), cls: 'int-label sub-tag' });

      L.push({ text: '🚶 โถงทางเดินขนส่งพัสดุชั้น 2', pos: V(0.0, 1.5, 6.0), cls: 'int-label sub-tag' });
      const stairOpening = storeBox(6.5, 0.08, 3.5, 0x0f172a);
      stairOpening.position.set(12.75, 0.04, 7.25);
      const stairRailTop = storeBox(6.5, 0.9, 0.08, 0x94a3b8);
      stairRailTop.position.set(12.75, 0.45, 5.5);
      const stairRailLeft = storeBox(0.08, 0.9, 3.5, 0x94a3b8);
      stairRailLeft.position.set(9.5, 0.45, 7.25);
      g.add(stairOpening, stairRailTop, stairRailLeft);

      for (let st = 0; st < 10; st++) {
        const step = storeBox(0.55, 0.18, 2.6, 0x475569);
        step.position.set(10.2 + st * 0.52, (9 - st) * 0.18 + 0.09, 7.25);
        g.add(step);
      }
      L.push({ text: '🪜 บันไดลงชั้น 1 ➔', pos: V(12.75, 1.6, 7.25), cls: 'int-label sub-tag' });

      const itemsF2 = [
        ['🏢', 'อาคารพัสดุ - ชั้น 2', 'คลังเก็บพัสดุอุปกรณ์ของคลังพัสดุโรงพยาบาล, คลังเก็บยาขนาดใหญ่, โถงทางเดินและบันได'],
        ['📦', 'คลังเก็บพัสดุอุปกรณ์ของคลังพัสดุโรงพยาบาล', 'ชั้นวางพัสดุและครุภัณฑ์ 6 แถวใหญ่, พาเลท, ลังอุปกรณ์, ลิฟต์ส่งของ'],
        ['💊', 'คลังเก็บยาขนาดใหญ่ (ชั้น 2)', 'ชั้นวางพาเลทเหล็กยาและเวชภัณฑ์, เซ็นเซอร์ตรวจวัดอุณหภูมิ'],
        ['🛗', 'ลิฟต์ส่งของ (Freight Lift 1,500 kg)', 'เปิดเข้าสู่คลังเก็บพัสดุอุปกรณ์ เชื่อมต่อระหว่างชั้น 1-2', 'store-lift', storeState.liftRunning ? 'busy' : 'free'],
        ['🪜', 'บันไดลงชั้น 1', 'บันไดเชื่อมต่อไปยังชั้น 1'],
        ['🚪', 'ประตูห้องและทางเข้าภายในชั้น 2', '2 บาน ตามผัง']
      ];

      return {
        group: g,
        labels: L,
        title: 'อาคารพัสดุ - ชั้น 2 (คลังเก็บพัสดุอุปกรณ์ • คลังยา)',
        sub: 'ผังชั้น 2: คลังเก็บพัสดุอุปกรณ์ของคลังพัสดุโรงพยาบาล • คลังเก็บยาขนาดใหญ่ • โถงทางเดินขนส่ง • ลิฟต์ส่งของ • บันไดลงชั้น 1',
        floors: [
          { num: 1, label: 'ชั้น 1 (คลังยา • สนง.พัสดุ • โต๊ะกลมนั่งรอ)' },
          { num: 2, label: 'ชั้น 2 (คลังเก็บพัสดุอุปกรณ์ • คลังยา)' }
        ],
        currentFloor: 2,
        onSelectFloor: (f) => {
          storeState.currentFloor = f;
        },
        items: itemsF2,
        cam: { pos: V(0, 26.0, 24.0), target: V(0, 0, 0) }
      };
    }

    // Floor 1
    floor(g, 8.0, 18.0, '#e2e8f0', '#94a3b8', 1.0, -12.0, 0.0);
    floor(g, 5.2, 7.5, '#fef3c7', '#fde68a', 0.6, -5.4, -5.25);
    floor(g, 8.0, 7.5, '#fef3c7', '#fde68a', 0.6, 12.0, -5.25);
    floor(g, 6.5, 6.0, '#ecfdf5', '#a7f3d0', 0.5, 12.75, 2.5);
    floor(g, 6.5, 3.5, '#f1f5f9', '#cbd5e1', 0.5, 12.75, 7.25);
    floor(g, 17.5, 18.0, '#f8fafc', '#cbd5e1', 0.8, 0.75, 0.0);

    g.add(
      storeAt(storeWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zMin + wThick / 2),
      storeAt(storeWall(wThick, WH, D, 0x1e293b), xMin + wThick / 2, WH / 2, 0),
      storeAt(storeWall(wThick, WH, D, 0x1e293b), xMax - wThick / 2, WH / 2, 0),
      storeAt(storeWall(18.5, WH, wThick, 0x1e293b), -6.75, WH / 2, zMax - wThick / 2),
      storeAt(storeWall(6.0, 0.4, wThick, 0x1e293b), 5.5, WH - 0.2, zMax - wThick / 2),
      storeAt(storeWall(7.5, WH, wThick, 0x1e293b), 12.25, WH / 2, zMax - wThick / 2)
    );
    const cargoDoorL = storeBox(2.9, 2.3, 0.08, 0x0284c7);
    cargoDoorL.position.set(4.0, 1.15, zMax - wThick / 2);
    const cargoDoorR = storeBox(2.9, 2.3, 0.08, 0x0284c7);
    cargoDoorR.position.set(7.0, 1.15, zMax - wThick / 2);
    const cargoWinL = storeBox(1.2, 0.8, 0.1, 0xbae6fd);
    cargoWinL.position.set(4.0, 1.35, zMax - wThick / 2);
    const cargoWinR = storeBox(1.2, 0.8, 0.1, 0xbae6fd);
    cargoWinR.position.set(7.0, 1.35, zMax - wThick / 2);
    g.add(cargoDoorL, cargoDoorR, cargoWinL, cargoWinR);
    L.push(maintTag('🚪 ประตูยาว', V(5.5, 1.6, zMax), 'room', null, 'ประตูรับ-ส่งของขนาดใหญ่ (ประตูยาว)'));

    g.add(
      storeAt(storeWall(wThick, WH, 14.0, 0x1e293b), -8.0 + wThick / 2, WH / 2, -2.0),
      storeAt(storeWall(wThick, 0.4, 1.2, 0x1e293b), -8.0 + wThick / 2, WH - 0.2, 6.0),
      storeAt(storeWall(wThick, WH, 2.0, 0x1e293b), -8.0 + wThick / 2, WH / 2, 8.0)
    );
    storeDoor(-8.0 + wThick / 2, 6.0, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(-8.0 + 0.35, 1.45, 6.0), 'room', null, 'ประตูเข้าคลังเก็บยาขนาดใหญ่'));

    g.add(
      storeAt(storeWall(wThick, WH, 7.5, 0x1e293b), -2.8 - wThick / 2, WH / 2, -5.25),
      storeAt(storeWall(1.3, WH, wThick, 0x1e293b), -7.35, WH / 2, -1.5),
      storeAt(storeWall(2.6, 0.4, wThick, 0x1e293b), -5.4, WH - 0.2, -1.5),
      storeAt(storeWall(1.3, WH, wThick, 0x1e293b), -3.45, WH / 2, -1.5)
    );
    const liftDoorSteel = storeBox(2.5, 2.3, 0.08, 0x334155);
    liftDoorSteel.position.set(-5.4, 1.15, -1.5);
    const liftHazardPad = storeBox(2.6, 0.04, 0.4, 0xfacc15);
    liftHazardPad.position.set(-5.4, 0.02, -1.25);
    g.add(liftDoorSteel, liftHazardPad);
    L.push({
      text: `🛗 ลิฟต์ส่งของ (${storeState.liftRunning ? '🔴 กำลังขนส่ง' : '🟢 พร้อมใช้งาน'})`,
      pos: V(-5.4, 2.2, -1.5),
      cls: `int-label ${storeState.liftRunning ? 'busy' : 'free'} toggleable`,
      toggleId: 'store-lift'
    });

    g.add(
      storeAt(storeWall(8.0, WH, wThick, 0x1e293b), 12.0, WH / 2, -1.5),
      storeAt(storeWall(wThick, WH, 4.4, 0x1e293b), 8.0 - wThick / 2, WH / 2, -6.8),
      storeAt(storeWall(wThick, 0.4, 1.2, 0x1e293b), 8.0 - wThick / 2, WH - 0.2, -3.8),
      storeAt(storeWall(wThick, WH, 1.9, 0x1e293b), 8.0 - wThick / 2, WH / 2, -2.45)
    );
    storeDoor(8.0 - wThick / 2, -3.8, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(8.0 - 0.35, 1.45, -3.8), 'room', null, 'ประตูห้องหัวหน้าพัสดุ'));

    g.add(
      storeAt(storeWall(6.5, WH, wThick, 0x1e293b), 12.75, WH / 2, -0.5),
      storeAt(storeWall(6.5, WH, wThick, 0x1e293b), 12.75, WH / 2, 5.5),
      storeAt(storeWall(wThick, WH, 2.4, 0x1e293b), 9.5 - wThick / 2, WH / 2, 0.7),
      storeAt(storeWall(wThick, 0.4, 1.2, 0x1e293b), 9.5 - wThick / 2, WH - 0.2, 2.5),
      storeAt(storeWall(wThick, WH, 2.4, 0x1e293b), 9.5 - wThick / 2, WH / 2, 4.3)
    );
    storeDoor(9.5 - wThick / 2, 2.5, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(9.5 - 0.35, 1.45, 2.5), 'room', null, 'ประตูห้องน้ำ'));

    g.add(
      storeAt(storeWall(5.0, WH, wThick, 0x1e293b), -0.3, WH / 2, 4.2),
      storeAt(storeWall(1.4, 0.4, wThick, 0x1e293b), 2.9, WH - 0.2, 4.2),
      storeAt(storeWall(4.4, WH, wThick, 0x1e293b), 5.8, WH / 2, 4.2)
    );
    storeDoor(2.9, 4.2, 1.3, 0.45, 0.3);
    L.push(maintTag('🚪 ประตู', V(2.9, 1.45, 4.2), 'room', null, 'ประตูกั้นสำนักงานพัสดุ'));

    g.add(
      storeAt(storeWall(wThick, WH, 2.2, 0x1e293b), 8.0 - wThick / 2, WH / 2, -0.4),
      storeAt(storeWall(wThick, 0.4, 1.2, 0x1e293b), 8.0 - wThick / 2, WH - 0.2, 1.3),
      storeAt(storeWall(wThick, WH, 2.3, 0x1e293b), 8.0 - wThick / 2, WH / 2, 3.05)
    );
    storeDoor(8.0 - wThick / 2, 1.3, 0.45, 1.2, 0.35);
    L.push(maintTag('🚪 ประตู', V(8.0 - 0.35, 1.45, 1.3), 'room', null, 'ประตูออกสู่โถงบันไดและห้องน้ำ'));

    g.add(
      storeAt(storeWall(wThick, WH, 5.7, 0x1e293b), -2.8 - wThick / 2, WH / 2, 1.35)
    );

    L.push({ text: '💊 คลังเก็บยาขนาดใหญ่', pos: V(-12.0, 2.2, 0.0), cls: 'int-label zone-pcu' });
    L.push({ text: '🌡️ คลังยา: 22.5°C / 55% RH', pos: V(-12.0, 2.3, -8.8), cls: 'int-label sub-tag' });
    makePalletRack(-14.2, -4.5, 6.5, 0x0284c7);
    makePalletRack(-14.2, 3.5, 6.5, 0x0284c7);
    makePalletRack(-9.8, -4.5, 6.5, 0xd97706);
    makePalletRack(-9.8, 1.5, 4.0, 0xd97706);
    const pallet1 = storeBox(1.2, 0.12, 1.2, 0x92400e);
    pallet1.position.set(-12.0, 0.06, -5.0);
    const boxOnPallet1 = storeBox(1.1, 0.8, 1.1, 0xd97706);
    boxOnPallet1.position.set(-12.0, 0.52, -5.0);
    g.add(pallet1, boxOnPallet1);

    const jackGroup = new THREE.Group();
    jackGroup.position.set(-12.0, 0, 5.5);
    const jackForkL = storeBox(0.16, 0.08, 1.1, 0xfacc15);
    jackForkL.position.set(-0.25, 0.06, 0);
    const jackForkR = storeBox(0.16, 0.08, 1.1, 0xfacc15);
    jackForkR.position.set(0.25, 0.06, 0);
    const jackHead = storeBox(0.4, 0.5, 0.3, 0xfacc15);
    jackHead.position.set(0, 0.3, -0.6);
    const jackHandle = storeBox(0.06, 0.8, 0.06, 0x0f172a);
    jackHandle.position.set(0, 0.75, -0.65);
    jackGroup.add(jackForkL, jackForkR, jackHead, jackHandle);
    g.add(jackGroup);

    L.push({
      text: `👔 ห้องหัวหน้าพัสดุ (${storeState.headOccupied ? '🔴 ติดภารกิจ' : '🟢 ว่าง พร้อมติดต่อ'})`,
      pos: V(12.0, 2.2, -5.25),
      cls: `int-label ${storeState.headOccupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'store-head'
    });
    createStorePcDesk(12.5, -6.5, Math.PI, STORE_PC_SPECS[3], '🖥️ PC-STORE-04: โต๊ะคอมหัวหน้าพัสดุ', { role: 'doctor', shirtColor: 0x1e293b });
    const vChair1 = storeBox(0.44, 0.45, 0.44, 0x334155);
    vChair1.position.set(11.8, 0.225, -5.3);
    const vChair2 = storeBox(0.44, 0.45, 0.44, 0x334155);
    vChair2.position.set(13.2, 0.225, -5.3);
    const headCab = storeBox(2.4, 1.8, 0.55, 0x92400e);
    headCab.position.set(12.0, 0.9, -8.65);
    const headSofa = storeBox(2.0, 0.65, 0.85, 0x334155);
    headSofa.position.set(9.5, 0.325, -3.5);
    g.add(vChair1, vChair2, headCab, headSofa);

    L.push({ text: '🚻 ห้องน้ำ', pos: V(12.75, 2.2, 2.5), cls: 'int-label room-title' });
    const toilet1 = storeBox(0.45, 0.45, 0.65, 0xffffff);
    toilet1.position.set(14.8, 0.225, 0.8);
    const toilet2 = storeBox(0.45, 0.45, 0.65, 0xffffff);
    toilet2.position.set(14.8, 0.225, 4.2);
    const tPartition = storeBox(2.2, 1.8, 0.05, 0x94a3b8);
    tPartition.position.set(14.5, 0.9, 2.5);
    const wash1 = storeBox(0.55, 0.8, 0.45, 0xffffff);
    wash1.position.set(11.0, 0.4, 0.25);
    const wash2 = storeBox(0.55, 0.8, 0.45, 0xffffff);
    wash2.position.set(11.0, 0.4, 4.75);
    g.add(toilet1, toilet2, tPartition, wash1, wash2);

    L.push({ text: '🪜 บันไดขึ้นชั้น 2 ➔', pos: V(12.75, 1.6, 7.25), cls: 'int-label sub-tag' });
    for (let st = 0; st < 10; st++) {
      const step = storeBox(0.55, 0.18, 2.6, 0x475569);
      step.position.set(10.2 + st * 0.52, st * 0.18 + 0.09, 7.25);
      g.add(step);
    }
    const sRail = storeBox(5.2, 0.9, 0.08, 0x94a3b8);
    sRail.position.set(12.75, 1.25, 5.8);
    g.add(sRail);

    createStorePcDesk(-1.8, -7.5, Math.PI, STORE_PC_SPECS[0], '🖥️ PC-STORE-01: โต๊ะคอมพัสดุ 1', { role: 'nurse', shirtColor: 0x0284c7 });
    createStorePcDesk(2.5, -7.5, Math.PI, STORE_PC_SPECS[1], '🖥️ PC-STORE-02: โต๊ะคอมพัสดุ 2', { role: 'nurse', shirtColor: 0x0284c7 });
    createStorePcDesk(6.8, -7.5, Math.PI, STORE_PC_SPECS[2], '🖥️ PC-STORE-03: โต๊ะคอมพัสดุ 3', { role: 'nurse', shirtColor: 0x0284c7 });
    createStorePcDesk(-1.2, -3.8, Math.PI / 2, STORE_PC_SPECS[5], '🖥️ PC-STORE-06: โต๊ะคอมพัสดุ 6', { role: 'nurse', shirtColor: 0x0284c7 });
    createStorePcDesk(2.2, -3.8, -Math.PI / 2, STORE_PC_SPECS[4], '🖥️ PC-STORE-05: โต๊ะคอมพัสดุ 5', { role: 'nurse', shirtColor: 0x0284c7 });

    const shelfHoriz = storeBox(5.4, 1.8, 0.8, 0x475569);
    shelfHoriz.position.set(0.5, 0.9, -1.2);
    g.add(shelfHoriz);
    L.push({ text: '🗄️ ชั้นเก็บของ', pos: V(0.5, 1.8, -1.2), cls: 'int-label sub-tag' });

    const shelfVert = storeBox(0.8, 1.8, 3.2, 0x475569);
    shelfVert.position.set(7.4, 0.9, 1.8);
    g.add(shelfVert);
    L.push({ text: '🗄️ ชั้นเก็บของ', pos: V(7.4, 1.8, 1.8), cls: 'int-label sub-tag' });

    const roundWaitingGroup = new THREE.Group();
    roundWaitingGroup.position.set(5.2, 0, -3.8);
    const roundPedestal = maintCyl(0.2, 0.25, 0.7, 0x64748b, 16);
    roundPedestal.position.set(0, 0.35, 0);
    const roundTop = maintCyl(1.0, 1.0, 0.05, 0xd97706, 24);
    roundTop.position.set(0, 0.725, 0);
    roundWaitingGroup.add(roundPedestal, roundTop);
    const chairAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    chairAngles.forEach((ang) => {
      const cx = Math.cos(ang) * 1.5;
      const cz = Math.sin(ang) * 1.5;
      const chSeat = storeBox(0.5, 0.08, 0.5, 0x0284c7);
      chSeat.position.set(cx, 0.44, cz);
      const chBack = storeBox(0.48, 0.45, 0.08, 0x0284c7);
      chBack.position.set(cx * 1.18, 0.68, cz * 1.18);
      const chLeg = storeBox(0.06, 0.4, 0.06, 0x334155);
      chLeg.position.set(cx, 0.2, cz);
      roundWaitingGroup.add(chSeat, chBack, chLeg);
    });
    const waitingParcel = storeBox(0.35, 0.2, 0.25, 0xd97706);
    waitingParcel.position.set(0, 0.85, 0);
    roundWaitingGroup.add(waitingParcel);
    g.add(roundWaitingGroup);
    L.push({
      text: `🪑 โต๊ะกลมนั่งรอพัสดุ (${storeState.waitingOccupied ? '🔴 มีผู้มารอรับ' : '🟢 ว่าง มีที่นั่ง'})`,
      pos: V(5.2, 1.8, -3.8),
      cls: `int-label ${storeState.waitingOccupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'store-waiting'
    });

    const copierGroup = new THREE.Group();
    copierGroup.position.set(1.5, 0, 7.4);
    const copBody = storeBox(0.9, 0.85, 0.75, 0xe2e8f0);
    copBody.position.set(0, 0.425, 0);
    const copScreen = storeBox(0.2, 0.12, 0.04, 0x38bdf8);
    copScreen.position.set(-0.25, 0.95, 0.28);
    const copTray = storeBox(0.45, 0.04, 0.45, 0x94a3b8);
    copTray.position.set(0.55, 0.65, 0);
    const copFeeder = storeBox(0.85, 0.12, 0.7, 0x334155);
    copFeeder.position.set(0, 0.92, 0);
    copierGroup.add(copBody, copScreen, copTray, copFeeder);
    g.add(copierGroup);
    L.push({
      text: `🖨️ เครื่องถ่ายเอกสาร (${storeState.copierBusy ? '🔴 กำลังพิมพ์' : '🟢 พร้อมใช้งาน'})`,
      pos: V(1.5, 1.6, 7.4),
      cls: `int-label ${storeState.copierBusy ? 'busy' : 'free'} toggleable`,
      toggleId: 'store-copier'
    });

    const items = [
      ['🏢', 'อาคารพัสดุ - ชั้น 1', 'คลังเก็บยาขนาดใหญ่, สำนักงานพัสดุ, ห้องหัวหน้าพัสดุ, ลิฟต์ส่งของ'],
      ['💊', 'คลังเก็บยาขนาดใหญ่', 'ชั้นวางพาเลทเหล็ก 4 ชุด, พาเลทไม้, ลังยา, รถลากพาเลท, เซ็นเซอร์อุณหภูมิ'],
      ['🛗', 'ลิฟต์ส่งของ (Freight Lift 1,500 kg)', 'ลิฟต์ขนส่งพัสดุ/ยา เชื่อมต่อไปยังชั้น 2 (พื้นสีไข่)', 'store-lift', storeState.liftRunning ? 'busy' : 'free'],
      ['👔', 'ห้องหัวหน้าพัสดุ', '1 ห้อง (โต๊ะทำงานหัวหน้า, ตู้เอกสาร, โซฟารับรอง)', 'store-head', storeState.headOccupied ? 'busy' : 'free'],
      ['🖥️', 'PC-STORE-04: โต๊ะคอมหัวหน้าพัสดุ', 'ดูสเปก', null, 'free', STORE_PC_SPECS[3]],
      ['🪑', 'โต๊ะกลมนั่งรอพัสดุ', 'โต๊ะกลมพร้อมเก้าอี้พักคอย สำหรับผู้มารอรับพัสดุ/เวชภัณฑ์', 'store-waiting', storeState.waitingOccupied ? 'busy' : 'free'],
      ['🖥️', 'PC-STORE-01: โต๊ะคอมพัสดุ 1 (ชิดกำแพงซ้าย)', 'ดูสเปก', null, 'free', STORE_PC_SPECS[0]],
      ['🖥️', 'PC-STORE-02: โต๊ะคอมพัสดุ 2 (ตรงกลางบน)', 'ดูสเปก', null, 'free', STORE_PC_SPECS[1]],
      ['🖥️', 'PC-STORE-03: โต๊ะคอมพัสดุ 3 (ชิดกำแพงบน)', 'ดูสเปก', null, 'free', STORE_PC_SPECS[2]],
      ['🖥️', 'PC-STORE-05: โต๊ะคอมพัสดุ 5 (ขยับขึ้น)', 'ดูสเปก', null, 'free', STORE_PC_SPECS[4]],
      ['🖥️', 'PC-STORE-06: โต๊ะคอมพัสดุ 6 (ขยับขึ้น)', 'ดูสเปก', null, 'free', STORE_PC_SPECS[5]],
      ['🖨️', 'เครื่องถ่ายเอกสาร', 'ตั้งอยู่ด้านนอก ติดกับประตูทางเข้ารับ-ส่งของ', 'store-copier', storeState.copierBusy ? 'busy' : 'free'],
      ['🗄️', 'ชั้นเก็บของ / ตู้เอกสารพัสดุ', '2 จุด (ชั้นแนวนอนใต้โต๊ะคอม 5-6 และชั้นแนวตั้ง)'],
      ['🚻', 'ห้องน้ำ', '1 ห้อง (2 ห้องสุขา, 2 อ่างล้างหน้า)'],
      ['🪜', 'บันไดขึ้นชั้น 2', 'บันไดเชื่อมต่อไปยังชั้น 2 พร้อมราวจับ'],
      ['🚪', 'ประตูยาว (Main Cargo Doors)', 'ประตูบานเลื่อนคู่ขนาดใหญ่รับ-ส่งของด้านหน้าอาคาร'],
      ['🚪', 'ประตูห้องและประตูกั้นภายใน', '5 บาน ตามผัง']
    ];

    return {
      group: g,
      labels: L,
      title: 'อาคารพัสดุ - ชั้น 1 (คลังยา • สนง.พัสดุ • โต๊ะกลมนั่งรอ)',
      sub: 'ผังชั้น 1: คลังเก็บยาขนาดใหญ่ • สนง.พัสดุ (โต๊ะคอม 1-3, 5-6) • โต๊ะกลมนั่งรอพัสดุ • ห้องหัวหน้าพัสดุ (โต๊ะคอม 4) • เครื่องถ่ายเอกสารติดประตูเข้า • กำแพงกั้นห้อง • ห้องน้ำ • บันไดขึ้นชั้น 2',
      floors: [
        { num: 1, label: 'ชั้น 1 (คลังยา • สนง.พัสดุ • โต๊ะกลมนั่งรอ)' },
        { num: 2, label: 'ชั้น 2 (คลังเก็บพัสดุอุปกรณ์ • คลังยา)' }
      ],
      currentFloor: storeState.currentFloor,
      onSelectFloor: (f) => {
        storeState.currentFloor = f;
      },
      items,
      cam: { pos: V(0, 26.0, 24.0), target: V(0, 0, 0) }
    };
  }

  function toggleStoreStatus(id) {
    if (id === 'store-lift') {
      storeState.liftRunning = !storeState.liftRunning;
      return true;
    }
    if (id === 'store-head') {
      storeState.headOccupied = !storeState.headOccupied;
      return true;
    }
    if (id === 'store-waiting' || id === 'store-meeting') {
      storeState.waitingOccupied = !storeState.waitingOccupied;
      return true;
    }
    if (id === 'store-copier') {
      storeState.copierBusy = !storeState.copierBusy;
      return true;
    }
    return false;
  }

  K.Interiors.register('store', buildStoreInterior, toggleStoreStatus);
})();
