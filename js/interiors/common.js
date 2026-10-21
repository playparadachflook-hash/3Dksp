/* =========================================================================
 * Khok Si Suphan Hospital 3D - Interiors Core & Common Utilities
 * ========================================================================= */
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
      c.fillStyle = '#fef08a';
      c.fillRect(0, 4, w, 10);
      c.fillRect(0, h - 14, w, 10);
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

  // Export shared helpers to KSS.InteriorsCommon
  K.InteriorsCommon = {
    V,
    WALL_H,
    T,
    PALETTE,
    pm,
    UNIT,
    BOTTLE,
    addEdges,
    floor,
    walkwayTexture,
    walkwayStrip,
    erDeptSignTexture,
    fillRow,
    shelfUnit,
    cooler,
    screenTexture,
    makePerson
  };

  // Modular Registry & Dispatcher
  const registry = {};
  const toggleHandlers = [];

  K.Interiors = {
    registry,
    toggleHandlers,
    register(interiorId, buildFn, toggleFn) {
      registry[interiorId] = buildFn;
      if (toggleFn) toggleHandlers.push(toggleFn);
    },
    build(b) {
      const fn = registry[b.interior];
      if (fn) return fn(b);
      return null;
    },
    toggleStatus(id) {
      for (const handler of toggleHandlers) {
        if (handler(id)) return true;
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
