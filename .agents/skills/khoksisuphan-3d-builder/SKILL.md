---
name: khoksisuphan-3d-builder
description: >-
  Use this skill whenever modifying, debugging, or adding 3D buildings, exterior facades,
  interior floor plans, interactive room/bed status toggles, or clickable computer spec modals
  for the Khok Si Suphan Hospital 3D Digital Twin web application (khoksisuphan-3d).
---

# Khok Si Suphan Hospital 3D Digital Twin Skill (`khoksisuphan-3d-builder`)

This skill contains the complete workflow, architectural patterns, coding conventions, and exact specifications for all buildings and 3D interiors developed for **โรงพยาบาลโคกศรีสุพรรณ (Khok Si Suphan Hospital 3D Map)** in `e:\flook_Webksp\khoksisuphan-3d\`.

---

## 1. Project File Structure

- [`index.html`](../../khoksisuphan-3d/index.html) — Main entry point, UI overlays, `#info-panel` (building details + `"🔍 ดูภายในอาคาร"` button), `#interior-panel` (room/bed/equipment status list), and `#pc-modal` (computer/equipment specification modal).
- [`css/style.css`](../../khoksisuphan-3d/css/style.css) — Styling for floating 3D `CSS2DObject` badges (`.int-label`, `.room-title`, `.sub-tag`, `.pc-tag`, `.toggleable`, `.free`, `.busy`) and modals.
- [`js/data.js`](../../khoksisuphan-3d/js/data.js) — Master building list (`K.BUILDINGS`), categories (`K.CATEGORIES`), roads, and map layout coordinates.
- [`js/models.js`](../../khoksisuphan-3d/js/models.js) — 3D geometry/material helpers (`K.M`) and exterior building generators (`buildHospitalBuilding`, `buildGuardhouse`, `buildCarport`, `buildPowerHouse`, `buildHall`, etc.).
- [`js/interiors.js`](../../khoksisuphan-3d/js/interiors.js) — All 3D interior floor plan builders (`K.Interiors.build(b)` and `K.Interiors.toggleStatus(id)`).
- [`js/app.js`](../../khoksisuphan-3d/js/app.js) — Three.js scene setup, camera & `OrbitControls`, raycasting, `enterInterior(b)`, `exitInterior()`, `openPcModal(info)`, and UI event listeners.

---

## 2. Mandatory Rules & Prevention of Common Bugs

1. **Direct Browser Execution (No Local Server Required)**
   - Never spin up a Python (`http.server`) or Node server unless explicitly requested.
   - Always launch the app directly via PowerShell:
     ```powershell
     Start-Process "e:\flook_Webksp\khoksisuphan-3d\index.html"
     ```
2. **Cache Busting on Every Update**
   - Whenever you edit `js/data.js`, `js/models.js`, `js/interiors.js`, `js/app.js`, or `css/style.css`, bump the query string version `?v=YYYYMMDDx` in [`index.html`](../../khoksisuphan-3d/index.html) so the browser reloads the updated scripts immediately.
3. **Helper Function Scoping in `js/interiors.js`**
   - Top-level helpers available across all functions in `js/interiors.js`:
     - `V(x, y, z)` -> `new THREE.Vector3(x, y, z)`
     - `M.box(parent, w, h, d, mat, x, y, z)`
     - `M.cyl(parent, rt, rb, h, seg, mat, x, y, z)`
     - `M.mat(colorHex, options)`
     - `floor(g, w, d, baseHexStr, lineHexStr, tileSize, x, z)`
     - `addEdges(mesh, edgeColorHex)`
     - `walkwayStrip(g, x, z, len, width, rotY)`
     - `makePerson({ role, shirtColor, pantsColor, pose, rotY })`
   - **CRITICAL**: `makePcSpec(...)` is scoped inside `buildErPcuInterior()`. When creating a new `build*Interior()` function, **always define your `pcInfo` spec object directly** inside your builder function (never call `makePcSpec` outside `buildErPcuInterior`).
   - **CRITICAL**: Do not call undeclared shorthand functions (`box`, `wall`, `cyl`, `at`, `tag`) unless they are explicitly defined in scope (such as `maintBox`, `maintWall`, `maintCyl`, `maintAt`, `maintTag` used by `buildMaintInterior`).
4. **Label (`L`) Object Schema**
   - Every entry pushed to `L` in `build*Interior()` must follow the schema expected by `enterInterior()` in `js/app.js`:
     ```js
     L.push({
       text: '🪧 ชื่อห้อง/เตียง (🟢 ว่าง)',
       pos: V(x, y, z),
       cls: 'int-label free toggleable', // or 'int-label busy toggleable', 'int-label pc-tag', 'int-label room-title', 'int-label sub-tag'
       toggleId: 'unique-id',            // optional: triggers K.Interiors.toggleStatus(toggleId)
       pcInfo: pcSpecObject              // optional: triggers openPcModal(pcInfo)
     });
     ```
5. **Computer Specification Modal (`pcInfo`) Schema**
   - To make a 3D computer desk or equipment console clickable, set `mesh.userData.pcInfo = spec` on its meshes AND push a `.pc-tag` label to `L` with `pcInfo: spec`:
     ```js
     const spec = {
       code: 'PC-XXX-01',
       name: 'ชื่อเครื่องคอมพิวเตอร์ / จุดติดตั้ง',
       role: 'หน้าที่การใช้งานหลัก',
       user: 'ผู้รับผิดชอบ / หน่วยงาน',
       os: 'Windows 11 Pro 64-bit',
       cpu: 'Intel Core i5-12400',
       ram: '16 GB DDR4',
       storage: 'SSD NVMe 512 GB',
       monitor: '24" FHD IPS',
       ip: '192.168.x.x',
       software: 'ซอฟต์แวร์ระบบโรงพยาบาล (HOSxP / PACS / LIS / CMMS)',
       peripherals: 'เครื่องสำรองไฟ UPS / เครื่องพิมพ์',
       status: '🟢 ออนไลน์ปกติ'
     };
     ```

---

## 3. Adding or Modifying a Building Interior (Step-by-Step)

1. **Enable the Interior in `js/data.js`**
   - Locate the building entry in `K.BUILDINGS` and set `interior: '<key>'` (e.g., `'er'`, `'physio'`, `'ipd'`, `'power'`, `'hall'`, `'maint'`).
2. **Create State & Builder in `js/interiors.js`**
   - Define a state object (`<key>State`) holding room/bed/equipment status booleans (`occupied` or `running`).
   - Implement `build<Key>Interior(b)` returning `{ group, labels, size, title, sub, items, cam: { pos, target } }`.
   - Keep `cam.pos` distance within `controls.maxDistance` (`80` in `js/app.js`).
3. **Register in `K.Interiors.build(b)` and `K.Interiors.toggleStatus(id)`**
   - Add `if (b.interior === '<key>') return build<Key>Interior(b);` inside `K.Interiors.build(b)`.
   - Add status toggle lookup for `<key>State` inside `K.Interiors.toggleStatus(id)`.
4. **Verify & Cache-Bust**
   - Update `?v=...` in `index.html` and run `Start-Process "e:\flook_Webksp\khoksisuphan-3d\index.html"`.

---

## 4. Reference of All Built Buildings & Floor Plans

For the detailed specifications of every building and floor plan customized in this project (ER/PCU/X-Ray/OPD Card/LAB, Physical Therapy, 1-Floor Inpatient Building IPD, Power Plant, Auditorium, Maintenance 12-Room Building, and Real-Photo Exterior 3D Customization), read:

- [Buildings & Interiors Reference](./references/buildings-and-interiors.md)
