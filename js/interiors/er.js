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
    L.push({ text: '🏥 กลุ่มงานบริการด้านปฐมภูมิและองค์รวม (PCU)', pos: V(-8.5, 0.45, 8.0), cls: 'int-label zone-pcu' });
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

    function makePcSpec(code, name, role, ipSuffix, software, extra = {}) {
      const isFullIp = String(ipSuffix).includes('.');
      const spec = {
        code,
        name,
        role,
        cpu: 'Intel Core i5-13500 (14 Cores)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'SSD 512 GB NVMe M.2',
        monitor: 'Dell 24" IPS Full HD ถนอมสายตา',
        os: 'Windows 11 Pro 64-bit (Hospital Domain)',
        ip: isFullIp ? ipSuffix : `192.168.10.${ipSuffix}`,
        status: '🟢 ออนไลน์',
        software,
        peripherals: 'เครื่องอ่านบัตรประชาชน Smart Card • เครื่องสแกนบาร์โค้ดผู้ป่วย',
        user: extra.user || role,
        hostname: extra.hostname || '',
        mac: extra.mac || '',
        switchId: extra.switchId || 'ksp-sw-pcu',
        switchName: extra.switchName || 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
        switchPort: extra.switchPort || '',
        wallOutlet: extra.wallOutlet || '',
        gateway: extra.gateway || '10.10.40.1 (IPD & PCU Gateway)',
        vlan: extra.vlan || 'VLAN 40 - บริการสุขภาพปฐมภูมิ (PCU)',
        ...extra
      };
      if (!pcList.some(p => p.code === code)) {
        pcList.push(spec);
      }
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
      hasPC: true, label: '🖳 โถง PCU 1 (PCU-02-PC)',
      pcInfo: makePcSpec(
        'PC-PCU-03', 
        'โต๊ะคอมพิวเตอร์โถง PCU (จุดที่ 1)', 
        'พยาบาลวิชาชีพบันทึกข้อมูลสุขภาพชุมชนและวัคซีน', 
        '10.10.40.28', 
        'ระบบ HOSxP PCU • ระบบงานสร้างเสริมสุขภาพและภูมิคุ้มกันโรค',
        {
          hostname: 'PCU-02-PC',
          mac: '54:BF:64:1C:28:02',
          switchId: 'ksp-sw-pcu',
          switchName: 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
          switchPort: 'Port 2 (VLAN 40)',
          wallOutlet: 'PCU-HALL-01 (เต้ารับ LAN โถง PCU จุดที่ 1)',
          user: 'กุลยา (พยาบาลวิชาชีพชำนาญการ)'
        }
      )
    });
    workDesk({
      x: -8.95, z: 1.4, w: 1.1, d: 0.62, rotY: -Math.PI / 2,
      hasPC: true, label: '🖳 โถง PCU 2 (DESKTOP-U2S7HC4)',
      pcInfo: makePcSpec(
        'PC-PCU-04', 
        'โต๊ะคอมพิวเตอร์โถง PCU (จุดที่ 2)', 
        'พยาบาลวิชาชีพติดตามผู้ป่วยโรคเรื้อรัง (NCDs) และงานห้องยา PCU', 
        '10.10.40.35', 
        'ระบบ HOSxP NCDs Clinic • ระบบฐานข้อมูลเบาหวาน-ความดัน',
        {
          hostname: 'DESKTOP-U2S7HC4',
          mac: '54:BF:64:1C:35:C4',
          switchId: 'ksp-sw-pcu',
          switchName: 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
          switchPort: 'Port 3 (VLAN 40)',
          wallOutlet: 'PCU-HALL-02 (เต้ารับ LAN โถง PCU จุดที่ 2)',
          user: 'สุนภรณ์ ชาญสกุล (พยาบาลวิชาชีพ)'
        }
      )
    });
    workDesk({
      x: -8.95, z: 5.4, w: 1.1, d: 0.62, rotY: -Math.PI / 2,
      hasPC: true, label: '🖳 ลงทะเบียน PCU (PCU07-PC)',
      pcInfo: makePcSpec(
        'PC-PCU-05', 
        'โต๊ะคอมพิวเตอร์ลงทะเบียน PCU (จุดที่ 3)', 
        'เจ้าหน้าที่เวชระเบียนและตรวจสอบสิทธิผู้ป่วย PCU', 
        '10.10.40.29', 
        'ระบบ HOSxP Registry • ระบบตรวจสอบสิทธิ สปสช. Smart Card',
        {
          hostname: 'PCU07-PC',
          mac: '54:BF:64:1C:29:07',
          switchId: 'ksp-sw-pcu',
          switchName: 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
          switchPort: 'Port 4 (VLAN 40)',
          wallOutlet: 'PCU-REG-03 (เต้ารับ LAN โต๊ะลงทะเบียน PCU จุดที่ 3)',
          user: 'นางสาวพิชญากร สิงห์/นาง (พยาบาลวิชาชีพ)'
        }
      )
    });

    workDesk({
      x: -5.35, z: -1.2, w: 1.1, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: '🖳 ประสานงาน PCU (PCU6)',
      pcInfo: makePcSpec(
        'PC-PCU-06', 
        'โต๊ะคอมพิวเตอร์ประสานงาน PCU', 
        'พยาบาลประสานงานส่งต่อและเยี่ยมบ้าน', 
        '10.10.40.27', 
        'ระบบ Thai Refer • ระบบเยี่ยมบ้าน (Home Health Care)',
        {
          hostname: 'PCU6',
          mac: '54:BF:64:1C:27:06',
          switchId: 'ksp-sw-pcu',
          switchName: 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
          switchPort: 'Port 5 (VLAN 40)',
          wallOutlet: 'PCU-COORD-01 (เต้ารับ LAN โต๊ะประสานงาน PCU)',
          user: 'นางสุภา พันธุ์พัก (พยาบาลวิชาชีพชำนาญการ)'
        }
      )
    });

    // =========================================================================
    // ทางเข้ากลุ่มงานบริการด้านปฐมภูมิและองค์รวม (PCU Entrance - ตรงตามรูปภาพจริง)
    // ป้ายไม้สีน้ำตาลอ่อนตัวอักษร 3D สีขาว "กลุ่มงานบริการด้านปฐมภูมิและองค์รวม / Primary and Holistic Services Group"
    // ประตูบานเลื่อนเปิดโล่งตรงกลาง + บอร์ด "คลินิกส่งเสริมการมีบุตร" (ซ้าย) & "ตารางคลินิกบริการ" (ขวา) + ลูกฟูกขาว
    // =========================================================================

    // 1. Texture ป้ายไม้สีน้ำตาลอ่อนแนวนอนด้านบน
    const pcuHeaderSignTex = M.canvasTexture(2048, 320, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#d8a972');
      bg.addColorStop(0.5, '#c7945b');
      bg.addColorStop(1, '#b58048');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // เส้นเสี้ยนไม้แนวนอน
      c.fillStyle = 'rgba(101, 59, 25, 0.12)';
      for (let y = 6; y < h; y += 10) c.fillRect(0, y, w, 2);
      c.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let y = 12; y < h; y += 18) c.fillRect(0, y, w, 1);

      // ขอบบน-ล่างเล็กน้อย
      c.strokeStyle = 'rgba(78, 42, 15, 0.45)';
      c.lineWidth = 6;
      c.strokeRect(3, 3, w - 6, h - 6);

      c.textAlign = 'center';
      c.textBaseline = 'middle';

      // บรรทัดบน: กลุ่มงานบริการด้านปฐมภูมิและองค์รวม (3D สีขาวนูนหนา)
      const t1 = 'กลุ่มงานบริการด้านปฐมภูมิและองค์รวม';
      c.font = "bold 92px 'Prompt', 'Kanit', 'Sarabun', 'Tahoma', sans-serif";
      c.fillStyle = 'rgba(78, 42, 15, 0.75)';
      for (let off = 6; off >= 1; off--) c.fillText(t1, w / 2 + off * 0.4, 118 + off);
      c.shadowColor = 'rgba(0,0,0,0.35)';
      c.shadowBlur = 8;
      c.fillStyle = '#ffffff';
      c.fillText(t1, w / 2, 118);

      // บรรทัดล่าง: Primary and Holistic Services Group
      c.shadowBlur = 0;
      const t2 = 'Primary and Holistic Services Group';
      c.font = "bold 50px 'Prompt', 'Kanit', 'Montserrat', 'Segoe UI', sans-serif";
      c.fillStyle = 'rgba(78, 42, 15, 0.75)';
      for (let off = 4; off >= 1; off--) c.fillText(t2, w / 2 + off * 0.3, 224 + off);
      c.shadowColor = 'rgba(0,0,0,0.3)';
      c.shadowBlur = 6;
      c.fillStyle = '#f8fafc';
      c.fillText(t2, w / 2, 224);
    });

    // Helper วาดครึ่งล่างแผงลูกฟูกสีขาว (White Corrugated Panel)
    function drawWhiteCorrugatedBottom(c, w, yStart, hTotal) {
      c.fillStyle = '#e2e8f0';
      c.fillRect(0, yStart, w, hTotal - yStart);
      const ribW = 14;
      for (let rx = 0; rx < w; rx += ribW) {
        c.fillStyle = '#f8fafc';
        c.fillRect(rx, yStart, ribW - 4, hTotal - yStart);
        c.fillStyle = '#cbd5e1';
        c.fillRect(rx + ribW - 4, yStart, 4, hTotal - yStart);
      }
      // กรอบคั่นกลางสีขาวเงิน
      c.fillStyle = '#cbd5e1';
      c.fillRect(0, yStart - 10, w, 12);
    }

    // 2. Texture แผงบอร์ดซ้าย: คลินิกส่งเสริมการมีบุตร + ลูกฟูกขาวครึ่งล่าง
    const pcuLeftBoardTex = M.canvasTexture(768, 768, (c, w, h) => {
      const splitY = 415;
      // กรอบนอกสีขาวเงิน
      c.fillStyle = '#f8fafc';
      c.fillRect(0, 0, w, h);

      // พื้นหลังบอร์ดครึ่งบน: น้ำเงินเข้ม-ฟ้า
      const bg = c.createLinearGradient(0, 0, 0, splitY);
      bg.addColorStop(0, '#0284c7');
      bg.addColorStop(0.4, '#0369a1');
      bg.addColorStop(1, '#0f172a');
      c.fillStyle = bg;
      c.fillRect(16, 16, w - 32, splitY - 26);

      // แถบรูปภาพทีมแพทย์/พยาบาลด้านบนสุด
      c.fillStyle = '#e0f2fe';
      c.fillRect(24, 24, w - 48, 105);
      // จำลองภาพกลุ่มบุคลากร
      for (let i = 0; i < 9; i++) {
        const px = 65 + i * 76;
        c.fillStyle = '#fde68a';
        c.beginPath(); c.arc(px, 60, 14, 0, Math.PI * 2); c.fill();
        c.fillStyle = i % 2 === 0 ? '#ffffff' : '#0284c7';
        c.fillRect(px - 16, 76, 32, 48);
      }

      // แถบชื่อ: คลินิกส่งเสริมการมีบุตร
      c.fillStyle = '#ffffff';
      c.fillRect(24, 136, w - 48, 52);
      c.fillStyle = '#0369a1';
      c.font = "bold 28px 'Prompt', 'Kanit', 'Sarabun', sans-serif";
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('คลินิกส่งเสริมการมีบุตร • กลุ่มงานปฐมภูมิและองค์รวม', w / 2, 162);

      // ข้อความขั้นตอนการรับบริการ
      c.textAlign = 'left';
      c.fillStyle = '#38bdf8';
      c.font = "bold 20px 'Prompt', sans-serif";
      c.fillText('ขั้นตอนการรับบริการ', 42, 215);
      c.fillStyle = '#e2e8f0';
      c.font = "16px 'Prompt', sans-serif";
      c.fillText('1. ติดต่อยื่นบัตร/ลงทะเบียนหน้าจุดคัดกรอง', 42, 245);
      c.fillText('2. ซักประวัติ คัดกรอง และให้คำปรึกษา', 42, 272);
      c.fillText('3. พบแพทย์/พยาบาลวางแผนครอบครัว', 42, 299);
      c.fillText('4. รับบริการตรวจสุขภาพและคำแนะนำต่อเนื่อง', 42, 326);

      // กล่องขวา: เวลาให้บริการ
      c.fillStyle = 'rgba(2, 132, 199, 0.45)';
      c.fillRect(w - 245, 200, 205, 145);
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 2;
      c.strokeRect(w - 245, 200, 205, 145);
      c.fillStyle = '#fef08a';
      c.font = "bold 18px 'Prompt', sans-serif";
      c.fillText('เปิดให้บริการทุกวัน', w - 230, 230);
      c.fillStyle = '#ffffff';
      c.font = "16px 'Prompt', sans-serif";
      c.fillText('จันทร์ - ศุกร์', w - 230, 260);
      c.fillText('08.30 - 16.00 น.', w - 230, 288);

      // ครึ่งล่าง: ลูกฟูกสีขาว
      drawWhiteCorrugatedBottom(c, w, splitY, h - 16);
      c.strokeStyle = '#cbd5e1';
      c.lineWidth = 14;
      c.strokeRect(7, 7, w - 14, h - 14);
    });

    // 3. Texture แผงบอร์ดขวา: ตารางคลินิกบริการ + ลูกฟูกขาวครึ่งล่าง
    const pcuRightBoardTex = M.canvasTexture(768, 768, (c, w, h) => {
      const splitY = 415;
      c.fillStyle = '#f8fafc';
      c.fillRect(0, 0, w, h);

      // พื้นบอร์ดสีขาว-เขียวอ่อน
      c.fillStyle = '#f0fdf4';
      c.fillRect(16, 16, w - 32, splitY - 26);
      c.strokeStyle = '#16a34a';
      c.lineWidth = 4;
      c.strokeRect(20, 20, w - 40, splitY - 34);

      c.fillStyle = '#15803d';
      c.fillRect(20, 20, w - 40, 52);
      c.fillStyle = '#ffffff';
      c.font = "bold 28px 'Prompt', 'Kanit', 'Sarabun', sans-serif";
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('ตารางคลินิกบริการ • รพ.โคกศรีสุพรรณ', w / 2, 46);

      // ตารางจำลอง 5 แถว
      const days = [
        ['จันทร์', 'คลินิกเบาหวาน / ความดันโลหิตสูง', '08.30 - 12.00 น.'],
        ['อังคาร', 'คลินิกฝากครรภ์ (ANC) / ส่งเสริมมีบุตร', '08.30 - 12.00 น.'],
        ['พุธ', 'คลินิกสุขภาพเด็กดี (WBC) / วัคซีน', '08.30 - 12.00 น.'],
        ['พฤหัสบดี', 'คลินิกโรคเรื้อรัง (NCDs) / เยี่ยมบ้าน', '08.30 - 16.00 น.'],
        ['ศุกร์', 'คลินิกคัดกรองมะเร็ง / ให้คำปรึกษา', '08.30 - 16.00 น.']
      ];
      days.forEach(([d, desc, tm], idx) => {
        const ry = 92 + idx * 54;
        c.fillStyle = idx % 2 === 0 ? '#ffffff' : '#dcfce7';
        c.fillRect(34, ry, w - 68, 46);
        c.strokeStyle = '#86efac';
        c.lineWidth = 1.5;
        c.strokeRect(34, ry, w - 68, 46);

        c.textAlign = 'left';
        c.fillStyle = '#166534';
        c.font = "bold 18px 'Prompt', sans-serif";
        c.fillText(d, 48, ry + 23);

        c.fillStyle = '#1e293b';
        c.font = "17px 'Prompt', sans-serif";
        c.fillText(desc, 155, ry + 23);

        c.textAlign = 'right';
        c.fillStyle = '#0369a1';
        c.font = "bold 16px 'Prompt', sans-serif";
        c.fillText(tm, w - 48, ry + 23);
      });

      // ครึ่งล่าง: ลูกฟูกสีขาว
      drawWhiteCorrugatedBottom(c, w, splitY, h - 16);
      c.strokeStyle = '#cbd5e1';
      c.lineWidth = 14;
      c.strokeRect(7, 7, w - 14, h - 14);
    });

    // 4. ประกอบโครงสร้าง 3D ทางเข้า PCU (x = -7.1, z = 7.0)
    const pcuEntX = -7.1;
    const pcuEntZ = 7.0;
    const pcuWhiteMat = M.mat(0xf8fafc, { roughness: 0.25, metalness: 0.1 });
    const pcuHeaderMat = new THREE.MeshStandardMaterial({ map: pcuHeaderSignTex, roughness: 0.45 });
    const pcuHeaderWoodMat = M.mat(0xb58048, { roughness: 0.5 });
    const pcuLeftBoardMat = new THREE.MeshStandardMaterial({ map: pcuLeftBoardTex, roughness: 0.4 });
    const pcuRightBoardMat = new THREE.MeshStandardMaterial({ map: pcuRightBoardTex, roughness: 0.4 });
    const pcuGlassMat = M.glass(0xdbeafe, 0.35);

    // ธรณีประตูและรางเลื่อนพื้น
    M.box(g, 1.88, 0.03, 0.28, M.mat(0x94a3b8), pcuEntX, 0.015, pcuEntZ);

    // เสาขอบประตูสีขาว 2 ข้าง (x = -8.0 และ x = -6.2)
    M.box(g, 0.08, WH, 0.26, pcuWhiteMat, -8.0, WH / 2, pcuEntZ);
    M.box(g, 0.08, WH, 0.26, pcuWhiteMat, -6.2, WH / 2, pcuEntZ);

    // คานรางประตูสีขาวเหนือช่องประตู
    M.box(g, 2.00, 0.10, 0.28, pcuWhiteMat, pcuEntX, WH + 0.02, pcuEntZ);

    // บานประตูกระจกกรอบสีขาว เปิดค้างไว้ด้านซ้ายและขวา (เหลือช่องตรงกลางเดินผ่านได้สะดวก)
    [-7.82, -6.38].forEach((dx) => {
      M.box(g, 0.42, WH - 0.04, 0.04, pcuGlassMat, dx, (WH - 0.04) / 2 + 0.02, pcuEntZ + 0.06);
      M.box(g, 0.44, 0.05, 0.05, pcuWhiteMat, dx, WH - 0.03, pcuEntZ + 0.06);
      M.box(g, 0.44, 0.05, 0.05, pcuWhiteMat, dx, 0.045, pcuEntZ + 0.06);
      M.box(g, 0.05, WH - 0.04, 0.05, pcuWhiteMat, dx - 0.20, (WH - 0.04) / 2 + 0.02, pcuEntZ + 0.06);
      M.box(g, 0.05, WH - 0.04, 0.05, pcuWhiteMat, dx + 0.20, (WH - 0.04) / 2 + 0.02, pcuEntZ + 0.06);
    });

    // แผงบอร์ดข้างประตูฝั่งซ้าย (x = -8.82, ติดหน้าผนัง z = 7.14)
    const pcuLeftBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, WH, 0.04),
      [pcuWhiteMat, pcuWhiteMat, pcuWhiteMat, pcuWhiteMat, pcuLeftBoardMat, pcuWhiteMat]
    );
    pcuLeftBoard.position.set(-8.82, WH / 2, pcuEntZ + 0.14);
    g.add(pcuLeftBoard);

    // แผงบอร์ดข้างประตูฝั่งขวา (x = -5.38, ติดหน้าผนัง z = 7.14)
    const pcuRightBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, WH, 0.04),
      [pcuWhiteMat, pcuWhiteMat, pcuWhiteMat, pcuWhiteMat, pcuRightBoardMat, pcuWhiteMat]
    );
    pcuRightBoard.position.set(-5.38, WH / 2, pcuEntZ + 0.14);
    g.add(pcuRightBoard);

    // กล่องรับความคิดเห็นสีแดงด้านซ้ายสุดของบอร์ด (เหมือนในรูปจริง)
    const suggestionBox = M.box(g, 0.28, 0.22, 0.14, M.mat(0xdc2626), -9.82, 0.95, pcuEntZ + 0.18);
    addEdges(suggestionBox, 0x7f1d1d);

    // ป้ายไม้สีน้ำตาลอ่อนขนาดใหญ่ด้านบนเหนือประตูและบอร์ดทั้ง 2 ข้าง
    const pcuSignMesh = M.box(
      g, 5.10, 0.64, 0.16,
      [pcuHeaderWoodMat, pcuHeaderWoodMat, pcuHeaderWoodMat, pcuHeaderWoodMat, pcuHeaderMat, pcuHeaderMat],
      pcuEntX, WH + 0.36, pcuEntZ + 0.08
    );
    addEdges(pcuSignMesh, 0x78350f);
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
    doorWay(0.4, 7.0, 0, 1.4);

    // =========================================================================
    // ทางเข้าหน้าแผนกอุบัติเหตุ - ฉุกเฉิน (ER Entrance - ตรงตามรูปภาพจริง)
    // ประตูบานเลื่อนกระจกฝ้าอัตโนมัติกรอบขาว (E ♥ ER | GENCY + ECG + ป้ายกดกริ่ง)
    // พร้อมป้ายไม้สีน้ำตาลเข้มตัวอักษร 3D สีแดง "แผนกอุบัติเหตุ - ฉุกเฉิน" ด้านบน
    // =========================================================================

    // 1. Texture ป้ายไม้สีน้ำตาลเข้ม + ตัวอักษร 3D สีแดง "แผนกอุบัติเหตุ - ฉุกเฉิน"
    const erHeaderSignTex = M.canvasTexture(2048, 384, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#3e2315');
      bg.addColorStop(0.5, '#2f190e');
      bg.addColorStop(1, '#231209');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // รอยต่อแผ่นไม้แนวตั้ง & ลายไม้บางๆ
      c.fillStyle = 'rgba(0, 0, 0, 0.38)';
      [w * 0.33, w * 0.67].forEach((px) => c.fillRect(px, 0, 4, h));
      c.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 10; y < h; y += 14) c.fillRect(0, y, w, 2);

      // ตัวอักษร 3D สีแดงสดนูนหนา: แผนกอุบัติเหตุ - ฉุกเฉิน
      const title = 'แผนกอุบัติเหตุ - ฉุกเฉิน';
      c.font = "bold 148px 'Prompt', 'Kanit', 'Sarabun', 'Tahoma', sans-serif";
      c.textAlign = 'center';
      c.textBaseline = 'middle';

      // ความหนามิติ 3D (Extrusion)
      for (let off = 10; off >= 1; off--) {
        c.fillStyle = off > 5 ? '#450a0a' : '#7f1d1d';
        c.fillText(title, w / 2 + off * 0.6, h / 2 + off);
      }

      // ตัวอักษรหน้าสีแดงสดเงางาม
      const txtGrd = c.createLinearGradient(0, h * 0.25, 0, h * 0.75);
      txtGrd.addColorStop(0, '#ef4444');
      txtGrd.addColorStop(0.5, '#dc2626');
      txtGrd.addColorStop(1, '#b91c1c');
      c.shadowColor = 'rgba(0, 0, 0, 0.55)';
      c.shadowBlur = 12;
      c.shadowOffsetY = 5;
      c.fillStyle = txtGrd;
      c.fillText(title, w / 2, h / 2);
    });

    // Helper วาดเส้นกราฟชีพจร ECG สีแดงบนบานประตูกระจกฝ้า
    function drawEcgLine(c, xStart, xEnd, yBase, scale = 1) {
      c.save();
      c.strokeStyle = '#b91c1c';
      c.lineWidth = 4 * scale;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      const span = xEnd - xStart;
      const pts = [
        [0.00, 0], [0.10, 0], [0.14, -10], [0.18, 0],
        [0.24, 0], [0.27, 14], [0.31, -48], [0.35, 26], [0.39, 0],
        [0.46, 0], [0.51, -14], [0.56, 0],
        [0.64, 0], [0.68, -10], [0.72, 0],
        [0.78, 0], [0.81, 14], [0.85, -44], [0.89, 24], [0.93, 0], [1.00, 0]
      ];
      pts.forEach(([px, py], i) => {
        const x = xStart + px * span;
        const y = yBase + py * scale;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      });
      c.stroke();
      c.restore();
    }

    // 2. Texture บานประตูกระจกฝ้าฝั่งซ้าย (E ♥ ER)
    const erDoorLeftTex = M.canvasTexture(512, 768, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, 'rgba(226, 232, 240, 0.88)');
      bg.addColorStop(0.5, 'rgba(212, 220, 228, 0.82)');
      bg.addColorStop(1, 'rgba(203, 213, 225, 0.86)');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // ข้อความแจ้งเตือนด้านบนสีแดง
      c.fillStyle = '#b91c1c';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = "bold 32px 'Prompt', 'Kanit', 'Sarabun', sans-serif";
      c.fillText('ประตูล็อคอัตโนมัติ', w / 2, 115);
      c.fillText('ติดต่อเจ้าหน้าที่', w / 2, 160);
      c.fillText('กรุณากดกริ่ง', w / 2, 205);

      // โลโก้ E [♥] ER สีแดงเข้มขนาดใหญ่
      const cy = 435;
      c.fillStyle = '#b91c1c';
      c.font = "bold 148px 'Prompt', 'Montserrat', 'Arial', sans-serif";
      c.fillText('E', 82, cy);

      // ไอคอนรูปหัวใจ + เส้นชีพจรตรงกลาง
      const hx = 198, hy = cy + 4;
      c.strokeStyle = '#b91c1c';
      c.lineWidth = 10;
      c.beginPath();
      c.moveTo(hx, hy + 38);
      c.bezierCurveTo(hx - 62, hy - 2, hx - 58, hy - 54, hx - 26, hy - 54);
      c.bezierCurveTo(hx - 8, hy - 54, hx, hy - 36, hx, hy - 30);
      c.bezierCurveTo(hx, hy - 36, hx + 8, hy - 54, hx + 26, hy - 54);
      c.bezierCurveTo(hx + 58, hy - 54, hx + 62, hy - 2, hx, hy + 38);
      c.closePath();
      c.stroke();

      // เส้นชีพจรภายในหัวใจ
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(hx - 40, hy - 8);
      c.lineTo(hx - 18, hy - 8);
      c.lineTo(hx - 10, hy - 26);
      c.lineTo(hx, hy + 12);
      c.lineTo(hx + 10, hy - 20);
      c.lineTo(hx + 18, hy - 8);
      c.lineTo(hx + 40, hy - 8);
      c.stroke();

      c.font = "bold 116px 'Prompt', 'Montserrat', 'Arial', sans-serif";
      c.fillText('ER', 370, cy + 8);

      // เส้นชีพจร ECG ด้านล่าง
      drawEcgLine(c, 24, w - 24, 548, 0.95);
    });

    // 3. Texture บานประตูกระจกฝ้าฝั่งขวา (GENCY)
    const erDoorRightTex = M.canvasTexture(512, 768, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, 'rgba(226, 232, 240, 0.88)');
      bg.addColorStop(0.5, 'rgba(212, 220, 228, 0.82)');
      bg.addColorStop(1, 'rgba(203, 213, 225, 0.86)');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // ข้อความแจ้งเตือนด้านบนสีแดง
      c.fillStyle = '#b91c1c';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = "bold 32px 'Prompt', 'Kanit', 'Sarabun', sans-serif";
      c.fillText('ประตูล็อคอัตโนมัติ', w / 2, 115);
      c.fillText('ติดต่อเจ้าหน้าที่', w / 2, 160);
      c.fillText('กรุณากดกริ่ง', w / 2, 205);

      // ข้อความเล็กเหนือ GENCY
      c.font = "bold 26px 'Prompt', 'Kanit', 'Sarabun', sans-serif";
      c.fillText('แผนกอุบัติเหตุ-ฉุกเฉิน', w / 2 + 45, 365);

      // ตัวอักษร GENCY สีแดงขนาดใหญ่
      c.font = "bold 112px 'Prompt', 'Montserrat', 'Arial', sans-serif";
      c.fillText('GENCY', w / 2, 443);

      // เส้นชีพจร ECG ด้านล่าง
      drawEcgLine(c, 24, w - 24, 548, 0.95);
    });

    // 4. ประกอบโครงสร้าง 3D ประตูเลื่อนอัตโนมัติ & ป้ายไม้ 3D ด้านหน้า ER (x = 14.0, z = -0.7)
    const erEntX = 14.0;
    const erEntZ = -0.7;
    const whiteFrameMat = M.mat(0xf8fafc, { roughness: 0.25, metalness: 0.1 });
    const doorLeftMat = new THREE.MeshStandardMaterial({
      map: erDoorLeftTex,
      transparent: true,
      opacity: 0.92,
      roughness: 0.35
    });
    const doorRightMat = new THREE.MeshStandardMaterial({
      map: erDoorRightTex,
      transparent: true,
      opacity: 0.92,
      roughness: 0.35
    });
    const erHeaderMat = new THREE.MeshStandardMaterial({ map: erHeaderSignTex, roughness: 0.45 });
    const erHeaderWoodMat = M.mat(0x2f190e, { roughness: 0.5 });

    // ธรณีประตูและรางเลื่อนพื้นอะลูมิเนียม
    M.box(g, 0.26, 0.03, 2.24, M.mat(0x94a3b8), erEntX, 0.015, erEntZ);

    // เสาขอบประตูสีขาว 2 ข้าง (z = -1.80 และ z = +0.40)
    M.box(g, 0.26, WH, 0.08, whiteFrameMat, erEntX, WH / 2, -1.80);
    M.box(g, 0.26, WH, 0.08, whiteFrameMat, erEntX, WH / 2, 0.40);

    // คานรางประตูเลื่อนอัตโนมัติสีขาวด้านบน (พาดยาวครอบคลุมบานเลื่อนทั้งซ้าย-ขวา)
    M.box(g, 0.28, 0.16, 4.10, whiteFrameMat, erEntX, WH + 0.06, erEntZ);
    // กล่องเซ็นเซอร์ประตูอัตโนมัติสีดำตรงกลาง
    M.box(g, 0.32, 0.06, 0.28, M.mat(0x0f172a), erEntX, WH + 0.06, erEntZ);

    // Helper สร้างบานประตูเลื่อนกระจกฝ้ากรอบขาว
    function buildErSlidingLeaf(leafZ, glassMat) {
      const leafW = 1.12;
      const leafH = WH - 0.04;
      const leafX = erEntX + 0.16; // วางหน้าผนังเล็กน้อยตามรางเลื่อนอัตโนมัติ
      const ft = 0.055; // ความหนากรอบอะลูมิเนียมสีขาว

      // กระจกฝ้าพร้อมสติกเกอร์ (หันหน้าออกทาง +X)
      const glassPane = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, leafH - ft * 2, leafW - ft * 2),
        [glassMat, glassMat, whiteFrameMat, whiteFrameMat, whiteFrameMat, whiteFrameMat]
      );
      glassPane.position.set(leafX, leafH / 2 + 0.02, leafZ);
      g.add(glassPane);

      // กรอบอะลูมิเนียมสีขาว 4 ด้าน
      M.box(g, 0.045, ft, leafW, whiteFrameMat, leafX, leafH + 0.02 - ft / 2, leafZ); // บน
      M.box(g, 0.045, ft, leafW, whiteFrameMat, leafX, 0.02 + ft / 2, leafZ);         // ล่าง
      M.box(g, 0.045, leafH, ft, whiteFrameMat, leafX, leafH / 2 + 0.02, leafZ + leafW / 2 - ft / 2); // ขอบซ้าย
      M.box(g, 0.045, leafH, ft, whiteFrameMat, leafX, leafH / 2 + 0.02, leafZ - leafW / 2 + ft / 2); // ขอบขวา
    }

    // บานประตูซ้าย (ฝั่ง +Z เปิดแยกออกทางซ้าย เหลือช่องกลางกว้างเดินเข้า-ออกสะดวก)
    buildErSlidingLeaf(0.56, doorLeftMat);
    // บานประตูขวา (ฝั่ง -Z เปิดแยกออกทางขวา)
    buildErSlidingLeaf(-1.96, doorRightMat);

    // ป้ายไม้สีน้ำตาลเข้มตัวอักษร 3D สีแดง "แผนกอุบัติเหตุ - ฉุกเฉิน" เหนือคานรางเลื่อนประตู
    const erSignMesh = M.box(
      g, 0.16, 0.64, 3.85,
      [erHeaderMat, erHeaderMat, erHeaderWoodMat, erHeaderWoodMat, erHeaderWoodMat, erHeaderWoodMat],
      erEntX, WH + 0.46, erEntZ
    );
    addEdges(erSignMesh, 0x1e110b);

    // ป้าย Tag 3D ด้านบน
    L.push({
      text: '🚑 แผนกอุบัติเหตุ - ฉุกเฉิน (ER)',
      pos: V(erEntX, WH + 0.98, erEntZ),
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
    // =========================================================================
    // หน้าห้องรังสี / X-Ray Room (ตรงตามภาพถ่ายสถานที่จริง)
    // ผนังไม้สีน้ำตาลเข้มด้านบน + ตัวอักษร 3D "ห้องรังสี X-Ray Room" + กล่องไฟเตือนรังสี
    // ฝั่งซ้าย: หน้าต่างบานเลื่อนกรอบขาว 2 ช่องคู่บนผนังไม้เข้ม + ช่องประตูเข้าโต๊ะคอม X-Ray 1
    // ฝั่งขวา: วงกบไม้สีอ่อนขนาดใหญ่ + ประตูบานเลื่อนกันรังสีตะกั่วพร้อมป้ายสัญลักษณ์รังสี
    // =========================================================================

    // 1. Texture ป้ายไม้สีน้ำตาลเข้มด้านบน: "ห้องรังสี   X-Ray Room"
    const xrayHeaderSignTex = M.canvasTexture(2048, 320, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#3e271d');
      bg.addColorStop(0.5, '#311e15');
      bg.addColorStop(1, '#24150e');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // รอยต่อแผ่นไม้แนวตั้ง & ลายไม้บางๆ
      c.fillStyle = 'rgba(0, 0, 0, 0.35)';
      [w * 0.25, w * 0.55, w * 0.80].forEach((px) => c.fillRect(px, 0, 4, h));
      c.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 10; y < h; y += 14) c.fillRect(0, y, w, 2);

      // ตัวอักษร 3D สีขาว: ห้องรังสี   X-Ray Room
      const title = 'ห้องรังสี      X-Ray Room';
      c.font = "bold 96px 'Prompt', 'Kanit', 'Sarabun', 'Segoe UI', sans-serif";
      c.textAlign = 'center';
      c.textBaseline = 'middle';

      c.fillStyle = 'rgba(20, 10, 5, 0.85)';
      for (let off = 6; off >= 1; off--) c.fillText(title, w / 2 + off * 0.4, h / 2 + off);
      c.shadowColor = 'rgba(0, 0, 0, 0.45)';
      c.shadowBlur = 10;
      c.fillStyle = '#ffffff';
      c.fillText(title, w / 2, h / 2);
    });

    // 2. Texture หน้าต่างบานเลื่อนติดต่อห้องรังสี + ผนังไม้สีน้ำตาลเข้มครึ่งล่าง
    const xrayWindowWallTex = M.canvasTexture(1024, 768, (c, w, h) => {
      const splitY = 384;
      // ครึ่งล่าง: ผนังไม้สีน้ำตาลเข้ม
      const woodBg = c.createLinearGradient(0, splitY, 0, h);
      woodBg.addColorStop(0, '#3e271d');
      woodBg.addColorStop(1, '#2c1a12');
      c.fillStyle = woodBg;
      c.fillRect(0, splitY, w, h - splitY);
      c.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = splitY + 8; y < h; y += 12) c.fillRect(0, y, w, 2);

      // ครึ่งบน: กรอบหน้าต่างอะลูมิเนียมสีขาว 2 ช่องคู่
      c.fillStyle = '#f8fafc';
      c.fillRect(0, 0, w, splitY);

      // กระจกภายใน 2 ช่องบน + 2 ช่องล่าง (บานเลื่อน)
      const cols = [24, 520];
      const colW = 480;
      cols.forEach((cx, idx) => {
        // ช่องกระจกบน
        c.fillStyle = '#1e293b';
        c.fillRect(cx, 20, colW, 170);
        c.fillStyle = 'rgba(148, 163, 184, 0.25)';
        c.fillRect(cx + 10, 26, colW / 2 - 14, 158);
        c.fillStyle = 'rgba(255, 255, 255, 0.14)';
        c.fillRect(cx + colW / 2 + 4, 26, colW / 2 - 14, 158);
        // กรอบอลูมิเนียมแบ่งครึ่งบน
        c.fillStyle = '#ffffff';
        c.fillRect(cx + colW / 2 - 5, 20, 10, 170);

        // ช่องกระจกล่าง (ช่องส่งเอกสาร)
        c.fillStyle = '#0f172a';
        c.fillRect(cx, 206, colW, 156);
        c.fillStyle = 'rgba(255, 255, 255, 0.16)';
        c.fillRect(cx + 8, 212, colW / 2 - 12, 144);
        c.fillStyle = '#ffffff';
        c.fillRect(cx + colW / 2 - 5, 206, 10, 156);

        // ป้ายลูกศรยื่นเอกสารตรงช่องขวาสุด
        if (idx === 1) {
          c.fillStyle = '#ffffff';
          c.fillRect(cx + colW - 140, 210, 130, 82);
          c.fillStyle = '#1e293b';
          c.font = "bold 18px 'Prompt', sans-serif";
          c.textAlign = 'center';
          c.fillText('ยื่นเอกสารที่นี่', cx + colW - 75, 234);
          c.font = "bold 34px sans-serif";
          c.fillText('⬇', cx + colW - 75, 272);
        }
      });

      // เส้นขอบคั่นระหว่างกรอบบน-ล่าง
      c.fillStyle = '#e2e8f0';
      c.fillRect(0, 190, w, 16);
      c.fillRect(0, splitY - 12, w, 12);
    });

    // Helper วาดสัญลักษณ์ใบพัดเตือนรังสี (Radiation Trefoil)
    function drawRadiationTrefoil(c, cx, cy, rOuter) {
      c.save();
      c.fillStyle = '#312e81'; // สีม่วงเข้ม-ดำ ตามป้ายจริง
      c.beginPath();
      c.arc(cx, cy, rOuter * 0.22, 0, Math.PI * 2);
      c.fill();
      for (let i = 0; i < 3; i++) {
        const a0 = -Math.PI / 2 + i * ((Math.PI * 2) / 3) - Math.PI / 6;
        const a1 = a0 + Math.PI / 3;
        c.beginPath();
        c.arc(cx, cy, rOuter, a0, a1, false);
        c.arc(cx, cy, rOuter * 0.34, a1, a0, true);
        c.closePath();
        c.fill();
      }
      c.restore();
    }

    // 3. Texture ประตูบานเลื่อนกันรังสีตะกั่วไม้สีอ่อน (Light Oak Lead Door)
    const xrayLeadDoorTex = M.canvasTexture(768, 768, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, w, 0);
      bg.addColorStop(0, '#dfc096');
      bg.addColorStop(0.5, '#d5b284');
      bg.addColorStop(1, '#c9a474');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // ลายเสี้ยนไม้แนวตั้ง
      c.fillStyle = 'rgba(120, 75, 35, 0.08)';
      for (let x = 8; x < w; x += 14) c.fillRect(x, 0, 2, h);

      // มือจับสเตนเลสแนวตั้งฝั่งซ้ายของบานประตู
      c.fillStyle = '#94a3b8';
      c.fillRect(46, 230, 18, 250);
      c.fillStyle = '#f8fafc';
      c.fillRect(50, 232, 8, 246);

      // ป้ายเตือนรังสีสี่เหลี่ยมสีเหลืองขนาดใหญ่ตรงกลาง
      const rx = w * 0.34, ry = 135, rs = 210;
      c.fillStyle = '#facc15';
      c.fillRect(rx, ry, rs, rs);
      c.strokeStyle = '#ca8a04';
      c.lineWidth = 4;
      c.strokeRect(rx, ry, rs, rs);
      drawRadiationTrefoil(c, rx + rs / 2, ry + rs / 2, rs * 0.38);

      // ป้ายเตือนรังสีเล็กด้านขวา
      c.fillStyle = '#fef08a';
      c.fillRect(w * 0.72, 165, 110, 145);
      drawRadiationTrefoil(c, w * 0.72 + 55, 220, 32);
      c.fillStyle = '#1e293b';
      c.font = "bold 14px 'Prompt', sans-serif";
      c.textAlign = 'center';
      c.fillText('อันตราย รังสี', w * 0.72 + 55, 285);

      // ป้ายเตือนสตรีมีครรภ์ด้านล่าง (พื้นขาวขอบแดง)
      const px = w * 0.39, py = 395, pw = 135, ph = 125;
      c.fillStyle = '#ffffff';
      c.fillRect(px, py, pw, ph);
      c.strokeStyle = '#dc2626';
      c.lineWidth = 4;
      c.strokeRect(px, py, pw, ph);
      c.strokeStyle = '#dc2626';
      c.lineWidth = 5;
      c.beginPath();
      c.arc(px + pw / 2, py + 44, 24, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(px + pw / 2 - 16, py + 28);
      c.lineTo(px + pw / 2 + 16, py + 60);
      c.stroke();
      c.fillStyle = '#dc2626';
      c.font = "bold 15px 'Prompt', sans-serif";
      c.fillText('สตรีมีครรภ์', px + pw / 2, py + 88);
      c.fillStyle = '#1e293b';
      c.font = "13px 'Prompt', sans-serif";
      c.fillText('กรุณาแจ้งเจ้าหน้าที่', px + pw / 2, py + 108);
    });

    // 4. Texture กล่องไฟเตือนรังสีแขวนด้านบน: "โปรดระวัง กำลังเอกซเรย์ / ห้ามเข้าก่อนได้รับอนุญาต"
    const xrayLightBoxTex = M.canvasTexture(512, 160, (c, w, h) => {
      c.fillStyle = '#f8fafc';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#0f172a';
      c.fillRect(14, 14, w - 28, h - 28);

      // ช่องเหลืองซ้ายพร้อมไอคอนรังสี
      c.fillStyle = '#facc15';
      c.fillRect(26, 26, 96, h - 52);
      drawRadiationTrefoil(c, 74, h / 2, 36);

      // ข้อความสีเหลือง
      c.fillStyle = '#facc15';
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.font = "bold 28px 'Prompt', 'Kanit', sans-serif";
      c.fillText('โปรดระวัง กำลังเอกซเรย์', 140, h / 2 - 20);
      c.fillStyle = '#fde047';
      c.font = "bold 25px 'Prompt', 'Kanit', sans-serif";
      c.fillText('ห้ามเข้าก่อนได้รับอนุญาต', 140, h / 2 + 22);
    });

    // 5. ประกอบโครงสร้าง 3D หน้าห้องรังสี (X = 25.50, หันหน้าออกทาง -X)
    const xrWallX = 25.50;
    const darkWalnutMat = M.mat(0x311e15, { roughness: 0.45 });
    const lightOakMat = M.mat(0xd5b284, { roughness: 0.4 });
    const xrHeaderMat = new THREE.MeshStandardMaterial({ map: xrayHeaderSignTex, roughness: 0.4 });
    const xrWinWallMat = new THREE.MeshStandardMaterial({ map: xrayWindowWallTex, roughness: 0.35 });
    const xrLeadDoorMat = new THREE.MeshStandardMaterial({ map: xrayLeadDoorTex, roughness: 0.4 });
    const xrLightBoxMat = new THREE.MeshStandardMaterial({
      map: xrayLightBoxTex,
      emissive: 0x332200,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });

    // A) ผนังหน้าต่างติดต่อห้องรังสี (ฝั่งซ้าย Z = -6.45 .. -3.75, กว้าง 2.70m)
    const winWallMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, WH, 2.70),
      [darkWalnutMat, xrWinWallMat, darkWalnutMat, darkWalnutMat, darkWalnutMat, darkWalnutMat]
    );
    winWallMesh.position.set(xrWallX - 0.13, WH / 2, -5.10);
    g.add(winWallMesh);

    // B) ช่องประตูทางเข้าห้องทำงาน X-Ray 1 (Z = -3.75 .. -2.74, เปิดโล่งเห็นโต๊ะคอม X-Ray 1)
    M.box(g, 0.24, 0.03, 1.02, M.mat(0xfacc15), xrWallX, 0.015, -3.245); // เส้นเหลืองธรณีประตู
    M.box(g, 0.26, WH, 0.06, lightOakMat, xrWallX, WH / 2, -3.72);         // วงกบซ้าย
    M.box(g, 0.26, WH, 0.06, lightOakMat, xrWallX, WH / 2, -2.76);         // วงกบขวา

    // C) ซุ้มกรอบวงกบไม้สีอ่อนขนาดใหญ่ + ประตูบานเลื่อนกันรังสี (ฝั่งขวา Z = -0.95 .. +1.78)
    // เสาซุ้มไม้สีอ่อนฝั่งซ้ายของช่องเปิด (Z = -0.92) และฝั่งขวา (Z = +1.76)
    M.box(g, 0.28, WH, 0.14, lightOakMat, xrWallX - 0.04, WH / 2, -0.92);
    M.box(g, 0.28, WH, 0.12, lightOakMat, xrWallX - 0.04, WH / 2, 1.76);
    // คานบนซุ้มไม้สีอ่อนพาดตลอดแนวซุ้มประตูบานเลื่อน
    M.box(g, 0.28, 0.18, 2.82, lightOakMat, xrWallX - 0.04, WH - 0.05, 0.42);
    // แผงบังรางด้านในฝั่งผนังกลาง (Z = -2.74 .. -0.95) เป็นผนังไม้เข้มกลมกลืน
    M.box(g, 0.04, WH, 1.78, darkWalnutMat, xrWallX - 0.13, WH / 2, -1.84);

    // บานประตูเลื่อนกันรังสีตะกั่วไม้สีอ่อนขนาดใหญ่ (เปิดค้างไปทางขวา Z = +0.20 .. +1.70, เปิดช่อง Z = -0.83 .. +0.19 เดินเข้าได้)
    const leadDoorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, WH - 0.14, 1.50),
      [lightOakMat, xrLeadDoorMat, lightOakMat, lightOakMat, lightOakMat, lightOakMat]
    );
    leadDoorMesh.position.set(xrWallX - 0.15, (WH - 0.14) / 2 + 0.02, 0.95);
    g.add(leadDoorMesh);

    // D) แผงไม้สีน้ำตาลเข้มด้านบนตลอดแนว + ตัวอักษร 3D "ห้องรังสี  X-Ray Room"
    const xrSignMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.62, 8.35),
      [darkWalnutMat, xrHeaderMat, darkWalnutMat, darkWalnutMat, darkWalnutMat, darkWalnutMat]
    );
    xrSignMesh.position.set(xrWallX - 0.06, WH + 0.31, -2.30);
    g.add(xrSignMesh);
    addEdges(xrSignMesh, 0x1e110b);

    // E) กล่องไฟเตือนรังสีแขวนด้านบนเหนือประตู X-Ray
    const xrLightBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.24, 0.78),
      [M.mat(0x1e293b), xrLightBoxMat, M.mat(0xf8fafc), M.mat(0xf8fafc), M.mat(0xf8fafc), M.mat(0xf8fafc)]
    );
    xrLightBox.position.set(xrWallX - 0.26, WH + 0.16, 0.45);
    g.add(xrLightBox);
    // ขาเหล็กแขวนกล่องไฟ
    M.box(g, 0.04, 0.20, 0.04, M.mat(0xf8fafc), xrWallX - 0.26, WH + 0.36, 0.45);

    // ป้าย Label 3D
    L.push({ text: '🩻 ห้องรังสี • X-Ray Room', pos: V(xrWallX - 0.2, WH + 0.85, -2.30), cls: 'int-label room-title' });
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

            const cardPc1Spec = makePcSpec(
      'PC-CARD-01',
      'โต๊ะคอมพิวเตอร์ 1 (ห้องบัตร/เวชระเบียน)',
      'เจ้าหน้าที่เวชระเบียนค้นหา OPD Card คัดกรองและจัดเก็บเวชระเบียน (จุดที่ 1)',
      '10.10.20.21',
      'ระบบ HOSxP Front-Desk Registration • ระบบอ่านบัตรประชาชน Smart Card & คลังเวชระเบียน',
      {
        hostname: 'CARD-DESK-01',
        mac: '00:1E:67:D8:1A:01',
        switchId: 'ksp-sw-xray',
        switchName: 'Aruba / HPE 2530 24G (KSP-SW-XRAY - ตึก X-Ray/ห้องบัตร)',
        switchPort: 'Port 7 (10/100/1000Base-T / VLAN 20 Untagged)',
        wallOutlet: 'Outlet ID: CARD-CTR-01 (ห้องบัตร จุดที่ 1)',
        gateway: '10.10.20.1 (Core Gateway)',
        vlan: 'VLAN 20 - งานเวชระเบียนและสารสนเทศยุทธศาสตร์',
        printer: 'Zebra ZD230 Barcode Sticker Printer + Epson Dot Matrix LQ-310'
      }
    );

    rDesk({
      x: 39.2, z: 5.8, w: 1.4, d: 0.64, rotY: 0,
      hasPC: true, label: 'โต๊ะคอม 1 (ห้องบัตร/เวชระเบียน)', staffRole: 'nurse',
      pcInfo: cardPc1Spec
    });

    const cardPc2Spec = makePcSpec(
      'PC-CARD-03',
      'โต๊ะคอมพิวเตอร์ 2 (เคาน์เตอร์ด้านหน้าห้องบัตร)',
      'เจ้าหน้าที่เวชระเบียนรับลงทะเบียนผู้มารับบริการ เคาน์เตอร์ด้านหน้า ช่อง 2 (ALL-IN-ONE-ADMI)',
      '10.10.20.42',
      'ระบบ HOSxP Front-Desk Registration • ระบบอ่านบัตรประชาชน Smart Card & คิวอัตโนมัติ Q-Online',
      {
        hostname: 'ALL-IN-ONE-ADMI',
        mac: '70:85:C2:44:A2:42',
        switchId: 'ksp-sw-xray',
        switchName: 'Aruba / HPE 2530 24G (KSP-SW-XRAY - ตึก X-Ray/ห้องบัตร)',
        switchIp: '10.10.100.7',
        switchPort: 'Port 8 (10/100/1000Base-T / VLAN 20 Untagged)',
        wallOutlet: 'Outlet ID: CARD-CTR-02 (เคาน์เตอร์ด้านหน้าห้องบัตร ช่อง 2)',
        gateway: '10.10.20.1 (Core Gateway)',
        vlan: 'VLAN 20 - งานเวชระเบียนและสารสนเทศยุทธศาสตร์',
        cpu: 'Intel Core i5-10400 (6 Cores / 12 Threads, 2.90GHz - 4.30GHz)',
        ram: '16 GB DDR4-2666 MHz',
        storage: '512 GB NVMe M.2 SSD + 1 TB SATA III HDD',
        monitor: '23.8\" FHD IPS Borderless Anti-Glare Monitor',
        printer: 'Zebra ZD230 Barcode Sticker Printer + Canon LBP2900 Laser Printer'
      }
    );

    // =========================================================================
    // เคาน์เตอร์จุดคัดกรอง (Screening Point Counter - ตรงตามรูปภาพจริง 100%)
    // โครงสร้างระแนงไม้แนวตั้งสีธรรมชาติ ขอบโค้งมน + ป้ายอักษร 3D "จุดคัดกรอง / SCREENING POINT"
    // ท็อปเคาน์เตอร์สีขาวหนาโค้งมน + แผงกั้นอะคริลิกใสพร้อมโปสเตอร์ พ.ร.บ.รถ และคำแนะนำ
    // ฉากหลังไม้สีเข้มพร้อมโลโก้โรงพยาบาลโคกศรีสุพรรณ ตัวอักษรเรืองแสง และลายกิ่งไม้
    // =========================================================================

    // 1. Texture ลายระแนงไม้แนวตั้งสีธรรมชาติ + ตัวอักษร 3D "จุดคัดกรอง / SCREENING POINT"
    const screeningWoodSlatTex = M.canvasTexture(2048, 512, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#dfae79');
      bg.addColorStop(0.5, '#ce9864');
      bg.addColorStop(1, '#be8752');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // ระแนงไม้แนวตั้งสีธรรมชาติ (Fluted Slats)
      const slatW = 28;
      const numSlats = Math.ceil(w / slatW);
      for (let i = 0; i < numSlats; i++) {
        const sx = i * slatW;
        const slatGrd = c.createLinearGradient(sx, 0, sx + slatW, 0);
        slatGrd.addColorStop(0, '#edd1aa');
        slatGrd.addColorStop(0.25, '#dcb080');
        slatGrd.addColorStop(0.85, '#c5925e');
        slatGrd.addColorStop(1.0, '#7c4c23');
        c.fillStyle = slatGrd;
        c.fillRect(sx, 0, slatW - 4, h);

        c.fillStyle = '#653b19';
        c.fillRect(sx + slatW - 4, 0, 4, h);
      }

      // เส้นใยไม้บางๆ
      c.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let y = 8; y < h; y += 16) {
        c.fillRect(0, y, w, 2);
      }

      // ตัวอักษร 3D กลางเคาน์เตอร์: จุดคัดกรอง / SCREENING POINT
      c.textAlign = 'center';
      c.textBaseline = 'middle';

      // บรรทัดที่ 1: จุดคัดกรอง
      const text1 = 'จุดคัดกรอง';
      c.font = "bold 96px 'Prompt', 'Kanit', 'Sarabun', 'Tahoma', sans-serif";
      c.fillStyle = 'rgba(78, 42, 15, 0.9)';
      for (let off = 7; off >= 1; off--) {
        c.fillText(text1, w / 2, 205 + off);
      }
      c.shadowColor = 'rgba(0, 0, 0, 0.45)';
      c.shadowBlur = 10;
      c.shadowOffsetY = 4;
      c.fillStyle = '#ffffff';
      c.fillText(text1, w / 2, 205);

      c.shadowColor = 'transparent';
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;

      // บรรทัดที่ 2: SCREENING POINT
      const text2 = 'S C R E E N I N G   P O I N T';
      c.font = "bold 44px 'Prompt', 'Kanit', 'Montserrat', 'Segoe UI', sans-serif";
      c.fillStyle = 'rgba(78, 42, 15, 0.85)';
      for (let off = 5; off >= 1; off--) {
        c.fillText(text2, w / 2, 320 + off);
      }
      c.shadowColor = 'rgba(0, 0, 0, 0.4)';
      c.shadowBlur = 8;
      c.shadowOffsetY = 3;
      c.fillStyle = '#f8fafc';
      c.fillText(text2, w / 2, 320);
    });

    // 2. Texture แผงกั้นอะคริลิกใส พร้อมโปสเตอร์และคำแนะนำ
    const sneezeGuardTex = M.canvasTexture(1024, 512, (c, w, h) => {
      c.clearRect(0, 0, w, h);

      // เส้นขอบสะท้อนแสงกระจก
      c.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      c.lineWidth = 4;
      c.strokeRect(6, 6, w - 12, h - 12);

      // ช่องส่งเอกสารตรงกลาง
      c.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(w / 2, h - 10, 80, Math.PI, 0, false);
      c.stroke();

      // โปสเตอร์ 1: บนซ้าย - คำแนะนำผู้รับบริการ & QR Code
      const p1x = 55, p1y = 35, p1w = 165, p1h = 205;
      c.fillStyle = '#ffffff';
      c.fillRect(p1x, p1y, p1w, p1h);
      c.strokeStyle = '#0284c7';
      c.lineWidth = 2;
      c.strokeRect(p1x, p1y, p1w, p1h);

      c.fillStyle = '#0284c7';
      c.fillRect(p1x, p1y, p1w, 36);
      c.fillStyle = '#ffffff';
      c.font = 'bold 13px Prompt, sans-serif';
      c.textAlign = 'center';
      c.fillText('รพ.โคกศรีสุพรรณ', p1x + p1w / 2, p1y + 22);

      // ไอคอนแพทย์
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.arc(p1x + 35, p1y + 68, 16, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ffffff';
      c.font = 'bold 16px sans-serif';
      c.fillText('👨‍⚕️', p1x + 35, p1y + 74);

      c.fillStyle = '#334155';
      c.font = 'bold 10px Prompt, sans-serif';
      c.textAlign = 'left';
      c.fillText('คำแนะนำผู้รับบริการ', p1x + 60, p1y + 64);
      c.font = '9px Prompt, sans-serif';
      c.fillText('กรุณาเตรียมบัตร ปชช.', p1x + 60, p1y + 78);
      c.fillText('เพื่อความสะดวกรวดเร็ว', p1x + 14, p1y + 105);
      c.fillText('ในการตรวจสอบสิทธิ', p1x + 14, p1y + 120);

      // QR Code จำลอง
      c.fillStyle = '#0f172a';
      c.fillRect(p1x + p1w - 52, p1y + p1h - 52, 42, 42);
      c.fillStyle = '#ffffff';
      c.fillRect(p1x + p1w - 48, p1y + p1h - 48, 12, 12);
      c.fillRect(p1x + p1w - 26, p1y + p1h - 48, 12, 12);
      c.fillRect(p1x + p1w - 48, p1y + p1h - 26, 12, 12);
      c.fillStyle = '#0f172a';
      c.fillRect(p1x + p1w - 44, p1y + p1h - 44, 4, 4);
      c.fillRect(p1x + p1w - 22, p1y + p1h - 44, 4, 4);
      c.fillRect(p1x + p1w - 44, p1y + p1h - 22, 4, 4);

      // โปสเตอร์ 2: ล่างซ้าย - ตรวจสอบความคุ้มครอง พ.ร.บ.รถ
      const p2x = 55, p2y = 255, p2w = 165, p2h = 215;
      c.fillStyle = '#ffffff';
      c.fillRect(p2x, p2y, p2w, p2h);
      c.strokeStyle = '#0284c7';
      c.lineWidth = 2;
      c.strokeRect(p2x, p2y, p2w, p2h);

      c.fillStyle = '#0284c7';
      c.fillRect(p2x, p2y, p2w, 42);
      c.fillStyle = '#ffffff';
      c.font = 'bold 12px Prompt, sans-serif';
      c.textAlign = 'center';
      c.fillText('ตรวจสอบความคุ้มครอง', p2x + p2w / 2, p2y + 17);
      c.font = 'bold 16px Prompt, sans-serif';
      c.fillText('พ.ร.บ. รถ', p2x + p2w / 2, p2y + 34);

      // Big QR Code
      const qrx = p2x + 38, qry = p2y + 54, qrs = 88;
      c.fillStyle = '#0f172a';
      c.fillRect(qrx, qry, qrs, qrs);
      c.fillStyle = '#ffffff';
      c.fillRect(qrx + 6, qry + 6, 26, 26);
      c.fillRect(qrx + qrs - 32, qry + 6, 26, 26);
      c.fillRect(qrx + 6, qry + qrs - 32, 26, 26);
      c.fillStyle = '#0f172a';
      c.fillRect(qrx + 12, qry + 12, 14, 14);
      c.fillRect(qrx + qrs - 26, qry + 12, 14, 14);
      c.fillRect(qrx + 12, qry + qrs - 26, 14, 14);
      c.fillStyle = '#ffffff';
      c.fillRect(qrx + 38, qry + 14, 10, 10);
      c.fillRect(qrx + 14, qry + 38, 10, 10);
      c.fillRect(qrx + 42, qry + 42, 16, 16);
      c.fillRect(qrx + qrs - 28, qry + 40, 12, 12);
      c.fillRect(qrx + 40, qry + qrs - 26, 14, 14);

      c.fillStyle = '#0369a1';
      c.font = 'bold 11px Prompt, sans-serif';
      c.fillText('สแกน QR Code ตรวจสอบสิทธิ', p2x + p2w / 2, p2y + 165);
      c.fillStyle = '#64748b';
      c.font = '9px Prompt, sans-serif';
      c.fillText('กองทุนทดแทนผู้ประสบภัย', p2x + p2w / 2, p2y + 185);

      // แถบแจ้งเตือนคิวตรงกลาง
      c.fillStyle = '#dc2626';
      c.font = 'bold 16px Prompt, sans-serif';
      c.textAlign = 'center';
      c.fillText('ผู้รับบริการ กรุณารอเรียกคิว ณ จุดนี้', w / 2, h - 35);
    });

    // 3. Texture ฉากหลังไม้สีเข้ม Walnut พร้อมโลโก้โรงพยาบาล ตัวอักษรเรืองแสง และลายกิ่งไม้
    const screeningBackdropTex = M.canvasTexture(2048, 1024, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#2b1a11');
      bg.addColorStop(0.35, '#1e110b');
      bg.addColorStop(0.7, '#24150d');
      bg.addColorStop(1, '#190d07');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // แผ่นรอยต่อผนังไม้ (Vertical Wood Panels)
      const panelW = 340;
      for (let px = panelW; px < w; px += panelW) {
        c.fillStyle = 'rgba(0, 0, 0, 0.45)';
        c.fillRect(px - 2, 0, 4, h);
        c.fillStyle = 'rgba(255, 255, 255, 0.04)';
        c.fillRect(px + 2, 0, 1, h);
      }

      // ลายเสี้ยนไม้
      c.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 12; y < h; y += 16) {
        c.fillRect(0, y, w, 2);
      }

      // โลโก้โรงพยาบาลโคกศรีสุพรรณ
      const lx = 310, ly = 190;
      c.fillStyle = '#e2e8f0';
      c.beginPath();
      c.moveTo(lx - 50, ly + 65);
      c.bezierCurveTo(lx - 55, ly - 40, lx + 20, ly - 50, lx + 30, ly - 35);
      c.bezierCurveTo(lx - 10, ly + 10, lx - 20, ly + 40, lx - 50, ly + 65);
      c.fill();

      c.fillStyle = '#0f766e';
      c.beginPath();
      c.moveTo(lx - 10, ly + 65);
      c.bezierCurveTo(lx + 55, ly + 50, lx + 70, ly - 20, lx + 25, ly - 45);
      c.bezierCurveTo(lx + 10, ly + 10, lx + 5, ly + 40, lx - 10, ly + 65);
      c.fill();

      c.fillStyle = '#ffffff';
      c.fillRect(lx + 24, ly - 22, 14, 38);
      c.fillRect(lx + 12, ly - 10, 38, 14);

      c.fillStyle = '#cbd5e1';
      c.fillRect(lx - 44, ly + 10, 14, 52);
      c.fillRect(lx - 28, ly - 8, 16, 70);
      c.fillRect(lx - 10, ly + 22, 14, 40);

      // ตัวอักษรเรืองแสง 3D: โรงพยาบาลโคกศรีสุพรรณ / KHOKSRISUPHAN HOSPITAL
      c.textAlign = 'left';
      c.textBaseline = 'middle';

      const line1 = 'โรงพยาบาลโคกศรีสุพรรณ';
      c.font = "bold 96px 'Prompt', 'Kanit', 'Sarabun', 'Tahoma', sans-serif";

      c.shadowColor = 'rgba(255, 255, 255, 0.9)';
      c.shadowBlur = 24;
      c.fillStyle = '#ffffff';
      c.fillText(line1, 440, 165);

      c.shadowBlur = 0;
      c.fillStyle = '#94a3b8';
      for (let o = 5; o >= 1; o--) {
        c.fillText(line1, 440 + o, 165 + o);
      }
      c.fillStyle = '#ffffff';
      c.fillText(line1, 440, 165);

      const line2 = 'KHOKSRISUPHAN HOSPITAL';
      c.font = "bold 46px 'Prompt', 'Kanit', 'Montserrat', 'Segoe UI', sans-serif";

      c.shadowColor = 'rgba(255, 255, 255, 0.75)';
      c.shadowBlur = 16;
      c.fillStyle = '#f8fafc';
      c.fillText(line2, 445, 252);

      c.shadowBlur = 0;
      c.fillStyle = '#64748b';
      for (let o = 3; o >= 1; o--) {
        c.fillText(line2, 445 + o, 252 + o);
      }
      c.fillStyle = '#f8fafc';
      c.fillText(line2, 445, 252);

      // ลวดลายกิ่งไม้และใบไม้สีขาว (Stylized Tree Art)
      c.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      c.lineWidth = 14;
      c.lineCap = 'round';
      c.lineJoin = 'round';

      c.beginPath();
      c.moveTo(1380, 520);
      c.bezierCurveTo(1390, 410, 1420, 340, 1450, 275);
      c.stroke();

      c.lineWidth = 10;
      c.beginPath();
      c.moveTo(1415, 360);
      c.bezierCurveTo(1350, 330, 1310, 310, 1260, 315);
      c.stroke();

      c.beginPath();
      c.moveTo(1435, 305);
      c.bezierCurveTo(1470, 280, 1510, 270, 1560, 280);
      c.stroke();

      c.fillStyle = '#ffffff';
      function drawLeaf(x, y, rx, ry, rot) {
        c.save();
        c.translate(x, y);
        c.rotate(rot);
        c.beginPath();
        c.ellipse ? c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2) : c.arc(0, 0, rx, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      drawLeaf(1255, 315, 20, 12, -0.3);
      drawLeaf(1290, 310, 16, 10, -0.2);
      drawLeaf(1450, 260, 24, 14, 0.4);
      drawLeaf(1565, 280, 20, 12, 0.6);

      c.lineWidth = 12;
      c.beginPath();
      c.moveTo(560, 480);
      c.bezierCurveTo(620, 430, 710, 420, 780, 445);
      c.stroke();

      c.beginPath();
      c.moveTo(640, 440);
      c.bezierCurveTo(620, 380, 580, 360, 540, 380);
      c.stroke();

      drawLeaf(535, 380, 18, 11, -0.7);
      drawLeaf(785, 450, 20, 12, 0.2);

      // กระจกบานเลื่อนช่องบริการห้องบัตร/เวชระเบียน (Center Sliding Service Window)
      const wx = 720, wy = 450, ww = 980, wh = 480;
      c.fillStyle = '#334155';
      c.fillRect(wx - 8, wy - 8, ww + 16, wh + 16);
      c.strokeStyle = '#64748b';
      c.lineWidth = 4;
      c.strokeRect(wx - 8, wy - 8, ww + 16, wh + 16);

      const winGrad = c.createLinearGradient(wx, wy, wx, wy + wh);
      winGrad.addColorStop(0, '#0f172a');
      winGrad.addColorStop(0.5, '#1e293b');
      winGrad.addColorStop(1, '#0f172a');
      c.fillStyle = winGrad;
      c.fillRect(wx, wy, ww, wh);

      c.fillStyle = 'rgba(148, 163, 184, 0.25)';
      for (let sy = wy + 60; sy < wy + wh; sy += 70) {
        c.fillRect(wx + 20, sy, ww - 40, 8);
      }

      c.fillStyle = '#64748b';
      c.fillRect(wx + ww / 2 - 4, wy, 8, wh);
      c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      c.strokeRect(wx + ww / 2 - 4, wy, 8, wh);

      c.fillStyle = 'rgba(255, 255, 255, 0.08)';
      c.beginPath();
      c.moveTo(wx + 40, wy);
      c.lineTo(wx + 240, wy);
      c.lineTo(wx + 100, wy + wh);
      c.lineTo(wx - 100, wy + wh);
      c.fill();

      // นาฬิกาดิจิทัลไฟแดง LED บนซ้าย
      c.fillStyle = '#0f172a';
      c.fillRect(70, 70, 160, 80);
      c.strokeStyle = '#334155';
      c.lineWidth = 4;
      c.strokeRect(70, 70, 160, 80);
      c.fillStyle = '#ef4444';
      c.font = 'bold 36px monospace';
      c.textAlign = 'center';
      c.fillText('10:15', 150, 115);

      // ลำโพงติดผนังขวาบน
      c.fillStyle = '#020617';
      c.fillRect(1820, 65, 120, 90);
      c.strokeStyle = '#334155';
      c.lineWidth = 3;
      c.strokeRect(1820, 65, 120, 90);
    });

    // 4. Texture ป้ายเตือนภัยฉุกเฉิน Fast-Track สีแดงสดด้านซ้าย
    const fastTrackAlertTex = M.canvasTexture(512, 768, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#7f1d1d');
      bg.addColorStop(0.5, '#991b1b');
      bg.addColorStop(1, '#b91c1c');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      c.strokeStyle = '#ffffff';
      c.lineWidth = 8;
      c.strokeRect(10, 10, w - 20, h - 20);

      c.fillStyle = '#450a0a';
      c.fillRect(18, 18, w - 36, 190);

      // โลโก้กาชาด / รพ.
      c.fillStyle = '#0f766e';
      c.beginPath();
      c.arc(w - 60, 55, 24, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ffffff';
      c.font = 'bold 22px sans-serif';
      c.textAlign = 'center';
      c.fillText('+', w - 60, 62);

      c.textAlign = 'left';
      c.fillStyle = '#fef08a';
      c.font = 'bold 32px Prompt, sans-serif';
      c.fillText('หากมีอาการเหล่านี้', 36, 60);

      c.fillStyle = '#ffffff';
      c.font = 'bold 34px Prompt, sans-serif';
      c.fillText('ต้องแจ้งเจ้าหน้าที่', 36, 105);

      c.fillStyle = '#facc15';
      c.fillRect(36, 125, 150, 60);
      c.fillStyle = '#7f1d1d';
      c.font = 'bold 44px Prompt, sans-serif';
      c.textAlign = 'center';
      c.fillText('ทันที', 36 + 75, 168);

      c.font = '54px sans-serif';
      c.fillText('🫀 🧠', w - 120, 168);

      // กล่องเตือน 1: เจ็บแน่นหน้าอก
      const c1y = 230, cardH = 210;
      c.fillStyle = '#ffffff';
      c.fillRect(24, c1y, w - 48, cardH);
      c.strokeStyle = '#dc2626';
      c.lineWidth = 4;
      c.strokeRect(24, c1y, w - 48, cardH);

      c.fillStyle = '#fee2e2';
      c.beginPath();
      c.arc(75, c1y + 65, 38, 0, Math.PI * 2);
      c.fill();
      c.font = '40px sans-serif';
      c.fillText('❤️‍🔥', 75, c1y + 78);

      c.textAlign = 'left';
      c.fillStyle = '#991b1b';
      c.font = 'bold 32px Prompt, sans-serif';
      c.fillText('เจ็บแน่นหน้าอก', 130, c1y + 60);

      c.fillStyle = '#1e293b';
      c.font = 'bold 24px Prompt, sans-serif';
      c.fillText('หายใจไม่เต็มอิ่ม', 130, c1y + 100);

      c.fillStyle = '#64748b';
      c.font = '20px Prompt, sans-serif';
      c.fillText('• เหงื่อแตก ใจสั่น ร้าวไปกราม/แขน', 40, c1y + 150);
      c.fillText('• มีประวัติโรคหัวใจหรือความดัน', 40, c1y + 182);

      // กล่องเตือน 2: ปากเบี้ยว แขนขาอ่อนแรง
      const c2y = 465;
      c.fillStyle = '#ffffff';
      c.fillRect(24, c2y, w - 48, cardH);
      c.strokeStyle = '#dc2626';
      c.lineWidth = 4;
      c.strokeRect(24, c2y, w - 48, cardH);

      c.fillStyle = '#fee2e2';
      c.beginPath();
      c.arc(75, c2y + 65, 38, 0, Math.PI * 2);
      c.fill();
      c.font = '40px sans-serif';
      c.fillText('🧠', 75, c2y + 78);

      c.fillStyle = '#991b1b';
      c.font = 'bold 32px Prompt, sans-serif';
      c.fillText('ปากเบี้ยว พูดไม่ชัด', 130, c2y + 60);

      c.fillStyle = '#1e293b';
      c.font = 'bold 24px Prompt, sans-serif';
      c.fillText('แขนขาอ่อนแรง', 130, c2y + 100);

      c.fillStyle = '#64748b';
      c.font = '20px Prompt, sans-serif';
      c.fillText('• พูดไม่ออก สับสน นึกคำพูดไม่ได้', 40, c2y + 150);
      c.fillText('• ทรงตัวไม่ได้ เดินเซ ตามัวเฉียบพลัน', 40, c2y + 182);

      // แถบด้านล่าง
      c.fillStyle = '#14532d';
      c.fillRect(18, h - 68, w - 36, 50);
      c.fillStyle = '#ffffff';
      c.font = 'bold 20px Prompt, sans-serif';
      c.textAlign = 'center';
      c.fillText('🚑 FAST TRACK STROKE & STEMI • รพ.โคกศรีสุพรรณ', w / 2, h - 36);
    });

    // -------------------------------------------------------------------------
    // ประกอบโครงสร้าง 3D เคาน์เตอร์จุดคัดกรองขอบมน 3 ชั้น (Plinth, Wood Slat Body, White Fascia)
    // -------------------------------------------------------------------------
    const ctrX = WX(38.4, 7.65); // พิกัด World X ≈ 24.757
    const ctrZ = WZ(38.4);       // พิกัด World Z ≈ 4.391
    const straightL = 2.40;      // ความยาวช่วงตรงของเคาน์เตอร์
    const halfL = straightL / 2; // 1.20

    const plinthMat = M.mat(0xf1f5f9, { roughness: 0.25 });
    const oakWoodMat = M.mat(0xcca072, { roughness: 0.45 });
    const whiteFasciaMat = M.mat(0xffffff, { roughness: 0.15, metalness: 0.05 });
    const woodSlatMat = new THREE.MeshStandardMaterial({ map: screeningWoodSlatTex, roughness: 0.45 });
    const sneezeGuardMat = new THREE.MeshStandardMaterial({
      map: sneezeGuardTex,
      transparent: true,
      opacity: 0.94,
      roughness: 0.05,
      metalness: 0.1,
      depthWrite: false
    });
    const backdropMat = new THREE.MeshStandardMaterial({ map: screeningBackdropTex, roughness: 0.35 });
    const fastTrackMat = new THREE.MeshStandardMaterial({ map: fastTrackAlertTex, roughness: 0.4 });

    // 1. ฐานเคาน์เตอร์สีขาวบัวพื้นขอบมน (Plinth: y = 0 .. 0.09)
    const plinthR = 0.38, plinthH = 0.09;
    M.box(g, plinthR * 2, plinthH, straightL, plinthMat, ctrX, plinthH / 2, ctrZ);
    M.cyl(g, plinthR, plinthR, plinthH, plinthMat, ctrX, plinthH / 2, ctrZ - halfL, 24);
    M.cyl(g, plinthR, plinthR, plinthH, plinthMat, ctrX, plinthH / 2, ctrZ + halfL, 24);

    // 2. ตัวเคาน์เตอร์ระแนงไม้แนวตั้งสีธรรมชาติ (Wood Fluted Body: y = 0.09 .. 0.74, สูง 0.65m)
    const bodyR = 0.41, bodyH = 0.65, bodyY = 0.09 + bodyH / 2;
    M.box(g, bodyR * 2, bodyH, straightL, oakWoodMat, ctrX, bodyY, ctrZ);
    M.cyl(g, bodyR, bodyR, bodyH, oakWoodMat, ctrX, bodyY, ctrZ - halfL, 24);
    M.cyl(g, bodyR, bodyR, bodyH, oakWoodMat, ctrX, bodyY, ctrZ + halfL, 24);

    // แผ่นหน้าเคาน์เตอร์ระแนงไม้ + ตัวอักษร 3D "จุดคัดกรอง / SCREENING POINT" หันหน้าไปทาง ER (-X)
    const frontPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, bodyH, straightL),
      [
        woodSlatMat, // +X
        woodSlatMat, // -X (หันหน้าออกหาผู้รับบริการทาง ER)
        oakWoodMat,  // +Y
        oakWoodMat,  // -Y
        oakWoodMat,  // +Z
        oakWoodMat   // -Z
      ]
    );
    frontPlate.position.set(ctrX - bodyR - 0.006, bodyY, ctrZ);
    g.add(frontPlate);

    // 3. ท็อปเคาน์เตอร์และบัวบนสีขาวเงาหนาขอบมน (White Countertop & Upper Fascia: y = 0.74 .. 0.94, สูง 0.20m)
    const topR = 0.44, topH = 0.20, topY = 0.74 + topH / 2;
    M.box(g, topR * 2, topH, straightL, whiteFasciaMat, ctrX, topY, ctrZ);
    M.cyl(g, topR, topR, topH, whiteFasciaMat, ctrX, topY, ctrZ - halfL, 24);
    M.cyl(g, topR, topR, topH, whiteFasciaMat, ctrX, topY, ctrZ + halfL, 24);

    // พื้นผิวโต๊ะทำงานระดับในสำหรับวางอุปกรณ์และพิมพ์เอกสาร (y = 0.94)
    M.box(g, 0.72, 0.02, straightL + 0.40, whiteFasciaMat, ctrX + 0.05, 0.935, ctrZ);

    // 4. แผงกั้นอะคริลิกใสป้องกันละอองฝอย (Acrylic Sneeze Guard: y = 0.94 .. 1.48, สูง 0.54m)
    const guardH = 0.54, guardY = 0.94 + guardH / 2;
    const guardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, guardH, straightL + 0.20),
      sneezeGuardMat
    );
    guardMesh.position.set(ctrX - 0.12, guardY, ctrZ);
    g.add(guardMesh);

    // ขาจับสเตนเลสยึดแผงกั้นอะคริลิก 4 จุด
    const clampMat = M.mat(0xe2e8f0, { roughness: 0.15, metalness: 0.85 });
    [-halfL, -0.40, 0.40, halfL].forEach(zOff => {
      M.box(g, 0.04, 0.12, 0.04, clampMat, ctrX - 0.12, 0.98, ctrZ + zOff);
    });

    // 5. ป้ายแจ้งเตือนฉุกเฉิน Fast-Track สีแดงสดด้านซ้ายเคาน์เตอร์ (Red Emergency Alert Stand)
    const standZ = ctrZ - halfL - 0.55;
    const standX = ctrX - 0.35;
    M.cyl(g, 0.18, 0.18, 0.025, M.mat(0x475569, { roughness: 0.3, metalness: 0.7 }), standX, 0.0125, standZ, 20);
    M.cyl(g, 0.02, 0.02, 1.15, clampMat, standX, 0.58, standZ, 16);
    const alertBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.72, 0.52),
      [
        fastTrackMat, // +X
        fastTrackMat, // -X (facing ER)
        M.mat(0x7f1d1d),
        M.mat(0x7f1d1d),
        M.mat(0x7f1d1d),
        M.mat(0x7f1d1d)
      ]
    );
    alertBoard.position.set(standX, 1.25, standZ);
    g.add(alertBoard);

    // 6. ผนังฉากหลังไม้สีเข้ม Walnut พร้อมโลโก้โรงพยาบาล ตัวอักษรเรืองแสง ลายกิ่งไม้ และช่องกระจกบานเลื่อน
    const wallZ = 4.25, wallW = 3.25, wallH = 1.85;
    const backdropMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, wallH, wallW),
      [
        M.mat(0x1e110b),
        backdropMat, // -X (หันหน้าออกหาผู้รับบริการ)
        M.mat(0x1e110b),
        M.mat(0x1e110b),
        M.mat(0x1e110b),
        M.mat(0x1e110b)
      ]
    );
    backdropMesh.position.set(25.46, wallH / 2, wallZ);
    g.add(backdropMesh);

    // บัวฝ้าเพดานด้านบนผนังไม้ (Overhead Ceiling Soffit) & หลอดไฟดาวน์ไลท์ warm white
    M.box(g, 0.30, 0.12, wallW + 0.10, M.mat(0x1e110b, { roughness: 0.4 }), 25.35, 1.88, wallZ);
    const lightGlowMat = M.mat(0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.9 });
    [wallZ - 1.05, wallZ, wallZ + 1.05].forEach(spotZ => {
      M.cyl(g, 0.05, 0.05, 0.02, lightGlowMat, 25.35, 1.81, spotZ, 12);
    });
    const receptionWarmLight = new THREE.PointLight(0xffedd5, 0.85, 4.5);
    receptionWarmLight.position.set(24.90, 1.85, wallZ);
    g.add(receptionWarmLight);

    // --- ติดตั้งชุดคอมพิวเตอร์โต๊ะ 2 ไว้บนเคาน์เตอร์ด้านหน้า (Front Counter Workstation) ---
    function createCounterWorkstation(cx, cz, pcSpec, labelText) {
      // เก้าอี้สำนักงานพร้อมพนักพิงสำหรับเจ้าหน้าที่
      M.box(g, 0.45 * SX, 0.06, 0.45 * SZ, M.mat(0x1e293b), WX(cx, cz - 0.55), 0.25, WZ(cx));
      M.box(g, 0.44 * SX, 0.08, 0.44 * SZ, M.mat(0x0284c7), WX(cx, cz - 0.55), 0.48, WZ(cx));
      M.box(g, 0.06 * SX, 0.44, 0.42 * SZ, M.mat(0x0284c7), WX(cx, cz - 0.72), 0.72, WZ(cx));

      // เจ้าหน้าที่เวชระเบียนนั่งประจำเคาน์เตอร์ด้านหน้า หันหน้าออกหาผู้รับบริการ (+Z ในห้อง)
      const staff = makePerson({ role: 'nurse', pose: 'sit', rotY: 0 });
      staff.position.set(WX(cx, cz - 0.55), 0, WZ(cx));
      g.add(staff);

      // 1. ฐานจอ All-in-One และเสาขาตั้ง วางบนเคาน์เตอร์ความสูง y = 0.94
      const pcStand = rBox(0.24, 0.02, 0.18, M.mat(0x334155), cx, 0.95, cz);
      const pcPillar = rBox(0.06, 0.14, 0.04, M.mat(0x475569), cx, 1.02, cz + 0.02);

      // 2. จอภาพ All-in-One ขนาด 23.8 นิ้ว ขอบบาง หันจอเรืองแสงสีฟ้าหาเจ้าหน้าที่ (-Z ในห้อง)
      const monBody = rBox(0.54, 0.34, 0.03, M.mat(0x0f172a), cx, 1.19, cz);
      addEdges(monBody, 0x38bdf8);
      const monScreen = rBox(0.50, 0.30, 0.01, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), cx, 1.19, cz - 0.016);

      // 3. แป้นพิมพ์และเมาส์วางบนหน้าโต๊ะเคาน์เตอร์
      const kbd = rBox(0.40, 0.015, 0.13, M.mat(0x1e293b), cx, 0.95, cz - 0.22);
      const mousePad = rBox(0.18, 0.005, 0.18, M.mat(0x0f172a), cx + 0.30, 0.945, cz - 0.22);
      const mouse = rBox(0.06, 0.02, 0.09, M.mat(0x334155), cx + 0.30, 0.955, cz - 0.22);

      // 4. เครื่องอ่านบัตรประชาชน Smart Card ThaiID Reader เรืองแสงสีเขียว
      const smartCardReader = rBox(0.11, 0.025, 0.08, M.mat(0x10b981), cx - 0.28, 0.955, cz - 0.15);
      const cardSlotTrim = rBox(0.08, 0.008, 0.02, M.mat(0xffffff), cx - 0.28, 0.97, cz - 0.13);

      // 5. เครื่องพิมพ์บาร์โค้ด / สติกเกอร์ OPD (Zebra ZD230)
      const printer = rBox(0.18, 0.14, 0.20, M.mat(0x334155), cx - 0.32, 1.01, cz + 0.08);
      const printerSlot = rBox(0.12, 0.015, 0.02, M.mat(0x10b981), cx - 0.32, 1.03, cz - 0.02);

      // 6. ถาดเอกสารและแฟ้ม OPD Card
      const docTray = rBox(0.24, 0.06, 0.30, M.mat(0x94a3b8), cx + 0.34, 0.97, cz + 0.06);

      // ผูก pcInfo กับชิ้นส่วน 3D ทั้งหมด
      [pcStand, pcPillar, monBody, monScreen, kbd, mousePad, mouse, smartCardReader, cardSlotTrim, printer, printerSlot, docTray].forEach((mesh) => {
        mesh.userData = { clickable: true, type: 'pc', pcInfo: pcSpec };
      });

      // ป้าย 3D คลิกได้สำหรับคอมพิวเตอร์เคาน์เตอร์ด้านหน้า
      L.push({
        text: '🖥️ ' + labelText,
        pos: rV(cx, 1.65, cz),
        cls: 'int-label pc-tag',
        clickable: true,
        pcInfo: pcSpec
      });
    }

    // วางชุดคอมพิวเตอร์โต๊ะ 2 บนเคาน์เตอร์ด้านหน้า ช่องที่ 2
    createCounterWorkstation(36.8, 7.55, cardPc2Spec, 'โต๊ะคอม 2 (เคาน์เตอร์ด้านหน้า)');

    // ป้ายบอกช่องบริการ 1 และ 2 บนหน้าต่างกระจก
    L.push({
      text: '🪪 ช่อง 1: ค้นหา OPD Card/เวชระเบียน',
      pos: rV(39.4, 1.45, 7.98),
      cls: 'int-label sub-tag'
    });
    L.push({
      text: '🪪 ช่อง 2: จุดคัดกรอง & ลงทะเบียน (โต๊ะคอม 2)',
      pos: rV(36.8, 1.45, 7.98),
      cls: 'int-label sub-tag',
      clickable: true,
      pcInfo: cardPc2Spec
    });

    // ผู้รับบริการยืนติดต่อที่เคาน์เตอร์ด้านหน้า ช่อง 2
    const visitor1 = makePerson({ role: 'patient', pose: 'stand', rotY: Math.PI / 2 });
    visitor1.position.set(WX(36.8, 8.35), 0, WZ(36.8));
    g.add(visitor1);

    L.push({
      text: '🪪 จุดคัดกรอง • SCREENING POINT (เคาน์เตอร์ด้านหน้าห้องบัตร)',
      pos: rV(38.4, 1.95, 7.65),
      cls: 'int-label room-title',
      clickable: true,
      pcInfo: cardPc2Spec
    });

    const kioskSpec = makePcSpec(
      'KIOSK-REG-01',
      'ตู้ Kiosk ออกบัตรคิวและลงทะเบียนอัตโนมัติ (Smart Queue Kiosk)',
      'จุดบริการตนเอง หน้าเคาน์เตอร์ลงทะเบียนผู้มารับบริการ (Self-Service Kiosk)',
      '10.10.20.199',
      'KSS Smart Queue & Self-Registration App • HOSxP Kiosk Gateway • Face & ID Validation',
      {
        hostname: 'KIOSK-CARD-01',
        mac: '00:E0:4C:88:A1:01',
        switchId: 'ksp-sw-xray',
        switchName: 'Aruba / HPE 2530 24G (KSP-SW-XRAY - ตึก X-Ray/ห้องบัตร)',
        switchIp: '10.10.100.7',
        switchPort: 'Port 9 (10/100/1000Base-T / VLAN 20 Untagged)',
        wallOutlet: 'Outlet ID: KIOSK-FRONT-01 (เต้ารับ LAN เสาหน้าเคาน์เตอร์ลงทะเบียน)',
        gateway: '10.10.20.1 (Core Gateway)',
        vlan: 'VLAN 20 - งานเวชระเบียนและสารสนเทศยุทธศาสตร์',
        cpu: 'Intel Core i3-1115G4 (Dual-Core, up to 4.10GHz Industrial IPC)',
        ram: '8 GB DDR4-3200 Industrial Grade',
        storage: '256 GB Industrial M.2 SSD',
        monitor: '21.5\" Full HD Projected Capacitive Touchscreen (10-Point Touch)',
        printer: 'เครื่องพิมพ์ใบสั่งคิวความร้อนความเร็วสูง 80mm High-Speed Thermal Queue Printer พร้อมระบบตัดกระดาษอัตโนมัติ (Auto-Cutter)'
      }
    );

    function createSmartKiosk(kx, kz) {
      const kg = new THREE.Group();
      kg.position.set(WX(kx, kz), 0, WZ(kx));

      // ฐานตั้งถ่วงน้ำหนัก (Weighted Pedestal Base)
      const kBase = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.05, 0.52), M.mat(0x0f172a));
      kBase.position.y = 0.025;
      kBase.castShadow = true;
      kg.add(kBase);

      // แถบสะท้อนแสงเซฟตี้ขอบฐาน (Safety Trim)
      const kTrim = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.02, 0.54), M.mat(0xf97316));
      kTrim.position.y = 0.01;
      kg.add(kTrim);

      // โครงสร้างเสากลางตู้ Kiosk โลหะสีฟ้าอมน้ำเงิน
      const kBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.05, 0.30), M.mat(0x0284c7));
      kBody.position.y = 0.56;
      kBody.castShadow = true;
      kg.add(kBody);

      // ฝาหน้าสีขาวมุก
      const kFront = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.98, 0.04), M.mat(0xf8fafc));
      kFront.position.set(0, 0.56, 0.14);
      kg.add(kFront);

      // ช่องเสียบบัตรประชาชน Smart Card เรืองแสงสีเขียว
      const cardSlot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.05), M.mat(0x10b981));
      cardSlot.position.set(0, 0.78, 0.16);
      kg.add(cardSlot);

      // ช่องพิมพ์ใบกระดาษคิว Thermal Paper Exit
      const ticketSlot = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.02, 0.04), M.mat(0x1e293b));
      ticketSlot.position.set(0, 0.68, 0.16);
      kg.add(ticketSlot);
      const ticketPaper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.01), M.mat(0xffffff));
      ticketPaper.position.set(0, 0.67, 0.18);
      kg.add(ticketPaper);

      // หน้าต่างเซ็นเซอร์สแกน QR Code / บาร์โค้ดคนไข้
      const qrScan = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.03), M.mat(0x38bdf8));
      qrScan.position.set(0, 0.55, 0.16);
      kg.add(qrScan);

      // ส่วนหัวหน้าจอสัมผัสเอียง 18 องศา (Tilted 21.5" Touchscreen Head)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.15, 0.08);
      headGroup.rotation.x = -0.30;

      const scrBezel = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.42, 0.06), M.mat(0x0f172a));
      scrBezel.castShadow = true;
      headGroup.add(scrBezel);

      // กระจกหน้าจอแสดงผลสว่างสีฟ้า
      const scrGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.36, 0.02),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      scrGlass.position.z = 0.035;
      headGroup.add(scrGlass);

      // จำลอง UI ปุ่มสัมผัส Smart Queue
      const uiHeader = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.07, 0.01),
        new THREE.MeshBasicMaterial({ color: 0x0369a1 })
      );
      uiHeader.position.set(0, 0.12, 0.045);
      headGroup.add(uiHeader);

      const uiBtn1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.09, 0.01),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      uiBtn1.position.set(-0.11, -0.02, 0.045);
      headGroup.add(uiBtn1);

      const uiBtn2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.09, 0.01),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      uiBtn2.position.set(0.11, -0.02, 0.045);
      headGroup.add(uiBtn2);

      kg.add(headGroup);

      // ไฟโดมสถานะด้านบนตู้ Kiosk สีเขียวออนไลน์
      const ledBar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.04), M.mat(0x22c55e));
      ledBar.position.set(0, 1.40, 0.02);
      kg.add(ledBar);

      // ผูก pcInfo เพื่อให้คลิกชิ้นส่วน 3D แล้วเปิด Modal สเปกได้
      kg.traverse((ch) => {
        if (ch.isMesh) {
          ch.userData = { clickable: true, type: 'pc', pcInfo: kioskSpec };
        }
      });
      kg.userData = { clickable: true, type: 'pc', pcInfo: kioskSpec };

      g.add(kg);
      return kg;
    }

    createSmartKiosk(39.8, 8.45);

    // ป้าย 3D คลิกได้สำหรับตู้ Kiosk
    L.push({
      text: '🏧 ตู้ Kiosk ออกบัตรคิวและลงทะเบียนอัตโนมัติ',
      pos: rV(39.8, 1.65, 8.45),
      cls: 'int-label pc-tag',
      clickable: true,
      pcInfo: kioskSpec
    });

    // ผู้รับบริการยืนใช้งานตู้ Kiosk
    const kioskVisitor = makePerson({ role: 'patient', pose: 'stand', rotY: 0 });
    kioskVisitor.position.set(WX(39.8, 9.15), 0, WZ(39.8));
    g.add(kioskVisitor);

    // =========================================================================
    // ห้องเพิ่มเติมด้านหน้าข้าง ER (ฝั่งตรงข้ามทางเดินหลักด้านหน้า z = 8.95 .. 12.55)
    // ห้อง 1 & 2: ห้องปลอดเชื้อ (Clean/Sterile Rooms)
    // ห้อง 3: ที่จัดเก็บเก้าอี้และเตียง (Chair & Bed Storage Room)
    // =========================================================================

    // พื้นห้องทั้ง 3 ห้อง
    floor(g, 9.6, 3.6, '#ecfeff', '#a5f3fc', 1.0, 9.0, 10.75);  // ห้อง 1 และ ห้อง 2 (x: 4.2 .. 13.8)
    floor(g, 4.8, 3.6, '#f1f5f9', '#cbd5e1', 1.0, 0.8, 10.75);  // ห้อง 3 (x: -1.6 .. 3.2)

    // --- ผนังห้องปลอดเชื้อ 1 (x: 9.0 .. 13.8, z: 8.95 .. 12.55) ---
    wall(9.0, 12.55, 13.8, 12.55, 0.16, WH, true); // หลัง
    wall(13.8, 8.95, 13.8, 12.55, 0.16, WH, true); // ขวา
    wall(9.0, 8.95, 9.0, 12.55, 0.14, WH);         // ผนังกั้นกลางห้อง 1-2
    wall(9.0, 8.95, 10.7, 8.95, 0.16, WH);         // หน้าซ้าย
    wall(12.1, 8.95, 13.8, 8.95, 0.16, WH);        // หน้าขวา
    doorWay(11.4, 8.95, Math.PI, 1.35);

    // --- ผนังห้องปลอดเชื้อ 2 (x: 4.2 .. 9.0, z: 8.95 .. 12.55) ---
    wall(4.2, 12.55, 9.0, 12.55, 0.16, WH, true);  // หลัง
    wall(4.2, 8.95, 4.2, 12.55, 0.16, WH, true);   // ซ้าย
    wall(4.2, 8.95, 5.9, 8.95, 0.16, WH);          // หน้าซ้าย
    wall(7.3, 8.95, 9.0, 8.95, 0.16, WH);          // หน้าขวา
    doorWay(6.6, 8.95, Math.PI, 1.35);

    // Helper วางอุปกรณ์ภายในห้องปลอดเชื้อ
    function populateSterileRoom(cx) {
      // ตู้เก็บเครื่องมือและอุปกรณ์ปลอดเชื้อ (Sterile Cabinets) 2 ตู้ชิดผนังหลัง
      [-1.1, 1.1].forEach((ox) => {
        const cab = M.box(g, 1.35, 1.35, 0.45, M.mat(0xffffff), cx + ox, 0.675, 12.15);
        addEdges(cab, 0x0284c7);
        M.box(g, 1.25, 0.08, 0.04, M.mat(0x0ea5e9), cx + ox, 1.22, 11.91);
      });
      // เครื่องฟอกอากาศ / กรองอากาศ HEPA Filter เรืองแสงสีฟ้า
      const hepa = M.box(g, 0.42, 0.95, 0.42, M.mat(0xf8fafc), cx + 1.95, 0.475, 12.05);
      addEdges(hepa, 0x38bdf8);
      M.box(g, 0.24, 0.08, 0.02, M.mat(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.8 }), cx + 1.95, 0.84, 11.83);
      // โต๊ะเตรียมอุปกรณ์ปลอดเชื้อสเตนเลสกลางห้อง
      const stTable = M.box(g, 1.5, 0.05, 0.75, M.mat(0xe2e8f0, { roughness: 0.2, metalness: 0.6 }), cx, 0.78, 10.65);
      addEdges(stTable, 0x64748b);
      [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].forEach(([lx, lz]) => {
        M.box(g, 0.05, 0.76, 0.05, M.mat(0x94a3b8), cx + lx, 0.38, 10.65 + lz);
      });
      // ถาดอุปกรณ์ปลอดเชื้อสีฟ้า-เงินบนโต๊ะ
      M.box(g, 0.45, 0.08, 0.32, M.mat(0x0ea5e9), cx - 0.3, 0.84, 10.65);
      M.box(g, 0.38, 0.06, 0.28, M.mat(0xcbd5e1), cx + 0.35, 0.83, 10.65);
    }

    populateSterileRoom(11.4); // ห้องปลอดเชื้อ 1
    populateSterileRoom(6.6);  // ห้องปลอดเชื้อ 2

    L.push({ text: '🧼 ห้อง 1: ห้องปลอดเชื้อ 1', pos: V(11.4, 1.85, 10.75), cls: 'int-label room-title' });
    L.push({ text: '🧼 ห้อง 2: ห้องปลอดเชื้อ 2', pos: V(6.6, 1.85, 10.75), cls: 'int-label room-title' });

    // --- ผนังห้องที่ 3: ที่จัดเก็บเก้าอี้และเตียง (x: -1.6 .. 3.2, z: 8.95 .. 12.55) ---
    wall(-1.6, 12.55, 3.2, 12.55, 0.16, WH, true); // หลัง
    wall(-1.6, 8.95, -1.6, 12.55, 0.16, WH, true); // ซ้าย
    wall(3.2, 8.95, 3.2, 12.55, 0.16, WH, true);   // ขวา
    wall(-1.6, 8.95, -0.05, 8.95, 0.16, WH);       // หน้าซ้าย
    wall(1.65, 8.95, 3.2, 8.95, 0.16, WH);         // หน้าขวา
    doorWay(0.8, 8.95, Math.PI, 1.65);

    // เตียงสำรองที่จัดเก็บในห้องที่ 3 (ฝั่งซ้ายของห้อง 2 เตียง)
    [-0.85, 0.25].forEach((bx) => {
      const bFrame = M.box(g, 0.82, 0.08, 1.85, M.mat(0x475569), bx, 0.42, 11.2);
      const bMatt = M.box(g, 0.78, 0.12, 1.78, M.mat(0xe0f2fe), bx, 0.52, 11.2);
      addEdges(bFrame, 0x1e293b);
      addEdges(bMatt, 0x0284c7);
      // พนักหัวเตียง/ท้ายเตียง
      M.box(g, 0.82, 0.30, 0.05, M.mat(0x1e40af), bx, 0.62, 12.1);
      M.box(g, 0.82, 0.22, 0.05, M.mat(0x64748b), bx, 0.58, 10.3);
      // ขาเตียง 4 มุม
      [[-0.36, -0.82], [0.36, -0.82], [-0.36, 0.82], [0.36, 0.82]].forEach(([lx, lz]) => {
        M.box(g, 0.06, 0.40, 0.06, M.mat(0x334155), bx + lx, 0.20, 11.2 + lz);
      });
    });

    // เก้าอี้วางซ้อนกันเป็นตั้งๆ (Stacked Chairs) ฝั่งขวาของห้องที่ 3
    [[1.65, 10.35], [2.45, 10.35], [1.65, 11.65], [2.45, 11.65]].forEach(([sx, sz]) => {
      // ซ้อนเก้าอี้ 3 ชั้นต่อตั้ง
      for (let tier = 0; tier < 3; tier++) {
        const cy = 0.38 + tier * 0.18;
        const cSeat = M.box(g, 0.42, 0.05, 0.42, M.mat(tier % 2 === 0 ? 0x0284c7 : 0x0369a1), sx, cy, sz);
        addEdges(cSeat, 0x0f172a);
        M.box(g, 0.40, 0.34, 0.05, M.mat(0x0284c7), sx, cy + 0.18, sz + 0.18);
      }
      // ขาเก้าอี้เหล็ก
      [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([lx, lz]) => {
        M.box(g, 0.03, 0.38, 0.03, M.mat(0x334155), sx + lx, 0.19, sz + lz);
      });
    });

    L.push({ text: '🪑🛏️ ห้อง 3: ที่จัดเก็บเก้าอี้และเตียง', pos: V(0.8, 1.85, 10.75), cls: 'int-label room-title' });

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
    items.push(['🧼', 'ห้อง 1-2: ห้องปลอดเชื้อ (หน้า ER)', '2 ห้อง']);
    items.push(['🪑', 'ห้อง 3: ที่จัดเก็บเก้าอี้และเตียง', 'พร้อมใช้งาน']);
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
