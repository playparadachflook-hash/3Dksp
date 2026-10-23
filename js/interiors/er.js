/* =========================================================================
 * ตึกอุบัติเหตุฉุกเฉิน (PCU • ER • X-Ray • LAB • ห้องบัตร)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, walkwayStrip, erDeptSignTexture, makePerson } = C;

  const erPcuState = {
    pcuRooms: [
      { id: 'pcu-1', name: 'ห้องตรวจ 1 (PCU)', occupied: true },
      { id: 'pcu-2', name: 'ห้องตรวจ 2 (PCU)', occupied: true },
      { id: 'pcu-3', name: 'ห้องตรวจ 3 (PCU)', occupied: false }
    ],
    erBeds: [
      { id: 'er-bed-1', num: 1, name: 'เตียง 1 (ER)', x: 10.6, z: 3.9, occupied: true },
      { id: 'er-bed-2', num: 2, name: 'เตียง 2 (ER)', x: 8.7,  z: 3.9, occupied: true },
      { id: 'er-bed-3', num: 3, name: 'เตียง 3 (ER)', x: 6.8,  z: 3.9, occupied: false },
      { id: 'er-bed-4', num: 4, name: 'เตียง 4 (ER)', x: 4.9,  z: 3.9, occupied: true },
      { id: 'er-bed-5', num: 5, name: 'เตียง 5 (ER)', x: 3.0,  z: 3.9, occupied: false },
      { id: 'er-bed-6', num: 6, name: 'เตียง 6 (ER)', x: 1.1,  z: 3.9, occupied: true }
    ],
    extRooms: [
      { id: 'ext-lab',  name: 'ห้องทำงาน LAB', occupied: true },
      { id: 'ext-xray', name: 'ห้องเครื่อง X-Ray', occupied: true }
    ]
  };

  function buildErPcuInterior() {
    const g = new THREE.Group();
    const L = [];
    const pcList = [];

    // --- 1. พื้นอาคารแยกโซนชัดเจน & ทางเดินตัดผ่าหน้าห้องเชื่อมไปทางหลัก ---
    floor(g, 14.5, 14.0, '#f0f7ff', '#cbd5e1', 1.0, -8.75, 0); // กลุ่มงาน PCU (ซ้าย)
    floor(g, 15.5, 14.0, '#fff5f5', '#e2e8f0', 1.0, 6.25, 0);  // แผนก ER (กลาง)
    floor(g, 6.2,  14.0, '#f8fafc', '#cbd5e1', 1.0, 17.1, 0);  // โซนหน้า ER (จุดซักประวัติ/ที่นั่งคอย/เตียงรถเข็น)
    floor(g, 5.3,  14.0, '#e2e8f0', '#cbd5e1', 1.0, 22.85, 0); // พื้นโถงทางเดินคั่นหน้าห้อง X-Ray & เค้าเตอร์ลงทะเบียน

    // พื้นอาคารโซน X-Ray / ห้องบัตร / LAB (X: 25.5 .. 41.5, Z: -7.0 .. +7.0) หันหน้าเข้าหา ER
    floor(g, 16.0, 7.0, '#f8fafc', '#cbd5e1', 1.0, 33.5, -3.5); // ครึ่งบน (โซน X-Ray & LAB)
    floor(g, 16.0, 7.0, '#f0f9ff', '#bae6fd', 1.0, 33.5,  3.5); // ครึ่งล่าง (โซนเครื่อง X-Ray, ชั้นเก็บ OPD card & ห้องบัตร)
    // พื้นสีเหลืองหน้าห้องบัตรสำหรับ "เค้าเตอร์ลงทะเบียนผู้มารับบริการ" หันหน้าออกไปทาง ER (X: 24.0 .. 25.5, Z: 2.1 .. 6.8)
    floor(g, 1.5, 4.7, '#fef9c3', '#fde047', 0.5, 24.75, 4.45);

    // ทางเดินหลักด้านหน้าอาคาร (Z = 8.0)
    floor(g, 58.0, 1.8, '#e2e8f0', '#94a3b8', 1.0, 12.5, 8.0);

    // เส้นทางเดินชัดเจน (Walkway Guide Strips) — เปลี่ยนจากถนนเป็นทางเดินตัดผ่าหน้าห้องเชื่อมไปทางหลัก
    walkwayStrip(g, 6.1,   -0.7, 15.0, 1.15, 0);           // เส้นทางเดินกลางห้อง ER
    walkwayStrip(g, 17.9,  -0.7,  7.5, 1.25, 0);           // เส้นทางเดินเชื่อมประตูทางเข้า ER มายังทางเดินหน้าห้อง X-Ray
    walkwayStrip(g, 22.1,   0.6, 15.2, 1.45, Math.PI / 2); // เส้นทางเดินตัดผ่าหน้าห้อง X-Ray & ห้องบัตร เชื่อมลงทางเดินหลัก
    walkwayStrip(g, 12.5,   8.0, 57.5, 1.35, 0);           // เส้นทางเดินหลักหน้าอาคารเชื่อมทุกแผนก
    walkwayStrip(g, -7.1,   2.2,  9.2, 0.95, Math.PI / 2); // เส้นทางเดินในโถง PCU

    L.push({
      text: '⬆️ ทางเดินหน้าห้อง X-Ray / ห้องบัตร (เชื่อมไปทางหลัก) ⬇️',
      pos: V(22.1, 0.4, 1.2),
      cls: 'int-label walkway-tag'
    });
    L.push({ text: '🏥 กลุ่มงาน PCU (ฝั่งซ้าย)', pos: V(-8.5, 0.45, 8.0), cls: 'int-label zone-pcu' });
    L.push({ text: '🚑 อุบัติเหตุฉุกเฉิน ER (ตรงกลาง)', pos: V(6.5, 0.45, 8.0), cls: 'int-label zone-er' });
    L.push({ text: '🩻 ห้อง X-Ray • 🗂️ ห้องบัตร • 🔬 ห้อง LAB (หันหน้าไปทาง ER)', pos: V(33.0, 0.45, 8.0), cls: 'int-label zone-pcu' });
    L.push({ text: '➔ ทางเดินหลักหน้าอาคาร', pos: V(12.5, 0.3, 8.75), cls: 'int-label walkway-tag' });

    // --- Helpers สำหรับสร้างผนัง, ประตู, โต๊ะ, โต๊ะคอม, เตียง, เตียงรถเข็น ---
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

    function doorWay(x, z, rotY = 0, w = 1.1, showLabel = true) {
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

    function workDesk(opts) {
      const {
        x, z, w = 1.1, d = 0.62, rotY = 0,
        hasPC = true, label = null, staffRole = 'nurse', hasVisitor = false,
        pcInfo = null
      } = opts;
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      const topM = M.mat(hasPC ? 0xe2e8f0 : 0xd6b588, { roughness: 0.5 });
      const legM = M.mat(0x334155);
      const deskTop = M.box(dg, w, 0.06, d, topM, 0, 0.74, 0);
      addEdges(deskTop, 0x475569);
      M.box(dg, w - 0.08, 0.72, d - 0.08, M.mat(0x94a3b8), 0, 0.36, 0);

      if (hasPC) {
        const dark = M.mat(0x0f172a);
        const mon = M.box(dg, 0.44, 0.3, 0.03, dark, 0, 0.96, d / 2 - 0.1);
        addEdges(mon, 0x38bdf8);
        const scrGlow = M.box(dg, 0.4, 0.25, 0.01, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.96, d / 2 - 0.12);
        M.box(dg, 0.05, 0.12, 0.05, dark, 0, 0.8, d / 2 - 0.08);
        M.box(dg, 0.3, 0.02, 0.12, dark, 0, 0.78, -0.02);
        M.box(dg, 0.18, 0.38, 0.38, M.mat(0x1e293b), w / 2 - 0.16, 0.2, 0);
        if (pcInfo) {
          dg.userData.pcInfo = pcInfo;
          deskTop.userData.pcInfo = pcInfo;
          mon.userData.pcInfo = pcInfo;
          scrGlow.userData.pcInfo = pcInfo;
          pcList.push(pcInfo);
        }
      }

      M.box(dg, 0.42, 0.06, 0.42, legM, 0, 0.45, -d / 2 - 0.26);
      M.box(dg, 0.42, 0.45, 0.06, legM, 0, 0.7, -d / 2 - 0.46);
      const nurse = makePerson({ role: staffRole, pose: 'sit', rotY: 0 });
      nurse.position.set(0, 0, -d / 2 - 0.26);
      dg.add(nurse);

      if (hasVisitor) {
        M.box(dg, 0.38, 0.44, 0.38, M.mat(0x64748b), -w / 2 - 0.38, 0.22, -0.1);
        const pat = makePerson({ role: 'patient', pose: 'sit', rotY: Math.PI / 2 });
        pat.position.set(-w / 2 - 0.38, 0, -0.1);
        dg.add(pat);
      }

      g.add(dg);
      if (label) {
        L.push({
          text: pcInfo ? `🖥️ ${label}` : label,
          pos: V(x, 1.38, z),
          cls: pcInfo ? 'int-label pc-tag' : 'int-label sub-tag',
          pcInfo: pcInfo || null
        });
      }
      return dg;
    }

    function hospitalBed(opts) {
      const {
        x, z, rotY = 0, occupied = false,
        label = null, statusId = null, isSmall = false, labelY = 1.85
      } = opts;
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);
      bg.rotation.y = rotY;

      const bw = isSmall ? 0.82 : 0.92;
      const bd = isSmall ? 1.75 : 1.95;

      const frame = M.box(bg, bw, 0.45, bd, M.mat(0x64748b), 0, 0.225, 0);
      addEdges(frame, 0x1e293b);
      const sheetColor = occupied ? 0xfee2e2 : 0xecfdf5;
      const mattress = M.box(bg, bw - 0.06, 0.14, bd - 0.06, M.mat(sheetColor), 0, 0.52, 0);
      addEdges(mattress, occupied ? 0xdc2626 : 0x16a34a);
      M.box(bg, bw, 0.35, 0.06, M.mat(0x1e40af), 0, 0.65, -bd / 2 + 0.03);
      M.box(bg, bw, 0.25, 0.06, M.mat(0x1e40af), 0, 0.6, bd / 2 - 0.03);
      M.box(bg, bw * 0.6, 0.08, 0.28, M.mat(0xffffff), 0, 0.62, -bd / 2 + 0.24);

      if (occupied) {
        const pat = makePerson({ role: 'patient', pose: 'lie', rotY: 0 });
        bg.add(pat);
        const nurse = makePerson({ role: 'nurse', pose: 'stand', rotY: -Math.PI / 2 });
        nurse.position.set(bw / 2 + 0.32, 0, -0.15);
        bg.add(nurse);
        M.cyl(bg, 0.02, 0.02, 1.65, M.mat(0x94a3b8, { metalness: 0.6 }), -bw / 2 - 0.15, 0.82, -bd / 2 + 0.25, 8);
        M.box(bg, 0.1, 0.18, 0.06, M.mat(0x38bdf8, { transparent: true, opacity: 0.8 }), -bw / 2 - 0.15, 1.48, -bd / 2 + 0.25);
      }

      g.add(bg);

      if (label) {
        const statusText = occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง';
        L.push({
          text: `${label} (${statusText})`,
          pos: V(x, labelY, z),
          cls: `int-label ${occupied ? 'busy' : 'free'} ${statusId ? 'toggleable' : ''}`,
          toggleId: statusId
        });
      }
      return bg;
    }

    function stretcherBed(opts) {
      const { x, z, rotY = 0, num = 1 } = opts;
      const sg = new THREE.Group();
      sg.position.set(x, 0, z);
      sg.rotation.y = rotY;

      const bw = 0.76, bd = 1.85;
      const steelM = M.mat(0xcbd5e1, { metalness: 0.7, roughness: 0.25 });
      const wheelM = M.mat(0x1e293b, { roughness: 0.8 });
      const padM = M.mat(0x0284c7, { roughness: 0.45 });

      [[-bw / 2 + 0.08, -bd / 2 + 0.2], [bw / 2 - 0.08, -bd / 2 + 0.2],
       [-bw / 2 + 0.08, bd / 2 - 0.2],  [bw / 2 - 0.08, bd / 2 - 0.2]].forEach(([wx, wz]) => {
        const w = M.cyl(sg, 0.1, 0.1, 0.05, wheelM, wx, 0.1, wz, 14);
        w.rotation.z = Math.PI / 2;
        M.cyl(sg, 0.025, 0.025, 0.48, steelM, wx, 0.34, wz, 8);
      });

      M.box(sg, bw - 0.1, 0.04, bd - 0.3, steelM, 0, 0.22, 0);
      const topFrame = M.box(sg, bw, 0.06, bd, steelM, 0, 0.58, 0);
      addEdges(topFrame, 0x475569);

      const pad = M.box(sg, bw - 0.06, 0.09, bd - 0.45, padM, 0, 0.65, 0.18);
      addEdges(pad, 0x0369a1);
      const headPad = M.box(sg, bw - 0.06, 0.09, 0.42, padM, 0, 0.72, -bd / 2 + 0.24);
      headPad.rotation.x = 0.35;
      addEdges(headPad, 0x0369a1);

      [-bw / 2 + 0.02, bw / 2 - 0.02].forEach((rx) => {
        M.box(sg, 0.03, 0.03, bd * 0.62, steelM, rx, 0.86, 0.05);
        M.box(sg, 0.025, 0.26, 0.025, steelM, rx, 0.73, -bd * 0.25);
        M.box(sg, 0.025, 0.26, 0.025, steelM, rx, 0.73, bd * 0.32);
      });

      M.box(sg, bw * 0.85, 0.035, 0.035, steelM, 0, 0.82, -bd / 2 - 0.06);

      g.add(sg);
      L.push({ text: `🛞 เตียงรถเข็น ${num}`, pos: V(x, 1.25, z), cls: 'int-label sub-tag' });
      return sg;
    }

    function makePcSpec(code, name, role, ipSuffix, software) {
      const spec = {
        code,
        name,
        role,
        cpu: 'Intel Core i5-13500 (14 Cores)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'SSD 512 GB NVMe M.2',
        monitor: 'Dell 24" IPS Full HD ถนอมสายตา',
        os: 'Windows 11 Pro 64-bit (Hospital Domain)',
        ip: `192.168.10.${ipSuffix}`,
        status: '🟢 ออนไลน์',
        software,
        peripherals: 'เครื่องอ่านบัตรประชาชน Smart Card • เครื่องสแกนบาร์โค้ดผู้ป่วย',
        user: role
      };
      pcList.push(spec);
      return spec;
    }

    // 2. ก่อผนัง
    wall(-16, -7, 14, -7, 0.24, WH, true);
    wall(-16, -7, -16, 7, 0.24, WH, true);
    wall(-16, 7, -8.0, 7, 0.24, WH, true);
    wall(-6.2, 7, -0.4, 7, 0.24, WH, true);
    wall(1.2, 7, 14, 7, 0.24, WH, true);
    wall(14, -7, 14, -1.8, 0.24, WH, true);
    wall(14, 0.4, 14, 7, 0.24, WH, true);
    wall(-1.5, -7, -1.5, 7, 0.22, WH, true);

    // 3. ฝั่งซ้าย: กลุ่มงาน PCU
    wall(-12.4, -7, -12.4, 7, 0.14, WH);
    wall(-16, -2.4, -12.4, -2.4, 0.14, WH);
    wall(-16, 2.2, -12.4, 2.2, 0.14, WH);

    // =========================================================================
    // 🔀 ฟังก์ชันสร้างตู้แร็คแขวนผนัง Switch Hub (ใช้ร่วมกันทั้ง PCU และ X-Ray)
    // =========================================================================
    function makeWallSwitchRack(x, y, z, serverId, rotY = 0) {
      const swg = new THREE.Group();
      swg.position.set(x, y, z);
      swg.rotation.y = rotY;

      function maintBox(w, h, d, color, metalness = 0.4, roughness = 0.5) {
        return new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({ color, metalness, roughness })
        );
      }

      // 1. Metal Wall Mounting Bracket / Backplate
      const bracket = maintBox(0.74, 0.58, 0.04, 0x0f172a);
      bracket.position.set(0, 0, 0.20);
      swg.add(bracket);

      // 2. 6U Wallmount Cabinet Frame (Black / Dark Slate with cyan edge highlight)
      const cab = maintBox(0.72, 0.54, 0.42, 0x1e293b);
      cab.position.set(0, 0, 0);
      addEdges(cab, 0x0284c7);
      cab.userData.serverId = serverId;
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
      doorGlass.userData.serverId = serverId;
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
      for (let px = -0.25; px <= 0.25; px += 0.022) {
        const jack = maintBox(0.014, 0.018, 0.01, 0x475569);
        jack.position.set(px, 0.13, -0.192);
        swg.add(jack);
      }

      // Unit B: 1U Managed Switch Hub (y = 0.0)
      const swUnit = maintBox(0.62, 0.08, 0.34, 0x0284c7);
      swUnit.position.set(0, 0.0, -0.04);
      addEdges(swUnit, 0x38bdf8);
      swUnit.userData.serverId = serverId;
      swg.add(swUnit);

      // Switch Faceplate (Dark Metallic)
      const faceplate = maintBox(0.60, 0.07, 0.015, 0x0f172a);
      faceplate.position.set(0, 0.0, -0.205);
      faceplate.userData.serverId = serverId;
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

      // 24 RJ-45 Gigabit Ports with Activity LEDs
      for (let px = -0.12; px <= 0.25; px += 0.016) {
        const port = maintBox(0.011, 0.018, 0.008, 0x334155);
        port.position.set(px, -0.01, -0.212);
        port.userData.serverId = serverId;
        swg.add(port);

        const led = maintBox(0.006, 0.006, 0.004, 0x22c55e);
        led.material = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        led.position.set(px, 0.015, -0.213);
        swg.add(led);
      }

      // Short looped patch cables between Patch Panel and Switch Ports
      for (let px = -0.10; px <= 0.23; px += 0.033) {
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

    const r1 = erPcuState.pcuRooms[0];
    const r2 = erPcuState.pcuRooms[1];
    const r3 = erPcuState.pcuRooms[2];

    // ห้องตรวจ 3
    hospitalBed({ x: -14.3, z: -5.9, rotY: Math.PI / 2, occupied: r3.occupied, isSmall: true });
    L.push({ text: 'เตียง', pos: V(-14.3, 1.0, -5.9), cls: 'int-label sub-tag' });
    workDesk({ x: -14.3, z: -3.1, w: 1.2, d: 0.6, rotY: 0, hasPC: false, label: 'โต๊ะ', hasVisitor: r3.occupied });
    L.push({
      text: `ห้องตรวจ 3: ${r3.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง'}`,
      pos: V(-14.2, 2.15, -4.5),
      cls: `int-label ${r3.occupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'pcu-3'
    });

    // ห้องตรวจ 2
    workDesk({
      x: -14.3, z: 1.55, w: 1.25, d: 0.62, rotY: 0,
      hasPC: true, label: 'โต๊ะคอม', hasVisitor: r2.occupied,
      pcInfo: makePcSpec('PC-PCU-01', 'โต๊ะคอมพิวเตอร์ ห้องตรวจ 2 (PCU)', 'แพทย์/พยาบาลเวชปฏิบัติตรวจรักษาผู้ป่วยนอก PCU', '101', 'ระบบ HOSxP OPD • ระบบสั่งยาอิเล็กทรอนิกส์ (CPOE) • ระบบดูผลแล็บ')
    });
    if (r2.occupied) {
      const n2 = makePerson({ role: 'nurse', pose: 'stand', rotY: 0.4 });
      n2.position.set(-13.2, 0, -0.4);
      g.add(n2);
    }
    L.push({
      text: `ห้องตรวจ 2: ${r2.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง'}`,
      pos: V(-14.2, 2.15, -0.3),
      cls: `int-label ${r2.occupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'pcu-2'
    });

    // ห้องตรวจ 1
    const fridge = M.box(g, 0.75, 1.45, 0.7, M.mat(0xe0f2fe, { metalness: 0.3 }), -15.3, 0.725, 6.2);
    addEdges(fridge, 0x0284c7);
    L.push({ text: 'ตู้เย็น', pos: V(-15.3, 1.65, 6.2), cls: 'int-label sub-tag' });
    hospitalBed({ x: -13.6, z: 6.1, rotY: Math.PI / 2, occupied: r1.occupied, isSmall: true });
    L.push({ text: 'เตียง', pos: V(-13.6, 1.0, 6.1), cls: 'int-label sub-tag' });
    L.push({
      text: `ห้องตรวจ 1: ${r1.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง'}`,
      pos: V(-14.2, 2.15, 4.1),
      cls: `int-label ${r1.occupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'pcu-1'
    });

    // 🔀 ตู้แร็คแขวนผนัง Switch Hub KSP-SW-PCU (ตำแหน่งมาร์คสีแดง ผนังห้องตรวจ 1 ฝั่งทิศเหนือ)
    makeWallSwitchRack(-14.30, 2.05, 6.67, 'ksp-sw-pcu', 0);
    L.push({
      text: '🔀 KSP-SW-PCU (10.10.100.9)',
      pos: V(-14.30, 2.70, 6.45),
      cls: 'int-label server-badge clickable',
      serverId: 'ksp-sw-pcu'
    });

    // โถงซ้ายหน้าห้องตรวจ
    wall(-9.5, -7, -9.5, 1.8, 0.16, WH);
    wall(-9.5, 3.4, -9.5, 7, 0.16, WH);
    doorWay(-9.5, 2.6, Math.PI / 2, 1.2);
    workDesk({
      x: -10.05, z: -3.6, w: 1.15, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-PCU-02', 'โต๊ะคอมจุดคัดกรองหน้าห้องตรวจ PCU', 'พยาบาลวิชาชีพคัดกรองและส่งตรวจห้องตรวจ 1-3', '102', 'ระบบ HOSxP Screening • ระบบเรียกคิวหน้าห้องตรวจ PCU')
    });

    // โถงกลาง PCU & ห้อง X-Ray PCU
    wall(-8.8, -7, -8.8, -4.4, 0.16, WH);
    wall(-8.8, -4.4, -5.5, -4.4, 0.16, WH);
    wall(-5.5, -7, -5.5, -4.4, 0.16, WH);
    M.box(g, 1.8, 0.55, 0.9, M.mat(0x94a3b8), -7.15, 0.275, -5.8);
    M.cyl(g, 0.15, 0.15, 1.5, M.mat(0x475569), -7.15, 0.75, -6.4, 12);
    L.push({ text: '🩻 ห้อง X-Ray PCU', pos: V(-7.15, 1.85, -5.7), cls: 'int-label room-title' });

    workDesk({
      x: -8.95, z: -2.0, w: 1.1, d: 0.62, rotY: -Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-PCU-03', 'โต๊ะคอมพิวเตอร์โถง PCU (จุดที่ 1)', 'พยาบาลวิชาชีพบันทึกข้อมูลสุขภาพชุมชนและวัคซีน', '103', 'ระบบ HOSxP PCU • ระบบงานสร้างเสริมสุขภาพและภูมิคุ้มกันโรค')
    });
    workDesk({
      x: -8.95, z: 1.4, w: 1.1, d: 0.62, rotY: -Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-PCU-04', 'โต๊ะคอมพิวเตอร์โถง PCU (จุดที่ 2)', 'พยาบาลวิชาชีพติดตามผู้ป่วยโรคเรื้อรัง (NCDs)', '104', 'ระบบ HOSxP NCDs Clinic • ระบบฐานข้อมูลเบาหวาน-ความดัน')
    });
    workDesk({
      x: -8.95, z: 5.4, w: 1.1, d: 0.62, rotY: -Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-PCU-05', 'โต๊ะคอมพิวเตอร์ลงทะเบียน PCU (จุดที่ 3)', 'เจ้าหน้าที่เวชระเบียนและตรวจสอบสิทธิผู้ป่วย PCU', '105', 'ระบบ HOSxP Registry • ระบบตรวจสอบสิทธิ สปสช. Smart Card')
    });

    workDesk({
      x: -5.35, z: -1.2, w: 1.1, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-PCU-06', 'โต๊ะคอมพิวเตอร์ประสานงาน PCU', 'พยาบาลประสานงานส่งต่อและเยี่ยมบ้าน', '106', 'ระบบ Thai Refer • ระบบเยี่ยมบ้าน (Home Health Care)')
    });

    doorWay(-7.1, 7.0, 0, 1.4);
    workDesk({ x: -5.4, z: 6.3, w: 1.0, d: 0.6, rotY: 0, hasPC: false, label: 'โต๊ะ' });

    // โซนขวาของ PCU
    wall(-4.8, -7, -4.8, -3.8, 0.16, WH);
    wall(-4.8, -2.5, -4.8, -0.8, 0.16, WH);
    wall(-4.8, 0.6, -4.8, 2.2, 0.16, WH);
    wall(-4.8, 3.6, -4.8, 7, 0.16, WH);

    wall(-3.1, -7, -3.1, -2.6, 0.14, WH);
    wall(-4.8, -2.6, -1.5, -2.6, 0.16, WH);
    doorWay(-4.8, -3.2, Math.PI / 2, 1.0);
    doorWay(-2.3, -2.6, 0, 0.95);
    workDesk({ x: -3.95, z: -5.5, w: 1.0, d: 0.6, rotY: Math.PI, hasPC: false, label: 'โต๊ะ', staffRole: 'doctor' });
    L.push({ text: 'ห้องหัวหน้า', pos: V(-3.95, 1.85, -3.8), cls: 'int-label room-title' });
    L.push({ text: '🚻 ห้องน้ำ', pos: V(-2.3, 1.85, -4.8), cls: 'int-label room-title' });

    wall(-4.8, 1.6, -1.5, 1.6, 0.16, WH);
    doorWay(-4.8, -0.1, Math.PI / 2, 1.1);
    workDesk({ x: -3.9, z: -1.9, w: 0.95, d: 0.55, rotY: Math.PI, hasPC: false, label: 'โต๊ะ' });
    const meetTable = M.box(g, 1.9, 0.74, 1.2, M.mat(0xb08355), -2.8, 0.37, 0.1);
    addEdges(meetTable, 0x78350f);
    [-3.3, -2.3].forEach((mx) => {
      const s1 = makePerson({ role: 'nurse', pose: 'sit', rotY: 0 });
      s1.position.set(mx, 0, -0.7);
      g.add(s1);
      const s2 = makePerson({ role: 'nurse', pose: 'sit', rotY: Math.PI });
      s2.position.set(mx, 0, 0.9);
      g.add(s2);
    });
    L.push({ text: 'โต๊ะประชุม', pos: V(-2.8, 1.5, 0.1), cls: 'int-label room-title' });

    wall(-3.1, 1.6, -3.1, 7, 0.14, WH);
    doorWay(-4.8, 2.9, Math.PI / 2, 1.1);
    doorWay(-3.1, 2.9, Math.PI / 2, 1.1);
    workDesk({ x: -4.25, z: 5.5, w: 0.95, d: 0.55, rotY: -Math.PI / 2, hasPC: false, label: 'โต๊ะ' });
    workDesk({ x: -3.65, z: 5.5, w: 0.95, d: 0.55, rotY: Math.PI / 2,  hasPC: false, label: 'โต๊ะ' });
    workDesk({ x: -2.55, z: 5.5, w: 0.95, d: 0.55, rotY: -Math.PI / 2, hasPC: false, label: 'โต๊ะ' });
    workDesk({ x: -1.95, z: 5.5, w: 0.95, d: 0.55, rotY: Math.PI / 2,  hasPC: false, label: 'โต๊ะ' });

    // 4. แผนกอุบัติเหตุฉุกเฉิน ER
    wall(-1.5, -2.6, 5.6, -2.6, 0.14, WH);
    wall(5.6, -7.0, 5.6, -2.6, 0.14, WH);
    doorWay(0.3, -2.6, 0, 1.1);
    L.push({ text: '🛋️ ห้องพักเจ้าหน้าที่', pos: V(1.8, 1.85, -4.8), cls: 'int-label room-title' });
    M.box(g, 2.2, 0.65, 0.8, M.mat(0x64748b), 1.5, 0.325, -6.1);

    const eq1 = M.box(g, 0.75, 0.95, 3.8, M.mat(0xcbd5e1), 5.1, 0.475, -4.8);
    addEdges(eq1, 0x475569);
    L.push({ text: 'เค้าเตอร์เก็บอุปกรณ์', pos: V(5.1, 1.45, -4.8), cls: 'int-label sub-tag' });

    const eq2 = M.box(g, 3.2, 0.95, 0.8, M.mat(0xcbd5e1), 3.3, 0.475, -1.9);
    addEdges(eq2, 0x475569);
    L.push({ text: 'เค้าเตอร์เก็บอุปกรณ์', pos: V(3.3, 1.45, -1.9), cls: 'int-label sub-tag' });

    wall(10.0, -7.0, 10.0, -2.8, 0.16, WH);
    wall(10.0, -2.8, 14.0, -2.8, 0.16, WH);
    doorWay(11.6, -2.8, 0, 1.05);
    L.push({ text: '📦 ห้องเก็บอุปกรณ์', pos: V(12.3, 1.95, -5.4), cls: 'int-label room-title' });
    M.box(g, 2.4, 1.4, 0.5, M.mat(0x94a3b8), 12.5, 0.7, -6.5);

    workDesk({
      x: 10.65, z: -4.6, w: 1.15, d: 0.6, rotY: -Math.PI / 2,
      hasPC: false, label: 'โต๊ะ'
    });

    const erTopRoles = [
      ['PC-ER-01', 'โต๊ะคอมพิวเตอร์ ER จุดที่ 1 (หัวหน้าเวร)', 'พยาบาลหัวหน้าเวรฉุกเฉิน ควบคุมการสั่งการและรับส่งต่อผู้ป่วย', '201', 'ระบบ HOSxP ER Console • ระบบศูนย์สั่งการรถพยาบาล (EMS 1669)'],
      ['PC-ER-02', 'โต๊ะคอมพิวเตอร์ ER จุดที่ 2 (บันทึกหัตถการ)', 'พยาบาลวิชาชีพบันทึกหัตถการและการรักษาฉุกเฉิน', '202', 'ระบบ HOSxP ER Nursing Note • ระบบเบิกเวชภัณฑ์ฉุกเฉิน'],
      ['PC-ER-03', 'โต๊ะคอมพิวเตอร์ ER จุดที่ 3 (สั่งแล็บ/เอกซเรย์)', 'พยาบาลวิชาชีพส่งตรวจทางห้องปฏิบัติการและดูผล PACS', '203', 'ระบบ LIS Lab Order • ระบบ PACS ดูฟิล์มเอกซเรย์ดิจิทัล'],
      ['PC-ER-04', 'โต๊ะคอมพิวเตอร์ ER จุดที่ 4 (จำหน่าย/ส่งต่อ)', 'พยาบาลวิชาชีพสรุปชาร์ตผู้ป่วยและประสานงานหอผู้ป่วยใน (IPD)', '204', 'ระบบ HOSxP IPD Admission • ระบบ Thai Refer ส่งต่อผู้ป่วย']
    ];
    [-6.1, -4.9, -3.7, -2.5].forEach((zk, idx) => {
      const r = erTopRoles[idx];
      workDesk({
        x: 9.42, z: zk, w: 1.05, d: 0.6, rotY: Math.PI / 2,
        hasPC: true, label: 'โต๊ะคอม',
        pcInfo: makePcSpec(r[0], r[1], r[2], r[3], r[4])
      });
    });

    L.push({ text: '➔ เส้นทางเดินภายใน ER', pos: V(5.8, 0.35, -0.7), cls: 'int-label walkway-tag' });
    doorWay(14.0, -0.7, Math.PI / 2, 2.1);
    doorWay(0.4, 7.0, 0, 1.4);

    const signBoardMat = new THREE.MeshStandardMaterial({ map: erDeptSignTexture(), roughness: 0.4 });
    const sideSignMat = M.mat(0x991b1b);
    const erSignMesh = M.box(
      g, 0.16, 0.78, 3.4,
      [signBoardMat, signBoardMat, sideSignMat, sideSignMat, sideSignMat, sideSignMat],
      14.0, 2.25, -0.7
    );
    addEdges(erSignMesh, 0xfef08a);
    M.box(g, 0.2, 0.65, 0.2, M.mat(0x334155), 14.0, 1.85, -2.25);
    M.box(g, 0.2, 0.65, 0.2, M.mat(0x334155), 14.0, 1.85, 0.85);
    L.push({
      text: '🚑 ป้ายเชื่อมทางเดิน: แผนกอุบัติเหตุฉุกเฉิน',
      pos: V(14.0, 2.95, -0.7),
      cls: 'int-label er-sign'
    });

    erPcuState.erBeds.forEach((bed, idx) => {
      hospitalBed({
        x: bed.x,
        z: bed.z,
        rotY: 0,
        occupied: bed.occupied,
        label: `เตียง ${bed.num}`,
        statusId: bed.id,
        labelY: idx % 2 === 0 ? 1.72 : 2.22
      });
    });

    workDesk({
      x: 13.38, z: 1.8, w: 1.15, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-ER-05', 'โต๊ะคอมพิวเตอร์พยาบาลเฝ้าระวังเตียงฉุกเฉิน (จุดที่ 5)', 'พยาบาลวิชาชีพติดตามสัญญาณชีพ Central Monitor เตียง 1-6', '205', 'ระบบ Central Vital Signs Monitor • ระบบ HOSxP ER Real-time Chart')
    });
    workDesk({
      x: 13.38, z: 4.3, w: 1.15, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-ER-06', 'โต๊ะคอมพิวเตอร์คัดกรองและรับผู้ป่วย ER (จุดที่ 6)', 'พยาบาลวิชาชีพรับผู้ป่วยจากจุดซักประวัติและจัดลำดับความเร่งด่วน (ESI)', '206', 'ระบบ ER Triage (ESI 5 Levels) • ระบบสั่งยาฉุกเฉิน Stat Dose')
    });

    // 5. โซนนอกตัวตึก
    const triageCounter = M.box(g, 1.1, 0.85, 4.6, M.mat(0xfef08a), 15.0, 0.425, 3.6);
    addEdges(triageCounter, 0xca8a04);
    [2.4, 4.6].forEach((tz) => {
      const triageNurse = makePerson({ role: 'nurse', pose: 'sit', rotY: Math.PI / 2 });
      triageNurse.position.set(14.35, 0, tz);
      g.add(triageNurse);

      M.box(g, 0.38, 0.42, 0.38, M.mat(0x64748b), 15.85, 0.21, tz);
      const triagePat = makePerson({ role: 'patient', pose: 'sit', rotY: -Math.PI / 2 });
      triagePat.position.set(15.85, 0, tz);
      g.add(triagePat);
    });
    L.push({ text: '📋 จุดซักประวัติ (มีพยาบาลประจำ)', pos: V(15.0, 1.95, 3.6), cls: 'int-label room-title' });

    [3.0, 4.8].forEach((wz) => {
      const wc = new THREE.Group();
      wc.position.set(17.0, 0, wz);
      M.box(wc, 0.65, 0.08, 0.6, M.mat(0x1e3a8a), 0, 0.48, 0);
      M.box(wc, 0.08, 0.55, 0.6, M.mat(0x1e3a8a), -0.28, 0.75, 0);
      M.cyl(wc, 0.28, 0.28, 0.06, M.mat(0x1f2937), 0, 0.28, 0.32, 16).rotation.x = Math.PI / 2;
      M.cyl(wc, 0.28, 0.28, 0.06, M.mat(0x1f2937), 0, 0.28, -0.32, 16).rotation.x = Math.PI / 2;
      g.add(wc);
      L.push({ text: '🦽 รถเข็น', pos: V(17.0, 1.15, wz), cls: 'int-label sub-tag' });
    });

    L.push({ text: '⬅ เส้นทางเดินเข้าแผนกอุบัติเหตุฉุกเฉิน', pos: V(17.5, 0.35, -0.7), cls: 'int-label walkway-tag' });

    const nebBox = M.box(g, 1.6, 0.85, 1.4, M.mat(0xe0f2fe), 15.4, 0.425, -5.6);
    addEdges(nebBox, 0x0284c7);
    const nebNurse = makePerson({ role: 'nurse', pose: 'stand', rotY: 0 });
    nebNurse.position.set(15.0, 0, -6.2);
    g.add(nebNurse);
    const nebPat = makePerson({ role: 'patient', pose: 'sit', rotY: 0 });
    nebPat.position.set(15.7, 0, -5.2);
    g.add(nebPat);
    L.push({ text: '💨 จุดพ่นยา', pos: V(15.4, 1.85, -5.6), cls: 'int-label room-title' });

    const waitGroup = new THREE.Group();
    waitGroup.position.set(18.3, 0, -5.6);
    [-0.45, 0.45].forEach((bz) => {
      const bench = M.box(waitGroup, 2.8, 0.42, 0.5, M.mat(0x3b82f6), 0, 0.21, bz);
      addEdges(bench, 0x1d4ed8);
      M.box(waitGroup, 2.8, 0.42, 0.08, M.mat(0x2563eb), 0, 0.52, bz - 0.22);
    });
    const relColors = [0xf59e0b, 0xec4899, 0x8b5cf6, 0x10b981, 0xef4444];
    [[-0.95, -0.45], [0, -0.45], [0.95, -0.45], [-0.55, 0.45], [0.55, 0.45]].forEach(([rx, rz], i) => {
      const rel = makePerson({ role: 'relative', shirtColor: relColors[i], pose: 'sit', rotY: 0 });
      rel.position.set(rx, 0, rz);
      waitGroup.add(rel);
    });
    g.add(waitGroup);
    L.push({ text: '🪑 ที่นั่งคอย (ญาติคนไข้นั่งรอ)', pos: V(18.3, 1.95, -5.6), cls: 'int-label room-title' });

    [16.9, 18.0, 19.1].forEach((bx, idx) => {
      stretcherBed({ x: bx, z: -3.1, rotY: 0, num: idx + 1 });
    });

    // 6. โซน X-Ray, ห้องบัตร, LAB
    const labRoom  = erPcuState.extRooms[0];
    const xrayRoom = erPcuState.extRooms[1];

    const CX = 33.5, CZ = 0.0;
    const SX = 8.0 / 7.0;
    const SZ = 7.0 / 11.0;
    const WX = (x0, z0) => CX - z0 * SX;
    const WZ = (x0)     => CZ + (x0 - 31.5) * SZ;
    const rV = (x0, y, z0) => V(WX(x0, z0), y, WZ(x0));

    function rWall(x1, z1, x2, z2, thick = 0.16, h = WH, isOuter = false) {
      return wall(WX(x1, z1), WZ(x1), WX(x2, z2), WZ(x2), thick, h, isOuter);
    }
    function rDoor(x0, z0, rot0 = 0, w = 1.25, showLabel = true) {
      return doorWay(WX(x0, z0), WZ(x0), rot0 - Math.PI / 2, w * 0.78, showLabel);
    }
    function rDesk(opts) {
      return workDesk({
        ...opts,
        x: WX(opts.x, opts.z),
        z: WZ(opts.x),
        w: (opts.w || 1.25) * 0.72,
        d: (opts.d || 0.62) * 0.85,
        rotY: (opts.rotY || 0) - Math.PI / 2
      });
    }
    function rBox(w0, h, d0, mat, x0, y, z0) {
      return M.box(g, d0 * SX, h, w0 * SZ, mat, WX(x0, z0), y, WZ(x0));
    }

    rWall(20.5, -7.0, 29.4, -7.0, 0.22, WH, true);
    rWall(31.0, -7.0, 42.5, -7.0, 0.22, WH, true);
    rDoor(30.2, -7.0, 0, 1.3, true);

    rWall(20.5, -7.0, 20.5, -2.8, 0.22, WH, true);
    rWall(20.5, -1.4, 20.5,  0.8, 0.22, WH, true);
    rWall(20.5,  2.2, 20.5,  7.0, 0.22, WH, true);
    rDoor(20.5, -2.1, Math.PI / 2, 1.25, true);
    rDoor(20.5,  1.5, Math.PI / 2, 1.25, true);

    rWall(42.5, -7.0, 42.5, -3.0, 0.22, WH, true);
    rWall(42.5, -1.4, 42.5,  7.0, 0.22, WH, true);
    rDoor(42.5, -2.2, Math.PI / 2, 1.35, true);

    rWall(31.5, -7.0, 31.5,  0.0, 0.20, WH, true);
    rWall(27.6,  0.0, 31.5,  0.0, 0.18, WH);
    rWall(27.6,  0.0, 27.6,  7.0, 0.20, WH, true);

    rWall(20.5, 7.0, 25.6, 7.0, 0.22, WH, true);
    rWall(27.2, 7.0, 30.2, 7.0, 0.22, WH, true);
    rWall(31.8, 7.0, 40.5, 7.0, 0.22, WH, true);
    rWall(42.0, 7.0, 42.5, 7.0, 0.22, WH, true);
    rDoor(26.4, 7.0, 0, 1.35, true);
    rDoor(31.0, 7.0, 0, 1.35, true);
    rDoor(41.25, 7.0, 0, 1.3, true);

    // LAB
    rWall(26.0, -7.0, 26.0, -5.4, 0.16, WH);
    rWall(26.0, -3.9, 26.0, -3.8, 0.16, WH);
    rDoor(26.0, -4.65, Math.PI / 2, 1.25, true);

    rWall(20.5, -3.8, 23.2, -3.8, 0.16, WH);
    rWall(24.7, -3.8, 31.5, -3.8, 0.16, WH);
    rDoor(23.95, -3.8, 0, 1.25, true);

    const labBench = rBox(3.6, 0.85, 0.72, M.mat(0xf8fafc), 22.8, 0.425, -6.3);
    addEdges(labBench, 0x4f46e5);
    rBox(0.85, 0.52, 0.5, M.mat(0x0284c7), 21.8, 1.11, -6.3);
    rBox(0.75, 0.48, 0.48, M.mat(0x0d9488), 23.4, 1.09, -6.3);
    L.push({
      text: `🔬 ห้องทำงาน LAB: ${labRoom.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง'}`,
      pos: rV(23.2, 2.05, -5.4),
      cls: `int-label ${labRoom.occupied ? 'busy' : 'free'} toggleable`,
      toggleId: labRoom.id
    });

    rDesk({
      x: 27.6, z: -6.25, w: 1.25, d: 0.62, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-LAB-01', 'โต๊ะคอมพิวเตอร์ลงทะเบียนรับสิ่งส่งตรวจ LAB', 'เจ้าหน้าที่ห้องปฏิบัติการรับใบสั่งแล็บและพิมพ์บาร์โค้ดหลอดเลือด', '210', 'ระบบ HOSxP LIS Barcode • ระบบรับสิ่งส่งตรวจ (Specimen Check-in)')
    });
    rDesk({
      x: 29.5, z: -4.55, w: 1.55, d: 0.65, rotY: Math.PI,
      hasPC: false, label: 'โต๊ะเจาะเลือด', staffRole: 'nurse', hasVisitor: true
    });

    rWall(20.5, -0.3, 25.4, -0.3, 0.16, WH);
    rWall(27.0, -0.3, 31.5, -0.3, 0.16, WH);
    rDoor(26.2, -0.3, 0, 1.3, true);

    rDesk({
      x: 30.65, z: -2.8, w: 1.15, d: 0.6, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-LAB-02', 'โต๊ะคอมพิวเตอร์วิเคราะห์ผลโลหิตวิทยา (LAB)', 'นักเทคนิคการแพทย์ตรวจสอบผล CBC และภูมิคุ้มกันวิทยา', '211', 'ระบบ HOSxP LIS Hematology • ระบบเชื่อมต่อเครื่องตรวจวิเคราะห์อัตโนมัติ')
    });
    rDesk({
      x: 30.65, z: -1.5, w: 1.15, d: 0.6, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-LAB-03', 'โต๊ะคอมพิวเตอร์วิเคราะห์เคมีคลินิก (LAB)', 'นักเทคนิคการแพทย์ตรวจสอบผลเคมีคลินิกและจุลทรรศนศาสตร์', '212', 'ระบบ HOSxP LIS Chemistry • ระบบควบคุมคุณภาพห้องปฏิบัติการ (Lab QC)')
    });
    rDesk({
      x: 28.2, z: -0.95, w: 1.3, d: 0.62, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-LAB-04', 'โต๊ะคอมพิวเตอร์อนุมัติและรายงานผล LAB', 'นักเทคนิคการแพทย์ยืนยันผลตรวจวิเคราะห์เข้าสู่ระบบแพทย์ (OPD/ER)', '213', 'ระบบ HOSxP LIS Result Approval • ระบบแจ้งเตือนค่าวิกฤต (Critical Value)')
    });

    rWall(20.5, 2.9, 27.6, 2.9, 0.16, WH);

    rDesk({
      x: 22.8, z: 0.45, w: 1.45, d: 0.62, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม Lab 1', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-LAB-05', 'โต๊ะคอมพิวเตอร์ Lab 1 (จุลชีววิทยา/คลังเลือด)', 'นักเทคนิคการแพทย์บันทึกผลเพาะเชื้อและบริหารคลังเลือดสำรอง', '214', 'ระบบ Blood Bank Management • ระบบ HOSxP Microbiology')
    });

    rWall(21.2, 1.35, 24.8, 1.35, 0.12, 1.25);
    rWall(21.2, 1.35, 21.2, 2.9,  0.12, 1.25);
    rWall(24.8, 1.35, 24.8, 2.9,  0.12, 1.25);
    rBox(2.0, 0.55, 0.72, M.mat(0x64748b), 23.0, 0.28, 2.25);
    L.push({ text: '🛋️ ห้องพักเจ้าหน้าที่', pos: rV(23.0, 1.75, 2.15), cls: 'int-label room-title' });

    rDesk({
      x: 26.1, z: 2.25, w: 1.45, d: 0.62, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม Lab', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-LAB-06', 'โต๊ะคอมพิวเตอร์ Lab (บริหารจัดการ/สถิติแล็บ)', 'นักเทคนิคการแพทย์สรุปรายงานสถิติงานชันสูตรและเบิกน้ำยาแล็บ', '215', 'ระบบคลังน้ำยาและเวชภัณฑ์ห้องแล็บ • ระบบรายงานสถิติ HOSxP LIS')
    });

    const xrayCab = rBox(0.85, 1.55, 3.0, M.mat(0x94a3b8), 21.2, 0.775, 5.0);
    addEdges(xrayCab, 0x334155);
    L.push({ text: '🗄️ ตู้เก็บอุปกรณ์', pos: rV(21.2, 1.8, 5.0), cls: 'int-label sub-tag' });

    // =========================================================================
    // 🔀 ตู้แร็คแขวนผนัง Switch Hub KSP-SW-XRAY (ตำแหน่งมาร์คสีแดง ผนังห้อง X-Ray)
    // =========================================================================
    makeWallSwitchRack(25.80, 2.05, -5.95, 'ksp-sw-xray', -Math.PI / 2);
    L.push({
      text: '🔀 KSP-SW-XRAY (10.10.100.7)',
      pos: V(26.05, 2.70, -5.95),
      cls: 'int-label server-badge clickable',
      serverId: 'ksp-sw-xray'
    });

    rDesk({
      x: 26.3, z: 4.4, w: 1.3, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม X-Ray', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-XRAY-01', 'โต๊ะคอมพิวเตอร์ X-Ray (ระบบ PACS & วินิจฉัยภาพ)', 'นักรังสีการแพทย์ตรวจสอบคุณภาพภาพเอกซเรย์และส่งต่อระบบ PACS', '216', 'ระบบ PACS Workstation • ระบบจัดการภาพทางการแพทย์ DICOM')
    });

    rDesk({
      x: 23.8, z: 6.3, w: 1.65, d: 0.65, rotY: 0,
      hasPC: true, label: 'โต๊ะคอม X-Ray 1', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-XRAY-02', 'โต๊ะคอมพิวเตอร์ X-Ray 1 (ลงทะเบียนและนัดหมายเอกซเรย์)', 'เจ้าหน้าที่รังสีการแพทย์รับใบสั่งเอกซเรย์และลงทะเบียนคิวผู้ป่วย', '217', 'ระบบ HOSxP Radiology Queue • ระบบบันทึกข้อมูลผู้ป่วยเอกซเรย์ (RIS)')
    });

    // ห้องบัตร & ห้องเครื่อง X-Ray
    rWall(31.5, 0.0, 40.0, 0.0, 0.18, WH);
    rWall(41.6, 0.0, 42.5, 0.0, 0.18, WH);
    rDoor(40.8, 0.0, 0, 1.35, true);

    L.push({ text: '🗂️ ห้องบัตร', pos: rV(37.0, 2.25, -3.5), cls: 'int-label room-title' });

    rDesk({
      x: 33.2, z: -6.25, w: 1.35, d: 0.64, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม 2', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-CARD-02', 'โต๊ะคอมพิวเตอร์ 2 (ห้องบัตร - ตรวจสอบสิทธิการรักษา)', 'เจ้าหน้าที่เวชระเบียนตรวจสอบสิทธิ สปสช./ประกันสังคม/ข้าราชการ', '222', 'ระบบ NHSO Smart Card Authen • ระบบ HOSxP Registry')
    });
    rDesk({
      x: 36.8, z: -6.25, w: 1.35, d: 0.64, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม 3', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-CARD-03A', 'โต๊ะคอมพิวเตอร์ 3 (ห้องบัตร - ออกบัตรใหม่/ค้นหาเวชระเบียน)', 'เจ้าหน้าที่เวชระเบียนลงทะเบียนผู้ป่วยใหม่ ออกเลข HN และพิมพ์บัตรนัด', '223', 'ระบบ HOSxP HN Generator • ระบบสแกนเอกสารเวชระเบียนอิเล็กทรอนิกส์')
    });
    rDesk({
      x: 40.4, z: -6.25, w: 1.35, d: 0.64, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม 3', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-CARD-03B', 'โต๊ะคอมพิวเตอร์ 3 (ห้องบัตร - ส่งต่อและสรุปเวชระเบียน)', 'เจ้าหน้าที่เวชระเบียนจัดการข้อมูลส่งต่อผู้ป่วยและตรวจสอบรหัสโรค', '224', 'ระบบ HOSxP Medical Record Audit • ระบบ Thai Refer เวชระเบียน')
    });

    rDesk({
      x: 33.2, z: -1.0, w: 1.45, d: 0.64, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม 4', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-CARD-04', 'โต๊ะคอมพิวเตอร์ 4 (ห้องบัตร - หัวหน้างานเวชระเบียน)', 'หัวหน้างานห้องบัตรควบคุมระบบฐานข้อมูลผู้ป่วยและสถิติผู้รับบริการ', '225', 'ระบบบริหารจัดการเวชระเบียน HOSxP • ระบบรายงาน 43 แฟ้ม กระทรวงสาธารณสุข')
    });

    rDesk({
      x: 37.6, z: -0.95, w: 1.4, d: 0.65, rotY: Math.PI,
      hasPC: false, label: 'โต๊ะ', staffRole: 'nurse'
    });

    rWall(34.5, 0.0, 34.5, 7.0, 0.18, WH);

    rWall(29.8, 0.0, 29.8, 2.1, 0.12, WH);
    rWall(32.0, 0.0, 32.0, 2.1, 0.12, WH);
    rWall(27.6, 2.1, 32.0, 2.1, 0.12, WH);
    rDoor(28.7, 2.1, 0, 0.9, true);
    rDoor(30.9, 2.1, 0, 0.9, true);
    L.push({ text: '🚻 ห้องน้ำ X-Ray', pos: rV(28.7, 1.85, 1.05), cls: 'int-label sub-tag' });
    L.push({ text: '👕 ห้องเปลี่ยนชุด X-Ray', pos: rV(30.9, 2.15, 1.05), cls: 'int-label sub-tag' });

    rDesk({
      x: 33.4, z: 1.5, w: 1.35, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอมเครื่อง X-Ray', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-XRAY-03', 'โต๊ะคอมเครื่อง X-Ray (Console ควบคุมการฉายรังสี)', 'นักรังสีการแพทย์ตั้งค่าปริมาณรังสี (kVp/mAs) และควบคุมเตียงเอกซเรย์', '218', 'ระบบ X-Ray Generator Control Console • ระบบ DR Flat Panel Detector')
    });

    const xrBed = rBox(1.1, 0.58, 1.65, M.mat(0xe2e8f0), 31.2, 0.29, 4.1);
    addEdges(xrBed, 0x475569);
    rBox(0.98, 0.08, 1.52, M.mat(xrayRoom.occupied ? 0xfecdd3 : 0x38bdf8), 31.2, 0.62, 4.1);
    if (xrayRoom.occupied) {
      const xp = makePerson({ role: 'patient', pose: 'lie', rotY: -Math.PI / 2 });
      xp.position.set(WX(31.2, 4.1), 0.04, WZ(31.2));
      g.add(xp);
    }
    L.push({
      text: `🛏️ เตียง เครื่อง X-Ray (${xrayRoom.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง'})`,
      pos: rV(31.2, 1.65, 4.1),
      cls: `int-label ${xrayRoom.occupied ? 'busy' : 'free'} toggleable`,
      toggleId: xrayRoom.id
    });

    const xrMachine = rBox(1.6, 1.15, 0.85, M.mat(0x0284c7), 31.2, 0.575, 6.0);
    addEdges(xrMachine, 0x1e3a8a);
    M.cyl(g, 0.12, 0.12, 1.75, M.mat(0x475569), WX(31.2, 6.0), 0.88, WZ(31.2), 14);
    rBox(0.24, 0.14, 1.45, M.mat(0x64748b), 31.2, 1.68, 5.25);
    L.push({ text: '🩻 เครื่อง X-Ray', pos: rV(31.2, 1.95, 6.0), cls: 'int-label room-title' });

    const opdShelfX = [35.3, 37.6, 38.3, 40.1];
    opdShelfX.forEach((sx, idx) => {
      const sh = rBox(0.46, 1.55, 3.1, M.mat(0x94a3b8), sx, 0.775, 2.15);
      addEdges(sh, 0x334155);
      [-1.05, -0.35, 0.35, 1.05].forEach((oz, i) => {
        rBox(0.38, 0.28, 0.46, M.mat((idx + i) % 2 === 0 ? 0x38bdf8 : 0xfbbf24), sx, 1.15, 2.15 + oz);
      });
    });
    L.push({ text: '🗂️ ชั้นเก็บ OPD card', pos: rV(35.3, 1.8, 2.15), cls: 'int-label sub-tag' });
    L.push({ text: '🗂️ ชั้นเก็บ OPD card (คู่กลาง)', pos: rV(37.95, 1.8, 2.15), cls: 'int-label sub-tag' });
    L.push({ text: '🗂️ ชั้นเก็บ OPD card', pos: rV(40.1, 1.8, 2.15), cls: 'int-label sub-tag' });

    rDesk({
      x: 38.4, z: 6.25, w: 1.5, d: 0.64, rotY: 0,
      hasPC: true, label: 'โต๊ะคอม 1', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-CARD-01', 'โต๊ะคอมพิวเตอร์ 1 (เคาน์เตอร์ลงทะเบียนผู้มารับบริการ)', 'เจ้าหน้าที่เวชระเบียนรับลงทะเบียนผู้มารับบริการ ค้นหา OPD Card และออกคิวตรวจ', '221', 'ระบบ HOSxP Front-Desk Registration • ระบบอ่านบัตรประชาชน Smart Card & คิวอัตโนมัติ')
    });

    const frontRegCounter = rBox(4.8, 0.88, 0.78, M.mat(0xfef08a), 38.4, 0.44, 7.65);
    addEdges(frontRegCounter, 0xca8a04);
    rBox(4.9, 0.05, 0.86, M.mat(0xffffff), 38.4, 0.9, 7.65);
    rBox(4.6, 0.42, 0.04, M.glass(0xdbeafe, 0.35), 38.4, 1.13, 7.98);
    [37.2, 39.6].forEach((px, i) => {
      const visitor = makePerson({ role: i === 0 ? 'patient' : 'relative', pose: 'stand', rotY: Math.PI / 2 });
      visitor.position.set(WX(px, 8.35), 0, WZ(px));
      g.add(visitor);
    });
    L.push({
      text: '🪪 เค้าเตอร์ลงทะเบียนผู้มารับบริการ (หันหน้าไปทาง ER)',
      pos: rV(38.4, 1.85, 7.65),
      cls: 'int-label room-title'
    });

    const items = [];
    erPcuState.extRooms.forEach((r) => {
      items.push([
        r.id === 'ext-xray' ? '🩻' : '🔬',
        r.name,
        r.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง',
        r.id,
        r.occupied ? 'busy' : 'free'
      ]);
    });
    erPcuState.pcuRooms.forEach((r) => {
      items.push([
        '🩺',
        r.name,
        r.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง',
        r.id,
        r.occupied ? 'busy' : 'free'
      ]);
    });
    erPcuState.erBeds.forEach((b) => {
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
    items.push(['🚶', 'ทางเดินเชื่อมหน้าห้อง X-Ray & ห้องบัตร', '1 สาย']);
    items.push(['🪪', 'เค้าเตอร์ลงทะเบียนผู้มารับบริการ (หันไปทาง ER)', 'เปิดบริการ']);
    items.push(['🗂️', 'ห้องบัตร + ชั้นเก็บ OPD card (แบ่งพื้นที่ 50/50)', 'เปิดบริการ']);
    items.push(['🛞', 'เตียงแบบรถเข็น (โซนนอก ER)', '3 เตียง']);
    items.push(['📋', 'จุดซักประวัติ (มีพยาบาลซักประวัติ)', 'เปิดบริการ']);
    items.push(['🪑', 'ที่นั่งคอย (มีญาติคนไข้นั่งคอย)', '5 คน']);
    items.push(['🔀', 'KSP-SW-PCU: สวิตช์ฮับกลุ่มงาน PCU (10.10.100.9)', '🟢 ออนไลน์ (ห้องตรวจ 1 PCU)', 'server-ksp-sw-pcu', 'free']);
    items.push(['🔀', 'KSP-SW-XRAY: สวิตช์ฮับห้อง X-Ray (10.10.100.7)', '🟢 ออนไลน์ (ระบบ PACS/DICOM)', 'server-ksp-sw-xray', 'free']);

    return {
      group: g,
      labels: L,
      size: 58,
      title: '🚑 ผังภายใน: PCU • ER • ทางเดินเชื่อม • ห้อง X-Ray & ห้องบัตร (หันหน้าไปทาง ER) • ห้อง LAB',
      sub: 'คลิกป้าย "ว่าง/ไม่ว่าง" เพื่อสลับสถานะ • คลิกป้าย "🖥️ โต๊ะคอม" ทุกจุดเพื่อดูรายละเอียดสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(13.0, 32, 28), target: V(13.0, 0, 0.5) }
    };
  }

  function toggleErStatus(id) {
    const pcu = erPcuState.pcuRooms.find((r) => r.id === id);
    if (pcu) {
      pcu.occupied = !pcu.occupied;
      return true;
    }
    const bed = erPcuState.erBeds.find((b) => b.id === id);
    if (bed) {
      bed.occupied = !bed.occupied;
      return true;
    }
    const ext = erPcuState.extRooms.find((r) => r.id === id);
    if (ext) {
      ext.occupied = !ext.occupied;
      return true;
    }
    return false;
  }

  K.Interiors.register('er', buildErPcuInterior, toggleErStatus);
})();
