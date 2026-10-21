# 🏥 แผนผัง 3D ดิจิทัลทวิน โรงพยาบาลโคกศรีสุพรรณ
**Khok Si Suphan Hospital 3D Digital Twin & Network Monitoring**

ระบบแผนผังโรงพยาบาล 3 มิติแบบ Interactive (Three.js) รองรับการหมุนดูผังโรงพยาบาล 360°, ตรวจสอบอาคาร, ดูโมเดลภายในอาคาร (Interiors), สลับสถานะห้อง/เตียง/อุปกรณ์ และตรวจสอบข้อมูลสเปกคอมพิวเตอร์ในแต่ละจุด

---

## 📂 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Folder Structure)

```text
Khoksisuphan-Morniter/
├── index.html                  # 🚀 ไฟล์หลักเปิดใช้งานระบบ 3D ได้ทันที
├── css/
│   └── style.css               # สไตล์ UI, ป้ายชื่อ 3D, โมดัลสเปกคอมพิวเตอร์
├── js/
│   ├── app.js                  # ควบคุม Three.js Scene, Raycaster, กล้อง และการสลับหน้าจอ
│   ├── data.js                 # พิกัดและฐานข้อมูลอาคาร (K.BUILDINGS, K.CATEGORIES)
│   ├── models.js               # ตัวสร้างโมเดลภายนอกอาคารและแลนด์สเคป (K.M)
│   └── interiors/              # โมดูลแปลน 3D ภายในอาคารแต่ละหลัง
│       ├── common.js           # ฟังก์ชันกลางสำหรับสร้างสิ่งของ/อุปกรณ์ภายใน
│       ├── er.js               # อาคารอุบัติเหตุ-ฉุกเฉิน (ER/PCU/LAB/X-Ray)
│       ├── ipd.js              # ตึกผู้ป่วยใน (IPD)
│       ├── physio.js           # อาคารกายภาพบำบัด
│       ├── opd.js              # อาคารผู้ป่วยนอก (OPD)
│       ├── dental.js           # กลุ่มงานทันตกรรม
│       ├── pharmacy.js         # กลุ่มงานเภสัชกรรม
│       ├── drivers.js          # อาคารกลุ่มงานขับรถและโรงจอดรถพยาบาล
│       └── ...
├── assets/
│   └── references/             # แผนที่แม่บท แบบแปลน และภาพถ่ายอ้างอิง
│       ├── map.png
│       ├── map.tif
│       ├── S__92848138.jpg
│       ├── ตึกกายภาพ.png
│       └── ตึกอุบัติเหตุฉุกเฉินER-PCU.png
├── legacy/
│   └── prototype-2.5d.html     # ไฟล์ต้นแบบเวอร์ชันเดิม (2.5D Tailwind Prototype)
└── .agents/                    # คู่มือและ Skills สำหรับพัฒนาโมเดล 3D เพิ่มเติม
```

---

## 💻 วิธีการเปิดใช้งาน (How to Run)

ไม่ต้องติดตั้ง Node.js หรือรัน Local Server สามารถดับเบิลคลิกไฟล์ **`index.html`** เพื่อเปิดใช้งานผ่านเบราว์เซอร์ (Google Chrome, Microsoft Edge) ได้ทันที หรือรันผ่าน PowerShell:

```powershell
Start-Process "E:\flook_Webksp\Khoksisuphan-Morniter\index.html"
```
