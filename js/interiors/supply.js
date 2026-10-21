/* =========================================================================
 * อาคารซัพพลาย (Supply & CSSD - งานจ่ายกลาง • ซักฟอก • ห้องเก็บผ้า)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  const SUPPLY_PC_SPECS = [
    {
      code: 'PC-SUPPLY-01',
      name: 'โต๊ะคอมพิวเตอร์ 1 (จ่ายพัสดุ/เครื่องมือแพทย์)',
      role: 'บันทึกการเบิกจ่ายเครื่องมือแพทย์ปลอดเชื้อ อุปกรณ์เวชภัณฑ์ และเซ็ตผ่าตัดให้แต่ละแผนก',
      specs: [
        ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
        ['RAM', '16 GB DDR4 3200MHz'],
        ['Storage', '512 GB M.2 NVMe PCIe SSD'],
        ['Monitor', 'Dell 24" Full HD IPS'],
        ['OS', 'Windows 11 Pro 64-bit'],
        ['IP Address', '192.168.10.81 (VLAN 10 - Supply & CSSD)'],
        ['Software', 'HOSxP CSSD System, Medical Supply Inventory System, Web Browser, Microsoft 365'],
        ['Peripherals', 'เครื่องสแกนบาร์โค้ดไร้สาย, เครื่องพิมพ์สติกเกอร์รหัสอุปกรณ์ปลอดเชื้อ, เครื่องพิมพ์ใบจ่ายของ, เครื่องสำรองไฟ UPS 800VA']
      ],
      installedPrograms: [
        'HOSxP Hospital OS (CSSD Module)',
        'Barcode Sterilization Tracker',
        'Microsoft 365 Enterprise',
        'Adobe Acrobat Reader'
      ]
    },
    {
      code: 'PC-SUPPLY-02',
      name: 'โต๊ะคอมพิวเตอร์ 2 (คลังปลอดเชื้อ/นึ่งฆ่าเชื้อ Autoclave)',
      role: 'ควบคุมการทำให้ปราศจากเชื้อ (Sterilization Tracking) และตรวจสอบรอบหม้ออบไอน้ำ Autoclave',
      specs: [
        ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
        ['RAM', '16 GB DDR4 3200MHz'],
        ['Storage', '512 GB M.2 NVMe PCIe SSD'],
        ['Monitor', 'Dell 24" Full HD IPS'],
        ['OS', 'Windows 11 Pro 64-bit'],
        ['IP Address', '192.168.10.82 (VLAN 10 - Supply & CSSD)'],
        ['Software', 'Autoclave Cycle Monitor, Sterilizer Data Logger, HOSxP CSSD, MS Office'],
        ['Peripherals', 'เครื่องพิมพ์ฉลากวันหมดอายุ FEFO, ตัวอ่านเซ็นเซอร์อุณหภูมิ/ความดันหม้อนึ่ง, เครื่องสำรองไฟ UPS 800VA']
      ],
      installedPrograms: [
        'Steam Sterilizer Data Logger v3.2',
        'Biological Indicator Incubation Tracker',
        'HOSxP Inventory'
      ]
    },
    {
      code: 'PC-SUPPLY-03',
      name: 'โต๊ะคอมพิวเตอร์ 3 (ธุรการซัพพลายและงานผ้าซักฟอก)',
      role: 'บริหารจัดการงานผ้าซักฟอก ส่งซัก อบ พับ และควบคุมสต็อกผ้าสะอาด/ผ้าผ่าตัดประจำหอผู้ป่วย',
      specs: [
        ['CPU', 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)'],
        ['RAM', '16 GB DDR4 3200MHz'],
        ['Storage', '512 GB M.2 NVMe PCIe SSD'],
        ['Monitor', 'Dell 24" Full HD IPS'],
        ['OS', 'Windows 11 Pro 64-bit'],
        ['IP Address', '192.168.10.83 (VLAN 10 - Supply & CSSD)'],
        ['Software', 'Hospital Linen Management System, HOSxP, MS Excel, Web Portal'],
        ['Peripherals', 'เครื่องพิมพ์รายงาน A4, เครื่องชั่งน้ำหนักผ้าดิจิทัลเชื่อมต่อคอมพิวเตอร์, เครื่องสำรองไฟ UPS 800VA']
      ],
      installedPrograms: [
        'Hospital Linen Management System',
        'HOSxP Laundry Module',
        'Microsoft 365 Enterprise'
      ]
    }
  ];

  const supplyState = {
    wash1Running: false,
    wash2Running: false,
    wash3Running: false,
    equipBusy: false
  };

  function buildSupplyInterior(b) {
    const g = new THREE.Group();
    const L = [];

    const W = 28.0;
    const D = 8.6;
    const WH = 3.2;
    const wThick = 0.18;
    const xMin = -W / 2;
    const xMax = W / 2;
    const zMin = -D / 2;
    const zMax = D / 2;

    function supplyBox(w, h, d, color, opacity = 1.0) {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.45,
        metalness: 0.1,
        transparent: opacity < 1.0,
        opacity
      });
      return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    }

    function supplyCyl(rTop, rBot, h, color, segs = 16) {
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.25 });
      return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
    }

    function supplyWall(w, h, d, color = 0x1e293b) {
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05 });
      return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    }

    function supplyAt(mesh, x, y, z) {
      mesh.position.set(x, y, z);
      return mesh;
    }

    function supplyDoor(x, z, w, d, leafRotY = 0.35) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const postL = supplyBox(w > d ? 0.08 : w, WH, w > d ? d : 0.08, 0x334155);
      postL.position.set(w > d ? -w / 2 + 0.04 : 0, WH / 2, w > d ? 0 : -d / 2 + 0.04);
      const postR = supplyBox(w > d ? 0.08 : w, WH, w > d ? d : 0.08, 0x334155);
      postR.position.set(w > d ? w / 2 - 0.04 : 0, WH / 2, w > d ? 0 : d / 2 - 0.04);
      const header = supplyBox(w, 0.1, d, 0x334155);
      header.position.set(0, WH - 0.05, 0);

      const leafW = (w > d ? w : d) - 0.12;
      const leaf = supplyBox(leafW, 2.15, 0.04, 0x64748b, 0.95);
      leaf.position.set(leafW / 2, 1.075, 0);
      const pivot = new THREE.Group();
      pivot.position.set(w > d ? -w / 2 + 0.06 : 0, 0, w > d ? 0 : -d / 2 + 0.06);
      pivot.rotation.y = leafRotY;
      pivot.add(leaf);
      dg.add(postL, postR, header, pivot);
      g.add(dg);
    }

    function supplyHatch(x, z, w, isHoriz, labelText) {
      const hg = new THREE.Group();
      hg.position.set(x, 0, z);

      const counterH = 1.0;
      const cBox = supplyBox(isHoriz ? w : 0.6, counterH, isHoriz ? 0.6 : w, 0x0284c7);
      cBox.position.set(0, counterH / 2, 0);
      const topPlate = supplyBox(isHoriz ? w + 0.2 : 0.75, 0.05, isHoriz ? 0.75 : w + 0.2, 0x94a3b8);
      topPlate.position.set(0, counterH + 0.025, 0);
      const glassH = 1.2;
      const glassPane = supplyBox(isHoriz ? w - 0.1 : 0.04, glassH, isHoriz ? 0.04 : w - 0.1, 0x38bdf8, 0.35);
      glassPane.position.set(0, counterH + 0.05 + glassH / 2, 0);
      const topBeam = supplyBox(isHoriz ? w : 0.15, 0.15, isHoriz ? 0.15 : w, 0x1e293b);
      topBeam.position.set(0, counterH + 0.05 + glassH + 0.075, 0);

      hg.add(cBox, topPlate, glassPane, topBeam);
      g.add(hg);

      L.push({
        text: `📦 ${labelText}`,
        pos: V(x, 1.5, z),
        cls: 'int-label sub-tag'
      });
    }

    function createSupplyPcDesk(x, z, rotY, spec, labelText, personOpts) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      const deskTop = supplyBox(1.5, 0.05, 0.8, 0xd97706);
      deskTop.position.set(0, 0.725, 0);
      const legL = supplyBox(0.05, 0.7, 0.75, 0x334155);
      legL.position.set(-0.7, 0.35, 0);
      const legR = supplyBox(0.05, 0.7, 0.75, 0x334155);
      legR.position.set(0.7, 0.35, 0);
      const backPanel = supplyBox(1.35, 0.4, 0.03, 0x475569);
      backPanel.position.set(0, 0.45, -0.36);

      const monBase = supplyBox(0.24, 0.02, 0.18, 0x0f172a);
      monBase.position.set(0, 0.76, -0.15);
      const monStand = supplyBox(0.04, 0.22, 0.04, 0x0f172a);
      monStand.position.set(0, 0.88, -0.15);
      const monScreen = supplyBox(0.68, 0.42, 0.03, 0x0284c7);
      monScreen.position.set(0, 1.1, -0.13);
      const monFrame = supplyBox(0.72, 0.46, 0.03, 0x0f172a);
      monFrame.position.set(0, 1.1, -0.15);
      const kbd = supplyBox(0.45, 0.02, 0.15, 0x1e293b);
      kbd.position.set(0, 0.76, 0.15);
      const mouse = supplyBox(0.06, 0.02, 0.1, 0x1e293b);
      mouse.position.set(0.3, 0.76, 0.15);

      const chSeat = supplyBox(0.48, 0.06, 0.48, 0x0284c7);
      chSeat.position.set(0, 0.45, 0.55);
      const chBack = supplyBox(0.46, 0.45, 0.06, 0x0284c7);
      chBack.position.set(0, 0.72, 0.76);
      const chPole = supplyCyl(0.03, 0.03, 0.4, 0x0f172a, 12);
      chPole.position.set(0, 0.22, 0.55);
      const chBase = supplyBox(0.46, 0.04, 0.46, 0x0f172a);
      chBase.position.set(0, 0.03, 0.55);

      dg.add(deskTop, legL, legR, backPanel, monBase, monStand, monScreen, monFrame, kbd, mouse, chSeat, chBack, chPole, chBase);

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

      [deskTop, monScreen, monFrame].forEach((m) => {
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

    function makeWasher(x, z, num, id, isRunning) {
      const wg = new THREE.Group();
      wg.position.set(x, 0, z);

      const body = supplyBox(1.3, 1.7, 1.2, 0xe2e8f0);
      body.position.set(0, 0.85, 0);
      const topBevel = supplyBox(1.3, 0.1, 1.2, 0x94a3b8);
      topBevel.position.set(0, 1.75, 0);
      const basePad = supplyBox(1.35, 0.15, 1.25, 0x334155);
      basePad.position.set(0, 0.075, 0);

      const controlPanel = supplyBox(1.15, 0.35, 0.08, 0x0f172a);
      controlPanel.position.set(0, 1.5, 0.62);
      const ledScreen = supplyBox(0.4, 0.15, 0.04, isRunning ? 0xef4444 : 0x22c55e);
      ledScreen.position.set(-0.3, 1.5, 0.65);
      const progKnob = supplyCyl(0.06, 0.06, 0.04, 0x94a3b8, 16);
      progKnob.rotation.x = Math.PI / 2;
      progKnob.position.set(0.2, 1.5, 0.65);

      const doorRing = supplyCyl(0.42, 0.42, 0.06, 0x64748b, 24);
      doorRing.rotation.x = Math.PI / 2;
      doorRing.position.set(0, 0.85, 0.62);
      const doorGlass = supplyCyl(0.36, 0.36, 0.04, isRunning ? 0x38bdf8 : 0x94a3b8, 24);
      doorGlass.rotation.x = Math.PI / 2;
      doorGlass.position.set(0, 0.85, 0.63);

      const hamper = supplyBox(0.65, 0.7, 0.65, 0x0284c7);
      hamper.position.set(0.9, 0.35, 0.2);
      const hamperRim = supplyBox(0.68, 0.06, 0.68, 0x38bdf8);
      hamperRim.position.set(0.9, 0.72, 0.2);

      wg.add(body, topBevel, basePad, controlPanel, ledScreen, progKnob, doorRing, doorGlass, hamper, hamperRim);
      g.add(wg);

      L.push({
        text: `🧺 เครื่องซักผ้าใหญ่ ${num} (${isRunning ? '🔴 กำลังซัก/อบผ้า' : '🟢 พร้อมใช้งาน Standby'})`,
        pos: V(x, 2.1, z),
        cls: `int-label ${isRunning ? 'busy' : 'free'} toggleable`,
        toggleId: id
      });
    }

    // 1. พื้นแยกแต่ละโซน
    floor(g, 5.0, D, '#f8fafc', '#e2e8f0', 0.8, -11.5, 0);
    floor(g, 5.8, D, '#ecfdf5', '#a7f3d0', 0.8, -6.1, 0);
    floor(g, 6.4, D, '#f8fafc', '#cbd5e1', 0.8, 0.0, 0);
    floor(g, 3.8, 3.1, '#f1f5f9', '#cbd5e1', 0.5, -1.3, 2.75);
    floor(g, 5.0, D, '#e0f2fe', '#93c5fd', 0.8, 5.7, 0);
    floor(g, 5.8, D, '#fffbeb', '#fde68a', 0.8, 11.1, 0);

    // 2. กำแพงรอบนอก
    g.add(supplyAt(supplyWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zMin + wThick / 2));
    g.add(supplyAt(supplyWall(wThick, WH, D, 0x1e293b), xMin + wThick / 2, WH / 2, 0));
    g.add(supplyAt(supplyWall(wThick, WH, D, 0x1e293b), xMax - wThick / 2, WH / 2, 0));
    g.add(
      supplyAt(supplyWall(6.5, WH, wThick, 0x1e293b), -10.75, WH / 2, zMax - wThick / 2),
      supplyAt(supplyWall(1.5, 0.5, wThick, 0x1e293b), -6.0, WH - 0.25, zMax - wThick / 2),
      supplyAt(supplyWall(14.4, WH, wThick, 0x1e293b), 2.1, WH / 2, zMax - wThick / 2),
      supplyAt(supplyWall(1.8, 0.5, wThick, 0x1e293b), 11.1, WH - 0.25, zMax - wThick / 2),
      supplyAt(supplyWall(1.8, WH, wThick, 0x1e293b), 13.0, WH / 2, zMax - wThick / 2)
    );

    // 3. กำแพงกั้นห้องภายใน
    g.add(
      supplyAt(supplyWall(wThick, WH, 3.6, 0x1e293b), -9.0 + wThick / 2, WH / 2, -2.5),
      supplyAt(supplyWall(wThick, 0.4, 1.2, 0x1e293b), -9.0 + wThick / 2, WH - 0.2, 0.0),
      supplyAt(supplyWall(wThick, WH, 3.8, 0x1e293b), -9.0 + wThick / 2, WH / 2, 2.4)
    );
    supplyDoor(-9.0 + wThick / 2, 0.0, 0.45, 1.2, 0.35);

    g.add(
      supplyAt(supplyWall(wThick, WH, 2.2, 0x1e293b), -3.2 + wThick / 2, WH / 2, -3.2),
      supplyAt(supplyWall(wThick, 0.4, 1.2, 0x1e293b), -3.2 + wThick / 2, WH - 0.2, -1.5),
      supplyAt(supplyWall(wThick, WH, 5.2, 0x1e293b), -3.2 + wThick / 2, WH / 2, 1.7)
    );
    supplyDoor(-3.2 + wThick / 2, -1.5, 0.45, 1.2, 0.35);

    g.add(
      supplyAt(supplyWall(2.3, WH, wThick, 0x1e293b), -2.05, WH / 2, 1.2),
      supplyAt(supplyWall(1.0, 0.4, wThick, 0x1e293b), -0.4, WH - 0.2, 1.2),
      supplyAt(supplyWall(0.5, WH, wThick, 0x1e293b), 0.35, WH / 2, 1.2),
      supplyAt(supplyWall(wThick, WH, 3.1, 0x1e293b), 0.6 + wThick / 2, WH / 2, 2.75)
    );
    supplyDoor(-0.4, 1.2, 1.0, 0.45, 0.35);

    g.add(
      supplyAt(supplyWall(wThick, WH, 2.4, 0x1e293b), 3.2 - wThick / 2, WH / 2, -3.1),
      supplyAt(supplyWall(wThick, 0.4, 1.8, 0x1e293b), 3.2 - wThick / 2, WH - 0.2, -1.0),
      supplyAt(supplyWall(wThick, WH, 1.9, 0x1e293b), 3.2 - wThick / 2, WH / 2, 0.85),
      supplyAt(supplyWall(wThick, 0.4, 1.2, 0x1e293b), 3.2 - wThick / 2, WH - 0.2, 2.4),
      supplyAt(supplyWall(wThick, WH, 1.3, 0x1e293b), 3.2 - wThick / 2, WH / 2, 3.65)
    );
    supplyDoor(3.2 - wThick / 2, 2.4, 0.45, 1.2, 0.35);

    g.add(
      supplyAt(supplyWall(wThick, WH, 6.1, 0x1e293b), 8.2 + wThick / 2, WH / 2, -1.25),
      supplyAt(supplyWall(wThick, 0.4, 1.2, 0x1e293b), 8.2 + wThick / 2, WH - 0.2, 2.4),
      supplyAt(supplyWall(wThick, WH, 1.3, 0x1e293b), 8.2 + wThick / 2, WH / 2, 3.65)
    );
    supplyDoor(8.2 + wThick / 2, 2.4, 0.45, 1.2, 0.35);

    const canopyRoof = supplyBox(5.0, 0.08, D, 0x0284c7, 0.6);
    canopyRoof.position.set(5.7, WH + 0.1, 0);
    g.add(canopyRoof);

    // 4. ช่องจ่ายของ 3 จุด
    supplyHatch(-6.0, 4.3, 1.5, true, 'ช่องจ่ายของ 1: เครื่องมือแพทย์ปลอดเชื้อ/เวชภัณฑ์');
    supplyHatch(3.2, -1.0, 1.8, false, 'ช่องจ่ายของ 2: งานบริการซัพพลายและจ่ายผ้าส่งซัก');
    supplyHatch(11.1, 4.3, 1.8, true, 'ช่องจ่ายของ 3: จ่ายผ้าสะอาดและอุปกรณ์การแพทย์');

    // 5. เฟอร์นิเจอร์ อุปกรณ์
    L.push({ text: '🚪 ห้องว่าง (ห้องอเนกประสงค์ฝั่งซ้ายสุด)', pos: V(-11.5, 2.2, 0), cls: 'int-label room-title' });
    const emptyNotice = supplyBox(1.2, 0.8, 0.04, 0xffffff);
    emptyNotice.position.set(-13.85, 1.6, 0);
    g.add(emptyNotice);

    L.push({ text: '🧼 ห้องจ่ายกลางและงานปลอดเชื้อ', pos: V(-6.1, 2.2, -2.5), cls: 'int-label room-title' });
    createSupplyPcDesk(-3.8, 0.5, -Math.PI / 2, SUPPLY_PC_SPECS[1], '🖥️ PC-SUPPLY-02: โต๊ะคอม 2', { role: 'nurse', shirtColor: 0x059669 });
    const autoClave1 = supplyBox(1.1, 1.6, 1.2, 0x94a3b8);
    autoClave1.position.set(-7.8, 0.8, -3.4);
    const autoDoor1 = supplyCyl(0.35, 0.35, 0.05, 0x334155, 20);
    autoDoor1.rotation.x = Math.PI / 2;
    autoDoor1.position.set(-7.8, 0.9, -2.78);
    const autoClave2 = supplyBox(1.1, 1.6, 1.2, 0x94a3b8);
    autoClave2.position.set(-5.8, 0.8, -3.4);
    const autoDoor2 = supplyCyl(0.35, 0.35, 0.05, 0x334155, 20);
    autoDoor2.rotation.x = Math.PI / 2;
    autoDoor2.position.set(-5.8, 0.9, -2.78);
    g.add(autoClave1, autoDoor1, autoClave2, autoDoor2);
    L.push({ text: '♨️ ตู้อบฆ่าเชื้อ Autoclave (134°C)', pos: V(-6.8, 2.0, -3.4), cls: 'int-label sub-tag' });

    L.push({ text: '💼 สำนักงานซัพพลาย', pos: V(1.0, 2.2, -2.5), cls: 'int-label room-title' });
    createSupplyPcDesk(-1.3, 0.1, 0, SUPPLY_PC_SPECS[2], '🖥️ PC-SUPPLY-03: โต๊ะคอม 2 (ธุรการซัพพลาย)', { role: 'nurse', shirtColor: 0x0284c7 });
    createSupplyPcDesk(2.4, -2.6, -Math.PI / 2, SUPPLY_PC_SPECS[0], '🖥️ PC-SUPPLY-01: โต๊ะคอม 1 (จ่ายพัสดุ)', { role: 'nurse', shirtColor: 0x0284c7 });
    const adminCab = supplyBox(2.2, 1.8, 0.5, 0x64748b);
    adminCab.position.set(1.0, 0.9, -3.9);
    g.add(adminCab);

    L.push({ text: '🚻 ห้องน้ำ', pos: V(-1.3, 2.0, 2.75), cls: 'int-label room-title' });
    const toilet1 = supplyBox(0.45, 0.45, 0.6, 0xffffff);
    toilet1.position.set(-2.4, 0.225, 3.8);
    const toilet2 = supplyBox(0.45, 0.45, 0.6, 0xffffff);
    toilet2.position.set(-1.2, 0.225, 3.8);
    const sink1 = supplyBox(0.55, 0.8, 0.45, 0xffffff);
    sink1.position.set(-2.4, 0.4, 1.8);
    const sink2 = supplyBox(0.55, 0.8, 0.45, 0xffffff);
    sink2.position.set(0.0, 0.4, 1.8);
    g.add(toilet1, toilet2, sink1, sink2);

    L.push({ text: '🌀 โซนเครื่องซักผ้าอุตสาหกรรม', pos: V(5.7, 2.3, 0), cls: 'int-label zone-er' });
    makeWasher(6.2, -2.5, 1, 'supply-wash-1', supplyState.wash1Running);
    makeWasher(6.2, 0.0, 2, 'supply-wash-2', supplyState.wash2Running);
    makeWasher(6.2, 2.5, 3, 'supply-wash-3', supplyState.wash3Running);

    L.push({
      text: `🧺 ห้องเก็บผ้าและอุปกรณ์ทางการแพทย์ (${supplyState.equipBusy ? '🔴 กำลังจัดเตรียมผ้า' : '🟢 สต็อกพร้อมจ่าย'})`,
      pos: V(11.1, 2.2, -1.0),
      cls: `int-label ${supplyState.equipBusy ? 'busy' : 'free'} toggleable`,
      toggleId: 'supply-store'
    });
    for (let lx = 9.2; lx <= 13.0; lx += 1.9) {
      const lShelf = supplyBox(1.7, 2.2, 0.8, 0x0284c7);
      lShelf.position.set(lx, 1.1, -3.6);
      g.add(lShelf);
      for (let ly = 0.5; ly <= 1.8; ly += 0.55) {
        const linenStack = supplyBox(1.5, 0.35, 0.7, 0xffffff);
        linenStack.position.set(lx, ly, -3.6);
        g.add(linenStack);
      }
    }
    const cart1 = supplyBox(1.4, 0.9, 0.8, 0x94a3b8);
    cart1.position.set(9.8, 0.45, 0.5);
    const cart2 = supplyBox(1.4, 0.9, 0.8, 0x94a3b8);
    cart2.position.set(12.4, 0.45, 0.5);
    g.add(cart1, cart2);
    L.push({ text: '🛒 รถเข็นผ้าสะอาดและเซ็ตผ่าตัด', pos: V(11.1, 1.5, 0.5), cls: 'int-label sub-tag' });

    const items = [
      ['🏢', 'อาคารซัพพลาย (Supply & CSSD)', 'งานจ่ายกลาง, ซักฟอก, ห้องเก็บผ้าและอุปกรณ์ทางการแพทย์, และห้องว่าง'],
      ['🚪', 'ห้องว่าง (ฝั่งซ้ายสุด)', 'ห้องอเนกประสงค์สำหรับขยายงานในอนาคต พร้อมประตูเชื่อมต่อ'],
      ['🧼', 'ห้องจ่ายกลางและงานปลอดเชื้อ', 'ตู้อบฆ่าเชื้อ Autoclave 2 ตู้, โต๊ะคอม 2, ช่องจ่ายของ 1'],
      ['🖥️', 'PC-SUPPLY-02: โต๊ะคอม 2 (คลังปลอดเชื้อ)', 'ดูสเปก', null, 'free', SUPPLY_PC_SPECS[1]],
      ['📦', 'ช่องจ่ายของ 1 (ห้องจ่ายกลาง)', 'เคาน์เตอร์กระจกเลื่อนสำหรับจ่ายเครื่องมือแพทย์ปลอดเชื้อ'],
      ['💼', 'สำนักงานซัพพลาย', 'โต๊ะคอม 1, โต๊ะคอม 2 (ธุรการ), ช่องจ่ายของ 2, ตู้เอกสาร'],
      ['🖥️', 'PC-SUPPLY-01: โต๊ะคอม 1 (จ่ายพัสดุ)', 'ดูสเปก', null, 'free', SUPPLY_PC_SPECS[0]],
      ['🖥️', 'PC-SUPPLY-03: โต๊ะคอม 2 (ธุรการซัพพลาย)', 'ดูสเปก', null, 'free', SUPPLY_PC_SPECS[2]],
      ['📦', 'ช่องจ่ายของ 2 (ห้องทำงาน)', 'เคาน์เตอร์จ่ายผ้าส่งซักและรับของ'],
      ['🚻', 'ห้องน้ำ', '1 ห้อง (2 ห้องสุขา, 2 อ่างล้างหน้า)'],
      ['🧺', 'เครื่องซักผ้าใหญ่ 1 (Commercial Washer)', 'เครื่องซักผ้าอุตสาหกรรมขนาดใหญ่', 'supply-wash-1', supplyState.wash1Running ? 'busy' : 'free'],
      ['🧺', 'เครื่องซักผ้าใหญ่ 2 (Commercial Washer)', 'เครื่องซักผ้าอุตสาหกรรมขนาดใหญ่', 'supply-wash-2', supplyState.wash2Running ? 'busy' : 'free'],
      ['🧺', 'เครื่องซักผ้าใหญ่ 3 (Commercial Washer)', 'เครื่องซักผ้าอุตสาหกรรมขนาดใหญ่', 'supply-wash-3', supplyState.wash3Running ? 'busy' : 'free'],
      ['🧺', 'ห้องเก็บผ้าและอุปกรณ์ทางการแพทย์', 'ชั้นวางผ้าสะอาด 3 ชุด, รถเข็นผ้า, ช่องจ่ายของ 3', 'supply-store', supplyState.equipBusy ? 'busy' : 'free'],
      ['📦', 'ช่องจ่ายของ 3 (ห้องเก็บผ้า)', 'เคาน์เตอร์จ่ายผ้าสะอาดและอุปกรณ์การแพทย์']
    ];

    return {
      group: g,
      labels: L,
      size: 32,
      title: 'อาคารซัพพลาย (งานจ่ายกลาง • ซักฟอก • ห้องเก็บผ้า)',
      sub: 'ผังภายใน: ห้องว่าง (ซ้ายสุด) • ห้องจ่ายกลางปลอดเชื้อ • สนง.ซัพพลายและห้องน้ำ • เครื่องซักผ้าใหญ่ 3 เครื่อง • ห้องเก็บผ้าและอุปกรณ์ทางการแพทย์ • ช่องจ่ายของ 3 จุด',
      items,
      cam: { pos: V(0, 24.0, 20.0), target: V(0, 0, 0) }
    };
  }

  function toggleSupplyStatus(id) {
    if (id === 'supply-wash-1') {
      supplyState.wash1Running = !supplyState.wash1Running;
      return true;
    }
    if (id === 'supply-wash-2') {
      supplyState.wash2Running = !supplyState.wash2Running;
      return true;
    }
    if (id === 'supply-wash-3') {
      supplyState.wash3Running = !supplyState.wash3Running;
      return true;
    }
    if (id === 'supply-store') {
      supplyState.equipBusy = !supplyState.equipBusy;
      return true;
    }
    return false;
  }

  K.Interiors.register('supply', buildSupplyInterior, toggleSupplyStatus);
})();
