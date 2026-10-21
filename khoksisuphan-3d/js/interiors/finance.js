/* =========================================================================
 * อาคารการเงิน (Finance Building)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, floor, addEdges, makePerson } = C;

  const financeState = {
    counterOpen: true
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

  function buildFinanceInterior() {
    const g = new THREE.Group();
    const L = [];

    const W = 7.6;
    const D = 9.6;
    const xL = -W / 2;
    const xR = W / 2;
    const zT = -D / 2;
    const zB = D / 2;
    const WH = 2.2;

    floor(g, W, D, '#f8fafc', '#cbd5e1', 0.6, 0, 0);

    g.add(maintAt(maintWall(W, WH, 0.18, 0x1e293b), 0, WH / 2, zT));
    g.add(maintAt(maintWall(W, WH, 0.18, 0x1e293b), 0, WH / 2, zB));
    g.add(maintAt(maintWall(0.18, WH, D, 0x1e293b), xR, WH / 2, 0));
    g.add(
      maintAt(maintWall(0.18, 0.38, 5.15, 0x1e293b), xL, WH - 0.19, -2.225),
      maintAt(maintWall(0.18, WH, 1.0, 0x1e293b), xL, WH / 2, 0.85),
      maintAt(maintWall(0.18, WH, 1.15, 0x1e293b), xL, WH / 2, 4.225),
      maintAt(maintWall(0.18, 0.35, 2.3, 0x1e293b), xL, WH - 0.175, 2.5)
    );

    const doorZ = 2.5;
    const doorFrame = new THREE.Group();
    doorFrame.position.set(xL, 0, doorZ);
    const doorPad = maintBox(1.25, 0.05, 2.3, 0xe2e8f0);
    doorPad.position.set(0, 0.025, 0);
    doorFrame.add(doorPad);
    const doorLeaf = maintBox(0.08, 1.85, 1.85, 0xd97706);
    doorLeaf.position.set(0.32, 0.94, -0.15);
    doorLeaf.rotation.y = 0.38;
    doorFrame.add(doorLeaf);
    g.add(doorFrame);

    L.push(
      maintTag(
        '🚪 ประตู',
        V(xL - 0.25, 1.45, doorZ),
        'room',
        null,
        'ประตูทางเข้า-ออกห้องการเงิน (ฝั่งซ้ายล่าง)'
      )
    );

    const cntX0 = xL + 0.05;
    const cntX1 = -1.65;
    const cntZ0 = zT + 0.1;
    const cntZ1 = 0.35;
    const cntW = cntX1 - cntX0;
    const cntD = cntZ1 - cntZ0;
    const cntCX = (cntX0 + cntX1) / 2;
    const cntCZ = (cntZ0 + cntZ1) / 2;

    const cntFloorCol = financeState.counterOpen ? 0xdcfce7 : 0xfecaca;
    g.add(maintAt(maintBox(cntW, 0.04, cntD, cntFloorCol), cntCX, 0.025, cntCZ));

    const deskFrontX = cntX0 + 0.38;
    const chairX = cntX1 - 0.55;
    g.add(
      maintAt(maintBox(0.68, 0.92, cntD - 0.08, 0x0284c7), deskFrontX, 0.46, cntCZ),
      maintAt(maintBox(0.82, 0.06, cntD - 0.02, 0xf8fafc), deskFrontX - 0.04, 0.95, cntCZ),
      maintAt(maintBox(cntW - 0.08, 0.92, 0.24, 0x0284c7), cntCX, 0.46, cntZ1 - 0.12),
      maintAt(maintBox(cntW - 0.04, 0.06, 0.3, 0xf8fafc), cntCX, 0.95, cntZ1 - 0.12),
      maintAt(
        new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.78, cntD - 0.6),
          new THREE.MeshStandardMaterial({
            color: 0xbae6fd,
            transparent: true,
            opacity: 0.55,
            roughness: 0.15
          })
        ),
        cntX0 + 0.06,
        1.36,
        cntCZ
      ),
      maintAt(maintBox(0.42, 0.22, 0.46, 0x1e293b), deskFrontX + 0.05, 1.09, -1.6),
      maintAt(maintBox(0.32, 0.2, 0.3, 0x334155), deskFrontX + 0.05, 1.08, -2.7),
      maintAt(maintBox(0.48, 0.46, 0.48, 0x1e293b), chairX, 0.23, -2.1),
      maintAt(maintBox(0.08, 0.48, 0.46, 0x1e293b), chairX + 0.22, 0.65, -2.1)
    );

    if (financeState.counterOpen) {
      const cashier = makePerson({
        role: 'nurse',
        shirtColor: 0x0284c7,
        pose: 'sit',
        rotY: -Math.PI / 2
      });
      cashier.position.set(chairX, 0, -2.1);
      g.add(cashier);
    }

    L.push(
      maintTag(
        `💰 เค้าเตอร์คิดเงิน (${financeState.counterOpen ? '🟢 เปิดให้บริการ' : '🔴 พักให้บริการ'})`,
        V(cntCX, 2.05, cntCZ),
        'room ' + (financeState.counterOpen ? 'free' : 'busy'),
        'finance-counter',
        'คลิกเพื่อสลับสถานะเค้าเตอร์คิดเงิน'
      )
    );

    const pcX0 = -1.62;
    const pcX1 = 2.15;
    const pcZ0 = zT + 0.1;
    const pcZ1 = -3.35;
    const pcW = pcX1 - pcX0;
    const pcD = pcZ1 - pcZ0;
    const pcCX = (pcX0 + pcX1) / 2;
    const pcCZ = (pcZ0 + pcZ1) / 2;

    const financePcSpec = {
      code: 'PC-FIN-01',
      name: 'โต๊ะคอมการเงิน (งานการเงินและบัญชี)',
      role: 'ตรวจสอบสิทธิการรักษา ประมวลผลค่ารักษาพยาบาล และออกใบเสร็จรับเงินอิเล็กทรอนิกส์ (e-Receipt)',
      user: 'เจ้าพนักงานการเงินและบัญชี โรงพยาบาลโคกศรีสุพรรณ',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-13500 (14 Cores @ 4.8GHz)',
      ram: '16 GB DDR4 3200MHz',
      storage: 'SSD NVMe M.2 512 GB',
      monitor: 'จอภาพ 24" IPS Full HD + จอแสดงยอดเงินฝั่งผู้รับบริการ',
      ip: '192.168.12.21',
      software: 'ระบบการเงินโรงพยาบาล HOSxP Finance • ระบบตรวจสอบสิทธิ สปสช./กรมบัญชีกลาง • ระบบ KTB Corporate Online',
      peripherals: 'เครื่องพิมพ์ใบเสร็จความเร็วสูง Epson • เครื่องอ่านบัตรประชาชน Smart Card • UPS 1000VA',
      status: '🟢 ออนไลน์ปกติ'
    };

    const finDeskGroup = new THREE.Group();
    finDeskGroup.add(
      maintAt(maintBox(pcW, 0.04, pcD, 0xe0f2fe), pcCX, 0.025, pcCZ),
      maintAt(maintBox(pcW - 0.25, 0.74, 0.85, 0x334155), pcCX, 0.37, pcCZ - 0.12),
      maintAt(maintBox(pcW - 0.18, 0.06, 0.92, 0xf8fafc), pcCX, 0.76, pcCZ - 0.12),
      maintAt(maintBox(0.62, 0.38, 0.05, 0x0f172a), pcCX - 0.45, 1.04, pcCZ - 0.32),
      maintAt(maintBox(0.56, 0.32, 0.02, 0x38bdf8), pcCX - 0.45, 1.04, pcCZ - 0.29),
      maintAt(maintBox(0.16, 0.12, 0.14, 0x475569), pcCX - 0.45, 0.83, pcCZ - 0.32),
      maintAt(maintBox(0.4, 0.02, 0.15, 0x1e293b), pcCX - 0.45, 0.8, pcCZ + 0.04),
      maintAt(maintBox(0.24, 0.44, 0.46, 0x1e293b), pcCX + 0.35, 1.0, pcCZ - 0.18),
      maintAt(maintBox(0.42, 0.26, 0.38, 0x64748b), pcCX + 1.05, 0.92, pcCZ - 0.15),
      maintAt(maintBox(0.5, 0.46, 0.5, 0x2563eb), pcCX - 0.45, 0.23, pcCZ + 0.52),
      maintAt(maintBox(0.48, 0.48, 0.08, 0x1d4ed8), pcCX - 0.45, 0.65, pcCZ + 0.74)
    );

    finDeskGroup.traverse((child) => {
      if (child.isMesh) child.userData.pcInfo = financePcSpec;
    });
    g.add(finDeskGroup);

    const finStaff = makePerson({
      role: 'nurse',
      shirtColor: 0x2563eb,
      pose: 'sit',
      rotY: Math.PI
    });
    finStaff.position.set(pcCX - 0.45, 0, pcCZ + 0.52);
    g.add(finStaff);

    L.push(
      maintTag(
        '🖥️ โต๊ะคอมการเงิน (คลิกดูสเปก)',
        V(pcCX, 1.75, pcCZ),
        'pc',
        null,
        'คลิกเพื่อดูสเปกคอมพิวเตอร์โต๊ะคอมการเงิน (PC-FIN-01)',
        financePcSpec
      )
    );

    const items = [
      [
        '💰',
        'เค้าเตอร์คิดเงิน (มุมซ้ายบน)',
        financeState.counterOpen ? '🟢 เปิดให้บริการ' : '🔴 พักให้บริการ',
        'finance-counter',
        financeState.counterOpen ? 'free' : 'busy'
      ],
      [
        '🖥️',
        'PC-FIN-01: โต๊ะคอมการเงิน (ด้านบนติดเค้าเตอร์คิดเงิน)',
        'ดูสเปก',
        null,
        'free',
        financePcSpec
      ],
      ['🚪', 'ประตูทางเข้า-ออก (ฝั่งซ้ายล่าง)', '1 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 13,
      title: '💰 ผังภายในอาคารการเงิน: เค้าเตอร์คิดเงิน • โต๊ะคอมการเงิน • ประตู',
      sub: 'คลิกป้าย "เค้าเตอร์คิดเงิน" เพื่อสลับสถานะเปิด/พักให้บริการ • คลิกป้าย "🖥️ โต๊ะคอมการเงิน" เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 12.5, 11.2), target: V(0, 0, 0) }
    };
  }

  function toggleFinanceStatus(id) {
    if (id === 'finance-counter') {
      financeState.counterOpen = !financeState.counterOpen;
      return true;
    }
    return false;
  }

  K.Interiors.register('finance', buildFinanceInterior, toggleFinanceStatus);
})();
