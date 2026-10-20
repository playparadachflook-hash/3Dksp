/* โมเดล 3D พื้นฐาน: รถยนต์ โรงจอดรถ ป้อมยาม ร้านค้า ป้าย เสาธง ต้นไม้ ฯลฯ */
(function () {
  const K = (window.KSS = window.KSS || {});
  const M = (K.M = {});

  // ---------- Helpers ----------
  M.mat = (color, opts) =>
    new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.8, metalness: 0.05 }, opts || {}));

  M.glass = (color = 0x9ec5e8, opacity = 0.3) =>
    new THREE.MeshStandardMaterial({ color, transparent: true, opacity, roughness: 0.05, metalness: 0.2, depthWrite: false });

  function asMat(m) {
    return m && (m.isMaterial || Array.isArray(m)) ? m : M.mat(m);
  }

  M.box = (parent, w, h, d, material, x = 0, y = 0, z = 0) => {
    const mat = asMat(material);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = !(mat.transparent);
    mesh.receiveShadow = true;
    if (parent) parent.add(mesh);
    return mesh;
  };

  M.cyl = (parent, rTop, rBot, h, material, x = 0, y = 0, z = 0, seg = 16) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), asMat(material));
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (parent) parent.add(mesh);
    return mesh;
  };

  M.hash = (s) => {
    let h = 7;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return (Math.abs(h) % 2147483646) + 1;
  };

  M.rng = (seed) => {
    let s = seed % 2147483647 || 1;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };

  M.canvasTexture = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  };

  M.tileTexture = (base, line, repX, repY) => {
    const t = M.canvasTexture(128, 128, (g, w, h) => {
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = line;
      g.lineWidth = 3;
      g.strokeRect(0, 0, w, h);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repX, repY);
    return t;
  };

  // ใส่ข้อความให้พอดีความกว้าง
  M.fitText = (g, text, x, y, maxW, size, weight = 700) => {
    let fs = size;
    do {
      g.font = `${weight} ${fs}px Prompt, Tahoma, sans-serif`;
      fs -= 2;
    } while (g.measureText(text).width > maxW && fs > 10);
    g.fillText(text, x, y);
  };

  // ---------- Shared materials (ไม่ถูกเปลี่ยนสีตอน hover) ----------
  function shared(m) { m.userData.shared = true; return m; }
  const SH = {
    tire: shared(M.mat(0x111111, { roughness: 0.9 })),
    carGlass: shared(M.mat(0x1e293b, { roughness: 0.15, metalness: 0.6 })),
    headlight: shared(M.mat(0xfffbe6, { emissive: 0xfff3c4, emissiveIntensity: 0.4 })),
    taillight: shared(M.mat(0xb91c1c, { emissive: 0x7f1d1d, emissiveIntensity: 0.4 })),
    trunk: shared(M.mat(0x8b5a2b)),
    leaves: [0x4ade80, 0x22c55e, 0x16a34a, 0x65a30d].map((c) => shared(M.mat(c, { flatShading: true, roughness: 0.9 })))
  };
  const WHEEL_GEO = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 16);
  WHEEL_GEO.userData.shared = true;

  // ---------- Car ----------
  M.CAR_COLORS = [0xf8fafc, 0xcbd5e1, 0x1f2937, 0xdc2626, 0x2563eb, 0x6b7280, 0x0f766e, 0xf59e0b, 0xffffff];

  M.makeCar = (color, kind = 'sedan') => {
    const g = new THREE.Group();
    const paint = M.mat(color, { roughness: 0.35, metalness: 0.5 });
    M.box(g, 1.8, 0.55, 4.2, paint, 0, 0.55, 0);
    if (kind === 'pickup') {
      M.box(g, 1.6, 0.55, 1.7, paint, 0, 1.1, 0.55);
      M.box(g, 1.62, 0.38, 1.74, SH.carGlass, 0, 1.1, 0.55);
      // กระบะท้าย
      M.box(g, 0.08, 0.35, 1.9, paint, -0.86, 1.0, -1.1);
      M.box(g, 0.08, 0.35, 1.9, paint, 0.86, 1.0, -1.1);
      M.box(g, 1.8, 0.35, 0.08, paint, 0, 1.0, -2.06);
    } else {
      M.box(g, 1.6, 0.5, 2.0, paint, 0, 1.06, -0.2);
      M.box(g, 1.62, 0.36, 2.24, SH.carGlass, 0, 1.06, -0.2);
    }
    [[-0.85, 1.35], [0.85, 1.35], [-0.85, -1.35], [0.85, -1.35]].forEach(([x, z]) => {
      const w = new THREE.Mesh(WHEEL_GEO, SH.tire);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.33, z);
      w.castShadow = true;
      g.add(w);
    });
    M.box(g, 0.35, 0.12, 0.04, SH.headlight, -0.6, 0.65, 2.1);
    M.box(g, 0.35, 0.12, 0.04, SH.headlight, 0.6, 0.65, 2.1);
    M.box(g, 0.35, 0.12, 0.04, SH.taillight, -0.6, 0.65, -2.1);
    M.box(g, 0.35, 0.12, 0.04, SH.taillight, 0.6, 0.65, -2.1);
    return g;
  };

  // ---------- Carport (ใช้ทั้งด้านนอกและมุมมองภายใน) ----------
  M.buildCarport = (w, d, opt = {}) => {
    const g = new THREE.Group();
    const rnd = M.rng(opt.seed || 7);
    M.box(g, w, 0.08, d, M.mat(0x8b9099, { roughness: 0.95 }), 0, 0.04, 0);

    const lineMat = M.mat(0xffffff, { roughness: 0.6 });
    const slotW = 2.7;
    const rows = d >= 10 ? 2 : 1;
    const n = Math.max(1, Math.floor((w - 0.6) / slotW));
    const startX = (-n * slotW) / 2;
    const rowZ = rows === 2 ? [-d / 2 + 2.7, d / 2 - 2.7] : [0];
    const slotLen = Math.min(5, rows === 2 ? d / 2 - 0.3 : d - 0.6);
    const slots = [];
    let parked = 0;

    rowZ.forEach((z, ri) => {
      for (let i = 0; i <= n; i++) M.box(g, 0.08, 0.01, slotLen, lineMat, startX + i * slotW, 0.085, z);
      for (let i = 0; i < n; i++) {
        const x = startX + (i + 0.5) * slotW;
        const occupied = rnd() < 0.78;
        slots.push({ x, z, occupied });
        if (!occupied) continue;
        parked++;
        const color = M.CAR_COLORS[Math.floor(rnd() * M.CAR_COLORS.length)];
        const car = M.makeCar(color, rnd() < 0.35 ? 'pickup' : 'sedan');
        car.position.set(x, 0.08, z);
        car.rotation.y = rows === 2 && ri === 1 ? 0 : Math.PI;
        g.add(car);
      }
    });

    // โครงหลังคา
    const H = 3.2;
    const roofMat = M.mat(0x94a3b8, {
      metalness: 0.4, roughness: 0.5,
      transparent: !!opt.transparentRoof, opacity: opt.transparentRoof ? 0.22 : 1
    });
    if (opt.transparentRoof) roofMat.depthWrite = false;
    M.box(g, w + 0.6, 0.15, d + 0.6, roofMat, 0, H + 0.075, 0);

    const postMat = M.mat(0x475569, { metalness: 0.4 });
    const nx = Math.max(2, Math.round(w / 5) + 1);
    for (let i = 0; i < nx; i++) {
      const x = -w / 2 + (i * w) / (nx - 1);
      [-d / 2, d / 2].forEach((z) => M.cyl(g, 0.12, 0.12, H, postMat, x, H / 2, z, 8));
    }
    [-d / 2, d / 2].forEach((z) => M.box(g, w, 0.25, 0.2, postMat, 0, H - 0.1, z));

    return { group: g, total: slots.length, parked, slots };
  };

  // ---------- Tree ----------
  M.tree = (s = 1, variant = 0) => {
    const g = new THREE.Group();
    M.cyl(g, 0.15 * s, 0.2 * s, 1.4 * s, SH.trunk, 0, 0.7 * s, 0, 6);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3 * s, 0), SH.leaves[variant % SH.leaves.length]);
    crown.position.y = 2.2 * s;
    crown.castShadow = true;
    g.add(crown);
    return g;
  };

  // ---------- Textures ----------
  M.stripeTexture = () => {
    const t = M.canvasTexture(128, 16, (g, w, h) => {
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 2 ? '#ffffff' : '#dc2626';
        g.fillRect(i * 16, 0, 16, h);
      }
    });
    return t;
  };

  M.signTexture = () =>
    M.canvasTexture(1536, 333, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#ffffff');
      grd.addColorStop(1, '#eaf6ee');
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#15803d';
      g.lineWidth = 18;
      g.strokeRect(9, 9, w - 18, h - 18);
      // โลโก้กากบาท
      g.fillStyle = '#16a34a';
      g.beginPath();
      g.arc(170, h / 2, 110, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ffffff';
      g.fillRect(148, h / 2 - 75, 44, 150);
      g.fillRect(95, h / 2 - 22, 150, 44);
      g.textBaseline = 'middle';
      g.fillStyle = '#14532d';
      M.fitText(g, 'โรงพยาบาลโคกศรีสุพรรณ', 320, h / 2 - 36, w - 370, 120);
      g.fillStyle = '#15803d';
      M.fitText(g, 'KHOK SI SUPHAN HOSPITAL', 324, h / 2 + 82, w - 370, 56, 600);
    });

  M.shopSignTexture = () =>
    M.canvasTexture(768, 108, (g, w, h) => {
      g.fillStyle = '#15803d';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#facc15';
      g.fillRect(0, h - 10, w, 10);
      g.fillStyle = '#ffffff';
      g.textBaseline = 'middle';
      g.textAlign = 'center';
      M.fitText(g, '🏪 ร้านค้าสวัสดิการ', w / 2, h / 2 - 3, w - 40, 64);
    });

  M.thaiFlagTexture = () =>
    M.canvasTexture(300, 200, (g, w, h) => {
      const rows = [['#a51931', 1], ['#f4f5f8', 1], ['#2d2a4a', 2], ['#f4f5f8', 1], ['#a51931', 1]];
      let y = 0;
      rows.forEach(([c, n]) => {
        g.fillStyle = c;
        g.fillRect(0, y, w, (h / 6) * n + 1);
        y += (h / 6) * n;
      });
    });

  // ---------- Guard booth (ภายนอก) ----------
  M.buildGuardExterior = () => {
    const g = new THREE.Group();
    M.box(g, 4.4, 0.15, 4.4, 0xd1d5db, 0, 0.075, 0);
    M.box(g, 4, 3, 4, 0xf8fafc, 0, 1.65, 0);
    M.box(g, 4.04, 1.0, 4.04, M.mat(0x1e3a5f, { roughness: 0.2, metalness: 0.5 }), 0, 2.0, 0);
    M.box(g, 4.8, 0.25, 4.8, 0x1d4ed8, 0, 3.27, 0);
    M.box(g, 0.9, 2.0, 0.06, 0x64748b, 0.9, 1.15, 2.02);
    // ไม้กั้นทางเข้า
    M.box(g, 0.35, 1.1, 0.35, 0x334155, 2.7, 0.55, 1.4);
    const stripe = M.stripeTexture();
    stripe.wrapS = THREE.RepeatWrapping;
    stripe.repeat.set(3, 1);
    M.box(g, 5.5, 0.14, 0.14, M.mat(0xffffff, { map: stripe }), 5.45, 1.0, 1.4);
    return g;
  };

  // ---------- Welfare shop (ภายนอก) ----------
  M.buildShopExterior = () => {
    const g = new THREE.Group();
    M.box(g, 6, 3, 3, 0xfef3c7, 0, 1.5, 0);
    M.box(g, 6.3, 0.2, 3.3, 0xe5e7eb, 0, 3.1, 0);
    M.box(g, 5.2, 1.9, 0.05, M.mat(0x7dd3fc, { roughness: 0.1, metalness: 0.4 }), 0, 1.15, 1.52);
    const awning = M.box(g, 6.4, 0.08, 1.0, 0x16a34a, 0, 2.45, 1.95);
    awning.rotation.x = 0.25;
    const side = M.mat(0x15803d);
    const front = new THREE.MeshStandardMaterial({ map: M.shopSignTexture(), roughness: 0.6 });
    M.box(g, 5, 0.7, 0.12, [side, side, side, side, front, side], 0, 3.55, 1.45);
    return g;
  };

  // ---------- Hospital sign ----------
  M.buildSign = () => {
    const g = new THREE.Group();
    M.box(g, 13, 0.6, 2.2, 0x9ca3af, 0, 0.3, 0);
    M.box(g, 12.6, 0.1, 1.8, 0x6b4f2a, 0, 0.62, 0);
    for (let i = 0; i < 9; i++) {
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), SH.leaves[i % 4]);
      bush.position.set(-6 + i * 1.5, 0.95, 0.35);
      bush.castShadow = true;
      g.add(bush);
    }
    M.box(g, 0.4, 3.2, 0.4, 0x6b7280, -5.5, 2.2, -0.3);
    M.box(g, 0.4, 3.2, 0.4, 0x6b7280, 5.5, 2.2, -0.3);
    const side = M.mat(0x15803d);
    const front = new THREE.MeshStandardMaterial({ map: M.signTexture(), roughness: 0.5 });
    M.box(g, 12, 2.6, 0.35, [side, side, side, side, front, side], 0, 3.3, -0.3);
    M.box(g, 12.3, 0.2, 0.5, 0x15803d, 0, 4.7, -0.3);
    return g;
  };

  // ---------- Flag plaza ----------
  M.buildFlagPlaza = (w, d) => {
    const g = new THREE.Group();
    M.box(g, w, 0.1, d, 0xe7e5e4, 0, 0.05, 0);
    M.box(g, 3, 0.4, 3, 0xd6d3d1, 0, 0.3, 0);
    M.cyl(g, 0.08, 0.12, 10, 0xe5e7eb, 0, 5.4, 0, 10);
    const geo = new THREE.PlaneGeometry(3, 2, 16, 6);
    geo.translate(1.5, 0, 0);
    const flag = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: M.thaiFlagTexture(), side: THREE.DoubleSide }));
    flag.position.set(0.08, 9.2, 0);
    flag.castShadow = true;
    flag.userData.base = Float32Array.from(geo.attributes.position.array);
    g.add(flag);
    return { group: g, flag };
  };

  // ---------- Water tank ----------
  M.buildTank = (h = 7) => {
    const g = new THREE.Group();
    const legM = M.mat(0x64748b, { metalness: 0.4 });
    [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].forEach(([x, z]) => M.box(g, 0.25, h - 3, 0.25, legM, x, (h - 3) / 2, z));
    M.cyl(g, 2.2, 2.2, 3, M.mat(0xbfdbfe, { metalness: 0.3, roughness: 0.4 }), 0, h - 1.5, 0, 24);
    M.cyl(g, 0.2, 2.25, 0.8, M.mat(0x93c5fd), 0, h + 0.4, 0, 24);
    return g;
  };

  // ---------- Pavilion (ศาลา) ----------
  M.buildPavilion = (w, d, h) => {
    const g = new THREE.Group();
    M.box(g, w, 0.3, d, 0xd6d3d1, 0, 0.15, 0);
    const postM = M.mat(0x92400e);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => M.box(g, 0.25, h, 0.25, postM, (sx * (w - 0.8)) / 2, h / 2 + 0.3, (sz * (d - 0.8)) / 2));
    M.box(g, w - 2, 0.45, 0.4, postM, 0, 0.6, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, 2.2, 4), M.mat(0xb45309, { flatShading: true }));
    roof.rotation.y = Math.PI / 4;
    roof.position.y = h + 1.4;
    roof.castShadow = true;
    g.add(roof);
    return g;
  };
})();
