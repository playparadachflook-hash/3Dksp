/* =========================================================================
 * โรงจอดรถ (Parking / Carport)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V } = C;

  function parking(b) {
    const isOutdoor = b.id === 'parking-flag' || !!b.openAir;
    const cp = M.buildCarport(b.w, b.d, { seed: M.hash(b.id), transparentRoof: !isOutdoor, openAir: isOutdoor });
    const L = [];
    cp.slots.forEach((s) => { if (!s.occupied) L.push({ text: '🅿️ ว่าง', pos: V(s.x, 0.3, s.z), cls: 'int-label free' }); });
    const free = cp.total - cp.parked;
    L.push({ text: `🚗 จอดอยู่ ${cp.parked} คัน • ว่าง ${free} ช่อง`, pos: V(0, isOutdoor ? 2.4 : 4.4, 0), cls: 'int-label dim' });
    L.push({ text: `↔ ${b.w} ม.`, pos: V(0, 0.1, b.d / 2 + 1.2), cls: 'int-label dim' });
    L.push({ text: `↕ ${b.d} ม.`, pos: V(b.w / 2 + 1.2, 0.1, 0), cls: 'int-label dim' });
    const size = Math.max(b.w, b.d);
    return {
      group: cp.group, labels: L, size,
      title: (isOutdoor ? '🅿️ ลานจอดรถกลางแจ้ง ' : '🚗 ภายใน') + b.name,
      sub: (isOutdoor ? 'ลานจอดรถกลางแจ้ง • ' : 'ที่จอดรถทั่วไป • ') + `ขนาด ${b.w} × ${b.d} เมตร`,
      items: [
        ['🚗', 'รถที่จอดอยู่ (เก๋ง/กระบะ)', `${cp.parked} คัน`],
        ['🅿️', 'ช่องจอดว่าง', `${free} ช่อง`],
        ['📐', 'ช่องจอดทั้งหมด', `${cp.total} ช่อง`],
        isOutdoor ? ['☀️', 'รูปแบบลานจอด', 'ลานจอดรถกลางแจ้ง (Open-Air)'] : ['🏗️', 'โครงหลังคาเหล็ก + เสา', `${b.w}×${b.d} ม.`]
      ],
      cam: { pos: V(size * 0.45 + 3, size * 0.45 + 5, size * 0.55 + 6), target: V(0, 0.5, 0) }
    };
  }

  K.Interiors.register('parking', parking);
})();
