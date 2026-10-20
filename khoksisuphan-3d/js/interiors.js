/* มุมมองภายในอาคาร: ป้อมยาม, ร้านค้าสวัสดิการ, โรงจอดรถ, และ ตึกอุบัติเหตุฉุกเฉิน (PCU & ER) */
(function () {
  const K = window.KSS, M = K.M;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const WALL_H = 2.6, T = 0.1;

  const PALETTE = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x3b82f6, 0xa855f7, 0xec4899, 0xffffff, 0x14b8a6, 0x92400e];
  let prodMats = null;
  const pm = (rnd) => {
    if (!prodMats) prodMats = PALETTE.map((c) => { const m = M.mat(c, { roughness: 0.5 }); m.userData.shared = true; return m; });
    return prodMats[Math.floor(rnd() * prodMats.length)];
  };
  const UNIT = new THREE.BoxGeometry(1, 1, 1); UNIT.userData.shared = true;
  const BOTTLE = new THREE.CylinderGeometry(0.5, 0.5, 1, 10); BOTTLE.userData.shared = true;

  function addEdges(mesh, color = 0x334155) {
    if (!mesh || !mesh.geometry) return mesh;
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 25),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.78 })
    );
    mesh.add(wire);
    return mesh;
  }

  function floor(g, w, d, base, line, tile = 0.5, x = 0, z = 0) {
    const tex = M.tileTexture(base, line, w / tile, d / tile);
    const m = M.box(g, w, 0.1, d, M.mat(0xffffff, { map: tex, roughness: 0.65 }), x, -0.05, z);
    addEdges(m, 0x64748b);
    return m;
  }

  // สร้างพื้นเส้นทางเดิน (Walkway Path) สีฟ้าคาดเส้นขอบขาวและลูกศรนำทางชัดเจน
  function walkwayTexture(repX = 6) {
    const t = M.canvasTexture(256, 128, (c, w, h) => {
      c.fillStyle = '#0284c7';
      c.fillRect(0, 0, w, h);
      // ขอบเส้นขาว-เหลืองสองข้างทางเดิน
      c.fillStyle = '#fef08a';
      c.fillRect(0, 4, w, 10);
      c.fillRect(0, h - 14, w, 10);
      // เส้นประกลางทางเดิน + ลูกศร
      c.strokeStyle = 'rgba(255,255,255,0.75)';
      c.lineWidth = 6;
      c.setLineDash([22, 18]);
      c.beginPath();
      c.moveTo(0, h / 2);
      c.lineTo(w, h / 2);
      c.stroke();
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repX, 1);
    return t;
  }

  function walkwayStrip(g, x, z, len, width, rotY = 0) {
    const tex = walkwayTexture(Math.max(2, Math.round(len / 2.2)));
    const strip = M.box(
      g, len, 0.04, width,
      M.mat(0xffffff, { map: tex, roughness: 0.45 }),
      x, 0.025, z
    );
    strip.rotation.y = rotY;
    addEdges(strip, 0x0369a1);
    return strip;
  }

  // ป้าย 3D แขวนเหนือประตูทางเดิน "แผนกอุบัติเหตุฉุกเฉิน"
  function erDeptSignTexture() {
    return M.canvasTexture(768, 160, (c, w, h) => {
      c.fillStyle = '#b91c1c';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = '#fef08a';
      c.lineWidth = 10;
      c.strokeRect(5, 5, w - 10, h - 10);
      // กากบาทขาวบนพื้นวงกลม
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(85, h / 2, 48, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#dc2626';
      c.fillRect(73, h / 2 - 32, 24, 64);
      c.fillRect(53, h / 2 - 12, 64, 24);
      c.fillStyle = '#ffffff';
      c.textBaseline = 'middle';
      M.fitText(c, 'แผนกอุบัติเหตุฉุกเฉิน (ER)', 155, h / 2 - 18, w - 180, 56, 700);
      c.fillStyle = '#fef08a';
      M.fitText(c, 'EMERGENCY DEPARTMENT • ทางเชื่อมทางเดิน', 158, h / 2 + 34, w - 180, 30, 600);
    });
  }

  // วางสินค้าเรียงเป็นแถวตามแกน x
  function fillRow(parent, rnd, x0, x1, y, z, depth, maxH) {
    let x = x0 + 0.03;
    for (;;) {
      const w = 0.07 + rnd() * 0.08;
      if (x + w > x1 - 0.03) break;
      const h = Math.min(maxH, 0.1 + rnd() * 0.16);
      const m = new THREE.Mesh(UNIT, pm(rnd));
      m.scale.set(w, h, depth);
      m.position.set(x + w / 2, y + h / 2, z);
      parent.add(m);
      x += w + 0.012;
    }
  }

  function shelfUnit(parent, rnd, o) {
    const { len, depth, height, levels, x, z, rotY = 0, double = false } = o;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    parent.add(g);
    const mt = M.mat(0xe5e7eb, { roughness: 0.5, metalness: 0.3 });
    M.box(g, len, height, 0.04, mt, 0, height / 2, double ? 0 : -depth / 2 + 0.02);
    M.box(g, 0.04, height, depth, mt, -len / 2, height / 2, 0);
    M.box(g, 0.04, height, depth, mt, len / 2, height / 2, 0);
    const gap = (height - 0.1) / levels;
    for (let i = 0; i < levels; i++) {
      const y = 0.08 + i * gap;
      M.box(g, len, 0.03, depth, mt, 0, y, 0);
      const maxH = gap - 0.06;
      if (double) {
        fillRow(g, rnd, -len / 2, len / 2, y + 0.015, depth / 4, depth / 2 - 0.08, maxH);
        fillRow(g, rnd, -len / 2, len / 2, y + 0.015, -depth / 4, depth / 2 - 0.08, maxH);
      } else {
        fillRow(g, rnd, -len / 2, len / 2, y + 0.015, 0.02, depth - 0.1, maxH);
      }
    }
    M.box(g, len, 0.03, depth, mt, 0, height, 0);
    return g;
  }

  // ตู้แช่เครื่องดื่ม
  function cooler(parent, rnd, x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = Math.PI / 2;
    parent.add(g);
    const body = M.mat(0xf8fafc, { roughness: 0.4 });
    M.box(g, 1.15, 0.15, 0.7, body, 0, 0.075, 0);
    M.box(g, 1.15, 0.3, 0.7, M.mat(0x1d4ed8), 0, 1.85, 0);
    M.box(g, 0.05, 2.0, 0.7, body, -0.55, 1.0, 0);
    M.box(g, 0.05, 2.0, 0.7, body, 0.55, 1.0, 0);
    M.box(g, 1.15, 2.0, 0.05, body, 0, 1.0, -0.325);
    M.box(g, 1.0, 0.03, 0.02, M.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }), 0, 1.68, 0.3);
    [0.2, 0.55, 0.9, 1.25].forEach((y) => {
      M.box(g, 1.05, 0.02, 0.6, M.mat(0xcbd5e1, { metalness: 0.5 }), 0, y, 0);
      for (let i = 0; i < 9; i++) {
        const b = new THREE.Mesh(BOTTLE, pm(rnd));
        b.scale.set(0.075, 0.24, 0.075);
        b.position.set(-0.46 + i * 0.115, y + 0.13, 0.12);
        g.add(b);
      }
    });
    M.box(g, 1.05, 1.65, 0.03, M.glass(0xdbeafe, 0.22), 0, 0.95, 0.345);
    M.box(g, 0.03, 0.5, 0.04, 0x94a3b8, 0.42, 1.0, 0.37);
    return g;
  }

  function screenTexture(draw) {
    return M.canvasTexture(256, 160, draw);
  }

  // ======================= 3D Person (พยาบาล / หมอ / คนไข้ / ญาติ) =======================
  function makePerson(opts = {}) {
    const {
      role = 'nurse',
      pose = 'sit',
      shirtColor = null,
      rotY = 0
    } = opts;

    const g = new THREE.Group();
    g.rotation.y = rotY;

    const skinM = M.mat(0xfcd5b5, { roughness: 0.7 });
    const hairM = M.mat(0x1f2937, { roughness: 0.8 });
    const topColor = shirtColor || (
      role === 'nurse' ? 0x0ea5e9 :
      role === 'doctor' ? 0xffffff :
      role === 'patient' ? 0x86efac :
      0xf59e0b
    );
    const pantsColor = role === 'nurse' ? 0x0f172a : role === 'doctor' ? 0x1e293b : role === 'patient' ? 0x6ee7b7 : 0x334155;
    const topM = M.mat(topColor, { roughness: 0.6 });
    const pantsM = M.mat(pantsColor, { roughness: 0.7 });

    if (pose === 'lie') {
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), skinM);
      head.position.set(0, 0.72, -0.58);
      g.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM);
      hair.rotation.x = -Math.PI * 0.35;
      hair.position.set(0, 0.74, -0.6);
      g.add(hair);
      M.box(g, 0.38, 0.16, 0.5, topM, 0, 0.64, -0.22);
      M.box(g, 0.1, 0.1, 0.42, skinM, -0.23, 0.62, -0.18);
      M.box(g, 0.1, 0.1, 0.42, skinM, 0.23, 0.62, -0.18);
      const blanket = M.box(g, 0.72, 0.18, 0.92, M.mat(0x38bdf8, { roughness: 0.65 }), 0, 0.64, 0.36);
      addEdges(blanket, 0x0284c7);
      return g;
    }

    if (pose === 'sit') {
      M.box(g, 0.32, 0.12, 0.34, pantsM, 0, 0.48, 0.05);
      M.box(g, 0.11, 0.38, 0.11, pantsM, -0.09, 0.25, 0.18);
      M.box(g, 0.11, 0.38, 0.11, pantsM, 0.09, 0.25, 0.18);
      M.box(g, 0.34, 0.44, 0.22, topM, 0, 0.74, -0.02);
      M.box(g, 0.09, 0.28, 0.24, topM, -0.21, 0.68, 0.08);
      M.box(g, 0.09, 0.28, 0.24, topM, 0.21, 0.68, 0.08);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 14), skinM);
      head.position.set(0, 1.09, 0);
      g.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM);
      hair.position.set(0, 1.11, -0.01);
      g.add(hair);
      if (role === 'nurse') {
        M.box(g, 0.18, 0.06, 0.1, M.mat(0xffffff), 0, 1.25, 0.02);
        M.box(g, 0.16, 0.015, 0.105, M.mat(0xdc2626), 0, 1.25, 0.02);
        M.box(g, 0.07, 0.09, 0.01, M.mat(0xffffff), 0.07, 0.8, 0.1);
      }
      return g;
    }

    // ท่ายืน (pose === 'stand')
    M.box(g, 0.12, 0.62, 0.12, pantsM, -0.08, 0.31, 0);
    M.box(g, 0.12, 0.62, 0.12, pantsM, 0.08, 0.31, 0);
    M.box(g, 0.34, 0.5, 0.22, topM, 0, 0.87, 0);
    M.box(g, 0.09, 0.42, 0.1, topM, -0.22, 0.85, 0.04);
    M.box(g, 0.09, 0.42, 0.1, topM, 0.22, 0.85, 0.04);
    if (role === 'nurse') {
      M.box(g, 0.18, 0.24, 0.02, M.mat(0xfbbf24), 0.22, 0.76, 0.14);
    }
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 14), skinM);
    head.position.set(0, 1.25, 0);
    g.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM);
    hair.position.set(0, 1.27, -0.01);
    g.add(hair);
    if (role === 'nurse') {
      M.box(g, 0.18, 0.06, 0.1, M.mat(0xffffff), 0, 1.41, 0.02);
      M.box(g, 0.16, 0.015, 0.105, M.mat(0xdc2626), 0, 1.41, 0.02);
      M.box(g, 0.07, 0.09, 0.01, M.mat(0xffffff), 0.07, 0.96, 0.12);
    }
    return g;
  }

  // ======================= ป้อมยาม 4x4 =======================
  function guard() {
    const g = new THREE.Group();
    const L = [];
    floor(g, 4, 4, '#e7e5e4', '#cfcac4', 0.5);
    const wallM = M.mat(0xf1f5f9), lowM = M.mat(0xe2e8f0);
    M.box(g, 4, WALL_H, T, wallM, 0, WALL_H / 2, -2 + T / 2);
    M.box(g, T, WALL_H, 4, wallM, -2 + T / 2, WALL_H / 2, 0);
    M.box(g, T, 1.0, 4, lowM, 2 - T / 2, 0.5, 0);
    M.box(g, 0.03, 1.2, 3.4, M.glass(), 2 - T / 2, 1.6, 0);
    M.box(g, 2.4, 1.0, T, lowM, -0.8, 0.5, 2 - T / 2);
    M.box(g, 0.6, 1.0, T, lowM, 1.7, 0.5, 2 - T / 2);
    const pivot = new THREE.Group();
    pivot.position.set(0.45, 0, 2 - T / 2);
    const door = M.box(pivot, 0.9, 2.1, 0.05, 0x64748b, 0.45, 1.05, 0);
    door.castShadow = true;
    pivot.rotation.y = -1.2;
    g.add(pivot);

    const wood = M.mat(0xb08355, { roughness: 0.6 }), metal = M.mat(0x374151, { metalness: 0.5 });
    const dz = -1.55;
    M.box(g, 1.4, 0.05, 0.7, wood, 0, 0.75, dz);
    [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].forEach(([x, z]) => M.box(g, 0.05, 0.73, 0.05, metal, x, 0.365, dz + z));
    M.box(g, 0.45, 0.4, 0.6, wood, -0.45, 0.48, dz);

    const dark = M.mat(0x111827, { roughness: 0.4 });
    M.box(g, 0.25, 0.02, 0.18, dark, 0, 0.785, -1.72);
    M.box(g, 0.04, 0.25, 0.04, dark, 0, 0.9, -1.74);
    M.box(g, 0.62, 0.38, 0.03, dark, 0, 1.13, -1.72);
    const scr = screenTexture((c, w, h) => {
      c.fillStyle = '#0f172a'; c.fillRect(0, 0, w, h);
      const cols = ['#334155', '#1e3a5f', '#3f3f46', '#1f2937'];
      for (let i = 0; i < 4; i++) {
        const x = (i % 2) * (w / 2), y = Math.floor(i / 2) * (h / 2);
        c.fillStyle = cols[i]; c.fillRect(x + 4, y + 4, w / 2 - 8, h / 2 - 8);
        c.fillStyle = '#22c55e'; c.font = '600 16px sans-serif'; c.fillText('CAM ' + (i + 1), x + 12, y + 24);
      }
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.34), new THREE.MeshBasicMaterial({ map: scr }));
    screen.position.set(0, 1.13, -1.703);
    g.add(screen);
    M.box(g, 0.45, 0.02, 0.15, dark, 0, 0.785, -1.38);
    M.box(g, 0.06, 0.025, 0.1, dark, 0.33, 0.787, -1.38);
    M.box(g, 0.2, 0.42, 0.45, M.mat(0x1f2937), 0.45, 0.21, dz);
    M.box(g, 0.02, 0.02, 0.01, M.mat(0x22c55e, { emissive: 0x22c55e }), 0.5, 0.36, dz + 0.226);

    const chair = M.mat(0x1f2937);
    M.box(g, 0.5, 0.08, 0.5, chair, 0, 0.48, -0.85);
    M.box(g, 0.5, 0.55, 0.06, chair, 0, 0.82, -0.6);
    M.cyl(g, 0.03, 0.03, 0.4, metal, 0, 0.24, -0.85, 8);
    M.cyl(g, 0.3, 0.3, 0.04, metal, 0, 0.04, -0.85, 5);

    const guardStaff = makePerson({ role: 'relative', shirtColor: 0x1e3a8a, pose: 'sit', rotY: Math.PI });
    guardStaff.position.set(0, 0, -0.85);
    g.add(guardStaff);

    const clock = M.cyl(g, 0.16, 0.16, 0.04, M.mat(0xffffff), 1.2, 2.05, -1.93, 24);
    clock.rotation.x = Math.PI / 2;

    const guardPcInfo = {
      code: 'PC-SEC-01',
      name: 'คอมพิวเตอร์ป้อมยามรักษาความปลอดภัย',
      role: 'เจ้าหน้าที่ รปภ. ตรวจสอบกล้องวงจรปิด (CCTV) และบันทึกทะเบียนรถเข้า-ออก',
      cpu: 'Intel Core i5-12400',
      ram: '16 GB DDR4',
      storage: 'SSD 512 GB + HDD 4 TB (CCTV)',
      monitor: '24" IPS Full HD (4-Ch Split View)',
      ip: '192.168.10.201 (🟢 ออนไลน์)',
      software: 'ระบบกล้องวงจรปิด KSS-CCTV VMS • ระบบบันทึกผู้มาติดต่อและทะเบียนรถอัตโนมัติ'
    };

    L.push({ text: '🖥️ โต๊ะคอม (คลิกดูสเปก)', pos: V(0, 1.6, -1.72), cls: 'int-label pc-tag', pcInfo: guardPcInfo });
    L.push({ text: '👮 เจ้าหน้าที่ รปภ.', pos: V(0, 1.4, -0.75) });
    L.push({ text: '🚪 ประตูทางเข้า', pos: V(1.3, 2.4, 2.5) });
    L.push({ text: '🪟 หน้าต่างกระจก', pos: V(2, 2.45, -0.8) });
    L.push({ text: '↔ 4 ม.', pos: V(0, 0.05, 2.55), cls: 'int-label dim' });
    L.push({ text: '↕ 4 ม.', pos: V(2.55, 0.05, 0.8), cls: 'int-label dim' });

    return {
      group: g, labels: L, size: 4,
      title: '👮 ภายในป้อมยาม', sub: 'ห้องขนาด 4 × 4 เมตร • คลิกที่ป้ายโต๊ะคอมเพื่อดูรายละเอียดคอมพิวเตอร์',
      items: [
        ['🖥️', 'โต๊ะคอมพิวเตอร์ CCTV (คลิกดูสเปก)', '1 เครื่อง', null, 'free', guardPcInfo],
        ['👮', 'เจ้าหน้าที่รักษาความปลอดภัย', '1 คน'],
        ['🚪', 'ประตูทางเข้า', '1 บาน'],
        ['🪟', 'หน้าต่างกระจกมองถนน', '1 ช่อง']
      ],
      cam: { pos: V(5.2, 5, 6.2), target: V(0, 0.8, 0) }
    };
  }

  // ======================= ร้านค้าสวัสดิการ 6x3 =======================
  function shop() {
    const g = new THREE.Group();
    const L = [];
    const rnd = M.rng(4242);
    floor(g, 6, 3, '#f5f5f4', '#d6d3d1', 0.5);
    const wallM = M.mat(0xfefce8), lowM = M.mat(0xe7e5e4), glass = M.glass();
    M.box(g, 6, WALL_H, T, wallM, 0, WALL_H / 2, -1.5 + T / 2);
    M.box(g, T, WALL_H, 3, wallM, -3 + T / 2, WALL_H / 2, 0);
    M.box(g, T, 1.0, 3, lowM, 3 - T / 2, 0.5, 0);
    M.box(g, 4.0, 0.3, T, lowM, -1.0, 0.15, 1.5 - T / 2);
    M.box(g, 4.0, 1.9, 0.03, glass, -1.0, 1.25, 1.5 - T / 2);
    M.box(g, 1.1, 0.3, T, lowM, 2.45, 0.15, 1.5 - T / 2);
    M.box(g, 1.1, 1.9, 0.03, glass, 2.45, 1.25, 1.5 - T / 2);
    M.box(g, 6, 0.25, 0.02, M.mat(0x16a34a), 0, 2.45, -1.5 + T + 0.01);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.34), new THREE.MeshBasicMaterial({ map: M.shopSignTexture() }));
    sign.position.set(-0.6, 2.05, -1.39);
    g.add(sign);

    shelfUnit(g, rnd, { len: 3.2, depth: 0.45, height: 1.75, levels: 4, x: -0.6, z: -1.175 });
    shelfUnit(g, rnd, { len: 2.2, depth: 0.6, height: 1.3, levels: 3, x: -0.4, z: 0.15, double: true });
    cooler(g, rnd, -2.55, -0.8);
    cooler(g, rnd, -2.55, 0.4);

    M.box(g, 0.9, 0.8, 0.6, M.mat(0xffffff, { roughness: 0.3 }), 1.6, 0.4, -1.05);
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(UNIT, pm(rnd));
      m.scale.set(0.14, 0.06, 0.1);
      m.position.set(1.25 + (i % 5) * 0.17, 0.83, -1.18 + Math.floor(i / 5) * 0.25);
      g.add(m);
    }
    M.box(g, 0.86, 0.02, 0.56, M.glass(0xe0f2fe, 0.35), 1.6, 0.88, -1.05);
    M.box(g, 0.9, 0.15, 0.03, M.mat(0x2563eb), 1.6, 0.7, -0.74);

    const wood = M.mat(0xa16207, { roughness: 0.6 });
    M.box(g, 0.6, 1.0, 1.2, wood, 2.5, 0.5, 0.3);
    M.box(g, 0.7, 0.04, 1.3, M.mat(0xf5f5f4), 2.5, 1.02, 0.3);
    M.box(g, 0.32, 0.12, 0.3, M.mat(0x1f2937), 2.55, 1.1, 0.1);
    const posScr = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), new THREE.MeshBasicMaterial({ map: screenTexture((c, w, h) => {
      c.fillStyle = '#0ea5e9'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff'; c.font = '700 40px sans-serif'; c.fillText('฿ 0.00', 30, 95);
    }) }));
    posScr.position.set(2.42, 1.3, 0.1);
    posScr.rotation.y = -Math.PI / 2;
    g.add(posScr);
    M.box(g, 0.03, 0.2, 0.3, M.mat(0x1f2937), 2.43, 1.3, 0.1);
    M.box(g, 0.12, 0.04, 0.18, M.mat(0x334155), 2.5, 1.06, 0.6);
    shelfUnit(g, rnd, { len: 0.9, depth: 0.25, height: 0.8, levels: 2, x: 2.06, z: 0.3, rotY: -Math.PI / 2 });

    const cashier = makePerson({ role: 'relative', shirtColor: 0x16a34a, pose: 'stand', rotY: -Math.PI / 2 });
    cashier.position.set(2.8, 0, 0.3);
    g.add(cashier);

    for (let i = 0; i < 4; i++) M.box(g, 0.45, 0.06, 0.32, M.mat(0xdc2626), 1.3, 0.05 + i * 0.07, 1.1);

    L.push({ text: '🧃 ตู้แช่เครื่องดื่ม', pos: V(-2.55, 2.25, -0.2) });
    L.push({ text: '🛒 ชั้นวางสินค้า/ของใช้', pos: V(-0.6, 2.0, -1.2) });
    L.push({ text: '🍪 ชั้นวางขนม (กลางร้าน)', pos: V(-0.4, 1.55, 0.15) });
    L.push({ text: '🍦 ตู้ไอศกรีม', pos: V(1.6, 1.15, -1.05) });
    L.push({ text: '💵 เคาน์เตอร์คิดเงิน', pos: V(2.5, 1.65, 0.3) });
    L.push({ text: '🧺 ตะกร้า', pos: V(1.3, 0.6, 1.1) });
    L.push({ text: '🚪 ทางเข้า', pos: V(1.45, 0.4, 1.85) });
    L.push({ text: '↔ 6 ม.', pos: V(-1.5, 0.05, 2.1), cls: 'int-label dim' });
    L.push({ text: '↕ 3 ม.', pos: V(3.5, 0.05, -0.6), cls: 'int-label dim' });

    return {
      group: g, labels: L, size: 6,
      title: '🏪 ภายในร้านค้าสวัสดิการ', sub: 'ตัวอาคารขนาด 6 × 3 เมตร • รูปแบบร้านสะดวกซื้อ',
      items: [
        ['🧃', 'ตู้แช่เครื่องดื่มประตูกระจก', '2 ตู้'],
        ['🛒', 'ชั้นวางสินค้าติดผนัง (4 ชั้น)', '1 ชุด'],
        ['🍪', 'ชั้นวางสินค้ากลางร้าน (2 ด้าน)', '1 ชุด'],
        ['🍦', 'ตู้แช่ไอศกรีม', '1 ตู้'],
        ['💵', 'เคาน์เตอร์คิดเงิน + เครื่อง POS', '1 ชุด'],
        ['💳', 'เครื่องรูดบัตร', '1 เครื่อง'],
        ['🧺', 'ตะกร้าใส่สินค้า', '4 ใบ']
      ],
      cam: { pos: V(5.5, 6, 7), target: V(0, 0.6, 0) }
    };
  }

  // ======================= โรงจอดรถ =======================
  function parking(b) {
    const cp = M.buildCarport(b.w, b.d, { seed: M.hash(b.id), transparentRoof: true });
    const L = [];
    cp.slots.forEach((s) => { if (!s.occupied) L.push({ text: '🅿️ ว่าง', pos: V(s.x, 0.3, s.z), cls: 'int-label free' }); });
    const free = cp.total - cp.parked;
    L.push({ text: `🚗 จอดอยู่ ${cp.parked} คัน • ว่าง ${free} ช่อง`, pos: V(0, 4.4, 0), cls: 'int-label dim' });
    L.push({ text: `↔ ${b.w} ม.`, pos: V(0, 0.1, b.d / 2 + 1.2), cls: 'int-label dim' });
    L.push({ text: `↕ ${b.d} ม.`, pos: V(b.w / 2 + 1.2, 0.1, 0), cls: 'int-label dim' });
    const size = Math.max(b.w, b.d);
    return {
      group: cp.group, labels: L, size,
      title: '🚗 ภายใน' + b.name, sub: `ที่จอดรถทั่วไป • ขนาด ${b.w} × ${b.d} เมตร`,
      items: [
        ['🚗', 'รถที่จอดอยู่ (เก๋ง/กระบะ)', `${cp.parked} คัน`],
        ['🅿️', 'ช่องจอดว่าง', `${free} ช่อง`],
        ['📐', 'ช่องจอดทั้งหมด', `${cp.total} ช่อง`],
        ['🏗️', 'โครงหลังคาเหล็ก + เสา', `${b.w}×${b.d} ม.`]
      ],
      cam: { pos: V(size * 0.45 + 3, size * 0.45 + 5, size * 0.55 + 6), target: V(0, 0.5, 0) }
    };
  }

  // ======================= ตึกอุบัติเหตุฉุกเฉิน (PCU / ER / X-Ray / LAB / ห้องบัตร) =======================
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

    // สร้างโต๊ะทำงาน / โต๊ะคอม (ด้าน +Z ของ dg คือฝั่งหน้าจอที่ชิดกำแพง และพยาบาลนั่งฝั่ง -Z หันหน้าไปทาง +Z เข้าหากำแพง)
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
        // จอคอมพิวเตอร์ชิดฝั่งกำแพง (+Z) หันหน้าจอเข้าหาพยาบาล (-Z)
        const dark = M.mat(0x0f172a);
        const mon = M.box(dg, 0.44, 0.3, 0.03, dark, 0, 0.96, d / 2 - 0.1);
        addEdges(mon, 0x38bdf8);
        // หน้าจอสว่างสีฟ้าแสดงระบบ HIS โรงพยาบาล
        const scrGlow = M.box(dg, 0.4, 0.25, 0.01, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.96, d / 2 - 0.12);
        M.box(dg, 0.05, 0.12, 0.05, dark, 0, 0.8, d / 2 - 0.08);
        M.box(dg, 0.3, 0.02, 0.12, dark, 0, 0.78, -0.02); // คีย์บอร์ด
        M.box(dg, 0.18, 0.38, 0.38, M.mat(0x1e293b), w / 2 - 0.16, 0.2, 0); // เคส CPU
        if (pcInfo) {
          dg.userData.pcInfo = pcInfo;
          deskTop.userData.pcInfo = pcInfo;
          mon.userData.pcInfo = pcInfo;
          scrGlow.userData.pcInfo = pcInfo;
          pcList.push(pcInfo);
        }
      }

      // เก้าอี้ + พยาบาลประจำโต๊ะ (นั่งฝั่ง -Z หันหน้าไปทาง +Z เข้าหาจอคอมและกำแพง)
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

    // สร้างเตียงคนไข้มาตรฐานในห้องตรวจ / ห้อง ER
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

    // สร้าง "เตียงแบบรถเข็น" (Wheeled Stretcher / Gurney) สำหรับ 3 เตียงด้านนอก ER
    function stretcherBed(opts) {
      const { x, z, rotY = 0, num = 1 } = opts;
      const sg = new THREE.Group();
      sg.position.set(x, 0, z);
      sg.rotation.y = rotY;

      const bw = 0.76, bd = 1.85;
      const steelM = M.mat(0xcbd5e1, { metalness: 0.7, roughness: 0.25 });
      const wheelM = M.mat(0x1e293b, { roughness: 0.8 });
      const padM = M.mat(0x0284c7, { roughness: 0.45 });

      // ล้อรถเข็น 4 ล้อ + ขาตั้งล้อ
      [[-bw / 2 + 0.08, -bd / 2 + 0.2], [bw / 2 - 0.08, -bd / 2 + 0.2],
       [-bw / 2 + 0.08, bd / 2 - 0.2],  [bw / 2 - 0.08, bd / 2 - 0.2]].forEach(([wx, wz]) => {
        const w = M.cyl(sg, 0.1, 0.1, 0.05, wheelM, wx, 0.1, wz, 14);
        w.rotation.z = Math.PI / 2;
        M.cyl(sg, 0.025, 0.025, 0.48, steelM, wx, 0.34, wz, 8);
      });

      // โครงฐานล้อและคานไขว้สแตนเลส
      M.box(sg, bw - 0.1, 0.04, bd - 0.3, steelM, 0, 0.22, 0);
      const topFrame = M.box(sg, bw, 0.06, bd, steelM, 0, 0.58, 0);
      addEdges(topFrame, 0x475569);

      // เบาะเตียงรถเข็น + พนักพิงศีรษะยกเฉียง
      const pad = M.box(sg, bw - 0.06, 0.09, bd - 0.45, padM, 0, 0.65, 0.18);
      addEdges(pad, 0x0369a1);
      const headPad = M.box(sg, bw - 0.06, 0.09, 0.42, padM, 0, 0.72, -bd / 2 + 0.24);
      headPad.rotation.x = 0.35;
      addEdges(headPad, 0x0369a1);

      // ราวกันตกสแตนเลส 2 ข้างเตียงรถเข็น
      [-bw / 2 + 0.02, bw / 2 - 0.02].forEach((rx) => {
        M.box(sg, 0.03, 0.03, bd * 0.62, steelM, rx, 0.86, 0.05);
        M.box(sg, 0.025, 0.26, 0.025, steelM, rx, 0.73, -bd * 0.25);
        M.box(sg, 0.025, 0.26, 0.025, steelM, rx, 0.73, bd * 0.32);
      });

      // ด้ามจับเข็นเตียงด้านหัวเตียง
      M.box(sg, bw * 0.85, 0.035, 0.035, steelM, 0, 0.82, -bd / 2 - 0.06);

      g.add(sg);
      L.push({ text: `🛞 เตียงรถเข็น ${num}`, pos: V(x, 1.25, z), cls: 'int-label sub-tag' });
      return sg;
    }

    // Helper สร้างข้อมูลสเปกคอมพิวเตอร์แต่ละจุด
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

    // =========================================================================
    // 2. ก่อผนังตามผัง ตึกอุบัติเหตุฉุกเฉินER-PCU.png
    // =========================================================================
    wall(-16, -7, 14, -7, 0.24, WH, true);
    wall(-16, -7, -16, 7, 0.24, WH, true);
    wall(-16, 7, -8.0, 7, 0.24, WH, true);
    wall(-6.2, 7, -0.4, 7, 0.24, WH, true);
    wall(1.2, 7, 14, 7, 0.24, WH, true);
    wall(14, -7, 14, -1.8, 0.24, WH, true);
    wall(14, 0.4, 14, 7, 0.24, WH, true);
    wall(-1.5, -7, -1.5, 7, 0.22, WH, true);

    // =========================================================================
    // 3. รายละเอียดภายในฝั่งซ้าย: กลุ่มงาน PCU (X: -16 .. -1.5)
    // =========================================================================
    wall(-12.4, -7, -12.4, 7, 0.14, WH);
    wall(-16, -2.4, -12.4, -2.4, 0.14, WH);
    wall(-16, 2.2, -12.4, 2.2, 0.14, WH);

    const r1 = erPcuState.pcuRooms[0];
    const r2 = erPcuState.pcuRooms[1];
    const r3 = erPcuState.pcuRooms[2];

    // --- ห้องตรวจ 3 (บนซ้าย: Z -7 .. -2.4) ---
    hospitalBed({ x: -14.3, z: -5.9, rotY: Math.PI / 2, occupied: r3.occupied, isSmall: true });
    L.push({ text: 'เตียง', pos: V(-14.3, 1.0, -5.9), cls: 'int-label sub-tag' });
    workDesk({ x: -14.3, z: -3.1, w: 1.2, d: 0.6, rotY: 0, hasPC: false, label: 'โต๊ะ', hasVisitor: r3.occupied });
    L.push({
      text: `ห้องตรวจ 3: ${r3.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง'}`,
      pos: V(-14.2, 2.15, -4.5),
      cls: `int-label ${r3.occupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'pcu-3'
    });

    // --- ห้องตรวจ 2 (กลางซ้าย: Z -2.4 .. +2.2) โต๊ะคอมชิดผนังล่าง หันหน้าเข้ากำแพง (rotY: 0) ---
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

    // --- ห้องตรวจ 1 (ล่างซ้าย: Z +2.2 .. +7.0) ---
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

    // --- โถงซ้ายหน้าห้องตรวจ (X: -12.4 .. -9.5) โต๊ะคอมชิดผนังขวา หันหน้าเข้ากำแพงขวา (rotY: Math.PI / 2) ---
    wall(-9.5, -7, -9.5, 1.8, 0.16, WH);
    wall(-9.5, 3.4, -9.5, 7, 0.16, WH);
    doorWay(-9.5, 2.6, Math.PI / 2, 1.2);
    workDesk({
      x: -10.05, z: -3.6, w: 1.15, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-PCU-02', 'โต๊ะคอมจุดคัดกรองหน้าห้องตรวจ PCU', 'พยาบาลวิชาชีพคัดกรองและส่งตรวจห้องตรวจ 1-3', '102', 'ระบบ HOSxP Screening • ระบบเรียกคิวหน้าห้องตรวจ PCU')
    });

    // --- โถงกลาง PCU & ห้อง X-Ray PCU (X: -9.5 .. -4.8) ---
    wall(-8.8, -7, -8.8, -4.4, 0.16, WH);
    wall(-8.8, -4.4, -5.5, -4.4, 0.16, WH);
    wall(-5.5, -7, -5.5, -4.4, 0.16, WH);
    M.box(g, 1.8, 0.55, 0.9, M.mat(0x94a3b8), -7.15, 0.275, -5.8);
    M.cyl(g, 0.15, 0.15, 1.5, M.mat(0x475569), -7.15, 0.75, -6.4, 12);
    L.push({ text: '🩻 ห้อง X-Ray PCU', pos: V(-7.15, 1.85, -5.7), cls: 'int-label room-title' });

    // โต๊ะคอมฝั่งซ้ายโถงกลาง 3 โต๊ะ ชิดกำแพงซ้าย (X = -9.5) หันหน้าเข้ากำแพงซ้าย (rotY: -Math.PI / 2)
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

    // โต๊ะคอมฝั่งขวาโถงกลาง 1 โต๊ะ ชิดกำแพงขวา (X = -4.8) หันหน้าเข้ากำแพงขวา (rotY: Math.PI / 2)
    workDesk({
      x: -5.35, z: -1.2, w: 1.1, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม',
      pcInfo: makePcSpec('PC-PCU-06', 'โต๊ะคอมพิวเตอร์ประสานงาน PCU', 'พยาบาลประสานงานส่งต่อและเยี่ยมบ้าน', '106', 'ระบบ Thai Refer • ระบบเยี่ยมบ้าน (Home Health Care)')
    });

    doorWay(-7.1, 7.0, 0, 1.4);
    workDesk({ x: -5.4, z: 6.3, w: 1.0, d: 0.6, rotY: 0, hasPC: false, label: 'โต๊ะ' });

    // --- โซนขวาของ PCU (X: -4.8 .. -1.5) ---
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

    // =========================================================================
    // 4. รายละเอียดภายในฝั่งขวา: แผนกอุบัติเหตุฉุกเฉิน ER (X: -1.5 .. +14.0)
    // =========================================================================
    // 1) ห้องพักเจ้าหน้าที่ (บนซ้ายของ ER: X -1.5 .. +5.6, Z -7.0 .. -2.6)
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

    // 2) ห้องเก็บอุปกรณ์ (มุมบนขวาของ ER: X 10.0 .. 14.0, Z -7.0 .. -2.8)
    wall(10.0, -7.0, 10.0, -2.8, 0.16, WH);
    wall(10.0, -2.8, 14.0, -2.8, 0.16, WH);
    doorWay(11.6, -2.8, 0, 1.05);
    L.push({ text: '📦 ห้องเก็บอุปกรณ์', pos: V(12.3, 1.95, -5.4), cls: 'int-label room-title' });
    M.box(g, 2.4, 1.4, 0.5, M.mat(0x94a3b8), 12.5, 0.7, -6.5);

    // *** ย้าย "โต๊ะ" ที่มีเครื่องหมายสีแดงเข้าไปไว้ใน "ห้องเก็บอุปกรณ์" ตรงจุดสีแดง (ชิดผนังซ้ายในห้องเก็บอุปกรณ์ X = 10.7, Z = -4.6) ***
    workDesk({
      x: 10.65, z: -4.6, w: 1.15, d: 0.6, rotY: -Math.PI / 2,
      hasPC: false, label: 'โต๊ะ'
    });

    // 3) โต๊ะคอม 4 โต๊ะเรียงแนวตั้งชิดกำแพงซ้ายของห้องเก็บอุปกรณ์ (X = 9.42, กำแพงอยู่ที่ X = 10.0)
    // หันหน้าเข้ากำแพงทั้งหมด (rotY: Math.PI / 2 -> พยาบาลนั่งฝั่งซ้าย หันหน้าไปทางขวาเข้าหากำแพง)
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

    // 4) เส้นทางเดินกลาง ER & ประตูทางเข้าหลังที่มีป้ายเชื่อมทางเดิน "แผนกอุบัติเหตุฉุกเฉิน"
    L.push({ text: '➔ เส้นทางเดินภายใน ER', pos: V(5.8, 0.35, -0.7), cls: 'int-label walkway-tag' });
    doorWay(14.0, -0.7, Math.PI / 2, 2.1); // ประตูใหญ่เชื่อมทางเดินฝั่งขวา
    doorWay(0.4, 7.0, 0, 1.4);              // ประตูล่างของ ER

    // ป้าย 3D แขวนเหนือประตูทางเข้าเชื่อมทางเดิน "แผนกอุบัติเหตุฉุกเฉิน"
    const signBoardMat = new THREE.MeshStandardMaterial({ map: erDeptSignTexture(), roughness: 0.4 });
    const sideSignMat = M.mat(0x991b1b);
    const erSignMesh = M.box(
      g, 0.16, 0.78, 3.4,
      [signBoardMat, signBoardMat, sideSignMat, sideSignMat, sideSignMat, sideSignMat],
      14.0, 2.25, -0.7
    );
    addEdges(erSignMesh, 0xfef08a);
    // เสาค้ำป้ายเหนือประตูเชื่อมทางเดิน
    M.box(g, 0.2, 0.65, 0.2, M.mat(0x334155), 14.0, 1.85, -2.25);
    M.box(g, 0.2, 0.65, 0.2, M.mat(0x334155), 14.0, 1.85, 0.85);
    L.push({
      text: '🚑 ป้ายเชื่อมทางเดิน: แผนกอุบัติเหตุฉุกเฉิน',
      pos: V(14.0, 2.95, -0.7),
      cls: 'int-label er-sign'
    });

    // 5) เตียงฉุกเฉิน ER 6 เตียง (เตียง 6 ถึง เตียง 1 เรียงจากซ้ายไปขวา สลับความสูงป้ายไม่ให้ซ้อนทับกัน)
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

    // 6) โต๊ะคอม 2 โต๊ะฝั่งขวาของเตียง 1 ชิดกำแพงขวา (X = 13.38, กำแพงอยู่ที่ X = 14.0)
    // หันหน้าเข้ากำแพงขวาให้หมด (rotY: Math.PI / 2 -> พยาบาลนั่งฝั่งซ้าย หันหน้าเข้าหากำแพงขวา)
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

    // =========================================================================
    // 5. โซนขวาสุดนอกตัวตึก: จุดซักประวัติ, รถเข็น, ทางเดิน, จุดพ่นยา, ที่นั่งคอย, เตียงรถเข็น 3 เตียง
    // =========================================================================
    // 1) จุดซักประวัติ (X: 15.0, Z: 1.2 .. 6.2)
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

    // 2) รถเข็นผู้ป่วย 2 คัน (X: 17.0, Z: 3.0 และ 4.8)
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

    // 3) ทางเดินเชื่อมเข้าประตูใหญ่ฝั่งขวา
    L.push({ text: '⬅ เส้นทางเดินเข้าแผนกอุบัติเหตุฉุกเฉิน', pos: V(17.5, 0.35, -0.7), cls: 'int-label walkway-tag' });

    // 4) จุดพ่นยา (X: 15.4, Z: -5.6)
    const nebBox = M.box(g, 1.6, 0.85, 1.4, M.mat(0xe0f2fe), 15.4, 0.425, -5.6);
    addEdges(nebBox, 0x0284c7);
    const nebNurse = makePerson({ role: 'nurse', pose: 'stand', rotY: 0 });
    nebNurse.position.set(15.0, 0, -6.2);
    g.add(nebNurse);
    const nebPat = makePerson({ role: 'patient', pose: 'sit', rotY: 0 });
    nebPat.position.set(15.7, 0, -5.2);
    g.add(nebPat);
    L.push({ text: '💨 จุดพ่นยา', pos: V(15.4, 1.85, -5.6), cls: 'int-label room-title' });

    // 5) ที่นั่งคอย (X: 18.3, Z: -5.6) พร้อมญาติคนไข้นั่งคอย
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

    // 6) เตียงข้างนอก ER 3 เตียง เปลี่ยนเป็น "เตียงแบบรถเข็น" (Wheeled Stretcher Beds)
    [16.9, 18.0, 19.1].forEach((bx, idx) => {
      stretcherBed({ x: bx, z: -3.1, rotY: 0, num: idx + 1 });
    });

    // =========================================================================
    // 6. ผังโซนห้อง X-Ray, ห้องบัตร (ด้านเค้าเตอร์ลงทะเบียนผู้มารับบริการ) และ ห้องทำงาน LAB
    //    ปรับมุมหมุน 90° ให้ด้านหน้า "ห้อง X-Ray" กับ "ห้องบัตร ด้านเค้าเตอร์ลงทะเบียนผู้มารับบริการ"
    //    หันหน้าออกไปทางตึก ER (ทิศ -X) โดยมีถนนตัดผ่าหน้าห้อง (X = 22.1) เชื่อมออกสู่ถนนทางหลัก (Z = 10.3)
    // =========================================================================
    const labRoom  = erPcuState.extRooms[0];
    const xrayRoom = erPcuState.extRooms[1];

    // ฟังก์ชันแปลงพิกัดจากผังรูปภาพ (x0: 20.5..42.5, z0: -7.0..+7.0) หมุน 90° ตามเข็มนาฬิกา
    // ให้ด้านล่างของผัง (z0 = +7.0 คือ ห้อง X-Ray & เค้าเตอร์ลงทะเบียนผู้มารับบริการ) หันไปทางซ้าย (-X) เข้าหา ER
    const CX = 33.5, CZ = 0.0;
    const SX = 8.0 / 7.0;   // อัตราส่วนแนวลึก X (กว้าง 16 ม.: X = 25.5 .. 41.5)
    const SZ = 7.0 / 11.0;  // อัตราส่วนแนวกว้าง Z (ลึก 14 ม.: Z = -7.0 .. +7.0 พอดีกับตึก ER)
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

    // --- กรอบผนังหลักของผังฝั่งขวา (หันหน้าทางซ้าย X = 25.5 ออกไปหา ER และทางเดินตัดผ่าหน้าห้อง) ---
    // ผนังด้านหลังสุดฝั่งขวา (เดิมคือผนังบน z0 = -7.0 -> X = 41.5)
    rWall(20.5, -7.0, 29.4, -7.0, 0.22, WH, true);
    rWall(31.0, -7.0, 42.5, -7.0, 0.22, WH, true);
    rDoor(30.2, -7.0, 0, 1.3, true);

    // ผนังด้านบนสุด (เดิมคือผนังซ้าย x0 = 20.5 -> Z = -7.0)
    rWall(20.5, -7.0, 20.5, -2.8, 0.22, WH, true);
    rWall(20.5, -1.4, 20.5,  0.8, 0.22, WH, true);
    rWall(20.5,  2.2, 20.5,  7.0, 0.22, WH, true);
    rDoor(20.5, -2.1, Math.PI / 2, 1.25, true);
    rDoor(20.5,  1.5, Math.PI / 2, 1.25, true);

    // ผนังด้านล่างสุดติดทางเดินหลัก (x0 = 42.5 -> Z = +7.0) + ประตูห้องบัตรเปิดทางเดียวออกทางเดิน
    rWall(42.5, -7.0, 42.5, -3.0, 0.22, WH, true);
    rWall(42.5, -1.4, 42.5,  7.0, 0.22, WH, true);
    rDoor(42.5, -2.2, Math.PI / 2, 1.35, true); // ประตูห้องบัตรติดทางเดิน (ประตูเปิดทางเดียว)

    // ผนังกั้นกลางแบ่งครึ่งบน (LAB: z0 = -7.0 .. 0.0) กับครึ่งล่าง (ห้องบัตร: z0 = -7.0 .. 0.0)
    rWall(31.5, -7.0, 31.5,  0.0, 0.20, WH, true);
    // ผนังกั้นโซนกลางระหว่าง LAB (z0 = 0.0 .. 2.9) กับห้องเครื่อง X-Ray ที่ขยายขึ้นไปถึง x0 = 27.6
    rWall(27.6,  0.0, 31.5,  0.0, 0.18, WH);
    // ผนังกั้นระหว่างห้อง X-Ray ตู้เก็บอุปกรณ์ (บนซ้าย) กับ ห้องเครื่อง X-Ray ที่ขยายเพิ่มความกว้างขึ้นไปที่ x0 = 27.6
    rWall(27.6,  0.0, 27.6,  7.0, 0.20, WH, true);

    // ผนังด้านหน้าสุดที่หันออกไปทาง ER และทางเดินหน้าห้อง (z0 = +7.0 -> X = 25.5)
    rWall(20.5, 7.0, 25.6, 7.0, 0.22, WH, true);
    rWall(27.2, 7.0, 30.2, 7.0, 0.22, WH, true);
    rWall(31.8, 7.0, 40.5, 7.0, 0.22, WH, true);
    rWall(42.0, 7.0, 42.5, 7.0, 0.22, WH, true);
    rDoor(26.4, 7.0, 0, 1.35, true);   // ประตูหน้าห้องโต๊ะคอม X-Ray 1 (เปิดออกทางเดินหน้าห้องฝั่ง ER)
    rDoor(31.0, 7.0, 0, 1.35, true);   // ประตูหน้าห้องเครื่อง X-Ray (เปิดออกทางเดินหน้าห้องฝั่ง ER)
    rDoor(41.25, 7.0, 0, 1.3, true);   // ประตูหน้าห้องเก็บชั้น OPD Card (เปิดออกทางเดินหน้าห้องฝั่ง ER)

    // =========================================================================
    // 6.1 ครึ่งบนของผัง: ห้อง LAB และ ห้อง X-Ray ตู้เก็บอุปกรณ์
    // =========================================================================

    // --- โซนหลังสุดครึ่งบน: "ห้องทำงาน LAB" และ "โต๊ะเจาะเลือด" ---
    // รูปที่ 1: ย้ายประตูจากผนังแนวตั้ง (z0 = -3.8) ไปอยู่บนผนังแนวนอน (x0 = 26.0) ตรงจุดกากบาทสีแดง
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
    // โต๊ะเจาะเลือด หันหน้าไปทางขวา (+X -> rotY: Math.PI)
    rDesk({
      x: 29.5, z: -4.55, w: 1.55, d: 0.65, rotY: Math.PI,
      hasPC: false, label: 'โต๊ะเจาะเลือด', staffRole: 'nurse', hasVisitor: true
    });

    // --- โซนถัดมา: โถงปฏิบัติการ LAB + โต๊ะคอม 3 เครื่อง ---
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
    // โต๊ะคอมห้อง LAB (PC-LAB-04) ชิดกำแพงซ้าย (z0 = -0.3) แล้วหันหน้าไปทางขวา (+X -> rotY: Math.PI)
    rDesk({
      x: 28.2, z: -0.95, w: 1.3, d: 0.62, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-LAB-04', 'โต๊ะคอมพิวเตอร์อนุมัติและรายงานผล LAB', 'นักเทคนิคการแพทย์ยืนยันผลตรวจวิเคราะห์เข้าสู่ระบบแพทย์ (OPD/ER)', '213', 'ระบบ HOSxP LIS Result Approval • ระบบแจ้งเตือนค่าวิกฤต (Critical Value)')
    });

    // --- โซนถัดมา: "โต๊ะคอม Lab 1", "ห้องพักเจ้าหน้าที่", "โต๊ะคอม Lab" ---
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

    // โต๊ะคอม Lab (PC-LAB-06) ชิดกำแพงซ้ายของห้อง (z0 = 2.9) แล้วหันหน้าไปทางขวา (+X -> rotY: Math.PI)
    rDesk({
      x: 26.1, z: 2.25, w: 1.45, d: 0.62, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม Lab', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-LAB-06', 'โต๊ะคอมพิวเตอร์ Lab (บริหารจัดการ/สถิติแล็บ)', 'นักเทคนิคการแพทย์สรุปรายงานสถิติงานชันสูตรและเบิกน้ำยาแล็บ', '215', 'ระบบคลังน้ำยาและเวชภัณฑ์ห้องแล็บ • ระบบรายงานสถิติ HOSxP LIS')
    });

    // --- โซนด้านหน้าสุดฝั่งซ้ายบน (x0: 20.5 .. 27.6, z0: 2.9 .. 7.0): "ตู้เก็บอุปกรณ์", "โต๊ะคอม X-Ray", "โต๊ะคอม X-Ray 1" ---
    const xrayCab = rBox(0.85, 1.55, 3.0, M.mat(0x94a3b8), 21.2, 0.775, 5.0);
    addEdges(xrayCab, 0x334155);
    L.push({ text: '🗄️ ตู้เก็บอุปกรณ์', pos: rV(21.2, 1.8, 5.0), cls: 'int-label sub-tag' });

    rDesk({
      x: 26.3, z: 4.4, w: 1.3, d: 0.62, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม X-Ray', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-XRAY-01', 'โต๊ะคอมพิวเตอร์ X-Ray (ระบบ PACS & วินิจฉัยภาพ)', 'นักรังสีการแพทย์ตรวจสอบคุณภาพภาพเอกซเรย์และส่งต่อระบบ PACS', '216', 'ระบบ PACS Workstation • ระบบจัดการภาพทางการแพทย์ DICOM')
    });

    // โต๊ะคอม X-Ray 1 หันหน้าออกไปทางทางเดินและตึก ER
    rDesk({
      x: 23.8, z: 6.3, w: 1.65, d: 0.65, rotY: 0,
      hasPC: true, label: 'โต๊ะคอม X-Ray 1', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-XRAY-02', 'โต๊ะคอมพิวเตอร์ X-Ray 1 (ลงทะเบียนและนัดหมายเอกซเรย์)', 'เจ้าหน้าที่รังสีการแพทย์รับใบสั่งเอกซเรย์และลงทะเบียนคิวผู้ป่วย', '217', 'ระบบ HOSxP Radiology Queue • ระบบบันทึกข้อมูลผู้ป่วยเอกซเรย์ (RIS)')
    });

    // =========================================================================
    // 6.2 ครึ่งล่างของผัง:
    //     - แบ่งพื้นที่ครึ่งหนึ่ง (50% / 50% ที่ z0 = 0.0 -> X = 33.5) ระหว่าง:
    //       * ด้านหน้า (z0: 0.0 .. +7.0, X: 25.5 .. 33.5): ห้องเครื่อง X-Ray (ขยายความกว้าง x0: 27.6 .. 34.5) และ ห้องเก็บชั้น OPD Card (x0: 34.5 .. 42.5)
    //       * ด้านหลัง (z0: -7.0 .. 0.0, X: 33.5 .. 41.5): ห้องบัตร (x0: 31.5 .. 42.5)
    // =========================================================================

    // ผนังกั้นแบ่งครึ่ง 50% / 50% (z0 = 0.0 -> X = 33.5) ระหว่าง ห้องเก็บชั้น OPD Card กับ ห้องบัตร
    rWall(31.5, 0.0, 40.0, 0.0, 0.18, WH);
    rWall(41.6, 0.0, 42.5, 0.0, 0.18, WH);
    rDoor(40.8, 0.0, 0, 1.35, true);

    // --- (ก) ภายใน "ห้องบัตร" (พื้นที่ครึ่งหลัง 50%: z0 = -7.0 .. 0.0, X = 33.5 .. 41.5) ---
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

    // โต๊ะคอม 4 ชิดกำแพงซ้ายของห้องบัตร (z0 = -1.0) หันหน้าไปทางทิศใต้ (+Z ออกมาทางประตู -> rotY: Math.PI / 2)
    rDesk({
      x: 33.2, z: -1.0, w: 1.45, d: 0.64, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม 4', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-CARD-04', 'โต๊ะคอมพิวเตอร์ 4 (ห้องบัตร - หัวหน้างานเวชระเบียน)', 'หัวหน้างานห้องบัตรควบคุมระบบฐานข้อมูลผู้ป่วยและสถิติผู้รับบริการ', '225', 'ระบบบริหารจัดการเวชระเบียน HOSxP • ระบบรายงาน 43 แฟ้ม กระทรวงสาธารณสุข')
    });

    // โต๊ะในห้องบัตร ชิดกำแพงซ้ายของห้องบัตร (z0 = -0.95) หันหน้าไปทางโต๊ะคอม 3 ทางขวา (+X -> rotY: Math.PI)
    rDesk({
      x: 37.6, z: -0.95, w: 1.4, d: 0.65, rotY: Math.PI,
      hasPC: false, label: 'โต๊ะ', staffRole: 'nurse'
    });

    // --- (ข) ห้องเครื่อง X-Ray ที่ขยายความกว้าง (x0: 27.6 .. 34.5, z0: 0.0 .. 7.0) ---
    rWall(34.5, 0.0, 34.5, 7.0, 0.18, WH);

    // ห้องน้ำ X-Ray และ ห้องเปลี่ยนชุด X-Ray ด้านในห้องเครื่อง X-Ray
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

    // --- (ค) ห้องเก็บชั้น OPD Card: ขยับชั้น OPD Card ออกจากหน้าประตูอีก 20cm เพื่อให้เห็นโต๊ะคอม 1 ชัดเจน ---
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

    // โต๊ะคอม 1 หันหน้าออกไปทางเค้าเตอร์ลงทะเบียนผู้มารับบริการและตึก ER (ทิศ -X)
    rDesk({
      x: 38.4, z: 6.25, w: 1.5, d: 0.64, rotY: 0,
      hasPC: true, label: 'โต๊ะคอม 1', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-CARD-01', 'โต๊ะคอมพิวเตอร์ 1 (เคาน์เตอร์ลงทะเบียนผู้มารับบริการ)', 'เจ้าหน้าที่เวชระเบียนรับลงทะเบียนผู้มารับบริการ ค้นหา OPD Card และออกคิวตรวจ', '221', 'ระบบ HOSxP Front-Desk Registration • ระบบอ่านบัตรประชาชน Smart Card & คิวอัตโนมัติ')
    });

    // เค้าเตอร์ลงทะเบียนผู้มารับบริการ (แถบสีเหลืองด้านหน้าห้อง หันหน้าออกไปทาง ER และทางเดินหน้าห้อง)
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

    // --- สรุปรายการด้านขวา ---
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
    // รายการโต๊ะคอมพิวเตอร์ (คลิกเพื่อดูรายละเอียดสเปกคอมพิวเตอร์ได้)
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

  // ======================= ตึกกายภาพ (ห้องกายภาพบำบัด) =======================
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

    // พื้นห้องกายภาพ ขนาดกว้าง 15.0 ม. (X: -7.5 .. +7.5) ลึก 19.6 ม. (Z: -9.8 .. +9.8)
    floor(g, 15.0, 19.6, '#f8fafc', '#cbd5e1', 1.0, 0, 0);
    // พื้นห้องด้านบน 2 ห้อง (ห้องเก็บอุปกรณ์ & ห้องทำงาน/หัวหน้า)
    floor(g, 7.4, 6.2, '#f1f5f9', '#cbd5e1', 1.0, -3.75, -6.6);
    floor(g, 7.4, 6.2, '#eff6ff', '#bfdbfe', 1.0, 3.75, -6.6);

    // เส้นทางเดินสีน้ำเงินตรงกลางตามผัง (จากประตูล่าง Z = +9.2 ขึ้นไปถึงหน้าประตู 2 ห้องด้านบน Z = -2.8)
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

    function makePcSpec(code, name, role, ipSuffix, software, isNotebook = false) {
      const spec = {
        code,
        name,
        role,
        cpu: isNotebook ? 'Intel Core i7-1355U (Notebook)' : 'Intel Core i5-13500 (14 Cores)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'NVMe M.2 SSD 512 GB',
        monitor: isNotebook ? '15.6" FHD IPS Anti-Glare (Built-in)' : 'Dell 24" IPS Full HD (Eye-Care)',
        os: 'Windows 11 Pro 64-bit (Hospital Domain)',
        ip: `192.168.30.${ipSuffix}`,
        status: '🟢 ออนไลน์ (เชื่อมต่อระบบ HOSxP Rehab)',
        software,
        peripherals: isNotebook ? 'เมาส์ไร้สาย • เครื่องอ่านบัตรประชาชน Smart Card พกพา' : 'เครื่องอ่านบัตรประชาชน Smart Card • เครื่องพิมพ์ใบนัดกายภาพ',
        user: role
      };
      pcList.push(spec);
      return spec;
    }

    // สร้างโต๊ะทำงาน / โต๊ะคอม / โต๊ะ Notebook (ด้าน +Z ของ dg คือฝั่งหน้าจอที่หันเข้าหากำแพง)
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
          // โมเดล Notebook (ฐานคีย์บอร์ด + จอพับเปิด)
          M.box(dg, 0.38, 0.018, 0.26, M.mat(0x475569, { metalness: 0.5 }), 0, 0.755, 0.04);
          const lid = M.box(dg, 0.38, 0.25, 0.015, dark, 0, 0.88, 0.16);
          lid.rotation.x = -0.2;
          const scr = M.box(dg, 0.34, 0.21, 0.016, M.mat(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.88, 0.155);
          scr.rotation.x = -0.2;
        } else {
          // โมเดล PC ตั้งโต๊ะ
          M.box(dg, 0.46, 0.3, 0.03, dark, 0, 0.94, 0.15);
          M.box(dg, 0.42, 0.26, 0.032, M.mat(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 0, 0.94, 0.15);
          M.box(dg, 0.05, 0.12, 0.05, dark, 0, 0.78, 0.15);
          M.box(dg, 0.28, 0.015, 0.1, M.mat(0x334155), 0, 0.755, -0.04);
          M.box(dg, 0.16, 0.36, 0.36, dark, w / 2 - 0.14, 0.52, 0);
        }
      }

      // เก้าอี้และเจ้าหน้าที่นั่งฝั่ง -Z หันหน้าไปทาง +Z (หันหน้าเข้าหากำแพง)
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

    // สร้างเตียงกายภาพบำบัด (พร้อมสถานะ ว่าง / ไม่ว่าง + นักกายภาพและคนไข้เมื่อไม่ว่าง)
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

        // นักกายภาพบำบัดยืนทำหัตถการข้างเตียง
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

    // =========================================================================
    // 1. ผนังกรอบอาคารห้องกายภาพ (X: -7.5 .. +7.5, Z: -9.8 .. +9.8)
    // =========================================================================
    wall(-7.5, -9.8, 7.5, -9.8, 0.2, WH, true);   // ผนังบนสุด
    wall(-7.5, -9.8, -7.5, 9.8, 0.2, WH, true);   // ผนังซ้ายสุด
    wall(7.5, -9.8, 7.5, 9.8, 0.2, WH, true);     // ผนังขวาสุด
    // ผนังล่างสุด เว้นช่องประตูหลักตรงกลาง (X: -1.2 .. +1.2)
    wall(-7.5, 9.8, -1.2, 9.8, 0.2, WH, true);
    wall(1.2, 9.8, 7.5, 9.8, 0.2, WH, true);
    doorWay(0.0, 9.8, 0, 2.2, true); // ประตูหลักทางเข้าด้านล่าง

    // =========================================================================
    // 2. โซนด้านบน: ห้องเก็บอุปกรณ์ (ซ้าย) และ ห้องหัวหน้า/Notebook (ขวา) (Z: -9.8 .. -3.4)
    // =========================================================================
    wall(0.0, -9.8, 0.0, -3.4, 0.16, WH); // ผนังกั้นกลางระหว่างห้องเก็บอุปกรณ์กับห้องหัวหน้า
    // ผนังกั้นด้านล่างของห้องเก็บอุปกรณ์ (เว้นประตูที่ X: -1.6 .. -0.3)
    wall(-7.5, -3.4, -1.6, -3.4, 0.16, WH);
    wall(-0.3, -3.4, 0.0, -3.4, 0.16, WH);
    doorWay(-0.95, -3.4, 0, 1.25, true); // ประตูห้องเก็บอุปกรณ์

    // ผนังกั้นด้านล่างของห้องทำงานฝั่งขวา (เว้นประตูที่ X: +0.3 .. +1.6)
    wall(0.0, -3.4, 0.3, -3.4, 0.16, WH);
    wall(1.6, -3.4, 7.5, -3.4, 0.16, WH);
    doorWay(0.95, -3.4, 0, 1.25, true); // ประตูห้องหัวหน้า/ห้องทำงาน

    // --- 2.1 รายละเอียดภายใน "ห้องเก็บอุปกรณ์" (บนซ้าย: X -7.5 .. 0.0, Z -9.8 .. -3.4) ---
    L.push({ text: '📦 ห้องเก็บอุปกรณ์', pos: V(-3.8, 1.95, -6.5), cls: 'int-label room-title' });
    // ชั้นวางอุปกรณ์กายภาพและเวชภัณฑ์ชิดผนังบนและผนังซ้าย
    const shelfMat = M.mat(0x94a3b8);
    const cab1 = M.box(g, 4.8, 1.45, 0.55, shelfMat, -4.2, 0.725, -9.2);
    addEdges(cab1, 0x334155);
    const cab2 = M.box(g, 0.55, 1.45, 3.6, shelfMat, -6.9, 0.725, -6.5);
    addEdges(cab2, 0x334155);
    // กล่องอุปกรณ์บนชั้น
    [-5.8, -4.6, -3.4, -2.2].forEach((bx, idx) => {
      M.box(g, 0.7, 0.42, 0.42, M.mat(idx % 2 === 0 ? 0x38bdf8 : 0xfbbf24), bx, 1.65, -9.2);
    });

    // --- 2.2 รายละเอียดภายในห้องด้านบนขวา: โต๊ะหัวหน้า, โต๊ะ, กายภาพ Notebook (X 0.0 .. +7.5, Z -9.8 .. -3.4) ---
    // 1) โต๊ะหัวหน้า (มุมบนซ้ายของห้องขวา ให้หัวหน้าหันหน้ามาทางประตูด้านล่าง rotY: 0)
    workDesk({
      x: 1.65, z: -8.1, w: 1.45, d: 0.7, rotY: 0,
      hasPC: true, label: 'โต๊ะหัวหน้า', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-PT-03', 'โต๊ะคอมหัวหน้างานกายภาพบำบัด (โต๊ะหัวหน้า)', 'นักกายภาพบำบัดชำนาญการ (หัวหน้างาน) บริหารจัดการและวางแผนฟื้นฟูผู้ป่วย', '103', 'ระบบ HOSxP Rehab Management • ระบบรายงานตัวชี้วัดฟื้นฟูสมรรถภาพ (KPI)')
    });

    // 2) โต๊ะ (แนวตั้ง หันหน้ามาทางซ้าย rotY: -Math.PI / 2)
    workDesk({
      x: 4.1, z: -5.5, w: 1.4, d: 0.68, rotY: -Math.PI / 2,
      hasPC: false, label: 'โต๊ะ', staffRole: 'nurse'
    });

    // 3) กายภาพ Notebook (แนวตั้ง หันหน้ามาทางซ้าย rotY: -Math.PI / 2)
    workDesk({
      x: 6.35, z: -5.5, w: 1.55, d: 0.68, rotY: -Math.PI / 2,
      hasPC: true, isNotebook: true, label: 'กายภาพ Notebook', staffRole: 'nurse',
      pcInfo: makePcSpec('NB-PT-01', 'โน้ตบุ๊กงานกายภาพบำบัด (กายภาพ Notebook)', 'นักกายภาพบำบัดบันทึกประเมิน ADL และติดตามผู้ป่วยเยี่ยมบ้าน (IMC)', '104', 'ระบบ Intermediate Care (IMC) • ระบบบันทึกการฟื้นฟูสมรรถภาพชุมชน', true)
    });

    // =========================================================================
    // 3. โซนฝั่งซ้าย (X: -7.5 .. -1.2, Z: -3.4 .. +9.8)
    // =========================================================================
    const ptRoom = physioState.rooms[0];

    // 3.1 ห้องทำกายภาพ (ชิดผนังซ้ายตอนบน ใต้ห้องเก็บอุปกรณ์: X -7.5 .. -4.3, Z -2.8 .. +0.4)
    wall(-4.3, -2.8, -4.3, -0.4, 0.14, WH);
    wall(-7.5, 0.4, -4.3, 0.4, 0.14, WH);
    wall(-7.5, -2.8, -4.3, -2.8, 0.14, WH);
    physioBed({
      x: -5.9, z: -1.2, rotY: Math.PI / 2,
      occupied: ptRoom.occupied,
      label: 'ห้องทำกายภาพ',
      statusId: ptRoom.id,
      labelY: 2.05
    });
    // เครื่องอัลตราซาวด์/กระตุ้นไฟฟ้าในห้องทำกายภาพ
    M.box(g, 0.5, 0.85, 0.45, M.mat(0x38bdf8), -6.9, 0.425, -2.2);

    // 3.2 ลู่วิ่ง (ชิดผนังซ้ายตอนกลาง ใต้ห้องทำกายภาพ: X -5.9, Z +3.0)
    const tmGroup = new THREE.Group();
    tmGroup.position.set(-5.9, 0, 3.0);
    // ฐานสายพานลู่วิ่ง
    const tmBase = M.box(tmGroup, 2.1, 0.16, 0.92, M.mat(0x1e293b), 0, 0.1, 0);
    addEdges(tmBase, 0x0f172a);
    M.box(tmGroup, 1.85, 0.03, 0.68, M.mat(0x334155), 0.05, 0.19, 0); // สายพานวิ่ง
    // เสาและหน้าปัดลู่วิ่งด้านหน้า (-X)
    M.box(tmGroup, 0.1, 1.15, 0.08, M.mat(0x64748b), -0.88, 0.65, -0.4);
    M.box(tmGroup, 0.1, 1.15, 0.08, M.mat(0x64748b), -0.88, 0.65, 0.4);
    // ราวจับข้างลู่วิ่ง
    M.box(tmGroup, 1.1, 0.06, 0.06, M.mat(0x94a3b8), -0.38, 0.98, -0.4);
    M.box(tmGroup, 1.1, 0.06, 0.06, M.mat(0x94a3b8), -0.38, 0.98, 0.4);
    // จอคอนโซลลู่วิ่ง
    const tmConsole = M.box(tmGroup, 0.32, 0.24, 0.86, M.mat(0x0f172a), -0.88, 1.24, 0);
    tmConsole.rotation.z = -0.35;
    addEdges(tmConsole, 0x38bdf8);
    // คนไข้กำลังเดินฝึกบนลู่วิ่ง + นักกายภาพดูแลใกล้ชิด
    const runner = makePerson({ role: 'patient', pose: 'stand', rotY: -Math.PI / 2 });
    runner.position.set(0.05, 0.18, 0);
    tmGroup.add(runner);
    const trainer = makePerson({ role: 'nurse', pose: 'stand', rotY: Math.PI });
    trainer.position.set(-0.2, 0, -0.85);
    tmGroup.add(trainer);
    g.add(tmGroup);
    L.push({ text: '🏃 ลู่วิ่ง (ฝึกเดินฟื้นฟู)', pos: V(-5.9, 1.85, 3.0), cls: 'int-label room-title' });

    // 3.3 โต๊ะคอม กายภาพ 2 (วางแนวตั้ง หันหน้าออกไปทางเดินฝั่งขวา rotY: Math.PI / 2)
    workDesk({
      x: -2.8, z: 4.2, w: 1.65, d: 0.7, rotY: Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม กายภาพ 2', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-PT-02', 'โต๊ะคอมพิวเตอร์ กายภาพ 2 (บันทึกการรักษา)', 'นักกายภาพบำบัดบันทึกผลการทำหัตถการและประเมินสมรรถภาพกล้ามเนื้อ', '102', 'ระบบ HOSxP Physical Therapy Note • ระบบนัดหมายผู้ป่วยกายภาพบำบัด')
    });

    // 3.4 เค้าเตอร์ซักประวัติ (วางแนวตั้งต่อลงมาจาก โต๊ะคอม กายภาพ 2: X -2.8, Z +6.8)
    const triageCounter = M.box(g, 0.85, 0.88, 2.1, M.mat(0xfef08a), -2.8, 0.44, 6.8);
    addEdges(triageCounter, 0xca8a04);
    // เจ้าหน้าที่นั่งซักประวัติฝั่งซ้าย หันไปทางทางเดิน (+X)
    const ptTriageStaff = makePerson({ role: 'nurse', pose: 'sit', rotY: Math.PI / 2 });
    ptTriageStaff.position.set(-3.45, 0, 6.8);
    g.add(ptTriageStaff);
    // เก้าอี้และผู้ป่วยนั่งรับการซักประวัติฝั่งขวา หันเข้าหาเคาน์เตอร์ (-X)
    M.box(g, 0.38, 0.42, 0.38, M.mat(0x64748b), -2.0, 0.21, 6.8);
    const ptTriagePat = makePerson({ role: 'patient', pose: 'sit', rotY: -Math.PI / 2 });
    ptTriagePat.position.set(-2.0, 0, 6.8);
    g.add(ptTriagePat);
    L.push({ text: '📋 เค้าเตอร์ซักประวัติ (มีเจ้าหน้าที่ประจำ)', pos: V(-2.8, 1.85, 6.8), cls: 'int-label room-title' });

    // 3.5 โต๊ะคอม กายภาพ 1 (มุมล่างซ้าย ชิดกำแพงล่าง หันหน้าเข้ากำแพงล่าง rotY: 0)
    workDesk({
      x: -5.3, z: 8.85, w: 1.75, d: 0.7, rotY: 0,
      hasPC: true, label: 'โต๊ะคอม กายภาพ 1', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-PT-01', 'โต๊ะคอมพิวเตอร์ กายภาพ 1 (ลงทะเบียน/คัดกรอง)', 'เจ้าหน้าที่/นักกายภาพบำบัดรับบัตรคิว ตรวจสอบสิทธิ และลงทะเบียนผู้ป่วย', '101', 'ระบบ HOSxP Rehab Queue • ระบบตรวจสอบสิทธิ สปสช. Smart Card')
    });

    // =========================================================================
    // 4. โซนฝั่งขวา: เตียง 4, เตียง 3, เตียง 2, เตียง 1 และ อุปกรณ์กายภาพ (X: +1.5 .. +7.5)
    // =========================================================================
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
      // ม่านกั้นระหว่างเตียงกายภาพ
      const curtain = M.box(g, 2.2, 1.25, 0.05, M.glass(0xbae6fd, 0.45), bed.x, 0.65, bed.z - 1.3);
      addEdges(curtain, 0x0284c7);
    });

    // 4.2 อุปกรณ์กายภาพ (มุมล่างขวา ข้างประตูทางเข้าหลัก: X +4.8, Z +8.6)
    const eqGroup = new THREE.Group();
    eqGroup.position.set(4.8, 0, 8.6);
    // แท่นวางอุปกรณ์และราวฝึกเดิน (Parallel Bars) + ลูกบอลโยคะฟื้นฟู + ชั้นวางดัมเบล/ถุงทรายถ่วงน้ำหนัก
    const eqBase = M.box(eqGroup, 2.6, 0.12, 1.25, M.mat(0xe0f2fe), 0, 0.06, 0);
    addEdges(eqBase, 0x0284c7);
    // ชั้นวางดัมเบลและแผ่นร้อนประคบ (Hot Pack Hydrocollator)
    const rack = M.box(eqGroup, 1.1, 0.95, 0.5, M.mat(0x64748b), -0.65, 0.48, -0.2);
    addEdges(rack, 0x334155);
    // ลูกบอลออกกำลังกายฟื้นฟู (Swiss Balls)
    const ball1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), M.mat(0x3b82f6, { roughness: 0.4 }));
    ball1.position.set(0.35, 0.38, -0.15);
    eqGroup.add(ball1);
    const ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), M.mat(0xec4899, { roughness: 0.4 }));
    ball2.position.set(0.95, 0.32, 0.1);
    eqGroup.add(ball2);
    g.add(eqGroup);
    L.push({ text: '🏋️ อุปกรณ์กายภาพ', pos: V(4.8, 1.65, 8.6), cls: 'int-label room-title' });

    // --- สรุปรายการด้านขวา ---
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

  // ======================= ตึกผู้ป่วยใน (IPD - 1 ชั้น) =======================
  const ipdBedConfigs = [
    // โซนซ้ายสุด (Bay 1: เตียง 1–3 หันหัวเตียงชิดผนังซ้าย X = -18.0)
    [1,  -16.6,  1.3,  Math.PI / 2, true],
    [2,  -16.6, -0.6,  Math.PI / 2, true],
    [3,  -16.6, -5.2,  Math.PI / 2, false],
    // โซนซ้ายถัดมา ฝั่งซ้าย (Bay 2 ซ้าย: เตียง 4–7 หันหัวเตียงชิดผนัง X = -12.8)
    [4,  -11.4,  1.3,  Math.PI / 2, true],
    [5,  -11.4, -0.6,  Math.PI / 2, false],
    [6,  -11.4, -4.85, Math.PI / 2, true],
    [7,  -11.4, -6.75, Math.PI / 2, true],
    // โซนซ้ายถัดมา ฝั่งขวา (Bay 2 ขวา: เตียง 8–11 หันหัวเตียงชิดผนัง X = -6.2)
    [8,   -7.6,  1.3, -Math.PI / 2, true],
    [9,   -7.6, -0.6, -Math.PI / 2, true],
    [10,  -7.6, -4.85,-Math.PI / 2, false],
    [11,  -7.6, -6.75,-Math.PI / 2, true],
    // โซนซ้ายติดแกนกลาง (Bay 3: เตียง 12–15 หันหัวเตียงชิดผนังกลาง X = -0.25)
    [12,  -1.65, 1.3, -Math.PI / 2, true],
    [13,  -1.65,-0.6, -Math.PI / 2, false],
    [14,  -1.65,-4.85,-Math.PI / 2, true],
    [15,  -1.65,-6.75,-Math.PI / 2, true],
    // โซนขวาติดแกนกลาง (Bay 4: เตียง 16–19 หันหัวเตียงชิดผนังกลาง X = +0.25)
    [16,   1.65, 1.3,  Math.PI / 2, true],
    [17,   1.65,-0.6,  Math.PI / 2, true],
    [18,   1.65,-4.85, Math.PI / 2, false],
    [19,   1.65,-6.75, Math.PI / 2, true],
    // โซนขวาถัดมา ฝั่งซ้าย (Bay 5 ซ้าย: เตียง 20–23 หันหัวเตียงชิดผนัง X = +6.2)
    [20,   7.6,  1.3,  Math.PI / 2, false],
    [21,   7.6, -0.6,  Math.PI / 2, true],
    [22,   7.6, -4.85, Math.PI / 2, true],
    [23,   7.6, -6.75, Math.PI / 2, false],
    // โซนขวาถัดมา ฝั่งขวา (Bay 5 ขวา: เตียง 24–27 หันหัวเตียงชิดผนัง X = +12.8)
    [24,  11.4,  1.3, -Math.PI / 2, true],
    [25,  11.4, -0.6, -Math.PI / 2, true],
    [26,  11.4, -4.85,-Math.PI / 2, false],
    [27,  11.4, -6.75,-Math.PI / 2, true],
    // โซนขวาสุด (Bay 6: เตียง 28–30 หันหัวเตียงชิดผนังขวา X = +18.0)
    [28,  16.6,  1.3, -Math.PI / 2, true],
    [29,  16.6, -0.6, -Math.PI / 2, false],
    [30,  16.6, -5.2, -Math.PI / 2, true]
  ];

  const ipdState = {
    beds: ipdBedConfigs.map(([num, x, z, rotY, occupied]) => ({
      id: `ipd-bed-${num}`,
      num,
      name: `เตียง ${num}`,
      x,
      z,
      rotY,
      occupied
    })),
    isoRooms: [
      { id: 'ipd-iso-1', name: 'ห้องแยกโรค 1 (ฝั่งขวาบน)', x: 21.0, z: 0.35, occupied: true },
      { id: 'ipd-iso-2', name: 'ห้องแยกโรค 2 (ฝั่งซ้ายล่าง)', x: -20.75, z: 6.4, occupied: true },
      { id: 'ipd-iso-3', name: 'ห้องแยกโรค 3 (ฝั่งขวาล่าง 1)', x: 11.1, z: 6.4, occupied: false },
      { id: 'ipd-iso-4', name: 'ห้องแยกโรค 4 (ฝั่งขวาล่าง 2)', x: 16.25, z: 6.4, occupied: true },
      { id: 'ipd-iso-5', name: 'ห้องแยกโรค 5 (ฝั่งขวาล่าง 3)', x: 21.4, z: 6.4, occupied: false }
    ]
  };

  function buildIpdInterior() {
    const g = new THREE.Group();
    const L = [];
    const pcList = [];

    // --- 1. พื้นอาคารแยกโซนชัดเจนตามผังตึกผู้ป่วยใน 1 ชั้น ---
    // 1.1 โถงที่นั่งคอยด้านบน (X: -9.5 .. +9.5, Z: -12.5 .. -8.5)
    floor(g, 19.0, 4.0, '#f8fafc', '#cbd5e1', 1.0, 0, -10.5);
    // 1.2 โถงหอผู้ป่วยใน เตียง 1–30 และห้องน้ำซ้าย-ขวา (X: -24.0 .. +24.0, Z: -8.5 .. +2.5)
    floor(g, 24.0, 11.0, '#f0f9ff', '#bae6fd', 1.0, -12.0, -3.0); // ฝั่งซ้าย (เตียง 1–15)
    floor(g, 24.0, 11.0, '#f0f9ff', '#bae6fd', 1.0,  12.0, -3.0); // ฝั่งขวา (เตียง 16–30)
    // 1.3 ทางเดินหลักคั่นกลาง (X: -24.0 .. +24.0, Z: +2.5 .. +4.3)
    floor(g, 48.0, 1.8, '#e2e8f0', '#94a3b8', 1.0, 0, 3.4);
    // 1.4 โซนด้านล่าง: Nurse Station, โต๊ะคอม IPC 1–3, Nurse Call System และโถงทางเข้า (X: -24.0 .. +24.0, Z: +4.3 .. +10.5)
    floor(g, 48.0, 6.2, '#f8fafc', '#cbd5e1', 1.0, 0, 7.4);

    // 1.5 พื้นสีเหลืองสำหรับ "ห้องแยกโรค" ทั้ง 5 ห้องตามผัง
    floor(g, 6.0, 4.3, '#fef9c3', '#fde047', 0.5,  21.0,  0.35);  // ห้องแยกโรค 1 (มุมขวาล่างของโถงเตียง)
    floor(g, 6.5, 4.2, '#fef9c3', '#fde047', 0.5, -20.75, 6.4);   // ห้องแยกโรค 2 (มุมซ้ายล่าง)
    floor(g, 5.2, 4.2, '#fef9c3', '#fde047', 0.5,  11.1,  6.4);   // ห้องแยกโรค 3 (ขวาล่าง ห้องที่ 1)
    floor(g, 5.1, 4.2, '#fef9c3', '#fde047', 0.5,  16.25, 6.4);   // ห้องแยกโรค 4 (ขวาล่าง ห้องที่ 2)
    floor(g, 5.2, 4.2, '#fef9c3', '#fde047', 0.5,  21.4,  6.4);   // ห้องแยกโรค 5 (ขวาล่าง ห้องที่ 3)

    // --- 2. เส้นทางเดินสีฟ้าชัดเจน (Walkway Guide Strips) ---
    walkwayStrip(g, 0,     3.4, 47.2, 1.3, 0);            // เส้นทางเดินหลักแนวนอนคั่นกลางตึก
    walkwayStrip(g, 0,    -3.0, 35.0, 1.1, 0);            // เส้นทางเดินกลางโถงเตียงผู้ป่วย (ซ้าย-ขวา)
    walkwayStrip(g, -3.5, -3.0, 10.2, 1.0, Math.PI / 2);  // เส้นทางเดินเชื่อมประตูบน-ล่าง ฝั่งซ้าย
    walkwayStrip(g,  3.5, -3.0, 10.2, 1.0, Math.PI / 2);  // เส้นทางเดินเชื่อมประตูบน-ล่าง ฝั่งขวา

    L.push({ text: '🚶 ทางเดิน', pos: V(0, 0.35, 3.4), cls: 'int-label walkway-tag' });

    // --- 3. Helpers สำหรับสร้างผนัง, ประตู, โต๊ะคอม, เตียงผู้ป่วยใน, ห้องน้ำ ---
    const wallMat = M.mat(0xf8fafc, { roughness: 0.5 });
    const outerWallMat = M.mat(0x1e293b, { roughness: 0.6 });
    const doorMat = M.mat(0xd97706, { roughness: 0.5 });
    const WH = 1.65;

    function wall(x1, z1, x2, z2, thick = 0.16, h = WH, isOuter = false) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.05) return;
      const wMesh = M.box(
        g, len, h, thick,
        isOuter ? outerWallMat : wallMat,
        (x1 + x2) / 2, h / 2, (z1 + z2) / 2
      );
      wMesh.rotation.y = -Math.atan2(dz, dx);
      addEdges(wMesh, isOuter ? 0x0f172a : 0x64748b);
      return wMesh;
    }

    function doorWay(x, z, rotY = 0, w = 1.15, showLabel = true) {
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

    function makePcSpec(code, name, role, ipSuffix, software) {
      return {
        code,
        name,
        role,
        cpu: 'Intel Core i5-13500 (14 Cores, Up to 4.8 GHz)',
        ram: '16 GB DDR4 3200MHz',
        storage: 'NVMe M.2 SSD 512 GB',
        monitor: 'Dell 24" IPS Full HD (Eye-Care)',
        os: 'Windows 11 Pro 64-bit (Hospital Domain)',
        ip: `192.168.40.${ipSuffix}`,
        status: '🟢 ออนไลน์ (เชื่อมต่อระบบ HOSxP IPD)',
        software,
        peripherals: 'เครื่องอ่านบัตรประชาชน Smart Card • เครื่องพิมพ์สติ๊กเกอร์บาร์โค้ดผู้ป่วยใน • เครื่องสแกนบาร์โค้ด',
        user: role
      };
    }

    function workDesk(opts) {
      const {
        x, z, w = 1.25, d = 0.62, rotY = 0,
        hasPC = true, label = null, staffRole = 'nurse',
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

      g.add(dg);
      if (label) {
        L.push({
          text: pcInfo ? `🖥️ ${label}` : label,
          pos: V(x, 1.42, z),
          cls: pcInfo ? 'int-label pc-tag' : 'int-label sub-tag',
          pcInfo: pcInfo || null
        });
      }
      return dg;
    }

    function ipdBed(opts) {
      const {
        x, z, rotY = 0, occupied = false,
        label = null, statusId = null, showStaff = false
      } = opts;
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);
      bg.rotation.y = rotY;

      const bw = 0.86, bd = 1.85;
      const frame = M.box(bg, bw, 0.45, bd, M.mat(0x64748b), 0, 0.225, 0);
      addEdges(frame, 0x1e293b);
      const sheetColor = occupied ? 0xfee2e2 : 0xecfdf5;
      const mattress = M.box(bg, bw - 0.06, 0.14, bd - 0.06, M.mat(sheetColor), 0, 0.52, 0);
      addEdges(mattress, occupied ? 0xdc2626 : 0x16a34a);
      // พนักหัวเตียง (-Z) และปลายเตียง (+Z)
      M.box(bg, bw, 0.35, 0.06, M.mat(0x1e40af), 0, 0.65, -bd / 2 + 0.03);
      M.box(bg, bw, 0.25, 0.06, M.mat(0x1e40af), 0, 0.6, bd / 2 - 0.03);
      // หมอนสีขาวตรงหัวเตียง (-Z)
      M.box(bg, bw * 0.62, 0.08, 0.28, M.mat(0xffffff), 0, 0.62, -bd / 2 + 0.24);

      if (occupied) {
        const pat = makePerson({ role: 'patient', pose: 'lie', rotY: 0 });
        bg.add(pat);
        if (showStaff) {
          const nurse = makePerson({ role: 'nurse', pose: 'stand', rotY: -Math.PI / 2 });
          nurse.position.set(bw / 2 + 0.32, 0, -0.15);
          bg.add(nurse);
        }
        // เสาน้ำเกลือข้างเตียง
        M.cyl(bg, 0.02, 0.02, 1.6, M.mat(0x94a3b8, { metalness: 0.6 }), -bw / 2 - 0.14, 0.8, -bd / 2 + 0.22, 8);
        M.box(bg, 0.1, 0.18, 0.06, M.mat(0x38bdf8, { transparent: true, opacity: 0.8 }), -bw / 2 - 0.14, 1.45, -bd / 2 + 0.22);
      }

      g.add(bg);
      if (label) {
        const statusText = occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง';
        L.push({
          text: `${label} (${statusText})`,
          pos: V(x, 1.75, z),
          cls: `int-label ${occupied ? 'busy' : 'free'} ${statusId ? 'toggleable' : ''}`,
          toggleId: statusId
        });
      }
      return bg;
    }

    // สร้างห้องน้ำผู้ป่วยพร้อมสัญลักษณ์ 🚻
    function buildToiletStall(x, z, side = 'left') {
      const tg = new THREE.Group();
      tg.position.set(x, 0, z);
      const base = M.box(tg, 1.35, 0.06, 1.15, M.mat(0xdbeafe), 0, 0.03, 0);
      addEdges(base, 0x2563eb);
      // โถสุขภัณฑ์ + อ่างล้างมือ
      M.cyl(tg, 0.18, 0.15, 0.42, M.mat(0xffffff), side === 'left' ? -0.25 : 0.25, 0.21, 0, 12);
      M.box(tg, 0.16, 0.38, 0.34, M.mat(0xffffff), side === 'left' ? -0.45 : 0.45, 0.52, 0);
      g.add(tg);
    }

    // =========================================================================
    // 4. โซนด้านบนสุด: จุดนั่งคอยญาติผู้ป่วย 3 จุด ("ที่นั่ง" × 3) + ประตูเข้าหอผู้ป่วย 2 บาน
    // =========================================================================
    wall(-9.5, -12.5,  9.5, -12.5, 0.20, WH, true);
    wall(-9.5, -12.5, -9.5,  -8.5, 0.20, WH, true);
    wall( 9.5, -12.5,  9.5,  -8.5, 0.20, WH, true);

    [-5.6, 0, 5.6].forEach((bx, idx) => {
      const bench = M.box(g, 3.6, 0.46, 0.85, M.mat(0x0284c7), bx, 0.23, -10.8);
      addEdges(bench, 0x1e3a8a);
      M.box(g, 3.6, 0.48, 0.1, M.mat(0x0369a1), bx, 0.68, -11.18);
      // ญาติคนไข้นั่งคอยที่ม้านั่ง
      [-1.0, 0.9].forEach((ox, i) => {
        const rel = makePerson({
          role: 'relative',
          shirtColor: (idx + i) % 2 === 0 ? 0xf59e0b : 0x10b981,
          pose: 'sit',
          rotY: 0
        });
        rel.position.set(bx + ox, 0, -10.75);
        g.add(rel);
      });
      L.push({ text: '🪑 ที่นั่ง', pos: V(bx, 1.55, -10.8), cls: 'int-label sub-tag' });
    });

    // =========================================================================
    // 5. โครงผนังหอผู้ป่วยในหลัก (X: -24.0 .. +24.0, Z: -8.5 .. +2.5)
    // =========================================================================
    // ผนังด้านบนของหอผู้ป่วย (Z = -8.5) พร้อมประตูทางเข้าซ้าย-ขวา
    wall(-24.0, -8.5, -4.3, -8.5, 0.22, WH, true);
    wall( -2.7, -8.5,  2.7, -8.5, 0.22, WH, true);
    wall(  4.3, -8.5, 24.0, -8.5, 0.22, WH, true);
    doorWay(-3.5, -8.5, 0, 1.35, true);
    doorWay( 3.5, -8.5, 0, 1.35, true);

    // ผนังซ้ายสุดและขวาสุดของหอผู้ป่วย
    wall(-24.0, -8.5, -24.0, 10.5, 0.22, WH, true);
    wall( 24.0, -8.5,  24.0, 10.5, 0.22, WH, true);

    // ผนังกั้นกลางคู่ (Double Center Spine Wall: X = -0.25 และ X = +0.25) แบ่งครึ่งซ้าย-ขวา
    wall(-0.25, -8.5, -0.25, 2.5, 0.16, WH);
    wall( 0.25, -8.5,  0.25, 2.5, 0.16, WH);

    // ผนังกั้นโซนเตียงผู้ป่วยฝั่งซ้าย (X = -18.0, -12.8, -6.2) เว้นช่องทางเดินกลางที่ Z = -4.0 .. -2.0
    [-18.0, -12.8, -6.2].forEach((wx) => {
      wall(wx, -8.5, wx, -4.0, 0.16, WH);
      wall(wx, -2.0, wx,  2.5, 0.16, WH);
      // ขอบหัวเสาตัว T ตามผัง
      wall(wx - 0.35, -4.0, wx + 0.35, -4.0, 0.14, WH);
      wall(wx - 0.35, -2.0, wx + 0.35, -2.0, 0.14, WH);
    });

    // ผนังกั้นโซนเตียงผู้ป่วยฝั่งขวา (X = +6.2, +12.8, +18.0) เว้นช่องทางเดินกลางที่ Z = -4.0 .. -2.0
    [6.2, 12.8, 18.0].forEach((wx) => {
      wall(wx, -8.5, wx, -4.0, 0.16, WH);
      wall(wx, -2.0, wx,  2.5, 0.16, WH);
      wall(wx - 0.35, -4.0, wx + 0.35, -4.0, 0.14, WH);
      wall(wx - 0.35, -2.0, wx + 0.35, -2.0, 0.14, WH);
    });

    // ห้องน้ำฝั่งซ้าย 4 ห้องเรียงแนวตั้ง (X = -22.2)
    [-6.8, -5.2, -3.6, -2.0].forEach((tz, i) => {
      buildToiletStall(-22.2, tz, 'left');
      wall(-24.0, tz + 0.75, -20.8, tz + 0.75, 0.12, 1.35);
    });
    L.push({ text: '🚻 ห้องน้ำผู้ป่วย (ฝั่งซ้าย 4 ห้อง)', pos: V(-21.8, 1.85, -4.4), cls: 'int-label room-title' });

    // ห้องน้ำฝั่งขวา 4 ห้องเรียงแนวตั้ง (X = +22.2, โซนบนเหนือห้องแยกโรค 1)
    [-7.2, -5.8, -4.4, -3.0].forEach((tz) => {
      buildToiletStall(22.2, tz, 'right');
      wall(20.8, tz + 0.65, 24.0, tz + 0.65, 0.12, 1.35);
    });
    L.push({ text: '🚻 ห้องน้ำผู้ป่วย (ฝั่งขวา 4 ห้อง)', pos: V(21.8, 1.85, -5.2), cls: 'int-label room-title' });

    // ผนังกั้นห้องแยกโรค 1 (มุมขวาล่างของโถงบน: X = 18.0 .. 24.0, Z = -1.8 .. +2.5)
    wall(18.0, -1.8, 20.2, -1.8, 0.18, WH);
    wall(21.8, -1.8, 24.0, -1.8, 0.18, WH);
    doorWay(21.0, -1.8, 0, 1.25, true);

    // วางเตียงผู้ป่วยในครบทั้ง 30 เตียง (เตียง 1 – เตียง 30)
    ipdState.beds.forEach((b, idx) => {
      ipdBed({
        x: b.x,
        z: b.z,
        rotY: b.rotY,
        occupied: b.occupied,
        label: b.name,
        statusId: b.id,
        showStaff: idx % 3 === 0
      });
    });

    // ผนังด้านล่างของโถงเตียงผู้ป่วย ติดกับทางเดินหลัก (Z = +2.5) พร้อมประตูซ้าย-ขวา
    wall(-24.0, 2.5, -4.3, 2.5, 0.22, WH, true);
    wall( -2.7, 2.5,  2.7, 2.5, 0.22, WH, true);
    wall(  4.3, 2.5, 24.0, 2.5, 0.22, WH, true);
    doorWay(-3.5, 2.5, 0, 1.35, true);
    doorWay( 3.5, 2.5, 0, 1.35, true);

    // =========================================================================
    // 6. โซนด้านล่างของทางเดิน (Z: +4.3 .. +10.5):
    //    - ฝั่งซ้าย: ห้องแยกโรค 2 + โถงประตู 3 จุด
    //    - ตรงกลาง: Nurse Station + โต๊ะคอม IPC 1, 2, 3 + Nurse Call System
    //    - ฝั่งขวา: ประตูเข้าโถง + ห้องแยกโรค 3, 4, 5
    // =========================================================================
    // ผนังติดทางเดินฝั่งใต้ (Z = +4.3)
    wall(-24.0, 4.3, -15.2, 4.3, 0.22, WH, true);
    wall(-13.6, 4.3, -10.6, 4.3, 0.22, WH, true);
    wall( -9.0, 4.3,   1.8, 4.3, 0.22, WH, true);
    wall(  3.4, 4.3,   5.7, 4.3, 0.22, WH, true);
    wall(  7.3, 4.3,  24.0, 4.3, 0.22, WH, true);

    doorWay(-14.4, 4.3, 0, 1.3, true); // ประตูเข้าโถงหน้าห้องแยกโรคฝั่งซ้าย
    doorWay( -9.8, 4.3, 0, 1.3, true); // ประตูเข้า Nurse Station ฝั่งซ้าย
    doorWay(  2.6, 4.3, 0, 1.3, true); // ประตูเข้า Nurse Station ฝั่งขวา
    doorWay(  6.5, 4.3, 0, 1.3, true); // ประตูเข้าโถงห้องแยกโรคฝั่งขวา

    // ผนังด้านล่างสุดของอาคาร (Z = +10.5)
    wall(-24.0, 10.5, 24.0, 10.5, 0.22, WH, true);

    // --- 6.1 โซนซ้ายล่าง: ห้องแยกโรค 2 (X: -24.0 .. -17.5, Z: +4.3 .. +8.5) และโถงประตู ---
    wall(-17.5, 4.3, -17.5, 8.5, 0.18, WH);
    wall(-24.0, 8.5, -15.2, 8.5, 0.18, WH);
    wall(-13.6, 8.5, -11.5, 8.5, 0.18, WH);
    doorWay(-14.4, 8.5, 0, 1.3, true); // ประตูชั้นในฝั่งซ้ายล่าง

    wall(-11.5, 4.3, -11.5, 8.7, 0.18, WH);
    wall(-11.5, 10.1, -11.5, 10.5, 0.18, WH);
    doorWay(-11.5, 9.4, Math.PI / 2, 1.25, true); // ประตูเชื่อมด้านล่างสุดของโถงซ้าย

    // --- 6.2 โซนกลางล่าง: Nurse Station (X: -11.5 .. +4.5, Z: +4.3 .. +10.5) ---
    wall(4.5, 4.3, 4.5, 10.5, 0.18, WH);

    // โต๊ะคอม IPC 1 (วางแนวตั้งชิดผนังซ้ายของ Nurse Station หันหน้าเข้ากำแพงซ้าย)
    workDesk({
      x: -10.4, z: 7.3, w: 1.85, d: 0.65, rotY: -Math.PI / 2,
      hasPC: true, label: 'โต๊ะคอม IPC 1', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-IPD-01', 'โต๊ะคอมพิวเตอร์ IPC 1 (หอผู้ป่วยใน - รับใหม่/จำหน่ายผู้ป่วย)', 'พยาบาลวิชาชีพบันทึกข้อมูลรับผู้ป่วยใน (Admit), ย้ายเตียง และสรุปวันนอน', '301', 'ระบบ HOSxP IPD Admission • ระบบบริหารจัดการเตียงผู้ป่วยใน (Bed Management)')
    });

    // โต๊ะคอม IPC 2 (วางแนวนอนชิดผนังบนของ Nurse Station หันหน้าเข้ากำแพงบน)
    workDesk({
      x: -6.2, z: 5.15, w: 1.85, d: 0.65, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม IPC 2', staffRole: 'nurse',
      pcInfo: makePcSpec('PC-IPD-02', 'โต๊ะคอมพิวเตอร์ IPC 2 (หอผู้ป่วยใน - บันทึกทางการพยาบาล/สั่งยา IPD)', 'พยาบาลวิชาชีพตรวจสอบคำสั่งการรักษาของแพทย์ (Doctor Order) และเบิกยาผู้ป่วยใน', '302', 'ระบบ HOSxP IPD Nurse Note • ระบบ e-MAR & เบิกยาหอผู้ป่วยใน')
    });

    // โต๊ะคอม IPC 3 (วางแนวนอนถัดจาก IPC 2 ชิดผนังบนของ Nurse Station หันหน้าเข้ากำแพงบน)
    workDesk({
      x: -2.3, z: 5.15, w: 1.85, d: 0.65, rotY: Math.PI,
      hasPC: true, label: 'โต๊ะคอม IPC 3', staffRole: 'doctor',
      pcInfo: makePcSpec('PC-IPD-03', 'โต๊ะคอมพิวเตอร์ IPC 3 (หอผู้ป่วยใน - แพทย์ตรวจเยี่ยม/ดูผลแล็บ & X-Ray)', 'แพทย์และพยาบาลตรวจสอบผลตรวจทางห้องปฏิบัติการ (LIS) และภาพเอกซเรย์ (PACS) ของผู้ป่วยใน', '303', 'ระบบ HOSxP IPD Doctor Chart • ระบบ PACS & LIS Viewer หอผู้ป่วยใน')
    });

    // เคาน์เตอร์กลาง Nurse Station (ขยับมาไว้กึ่งกลางห้อง X = -3.5, Z = 7.8) พร้อมพยาบาลและแพทย์ประจำจุด
    const nsCounter = M.box(g, 4.8, 0.92, 1.15, M.mat(0xdbeafe), -3.5, 0.46, 7.8);
    addEdges(nsCounter, 0x2563eb);
    M.box(g, 4.9, 0.06, 1.25, M.mat(0xffffff), -3.5, 0.95, 7.8);
    const headNurse = makePerson({ role: 'nurse', pose: 'stand', rotY: Math.PI });
    headNurse.position.set(-4.3, 0, 8.7);
    g.add(headNurse);
    const wardDoc = makePerson({ role: 'doctor', pose: 'stand', rotY: Math.PI });
    wardDoc.position.set(-2.7, 0, 8.7);
    g.add(wardDoc);
    L.push({ text: '👩‍⚕️ Nurse Station (เคาน์เตอร์พยาบาลผู้ป่วยใน)', pos: V(-3.5, 2.05, 7.8), cls: 'int-label room-title' });

    // ระบบเรียกพยาบาล (Nurse Call System) ชิดกำแพงขวาของห้อง (X = 4.5) ตามจุดมาร์คสีแดง
    const ncsBase = M.box(g, 0.85, 0.88, 2.2, M.mat(0xe0f2fe), 3.95, 0.44, 7.4);
    addEdges(ncsBase, 0x0284c7);
    // แผงควบคุมติดผนังขวา + ตัวเครื่องโทรศัพท์สีแดงและไฟสถานะเรียกพยาบาล
    const ncsWallPanel = M.box(g, 0.12, 0.75, 1.65, M.mat(0x1e293b), 4.34, 1.35, 7.4);
    addEdges(ncsWallPanel, 0x38bdf8);
    const ncsPhone = M.box(g, 0.5, 0.25, 0.68, M.mat(0xef4444), 3.9, 1.0, 6.85);
    addEdges(ncsPhone, 0x991b1b);
    M.box(g, 0.48, 0.22, 0.78, M.mat(0x1e293b), 3.9, 0.99, 7.85);
    M.cyl(g, 0.08, 0.08, 0.08, M.mat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.6 }), 3.85, 1.12, 7.68, 12);
    M.cyl(g, 0.08, 0.08, 0.08, M.mat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.6 }), 3.85, 1.12, 8.02, 12);
    L.push({ text: '📟 Nurse Call System (ระบบเรียกพยาบาล)', pos: V(3.85, 2.1, 7.4), cls: 'int-label room-title' });

    // --- 6.3 โซนขวาล่าง: ห้องแยกโรค 3 ห้องเรียงกัน (X: +8.5 .. +24.0, Z: +4.3 .. +8.5) ---
    wall(8.5,  4.3,  8.5,  8.5, 0.18, WH);
    wall(13.7, 4.3, 13.7,  8.5, 0.18, WH);
    wall(18.8, 4.3, 18.8,  8.5, 0.18, WH);
    // ผนังด้านล่างของห้องแยกโรคทั้ง 3 ห้อง พร้อมประตูเปิดออกโถงทางเดินด้านล่าง
    wall(8.5,  8.5, 10.3, 8.5, 0.18, WH);
    wall(11.9, 8.5, 15.4, 8.5, 0.18, WH);
    wall(17.0, 8.5, 20.6, 8.5, 0.18, WH);
    wall(22.2, 8.5, 24.0, 8.5, 0.18, WH);
    doorWay(11.1, 8.5, 0, 1.25, true);
    doorWay(16.2, 8.5, 0, 1.25, true);
    doorWay(21.4, 8.5, 0, 1.25, true);

    // วางเตียงและป้ายสถานะภายใน "ห้องแยกโรค" ทั้ง 5 ห้อง (คลิกสลับ ว่าง/ไม่ว่าง ได้)
    ipdState.isoRooms.forEach((iso) => {
      ipdBed({
        x: iso.x,
        z: iso.z,
        rotY: 0,
        occupied: iso.occupied,
        label: null,
        statusId: null,
        showStaff: iso.occupied
      });
      // เครื่องวัดสัญญาณชีพและระบบความดันลบในห้องแยกโรค
      const mon = M.box(g, 0.55, 1.15, 0.45, M.mat(0xfef08a), iso.x + 1.45, 0.58, iso.z - 0.8);
      addEdges(mon, 0xca8a04);
      L.push({
        text: `🩺 ${iso.name}: ${iso.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง'}`,
        pos: V(iso.x, 2.05, iso.z),
        cls: `int-label ${iso.occupied ? 'busy' : 'free'} toggleable`,
        toggleId: iso.id
      });
    });

    // --- สรุปรายการด้านขวา ---
    const items = [];
    ipdState.isoRooms.forEach((r) => {
      items.push([
        '🩺',
        r.name,
        r.occupied ? '🔴 ไม่ว่าง' : '🟢 ว่าง',
        r.id,
        r.occupied ? 'busy' : 'free'
      ]);
    });
    ipdState.beds.forEach((b) => {
      items.push([
        '🛏️',
        `${b.name} (ผู้ป่วยใน)`,
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
    items.push(['👩‍⚕️', 'Nurse Station (เคาน์เตอร์พยาบาล)', 'เปิดบริการ']);
    items.push(['📟', 'Nurse Call System (ระบบเรียกพยาบาล)', 'ออนไลน์']);
    items.push(['🚻', 'ห้องน้ำผู้ป่วย (ฝั่งซ้าย 4 • ฝั่งขวา 4)', '8 ห้อง']);
    items.push(['🪑', 'จุดที่นั่งคอยญาติผู้ป่วยด้านหน้า', '3 จุด']);

    return {
      group: g,
      labels: L,
      size: 50,
      title: '🛏️ ผังภายในตึกผู้ป่วยใน (IPD - อาคาร 1 ชั้น): เตียง 1–30 • Nurse Station • ห้องแยกโรค',
      sub: 'คลิกป้าย "ว่าง/ไม่ว่าง" เพื่อสลับสถานะเตียง 1–30 และห้องแยกโรค • คลิกป้าย "🖥️ โต๊ะคอม IPC 1–3" เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 34, 29), target: V(0, 0, -0.5) }
    };
  }

  // ======================= โรงไฟฟ้า (Power Plant / Backup Generator Room) =======================
  const powerState = {
    running: false
  };

  function powerWarningSignTexture() {
    return M.canvasTexture(640, 240, (c, w, h) => {
      // พื้นเหลืองเตือนภัย + กรอบแถบเฉียงดำ-เหลือง
      c.fillStyle = '#facc15';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = '#1e293b';
      c.lineWidth = 14;
      c.strokeRect(7, 7, w - 14, h - 14);
      // แถบหัวป้ายสีแดงอันตราย
      c.fillStyle = '#dc2626';
      c.fillRect(16, 16, w - 32, 68);
      c.fillStyle = '#ffffff';
      c.textBaseline = 'middle';
      M.fitText(c, '⚠️ อันตราย! ไฟฟ้าแรงสูง (DANGER)', 36, 50, w - 72, 40, 700);
      // ข้อความเตือนหน้าประตูโรงไฟฟ้า
      c.fillStyle = '#0f172a';
      M.fitText(c, 'ห้องเครื่องผลิตไฟฟ้าสำรอง (GENERATOR ROOM)', 36, 128, w - 72, 30, 700);
      c.fillStyle = '#b91c1c';
      M.fitText(c, 'ห้ามบุคคลภายนอกเข้าก่อนได้รับอนุญาต', 36, 182, w - 72, 30, 700);
    });
  }

  function buildPowerInterior() {
    const g = new THREE.Group();
    const L = [];
    const WH = 2.2;

    // 1. พื้นห้องโรงไฟฟ้า (ขนาดกว้าง 9.0 ม. × ลึก 7.4 ม. ตามสัดส่วนผัง)
    floor(g, 9.0, 7.4, '#f1f5f9', '#cbd5e1', 0.5, 0, 0);
    // พื้นโถงหน้าประตูด้านซ้ายล่าง
    floor(g, 1.5, 2.2, '#fef9c3', '#fde047', 0.5, -5.0, 1.55);

    // เส้นทางเดินจากประตูซ้ายล่างเข้าสู่ห้องเครื่อง
    walkwayStrip(g, -2.2, 1.55, 4.4, 1.1, 0);

    const wallMat = M.mat(0xf8fafc, { roughness: 0.5 });
    const outerWallMat = M.mat(0x1e293b, { roughness: 0.6 });
    const doorMat = M.mat(0xd97706, { roughness: 0.5 });

    function wall(x1, z1, x2, z2, thick = 0.2, h = WH, isOuter = true) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.05) return;
      const wMesh = M.box(
        g, len, h, thick,
        isOuter ? outerWallMat : wallMat,
        (x1 + x2) / 2, h / 2, (z1 + z2) / 2
      );
      wMesh.rotation.y = -Math.atan2(dz, dx);
      addEdges(wMesh, 0x0f172a);
      return wMesh;
    }

    // 2. ผนังกรอบอาคารโรงไฟฟ้าทั้ง 4 ด้าน (เว้นช่องประตูที่ผนังซ้ายช่วงล่าง Z = 0.65 .. 2.45)
    wall(-4.5, -3.7,  4.5, -3.7, 0.22, WH, true); // ผนังบน
    wall(-4.5,  3.7,  4.5,  3.7, 0.22, WH, true); // ผนังล่าง
    wall( 4.5, -3.7,  4.5,  3.7, 0.22, WH, true); // ผนังขวา
    wall(-4.5, -3.7, -4.5, 0.65, 0.22, WH, true); // ผนังซ้ายช่วงบน
    wall(-4.5, 2.45, -4.5,  3.7, 0.22, WH, true); // ผนังซ้ายช่วงล่างสุด

    // 3. ซุ้มประตูด้านซ้ายล่างตามผัง + บานประตูเปิดเข้า + ป้ายเตือนอันตรายที่หน้าประตู
    const doorFrame = M.box(g, 0.85, 0.06, 1.95, M.mat(0x475569), -4.5, 0.03, 1.55);
    addEdges(doorFrame, 0x0f172a);
    // กรอบกล่องซุ้มประตูยื่นออกด้านซ้ายตามรูปผัง
    wall(-5.05, 0.65, -4.5, 0.65, 0.14, WH, false);
    wall(-5.05, 2.45, -4.5, 2.45, 0.14, WH, false);
    const doorPanel = M.box(g, 0.08, 1.75, 1.45, doorMat, -4.35, 0.88, 1.25);
    doorPanel.rotation.y = 0.48;
    addEdges(doorPanel, 0x78350f);
    L.push({ text: '🚪 ประตู', pos: V(-4.75, 1.65, 1.55), cls: 'int-label sub-tag' });

    // ป้ายเตือนอันตรายไฟฟ้าแรงสูง ติดที่หน้าประตู (ทั้งป้าย 3D เหนือซุ้มหน้าประตู และเสาป้ายเตือนหน้าประตู)
    const signTex = powerWarningSignTexture();
    const warnSignBoard = M.box(g, 0.08, 0.72, 1.85, M.mat(0xfacc15), -5.08, 1.95, 1.55);
    addEdges(warnSignBoard, 0xb91c1c);
    const warnSignFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.78, 0.66),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    warnSignFace.position.set(-5.13, 1.95, 1.55);
    warnSignFace.rotation.y = -Math.PI / 2;
    g.add(warnSignFace);

    // ป้ายตั้งพื้นเตือนอันตรายหน้าประตู (Safety Cone / Stand Sign หน้าประตู)
    M.cyl(g, 0.04, 0.22, 0.65, M.mat(0xef4444), -5.35, 0.325, 0.75, 14);
    M.cyl(g, 0.04, 0.22, 0.65, M.mat(0xef4444), -5.35, 0.325, 2.35, 14);
    L.push({
      text: '⚠️ ป้ายเตือนหน้าประตู: อันตราย! ไฟฟ้าแรงสูง ห้ามเข้าก่อนได้รับอนุญาต',
      pos: V(-5.15, 2.65, 1.55),
      cls: 'int-label busy'
    });

    // 4. เครื่องผลิตไฟฟ้าสำรอง (Emergency Diesel Generator) ขนาดใหญ่วางแนวตั้งฝั่งขวาตามผัง (X: +0.3 .. +3.7, Z: -2.8 .. +2.8)
    const genX = 2.0, genZ = 0.0;
    const genW = 3.4, genD = 5.6;

    // กรอบเส้นเหลือง-ดำ เขตปลอดภัยรอบฐานเครื่องผลิตไฟฟ้าสำรอง
    const hazardPad = M.box(g, genW + 0.5, 0.04, genD + 0.5, M.mat(0xfacc15), genX, 0.02, genZ);
    addEdges(hazardPad, 0xca8a04);
    // แท่นคอนกรีตและฐานเหล็กรองรับเครื่องกำเนิดไฟฟ้า
    const concretePad = M.box(g, genW + 0.2, 0.22, genD + 0.2, M.mat(0x475569), genX, 0.12, genZ);
    addEdges(concretePad, 0x1e293b);
    const steelSkid = M.box(g, genW, 0.26, genD, M.mat(0x1e293b, { metalness: 0.5, roughness: 0.4 }), genX, 0.35, genZ);
    addEdges(steelSkid, 0x0f172a);

    // ตัวถังเก็บเสียงเครื่องผลิตไฟฟ้าสำรอง (Acoustic Generator Canopy สีเหลืองอุตสาหกรรมคาดแถบดำ)
    const bodyColor = powerState.running ? 0xf59e0b : 0xeab308;
    const genBody = M.box(g, genW - 0.2, 1.65, genD - 0.2, M.mat(bodyColor, { roughness: 0.4, metalness: 0.2 }), genX, 1.3, genZ);
    addEdges(genBody, 0x78350f);

    // ช่องระบายอากาศ (Louvers) และบานประตูซ่อมบำรุงด้านข้างตัวเครื่อง
    [-1.8, -0.6, 0.6, 1.8].forEach((oz) => {
      const panelL = M.box(g, 0.06, 1.15, 0.92, M.mat(0x334155), genX - (genW - 0.16) / 2, 1.32, oz);
      const panelR = M.box(g, 0.06, 1.15, 0.92, M.mat(0x334155), genX + (genW - 0.16) / 2, 1.32, oz);
      addEdges(panelL, 0x0f172a);
      addEdges(panelR, 0x0f172a);
    });

    // แผงรังผึ้งหม้อน้ำระบายความร้อน (Radiator Grille) ด้านบนและท่อไอเสียคู่บนหลังคาเครื่อง
    const rad = M.box(g, genW - 0.6, 1.25, 0.12, M.mat(0x0f172a), genX, 1.32, -genD / 2 + 0.12);
    addEdges(rad, 0x475569);
    // ท่อพักไอเสียและปล่องระบายไอเสียด้านบนเครื่องผลิตไฟฟ้าสำรอง
    [-0.65, 0.65].forEach((ox) => {
      const muffler = M.cyl(g, 0.26, 0.26, 1.6, M.mat(0x64748b, { metalness: 0.6 }), genX + ox, 2.32, -0.8, 16);
      muffler.rotation.x = Math.PI / 2;
      addEdges(muffler, 0x1e293b);
      const stack = M.cyl(g, 0.12, 0.12, 0.75, M.mat(0x475569, { metalness: 0.7 }), genX + ox, 2.65, -1.35, 14);
      addEdges(stack, 0x1e293b);
    });

    // หน้าจอควบคุมดิจิทัลบนตัวเครื่อง + ไฟสถานะการทำงาน
    const statusColor = powerState.running ? 0xef4444 : 0x22c55e;
    const ctrlWindow = M.box(g, 0.08, 0.55, 0.75, M.mat(0x0f172a), genX - (genW - 0.14) / 2, 1.45, 1.8);
    addEdges(ctrlWindow, 0x38bdf8);
    M.cyl(g, 0.12, 0.12, 0.22, M.mat(statusColor, { emissive: statusColor, emissiveIntensity: 0.7 }), genX, 2.24, 1.9, 14);

    // ตู้ควบคุมระบบสลับสายไฟอัตโนมัติ (ATS & Generator Control Panel) คลิกดูรายละเอียดได้
    const atsSpec = {
      code: 'GEN-KSS-01',
      name: 'ชุดควบคุมเครื่องผลิตไฟฟ้าสำรองอัตโนมัติ (ATS & Diesel Generator 500 kVA)',
      role: 'ช่างไฟฟ้าและวิศวกรรมโรงพยาบาล ควบคุมการจ่ายกระแสไฟฟ้าสำรองฉุกเฉินทั้งโรงพยาบาล',
      cpu: 'DeepSea DSE8610 MKII Auto Mains (Utility) Failure Controller',
      ram: 'Cummins / Perkins 500 kVA (400 kW) 3-Phase 380/220V 50Hz',
      storage: 'ถังน้ำมันดีเซลสำรอง 1,000 ลิตร (รองรับการจ่ายไฟต่อเนื่อง 24 ชม.)',
      monitor: 'หน้าจอ LCD Digital Telemetry แสดงแรงดันไฟ (V), กระแส (A), ความถี่ (Hz)',
      os: 'ระบบสลับแหล่งจ่ายไฟอัตโนมัติ (Automatic Transfer Switch - ATS ภายใน 10 วินาที)',
      ip: '192.168.90.10 (SCADA Power Monitoring)',
      status: powerState.running ? '🔴 กำลังเดินเครื่องจ่ายไฟสำรองฉุกเฉิน (Running)' : '🟢 พร้อมใช้งานอัตโนมัติ (Standby Mode)',
      software: 'ระบบตรวจจับไฟตก/ไฟดับอัตโนมัติ • ระบบจ่ายไฟสำรองห้องฉุกเฉิน (ER), ห้องผ่าตัด, ICU และหอผู้ป่วยใน (IPD)',
      peripherals: 'แบตเตอรี่สตาร์ท 24V DC • เครื่องชาร์จอัตโนมัติ • ถังดับเพลิงเคมีแห้ง CO2 ประจำห้องเครื่อง',
      user: 'งานช่างและซ่อมบำรุง โรงพยาบาลโคกศรีสุพรรณ'
    };

    const atsCabinet = M.box(g, 0.65, 1.65, 1.25, M.mat(0xcbd5e1), -1.8, 0.825, -2.85);
    addEdges(atsCabinet, 0x334155);
    atsCabinet.userData.pcInfo = atsSpec;
    genBody.userData.pcInfo = atsSpec;

    L.push({
      text: `⚡ เครื่องผลิตไฟฟ้าสำรอง (${powerState.running ? '🔴 กำลังจ่ายไฟสำรอง' : '🟢 พร้อมใช้งาน Standby'})`,
      pos: V(genX, 2.75, genZ),
      cls: `int-label ${powerState.running ? 'busy' : 'free'} toggleable`,
      toggleId: 'power-gen'
    });
    L.push({
      text: '🖥️ ตู้ควบคุม ATS / ดูสเปกเครื่องผลิตไฟฟ้าสำรอง',
      pos: V(-1.8, 1.95, -2.85),
      cls: 'int-label pc-tag',
      pcInfo: atsSpec
    });

    const items = [
      [
        '⚡',
        'เครื่องผลิตไฟฟ้าสำรอง (500 kVA)',
        powerState.running ? '🔴 กำลังจ่ายไฟ' : '🟢 พร้อมใช้งาน',
        'power-gen',
        powerState.running ? 'busy' : 'free'
      ],
      [
        '🖥️',
        'GEN-KSS-01: รายละเอียดสเปกเครื่องผลิตไฟฟ้าสำรอง & ตู้ ATS',
        'ดูสเปก',
        null,
        'free',
        atsSpec
      ],
      ['⚠️', 'ป้ายเตือนหน้าประตู (อันตรายไฟฟ้าแรงสูง ห้ามเข้า)', 'ติดตั้งแล้ว'],
      ['🚪', 'ประตูทางเข้าโรงไฟฟ้า (ฝั่งซ้ายล่าง)', '1 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 12,
      title: '⚡ ผังภายในโรงไฟฟ้า (ห้องเครื่องผลิตไฟฟ้าสำรอง)',
      sub: 'คลิกป้าย "เครื่องผลิตไฟฟ้าสำรอง" เพื่อสลับสถานะ • คลิกป้าย "🖥️ ตู้ควบคุม ATS" หรือตัวเครื่องเพื่อดูสเปก',
      items,
      cam: { pos: V(-7.5, 9.5, 8.5), target: V(0, 0.6, 0.2) }
    };
  }

  // ======================= หอประชุม (Auditorium / Conference Hall) =======================
  const hallState = {
    occupied: true
  };

  function buildHallInterior() {
    const g = new THREE.Group();
    const L = [];
    const WH = 2.0;

    // 1. พื้นอาคารหอประชุม (กว้าง 19.0 ม. X: -9.5 .. +9.5, ลึก 19.0 ม. Z: -9.5 .. +9.5)
    floor(g, 19.0, 17.0, '#f8fafc', '#cbd5e1', 1.0, 0, 1.0);          // พื้นโถงหลักหอประชุม
    floor(g, 12.5,  2.0, '#f1f5f9', '#cbd5e1', 0.5, -3.25, -8.5);     // พื้นโถงด้านหลังเวที (ซ้ายบน)
    floor(g,  6.5,  2.0, '#eff6ff', '#93c5fd', 0.5,  6.25, -8.5);     // พื้นห้องควบคุมไฟและเครื่องเสียง (ขวาบน)
    floor(g, 10.4,  7.0, '#fefce8', '#fde047', 0.5, -0.2,   3.0);     // พื้นกรอบโซนเก้าอี้ 5 แถว × 10 ตัว (กลางโถง)

    const wallMat = M.mat(0xf8fafc, { roughness: 0.5 });
    const outerWallMat = M.mat(0x1e293b, { roughness: 0.6 });
    const doorMat = M.mat(0xd97706, { roughness: 0.5 });

    function wall(x1, z1, x2, z2, thick = 0.2, h = WH, isOuter = false) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.05) return;
      const wMesh = M.box(
        g, len, h, thick,
        isOuter ? outerWallMat : wallMat,
        (x1 + x2) / 2, h / 2, (z1 + z2) / 2
      );
      wMesh.rotation.y = -Math.atan2(dz, dx);
      addEdges(wMesh, isOuter ? 0x0f172a : 0x475569);
      return wMesh;
    }

    function doorBox(x, z, rotY = 0, w = 1.4, protrudeX = 0, protrudeZ = 0) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;
      const base = M.box(dg, w, 0.05, 0.75, M.mat(0xe2e8f0), 0, 0.025, 0);
      addEdges(base, 0x334155);
      const panel = M.box(dg, w * 0.82, 1.55, 0.07, doorMat, -w * 0.18, 0.78, 0.25);
      panel.rotation.y = 0.52;
      addEdges(panel, 0x78350f);
      g.add(dg);
      L.push({
        text: '🚪 ประตู',
        pos: V(x + protrudeX, 1.68, z + protrudeZ),
        cls: 'int-label sub-tag'
      });
    }

    // 2. โครงผนังกรอบนอกและช่องทางเดินด้านบน (Z: -9.5 .. -7.5)
    // ผนังบนสุด (Z = -9.5)
    wall(-9.5, -9.5, 9.5, -9.5, 0.22, WH, true);
    // ผนังล่างสุด (Z = +9.5)
    wall(-9.5,  9.5, 9.5,  9.5, 0.22, WH, true);

    // ผนังแนวนอนกั้นช่องด้านบน (Z = -7.5) เว้นช่องประตูเข้าห้องควบคุมไฟและเครื่องเสียงที่ X = 7.4
    wall(-9.5, -7.5, 6.6, -7.5, 0.18, WH, false);
    wall( 8.2, -7.5, 9.5, -7.5, 0.18, WH, false);
    doorBox(7.4, -7.5, 0, 1.35, 0, 0.2); // ประตูหน้าห้องควบคุมไฟและเครื่องเสียง

    // ผนังกั้นแบ่ง "ห้องควบคุมไฟและเครื่องเสียง" ที่ X = +3.0 (Z: -9.5 .. -7.5)
    wall(3.0, -9.5, 3.0, -7.5, 0.16, WH, false);

    // ประตูด้านซ้ายบนสุด (X = -9.5, Z = -8.5)
    wall(-9.5, -9.5, -9.5, -9.1, 0.22, WH, true);
    wall(-9.5, -7.9, -9.5, -7.5, 0.22, WH, true);
    doorBox(-9.5, -8.5, Math.PI / 2, 1.15, -0.35, 0);

    // ผนังซ้ายหลัก (X = -9.5) พร้อม 2 ประตูด้านซ้ายตามผัง (Z = +1.0 และ Z = +6.0)
    wall(-9.5, -7.5, -9.5, -0.2, 0.22, WH, true);
    wall(-9.5,  2.2, -9.5,  4.8, 0.22, WH, true);
    wall(-9.5,  7.2, -9.5,  9.5, 0.22, WH, true);
    doorBox(-9.5, 1.0, Math.PI / 2, 2.1, -0.45, 0); // ประตูซ้ายบานบน
    doorBox(-9.5, 6.0, Math.PI / 2, 2.1, -0.45, 0); // ประตูซ้ายบานล่าง

    // ผนังขวาหลัก (X = +9.5) พร้อม 2 ประตูด้านขวาตามผัง (Z = +1.0 และ Z = +6.0)
    wall(9.5, -9.5, 9.5, -0.2, 0.22, WH, true);
    wall(9.5,  2.2, 9.5,  4.8, 0.22, WH, true);
    wall(9.5,  7.2, 9.5,  9.5, 0.22, WH, true);
    doorBox(9.5, 1.0, -Math.PI / 2, 2.1, 0.45, 0);  // ประตูขวาบานบน
    doorBox(9.5, 6.0, -Math.PI / 2, 2.1, 0.45, 0);  // ประตูขวาบานล่าง

    // 3. ภายใน "ห้องควบคุมไฟและเครื่องเสียง" (X: +3.0 .. +9.5, Z: -9.5 .. -7.5)
    const avSpec = {
      code: 'PC-HALL-01',
      name: 'ชุดคอมพิวเตอร์และมิกเซอร์ควบคุมไฟ-เครื่องเสียงหอประชุม (AV & Lighting Control)',
      role: 'เจ้าหน้าที่โสตทัศนศึกษา ควบคุมระบบเสียง ไมโครโฟน จอโปรเจคเตอร์ และระบบไฟเวที',
      cpu: 'Intel Core i7-13700 (16 Cores) + Yamaha Digital Mixer TF1',
      ram: '16 GB DDR4 3200MHz',
      storage: 'NVMe M.2 SSD 1 TB',
      monitor: 'จอคู่ Dual Dell 24" IPS Full HD + จอโปรเจคเตอร์เวที',
      os: 'Windows 11 Pro 64-bit • ระบบควบคุมโสตทัศนูปกรณ์ห้องประชุม',
      ip: '192.168.50.10',
      status: '🟢 ออนไลน์ (พร้อมใช้งานระบบเสียงและไฟเวที)',
      software: 'ระบบจัดการเสียงดิจิทัล • ระบบควบคุมไฟเวที DMX • ระบบประชุมทางไกล (Zoom / Webex Conference)',
      peripherals: 'เครื่องขยายเสียงเพาเวอร์แอมป์ • ชุดไมโครโฟนไร้สาย 4 ตัว • กล้อง PTZ บันทึกภาพการประชุม',
      user: 'งานโสตทัศนศึกษาและประชาสัมพันธ์ โรงพยาบาลโคกศรีสุพรรณ'
    };

    const avDesk = M.box(g, 3.2, 0.78, 0.72, M.mat(0x334155), 5.4, 0.39, -8.85);
    addEdges(avDesk, 0x0f172a);
    // บอร์ดมิกเซอร์เสียงและหน้าจอคอมพิวเตอร์ในห้องควบคุม
    const mixer = M.box(g, 1.1, 0.14, 0.48, M.mat(0x0f172a), 4.7, 0.85, -8.85);
    addEdges(mixer, 0x38bdf8);
    const avMon = M.box(g, 0.65, 0.38, 0.05, M.mat(0x0284c7, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), 6.1, 1.02, -9.05);
    addEdges(avMon, 0x1e293b);
    avDesk.userData.pcInfo = avSpec;
    mixer.userData.pcInfo = avSpec;
    avMon.userData.pcInfo = avSpec;

    const avTech = makePerson({ role: 'nurse', shirtColor: 0x2563eb, pose: 'sit', rotY: Math.PI });
    avTech.position.set(5.4, 0, -8.25);
    g.add(avTech);

    L.push({
      text: '🎛️ ห้องควบคุมไฟและเครื่องเสียง (คลิกดูสเปก)',
      pos: V(6.2, 2.05, -8.55),
      cls: 'int-label pc-tag',
      pcInfo: avSpec
    });

    // 4. โซน "เวที" (X: -5.2 .. +4.8, Z: -7.5 .. -3.2) ตามผัง
    const stageW = 10.0, stageD = 4.3, stageH = 0.52;
    const stageX = -0.2, stageZ = -5.35;
    const stagePlatform = M.box(g, stageW, stageH, stageD, M.mat(0xb45309, { roughness: 0.55 }), stageX, stageH / 2, stageZ);
    addEdges(stagePlatform, 0x451a03);
    // พรมแดงบนเวที
    const stageCarpet = M.box(g, stageW - 0.5, 0.04, stageD - 0.4, M.mat(0xdc2626, { roughness: 0.7 }), stageX, stageH + 0.02, stageZ);
    addEdges(stageCarpet, 0x991b1b);
    // บันไดขึ้นเวทีซ้าย-ขวา
    M.box(g, 1.1, 0.26, 0.6, M.mat(0x92400e), stageX - stageW / 2 - 0.55, 0.13, -4.2);
    M.box(g, 1.1, 0.26, 0.6, M.mat(0x92400e), stageX + stageW / 2 + 0.55, 0.13, -4.2);

    // โพเดียมบรรยาย + ตู้ลำโพงซ้าย-ขวาบนเวที + จอฉากหลังเวที
    const podium = M.box(g, 0.85, 1.15, 0.6, M.mat(0x78350f), stageX + 2.6, stageH + 0.575, -4.3);
    addEdges(podium, 0x451a03);
    const backdrop = M.box(g, 6.8, 1.55, 0.08, M.mat(0x0284c7), stageX, stageH + 0.95, -7.32);
    addEdges(backdrop, 0x1e3a8a);
    [-4.3, 3.9].forEach((sx) => {
      const spk = M.box(g, 0.58, 1.35, 0.52, M.mat(0x0f172a), sx, stageH + 0.675, -4.0);
      addEdges(spk, 0x475569);
    });

    if (hallState.occupied) {
      const speaker = makePerson({ role: 'doctor', pose: 'stand', rotY: 0 });
      speaker.position.set(stageX + 2.6, stageH, -4.85);
      g.add(speaker);
    }

    L.push({
      text: `🎤 เวที (${hallState.occupied ? '🔴 กำลังจัดประชุม/อบรม' : '🟢 ว่าง'})`,
      pos: V(stageX, 2.35, stageZ),
      cls: `int-label ${hallState.occupied ? 'busy' : 'free'} toggleable`,
      toggleId: 'hall-stage'
    });

    // 5. โซน "เก้าอี้ แถวละ 10 ตัว จำนวน 5 แถว" (รวม 50 ตัว) ตรงกลางโถง (X: -4.7 .. +4.3, Z: 0.2 .. 5.8)
    const rows = 5;
    const cols = 10;
    const seatMat = M.mat(0x2563eb, { roughness: 0.5 });
    const legMat = M.mat(0x334155);

    for (let r = 0; r < rows; r++) {
      const rz = 0.2 + r * 1.35;
      for (let c = 0; c < cols; c++) {
        // เว้นช่องทางเดินเล็กน้อยตรงกลางระหว่างตัวที่ 5 กับ 6
        const aisleGap = c >= 5 ? 0.4 : 0;
        const cx = -4.6 + c * 0.94 + aisleGap;

        const cg = new THREE.Group();
        cg.position.set(cx, 0, rz);
        // เบาะนั่ง + พนักพิงหันหน้าขึ้นไปทางเวที (-Z)
        const seat = M.box(cg, 0.52, 0.08, 0.5, seatMat, 0, 0.44, 0);
        addEdges(seat, 0x1e3a8a);
        const back = M.box(cg, 0.52, 0.48, 0.08, seatMat, 0, 0.7, 0.22);
        addEdges(back, 0x1e3a8a);
        M.box(cg, 0.06, 0.44, 0.44, legMat, -0.22, 0.22, 0);
        M.box(cg, 0.06, 0.44, 0.44, legMat,  0.22, 0.22, 0);

        // หากหอประชุมมีการใช้งาน ให้แสดงผู้เข้าร่วมประชุมนั่งตามแถว
        if (hallState.occupied && ((r + c) % 3 === 0 || (r === 0 && c % 2 === 0))) {
          const attendee = makePerson({
            role: (r + c) % 2 === 0 ? 'nurse' : 'relative',
            shirtColor: (r + c) % 4 === 0 ? 0x0ea5e9 : (r + c) % 4 === 1 ? 0x10b981 : 0xf59e0b,
            pose: 'sit',
            rotY: Math.PI
          });
          attendee.position.set(0, 0, 0);
          cg.add(attendee);
        }
        g.add(cg);
      }
    }

    L.push({
      text: '🪑 เก้าอี้ แถวละ 10 ตัว • จำนวน 5 แถว (รวม 50 ตัว)',
      pos: V(-0.2, 1.95, 2.9),
      cls: 'int-label room-title'
    });

    const items = [
      [
        '🎤',
        'เวทีหอประชุม (Stage)',
        hallState.occupied ? '🔴 กำลังใช้งาน' : '🟢 ว่าง',
        'hall-stage',
        hallState.occupied ? 'busy' : 'free'
      ],
      [
        '🖥️',
        'PC-HALL-01: ห้องควบคุมไฟและเครื่องเสียง',
        'ดูสเปก',
        null,
        'free',
        avSpec
      ],
      ['🪑', 'เก้าอี้ผู้เข้าร่วมประชุม (แถวละ 10 ตัว × 5 แถว)', '50 ตัว'],
      ['🚪', 'ประตูทางเข้า-ออกหอประชุม (ซ้าย 3 • ขวา 2 • ห้องควบคุม 1)', '6 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 22,
      title: '🎤 ผังภายในหอประชุม: เวที • เก้าอี้แถวละ 10 ตัว จำนวน 5 แถว • ห้องควบคุมไฟและเครื่องเสียง',
      sub: 'คลิกป้าย "เวที" เพื่อสลับสถานะว่าง/กำลังจัดประชุม • คลิกป้าย "🎛️ ห้องควบคุมไฟและเครื่องเสียง" เพื่อดูสเปกอุปกรณ์',
      items,
      cam: { pos: V(0, 22, 19.5), target: V(0, 0, 0.2) }
    };
  }

  // ==================== อาคารงานช่าง (12 ห้อง + โถงโล่งคั่นกลางระหว่างห้อง 3 กับ 4) ====================
  const maintState = {
    rooms: [
      {
        id: 'maint-r1',
        num: 1,
        name: 'ห้องที่ 1 ห้องเย็น',
        shortTitle: 'ห้องที่ 1: ห้องเย็น',
        doorSide: 'front',
        w: 3.8,
        floorColor: 0xdbeafe,
        accent: '#0284c7',
        occupied: false
      },
      {
        id: 'maint-r2',
        num: 2,
        name: 'ห้องที่ 2 อุปกรณ์งานสนาม',
        shortTitle: 'ห้องที่ 2: อุปกรณ์งานสนาม',
        doorSide: 'front',
        w: 3.8,
        floorColor: 0xdcfce7,
        accent: '#16a34a',
        occupied: false
      },
      {
        id: 'maint-r3',
        num: 3,
        name: 'ห้องที่ 3 เก็บครุภัณฑ์คอมพิวเตอร์+กล่อง OPD Card',
        shortTitle: 'ห้องที่ 3: ครุภัณฑ์คอม+กล่อง OPD Card',
        doorSide: 'right',
        w: 4.0,
        floorColor: 0xe0e7ff,
        accent: '#4f46e5',
        occupied: false
      },
      {
        id: 'maint-hall',
        num: 0,
        isHall: true,
        name: 'โถงโล่ง (ทางเข้าหลัก)',
        shortTitle: 'โถงโล่ง (ประตูเข้าหลัก)',
        doorSide: 'front',
        w: 3.6,
        floorColor: 0xfef3c7,
        accent: '#d97706',
        occupied: false
      },
      {
        id: 'maint-r4',
        num: 4,
        name: 'ห้องที่ 4 เก็บอุปกรณ์แม่บ้าน',
        shortTitle: 'ห้องที่ 4: เก็บอุปกรณ์แม่บ้าน',
        doorSide: 'left',
        w: 3.8,
        floorColor: 0xfce7f3,
        accent: '#db2777',
        occupied: false
      },
      {
        id: 'maint-r5',
        num: 5,
        name: 'ห้องที่ 5 เอกสารห้องบัตร',
        shortTitle: 'ห้องที่ 5: เอกสารห้องบัตร',
        doorSide: 'front',
        w: 3.8,
        floorColor: 0xfef9c3,
        accent: '#ca8a04',
        occupied: false
      },
      {
        id: 'maint-r6',
        num: 6,
        name: 'ห้องที่ 6 กลุ่มงานช่าง',
        shortTitle: 'ห้องที่ 6: กลุ่มงานช่าง',
        doorSide: 'front',
        w: 4.5,
        floorColor: 0xffedd5,
        accent: '#ea580c',
        occupied: false
      },
      {
        id: 'maint-r7',
        num: 7,
        name: 'ห้องที่ 7 เก็บอุปกรณ์',
        shortTitle: 'ห้องที่ 7: เก็บอุปกรณ์',
        doorSide: 'front',
        w: 3.7,
        floorColor: 0xf1f5f9,
        accent: '#475569',
        occupied: false
      },
      {
        id: 'maint-r8',
        num: 8,
        name: 'ห้องที่ 8 เก็บอุปกรณ์ PCU',
        shortTitle: 'ห้องที่ 8: เก็บอุปกรณ์ PCU',
        doorSide: 'front',
        w: 3.7,
        floorColor: 0xccfbf1,
        accent: '#0d9488',
        occupied: false
      },
      {
        id: 'maint-r9',
        num: 9,
        name: 'ห้องที่ 9 เก็บอุปกรณ์ครุภัณฑ์',
        shortTitle: 'ห้องที่ 9: เก็บอุปกรณ์ครุภัณฑ์',
        doorSide: 'front',
        w: 3.7,
        floorColor: 0xe0f2fe,
        accent: '#0369a1',
        occupied: false
      },
      {
        id: 'maint-r10',
        num: 10,
        name: 'ห้องที่ 10 เก็บเอกสารการเงิน',
        shortTitle: 'ห้องที่ 10: เก็บเอกสารการเงิน',
        doorSide: 'front',
        w: 3.7,
        floorColor: 0xf3e8ff,
        accent: '#7e22ce',
        occupied: false
      },
      {
        id: 'maint-r11',
        num: 11,
        name: 'ห้องที่ 11 เก็บเอกสารการเงิน',
        shortTitle: 'ห้องที่ 11: เก็บเอกสารการเงิน',
        doorSide: 'front',
        w: 3.7,
        floorColor: 0xf3e8ff,
        accent: '#6d28d9',
        occupied: false
      },
      {
        id: 'maint-r12',
        num: 12,
        name: 'ห้องที่ 12 ห้องว่าง',
        shortTitle: 'ห้องที่ 12: ห้องว่าง',
        doorSide: 'front',
        w: 3.7,
        floorColor: 0xf8fafc,
        accent: '#64748b',
        occupied: false
      }
    ]
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

  function makeMaintRoomSign(titleText, subText, accentHex) {
    const signGroup = new THREE.Group();
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 160;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = accentHex || '#2563eb';
    ctx.fillRect(0, 0, c.width, 26);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, c.width - 8, c.height - 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px "Prompt", "Noto Sans Thai", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, c.width / 2, 74);

    if (subText) {
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 25px "Prompt", "Noto Sans Thai", sans-serif';
      ctx.fillText(subText, c.width / 2, 124);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;

    const board = maintBox(2.55, 0.78, 0.08, 0x1e293b);
    signGroup.add(board);

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(2.47, 0.72),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    face.position.z = 0.045;
    signGroup.add(face);

    return signGroup;
  }

  function makeMaintDoor(x, z, rotY, doorW = 1.1, isMain = false) {
    const dg = new THREE.Group();
    const frameMat = isMain ? 0x1d4ed8 : 0x334155;
    const leafMat = isMain ? 0x93c5fd : 0xd97706;
    // วงกบประตู
    dg.add(
      maintAt(maintBox(doorW + 0.14, 2.15, 0.18, frameMat), 0, 1.075, 0),
      maintAt(
        new THREE.Mesh(
          new THREE.BoxGeometry(doorW, 2.02, 0.07),
          new THREE.MeshStandardMaterial({
            color: leafMat,
            roughness: 0.35,
            metalness: isMain ? 0.25 : 0.1,
            transparent: isMain,
            opacity: isMain ? 0.82 : 1
          })
        ),
        0,
        1.01,
        0.02
      ),
      // มือจับประตู
      maintAt(maintBox(0.05, 0.22, 0.14, 0xfacc15), doorW * 0.36, 1.02, 0.06)
    );
    // เส้นรัศมีเปิดประตูบนพื้น
    const swing = maintAt(maintBox(doorW * 0.85, 0.015, 0.04, 0x38bdf8), 0, 0.02, 0.42);
    dg.add(swing);
    dg.position.set(x, 0, z);
    dg.rotation.y = rotY;
    return dg;
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
        sg.add(
          maintAt(maintBox(w * 0.36, 0.32, d * 0.76, boxColor), -w * 0.24, sy + 0.18, 0),
          maintAt(maintBox(w * 0.36, 0.28, d * 0.76, 0xd97706), w * 0.22, sy + 0.16, 0)
        );
      }
    });
    return sg;
  }

  function buildMaintInterior() {
    const g = new THREE.Group();
    const L = [];

    const totalW = maintState.rooms.reduce((sum, r) => sum + r.w, 0); // 49.5 m
    const backZ = -3.3;
    const frontZ = 3.3;
    const roomD = frontZ - backZ; // 6.6 m
    const walkZ = frontZ + 2.2; // ทางเดินหน้าอาคาร

    // ฐานอาคารงานช่าง + ทางเดินด้านหน้า
    g.add(
      maintAt(maintBox(totalW + 2.0, 0.22, roomD + 3.2, 0xcbd5e1), 0, -0.11, 0.9),
      // ทางเดินยาวหน้าห้อง 1 - 12
      maintAt(maintBox(totalW + 1.2, 0.04, 2.2, 0xe2e8f0), 0, 0.01, frontZ + 1.1),
      maintAt(maintBox(totalW + 1.2, 0.05, 0.12, 0xfacc15), 0, 0.025, walkZ)
    );

    // กำแพงด้านหลังยาวตลอดแนว
    g.add(maintAt(maintWall(totalW, 2.7, 0.16, 0xe2e8f0), 0, 1.35, backZ));
    // กำแพงปิดหัว-ท้ายอาคาร
    g.add(
      maintAt(maintWall(0.16, 2.7, roomD, 0xcbd5e1), -totalW / 2, 1.35, 0),
      maintAt(maintWall(0.16, 2.7, roomD, 0xcbd5e1), totalW / 2, 1.35, 0)
    );

    // สเปกคอมพิวเตอร์ในห้องที่ 6 กลุ่มงานช่าง
    const maintPcSpec = {
      code: 'PC-MAINT-01',
      name: 'โต๊ะคอมพิวเตอร์กลุ่มงานช่าง (ห้องที่ 6 กลุ่มงานช่าง)',
      role: 'ระบบบันทึกงานแจ้งซ่อมกลางและทะเบียนครุภัณฑ์ช่าง (ไม่มีเจ้าหน้าที่ประจำ)',
      user: 'กลุ่มงานบริหารทั่วไป / งานช่างซ่อมบำรุง (ไม่มีคนประจำ)',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T @ 4.4GHz)',
      ram: '16 GB DDR4 3200MHz',
      storage: 'SSD NVMe 512 GB',
      monitor: '24" FHD IPS Monitor',
      ip: '192.168.16.61',
      software: 'ระบบแจ้งซ่อมออนไลน์ (CMMS) • ทะเบียนครุภัณฑ์ช่าง • AutoCAD LT',
      peripherals: 'เครื่องสำรองไฟ APC 1000VA • เครื่องพิมพ์เลเซอร์งานซ่อมบำรุง',
      status: '🟢 ออนไลน์ปกติ'
    };

    let cursorX = -totalW / 2;

    maintState.rooms.forEach((rm, idx) => {
      const x0 = cursorX;
      const x1 = cursorX + rm.w;
      const cx = (x0 + x1) / 2;
      cursorX = x1;

      // พื้นห้อง (เปลี่ยนสีตามสถานะเหมือนตึก ER)
      const floorCol = rm.occupied ? 0xfecaca : rm.floorColor;
      g.add(maintAt(maintBox(rm.w - 0.1, 0.04, roomD - 0.1, floorCol), cx, 0.02, 0));

      // เส้นกรอบพื้นห้อง
      const borderCol = rm.occupied ? 0xef4444 : 0x64748b;
      g.add(
        maintAt(maintBox(rm.w - 0.08, 0.05, 0.06, borderCol), cx, 0.028, backZ + 0.05),
        maintAt(maintBox(rm.w - 0.08, 0.05, 0.06, borderCol), cx, 0.028, frontZ - 0.05)
      );

      // กำแพงกั้นระหว่างห้องด้านขวา (ยกเว้นห้องสุดท้ายที่ติดกำแพงนอก)
      if (idx < maintState.rooms.length - 1) {
        // ช่องประตูเชื่อมโถงโล่ง:
        // - กั้นระหว่าง ห้องที่ 3 (idx=2) กับ โถงโล่ง (idx=3) มีประตูเปิดเข้าโถงโล่ง
        // - กั้นระหว่าง โถงโล่ง (idx=3) กับ ห้องที่ 4 (idx=4) มีประตูเปิดเข้าโถงโล่ง
        const hasSideDoor = rm.id === 'maint-r3' || rm.id === 'maint-hall';
        if (hasSideDoor) {
          // เว้นช่องประตูตรงกลางกำแพงกั้น (Z = -0.35 .. +0.85)
          g.add(
            maintAt(maintWall(0.14, 2.6, 2.5, 0xcbd5e1), x1, 1.3, -2.05),
            maintAt(maintWall(0.14, 2.6, 2.1, 0xcbd5e1), x1, 1.3, 2.25),
            // คานเหนือประตู
            maintAt(maintWall(0.14, 0.5, 1.2, 0xcbd5e1), x1, 2.35, 0.25)
          );
          const doorRot = rm.id === 'maint-r3' ? Math.PI / 2 : -Math.PI / 2;
          g.add(makeMaintDoor(x1, 0.25, doorRot, 1.05, false));
          L.push(
            maintTag(
              '🚪 ประตู',
              V(x1, 1.05, 0.25),
              'sub',
              null,
              'ประตูเชื่อมเข้า-ออกโถงโล่งกลางอาคาร'
            )
          );
        } else {
          g.add(maintAt(maintWall(0.14, 2.6, roomD, 0xcbd5e1), x1, 1.3, 0));
        }
      }

      // กำแพงด้านหน้า (Z = frontZ) + ประตูหน้าห้อง
      if (rm.doorSide === 'front') {
        const doorW = rm.isHall ? 1.5 : 1.1;
        const sideW = (rm.w - doorW) / 2;
        g.add(
          maintAt(maintWall(sideW, 2.6, 0.16, 0xcbd5e1), x0 + sideW / 2, 1.3, frontZ),
          maintAt(maintWall(sideW, 2.6, 0.16, 0xcbd5e1), x1 - sideW / 2, 1.3, frontZ),
          maintAt(maintWall(doorW, 0.5, 0.16, 0xcbd5e1), cx, 2.35, frontZ)
        );
        g.add(makeMaintDoor(cx, frontZ, 0, doorW, !!rm.isHall));
        L.push(
          maintTag(
            rm.isHall ? '🚪 ประตูเข้าหลัก (ห้องโถง)' : '🚪 ประตู',
            V(cx, 1.0, frontZ + 0.35),
            rm.isHall ? 'room' : 'sub',
            null,
            rm.isHall
              ? 'ประตูทางเข้าหลักของอาคารงานช่าง (เข้าทางห้องโถงโล่ง)'
              : `ประตูทางเข้า ${rm.name}`
          )
        );
      } else {
        // ห้องที่ 3 และ ห้องที่ 4 ด้านหน้าเป็นกำแพงทึบ (เพราะเข้าออกทางโถงโล่งด้านข้าง)
        g.add(maintAt(maintWall(rm.w, 2.6, 0.16, 0xcbd5e1), cx, 1.3, frontZ));
      }

      // ป้ายชื่อหน้าห้อง 3 มิติ ติดเหนือหน้าห้องทุกห้อง
      const signTitle = rm.isHall ? 'โถงโล่ง' : `ห้องที่ ${rm.num}`;
      const signSub = rm.isHall
        ? 'ประตูทางเข้าหลัก'
        : rm.name.replace(/^ห้องที่\s*\d+\s*/, '');
      const signMesh = makeMaintRoomSign(signTitle, signSub, rm.accent);
      signMesh.position.set(cx, 2.55, frontZ + 0.14);
      g.add(signMesh);

      // ไฟสถานะหน้าห้อง (เขียว = เปิดใช้งาน/ว่าง, แดง = ปิด/กำลังใช้งาน)
      const lightColor = rm.occupied ? 0xef4444 : 0x22c55e;
      const statusLamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({ color: lightColor })
      );
      statusLamp.position.set(cx + rm.w * 0.36, 2.55, frontZ + 0.18);
      g.add(statusLamp);

      // ป้ายสถานะแบบคลิกสลับได้เหมือนตึก ER
      const statusTxt = rm.occupied ? '🔴 ไม่ว่าง/กำลังใช้งาน' : '🟢 เปิดใช้งาน';
      L.push(
        maintTag(
          `🪧 ${rm.shortTitle} (${statusTxt})`,
          V(cx, 3.25, frontZ + 0.15),
          'room ' + (rm.occupied ? 'busy' : 'free'),
          rm.id,
          'คลิกเพื่อสลับสถานะห้อง'
        )
      );

      // ==================== เฟอร์นิเจอร์และครุภัณฑ์ภายในแต่ละห้อง (ไม่มีคนประจำ) ====================
      if (rm.num === 1) {
        // ห้องที่ 1 ห้องเย็น: ผนังฉนวนสแตนเลส + คอยล์เย็น + ชั้นสแตนเลส
        g.add(
          maintAt(maintBox(rm.w - 0.5, 0.45, 0.55, 0x38bdf8), cx, 2.15, backZ + 0.4),
          maintAt(maintBox(0.55, 0.35, 0.12, 0x0f172a), cx - 1.1, 1.65, frontZ - 0.12),
          maintAt(makeStorageShelf(1.3, 0.55, 1.75, 0x0284c7), cx - 0.9, 0, -1.2),
          maintAt(makeStorageShelf(1.3, 0.55, 1.75, 0x38bdf8), cx + 0.9, 0, -1.2)
        );
      } else if (rm.num === 2) {
        // ห้องที่ 2 อุปกรณ์งานสนาม: รถตัดหญ้า + ชั้นวางเครื่องมือเกษตร/สนาม + กรวยจราจร
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.8, 0x16a34a), cx, 0, backZ + 0.55),
          // รถตัดหญ้าเข็น
          maintAt(maintBox(0.75, 0.28, 0.95, 0xdc2626), cx - 0.85, 0.22, 0.5),
          maintAt(maintBox(0.65, 0.85, 0.06, 0x1e293b), cx - 0.85, 0.72, 0.95),
          // กรวยจราจร
          maintAt(maintCyl(0.05, 0.22, 0.55, 0xf97316, 12), cx + 0.95, 0.28, 0.8),
          maintAt(maintCyl(0.05, 0.22, 0.55, 0xf97316, 12), cx + 0.95, 0.28, 1.45)
        );
      } else if (rm.num === 3) {
        // ห้องที่ 3 เก็บครุภัณฑ์คอมพิวเตอร์+กล่อง OPD Card (ประตูอยู่ด้านขวาเชื่อมโถงโล่ง)
        g.add(
          maintAt(makeStorageShelf(1.6, 0.55, 1.85, 0x4f46e5), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.6, 0.55, 1.85, 0xd97706), cx + 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0xb45309), cx - 0.95, 0, 1.2)
        );
      } else if (rm.isHall) {
        // โถงโล่งคั่นกลางระหว่างห้องที่ 3 กับ ห้องที่ 4
        g.add(
          // พรมทางเข้าหน้าประตูหลัก
          maintAt(maintBox(1.5, 0.03, 0.95, 0x1e40af), cx, 0.03, frontZ - 0.65),
          // บอร์ดประชาสัมพันธ์งานช่างด้านในโถง
          maintAt(maintBox(2.1, 1.2, 0.08, 0x0f766e), cx, 1.55, backZ + 0.15)
        );
        L.push(
          maintTag(
            '🏛️ โถงโล่ง (คั่นกลางห้อง 3 กับ ห้อง 4)',
            V(cx, 1.35, -0.3),
            'room',
            null,
            'โถงโล่งทางเข้าหลัก เชื่อมประตูห้องที่ 3 (ซ้าย) และห้องที่ 4 (ขวา)'
          )
        );
      } else if (rm.num === 4) {
        // ห้องที่ 4 เก็บอุปกรณ์แม่บ้าน (ประตูอยู่ด้านซ้ายเชื่อมโถงโล่ง)
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.8, 0xdb2777), cx, 0, backZ + 0.55),
          // รถเข็นแม่บ้าน + ถังม็อบ
          maintAt(maintBox(0.68, 0.85, 1.1, 0x2563eb), cx + 0.85, 0.45, 0.65),
          maintAt(maintCyl(0.24, 0.2, 0.42, 0xfacc15, 14), cx + 0.85, 0.22, 1.75)
        );
      } else if (rm.num === 5) {
        // ห้องที่ 5 เอกสารห้องบัตร
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0xca8a04), cx - 0.85, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0xd97706), cx + 0.85, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0xeab308), cx - 0.95, 0, 0.7)
        );
      } else if (rm.num === 6) {
        // ห้องที่ 6 กลุ่มงานช่าง:
        // - โต๊ะ 3 ตัว เรียงชิดกำแพงซ้ายตามผัง (ไม่มีคนนั่ง)
        // - โต๊ะคอม 1 ตัว มุมขวาบนตามผัง (คลิกดูสเปกคอมได้, ไม่มีคนนั่ง)
        const deskX = x0 + 0.85;
        const deskZs = [-1.85, -0.25, 1.35];
        deskZs.forEach((dz, dIdx) => {
          const dGroup = new THREE.Group();
          // โต๊ะทำงานไม้
          dGroup.add(
            maintAt(maintBox(0.75, 0.74, 1.2, 0xd97706), 0, 0.37, 0),
            maintAt(maintBox(0.8, 0.06, 1.26, 0xfef3c7), 0, 0.75, 0),
            // เก้าอี้ทำงาน (ไม่มีคนประจำ)
            maintAt(maintBox(0.46, 0.45, 0.46, 0x1e293b), -0.48, 0.23, 0),
            maintAt(maintBox(0.08, 0.48, 0.44, 0x1e293b), -0.68, 0.65, 0)
          );
          dGroup.position.set(deskX, 0, dz);
          g.add(dGroup);
          L.push(
            maintTag(
              '🪑 โต๊ะ',
              V(deskX, 1.15, dz),
              'sub',
              null,
              `โต๊ะปฏิบัติงานกลุ่มงานช่าง ตัวที่ ${dIdx + 1}`
            )
          );
        });

        // โต๊ะคอม มุมขวาบนของห้องที่ 6
        const pcX = x1 - 1.05;
        const pcZ = -1.95;
        const pcDesk = new THREE.Group();
        pcDesk.add(
          maintAt(maintBox(1.25, 0.74, 0.75, 0x334155), 0, 0.37, 0),
          maintAt(maintBox(1.3, 0.06, 0.8, 0xe2e8f0), 0, 0.75, 0),
          // จอคอมพิวเตอร์ + เคส
          maintAt(maintBox(0.55, 0.36, 0.05, 0x0f172a), -0.1, 1.02, -0.18),
          maintAt(maintBox(0.5, 0.3, 0.02, 0x38bdf8), -0.1, 1.02, -0.15),
          maintAt(maintBox(0.14, 0.12, 0.12, 0x475569), -0.1, 0.82, -0.18),
          maintAt(maintBox(0.36, 0.02, 0.14, 0x1e293b), -0.1, 0.79, 0.12),
          maintAt(maintBox(0.22, 0.42, 0.44, 0x1e293b), 0.42, 0.98, -0.05),
          // เก้าอี้หน้าโต๊ะคอม (ไม่มีคนประจำ)
          maintAt(maintBox(0.46, 0.45, 0.46, 0x0284c7), -0.08, 0.23, 0.62),
          maintAt(maintBox(0.44, 0.48, 0.08, 0x0284c7), -0.08, 0.65, 0.82)
        );
        pcDesk.position.set(pcX, 0, pcZ);
        pcDesk.traverse((child) => {
          if (child.isMesh) child.userData.pcInfo = maintPcSpec;
        });
        g.add(pcDesk);
        L.push(
          maintTag(
            '🖥️ โต๊ะคอม',
            V(pcX, 1.55, pcZ),
            'pc',
            null,
            'คลิกเพื่อดูสเปกคอมพิวเตอร์กลุ่มงานช่าง (PC-MAINT-01)',
            maintPcSpec
          )
        );
      } else if (rm.num === 7) {
        // ห้องที่ 7 เก็บอุปกรณ์
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x475569), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x64748b), cx + 0.8, 0, backZ + 0.55)
        );
      } else if (rm.num === 8) {
        // ห้องที่ 8 เก็บอุปกรณ์ PCU
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x0d9488), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x14b8a6), cx + 0.8, 0, backZ + 0.55)
        );
      } else if (rm.num === 9) {
        // ห้องที่ 9 เก็บอุปกรณ์ครุภัณฑ์
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x0369a1), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x0284c7), cx + 0.8, 0, backZ + 0.55)
        );
      } else if (rm.num === 10 || rm.num === 11) {
        // ห้องที่ 10 และ 11 เก็บเอกสารการเงิน
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x7e22ce), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x6d28d9), cx + 0.8, 0, backZ + 0.55),
          // ตู้เหล็กเก็บเอกสารการเงิน
          maintAt(maintBox(0.85, 1.75, 0.52, 0x94a3b8), cx - 1.05, 0.88, 0.85)
        );
      } else if (rm.num === 12) {
        // ห้องที่ 12 ห้องว่าง (พื้นโล่งสะอาดตามผัง)
        L.push(
          maintTag(
            '✨ ห้องว่าง',
            V(cx, 0.85, 0),
            'sub',
            null,
            'ห้องที่ 12 พื้นที่ว่างสำรองของอาคารงานช่าง'
          )
        );
      }
    });

    const items = maintState.rooms.map((rm) => [
      rm.isHall ? '🏛️' : '🚪',
      rm.name,
      rm.occupied ? '🔴 ไม่ว่าง' : '🟢 เปิดใช้งาน',
      rm.id,
      rm.occupied ? 'busy' : 'free'
    ]);
    items.push([
      '🖥️',
      'PC-MAINT-01: โต๊ะคอม (ห้องที่ 6 กลุ่มงานช่าง)',
      'ดูสเปก',
      null,
      'free',
      maintPcSpec
    ]);

    return {
      group: g,
      labels: L,
      size: 52,
      title:
        '🔧 ผังภายในอาคารงานช่าง (ห้องที่ 1 – 12 • โถงโล่งทางเข้าหลักคั่นกลางห้องที่ 3 กับ 4 • ไม่มีคนประจำ)',
      sub: 'คลิกป้ายชื่อหน้าห้องเพื่อสลับสถานะ 🟢 เปิดใช้งาน / 🔴 ไม่ว่าง • คลิกป้าย "🖥️ โต๊ะคอม" ในห้องที่ 6 เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 29, 28), target: V(0, 0, 0.6) }
    };
  }

  // ==================== อาคารการเงิน (เค้าเตอร์คิดเงิน • โต๊ะคอมการเงิน • ประตูฝั่งซ้ายล่าง) ====================
  const financeState = {
    counterOpen: true
  };

  function buildFinanceInterior() {
    const g = new THREE.Group();
    const L = [];

    // ขนาดห้องการเงินตามผังแนวตั้ง (กว้าง 7.6 ม. X: -3.8..+3.8, ลึก 9.6 ม. Z: -4.8..+4.8)
    const W = 7.6;
    const D = 9.6;
    const xL = -W / 2; // -3.8
    const xR = W / 2;  // +3.8
    const zT = -D / 2; // -4.8
    const zB = D / 2;  // +4.8
    const WH = 2.2;

    // 1. พื้นห้องการเงิน
    floor(g, W, D, '#f8fafc', '#cbd5e1', 0.6, 0, 0);

    // 2. กำแพงรอบห้องการเงิน (เว้นช่องประตูฝั่งซ้ายล่าง Z: +1.35 .. +3.65)
    // กำแพงบน (Z = -4.8)
    g.add(maintAt(maintWall(W, WH, 0.18, 0x1e293b), 0, WH / 2, zT));
    // กำแพงล่าง (Z = +4.8)
    g.add(maintAt(maintWall(W, WH, 0.18, 0x1e293b), 0, WH / 2, zB));
    // กำแพงขวา (X = +3.8)
    g.add(maintAt(maintWall(0.18, WH, D, 0x1e293b), xR, WH / 2, 0));
    // กำแพงซ้าย (X = -3.8):
    // - ช่วงเค้าเตอร์คิดเงิน (Z: -4.8 .. +0.35) เปิดเป็นช่องหน้าต่างเคาน์เตอร์หันออกทางซ้าย มีคานบน
    // - ช่วงคั่นกลางระหว่างเค้าเตอร์คิดเงินกับประตู (Z: +0.35 .. +1.35)
    // - ช่วงล่างสุดใต้ประตู (Z: +3.65 .. +4.8)
    g.add(
      maintAt(maintWall(0.18, 0.38, 5.15, 0x1e293b), xL, WH - 0.19, -2.225),
      maintAt(maintWall(0.18, WH, 1.0, 0x1e293b), xL, WH / 2, 0.85),
      maintAt(maintWall(0.18, WH, 1.15, 0x1e293b), xL, WH / 2, 4.225),
      // คานเหนือประตู
      maintAt(maintWall(0.18, 0.35, 2.3, 0x1e293b), xL, WH - 0.175, 2.5)
    );

    // 3. ประตูทางเข้าฝั่งซ้ายล่าง (Z: +1.35 .. +3.65, กึ่งกลาง Z = +2.5) ทำกรอบยื่นคร่อมผนังซ้ายตามผัง
    const doorZ = 2.5;
    const doorFrame = new THREE.Group();
    doorFrame.position.set(xL, 0, doorZ);
    // แผ่นพื้นกรอบประตูคร่อมผนังซ้ายตามรูปผัง
    const doorPad = maintBox(1.25, 0.05, 2.3, 0xe2e8f0);
    doorPad.position.set(0, 0.025, 0);
    doorFrame.add(doorPad);
    // บานประตูเปิดเข้าด้านใน
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

    // 4. เค้าเตอร์คิดเงิน (มุมซ้ายบน ชิดกำแพงซ้าย X: -3.8 .. -1.65, Z: -4.8 .. +0.35 หันหน้าออกทางซ้าย -X)
    const cntX0 = xL + 0.05;    // -3.75 (ขอบซ้ายสุดด้านหน้าเคาน์เตอร์ที่หันไปทางซ้าย)
    const cntX1 = -1.65;        // ขอบขวาด้านในเค้าเตอร์คิดเงิน
    const cntZ0 = zT + 0.1;     // -4.7
    const cntZ1 = 0.35;         // ขอบล่างของเค้าเตอร์คิดเงิน
    const cntW = cntX1 - cntX0; // 2.10 ม.
    const cntD = cntZ1 - cntZ0; // 5.05 ม.
    const cntCX = (cntX0 + cntX1) / 2; // -2.70
    const cntCZ = (cntZ0 + cntZ1) / 2; // -2.175

    // พื้นโซนเค้าเตอร์คิดเงิน (เปลี่ยนสีตามสถานะเปิด/พักให้บริการ)
    const cntFloorCol = financeState.counterOpen ? 0xdcfce7 : 0xfecaca;
    g.add(maintAt(maintBox(cntW, 0.04, cntD, cntFloorCol), cntCX, 0.025, cntCZ));

    // ตัวเคาน์เตอร์คิดเงินหันหน้าไปทางซ้าย (-X):
    // - แนวเคาน์เตอร์หลักชิดฝั่งซ้าย (X = cntX0 + 0.36) พร้อมท็อปเคาน์เตอร์ยื่นรับผู้มาชำระเงินทางด้านซ้าย
    // - กระจกช่องชำระเงินอยู่ด้านหน้าฝั่งซ้าย (X = cntX0 + 0.08)
    // - เก้าอี้และเจ้าหน้าที่อยู่ฝั่งขวาของเคาน์เตอร์ หันหน้าไปทางซ้าย (-Math.PI / 2)
    const deskFrontX = cntX0 + 0.38; // -3.37
    const chairX = cntX1 - 0.55;     // -2.20
    g.add(
      // ตัวเคาน์เตอร์ยาวแนวตั้ง ชิดฝั่งซ้าย หันหน้าออกทางซ้าย (-X)
      maintAt(maintBox(0.68, 0.92, cntD - 0.08, 0x0284c7), deskFrontX, 0.46, cntCZ),
      maintAt(maintBox(0.82, 0.06, cntD - 0.02, 0xf8fafc), deskFrontX - 0.04, 0.95, cntCZ),
      // แผงกั้นปิดท้ายเคาน์เตอร์ด้านล่าง
      maintAt(maintBox(cntW - 0.08, 0.92, 0.24, 0x0284c7), cntCX, 0.46, cntZ1 - 0.12),
      maintAt(maintBox(cntW - 0.04, 0.06, 0.3, 0xf8fafc), cntCX, 0.95, cntZ1 - 0.12),
      // กระจกกั้นช่องการเงินด้านซ้ายสุด หันออกทางซ้าย (-X)
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
      // เครื่องพิมพ์ใบเสร็จ + ลิ้นชักเก็บเงิน วางบนเคาน์เตอร์ฝั่งซ้าย หันเข้าหาเจ้าหน้าที่ทางขวา
      maintAt(maintBox(0.42, 0.22, 0.46, 0x1e293b), deskFrontX + 0.05, 1.09, -1.6),
      maintAt(maintBox(0.32, 0.2, 0.3, 0x334155), deskFrontX + 0.05, 1.08, -2.7),
      // เก้าอี้เจ้าหน้าที่ประจำเค้าเตอร์คิดเงิน (อยู่ฝั่งขวาของเคาน์เตอร์ พนักพิงอยู่ขวา หันหน้าไปทางซ้าย)
      maintAt(maintBox(0.48, 0.46, 0.48, 0x1e293b), chairX, 0.23, -2.1),
      maintAt(maintBox(0.08, 0.48, 0.46, 0x1e293b), chairX + 0.22, 0.65, -2.1)
    );

    if (financeState.counterOpen) {
      const cashier = makePerson({
        role: 'nurse',
        shirtColor: 0x0284c7,
        pose: 'sit',
        rotY: -Math.PI / 2 // หันหน้าไปทางซ้าย (-X)
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

    // 5. โต๊ะคอมการเงิน (ชิดขอบบน ถัดจากเค้าเตอร์คิดเงินไปทางขวา X: -1.65 .. +2.15, Z: -4.8 .. -3.35)
    const pcX0 = -1.62;
    const pcX1 = 2.15;
    const pcZ0 = zT + 0.1; // -4.7
    const pcZ1 = -3.35;
    const pcW = pcX1 - pcX0; // 3.77 ม.
    const pcD = pcZ1 - pcZ0; // 1.35 ม.
    const pcCX = (pcX0 + pcX1) / 2; // +0.265
    const pcCZ = (pcZ0 + pcZ1) / 2; // -4.025

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
    // พื้นกรอบโต๊ะคอมการเงิน
    finDeskGroup.add(
      maintAt(maintBox(pcW, 0.04, pcD, 0xe0f2fe), pcCX, 0.025, pcCZ),
      // โต๊ะทำงานยาวตามกรอบ "โต๊ะคอมการเงิน"
      maintAt(maintBox(pcW - 0.25, 0.74, 0.85, 0x334155), pcCX, 0.37, pcCZ - 0.12),
      maintAt(maintBox(pcW - 0.18, 0.06, 0.92, 0xf8fafc), pcCX, 0.76, pcCZ - 0.12),
      // จอคอมพิวเตอร์ + เคส + คีย์บอร์ด + เครื่องพิมพ์ใบเสร็จ
      maintAt(maintBox(0.62, 0.38, 0.05, 0x0f172a), pcCX - 0.45, 1.04, pcCZ - 0.32),
      maintAt(maintBox(0.56, 0.32, 0.02, 0x38bdf8), pcCX - 0.45, 1.04, pcCZ - 0.29),
      maintAt(maintBox(0.16, 0.12, 0.14, 0x475569), pcCX - 0.45, 0.83, pcCZ - 0.32),
      maintAt(maintBox(0.4, 0.02, 0.15, 0x1e293b), pcCX - 0.45, 0.8, pcCZ + 0.04),
      maintAt(maintBox(0.24, 0.44, 0.46, 0x1e293b), pcCX + 0.35, 1.0, pcCZ - 0.18),
      maintAt(maintBox(0.42, 0.26, 0.38, 0x64748b), pcCX + 1.05, 0.92, pcCZ - 0.15),
      // เก้าอี้หน้าโต๊ะคอมการเงิน
      maintAt(maintBox(0.5, 0.46, 0.5, 0x2563eb), pcCX - 0.45, 0.23, pcCZ + 0.52),
      maintAt(maintBox(0.48, 0.48, 0.08, 0x1d4ed8), pcCX - 0.45, 0.65, pcCZ + 0.74)
    );

    finDeskGroup.traverse((child) => {
      if (child.isMesh) child.userData.pcInfo = financePcSpec;
    });
    g.add(finDeskGroup);

    // เจ้าหน้าที่นั่งประจำโต๊ะคอมการเงิน
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

  // ==================== โรงครัว (ครัวทำอาหารเตรียมวัตถุดิบ • โต๊ะทำครัว • ชั้นเก็บอุปกรณ์/ของแห้ง • ห้องเครื่องปรุง & โต๊ะคอมโรงครัว) ====================
  const kitchenState = {
    cookingActive: true,
    storeOpen: true
  };

  function buildKitchenInterior() {
    const g = new THREE.Group();
    const L = [];
    const WH = 2.15;

    // 1. พื้นอาคารโรงครัว (รูปตัว L ตามผัง:
    // - ปีกซ้ายบน: X = -9.5 .. -4.2 (กว้าง 5.3 ม.), Z = -4.5 .. +0.2 (ลึก 4.7 ม.)
    // - โถงครัวหลัก: X = -4.2 .. +9.5 (กว้าง 13.7 ม.), Z = -4.5 .. +4.8 (ลึก 9.3 ม.)
    // - โซนห้องเครื่องปรุง/สำนักงานมุมขวาล่าง: X = +3.8 .. +9.5 (กว้าง 5.7 ม.), Z = -1.1 .. +4.8 (ลึก 5.9 ม.)
    floor(g, 5.3, 4.7, '#fefce8', '#cbd5e1', 0.6, -6.85, -2.15);
    floor(g, 13.7, 9.3, '#f8fafc', '#cbd5e1', 0.6, 2.65, 0.15);
    floor(g, 5.7, 5.9, '#eff6ff', '#93c5fd', 0.6, 6.65, 1.85);

    // 2. กำแพงกรอบนอกและกำแพงกั้นห้องตามผัง
    // กำแพงบนสุดยาวตลอด (X: -9.5 .. +9.5, Z = -4.5)
    g.add(maintAt(maintWall(19.0, WH, 0.18, 0x1e293b), 0, WH / 2, -4.5));
    // กำแพงซ้ายสุดของปีกซ้ายบน (X = -9.5, Z: -4.5 .. +0.2)
    g.add(maintAt(maintWall(0.18, WH, 4.7, 0x1e293b), -9.5, WH / 2, -2.15));
    // กำแพงล่างของปีกซ้ายบน (Z = +0.2, X: -9.5 .. -4.2) เว้นช่องประตูที่ X: -5.9 .. -4.4
    g.add(
      maintAt(maintWall(3.6, WH, 0.18, 0x1e293b), -7.7, WH / 2, 0.2),
      maintAt(maintWall(0.2, WH, 0.18, 0x1e293b), -4.3, WH / 2, 0.2),
      maintAt(maintWall(1.5, 0.35, 0.18, 0x1e293b), -5.15, WH - 0.175, 0.2)
    );

    // กำแพงกั้นแนวตั้งที่ X = -4.2:
    // - ช่วงบนกั้นระหว่างห้องเก็บอุปกรณ์กับโถงครัวหลัก (Z: -4.5 .. +1.9)
    // - ช่วงล่างเว้นช่องประตูทางเข้าหลัก (Z: +1.9 .. +4.3) และปิดท้าย (Z: +4.3 .. +4.8)
    g.add(
      maintAt(maintWall(0.18, WH, 6.4, 0x1e293b), -4.2, WH / 2, -1.3),
      maintAt(maintWall(0.18, WH, 0.5, 0x1e293b), -4.2, WH / 2, 4.55),
      maintAt(maintWall(0.18, 0.35, 2.4, 0x1e293b), -4.2, WH - 0.175, 3.1)
    );

    // กำแพงล่างสุดของโถงครัวหลัก (Z = +4.8, X: -4.2 .. +9.5)
    g.add(maintAt(maintWall(13.7, WH, 0.18, 0x1e293b), 2.65, WH / 2, 4.8));
    // กำแพงขวาสุดของโถงครัวหลัก (X = +9.5, Z: -4.5 .. +4.8)
    g.add(maintAt(maintWall(0.18, WH, 9.3, 0x1e293b), 9.5, WH / 2, 0.15));

    // กำแพงกั้นห้องมุมขวาล่าง (X = +3.8, Z: -1.1 .. +4.8 และ Z = -1.1, X: +3.8 .. +9.5)
    // เว้นช่องประตูที่ผนัง X = +3.8 ช่วง Z: +0.15 .. +1.55 (กึ่งกลาง Z = +0.85)
    g.add(
      maintAt(maintWall(0.16, WH, 1.25, 0x475569), 3.8, WH / 2, -0.475),
      maintAt(maintWall(0.16, WH, 3.25, 0x475569), 3.8, WH / 2, 3.175),
      maintAt(maintWall(0.16, 0.35, 1.4, 0x475569), 3.8, WH - 0.175, 0.85),
      maintAt(maintWall(5.7, WH, 0.16, 0x475569), 6.65, WH / 2, -1.1)
    );

    // ฟังก์ชันสร้างกรอบประตูคร่อมผนังตามแบบผัง
    function makePlanDoor(x, z, w, d, leafRotY = 0.35) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const pad = maintBox(w, 0.05, d, 0xe2e8f0);
      pad.position.set(0, 0.025, 0);
      dg.add(pad);
      const isHoriz = w > d;
      const leaf = maintBox(isHoriz ? w * 0.8 : 0.08, 1.82, isHoriz ? 0.08 : d * 0.8, 0xd97706);
      leaf.position.set(0, 0.92, 0);
      leaf.rotation.y = leafRotY;
      dg.add(leaf);
      g.add(dg);
    }

    // 3. ประตูทั้ง 3 จุดตามผัง
    // (1) ประตูห้องเก็บอุปกรณ์/ของแห้ง ฝั่งซ้ายบน (X = -5.15, Z = +0.2)
    makePlanDoor(-5.15, 0.2, 1.55, 0.85, 0.35);
    L.push(maintTag('🚪 ประตู', V(-5.15, 1.45, 0.2), 'sub', null, 'ประตูห้องเก็บอุปกรณ์และของแห้ง'));

    // (2) ประตูหลักเข้าโถงโรงครัว ฝั่งซ้ายล่าง (X = -4.2, Z = +3.1)
    makePlanDoor(-4.2, 3.1, 1.15, 2.35, 0.38);
    L.push(maintTag('🚪 ประตู', V(-4.2, 1.45, 3.1), 'room', null, 'ประตูทางเข้าหลักอาคารโรงครัว'));

    // (3) ประตูห้องเครื่องปรุง/โต๊ะคอมโรงครัว ฝั่งขวาล่าง (X = +3.8, Z = +0.85)
    makePlanDoor(3.8, 0.85, 1.45, 0.85, -0.35);
    L.push(maintTag('🚪 ประตู', V(3.8, 1.45, 0.85), 'sub', null, 'ประตูเข้าห้องเครื่องปรุงและโต๊ะคอมโรงครัว'));

    // 4. ภายในห้องซ้ายบน: "ชั้นเก็บอุปกรณ์" และ "โต๊ะคอมหัวหน้า"
    // ชั้นเก็บอุปกรณ์ (ด้านบน: X = -6.85, Z = -3.1, กว้าง 3.5 ม., ลึก 1.05 ม.)
    const equipShelf = makeStorageShelf(3.5, 1.05, 1.85, 0x0284c7);
    equipShelf.position.set(-6.85, 0, -3.1);
    g.add(equipShelf);
    L.push(
      maintTag(
        `🗄️ ชั้นเก็บอุปกรณ์ (${kitchenState.storeOpen ? '🟢 พร้อมใช้งาน' : '🔴 ปิดตรวจนับ'})`,
        V(-6.85, 2.15, -3.1),
        'room ' + (kitchenState.storeOpen ? 'free' : 'busy'),
        'kitchen-store',
        'คลิกเพื่อสลับสถานะห้องเก็บอุปกรณ์'
      )
    );

    // โต๊ะคอมหัวหน้า (ด้านล่างซ้ายของห้องซ้ายบน: X = -7.45, Z = -0.75, กว้าง 2.2 ม., ลึก 0.9 ม. หันหน้าขึ้นด้านบนตามทิศตัวหนังสือกลับหัวในผัง)
    const headKitchenPcSpec = {
      code: 'PC-KIT-02',
      name: 'โต๊ะคอมหัวหน้า (หัวหน้างานโภชนาการและโรงครัว)',
      role: 'บริหารงานโภชนาการ วางแผนเมนูอาหารผู้ป่วย ตรวจสอบงบประมาณและอนุมัติการเบิกวัตถุดิบ',
      user: 'หัวหน้างานโภชนาการ โรงพยาบาลโคกศรีสุพรรณ',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i7-12700 (12C/20T @ 4.9GHz)',
      ram: '16 GB DDR4 3200MHz',
      storage: 'SSD NVMe 512 GB',
      monitor: '24" FHD IPS Monitor',
      ip: '192.168.18.41',
      software: 'ระบบบริหารงานโภชนาการ HOSxP • ระบบสารบรรณอิเล็กทรอนิกส์ • ระบบคลังพัสดุและงบประมาณ',
      peripherals: 'เครื่องพิมพ์เลเซอร์ขาว-ดำ • เครื่องสำรองไฟ UPS 1000VA',
      status: '🟢 ออนไลน์ปกติ'
    };

    const headPcGroup = new THREE.Group();
    const hkX = -7.45;
    const hkZ = -0.85;
    headPcGroup.add(
      maintAt(maintBox(2.15, 0.74, 0.85, 0x1e293b), hkX, 0.37, hkZ),
      maintAt(maintBox(2.22, 0.06, 0.92, 0xf8fafc), hkX, 0.76, hkZ),
      // จอคอมพิวเตอร์ตั้งด้านบนของโต๊ะ หันหน้าเข้าหาเก้าอี้ด้านล่าง (+Z)
      maintAt(maintBox(0.62, 0.38, 0.05, 0x0f172a), hkX, 1.04, hkZ - 0.22),
      maintAt(maintBox(0.56, 0.32, 0.02, 0x38bdf8), hkX, 1.04, hkZ - 0.19),
      maintAt(maintBox(0.16, 0.12, 0.14, 0x475569), hkX, 0.83, hkZ - 0.22),
      maintAt(maintBox(0.4, 0.02, 0.15, 0x0f172a), hkX, 0.8, hkZ + 0.1),
      maintAt(maintBox(0.24, 0.44, 0.44, 0x0f172a), hkX + 0.68, 1.0, hkZ - 0.08),
      // เก้าอี้หัวหน้างาน (อยู่ด้านล่างโต๊ะ หันหน้าขึ้นด้านบน -Z เข้าหาโต๊ะ)
      maintAt(maintBox(0.5, 0.46, 0.5, 0x0284c7), hkX, 0.23, hkZ + 0.62),
      maintAt(maintBox(0.48, 0.5, 0.08, 0x0369a1), hkX, 0.66, hkZ + 0.84)
    );
    headPcGroup.traverse((child) => {
      if (child.isMesh) child.userData.pcInfo = headKitchenPcSpec;
    });
    g.add(headPcGroup);

    const headChef = makePerson({
      role: 'doctor',
      shirtColor: 0x0284c7,
      pose: 'sit',
      rotY: 0
    });
    headChef.position.set(hkX, 0, hkZ + 0.62);
    g.add(headChef);

    L.push(
      maintTag(
        '🖥️ โต๊ะคอมหัวหน้า (คลิกดูสเปก)',
        V(hkX, 1.75, hkZ),
        'pc',
        null,
        'คลิกเพื่อดูสเปกคอมพิวเตอร์โต๊ะคอมหัวหน้า (PC-KIT-02)',
        headKitchenPcSpec
      )
    );

    // 5. โถงครัวหลัก: "ครัวทำอาหารเตรียมวัตถุดิบ" (แนวยาวด้านบน X: -3.9 .. +9.1, Z = -3.1)
    const cookX = 2.6;
    const cookZ = -3.1;
    const cookW = 13.0;
    const cookD = 1.25;
    const cookFloorCol = kitchenState.cookingActive ? 0xffedd5 : 0xf1f5f9;
    g.add(
      maintAt(maintBox(cookW, 0.04, cookD + 0.2, cookFloorCol), cookX, 0.025, cookZ),
      // เคาน์เตอร์สแตนเลสยาวสำหรับทำอาหารและเตรียมวัตถุดิบ
      maintAt(maintBox(cookW - 0.2, 0.86, cookD, 0x94a3b8), cookX, 0.43, cookZ),
      maintAt(maintBox(cookW - 0.1, 0.06, cookD + 0.06, 0xe2e8f0), cookX, 0.89, cookZ),
      // ฮูดดูดควันสแตนเลสเหนือเตาทำอาหาร
      maintAt(maintBox(5.5, 0.42, 1.15, 0xcbd5e1), 0.2, 1.92, cookZ),
      // เตาแก๊สและหม้อต้มซุปขนาดใหญ่
      maintAt(maintCyl(0.32, 0.32, 0.38, 0x475569, 16), -1.4, 1.1, cookZ),
      maintAt(maintCyl(0.32, 0.32, 0.38, 0x475569, 16), -0.3, 1.1, cookZ),
      maintAt(maintCyl(0.28, 0.28, 0.32, 0x334155, 16), 0.8, 1.07, cookZ),
      // อ่างล้างวัตถุดิบสแตนเลสและเขียงเตรียมอาหารฝั่งขวา
      maintAt(maintBox(1.8, 0.08, 0.75, 0x64748b), 4.6, 0.93, cookZ),
      maintAt(maintBox(1.4, 0.05, 0.65, 0xfef08a), 7.2, 0.93, cookZ)
    );

    if (kitchenState.cookingActive) {
      const chef1 = makePerson({ role: 'nurse', shirtColor: 0xffffff, pose: 'stand', rotY: Math.PI });
      chef1.position.set(-0.8, 0, -2.0);
      const chef2 = makePerson({ role: 'nurse', shirtColor: 0xffffff, pose: 'stand', rotY: Math.PI });
      chef2.position.set(5.2, 0, -2.0);
      g.add(chef1, chef2);
    }

    L.push(
      maintTag(
        `🍳 ครัวทำอาหารเตรียมวัตถุดิบ (${kitchenState.cookingActive ? '🟢 กำลังประกอบอาหาร' : '🔴 พักครัว'})`,
        V(cookX, 2.35, cookZ),
        'room ' + (kitchenState.cookingActive ? 'free' : 'busy'),
        'kitchen-cook',
        'คลิกเพื่อสลับสถานะครัวทำอาหารเตรียมวัตถุดิบ'
      )
    );

    // 6. "โต๊ะทำครัว" 2 จุด (แนวตั้งฝั่งซ้าย และ แนวตั้งกลางโถง)
    // (1) โต๊ะทำครัวฝั่งซ้าย (X = -3.45, Z = -0.35, กว้าง 1.1 ม., ลึก 3.6 ม.)
    g.add(
      maintAt(maintBox(1.1, 0.84, 3.6, 0x94a3b8), -3.45, 0.42, -0.35),
      maintAt(maintBox(1.18, 0.06, 3.68, 0xf1f5f9), -3.45, 0.87, -0.35),
      // ถาดอาหารสแตนเลสบนโต๊ะทำครัวซ้าย
      maintAt(maintBox(0.65, 0.12, 0.95, 0xcbd5e1), -3.45, 0.96, -1.1),
      maintAt(maintBox(0.65, 0.12, 0.95, 0xcbd5e1), -3.45, 0.96, 0.4)
    );
    L.push(maintTag('🔪 โต๊ะทำครัว', V(-3.45, 1.45, -0.35), 'room', null, 'โต๊ะทำครัวและจัดเตรียมถาดอาหาร (ฝั่งซ้าย)'));

    // (2) โต๊ะทำครัวกลางโถง (X = -0.35, Z = +0.95, กว้าง 1.15 ม., ลึก 3.8 ม.)
    g.add(
      maintAt(maintBox(1.15, 0.84, 3.8, 0x94a3b8), -0.35, 0.42, 0.95),
      maintAt(maintBox(1.22, 0.06, 3.88, 0xf1f5f9), -0.35, 0.87, 0.95),
      maintAt(maintBox(0.7, 0.14, 1.0, 0x38bdf8), -0.35, 0.97, 0.1),
      maintAt(maintBox(0.7, 0.14, 1.0, 0xfbbf24), -0.35, 0.97, 1.75)
    );
    L.push(maintTag('🔪 โต๊ะทำครัว', V(-0.35, 1.45, 0.95), 'room', null, 'โต๊ะทำครัวกลางโถงโรงครัว'));

    // 7. ภายในห้องมุมขวาล่าง:
    // (1) ชั้นเก็บเครื่องปรุง (แนวนอนด้านบน: X = +5.95, Z = -0.45, กว้าง 3.9 ม., ลึก 1.0 ม.)
    const spiceShelfTop = makeStorageShelf(3.9, 1.0, 1.8, 0x16a34a);
    spiceShelfTop.position.set(5.95, 0, -0.45);
    g.add(spiceShelfTop);
    L.push(maintTag('🧂 ชั้นเก็บเครื่องปรุง', V(5.95, 2.05, -0.45), 'room', null, 'ชั้นเก็บเครื่องปรุง (ด้านบน)'));

    // (2) ชั้นเก็บเครื่องปรุง (แนวตั้งชิดผนังขวาล่าง: X = +8.8, Z = +3.1, กว้าง 1.1 ม., ลึก 2.9 ม.)
    const spiceShelfRight = makeStorageShelf(2.9, 1.05, 1.8, 0xea580c);
    spiceShelfRight.rotation.y = Math.PI / 2;
    spiceShelfRight.position.set(8.8, 0, 3.1);
    g.add(spiceShelfRight);
    L.push(maintTag('🧂 ชั้นเก็บเครื่องปรุง', V(8.8, 2.05, 3.1), 'room', null, 'ชั้นเก็บเครื่องปรุง (ชิดผนังขวาล่าง)'));

    // (3) โต๊ะ 2 ตัวเรียงกัน (ตัวบน Z = +2.05, ตัวล่าง Z = +3.35 ที่ X = +5.3)
    [2.05, 3.35].forEach((tz, idx) => {
      g.add(
        maintAt(maintBox(1.95, 0.74, 0.82, 0xd97706), 5.3, 0.37, tz),
        maintAt(maintBox(2.02, 0.06, 0.88, 0xfef3c7), 5.3, 0.76, tz),
        maintAt(maintBox(0.45, 0.45, 0.45, 0x334155), 5.3, 0.23, tz + 0.55)
      );
      L.push(maintTag('🪑 โต๊ะ', V(5.3, 1.25, tz), 'sub', null, `โต๊ะปฏิบัติงานโภชนาการ ตัวที่ ${idx + 1}`));
    });

    // (4) โต๊ะคอมโรงครัว (แนวตั้งชิดผนังขวาบนของห้องย่อย: X = +8.8, Z = +0.15, กว้าง 1.1 ม., ลึก 2.35 ม.)
    const kitchenPcSpec = {
      code: 'PC-KIT-01',
      name: 'โต๊ะคอมโรงครัว (งานโภชนาการและอาหารผู้ป่วยใน)',
      role: 'บริหารจัดการรายการอาหารผู้ป่วยในเฉพาะโรค คำนวณโภชนาการ และเบิกจ่ายวัตถุดิบโรงครัว',
      user: 'นักโภชนาการ / เจ้าหน้าที่งานโภชนาการ โรงพยาบาลโคกศรีสุพรรณ',
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i5-12400 (6C/12T @ 4.4GHz)',
      ram: '16 GB DDR4 3200MHz',
      storage: 'SSD NVMe 512 GB',
      monitor: '24" FHD IPS Monitor',
      ip: '192.168.18.45',
      software: 'ระบบโภชนาการโรงพยาบาล (HOSxP Nutrition & Diet) • ระบบเบิกจ่ายคลังวัตถุดิบอาหาร',
      peripherals: 'เครื่องพิมพ์ฉลากถาดอาหารผู้ป่วย • เครื่องสำรองไฟ UPS 1000VA',
      status: '🟢 ออนไลน์ปกติ'
    };

    const kitPcGroup = new THREE.Group();
    const kpX = 8.8;
    const kpZ = 0.15;
    kitPcGroup.add(
      maintAt(maintBox(1.1, 0.74, 2.3, 0x334155), kpX, 0.37, kpZ),
      maintAt(maintBox(1.16, 0.06, 2.36, 0xf8fafc), kpX, 0.76, kpZ),
      // จอคอมพิวเตอร์หันไปทางซ้าย (-X) เข้าหาเก้าอี้
      maintAt(maintBox(0.05, 0.38, 0.62, 0x0f172a), kpX + 0.25, 1.04, kpZ),
      maintAt(maintBox(0.02, 0.32, 0.56, 0x38bdf8), kpX + 0.22, 1.04, kpZ),
      maintAt(maintBox(0.14, 0.12, 0.16, 0x475569), kpX + 0.25, 0.83, kpZ),
      maintAt(maintBox(0.15, 0.02, 0.4, 0x1e293b), kpX - 0.1, 0.8, kpZ),
      maintAt(maintBox(0.44, 0.44, 0.24, 0x1e293b), kpX + 0.15, 1.0, kpZ - 0.65),
      // เก้าอี้หน้าโต๊ะคอมโรงครัว (อยู่ฝั่งซ้ายของโต๊ะ หันขวาเข้าหาจอ)
      maintAt(maintBox(0.48, 0.46, 0.48, 0x2563eb), kpX - 0.82, 0.23, kpZ),
      maintAt(maintBox(0.08, 0.48, 0.46, 0x1d4ed8), kpX - 1.04, 0.65, kpZ)
    );
    kitPcGroup.traverse((child) => {
      if (child.isMesh) child.userData.pcInfo = kitchenPcSpec;
    });
    g.add(kitPcGroup);

    const dietitian = makePerson({
      role: 'nurse',
      shirtColor: 0x0ea5e9,
      pose: 'sit',
      rotY: Math.PI / 2
    });
    dietitian.position.set(kpX - 0.82, 0, kpZ);
    g.add(dietitian);

    L.push(
      maintTag(
        '🖥️ โต๊ะคอมโรงครัว (คลิกดูสเปก)',
        V(kpX, 1.75, kpZ),
        'pc',
        null,
        'คลิกเพื่อดูสเปกคอมพิวเตอร์โต๊ะคอมโรงครัว (PC-KIT-01)',
        kitchenPcSpec
      )
    );

    const items = [
      [
        '🍳',
        'ครัวทำอาหารเตรียมวัตถุดิบ (แนวยาวด้านบน)',
        kitchenState.cookingActive ? '🟢 กำลังประกอบอาหาร' : '🔴 พักครัว',
        'kitchen-cook',
        kitchenState.cookingActive ? 'free' : 'busy'
      ],
      [
        '🗄️',
        'ชั้นเก็บอุปกรณ์ (ห้องฝั่งซ้ายบน)',
        kitchenState.storeOpen ? '🟢 พร้อมใช้งาน' : '🔴 ปิดตรวจนับ',
        'kitchen-store',
        kitchenState.storeOpen ? 'free' : 'busy'
      ],
      [
        '🖥️',
        'PC-KIT-02: โต๊ะคอมหัวหน้า (ห้องฝั่งซ้ายบน)',
        'ดูสเปก',
        null,
        'free',
        headKitchenPcSpec
      ],
      [
        '🖥️',
        'PC-KIT-01: โต๊ะคอมโรงครัว (ชิดผนังขวา)',
        'ดูสเปก',
        null,
        'free',
        kitchenPcSpec
      ],
      ['🔪', 'โต๊ะทำครัว (ฝั่งซ้าย & กลางโถง)', '2 จุด'],
      ['🧂', 'ชั้นเก็บเครื่องปรุง (ด้านบน & ด้านขวาล่าง)', '2 จุด'],
      ['🪑', 'โต๊ะปฏิบัติงานในห้องเครื่องปรุง', '2 ตัว'],
      ['🚪', 'ประตูทางเข้า-ออกและเชื่อมโซน', '3 บาน']
    ];

    return {
      group: g,
      labels: L,
      size: 21,
      title:
        '🍳 ผังภายในโรงครัว: ครัวทำอาหารเตรียมวัตถุดิบ • โต๊ะทำครัว • ชั้นเก็บอุปกรณ์ & โต๊ะคอมหัวหน้า • ชั้นเก็บเครื่องปรุง & โต๊ะคอมโรงครัว',
      sub: 'คลิกป้าย "ครัวทำอาหารเตรียมวัตถุดิบ" หรือ "ชั้นเก็บอุปกรณ์" เพื่อสลับสถานะ • คลิกป้าย "🖥️ โต๊ะคอมหัวหน้า" หรือ "🖥️ โต๊ะคอมโรงครัว" เพื่อดูสเปกคอมพิวเตอร์',
      items,
      cam: { pos: V(0, 18.5, 16.5), target: V(0, 0, 0.2) }
    };
  }

  // ==================== ห้องยา (โซนจ่ายยา • โต๊ะคอมจ่ายยา 1–7 • โต๊ะจัดยา • คลังยา • คลังน้ำเกลือ+ตู้แช่ยา • ห้องพักเจ้าหน้าที่) ====================
  const pharmacyState = {
    dispensingOpen: true,
    mainStoreOpen: true,
    coldStoreActive: true
  };

  function buildPharmacyInterior() {
    const g = new THREE.Group();
    const L = [];
    const WH = 2.4;

    // ขนาดห้องยารวม: กว้าง 24.0 ม. (X: -12.0 .. +12.0), ลึก 17.0 ม. (Z: -8.5 .. +8.5)
    // จัดทุกส่วนให้อยู่ในกรอบอย่างแม่นยำ ไม่ล้นออกนอกผนัง
    const xMin = -12.0, xMax = 12.0;
    const zMin = -8.5,  zMax = 8.5;
    const wThick = 0.18;

    // 1. พื้นแต่ละโซนตามผัง (ควบคุมพิกัดให้อยู่ในกรอบ xMin..xMax, zMin..zMax)
    // โซนจ่ายยาและจัดยาฝั่งซ้าย (X: -12.0 .. -6.8, Z: -8.5 .. +8.5)
    floor(g, 5.2, 17.0, '#f0fdf4', '#bbf7d0', 0.6, -9.4, 0);
    // คลังยาห้องใหญ่ (X: -6.8 .. +2.8, Z: -8.5 .. -0.8)
    floor(g, 9.6, 7.7, '#fefce8', '#cbd5e1', 0.6, -2.0, -4.65);
    // คลังยาห้องกลาง (X: +2.8 .. +6.8, Z: -8.5 .. -0.8)
    floor(g, 4.0, 7.7, '#fffbeb', '#cbd5e1', 0.6, 4.8, -4.65);
    // คลังน้ำเกลือและตู้แช่ยาห้องขวาบน (X: +6.8 .. +12.0, Z: -8.5 .. -0.8)
    floor(g, 5.2, 7.7, '#e0f2fe', '#93c5fd', 0.6, 9.4, -4.65);
    // โถงกลางและพื้นที่โต๊ะทำงาน (X: -6.8 .. +9.5, Z: -0.8 .. +8.5)
    floor(g, 16.3, 9.3, '#f8fafc', '#cbd5e1', 0.6, 1.35, 3.85);
    // ห้องพักเจ้าหน้าที่ฝั่งขวาล่าง (X: +9.5 .. +12.0, Z: -0.8 .. +8.5)
    floor(g, 2.5, 9.3, '#f5f3ff', '#ddd6fe', 0.6, 10.75, 3.85);

    // 2. ผนังรอบนอกอาคารห้องยา (กักขอบเป๊ะที่ ±12.0 และ ±8.5)
    const zTopWall = zMin + wThick / 2; // -8.41
    const zBtmWall = zMax - wThick / 2; // +8.41
    const xLftWall = xMin + wThick / 2; // -11.91
    const xRgtWall = xMax - wThick / 2; // +11.91

    // ผนังบน (Z = zTopWall) เว้นช่องประตูด้านบนขวาของคลังน้ำเกลือ (X: +9.8 .. +11.4)
    g.add(
      maintAt(maintWall(21.8, WH, wThick, 0x1e293b), -1.1, WH / 2, zTopWall),
      maintAt(maintWall(0.6, WH, wThick, 0x1e293b), 11.7, WH / 2, zTopWall),
      maintAt(maintWall(1.6, 0.35, wThick, 0x1e293b), 10.6, WH - 0.175, zTopWall)
    );

    // ผนังขวาสุด (X = xRgtWall)
    g.add(maintAt(maintWall(wThick, WH, 17.0, 0x1e293b), xRgtWall, WH / 2, 0));

    // ผนังล่าง (Z = zBtmWall) เว้นช่องประตู 2 บาน (X: -11.6 .. -10.2 และ X: -3.5 .. -2.1)
    g.add(
      maintAt(maintWall(0.4, WH, wThick, 0x1e293b), -11.8, WH / 2, zBtmWall),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -10.9, WH - 0.175, zBtmWall),
      maintAt(maintWall(6.7, WH, wThick, 0x1e293b), -6.85, WH / 2, zBtmWall),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -2.8, WH - 0.175, zBtmWall),
      maintAt(maintWall(14.1, WH, wThick, 0x1e293b), 4.95, WH / 2, zBtmWall)
    );

    // ผนังซ้ายสุด (X = xLftWall) แบบเคาน์เตอร์บริการช่องจ่ายยา/ห้องเก็บเงิน:
    // - ช่วงทึบด้านบนสุด (Z: -8.5 .. -7.2)
    // - ช่วงเคาน์เตอร์คิดเงิน/จ่ายยา (Z: -7.2 .. +6.6): กำแพงล่างใต้เคาน์เตอร์ (สูง 0.90 ม.) และคานบนเหนือช่องกระจก (สูง 0.40 ม.)
    // - ช่วงทึบด้านล่างสุด (Z: +6.6 .. +8.5)
    g.add(
      maintAt(maintWall(wThick, WH, 1.3, 0x1e293b), xLftWall, WH / 2, -7.85),
      maintAt(maintWall(wThick, 0.90, 13.8, 0x1e293b), xLftWall, 0.45, -0.3),
      maintAt(maintWall(wThick, 0.40, 13.8, 0x1e293b), xLftWall, WH - 0.20, -0.3),
      maintAt(maintWall(wThick, WH, 1.9, 0x1e293b), xLftWall, WH / 2, 7.55)
    );

    // 3. ผนังกั้นภายในห้องยา (อยู่ในกรอบ)
    // ผนังกั้นระหว่างโซนจ่ายยา (ซ้าย) กับ โถงหลัก (X = -6.8):
    g.add(
      maintAt(maintWall(0.18, WH, 12.9, 0x1e293b), -6.8, WH / 2, -2.05),
      maintAt(maintWall(0.18, 0.35, 1.6, 0x1e293b), -6.8, WH - 0.175, 5.2),
      maintAt(maintWall(0.18, WH, 2.3, 0x2563eb), -6.8, WH / 2, 7.15)
    );

    // ผนังแนวนอนกั้นโซนคลังยาด้านบน (Z = -0.8, X: -6.8 .. +12.0):
    g.add(
      maintAt(maintWall(7.6, WH, 0.18, 0x1e293b), -3.0, WH / 2, -0.8),
      maintAt(maintWall(1.6, 0.35, 0.18, 0x1e293b), 1.6, WH - 0.175, -0.8),
      maintAt(maintWall(0.7, WH, 0.18, 0x1e293b), 2.75, WH / 2, -0.8),
      maintAt(maintWall(1.6, 0.35, 0.18, 0x1e293b), 3.9, WH - 0.175, -0.8),
      maintAt(maintWall(7.3, WH, 0.18, 0x1e293b), 8.35, WH / 2, -0.8)
    );

    // ผนังกั้นห้องแนวตั้งระหว่างคลังยา:
    // (1) กั้นระหว่างคลังยาใหญ่กับคลังยากลาง (X = +2.8, Z: -8.4 .. -0.8)
    g.add(maintAt(maintWall(0.16, WH, 7.6, 0x1e293b), 2.8, WH / 2, -4.6));
    // (2) กั้นระหว่างคลังยากลางกับคลังน้ำเกลือ (X = +6.8, Z: -8.4 .. -0.8) เว้นช่องประตูเชื่อมช่วง Z: -7.8 .. -6.2
    g.add(
      maintAt(maintWall(0.16, WH, 0.7, 0x1e293b), 6.8, WH / 2, -8.05),
      maintAt(maintWall(0.16, 0.35, 1.6, 0x1e293b), 6.8, WH - 0.175, -7.0),
      maintAt(maintWall(0.16, WH, 5.3, 0x1e293b), 6.8, WH / 2, -3.55)
    );

    // (3) ผนังกั้น "ห้องพักเจ้าหน้าที่" ฝั่งขวาล่าง (X = +9.5, Z: -0.8 .. +8.4) เว้นช่องประตูที่ Z: +1.0 .. +2.6
    g.add(
      maintAt(maintWall(0.16, WH, 1.8, 0x475569), 9.5, WH / 2, 0.1),
      maintAt(maintWall(0.16, 0.35, 1.6, 0x475569), 9.5, WH - 0.175, 1.8),
      maintAt(maintWall(0.16, WH, 5.7, 0x475569), 9.5, WH / 2, 5.45)
    );

    // ฟังก์ชันสร้างประตูที่อยู่ภายในกรอบห้องอย่างพอดี
    function makePharDoor(x, z, w, d, rotY = 0) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const isHoriz = w >= d;
      // แผ่นธรณีประตู
      const pad = maintBox(w, 0.04, d, 0xe2e8f0);
      pad.position.set(0, 0.02, 0);
      dg.add(pad);
      // บานประตูไม้
      const leaf = maintBox(isHoriz ? w * 0.82 : 0.07, 1.95, isHoriz ? 0.07 : d * 0.82, 0xd97706);
      leaf.position.set(0, 0.98, 0);
      leaf.rotation.y = rotY;
      dg.add(leaf);
      g.add(dg);
    }

    // ประตูทุกบานอยู่ภายในกรอบ:
    // 1. ประตูด้านล่างซ้ายสุด (X = -10.9, Z = zBtmWall)
    makePharDoor(-10.9, zBtmWall - 0.05, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-10.9, 1.45, zBtmWall - 0.35), 'sub', null, 'ประตูเข้า-ออกโซนจ่ายยา (ฝั่งซ้ายล่าง)'));

    // 2. ประตูกั้นระหว่างโซนจ่ายยากับโถงกลาง (X = -6.8, Z = +5.2)
    makePharDoor(-6.8, 5.2, 0.45, 1.5, -0.38);
    L.push(maintTag('🚪 ประตู', V(-6.8, 1.45, 5.2), 'sub', null, 'ประตูเชื่อมระหว่างโซนจ่ายยากับโถงห้องยา'));

    // 3. ประตูด้านล่างกลางห้องยา (X = -2.8, Z = zBtmWall)
    makePharDoor(-2.8, zBtmWall - 0.05, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-2.8, 1.45, zBtmWall - 0.35), 'room', null, 'ประตูทางเข้าหลักห้องยา (ฝั่งด้านหน้า)'));

    // 4. ประตูคลังยาห้องใหญ่ (X = +1.6, Z = -0.8)
    makePharDoor(1.6, -0.8, 1.5, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(1.6, 1.45, -0.8), 'sub', null, 'ประตูเข้าคลังยาห้องใหญ่'));

    // 5. ประตูคลังยาห้องกลาง (X = +3.9, Z = -0.8)
    makePharDoor(3.9, -0.8, 1.5, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(3.9, 1.45, -0.8), 'sub', null, 'ประตูเข้าคลังยาห้องกลาง'));

    // 6. ประตูเชื่อมระหว่างคลังยากลางกับคลังน้ำเกลือ (X = +6.8, Z = -7.0)
    makePharDoor(6.8, -7.0, 0.45, 1.5, 0.38);
    L.push(maintTag('🚪 ประตู', V(6.8, 1.45, -7.0), 'sub', null, 'ประตูเชื่อมคลังยากับคลังน้ำเกลือ'));

    // 7. ประตูด้านบนขวาของคลังน้ำเกลือ (X = +10.6, Z = zTopWall)
    makePharDoor(10.6, zTopWall + 0.05, 1.5, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(10.6, 1.45, zTopWall + 0.35), 'sub', null, 'ประตูโหลดสินค้าคลังน้ำเกลือ'));

    // 8. ประตูเข้าห้องพักเจ้าหน้าที่ใต้ที่นั่ง (X = +9.5, Z = +1.8)
    makePharDoor(9.5, 1.8, 0.45, 1.5, -0.38);
    L.push(maintTag('🚪 ประตูห้องพักเจ้าหน้าที่', V(9.5, 1.45, 1.8), 'sub', null, 'ประตูเข้าห้องพักเจ้าหน้าที่ห้องยา'));

    // 4. สเปกคอมพิวเตอร์และฟังก์ชันสร้างโต๊ะคอมหันหน้าเข้ากำแพง
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

    // สร้างโต๊ะคอมพิวเตอร์แบบเดี่ยว (สำหรับโต๊ะคอม 5, 6, 7 ที่หันหน้าเข้ากำแพงล่าง)
    // rotY = Math.PI -> จออยู่ล่าง (+Z) ชิดกำแพงล่าง, เก้าอี้อยู่บน (-Z), คนนั่งหันหน้าลงใต้ (+Z เข้าหากำแพงล่าง)
    function createPharPcDesk(x, z, rotY, spec, labelText, personOpts = null) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      dg.add(
        // โต๊ะทำงาน
        maintAt(maintBox(1.2, 0.74, 0.75, 0x334155), 0, 0.37, 0),
        maintAt(maintBox(1.25, 0.06, 0.8, 0xf8fafc), 0, 0.76, 0),
        // จอคอมพิวเตอร์ + เคส + คีย์บอร์ด (หันเข้าหาเก้าอี้)
        maintAt(maintBox(0.58, 0.36, 0.05, 0x0f172a), 0, 1.02, -0.22),
        maintAt(maintBox(0.52, 0.3, 0.02, 0x38bdf8), 0, 1.02, -0.19),
        maintAt(maintBox(0.14, 0.12, 0.12, 0x475569), 0, 0.82, -0.22),
        maintAt(maintBox(0.38, 0.02, 0.14, 0x1e293b), 0, 0.79, 0.12),
        maintAt(maintBox(0.22, 0.42, 0.44, 0x1e293b), 0.42, 0.98, -0.08),
        // เครื่องพิมพ์ฉลากยา
        maintAt(maintBox(0.28, 0.2, 0.28, 0x64748b), -0.42, 0.88, -0.05),
        // เก้าอี้ทำงาน
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

    // =========================================================================
    // 5. เคาน์เตอร์คิดเงิน/จ่ายยา ช่อง 1–4 แบบห้องเก็บเงิน (Cashier-Style Counter)
    // โต๊ะคอมจ่ายยา 1–4 ออกแบบเป็นแนวเคาน์เตอร์ยาวต่อเนื่องแบบเคาน์เตอร์การเงิน
    // มีฐานเคาน์เตอร์ทึบ, ท็อปเคาน์เตอร์สีขาว, กระจกกั้นช่องพร้อมช่องส่งมอบยา,
    // ลิ้นชักเก็บเงิน, เครื่องพิมพ์ใบเสร็จ/ฉลากยา, เครื่องสแกนบาร์โค้ด และคอมพิวเตอร์
    // เก้าอี้และเภสัชกรอยู่ด้านใน (+X) หันหน้าไปทางซ้าย (-X) เข้าหาช่องจ่ายยา
    // =========================================================================
    const pharCntX0 = xLftWall + 0.06; // -11.85 (ขอบหน้าเคาน์เตอร์ชิดกำแพงซ้าย)
    const pharCntX1 = -10.05;          // ขอบหลังของโซนเคาน์เตอร์
    const pharCntW = pharCntX1 - pharCntX0; // 1.80 ม.
    const pharCntCX = (pharCntX0 + pharCntX1) / 2; // -10.95
    const pharDeskX = pharCntX0 + 0.38; // -11.47 (แนวโต๊ะเคาน์เตอร์)
    const pharChairX = pharCntX1 - 0.48; // -10.53 (แนวเก้าอี้เภสัชกร)

    const pharZ0 = -7.2; // ขอบบนของเคาน์เตอร์
    const pharZ1 = 6.6;  // ขอบล่างของเคาน์เตอร์
    const pharD = pharZ1 - pharZ0; // 13.8 ม.
    const pharCZ = (pharZ0 + pharZ1) / 2; // -0.3

    // พื้นโซนเคาน์เตอร์คิดเงิน/จ่ายยา (เปลี่ยนสีตามสถานะเปิด/พักให้บริการแบบห้องการเงิน)
    const pharCntFloorCol = pharmacyState.dispensingOpen ? 0xdcfce7 : 0xfecaca;
    g.add(maintAt(maintBox(pharCntW, 0.03, pharD, pharCntFloorCol), pharCntCX, 0.015, pharCZ));

    // ตัวเคาน์เตอร์หลักยาวแนวตั้ง ชิดฝั่งซ้าย หันหน้าออกทางซ้าย (-X) แบบห้องเก็บเงิน
    g.add(
      // ฐานเคาน์เตอร์ยาวต่อเนื่องสีฟ้า/น้ำเงินการเงิน
      maintAt(maintBox(0.68, 0.92, pharD - 0.08, 0x0284c7), pharDeskX, 0.46, pharCZ),
      // ท็อปเคาน์เตอร์สีขาวเรียบหรูยื่นรับเอกสารและยา
      maintAt(maintBox(0.82, 0.06, pharD - 0.02, 0xf8fafc), pharDeskX - 0.04, 0.95, pharCZ),
      // แผงกั้นปิดหัวเคาน์เตอร์ด้านบน (Z = pharZ0)
      maintAt(maintBox(pharCntW - 0.08, 1.15, 0.16, 0x0284c7), pharCntCX, 0.575, pharZ0 + 0.08),
      maintAt(maintBox(pharCntW - 0.04, 0.06, 0.20, 0xf8fafc), pharCntCX, 1.16, pharZ0 + 0.08),
      // แผงกั้นปิดท้ายเคาน์เตอร์ด้านล่าง (Z = pharZ1)
      maintAt(maintBox(pharCntW - 0.08, 1.15, 0.16, 0x0284c7), pharCntCX, 0.575, pharZ1 - 0.08),
      maintAt(maintBox(pharCntW - 0.04, 0.06, 0.20, 0xf8fafc), pharCntCX, 1.16, pharZ1 - 0.08)
    );

    // แผงกั้นแบ่งช่องบริการ (Privacy partition dividers) ระหว่างช่อง 1, 2, 3, 4
    const pharDividersZ = [-3.75, -0.30, 3.15];
    pharDividersZ.forEach((dz) => {
      g.add(
        // แผงกั้นทึบสีน้ำเงิน
        maintAt(maintBox(pharCntW - 0.12, 0.45, 0.06, 0x0369a1), pharCntCX, 1.18, dz),
        // แผ่นกระจกฝ้าด้านบนแผงกั้น
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

    // ป้ายสถานะรวมเคาน์เตอร์จ่ายยา ช่อง 1–4
    L.push(
      maintTag(
        `💰 เคาน์เตอร์จ่ายยา ช่อง 1–4 (${pharmacyState.dispensingOpen ? '🟢 เปิดให้บริการ' : '🔴 พักให้บริการ'})`,
        V(pharCntCX, 2.15, pharCZ),
        'room ' + (pharmacyState.dispensingOpen ? 'free' : 'busy'),
        'pharmacy-dispense',
        'คลิกเพื่อสลับสถานะเคาน์เตอร์จ่ายยา'
      )
    );

    // ข้อมูลช่องบริการ 1–4 (เรียงจากล่างขึ้นบน หรือ ช่อง 1 หน้าสุด ถึง ช่อง 4 ในสุด)
    const pharStations = [
      {
        num: 4,
        z: -5.475,
        color: 0x10b981,
        spec: makePharPcSpec(4, 'เคาน์เตอร์ช่อง 4', 'ตรวจสอบใบสั่งยาและส่งมอบยาผู้ป่วยนอก')
      },
      {
        num: 3,
        z: -2.025,
        color: 0x0284c7,
        spec: makePharPcSpec(3, 'เคาน์เตอร์ช่อง 3', 'ตรวจสอบใบสั่งยาและส่งมอบยาผู้ป่วยนอก')
      },
      {
        num: 2,
        z: 1.425,
        color: 0x2563eb,
        spec: makePharPcSpec(2, 'เคาน์เตอร์ช่อง 2', 'ตรวจสอบใบสั่งยาและส่งมอบยาผู้ป่วยนอก')
      },
      {
        num: 1,
        z: 4.875,
        color: 0x7c3aed,
        spec: makePharPcSpec(1, 'เคาน์เตอร์ช่อง 1', 'ตรวจสอบใบสั่งยาและส่งมอบยาผู้ป่วยนอก')
      }
    ];

    pharStations.forEach((st) => {
      const sz = st.z;
      const sNum = st.num;
      const spec = st.spec;

      // 1. หน้าต่างกระจกช่องจ่ายยาและช่องส่งมอบยาด้านหน้า (ชิดกำแพงซ้าย X = pharCntX0 + 0.04)
      g.add(
        // บานกระจกกั้นช่องการเงิน/จ่ายยา
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
        // ถาดสแตนเลสรับ-ส่งเงินและยา (Recessed Transaction Tray)
        maintAt(maintBox(0.38, 0.04, 0.65, 0x94a3b8), pharCntX0 + 0.16, 0.97, sz),
        // ช่องโค้งเปิดส่งมอบยาใต้กระจก
        maintAt(maintBox(0.08, 0.20, 0.55, 0x0f172a), pharCntX0 + 0.04, 1.05, sz)
      );

      // 2. อุปกรณ์เคาน์เตอร์แบบห้องเก็บเงินบนโต๊ะ
      g.add(
        // ลิ้นชักเก็บเงิน (Cash Drawer) แบบห้องเก็บเงิน
        maintAt(maintBox(0.42, 0.14, 0.44, 0x1e293b), pharDeskX + 0.04, 0.88, sz - 0.75),
        maintAt(maintBox(0.04, 0.04, 0.16, 0x94a3b8), pharDeskX + 0.24, 0.88, sz - 0.75),
        // เครื่องพิมพ์ใบเสร็จและฉลากยา (Receipt & Label Printer)
        maintAt(maintBox(0.24, 0.18, 0.28, 0x334155), pharDeskX + 0.04, 1.07, sz - 0.75),
        maintAt(maintBox(0.12, 0.02, 0.18, 0x94a3b8), pharDeskX + 0.04, 1.15, sz - 0.75),
        // เครื่องสแกนบาร์โค้ดยา (Barcode Scanner) บนแท่นวาง
        maintAt(maintBox(0.08, 0.22, 0.12, 0x0284c7), pharDeskX + 0.12, 1.08, sz - 0.38),
        // ถาดจัดเรียงใบสั่งยาและแฟ้มประวัติ (Prescription Tray)
        maintAt(maintBox(0.32, 0.08, 0.38, 0x0284c7), pharDeskX + 0.04, 1.01, sz + 0.75)
      );

      // 3. ชุดคอมพิวเตอร์ประจำเคาน์เตอร์ (หน้าจอหันเข้าหาเภสัชกรทางขวา +X)
      const pcGrp = new THREE.Group();
      pcGrp.add(
        // จอคอมพิวเตอร์ 24" หันหน้าไปทางขวา (+X)
        maintAt(maintBox(0.05, 0.36, 0.58, 0x0f172a), pharDeskX - 0.05, 1.25, sz),
        maintAt(maintBox(0.02, 0.30, 0.52, 0x38bdf8), pharDeskX - 0.02, 1.25, sz),
        maintAt(maintBox(0.12, 0.26, 0.14, 0x475569), pharDeskX - 0.06, 1.08, sz),
        // คีย์บอร์ดและเมาส์วางบนเคาน์เตอร์
        maintAt(maintBox(0.14, 0.02, 0.42, 0x1e293b), pharDeskX + 0.18, 0.99, sz),
        maintAt(maintBox(0.08, 0.02, 0.06, 0x334155), pharDeskX + 0.18, 0.99, sz + 0.28),
        // เคสคอมพิวเตอร์ mini-tower
        maintAt(maintBox(0.38, 0.38, 0.18, 0x1e293b), pharDeskX - 0.05, 1.16, sz + 0.38)
      );
      pcGrp.traverse((child) => {
        if (child.isMesh) child.userData.pcInfo = spec;
      });
      g.add(pcGrp);

      // 4. เก้าอี้ทำงานของเภสัชกร (อยู่ฝั่งขวา พนักพิงอยู่ขวา หันหน้าไปทางซ้าย -X)
      g.add(
        maintAt(maintBox(0.48, 0.46, 0.48, 0x1e293b), pharChairX, 0.23, sz),
        maintAt(maintBox(0.08, 0.48, 0.46, 0x1e293b), pharChairX + 0.22, 0.65, sz)
      );

      // เภสัชกรประจำช่องบริการ (หันหน้าไปทางซ้าย -X เข้าหากระจกและเคาน์เตอร์)
      if (pharmacyState.dispensingOpen) {
        const staff = makePerson({
          role: 'nurse',
          shirtColor: st.color,
          pose: 'sit',
          rotY: -Math.PI / 2 // หันหน้าไปทางซ้าย (-X)
        });
        staff.position.set(pharChairX, 0, sz);
        g.add(staff);
      }

      // ป้ายลอย 3D คลิกดูสเปกคอมพิวเตอร์
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

    // โต๊ะคอมจ่ายยา 5, 7, 6: ปรับหันหน้าเข้ากำแพงล่าง (หันหน้าลงใต้ +Z เข้าหากำแพง)
    // rotY = Math.PI -> จออยู่ชิดกำแพงล่าง (+Z), เก้าอี้อยู่ด้านบน (-Z), เภสัชกรนั่งหันหน้าลงหากำแพงล่าง
    const pcSpec5 = makePharPcSpec(5, 'จุดตรวจสอบและจ่ายยาช่อง 5', 'ตรวจสอบความถูกต้องและพิมพ์ฉลากยา');
    createPharPcDesk(-5.1, 7.55, Math.PI, pcSpec5, 'โต๊ะคอมจ่ายยา 5', { role: 'nurse', shirtColor: 0x0d9488, pose: 'sit', rotY: 0 });

    const pcSpec7 = makePharPcSpec(7, 'จุดให้คำปรึกษาด้านยาช่อง 7', 'ให้คำแนะนำการใช้ยาเฉพาะโรคและยาเทคนิคพิเศษ');
    createPharPcDesk(5.8, 7.55, Math.PI, pcSpec7, 'โต๊ะคอมจ่ายยา 7', { role: 'nurse', shirtColor: 0xca8a04, pose: 'sit', rotY: 0 });

    const pcSpec6 = makePharPcSpec(6, 'จุดจัดเตรียมและจ่ายยาช่อง 6', 'จัดเตรียมยาผู้ป่วยนอกและบันทึกประวัติแพ้ยา');
    createPharPcDesk(8.2, 7.55, Math.PI, pcSpec6, 'โต๊ะคอมจ่ายยา 6', { role: 'nurse', shirtColor: 0xdb2777, pose: 'sit', rotY: 0 });

    // 6. โต๊ะจัดยา และ ชั้นวางยา ในโซนจ่ายยาฝั่งซ้าย (อยู่ในกรอบ)
    // (1) โต๊ะจัดยา (เกาะกลางโต๊ะยาวแนวตั้ง: X = -8.85, Z = -0.5, กว้าง 1.25 ม., ลึก 8.0 ม.)
    const prepTable = new THREE.Group();
    prepTable.add(
      maintAt(maintBox(1.25, 0.82, 8.0, 0xe2e8f0), -8.85, 0.41, -0.5),
      maintAt(maintBox(1.32, 0.06, 8.08, 0xffffff), -8.85, 0.85, -0.5)
    );
    // ถาดจัดยาและกล่องบรรจุยาบนโต๊ะจัดยา
    for (let tz = -3.8; tz <= 2.8; tz += 1.3) {
      prepTable.add(
        maintAt(maintBox(0.48, 0.12, 0.85, 0x38bdf8), -9.10, 0.94, tz),
        maintAt(maintBox(0.48, 0.12, 0.85, 0xfbbf24), -8.60, 0.94, tz)
      );
    }
    g.add(prepTable);
    L.push(maintTag('💊 โต๊ะจัดยา', V(-8.85, 1.45, -0.5), 'room', null, 'โต๊ะจัดเตรียมยาและตรวจนับเม็ดยา'));

    // (2) ชั้นวางยา (ผนังด้านบนของโซนจ่ายยา: X = -9.2, Z = -7.85, กว้าง 4.6 ม., ลึก 0.65 ม.)
    const topMedShelf = makeStorageShelf(4.6, 0.65, 2.05, 0x0284c7);
    topMedShelf.position.set(-9.2, 0, -7.85);
    g.add(topMedShelf);
    L.push(maintTag('💊 ชั้นวางยา', V(-9.2, 2.25, -7.85), 'sub', null, 'ชั้นวางยาเม็ดและยาน้ำ (ด้านบน)'));

    // (3) ชั้นวางยา 2 ชั้น ชิดผนังกั้นห้องด้านขวา (X = -7.2):
    // ชั้นบน (Z = -5.5, ลึก 4.3 ม.)
    const rightMedShelfTop = makeStorageShelf(4.3, 0.65, 2.05, 0x16a34a);
    rightMedShelfTop.rotation.y = Math.PI / 2;
    rightMedShelfTop.position.set(-7.2, 0, -5.5);
    g.add(rightMedShelfTop);
    L.push(maintTag('💊 ชั้นวางยา', V(-7.2, 2.25, -5.5), 'sub', null, 'ชั้นวางยาสำเร็จรูป (ฝั่งขวาบน)'));

    // ชั้นล่าง (Z = -0.7, ลึก 4.3 ม.)
    const rightMedShelfBottom = makeStorageShelf(4.3, 0.65, 2.05, 0x0d9488);
    rightMedShelfBottom.rotation.y = Math.PI / 2;
    rightMedShelfBottom.position.set(-7.2, 0, -0.7);
    g.add(rightMedShelfBottom);
    L.push(maintTag('💊 ชั้นวางยา', V(-7.2, 2.25, -0.7), 'sub', null, 'ชั้นวางยาสำเร็จรูป (ฝั่งขวากลาง)'));

    // (4) ตู้เก็บยา (ชิดผนังล่างซ้าย: X = -8.7, Z = +7.85, กว้าง 2.5 ม., ลึก 0.65 ม., สูง 2.0 ม.)
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

    // 6. โซนคลังยา (Top-Middle และ Top-Center-Right)
    // คลังยาห้องใหญ่ (X: -6.8 .. +2.8, Z: -8.4 .. -0.8)
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

    // คลังยาห้องกลาง (X: +2.8 .. +6.8, Z: -8.4 .. -0.8)
    const midStore = new THREE.Group();
    [4.0, 5.6].forEach((sx) => {
      const sh = makeStorageShelf(5.3, 0.75, 2.1, 0x4f46e5);
      sh.rotation.y = Math.PI / 2;
      sh.position.set(sx, 0, -4.65);
      midStore.add(sh);
    });
    g.add(midStore);
    L.push(maintTag('📦 คลังยา', V(4.8, 2.35, -4.65), 'room', null, 'คลังเวชภัณฑ์และยาน้ำสำรอง'));

    // 7. โซนคลังน้ำเกลือ + ตู้แช่ยา (X: +6.8 .. +12.0, Z: -8.4 .. -0.8)
    const salineGroup = new THREE.Group();
    // กองกล่องน้ำเกลือ NSS / Ringer's lactate บนพาเลทไม้ (อยู่ในกรอบ Z: -7.5 .. -5.5)
    for (let bx = 8.2; bx <= 10.8; bx += 1.3) {
      salineGroup.add(
        maintAt(maintBox(1.1, 0.15, 1.1, 0xb45309), bx, 0.075, -6.5),
        maintAt(maintBox(0.95, 1.25, 0.95, 0x0284c7), bx, 0.775, -6.5),
        maintAt(maintBox(0.9, 0.12, 0.9, 0xffffff), bx, 1.45, -6.5)
      );
    }
    // ตู้แช่ยาทางการแพทย์ (2–8°C) ขนาดใหญ่ 2 ตู้
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

    // 8. โต๊ะทำงานและที่นั่งในโถงกลาง (อยู่ในกรอบ)
    // (1) โต๊ะ 3 ตัวใต้คลังยาใหญ่ (X: -5.4, -3.6, -1.8 ที่ Z = +0.8)
    [-5.4, -3.6, -1.8].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.2, 0.74, 0.75, 0xd97706), tx, 0.37, 0.8),
        maintAt(maintBox(1.26, 0.06, 0.8, 0xfef3c7), tx, 0.76, 0.8),
        maintAt(maintBox(0.46, 0.45, 0.46, 0x334155), tx, 0.23, 0.35)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, 0.8), 'sub', null, `โต๊ะปฏิบัติงานเภสัชกรรม ตัวที่ ${idx + 1}`));
    });

    // (2) ที่นั่งพักคอย (ใต้คลังยากลาง: X = +5.2, Z = +0.1, กว้าง 3.6 ม., ลึก 0.85 ม.)
    const benchGroup = new THREE.Group();
    benchGroup.add(
      maintAt(maintBox(3.6, 0.44, 0.85, 0x2563eb), 5.2, 0.22, 0.1),
      maintAt(maintBox(3.6, 0.46, 0.08, 0x1d4ed8), 5.2, 0.65, -0.32)
    );
    g.add(benchGroup);
    L.push(maintTag('🪑 ที่นั่ง', V(5.2, 1.25, 0.1), 'room', null, 'ม้านั่งพักคอยสำหรับผู้มารับบริการ'));

    // (3) โต๊ะกลางโถงแนวตั้ง (X = +3.8, Z = +4.5, กว้าง 0.75 ม., ลึก 1.4 ม.)
    g.add(
      maintAt(maintBox(0.75, 0.74, 1.4, 0xd97706), 3.8, 0.37, 4.5),
      maintAt(maintBox(0.8, 0.06, 1.46, 0xfef3c7), 3.8, 0.76, 4.5),
      maintAt(maintBox(0.46, 0.45, 0.46, 0x334155), 3.25, 0.23, 4.5)
    );
    L.push(maintTag('🪑 โต๊ะ', V(3.8, 1.25, 4.5), 'sub', null, 'โต๊ะทำงานและตรวจเช็กสต็อกยา'));

    // (4) โต๊ะ 3 ตัวเรียงกันด้านล่าง (X: -0.6, +1.0, +2.6 ที่ Z = +6.8)
    [-0.6, 1.0, 2.6].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.2, 0.74, 0.75, 0xd97706), tx, 0.37, 6.8),
        maintAt(maintBox(1.26, 0.06, 0.8, 0xfef3c7), tx, 0.76, 6.8),
        maintAt(maintBox(0.46, 0.45, 0.46, 0x334155), tx, 0.23, 6.35)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, 6.8), 'sub', null, `โต๊ะปฏิบัติงานเภสัชกรรม ตัวที่ ${idx + 4}`));
    });

    // 9. ห้องพักเจ้าหน้าที่ (Staff Rest Room) ฝั่งขวาล่าง (X: +9.5 .. +11.9, Z: -0.7 .. +8.4)
    const staffRoom = new THREE.Group();
    // โซฟาพักผ่อนตัวยาวชิดผนังขวา
    staffRoom.add(
      maintAt(maintBox(0.85, 0.42, 2.2, 0x0284c7), 11.2, 0.21, 5.2),
      maintAt(maintBox(0.12, 0.52, 2.2, 0x0369a1), 11.65, 0.62, 5.2),
      maintAt(maintBox(0.85, 0.52, 0.12, 0x0369a1), 11.2, 0.62, 4.1),
      maintAt(maintBox(0.85, 0.52, 0.12, 0x0369a1), 11.2, 0.62, 6.3),
      // โต๊ะกาแฟกลางห้องพัก
      maintAt(maintBox(0.65, 0.38, 1.1, 0xfef3c7), 10.35, 0.19, 5.2),
      // เคาน์เตอร์เครื่องดื่ม ตู้กดน้ำ และไมโครเวฟ
      maintAt(maintBox(0.65, 0.86, 1.6, 0x475569), 10.65, 0.43, 0.1),
      maintAt(maintBox(0.7, 0.06, 1.65, 0xf8fafc), 10.65, 0.88, 0.1),
      maintAt(maintBox(0.35, 0.48, 0.35, 0x38bdf8), 10.65, 1.15, -0.4), // ถังตู้กดน้ำ
      maintAt(maintBox(0.42, 0.28, 0.38, 0x0f172a), 10.65, 1.05, 0.5),  // ไมโครเวฟ
      // ตู้ล็อกเกอร์เก็บของเจ้าหน้าที่
      maintAt(maintBox(0.6, 1.95, 1.5, 0x1e293b), 11.45, 0.98, 2.4)
    );
    g.add(staffRoom);
    L.push(maintTag('🛋️ ห้องพักเจ้าหน้าที่', V(10.75, 1.85, 4.8), 'room', null, 'ห้องพักผ่อนและรับประทานอาหารสำหรับเจ้าหน้าที่ห้องยา'));

    // รายการไอเทมสรุปด้านข้าง
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

  // =========================================================================
  // ทันตกรรม (Dental Clinic Interior)
  // ผังตามแบบแปลน:
  // - แถวบน: ห้องพักเจ้าหน้าที่+ห้องประชุม (ซ้าย) • ห้องเก็บอุปกรณ์ (ขวา)
  // - โถงกลางบน: โต๊ะ 2 ตัว (แถว 1) • โต๊ะ 3 ตัว (แถว 2) • โต๊ะเตรียมอุปกรณ์ทันตกรรม (กลาง)
  //              โต๊ะคอมทันตกรรม 1 (ผนังซ้าย) • ห้อง x-ray ฟัน (ขวา)
  // - โซนกลางล่าง: ชั้นเก็บอุปกรณ์ทันตกรรม (ผนังแนวตั้งซ้าย) • ห้อง ตรวจทันตกรรม 4 (กลาง)
  //               โต๊ะคอมทันตกรรม 5 (ผนังขวา)
  // - แถวล่าง: ห้อง ตรวจทันตกรรม 1 • ห้อง ตรวจทันตกรรม 2 • ห้อง ตรวจทันตกรรม 3
  // =========================================================================
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

  function buildDentalInterior() {
    const g = new THREE.Group();
    const L = [];

    // ขนาดอาคารทันตกรรม: กว้าง 20.0 ม. (X: -10.0 .. +10.0), ลึก 20.0 ม. (Z: -10.0 .. +10.0)
    const W = 20.0, D = 20.0;
    const WH = 2.4;
    const wThick = 0.18;
    const xMin = -W / 2; // -10.0
    const xMax = W / 2;  // +10.0
    const zMin = -D / 2; // -10.0
    const zMax = D / 2;  // +10.0

    // 1. พื้นแต่ละโซนตามผัง
    // แถวบน:
    // (1) ห้องพักเจ้าหน้าที่+ห้องประชุม (X: -10.0 .. +2.4, Z: -10.0 .. -6.8)
    floor(g, 12.4, 3.2, '#f8fafc', '#cbd5e1', 0.6, -3.8, -8.4);
    // (2) ห้องเก็บอุปกรณ์ (X: +2.4 .. +10.0, Z: -10.0 .. -6.8)
    floor(g, 7.6, 3.2, '#fefce8', '#cbd5e1', 0.6, 6.2, -8.4);

    // โถงกลางบน (X: -10.0 .. +10.0, Z: -6.8 .. -0.8)
    floor(g, 20.0, 6.0, '#f0fdf4', '#bbf7d0', 0.6, 0, -3.8);

    // ห้อง x-ray ฟัน (X: +4.6 .. +10.0, Z: -2.0 .. +1.2)
    floor(g, 5.4, 3.2, '#e0f2fe', '#93c5fd', 0.6, 7.3, -0.4);

    // ทางเดินและโซนชั้นเก็บอุปกรณ์ฝั่งซ้าย (X: -10.0 .. -5.8, Z: -0.8 .. +4.8)
    floor(g, 4.2, 5.6, '#f8fafc', '#cbd5e1', 0.6, -7.9, 2.0);

    // ห้องตรวจทันตกรรม 4 ตรงกลาง (X: -3.5 .. +3.6, Z: -0.8 .. +3.2)
    floor(g, 7.1, 4.0, '#ecfeff', '#a5f3fc', 0.6, 0.05, 1.2);

    // ทางเดินและโต๊ะคอมทันตกรรม 5 ฝั่งขวา (X: +3.6 .. +10.0, Z: +1.2 .. +4.8)
    floor(g, 6.4, 3.6, '#f8fafc', '#cbd5e1', 0.6, 6.8, 3.0);

    // แถวล่าง 3 ห้องตรวจทันตกรรม:
    // ห้องตรวจทันตกรรม 1 (X: -10.0 .. -3.4, Z: +4.8 .. +10.0)
    floor(g, 6.6, 5.2, '#ecfeff', '#a5f3fc', 0.6, -6.7, 7.4);
    // ห้องตรวจทันตกรรม 2 (X: -3.4 .. +3.4, Z: +4.8 .. +10.0)
    floor(g, 6.8, 5.2, '#f0fdfa', '#99f6e4', 0.6, 0.0, 7.4);
    // ห้องตรวจทันตกรรม 3 (X: +3.4 .. +10.0, Z: +4.8 .. +10.0)
    floor(g, 6.6, 5.2, '#ecfeff', '#a5f3fc', 0.6, 6.7, 7.4);

    // 2. ฟังก์ชันสร้างประตูภายในกรอบ
    function makeDentalDoor(x, z, w, d, rotY = 0) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      const isHoriz = w >= d;
      // ธรณีประตู
      const pad = maintBox(w, 0.04, d, 0xe2e8f0);
      pad.position.set(0, 0.02, 0);
      dg.add(pad);
      // บานประตูไม้โมเดิร์นพร้อมลูกบิด
      const leafW = isHoriz ? w * 0.82 : 0.07;
      const leafD = isHoriz ? 0.07 : d * 0.82;
      const leaf = maintBox(leafW, 1.95, leafD, 0xd97706);
      leaf.position.set(0, 0.98, 0);
      leaf.rotation.y = rotY;
      dg.add(leaf);
      g.add(dg);
    }

    // 3. กำแพงรอบนอกอาคาร (Outer Walls) พร้อมช่องประตูภายนอก
    // กำแพงบน (Z = -9.91): กำแพงทึบยาวตลอดแนว
    g.add(maintAt(maintWall(W, WH, wThick, 0x1e293b), 0, WH / 2, zMin + wThick / 2));

    // กำแพงล่าง (Z = +9.91): มีประตูที่ห้องตรวจ 1 (X = -4.0) และห้องตรวจ 2 (X = +2.6)
    const zBtmW = zMax - wThick / 2;
    g.add(
      maintAt(maintWall(5.4, WH, wThick, 0x1e293b), -7.3, WH / 2, zBtmW),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -4.0, WH - 0.175, zBtmW),
      maintAt(maintWall(5.2, WH, wThick, 0x1e293b), -0.7, WH / 2, zBtmW),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 2.6, WH - 0.175, zBtmW),
      maintAt(maintWall(6.6, WH, wThick, 0x1e293b), 6.7, WH / 2, zBtmW)
    );
    makeDentalDoor(-4.0, zBtmW - 0.04, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-4.0, 1.45, zBtmW - 0.35), 'sub', null, 'ประตูห้องตรวจทันตกรรม 1'));
    makeDentalDoor(2.6, zBtmW - 0.04, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(2.6, 1.45, zBtmW - 0.35), 'sub', null, 'ประตูห้องตรวจทันตกรรม 2'));

    // กำแพงซ้ายสุด (X = -9.91): มีประตูบน (Z = -5.6) และประตูล่าง (Z = +2.4)
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

    // กำแพงขวาสุด (X = +9.91): มีประตูบน (Z = -5.6)
    const xRgtW = xMax - wThick / 2;
    g.add(
      maintAt(maintWall(wThick, WH, 3.8, 0x1e293b), xRgtW, WH / 2, -8.1),
      maintAt(maintWall(wThick, 0.35, 1.4, 0x1e293b), xRgtW, WH - 0.175, -5.6),
      maintAt(maintWall(wThick, WH, 14.8, 0x1e293b), xRgtW, WH / 2, 2.5)
    );
    makeDentalDoor(xRgtW - 0.04, -5.6, 0.45, 1.4, -0.35);
    L.push(maintTag('🚪 ประตู', V(xRgtW - 0.35, 1.45, -5.6), 'room', null, 'ประตูทางเข้าอาคารทันตกรรม (ฝั่งขวาบน)'));

    // 4. กำแพงกั้นห้องภายใน (Internal Walls)
    // (1) กำแพงกั้นระหว่างห้องพักเจ้าหน้าที่+ห้องประชุม กับ ห้องเก็บอุปกรณ์ (X = +2.4, Z: -10.0 .. -6.8)
    g.add(maintAt(maintWall(wThick, WH, 3.2, 0x1e293b), 2.4, WH / 2, -8.4));

    // (2) กำแพงแนวนอนกั้นแถวบน (Z = -6.8, X: -10.0 .. +10.0) พร้อมประตู 2 บาน
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

    // (3) กำแพงห้อง x-ray ฟัน (X: +4.6 .. +10.0, Z: -2.0 .. +1.2):
    // กำแพงบน (Z = -2.0, X: +4.6 .. +10.0)
    g.add(maintAt(maintWall(5.4, WH, wThick, 0x1e293b), 7.3, WH / 2, -2.0));
    // กำแพงซ้าย (X = +4.6, Z: -2.0 .. +1.2)
    g.add(maintAt(maintWall(wThick, WH, 3.2, 0x1e293b), 4.6, WH / 2, -0.4));
    // กำแพงล่าง (Z = +1.2, X: +4.6 .. +10.0) มีประตูที่ X = +6.4
    g.add(
      maintAt(maintWall(1.1, WH, wThick, 0x1e293b), 5.15, WH / 2, 1.2),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 6.4, WH - 0.175, 1.2),
      maintAt(maintWall(2.9, WH, wThick, 0x1e293b), 8.55, WH / 2, 1.2)
    );
    makeDentalDoor(6.4, 1.2, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(6.4, 1.45, 1.2), 'sub', null, 'ประตูห้อง x-ray ฟัน'));

    // ประตูคั่นระหว่างห้องตรวจ 4 กับ ห้อง x-ray ฟัน (X = 4.1, Z = 1.2)
    makeDentalDoor(4.1, 1.2, 0.9, 0.45, -0.35);
    L.push(maintTag('🚪 ประตู', V(4.1, 1.45, 1.2), 'sub', null, 'ประตูเชื่อมทางเดินโถงกลาง'));

    // (4) กำแพงห้องตรวจทันตกรรม 4 (X: -3.5 .. +3.6, Z: -0.8 .. +3.2):
    // กำแพงบน (Z = -0.8, X: -3.5 .. +3.6)
    g.add(maintAt(maintWall(7.1, WH, wThick, 0x1e293b), 0.05, WH / 2, -0.8));
    // กำแพงซ้าย (X = -3.5, Z: -0.8 .. +3.2)
    g.add(maintAt(maintWall(wThick, WH, 4.0, 0x1e293b), -3.5, WH / 2, 1.2));
    // กำแพงขวา (X = +3.6, Z: -0.8 .. +3.2)
    g.add(maintAt(maintWall(wThick, WH, 4.0, 0x1e293b), 3.6, WH / 2, 1.2));
    // กำแพงล่าง (Z = +3.2, X: -3.5 .. +3.6) มีประตูที่ X = +2.2
    g.add(
      maintAt(maintWall(5.0, WH, wThick, 0x1e293b), -1.0, WH / 2, 3.2),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 2.2, WH - 0.175, 3.2),
      maintAt(maintWall(0.7, WH, wThick, 0x1e293b), 3.25, WH / 2, 3.2)
    );
    makeDentalDoor(2.2, 3.2, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(2.2, 1.45, 3.2), 'sub', null, 'ประตูห้องตรวจทันตกรรม 4'));

    // (5) กำแพงแนวตั้งกั้นโซนชั้นเก็บอุปกรณ์ทันตกรรมฝั่งซ้าย (X = -5.8, Z: -0.8 .. +4.8)
    g.add(maintAt(maintWall(wThick, WH, 5.6, 0x1e293b), -5.8, WH / 2, 2.0));

    // (6) กำแพงแนวนอนกั้น 3 ห้องตรวจแถวล่าง (Z = +4.8, X: -10.0 .. +10.0) พร้อมประตู 3 บาน
    g.add(
      // ประตูห้องตรวจ 1 (X = -8.2)
      maintAt(maintWall(1.1, WH, wThick, 0x1e293b), -9.45, WH / 2, 4.8),
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -8.2, WH - 0.175, 4.8),
      maintAt(maintWall(5.5, WH, wThick, 0x1e293b), -4.75, WH / 2, 4.8),
      // ประตูห้องตรวจ 2 (X = -2.0)
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), -2.0, WH - 0.175, 4.8),
      maintAt(maintWall(5.9, WH, wThick, 0x1e293b), 1.65, WH / 2, 4.8),
      // ประตูห้องตรวจ 3 (X = +4.6)
      maintAt(maintWall(1.4, 0.35, wThick, 0x1e293b), 4.6, WH - 0.175, 4.8),
      maintAt(maintWall(4.7, WH, wThick, 0x1e293b), 7.65, WH / 2, 4.8)
    );
    makeDentalDoor(-8.2, 4.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-8.2, 1.45, 4.8), 'sub', null, 'ประตูเข้าห้องตรวจทันตกรรม 1'));
    makeDentalDoor(-2.0, 4.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(-2.0, 1.45, 4.8), 'sub', null, 'ประตูเข้าห้องตรวจทันตกรรม 2'));
    makeDentalDoor(4.6, 4.8, 1.4, 0.45, 0.35);
    L.push(maintTag('🚪 ประตู', V(4.6, 1.45, 4.8), 'sub', null, 'ประตูเข้าห้องตรวจทันตกรรม 3'));

    // (7) กำแพงแนวตั้งแบ่งห้องตรวจ 1, 2, 3:
    // ระหว่างห้องตรวจ 1 กับ 2 (X = -3.4, Z: +4.8 .. +10.0)
    g.add(maintAt(maintWall(wThick, WH, 5.2, 0x1e293b), -3.4, WH / 2, 7.4));
    // ระหว่างห้องตรวจ 2 กับ 3 (X = +3.4, Z: +4.8 .. +10.0)
    g.add(maintAt(maintWall(wThick, WH, 5.2, 0x1e293b), 3.4, WH / 2, 7.4));

    // =========================================================================
    // 5. สเปกคอมพิวเตอร์และฟังก์ชันสร้างโต๊ะคอมพิวเตอร์ทันตกรรม
    // =========================================================================
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

    // สร้างโต๊ะคอมพิวเตอร์ประจำจุด
    // rotY = 0         -> จออยู่เหนือ (-Z) หันหาเก้าอี้ใต้ (+Z)
    // rotY = Math.PI   -> จออยู่ใต้ (+Z) หันหาเก้าอี้เหนือ (-Z)
    // rotY = Math.PI/2 -> จออยู่ซ้าย (-X) หันหาเก้าอี้ขวา (+X)
    // rotY = -Math.PI/2-> จออยู่ขวา (+X) หันหาเก้าอี้ซ้าย (-X)
    function createDentalPcDesk(x, z, rotY, spec, labelText, personOpts = null) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      dg.add(
        // โต๊ะทำงานโมเดิร์นสีขาว/ขอบเทา
        maintAt(maintBox(1.25, 0.74, 0.75, 0x334155), 0, 0.37, 0),
        maintAt(maintBox(1.30, 0.06, 0.80, 0xf8fafc), 0, 0.76, 0),
        // จอภาพ 24" แสดงผลภาพเอกซเรย์และผังฟัน
        maintAt(maintBox(0.58, 0.36, 0.05, 0x0f172a), 0, 1.02, -0.22),
        maintAt(maintBox(0.52, 0.30, 0.02, 0x38bdf8), 0, 1.02, -0.19),
        maintAt(maintBox(0.14, 0.12, 0.12, 0x475569), 0, 0.82, -0.22),
        // คีย์บอร์ดและเมาส์
        maintAt(maintBox(0.38, 0.02, 0.14, 0x1e293b), 0, 0.79, 0.12),
        maintAt(maintBox(0.08, 0.02, 0.06, 0x334155), 0.28, 0.79, 0.12),
        // เคสคอมพิวเตอร์ mini-tower
        maintAt(maintBox(0.22, 0.42, 0.44, 0x1e293b), 0.45, 0.98, -0.08),
        // เครื่องอ่าน Smart Card และ Digital Sensor Dock
        maintAt(maintBox(0.18, 0.08, 0.20, 0x0284c7), -0.45, 0.82, -0.05),
        // เก้าอี้ทำงานทันตกรรม
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

    // ติดตั้งโต๊ะคอมพิวเตอร์ทั้ง 6 จุดตามผัง:
    // (1) โต๊ะคอมทันตกรรม 1 (ชิดผนังซ้ายของโถงกลางบน): หันหน้าเข้ากำแพงซ้าย (-X)
    const pcSpecHall = makeDentalPcSpec('PC-DEN-06', 'โต๊ะคอมทันตกรรม 1 (โถงเวชระเบียน)', 'ลงทะเบียนผู้ป่วย คัดกรองอาการช่องปาก และบันทึกนัดหมาย', 11);
    createDentalPcDesk(-9.4, -2.5, Math.PI / 2, pcSpecHall, 'โต๊ะคอมทันตกรรม 1 (โถง)', { role: 'nurse', shirtColor: 0x0284c7, pose: 'sit', rotY: 0 });

    // (2) โต๊ะคอมทันตกรรม 4 (ในห้องตรวจทันตกรรม 4): ชิดผนังบน หันหน้าขึ้นเหนือ (-Z)
    const pcSpec4 = makeDentalPcSpec('PC-DEN-04', 'โต๊ะคอมทันตกรรม 4', 'บันทึกการรักษาทันตกรรม ห้องตรวจ 4 ตรวจภาพรังสีฟันดิจิทัล', 14);
    createDentalPcDesk(0.8, -0.35, 0, pcSpec4, 'โต๊ะคอมทันตกรรม 4', { role: 'doctor', shirtColor: 0x0ea5e9, pose: 'sit', rotY: 0 });

    // (3) โต๊ะคอมทันตกรรม 5 (ชิดผนังขวาของทางเดินล่าง): หันหน้าเข้ากำแพงขวา (+X)
    const pcSpec5 = makeDentalPcSpec('PC-DEN-05', 'โต๊ะคอมทันตกรรม 5', 'จุดวางแผนการรักษาทันตกรรมและให้คำปรึกษาการดูแลสุขภาพช่องปาก', 15);
    createDentalPcDesk(9.4, 3.2, -Math.PI / 2, pcSpec5, 'โต๊ะคอมทันตกรรม 5', { role: 'nurse', shirtColor: 0x10b981, pose: 'sit', rotY: 0 });

    // (4) โต๊ะคอมทันตกรรม 1 (ในห้องตรวจ 1): ชิดผนังบน หันหน้าขึ้นเหนือ (-Z)
    const pcSpec1 = makeDentalPcSpec('PC-DEN-01', 'โต๊ะคอมทันตกรรม 1 (ห้องตรวจ 1)', 'บันทึกประวัติทันตกรรม การอุดฟัน ถอนฟัน และทันตกรรมหัตถการ', 12);
    createDentalPcDesk(-5.4, 5.25, 0, pcSpec1, 'โต๊ะคอมทันตกรรม 1', { role: 'doctor', shirtColor: 0x0284c7, pose: 'sit', rotY: 0 });

    // (5) โต๊ะคอมทันตกรรม 2 (ในห้องตรวจ 2): ชิดผนังบน หันหน้าขึ้นเหนือ (-Z)
    const pcSpec2 = makeDentalPcSpec('PC-DEN-02', 'โต๊ะคอมทันตกรรม 2 (ห้องตรวจ 2)', 'บันทึกประวัติทันตกรรม งานขูดหินปูน และรักษารากฟัน', 13);
    createDentalPcDesk(1.0, 5.25, 0, pcSpec2, 'โต๊ะคอมทันตกรรม 2', { role: 'doctor', shirtColor: 0x059669, pose: 'sit', rotY: 0 });

    // (6) โต๊ะคอมทันตกรรม 3 (ในห้องตรวจ 3): ชิดผนังบน หันหน้าขึ้นเหนือ (-Z)
    const pcSpec3 = makeDentalPcSpec('PC-DEN-03', 'โต๊ะคอมทันตกรรม 3 (ห้องตรวจ 3)', 'บันทึกประวัติทันตกรรม งานทันตกรรมประดิษฐ์และศัลยกรรมช่องปาก', 16);
    createDentalPcDesk(7.4, 5.25, 0, pcSpec3, 'โต๊ะคอมทันตกรรม 3', { role: 'doctor', shirtColor: 0x7c3aed, pose: 'sit', rotY: 0 });

    // =========================================================================
    // 6. โมเดลยูนิตทำฟัน (Dental Chair Units) ประจำห้องตรวจ 1–4
    // =========================================================================
    function makeDentalUnit(x, z, rotY, roomName, roomId, isOccupied) {
      const dg = new THREE.Group();
      dg.position.set(x, 0, z);
      dg.rotation.y = rotY;

      // สีเบาะเก้าอี้ทันตกรรม: เขียวมินต์/ฟ้าทะเล เมื่อว่าง, สีแดงส้มเมื่อมีคนไข้
      const uphCol = isOccupied ? 0xf43f5e : 0x06b6d4;
      const uphDark = isOccupied ? 0xe11d48 : 0x0891b2;

      dg.add(
        // ฐานรองไฮดรอลิกยูนิตทำฟัน
        maintAt(maintBox(0.95, 0.12, 1.45, 0xe2e8f0), 0, 0.06, 0),
        maintAt(maintBox(0.38, 0.32, 0.48, 0x94a3b8), 0, 0.24, -0.05),
        // เบาะนั่งคนไข้ (Dental Patient Seat)
        maintAt(maintBox(0.70, 0.16, 0.85, uphCol), 0, 0.45, 0.12),
        // พนักพิงหลังปรับเอน (Reclining Backrest)
        maintAt(maintBox(0.64, 0.14, 0.82, uphDark), 0, 0.52, -0.45),
        // พนักพิงศีรษะ (Adjustable Headrest)
        maintAt(maintBox(0.34, 0.10, 0.28, uphDark), 0, 0.58, -0.92),
        // ที่วางแขนซ้าย-ขวา
        maintAt(maintBox(0.08, 0.08, 0.65, 0x64748b), -0.38, 0.56, 0.08),
        maintAt(maintBox(0.08, 0.08, 0.65, 0x64748b), 0.38, 0.56, 0.08),
        // แป้นเหยียบควบคุมด้วยเท้า (Foot Control Pedal)
        maintAt(maintBox(0.24, 0.05, 0.22, 0x1e293b), 0.55, 0.025, 0.5),

        // เสาโคมไฟผ่าตัดทันตกรรม (Dental Surgical LED Light)
        maintAt(maintBox(0.08, 1.65, 0.08, 0x94a3b8), -0.55, 0.85, -0.35),
        maintAt(maintBox(0.55, 0.08, 0.08, 0x94a3b8), -0.32, 1.68, -0.35),
        maintAt(maintBox(0.36, 0.14, 0.22, 0xf8fafc), -0.15, 1.65, -0.15), // โคมไฟ LED
        maintAt(maintBox(0.28, 0.04, 0.16, 0xfef08a), -0.15, 1.58, -0.15), // แสงไฟส่องปาก

        // ถาดวางเครื่องมือกรอฟันทันตแพทย์ (Dentist Instrument Delivery Console)
        maintAt(maintBox(0.06, 0.95, 0.06, 0x94a3b8), 0.55, 0.50, -0.15),
        maintAt(maintBox(0.58, 0.06, 0.42, 0xffffff), 0.62, 0.96, -0.05),
        maintAt(maintBox(0.48, 0.02, 0.32, 0x94a3b8), 0.62, 1.00, -0.05), // ถาดสแตนเลส
        maintAt(maintBox(0.04, 0.04, 0.28, 0x38bdf8), 0.48, 1.03, -0.05), // หัวกรอฟัน High-Speed
        maintAt(maintBox(0.04, 0.04, 0.28, 0x38bdf8), 0.56, 1.03, -0.05), // หัวขูดหินปูน Scaler
        maintAt(maintBox(0.04, 0.04, 0.24, 0xd1d5db), 0.64, 1.03, -0.05), // กระบอกฉีดน้ำ-ลม 3-way

        // อ่างบ้วนปากและระบบดูดน้ำลาย (Cuspidor & Saliva Suction Unit)
        maintAt(maintBox(0.28, 0.85, 0.28, 0xf1f5f9), -0.55, 0.44, 0.35),
        maintAt(maintBox(0.24, 0.12, 0.24, 0x38bdf8), -0.55, 0.90, 0.35), // อ่างบ้วนปากแก้ว
        maintAt(maintBox(0.06, 0.22, 0.06, 0x94a3b8), -0.55, 1.02, 0.22), // ก๊อกน้ำแก้ว

        // เก้าอี้หมุนทันตแพทย์ (Dentist Stool)
        maintAt(maintBox(0.42, 0.42, 0.42, 0x0284c7), 0.82, 0.21, -0.65),
        maintAt(maintBox(0.38, 0.32, 0.08, 0x0369a1), 0.82, 0.58, -0.82),

        // เก้าอี้หมุนผู้ช่วยทันตแพทย์ (Assistant Stool)
        maintAt(maintBox(0.42, 0.46, 0.42, 0x059669), -0.85, 0.23, -0.55),
        maintAt(maintBox(0.38, 0.32, 0.08, 0x047857), -0.85, 0.60, -0.72)
      );

      // เมื่อมีคนไข้กำลังรักษา
      if (isOccupied) {
        // คนไข้นอนเอนบนเก้าอี้
        const patient = makePerson({ role: 'patient', shirtColor: 0x9333ea, pose: 'sit', rotY: 0 });
        patient.position.set(0, 0.22, 0.1);
        dg.add(patient);

        // ทันตแพทย์ประจำยูนิต
        const dentist = makePerson({ role: 'doctor', shirtColor: 0x0284c7, pose: 'sit', rotY: -Math.PI / 4 });
        dentist.position.set(0.82, 0, -0.65);
        dg.add(dentist);

        // ผู้ช่วยทันตแพทย์
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

    // ติดตั้งยูนิตทำฟันในห้องตรวจ 1–4
    const r1State = dentalState.rooms.find((r) => r.id === 'dental-room-1');
    makeDentalUnit(-6.7, 7.6, 0, 'ห้องตรวจทันตกรรม 1', 'dental-room-1', r1State ? r1State.occupied : false);

    const r2State = dentalState.rooms.find((r) => r.id === 'dental-room-2');
    makeDentalUnit(0.0, 7.6, 0, 'ห้องตรวจทันตกรรม 2', 'dental-room-2', r2State ? r2State.occupied : false);

    const r3State = dentalState.rooms.find((r) => r.id === 'dental-room-3');
    makeDentalUnit(6.7, 7.6, 0, 'ห้องตรวจทันตกรรม 3', 'dental-room-3', r3State ? r3State.occupied : false);

    const r4State = dentalState.rooms.find((r) => r.id === 'dental-room-4');
    makeDentalUnit(-0.8, 1.4, 0, 'ห้องตรวจทันตกรรม 4', 'dental-room-4', r4State ? r4State.occupied : false);

    // =========================================================================
    // 7. ห้อง x-ray ฟัน (Dental Panoramic & Digital X-Ray Room)
    // =========================================================================
    const xrayRoom = new THREE.Group();
    // เครื่องเอกซเรย์ฟันแบบพาโนรามาและ 3D CBCT (Panoramic X-Ray Machine)
    xrayRoom.add(
      // เสากลางเครื่องเอกซเรย์
      maintAt(maintBox(0.35, 2.15, 0.35, 0xf1f5f9), 7.8, 1.08, -0.6),
      maintAt(maintBox(1.10, 0.08, 1.10, 0x64748b), 7.8, 0.04, -0.6),
      // แขน C-Arm หมุนรอบศีรษะคนไข้
      maintAt(maintBox(1.25, 0.22, 0.38, 0x0284c7), 7.8, 1.78, -0.6),
      maintAt(maintBox(0.24, 0.35, 0.24, 0x0369a1), 7.25, 1.60, -0.6), // หลอดเอกซเรย์ X-Ray Tube
      maintAt(maintBox(0.22, 0.35, 0.08, 0x38bdf8), 8.35, 1.60, -0.6), // เซ็นเซอร์รับภาพดิจิทัล
      // แท่นวางคางและที่จับมือคนไข้
      maintAt(maintBox(0.26, 0.06, 0.22, 0x94a3b8), 7.8, 1.35, -0.6),
      maintAt(maintBox(0.38, 0.04, 0.04, 0x64748b), 7.8, 1.25, -0.45),
      // ฉากกระจกตะกั่วป้องกันรังสี (Lead Glass Protective Shield)
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
      // แท่นแขวนเสื้อตะกั่วป้องกันรังสี (Lead Apron Stand)
      maintAt(maintBox(0.45, 1.45, 0.45, 0x334155), 9.2, 0.725, 0.5),
      maintAt(maintBox(0.48, 0.82, 0.12, 0x1d4ed8), 9.2, 0.95, 0.5) // เสื้อตะกั่วสีน้ำเงิน
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

    // =========================================================================
    // 8. ห้องพักเจ้าหน้าที่+ห้องประชุม (Staff Rest & Meeting Room - ซ้ายบน)
    // =========================================================================
    const staffMeetGroup = new THREE.Group();
    // โต๊ะประชุมทันตกรรมขนาดใหญ่ในห้อง (Conference Meeting Table)
    staffMeetGroup.add(
      maintAt(maintBox(3.4, 0.74, 1.3, 0x334155), -4.5, 0.37, -8.5),
      maintAt(maintBox(3.5, 0.06, 1.36, 0xf8fafc), -4.5, 0.76, -8.5),
      // ไวท์บอร์ด/จอพรีเซนต์งานประชุมติดผนังบน
      maintAt(maintBox(2.6, 1.15, 0.05, 0xffffff), -4.5, 1.65, -9.85),
      maintAt(maintBox(2.7, 1.25, 0.02, 0x0284c7), -4.5, 1.65, -9.87)
    );
    // เก้าอี้รอบโต๊ะประชุม 6 ตัว
    [-5.6, -4.5, -3.4].forEach((cx) => {
      // แถวบน
      staffMeetGroup.add(
        maintAt(maintBox(0.42, 0.44, 0.42, 0x0284c7), cx, 0.22, -9.35),
        maintAt(maintBox(0.40, 0.42, 0.08, 0x0369a1), cx, 0.62, -9.55)
      );
      // แถวล่าง
      staffMeetGroup.add(
        maintAt(maintBox(0.42, 0.44, 0.42, 0x0284c7), cx, 0.22, -7.65),
        maintAt(maintBox(0.40, 0.42, 0.08, 0x0369a1), cx, 0.62, -7.45)
      );
    });
    // ชุดโซฟาพักผ่อนเจ้าหน้าที่ (Staff Rest Area)
    staffMeetGroup.add(
      maintAt(maintBox(2.2, 0.42, 0.85, 0x059669), -8.4, 0.21, -8.5),
      maintAt(maintBox(2.2, 0.52, 0.12, 0x047857), -8.4, 0.62, -8.9),
      maintAt(maintBox(1.1, 0.36, 0.65, 0xfef3c7), -8.4, 0.18, -7.6),
      // เคาน์เตอร์น้ำดื่ม ไมโครเวฟ ตู้กดน้ำ
      maintAt(maintBox(1.6, 0.86, 0.65, 0x475569), -0.6, 0.43, -9.5),
      maintAt(maintBox(1.66, 0.06, 0.7, 0xf8fafc), -0.6, 0.88, -9.5),
      maintAt(maintBox(0.35, 0.46, 0.35, 0x38bdf8), -0.3, 1.15, -9.5), // ตู้กดน้ำ
      maintAt(maintBox(0.42, 0.28, 0.38, 0x0f172a), -0.9, 1.05, -9.5)  // ไมโครเวฟ
    );
    g.add(staffMeetGroup);
    L.push(maintTag('🛋️ ห้องพักเจ้าหน้าที่+ห้องประชุม', V(-3.8, 1.95, -8.4), 'room', 'dental-staff', 'ห้องพักผ่อนและห้องประชุมกลุ่มงานทันตกรรม'));

    // =========================================================================
    // 9. ห้องเก็บอุปกรณ์ (Equipment Storage Room - ขวาบน)
    // =========================================================================
    const equipStoreGroup = new THREE.Group();
    // ชั้นวางเครื่องมือและวัสดุทันตกรรมตามแนวผนัง (Dental Supply Storage Shelves)
    const shelfRight1 = makeStorageShelf(2.8, 0.65, 2.05, 0x0284c7);
    shelfRight1.position.set(6.2, 0, -9.5);
    equipStoreGroup.add(shelfRight1);

    const shelfRight2 = makeStorageShelf(2.4, 0.65, 2.05, 0x059669);
    shelfRight2.rotation.y = Math.PI / 2;
    shelfRight2.position.set(9.4, 0, -8.2);
    equipStoreGroup.add(shelfRight2);

    // เครื่องนึ่งฆ่าเชื้อด้วยแรงดันไอน้ำ Autoclave บนเคาน์เตอร์สแตนเลส
    equipStoreGroup.add(
      maintAt(maintBox(1.6, 0.84, 0.75, 0x94a3b8), 3.8, 0.42, -9.4),
      maintAt(maintBox(1.65, 0.06, 0.80, 0xe2e8f0), 3.8, 0.86, -9.4),
      maintAt(maintBox(0.55, 0.38, 0.52, 0x0284c7), 3.8, 1.08, -9.4), // Autoclave Sterilizer
      maintAt(maintBox(0.38, 0.28, 0.05, 0x38bdf8), 3.8, 1.08, -9.1)  // ฝาเปิด Autoclave
    );
    g.add(equipStoreGroup);
    L.push(maintTag('📦 ห้องเก็บอุปกรณ์', V(6.2, 1.95, -8.4), 'room', null, 'ห้องเก็บวัสดุ ครุภัณฑ์ และเครื่องนึ่งฆ่าเชื้อทันตกรรม Autoclave'));

    // =========================================================================
    // 10. ชั้นเก็บอุปกรณ์ทันตกรรม (แนวตั้งฝั่งซ้ายล่าง)
    // =========================================================================
    // ชั้นกระจกและสแตนเลสทรงสูงสำหรับเก็บหัวกรอ วัสดุอุดฟัน คีมถอนฟัน (X = -6.1, Z = +2.0)
    const dentalInstShelf = new THREE.Group();
    dentalInstShelf.add(
      maintAt(maintBox(0.65, 2.05, 3.8, 0x0284c7), -6.2, 1.025, 2.0),
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
        -6.52,
        1.025,
        2.0
      )
    );
    // ถาดอุปกรณ์และกล่องเครื่องมือปลอดเชื้อบนชั้น
    for (let sz = 0.6; sz <= 3.4; sz += 0.9) {
      dentalInstShelf.add(
        maintAt(maintBox(0.45, 0.08, 0.72, 0x94a3b8), -6.2, 0.65, sz),
        maintAt(maintBox(0.45, 0.08, 0.72, 0x38bdf8), -6.2, 1.25, sz),
        maintAt(maintBox(0.45, 0.08, 0.72, 0x10b981), -6.2, 1.75, sz)
      );
    }
    g.add(dentalInstShelf);
    L.push(maintTag('🗄️ ชั้นเก็บอุปกรณ์ทันตกรรม', V(-6.2, 2.25, 2.0), 'sub', null, 'ชั้นกระจกจัดเก็บหัวกรอฟัน คีมถอนฟัน และเครื่องมือปลอดเชื้อ'));

    // =========================================================================
    // 11. โต๊ะเตรียมอุปกรณ์ทันตกรรม (Center Hall)
    // =========================================================================
    // โต๊ะสแตนเลสแนวนอนยาว (X = -0.5, Z = -1.1, กว้าง 3.2 ม., ลึก 1.1 ม.)
    const prepGroup = new THREE.Group();
    prepGroup.add(
      maintAt(maintBox(3.2, 0.82, 1.1, 0x334155), -0.5, 0.41, -1.1),
      maintAt(maintBox(3.3, 0.06, 1.16, 0xf8fafc), -0.5, 0.85, -1.1),
      // ถาดจัดเซ็ตเครื่องมือทันตกรรมปลอดเชื้อ (Sterile Instrument Cassettes)
      maintAt(maintBox(0.65, 0.10, 0.45, 0x94a3b8), -1.5, 0.93, -1.1),
      maintAt(maintBox(0.65, 0.10, 0.45, 0x38bdf8), -0.5, 0.93, -1.1),
      maintAt(maintBox(0.65, 0.10, 0.45, 0x10b981), 0.5, 0.93, -1.1),
      // อ่างล้างทำความสะอาดเครื่องมือ Ultrasonic Cleaner
      maintAt(maintBox(0.55, 0.28, 0.45, 0x0284c7), 1.5, 1.02, -1.1)
    );
    g.add(prepGroup);
    L.push(maintTag('🛠️ โต๊ะเตรียมอุปกรณ์ทันตกรรม', V(-0.5, 1.35, -1.1), 'room', null, 'โต๊ะจัดเตรียมเครื่องมือทันตกรรม เซ็ตปลอดเชื้อ และล้างอัลตราโซนิก'));

    // =========================================================================
    // 12. โต๊ะในโถงกลาง (แถว 1: 2 ตัว, แถว 2: 3 ตัว)
    // =========================================================================
    // แถว 1: 2 ตัวใต้ห้องพักเจ้าหน้าที่ (Z = -5.2)
    [-5.2, -1.2].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.5, 0.74, 0.85, 0x334155), tx, 0.37, -5.2),
        maintAt(maintBox(1.56, 0.06, 0.90, 0xf8fafc), tx, 0.76, -5.2),
        maintAt(maintBox(0.45, 0.44, 0.45, 0x0284c7), tx - 0.4, 0.22, -4.6),
        maintAt(maintBox(0.45, 0.44, 0.45, 0x0284c7), tx + 0.4, 0.22, -4.6)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, -5.2), 'sub', null, `โต๊ะให้คำปรึกษาและซักประวัติทันตกรรม แถว 1 ตัวที่ ${idx + 1}`));
    });

    // แถว 2: 3 ตัว (Z = -3.2)
    [-5.2, -2.2, 0.8].forEach((tx, idx) => {
      g.add(
        maintAt(maintBox(1.5, 0.74, 0.85, 0x334155), tx, 0.37, -3.2),
        maintAt(maintBox(1.56, 0.06, 0.90, 0xf8fafc), tx, 0.76, -3.2),
        maintAt(maintBox(0.45, 0.44, 0.45, 0x059669), tx - 0.4, 0.22, -2.6),
        maintAt(maintBox(0.45, 0.44, 0.45, 0x059669), tx + 0.4, 0.22, -2.6)
      );
      L.push(maintTag('🪑 โต๊ะ', V(tx, 1.25, -3.2), 'sub', null, `โต๊ะให้คำปรึกษาและซักประวัติทันตกรรม แถว 2 ตัวที่ ${idx + 1}`));
    });

    // รายการสรุปสิ่งที่อยู่ภายในสำหรับแถบด้านข้าง
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
      ['🖥️', 'PC-DEN-06: โต๊ะคอมทันตกรรม 1 (โถงเวชระเบียน)', 'ดูสเปก', null, 'free', pcSpecHall],
      ['🪑', 'โต๊ะซักประวัติและให้คำปรึกษาโถงกลาง', '5 โต๊ะ (แถวละ 2 และ 3 ตัว)'],
      ['🚪', 'ประตูทางเข้า-ออกและประตูห้องตรวจ', '13 บาน']
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

  K.Interiors = {
    build(b) {
      if (b.interior === 'guard') return guard(b);
      if (b.interior === 'shop') return shop(b);
      if (b.interior === 'parking') return parking(b);
      if (b.interior === 'er') return buildErPcuInterior(b);
      if (b.interior === 'physio') return buildPhysioInterior(b);
      if (b.interior === 'ipd') return buildIpdInterior(b);
      if (b.interior === 'power') return buildPowerInterior(b);
      if (b.interior === 'hall') return buildHallInterior(b);
      if (b.interior === 'maint') return buildMaintInterior(b);
      if (b.interior === 'finance') return buildFinanceInterior(b);
      if (b.interior === 'kitchen') return buildKitchenInterior(b);
      if (b.interior === 'pharmacy') return buildPharmacyInterior(b);
      if (b.interior === 'dental') return buildDentalInterior(b);
      return null;
    },
    toggleStatus(id) {
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
      const ipdBedItem = ipdState.beds.find((b) => b.id === id);
      if (ipdBedItem) {
        ipdBedItem.occupied = !ipdBedItem.occupied;
        return true;
      }
      const ipdIso = ipdState.isoRooms.find((r) => r.id === id);
      if (ipdIso) {
        ipdIso.occupied = !ipdIso.occupied;
        return true;
      }
      if (id === 'power-gen') {
        powerState.running = !powerState.running;
        return true;
      }
      if (id === 'hall-stage') {
        hallState.occupied = !hallState.occupied;
        return true;
      }
      const maintRoom = maintState.rooms.find((r) => r.id === id);
      if (maintRoom) {
        maintRoom.occupied = !maintRoom.occupied;
        return true;
      }
      if (id === 'finance-counter') {
        financeState.counterOpen = !financeState.counterOpen;
        return true;
      }
      if (id === 'kitchen-cook') {
        kitchenState.cookingActive = !kitchenState.cookingActive;
        return true;
      }
      if (id === 'kitchen-store') {
        kitchenState.storeOpen = !kitchenState.storeOpen;
        return true;
      }
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
    },
    stats(b) {
      if (b.interior !== 'parking') return null;
      const cp = M.buildCarport(b.w, b.d, { seed: M.hash(b.id) });
      return { total: cp.total, parked: cp.parked };
    }
  };
})();

