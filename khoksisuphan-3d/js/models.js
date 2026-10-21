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
    const isOpenAir = !!opt.openAir;

    // พื้นผิวลานจอดรถ (ลานกลางแจ้งใช้ผิวแอสฟัลต์พร้อมขอบคันหิน)
    const baseMat = M.mat(isOpenAir ? 0x475569 : 0x8b9099, { roughness: 0.92 });
    M.box(g, w, 0.08, d, baseMat, 0, 0.04, 0);

    // ขอบคันหินรอบลานจอดรถกลางแจ้ง (Perimeter Curbs)
    if (isOpenAir) {
      const curbMat = M.mat(0x94a3b8, { roughness: 0.6 });
      const cThick = 0.22;
      const cH = 0.14;
      M.box(g, w + cThick * 2, cH, cThick, curbMat, 0, cH / 2, -d / 2 - cThick / 2);
      M.box(g, w + cThick * 2, cH, cThick, curbMat, 0, cH / 2, d / 2 + cThick / 2);
      M.box(g, cThick, cH, d, curbMat, -w / 2 - cThick / 2, cH / 2, 0);
      M.box(g, cThick, cH, d, curbMat, w / 2 + cThick / 2, cH / 2, 0);
    }

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

        // ยางกั้นล้อคอนกรีตหน้ารถ (Wheel Stops) สำหรับลานกลางแจ้ง
        if (isOpenAir) {
          const stopZ = (rows === 2 && ri === 1) ? z - slotLen / 2 + 0.38 : z + slotLen / 2 - 0.38;
          M.box(g, 1.8, 0.12, 0.18, M.mat(0xf1f5f9, { roughness: 0.5 }), x, 0.14, stopZ);
        }

        if (!occupied) continue;
        parked++;
        let color = M.CAR_COLORS[Math.floor(rnd() * M.CAR_COLORS.length)];
        let carType = rnd() < 0.35 ? 'pickup' : 'sedan';
        if (opt.hasSign) {
          if (i === 0 || i === 1) { carType = 'van'; color = 0xffffff; }
          else if (i === 2) { carType = 'van'; color = 0xcbd5e1; }
          else if (i === 3) { carType = 'pickup'; color = 0xffffff; }
        }
        const car = M.makeCar(color, carType);
        if (opt.hasSign && (i === 0 || i === 1)) {
          M.box(car, 1.2, 0.12, 0.35, M.mat(0xdc2626, { emissive: 0xef4444, emissiveIntensity: 0.6 }), 0, 2.15, 0.6);
        }
        car.position.set(x, 0.08, z);
        car.rotation.y = rows === 2 && ri === 1 ? 0 : Math.PI;
        g.add(car);
      }
    });

    if (!isOpenAir) {
      // โครงหลังคา (สำหรับโรงจอดรถแบบมีหลังคา)
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

      if (opt.hasSign) {
        const signText = opt.signTitle || '🚑 โรงจอดรถโรงพยาบาลและยานพาหนะ (พขร.)';
        const carSignTex = M.canvasTexture(1200, 140, (ctx, cw, ch) => {
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(0, 0, cw, ch);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.strokeRect(5, 5, cw - 10, ch - 10);
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.font = 'bold 44px Prompt, Tahoma, sans-serif';
          ctx.fillText(signText, cw / 2, ch / 2);
        });
        const signW = Math.min(18, w * 0.7);
        M.box(g, signW, 0.75, 0.08, new THREE.MeshStandardMaterial({ map: carSignTex, roughness: 0.4 }), 0, H + 0.6, -d / 2 - 0.05);
      }
    } else {
      // เสาไฟส่องสว่างลานจอดรถพลังงานแสงอาทิตย์ (Solar LED Streetlight Poles) ที่มุมลานจอดรถกลางแจ้ง
      const lampMat = M.mat(0x334155, { metalness: 0.5, roughness: 0.3 });
      const lampHead = M.mat(0x0284c7);
      const lightGlass = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
      const polePositions = [
        [-w / 2 + 1.2, -d / 2 - 0.1],
        [w / 2 - 1.2, -d / 2 - 0.1],
        [-w / 2 + 1.2, d / 2 + 0.1],
        [w / 2 - 1.2, d / 2 + 0.1]
      ];
      polePositions.forEach(([px, pz]) => {
        M.cyl(g, 0.08, 0.1, 4.2, lampMat, px, 2.1, pz, 8);
        M.box(g, 0.45, 0.08, 0.85, lampHead, px, 4.24, pz + (pz < 0 ? 0.35 : -0.35));
        M.box(g, 0.35, 0.02, 0.65, lightGlass, px, 4.19, pz + (pz < 0 ? 0.35 : -0.35));
      });
    }

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

  // ---------- สนามหญ้าหน้าตึกผู้ป่วยใน (Lush Green Lawn Garden in Front of IPD) ----------
  M.buildGardenIpd = (w = 22, d = 8.5) => {
    const g = new THREE.Group();
    // 1. Raised Lawn Platform (สนามหญ้าเขียวขจี)
    const grassMat = M.mat(0x22c55e, { roughness: 0.95 });
    M.box(g, w, 0.12, d, grassMat, 0, 0.06, 0);

    // 2. White Stone Garden Curbs (ขอบคันหินสวนสีขาว)
    const curbMat = M.mat(0xf1f5f9, { roughness: 0.5 });
    const cThick = 0.22, cH = 0.18;
    M.box(g, w + cThick * 2, cH, cThick, curbMat, 0, cH / 2, -d / 2 - cThick / 2);
    M.box(g, w + cThick * 2, cH, cThick, curbMat, 0, cH / 2, d / 2 + cThick / 2);
    M.box(g, cThick, cH, d, curbMat, -w / 2 - cThick / 2, cH / 2, 0);
    M.box(g, cThick, cH, d, curbMat, w / 2 + cThick / 2, cH / 2, 0);

    // 3. Winding Stepping Stones (ทางเดินแผ่นหินสวน)
    const stoneMat = M.mat(0xe2e8f0, { roughness: 0.6 });
    for (let px = -w * 0.38; px <= w * 0.38; px += 2.0) {
      const pz = Math.sin(px * 0.35) * 1.5;
      M.box(g, 1.1, 0.02, 1.1, stoneMat, px, 0.125, pz);
    }

    // 4. Flowering Shrub Clusters & Trimmed Topiary (พุ่มไม้ดอกประดับหลากสี)
    const bushColors = [0x16a34a, 0x15803d, 0x4ade80];
    const flowerColors = [0xf472b6, 0xfde047, 0xffffff, 0xf87171];
    const bushCoords = [
      [-w * 0.4, -d * 0.3], [-w * 0.25, -d * 0.35], [w * 0.25, -d * 0.35], [w * 0.4, -d * 0.3],
      [-w * 0.35, d * 0.32], [0, d * 0.35], [w * 0.35, d * 0.32]
    ];
    bushCoords.forEach(([bx, bz], i) => {
      const bMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), M.mat(bushColors[i % bushColors.length], { flatShading: true }));
      bMesh.position.set(bx, 0.65, bz);
      bMesh.castShadow = true;
      g.add(bMesh);
      // Small colorful flowers
      for (let fi = 0; fi < 3; fi++) {
        M.box(g, 0.16, 0.16, 0.16, M.mat(flowerColors[(i + fi) % flowerColors.length]), bx + (fi - 1) * 0.25, 1.25, bz + (fi % 2 ? 0.2 : -0.2));
      }
    });

    // 5. Garden Trees (ต้นไม้ประดับให้ร่มเงา)
    const treeCoords = [
      [-w * 0.42, 0], [w * 0.42, 0], [-w * 0.15, -d * 0.3], [w * 0.15, d * 0.3]
    ];
    treeCoords.forEach(([tx, tz], i) => {
      const tree = M.tree(1.15, i);
      tree.position.set(tx, 0.12, tz);
      g.add(tree);
    });

    // 6. Garden Park Benches (ม้านั่งไม้พักผ่อนสำหรับผู้ป่วยและญาติ)
    const benchWood = M.mat(0x78350f, { roughness: 0.6 });
    const benchLeg = M.mat(0x334155, { metalness: 0.5 });
    [[-w * 0.2, 0.4], [w * 0.2, -0.4]].forEach(([bx, bz]) => {
      M.box(g, 2.0, 0.08, 0.55, benchWood, bx, 0.48, bz);
      M.box(g, 2.0, 0.45, 0.08, benchWood, bx, 0.72, bz - 0.25);
      M.box(g, 0.1, 0.48, 0.55, benchLeg, bx - 0.85, 0.24, bz);
      M.box(g, 0.1, 0.48, 0.55, benchLeg, bx + 0.85, 0.24, bz);
    });

    return g;
  };

  // ---------- สนามนั่งเล่นหลังป้ายโรงพยาบาล (Sitting Park with Tree Shade Behind Sign) ----------
  M.buildParkSign = (w = 18, d = 8.5) => {
    const g = new THREE.Group();
    // 1. Manicured Green Park Grass (สนามหญ้า)
    const grassMat = M.mat(0x22c55e, { roughness: 0.95 });
    M.box(g, w, 0.1, d, grassMat, 0, 0.05, 0);

    // ขอบคันหินสวน
    const curbMat = M.mat(0x94a3b8, { roughness: 0.6 });
    const cThick = 0.22, cH = 0.14;
    M.box(g, w + cThick * 2, cH, cThick, curbMat, 0, cH / 2, -d / 2 - cThick / 2);
    M.box(g, w + cThick * 2, cH, cThick, curbMat, 0, cH / 2, d / 2 + cThick / 2);
    M.box(g, cThick, cH, d, curbMat, -w / 2 - cThick / 2, cH / 2, 0);
    M.box(g, cThick, cH, d, curbMat, w / 2 + cThick / 2, cH / 2, 0);

    // 2. Central Stone Paver Plaza (ลานนั่งเล่นปูแผ่นหิน)
    const plazaMat = M.mat(0xf1f5f9, { roughness: 0.65 });
    M.box(g, w * 0.65, 0.04, d * 0.65, plazaMat, 0, 0.11, 0);

    // 3. Central Round Garden Picnic Table & Stools (โต๊ะหินกลมพร้อมม้านั่ง)
    const tableMat = M.mat(0xe2e8f0, { roughness: 0.4 });
    M.cyl(g, 1.1, 1.1, 0.08, tableMat, 0, 0.65, 0, 20);
    M.cyl(g, 0.2, 0.25, 0.55, curbMat, 0, 0.35, 0, 12);
    // 4 Stools around table
    [[0, 1.5], [0, -1.5], [1.5, 0], [-1.5, 0]].forEach(([sx, sz]) => {
      M.cyl(g, 0.35, 0.35, 0.38, tableMat, sx, 0.25, sz, 12);
    });

    // 4. Park Benches Under Tree Shade (ม้านั่งพักผ่อนใต้ร่มเงาไม้)
    const benchWood = M.mat(0x78350f, { roughness: 0.6 });
    const benchLeg = M.mat(0x334155, { metalness: 0.5 });
    [
      [-w * 0.24, -d * 0.2, 0],
      [w * 0.24, -d * 0.2, 0],
      [-w * 0.24, d * 0.2, Math.PI],
      [w * 0.24, d * 0.2, Math.PI]
    ].forEach(([bx, bz, rot]) => {
      const bG = new THREE.Group();
      bG.position.set(bx, 0, bz);
      bG.rotation.y = rot;
      M.box(bG, 1.9, 0.08, 0.52, benchWood, 0, 0.46, 0);
      M.box(bG, 1.9, 0.42, 0.08, benchWood, 0, 0.68, -0.24);
      M.box(bG, 0.1, 0.46, 0.52, benchLeg, -0.8, 0.23, 0);
      M.box(bG, 0.1, 0.46, 0.52, benchLeg, 0.8, 0.23, 0);
      g.add(bG);
    });

    // 5. Large Shade Trees (ต้นไม้ใหญ่ให้ร่มเงาหนาทึบ - "มีร่มจากต้นไม้")
    const shadeTreeCoords = [
      [-w * 0.32, -d * 0.28], [w * 0.32, -d * 0.28],
      [-w * 0.32, d * 0.28], [w * 0.32, d * 0.28],
      [-w * 0.42, 0], [w * 0.42, 0]
    ];
    shadeTreeCoords.forEach(([tx, tz], i) => {
      const tree = M.tree(1.35, i % 4);
      tree.position.set(tx, 0.1, tz);
      g.add(tree);
    });

    // 6. Pedestrian Stepping Stone Walkways (ทางเดินเชื่อมสู่ลาน)
    const stepMat = M.mat(0xf8fafc, { roughness: 0.5 });
    for (let i = 0; i < 4; i++) {
      M.box(g, 1.2, 0.02, 0.65, stepMat, 0, 0.11, d * 0.35 + i * 0.9);
      M.box(g, 1.2, 0.02, 0.65, stepMat, 0, 0.11, -d * 0.35 - i * 0.9);
    }

    return g;
  };

  // ---------- พระประจำโรงพยาบาล (Sacred Hospital Buddha Shrine & Pavilion) ----------
  M.buildBuddhaShrine = (w = 5.5, d = 5.5, h = 4.8) => {
    const g = new THREE.Group();

    // 1. Surrounding Garden & Courtyard Base (ลานสวนดอกไม้ล้อมรอบ)
    const baseW = w + 1.8, baseD = d + 1.8;
    const lawnMat = M.mat(0x22c55e, { roughness: 0.95 });
    M.box(g, baseW, 0.1, baseD, lawnMat, 0, 0.05, 0);

    const stoneCurb = M.mat(0xe2e8f0, { roughness: 0.5 });
    const cThick = 0.2;
    M.box(g, baseW + cThick * 2, 0.14, cThick, stoneCurb, 0, 0.07, -baseD / 2 - cThick / 2);
    M.box(g, baseW + cThick * 2, 0.14, cThick, stoneCurb, 0, 0.07, baseD / 2 + cThick / 2);
    M.box(g, cThick, 0.14, baseD, stoneCurb, -baseW / 2 - cThick / 2, 0.07, 0);
    M.box(g, cThick, 0.14, baseD, stoneCurb, baseW / 2 + cThick / 2, 0.07, 0);

    // 2. 3-Tiered Ceremonial White & Gold Marble Pedestal (ฐานชาลารองรับหอพระ 3 ชั้น)
    const marbleWhite = M.mat(0xf8fafc, { roughness: 0.4 });
    const goldTrim = M.mat(0xf59e0b, { metalness: 0.8, roughness: 0.25 });

    // Tier 1
    M.box(g, 4.4, 0.18, 4.4, marbleWhite, 0, 0.19, 0);
    M.box(g, 4.5, 0.05, 4.5, goldTrim, 0, 0.26, 0);
    // Tier 2
    M.box(g, 3.6, 0.18, 3.6, marbleWhite, 0, 0.37, 0);
    M.box(g, 3.7, 0.05, 3.7, goldTrim, 0, 0.44, 0);
    // Tier 3 (Pavilion Floor)
    M.box(g, 2.8, 0.20, 2.8, marbleWhite, 0, 0.56, 0);
    M.box(g, 2.9, 0.06, 2.9, goldTrim, 0, 0.64, 0);

    // Ceremonial Front Steps (บันไดทางขึ้นด้านหน้า)
    for (let st = 0; st < 3; st++) {
      M.box(g, 1.4, 0.14, 0.35, marbleWhite, 0, 0.07 + st * 0.14, 1.5 + (2 - st) * 0.32);
      M.box(g, 1.44, 0.03, 0.36, goldTrim, 0, 0.14 + st * 0.14, 1.5 + (2 - st) * 0.32);
    }

    // 3. Ornate Golden Columns & Spire Pavilion (เสาทองและศาลาจตุรมุขยอดมณฑป)
    const postGold = M.mat(0xfbbf24, { metalness: 0.75, roughness: 0.25 });
    const colDist = 2.1;
    [[-colDist / 2, -colDist / 2], [colDist / 2, -colDist / 2], [-colDist / 2, colDist / 2], [colDist / 2, colDist / 2]].forEach(([px, pz]) => {
      // Column base
      M.box(g, 0.36, 0.25, 0.36, marbleWhite, px, 0.78, pz);
      // Gold Pillar
      M.cyl(g, 0.11, 0.13, 2.3, postGold, px, 1.95, pz, 12);
      // Pillar capital
      M.box(g, 0.35, 0.15, 0.35, goldTrim, px, 3.12, pz);
    });

    // Arch beams (คานและหน้าบันซุ้มจตุรมุข)
    const beamY = 3.2;
    M.box(g, colDist + 0.3, 0.18, 0.22, goldTrim, 0, beamY, -colDist / 2);
    M.box(g, colDist + 0.3, 0.18, 0.22, goldTrim, 0, beamY, colDist / 2);
    M.box(g, 0.22, 0.18, colDist + 0.3, goldTrim, -colDist / 2, beamY, 0);
    M.box(g, 0.22, 0.18, colDist + 0.3, goldTrim, colDist / 2, beamY, 0);

    // Multi-tier Thai Golden Roof (หลังคามณฑปซ้อนชั้นสีทองอร่าม)
    const roofGold = M.mat(0xd97706, { metalness: 0.6, roughness: 0.3 });
    // Lower eaves
    M.box(g, 3.4, 0.18, 3.4, roofGold, 0, 3.38, 0);
    // Mid tier pyramid
    const rGeo1 = new THREE.ConeGeometry(2.3, 1.1, 4);
    const rMesh1 = new THREE.Mesh(rGeo1, roofGold);
    rMesh1.rotation.y = Math.PI / 4;
    rMesh1.position.y = 3.98;
    rMesh1.castShadow = true;
    g.add(rMesh1);

    // Upper tier slender pyramid
    const rGeo2 = new THREE.ConeGeometry(1.4, 0.9, 4);
    const rMesh2 = new THREE.Mesh(rGeo2, postGold);
    rMesh2.rotation.y = Math.PI / 4;
    rMesh2.position.y = 4.75;
    rMesh2.castShadow = true;
    g.add(rMesh2);

    // Golden Spire Pinnacle (ยอดมณฑปแหลมสูง)
    M.cyl(g, 0.02, 0.14, 1.2, goldTrim, 0, 5.65, 0, 10);
    // Golden finial ball (ยอดนภศูล)
    const fBall = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), goldTrim);
    fBall.position.set(0, 6.28, 0);
    g.add(fBall);

    // 4. Gilded Golden Buddha Statue in Meditation Posture (พระพุทธรูปปางสมาธิ สีทองอร่าม)
    const buddhaGold = M.mat(0xf59e0b, { metalness: 0.88, roughness: 0.2 });
    const lotusMat = M.mat(0xf472b6, { roughness: 0.4 }); // กลีบบัวสีชมพู

    // Lotus Throne Base (ฐานบัวหงาย-บัวคว่ำ)
    M.cyl(g, 0.58, 0.68, 0.16, goldTrim, 0, 0.74, 0, 16);
    M.cyl(g, 0.62, 0.54, 0.14, lotusMat, 0, 0.88, 0, 16);
    M.cyl(g, 0.56, 0.60, 0.08, goldTrim, 0, 0.98, 0, 16);

    // Buddha Folded Legs (พระเพลา / ขัดสมาธิ)
    M.box(g, 0.88, 0.24, 0.52, buddhaGold, 0, 1.12, 0);
    // Buddha Torso (พระวรกาย)
    M.box(g, 0.62, 0.58, 0.36, buddhaGold, 0, 1.48, 0);
    // Meditating Hands (พระหัตถ์วางซ้อนกันประสานบนหน้าตัก)
    M.box(g, 0.42, 0.10, 0.22, buddhaGold, 0, 1.26, 0.14);
    // Shoulders & Head
    M.cyl(g, 0.14, 0.16, 0.12, buddhaGold, 0, 1.82, 0, 12); // Neck
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), buddhaGold);
    head.position.set(0, 2.02, 0);
    head.scale.set(1.0, 1.15, 0.95);
    head.castShadow = true;
    g.add(head);

    // Ushnisha & Flame Aureole (พระเกตุมาลาเปลวเพลิง)
    M.cyl(g, 0.08, 0.14, 0.12, buddhaGold, 0, 2.22, 0, 10);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 8), goldTrim);
    flame.position.set(0, 2.38, 0);
    g.add(flame);

    // Halo Aura Disk behind Buddha Head (พระรัศมีประภามณฑล)
    const haloMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 24), goldTrim);
    haloMesh.rotation.x = Math.PI / 2;
    haloMesh.position.set(0, 2.0, -0.16);
    g.add(haloMesh);

    // 5. Altar Table with Incense Burner & Vases (โต๊ะบูชา กระถางธูป และแจกันดอกบัว)
    const altarMat = M.mat(0xf8fafc, { roughness: 0.4 });
    M.box(g, 1.1, 0.42, 0.45, altarMat, 0, 0.86, 0.72);
    // Incense Burner (กระถางธูปทองเหลือง)
    M.cyl(g, 0.14, 0.11, 0.14, goldTrim, 0, 1.14, 0.72, 12);
    // Incense sticks (ก้านธูป)
    M.cyl(g, 0.015, 0.015, 0.32, M.mat(0xef4444), 0, 1.34, 0.72, 6);
    // Twin Flower Vases with Lotus (แจกันดอกบัวคู่)
    [-0.38, 0.38].forEach((vx) => {
      M.cyl(g, 0.09, 0.07, 0.22, goldTrim, vx, 1.18, 0.72, 10);
      const lFlower = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lotusMat);
      lFlower.position.set(vx, 1.33, 0.72);
      g.add(lFlower);
    });

    // 6. Fragrant Trees flanking shrine (ต้นลีลาวดี/ไม้มงคลประดับสวน)
    [[-baseW * 0.38, -baseD * 0.35], [baseW * 0.38, -baseD * 0.35], [-baseW * 0.38, baseD * 0.35], [baseW * 0.38, baseD * 0.35]].forEach(([fx, fz], i) => {
      const tree = M.tree(0.95, i);
      tree.position.set(fx, 0.1, fz);
      g.add(tree);
    });

    return g;
  };

  // ---------- เกาะกลางถนนหน้าโรงพยาบาล (Green Traffic Median Island) ----------
  M.buildMedian = (w = 4.2, d = 36.5) => {
    const g = new THREE.Group();
    // 1. Raised Concrete Curb Slab with Rounded End Caps (ขอบคันหินเกาะกลาง)
    const curbMat = M.mat(0x94a3b8, { roughness: 0.6 });
    M.box(g, w, 0.22, d, curbMat, 0, 0.11, 0);

    // Hazard Stripes on North & South Tips (แถบขาว-ดำ/ขาว-เหลือง เตือนหัวเกาะ)
    const stripeY = M.mat(0xfacc15, { roughness: 0.4 });
    const stripeB = M.mat(0x0f172a, { roughness: 0.8 });
    [-d / 2 + 0.6, d / 2 - 0.6].forEach(tipZ => {
      M.box(g, w + 0.04, 0.23, 0.4, stripeY, 0, 0.115, tipZ);
      M.box(g, w + 0.05, 0.23, 0.2, stripeB, 0, 0.115, tipZ);
    });

    // 2. Lush Green Lawn Strip (สนามหญ้าเกาะกลางถนน)
    const grassMat = M.mat(0x22c55e, { roughness: 0.95 });
    M.box(g, w - 0.45, 0.05, d - 1.2, grassMat, 0, 0.235, 0);

    // 3. Line of Median Trees & Bushes (ต้นไม้และพุ่มไม้ตกแต่งเกาะกลาง)
    const numTrees = 7;
    for (let i = 0; i < numTrees; i++) {
      const tz = -d * 0.42 + (i * (d * 0.84)) / (numTrees - 1);
      const tree = M.tree(0.95, i % 4);
      tree.position.set(0, 0.24, tz);
      g.add(tree);

      // Low trimmed hedge between trees
      if (i < numTrees - 1) {
        const nextZ = -d * 0.42 + ((i + 1) * (d * 0.84)) / (numTrees - 1);
        const midZ = (tz + nextZ) / 2;
        M.box(g, 1.2, 0.45, 2.2, M.mat(0x16a34a, { flatShading: true }), 0, 0.44, midZ);
      }
    }

    // 4. Streetlight Poles along median (เสาไฟส่องสว่างเกาะกลางถนน)
    const poleMat = M.mat(0x334155, { metalness: 0.5 });
    const lightGlass = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    [-d * 0.32, 0, d * 0.32].forEach(lz => {
      M.cyl(g, 0.09, 0.12, 6.2, poleMat, 0, 3.1, lz, 10);
      // Double arms extending to left & right lanes
      M.box(g, 2.6, 0.08, 0.15, poleMat, 0, 6.15, lz);
      // Dual lamps
      [-1.25, 1.25].forEach(lx => {
        M.box(g, 0.45, 0.08, 0.35, curbMat, lx, 6.12, lz);
        M.box(g, 0.35, 0.02, 0.28, lightGlass, lx, 6.07, lz);
      });
    });

    return g;
  };

  // ---------- ตึก พขร. (สำนักงานยานพาหนะและโรงจอดรถพยาบาล) ----------
  M.buildDriversExterior = (w = 10, d = 14) => {
    const g = new THREE.Group();
    const baseMat = M.mat(0xffffff, { roughness: 0.45 });
    const roofMat = M.mat(0xd6d0c4, { roughness: 0.4 });
    const plinthMat = M.mat(0x475569, { roughness: 0.6 });
    const windowMat = M.mat(0x0284c7, { roughness: 0.12, metalness: 0.75 });
    const trimMat = M.mat(0x0284c7, { roughness: 0.4 });

    // ==========================================
    // 1. สำนักงาน พขร. (Office Wing - อาคาร 2 ชั้น ฝั่งซ้าย)
    // ==========================================
    const offH = 5.8;
    // Foundation plinth
    M.box(g, w + 0.25, 0.35, d + 0.25, plinthMat, 0, 0.175, 0);
    // Main walls
    M.box(g, w, offH, d, baseMat, 0, offH / 2, 0);
    // Roof slab & parapet
    M.box(g, w + 0.5, 0.35, d + 0.5, roofMat, 0, offH + 0.175, 0);
    M.box(g, w + 0.6, 0.3, 0.15, trimMat, 0, offH + 0.4, -d / 2 - 0.05);

    // Windows on Floor 1 & 2
    [1.4, 3.8].forEach(winY => {
      // Front windows (facing West / median)
      M.box(g, w * 0.75, 0.95, 0.1, windowMat, 0, winY, -d / 2 - 0.05);
      // North side windows (facing highway)
      M.box(g, 0.1, 0.95, d * 0.72, windowMat, w / 2 + 0.05, winY, 0);
    });

    // Front Entrance Door & Canopy (Facing West towards median)
    const doorMat = M.mat(0x0284c7, { roughness: 0.1, metalness: 0.8 });
    M.box(g, 2.4, 2.2, 0.08, doorMat, 0, 1.1, -d / 2 - 0.04);
    const canopy = M.box(g, 3.6, 0.2, 2.2, 0x334155, 0, 2.6, -d / 2 - 1.0);

    // Signboard: "สำนักงานกลุ่มงานยานพาหนะ (พขร.)"
    const signTex = M.canvasTexture(1024, 160, (ctx, cw, ch) => {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, cw - 12, ch - 12);
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = 'bold 50px Prompt, Tahoma, sans-serif';
      ctx.fillText('🚐 สำนักงานกลุ่มงานยานพาหนะ (พขร.)', cw / 2, ch / 2);
    });
    M.box(g, 6.2, 0.85, 0.08, new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 }), 0, 3.25, -d / 2 - 1.05);

    // Rooftop Radio Communications Antenna Mast (เสาวิทยุสื่อสารศูนย์ 1669)
    const mastMat = M.mat(0x94a3b8, { metalness: 0.7 });
    M.cyl(g, 0.05, 0.08, 4.5, mastMat, w / 2 - 1.2, offH + 2.4, -d / 2 + 1.2, 8);
    M.box(g, 0.8, 0.04, 0.8, M.mat(0xef4444), w / 2 - 1.2, offH + 4.7, -d / 2 + 1.2);

    // ==========================================
    // 2. โรงจอดรถพยาบาลฉุกเฉิน 1669 ประจำการ (EMS Ambulance Dispatch Bay - ฝั่งขวาของอาคาร)
    // ==========================================
    const garW = 12.0;
    const garD = 7.5;
    const garH = 4.6;
    const garX = -(w / 2 + garW / 2 - 0.4); // ย้ายมาอยู่ฝั่งขวา (South) ของตึก พขร.
    const garZ = -d / 2 + garD / 2;         // ระนาบหน้าเสมอหน้าสำนักงาน หันออกหาเกาะกลางถนน (West)

    // Fleet Garage Floor (Asphalt Base)
    const garFloorMat = M.mat(0x334155, { roughness: 0.88 });
    M.box(g, garW, 0.08, garD, garFloorMat, garX, 0.04, garZ);

    // Back & Side Enclosing Walls
    M.box(g, garW, garH, 0.25, baseMat, garX, garH / 2, garZ + garD / 2 + 0.12);

    // Carport Steel Roof Structure
    const garRoofMat = M.mat(0x94a3b8, { metalness: 0.5, roughness: 0.4 });
    M.box(g, garW + 0.6, 0.22, garD + 0.8, garRoofMat, garX, garH + 0.11, garZ);

    // Fascia Trim over Garage Front
    const garTrim = M.box(g, garW + 0.65, 0.45, 0.12, trimMat, garX, garH + 0.1, garZ - garD / 2 - 0.4);

    // Sign over Garage: "หน่วยปฏิบัติการการแพทย์ฉุกเฉิน 1669"
    const garSignTex = M.canvasTexture(1000, 140, (ctx, cw, ch) => {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(5, 5, cw - 10, ch - 10);
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = 'bold 44px Prompt, Tahoma, sans-serif';
      ctx.fillText('🚑 หน่วยปฏิบัติการการแพทย์ฉุกเฉิน 1669', cw / 2, ch / 2);
    });
    M.box(g, 10.5, 0.72, 0.06, new THREE.MeshStandardMaterial({ map: garSignTex, roughness: 0.4 }), garX, garH + 0.65, garZ - garD / 2 - 0.45);

    // Steel Support Columns along front edge
    const postMat = M.mat(0x475569, { metalness: 0.6, roughness: 0.3 });
    const numCols = 4;
    for (let c = 0; c < numCols; c++) {
      const cx = garX - garW / 2 + 0.6 + (c * (garW - 1.2)) / (numCols - 1);
      M.box(g, 0.32, garH, 0.32, postMat, cx, garH / 2, garZ - garD / 2 + 0.2);
      M.box(g, 0.55, 0.3, 0.55, plinthMat, cx, 0.15, garZ - garD / 2 + 0.2);
    }

    // Vehicle Bays & Parking Markings
    const numBays = 3;
    const bayW = garW / numBays;
    const lineMat = M.mat(0xffffff, { roughness: 0.5 });
    for (let b = 0; b <= numBays; b++) {
      const bx = garX - garW / 2 + b * bayW;
      M.box(g, 0.1, 0.015, garD - 0.6, lineMat, bx, 0.09, garZ);
    }

    // Official Hospital Fleet Parked in Bays
    // Bay 1: Emergency EMS Ambulance 1
    const amb1 = M.makeCar(0xffffff, 'van');
    amb1.position.set(garX - garW / 2 + bayW * 0.5, 0.08, garZ + 0.2);
    M.box(amb1, 1.2, 0.12, 0.35, M.mat(0xdc2626, { emissive: 0xef4444, emissiveIntensity: 0.6 }), 0, 2.15, 0.6);
    g.add(amb1);

    // Bay 2: Emergency EMS Ambulance 2
    const amb2 = M.makeCar(0xffffff, 'van');
    amb2.position.set(garX - garW / 2 + bayW * 1.5, 0.08, garZ + 0.2);
    M.box(amb2, 1.2, 0.12, 0.35, M.mat(0xdc2626, { emissive: 0xef4444, emissiveIntensity: 0.6 }), 0, 2.15, 0.6);
    g.add(amb2);

    // Bay 3: Patient Transfer Van
    const van1 = M.makeCar(0xcbd5e1, 'van');
    van1.position.set(garX - garW / 2 + bayW * 2.5, 0.08, garZ + 0.2);
    g.add(van1);

    // Wheel stops in each bay
    for (let b = 0; b < numBays; b++) {
      const bx = garX - garW / 2 + (b + 0.5) * bayW;
      M.box(g, 1.8, 0.12, 0.2, M.mat(0xf1f5f9), bx, 0.14, garZ + garD / 2 - 0.45);
    }

    return g;
  };
})();
