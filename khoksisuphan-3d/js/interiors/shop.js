/* =========================================================================
 * ร้านค้าสวัสดิการ (Shop)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, WALL_H, T, floor, shelfUnit, cooler, screenTexture, makePerson, UNIT, pm } = C;

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

  K.Interiors.register('shop', shop);
})();
