/* =========================================================================
 * ป้อมยาม (Guardhouse)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, WALL_H, T, floor, screenTexture, makePerson } = C;

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

  K.Interiors.register('guard', guard);
})();
