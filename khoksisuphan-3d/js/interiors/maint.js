/* =========================================================================
 * อาคารงานช่าง (Maintenance Building - 12 ห้อง + โถงโล่ง)
 * ========================================================================= */
(function () {
  const K = window.KSS, M = K.M, C = K.InteriorsCommon;
  const { V, addEdges } = C;

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
      maintAt(maintBox(0.05, 0.22, 0.14, 0xfacc15), doorW * 0.36, 1.02, 0.06)
    );
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

    const totalW = maintState.rooms.reduce((sum, r) => sum + r.w, 0);
    const backZ = -3.3;
    const frontZ = 3.3;
    const roomD = frontZ - backZ;
    const walkZ = frontZ + 2.2;

    g.add(
      maintAt(maintBox(totalW + 2.0, 0.22, roomD + 3.2, 0xcbd5e1), 0, -0.11, 0.9),
      maintAt(maintBox(totalW + 1.2, 0.04, 2.2, 0xe2e8f0), 0, 0.01, frontZ + 1.1),
      maintAt(maintBox(totalW + 1.2, 0.05, 0.12, 0xfacc15), 0, 0.025, walkZ)
    );

    g.add(maintAt(maintWall(totalW, 2.7, 0.16, 0xe2e8f0), 0, 1.35, backZ));
    g.add(
      maintAt(maintWall(0.16, 2.7, roomD, 0xcbd5e1), -totalW / 2, 1.35, 0),
      maintAt(maintWall(0.16, 2.7, roomD, 0xcbd5e1), totalW / 2, 1.35, 0)
    );

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

      const floorCol = rm.occupied ? 0xfecaca : rm.floorColor;
      g.add(maintAt(maintBox(rm.w - 0.1, 0.04, roomD - 0.1, floorCol), cx, 0.02, 0));

      const borderCol = rm.occupied ? 0xef4444 : 0x64748b;
      g.add(
        maintAt(maintBox(rm.w - 0.08, 0.05, 0.06, borderCol), cx, 0.028, backZ + 0.05),
        maintAt(maintBox(rm.w - 0.08, 0.05, 0.06, borderCol), cx, 0.028, frontZ - 0.05)
      );

      if (idx < maintState.rooms.length - 1) {
        const hasSideDoor = rm.id === 'maint-r3' || rm.id === 'maint-hall';
        if (hasSideDoor) {
          g.add(
            maintAt(maintWall(0.14, 2.6, 2.5, 0xcbd5e1), x1, 1.3, -2.05),
            maintAt(maintWall(0.14, 2.6, 2.1, 0xcbd5e1), x1, 1.3, 2.25),
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
        g.add(maintAt(maintWall(rm.w, 2.6, 0.16, 0xcbd5e1), cx, 1.3, frontZ));
      }

      const signTitle = rm.isHall ? 'โถงโล่ง' : `ห้องที่ ${rm.num}`;
      const signSub = rm.isHall
        ? 'ประตูทางเข้าหลัก'
        : rm.name.replace(/^ห้องที่\s*\d+\s*/, '');
      const signMesh = makeMaintRoomSign(signTitle, signSub, rm.accent);
      signMesh.position.set(cx, 2.55, frontZ + 0.14);
      g.add(signMesh);

      const lightColor = rm.occupied ? 0xef4444 : 0x22c55e;
      const statusLamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({ color: lightColor })
      );
      statusLamp.position.set(cx + rm.w * 0.36, 2.55, frontZ + 0.18);
      g.add(statusLamp);

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

      if (rm.num === 1) {
        g.add(
          maintAt(maintBox(rm.w - 0.5, 0.45, 0.55, 0x38bdf8), cx, 2.15, backZ + 0.4),
          maintAt(maintBox(0.55, 0.35, 0.12, 0x0f172a), cx - 1.1, 1.65, frontZ - 0.12),
          maintAt(makeStorageShelf(1.3, 0.55, 1.75, 0x0284c7), cx - 0.9, 0, -1.2),
          maintAt(makeStorageShelf(1.3, 0.55, 1.75, 0x38bdf8), cx + 0.9, 0, -1.2)
        );
      } else if (rm.num === 2) {
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.8, 0x16a34a), cx, 0, backZ + 0.55),
          maintAt(maintBox(0.75, 0.28, 0.95, 0xdc2626), cx - 0.85, 0.22, 0.5),
          maintAt(maintBox(0.65, 0.85, 0.06, 0x1e293b), cx - 0.85, 0.72, 0.95),
          maintAt(maintCyl(0.05, 0.22, 0.55, 0xf97316, 12), cx + 0.95, 0.28, 0.8),
          maintAt(maintCyl(0.05, 0.22, 0.55, 0xf97316, 12), cx + 0.95, 0.28, 1.45)
        );
      } else if (rm.num === 3) {
        g.add(
          maintAt(makeStorageShelf(1.6, 0.55, 1.85, 0x4f46e5), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.6, 0.55, 1.85, 0xd97706), cx + 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0xb45309), cx - 0.95, 0, 1.2)
        );
      } else if (rm.isHall) {
        g.add(
          maintAt(maintBox(1.5, 0.03, 0.95, 0x1e40af), cx, 0.03, frontZ - 0.65),
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
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.8, 0xdb2777), cx, 0, backZ + 0.55),
          maintAt(maintBox(0.68, 0.85, 1.1, 0x2563eb), cx + 0.85, 0.45, 0.65),
          maintAt(maintCyl(0.24, 0.2, 0.42, 0xfacc15, 14), cx + 0.85, 0.22, 1.75)
        );
      } else if (rm.num === 5) {
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0xca8a04), cx - 0.85, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0xd97706), cx + 0.85, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0xeab308), cx - 0.95, 0, 0.7)
        );
      } else if (rm.num === 6) {
        const deskX = x0 + 0.85;
        const deskZs = [-1.85, -0.25, 1.35];
        deskZs.forEach((dz, dIdx) => {
          const dGroup = new THREE.Group();
          dGroup.add(
            maintAt(maintBox(0.75, 0.74, 1.2, 0xd97706), 0, 0.37, 0),
            maintAt(maintBox(0.8, 0.06, 1.26, 0xfef3c7), 0, 0.75, 0),
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

        const pcX = x1 - 1.05;
        const pcZ = -1.95;
        const pcDesk = new THREE.Group();
        pcDesk.add(
          maintAt(maintBox(1.25, 0.74, 0.75, 0x334155), 0, 0.37, 0),
          maintAt(maintBox(1.3, 0.06, 0.8, 0xe2e8f0), 0, 0.75, 0),
          maintAt(maintBox(0.55, 0.36, 0.05, 0x0f172a), -0.1, 1.02, -0.18),
          maintAt(maintBox(0.5, 0.3, 0.02, 0x38bdf8), -0.1, 1.02, -0.15),
          maintAt(maintBox(0.14, 0.12, 0.12, 0x475569), -0.1, 0.82, -0.18),
          maintAt(maintBox(0.36, 0.02, 0.14, 0x1e293b), -0.1, 0.79, 0.12),
          maintAt(maintBox(0.22, 0.42, 0.44, 0x1e293b), 0.42, 0.98, -0.05),
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
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x475569), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x64748b), cx + 0.8, 0, backZ + 0.55)
        );
      } else if (rm.num === 8) {
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x0d9488), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x14b8a6), cx + 0.8, 0, backZ + 0.55)
        );
      } else if (rm.num === 9) {
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x0369a1), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x0284c7), cx + 0.8, 0, backZ + 0.55)
        );
      } else if (rm.num === 10 || rm.num === 11) {
        g.add(
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x7e22ce), cx - 0.8, 0, backZ + 0.55),
          maintAt(makeStorageShelf(1.5, 0.55, 1.85, 0x6d28d9), cx + 0.8, 0, backZ + 0.55),
          maintAt(maintBox(0.85, 1.75, 0.52, 0x94a3b8), cx - 1.05, 0.88, 0.85)
        );
      } else if (rm.num === 12) {
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

  function toggleMaintStatus(id) {
    const maintRoom = maintState.rooms.find((r) => r.id === id);
    if (maintRoom) {
      maintRoom.occupied = !maintRoom.occupied;
      return true;
    }
    return false;
  }

  K.Interiors.register('maint', buildMaintInterior, toggleMaintStatus);
})();
