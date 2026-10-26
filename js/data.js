/*
 * ข้อมูลแผนผังโรงพยาบาลโคกศรีสุพรรณ (ปรับกรอบสี่เหลี่ยมผืนผ้าแนวตรง)
 * ---------------------------------------------------------------
 * px, py  = ตำแหน่งกึ่งกลางอาคาร (พิกเซล) บนกรอบสี่เหลี่ยม (X: 50..910, Y: 50..710)
 * w, d    = ขนาดอาคารจริงในหน่วย "เมตร" (w = แกนกว้าง, d = แกนลึก)
 * h       = ความสูงอาคาร (เมตร)
 * rot     = องศาการหมุนอาคาร (ทวนเข็มเมื่อมองจากด้านบน)
 * type    = building | parking | guard | shop | sign | flag | tank | pavilion
 * interior= guard | shop | parking  -> คลิกเข้าไปดูภายในได้
 * ระบบจะแปลง 1 px = 0.15 เมตร โดยอัตโนมัติ
 */
window.KSS = window.KSS || {};

KSS.CATEGORIES = {
  medical:  { label: 'อาคารการแพทย์',   color: '#e11d48' },
  service:  { label: 'บริการผู้ป่วย',    color: '#2563eb' },
  support:  { label: 'อาคารสนับสนุน',   color: '#64748b' },
  parking:  { label: 'โรงจอดรถ',        color: '#4f46e5' },
  security: { label: 'รักษาความปลอดภัย', color: '#d97706' },
  shop:     { label: 'ร้านค้า',          color: '#16a34a' },
  landmark: { label: 'จุดสังเกต',        color: '#db2777' }
};

KSS.BUILDINGS = [
  // ---------- ฝั่งซ้ายชิดกรอบ (แนวตรง Orthogonal) ----------
  { id: 'guard', name: 'ป้อมยาม', icon: '👮', cat: 'security', type: 'guard', interior: 'guard',
    px: 80, py: 590, w: 4, d: 4, h: 3, rot: 0,
    desc: 'ป้อมรักษาความปลอดภัยบริเวณทางเข้าโรงพยาบาล (ชิดขอบซ้าย) ภายในเป็นห้องขนาด 4×4 เมตร มีโต๊ะวางคอมพิวเตอร์ 1 เครื่อง' },
  { id: 'shop', name: 'ร้านค้าสวัสดิการ', icon: '🏪', cat: 'shop', type: 'shop', interior: 'shop',
    px: 90, py: 485, w: 6, d: 3, h: 3, rot: 0,
    desc: 'ร้านค้าสวัสดิการของโรงพยาบาล ขนาด 6×3 เมตร (ชิดขอบซ้าย) จำหน่ายสินค้าอุปโภคบริโภคแบบร้านสะดวกซื้อทั่วไป' },
  { id: 'carport-west', name: 'โรงจอดรถ', icon: '🚗', cat: 'parking', type: 'parking', interior: 'parking',
    px: 85, py: 355, w: 28, d: 6, rot: 90,
    desc: 'โรงจอดรถทั่วไปฝั่งทิศตะวันตก (แนวตรงชิดขอบซ้าย ข้างร้านค้าสวัสดิการ) สำหรับผู้มารับบริการและญาติผู้ป่วย' },

  // ---------- ด้านหน้า & โรงจอดรถ ----------
  { id: 'sign', name: 'ป้ายโรงพยาบาลโคกศรีสุพรรณ', icon: '🏥', cat: 'landmark', type: 'sign',
    px: 195, py: 678, w: 13, d: 2.2, rot: 0,
    desc: 'ป้ายชื่อโรงพยาบาลโคกศรีสุพรรณ บริเวณด้านหน้าโรงพยาบาล (แนวตรงขนานขอบหน้า)' },
  { id: 'garage-main', name: 'โรงรถ', icon: '🚗', cat: 'parking', type: 'parking', interior: 'parking',
    px: 450, py: 625, w: 30, d: 16, rot: 0,
    desc: 'โรงจอดรถหลักด้านหน้าโรงพยาบาล รองรับรถยนต์ได้ 2 แถว คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'garage-staff', name: 'โรงรถเจ้าหน้าที่', icon: '🚙', cat: 'parking', type: 'parking', interior: 'parking',
    px: 775, py: 580, w: 15, d: 9, rot: 0,
    desc: 'โรงจอดรถสำหรับเจ้าหน้าที่โรงพยาบาล' },

  // ---------- ฝั่งขวาชิดกรอบ (แนวตรง Orthogonal) ----------
  { id: 'gym', name: 'โรงยิม', icon: '🏀', cat: 'support', type: 'building', roof: 'arch',
    px: 850, py: 225, w: 11, d: 11, h: 6, rot: 0,
    desc: 'โรงยิมสำหรับออกกำลังกายและจัดกิจกรรม (ชิดขอบขวา)' },
  { id: 'store', name: 'อาคารพัสดุ', icon: '📦', cat: 'support', type: 'building', interior: 'store', floors: 2,
    px: 832, py: 310, w: 16.5, d: 6, h: 5, rot: 0,
    desc: 'อาคารพัสดุและคลังเวชภัณฑ์ (อาคาร 2 ชั้น) ชั้นที่ 1: คลังเก็บยาขนาดใหญ่, ลิฟต์ส่งของ, สำนักงานพัสดุ (โต๊ะคอมพัสดุ 1–3, 5–6), ห้องหัวหน้าพัสดุ (โต๊ะคอม 4), โต๊ะประชุม, เครื่องถ่ายเอกสาร, ชั้นเก็บของ, ทางเดินสีฟ้า, ห้องน้ำ, บันไดขึ้นชั้น 2 และประตูรับส่งของขนาดใหญ่ คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'garage-east', name: 'โรงรถ (ฝั่งตะวันออก)', icon: '🚗', cat: 'parking', type: 'parking', interior: 'parking',
    px: 870, py: 385, w: 8, d: 5, rot: -90,
    desc: 'โรงจอดรถขนาดเล็กฝั่งทิศตะวันออก ติดกับงานช่าง (แนวตรงชิดขอบขวา)' },
  { id: 'maint', name: 'งานช่าง', icon: '🔧', cat: 'support', type: 'building', interior: 'maint',
    px: 865, py: 545, w: 36, d: 8, h: 6, rot: -90,
    desc: 'อาคารงานช่างและคลังเก็บพัสดุ/เอกสาร แบ่งออกเป็น 12 ห้องเรียงกัน (ห้องที่ 1–12) โดยมีโถงโล่งและประตูทางเข้าหลักคั่นกลางระหว่างห้องที่ 3 กับห้องที่ 4 พร้อมป้ายชื่อติดหน้าห้องทุกห้อง คลิกเพื่อดูผัง 3D ภายใน' },

  // ---------- อาคารการแพทย์ / บริการ (แนวตรงทั้งหมด) ----------
  { id: 'er', name: 'ตึกอุบัติเหตุฉุกเฉิน (PCU • ER • X-Ray • LAB • ห้องบัตร)', icon: '🚑', cat: 'medical', type: 'building', interior: 'er', redCross: true, canopy: true,
    px: 454, py: 417, w: 32, d: 12, h: 8, rot: 0,
    desc: 'ภายในแบ่งโซนต่อเนื่อง: ฝั่งซ้าย กลุ่มงาน PCU, ตรงกลาง แผนกฉุกเฉิน ER (เตียง 1-6, จุดซักประวัติ, จุดพ่นยา, เตียงรถเข็น) และฝั่งขวาต่อจาก ER ช่องบนเป็น ห้อง X-Ray ถัดไปคือ ห้อง LAB ส่วนช่องข้างล่างคือ ห้องบัตร พร้อมเคาน์เตอร์ด้านหน้าแยกออกจากห้อง คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'ipd', name: 'ตึกผู้ป่วยใน (IPD)', icon: '🛏️', cat: 'medical', type: 'building', interior: 'ipd',
    px: 235, py: 400, w: 29, d: 15, h: 4.5, rot: 0,
    parts: [{ px: 235, py: 452, w: 12, d: 5, h: 4.0 }],
    desc: 'อาคารหอผู้ป่วยใน (ขนาด 1 ชั้น) ภายในประกอบด้วย เตียงผู้ป่วยใน 1–30, เคาน์เตอร์พยาบาล (Nurse Station), ระบบเรียกพยาบาล (Nurse Call System), โต๊ะคอม IPC 1–3, ห้องแยกโรค 5 ห้อง, ห้องน้ำซ้าย-ขวา และจุดนั่งคอยด้านหน้า คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'opd', name: 'อาคารผู้ป่วยนอก (OPD • ห้องยา • การเงิน • ทันตกรรม)', icon: '🏥', cat: 'medical', type: 'building', interior: 'opd',
    px: 660, py: 452, w: 20, d: 38.5, h: 8.5, rot: 0,
    desc: 'อาคารผู้ป่วยนอกและบริการทางการแพทย์ครบวงจร (OPD Complex) รวม 4 แผนกไว้ภายใต้หลังคาเดียวกัน: แผนกผู้ป่วยนอก (OPD ห้องตรวจ 1–6, EKG, พักคอย 60 ตัว, บริหาร), แผนกเภสัชกรรม (ห้องยาและคลังยา), แผนกการเงินและสิทธิการรักษา, และกลุ่มงานทันตกรรม (ห้องตรวจ 1–4, ยูนิตทำฟัน, X-ray) พร้อมทางรถขึ้นเทียบรับ-ส่งผู้ป่วยแบบมีหลังคาคลุมหันหน้าออกทางตึก ER และโถงทางเดินปรับอากาศเชื่อมต่อภายในครบวงจร คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'thaimed', name: 'แพทย์แผนไทย', icon: '🌿', cat: 'medical', type: 'building', interior: 'thaimed',
    px: 640, py: 275, w: 13, d: 7.5, h: 5, rot: 0,
    desc: 'กลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก ภายในประกอบด้วย โถงทางเข้าพร้อมที่นั่งพักคอย, ห้องนวดแผนไทย (เตียงนวด 1–12), ห้องทำงานแพทย์แผนไทย (โต๊ะคอม 1–2, โต๊ะทำงาน 6 ตัว), ห้องเก็บอุปกรณ์+ห้องซาวน่า, ห้องเก็บอุปกรณ์ และห้องน้ำชาย-หญิง คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'psych', name: 'จิตเวชและยาเสพติด', icon: '🧠', cat: 'medical', type: 'building', interior: 'psych',
    px: 660, py: 630, w: 22, d: 10, h: 6, rot: 0,
    desc: 'คลินิกสุขภาพจิต จิตเวช และบำบัดผู้ติดยาเสพติด ผังภายในแถวยาว 6 ห้องแบบตึก ER: ห้องที่ 1 ห้องหัวหน้า (โต๊ะคอมชิดขวา), ห้องที่ 2 ห้องทำงาน (โต๊ะคอม 2 เครื่อง), ห้องที่ 3 ว่าง (ให้คำปรึกษา), ห้องที่ 4 ว่าง (พักฟื้น/สังเกตอาการ), ห้องที่ 5 ว่าง (โต๊ะคอมชิดซ้าย ประเมินสุขภาพจิต), ห้องที่ 6 ว่าง (กิจกรรมบำบัด) พร้อมโถงทางเดินและที่นั่งพักคอย คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'physio', name: 'ตึกกายภาพ', icon: '🦽', cat: 'medical', type: 'building', interior: 'physio',
    px: 437, py: 288, w: 24, d: 5, h: 4.5, rot: 0,
    desc: 'งานกายภาพบำบัดและฟื้นฟูสมรรถภาพผู้ป่วย (อาคารยาวด้านหลังตึกร่มโพธิ์ 3) ภายในประกอบด้วย ห้องทำกายภาพ, เตียงกายภาพ 1-4, ลู่วิ่ง, เค้าเตอร์ซักประวัติ, โต๊ะคอมกายภาพ 1-2, โต๊ะหัวหน้า, กายภาพ Notebook และห้องเก็บอุปกรณ์ คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'garage-north', name: 'โรงจอดรถ', icon: '🚗', cat: 'parking', type: 'parking', interior: 'parking',
    px: 388, py: 242, w: 12, d: 6, rot: 0,
    desc: 'โรงจอดรถทั่วไป บริเวณใกล้หอประชุมและงานกายภาพบำบัด' },
  { id: 'rompho', name: 'ตึกร่มโพธิ์ 3', icon: '🏢', cat: 'medical', type: 'building', interior: 'rompho', floors: 3,
    px: 437, py: 334, w: 16.5, d: 8, h: 9, rot: 0,
    desc: 'อาคารร่มโพธิ์ 3 (อาคาร 3 ชั้น) ชั้นที่ 1: แผนกห้องคลอดและสูติกรรม, ทางเดินด้านหน้า, ปีกขวาเดิม (ห้องว่างรอจัดสรร), ช่อง 1: งานพัฒนาการเด็ก (ชุดตรวจ DSPM, บ่อบอล, เบาะฝึกพัฒนาการ, โต๊ะตรวจ), ช่อง 2: งานระบาดวิทยา (ทีมสอบสวนโรค SRRT, จอแสดงผล GIS 506, กล่อง VTM, ตู้ PPE) และห้องผ่าคลอด 1, หอผู้ป่วยคลอด 16 เตียง, ห้องพักคลอด 1-2, ห้องเตรียมคลอด 3 เตียง, ห้องพักแพทย์ 2 ห้อง, ห้องพักเจ้าหน้าที่ / ชั้นที่ 2: ศูนย์ไตเทียม (ห้องฟอกไต 17 เตียง, โต๊ะพยาบาล 1-2, ห้องระบบน้ำ RO, ห้องล้าง/เก็บตัวกรอง, ห้องเก็บเวชภัณฑ์, ห้องพักเจ้าหน้าที่ 1-3, ห้องพักญาติ, ห้องน้ำ, ลิฟต์, ห้องพระ และจุดนั่งคอย) / ชั้นที่ 3: หอผู้ป่วยพิเศษ (ห้องพิเศษ 13 ห้อง: 301–308, 309, 311–314 พร้อมตู้สีเหลืองจัดวางเป็นระเบียบ, เค้าเตอร์พยาบาล, เค้าเตอร์โต๊ะคอมห้องพิเศษ, โต๊ะประชุม, ลิฟต์, ชั้นเก็บของ, ห้องพักเจ้าหน้าที่ และห้องน้ำ) คลิกเพื่อดูผัง 3D ภายใน' },

  // ---------- อาคารสนับสนุน ----------
  { id: 'hall', name: 'หอประชุม', icon: '🎤', cat: 'support', type: 'building', interior: 'hall',
    px: 272, py: 275, w: 15, d: 7, h: 6, rot: 90,
    parts: [{ px: 300, py: 275, w: 6, d: 4, h: 5 }],
    desc: 'หอประชุมสำหรับจัดอบรมและกิจกรรมของโรงพยาบาล ภายในประกอบด้วย เวที, เก้าอี้แถวละ 10 ตัว จำนวน 5 แถว (รวม 50 ที่นั่ง), ห้องควบคุมไฟและเครื่องเสียง และประตูทางเข้า-ออก 6 จุด คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'supply', name: 'ซัพพลาย', icon: '🧺', cat: 'support', type: 'building', interior: 'supply',
    px: 275, py: 205, w: 26, d: 8, h: 5, rot: 0,
    desc: 'งานจ่ายกลาง ซักฟอก และทำให้ปราศจากเชื้อ ภายในประกอบด้วย ห้องว่างฝั่งซ้ายสุด, ห้องจ่ายกลางปลอดเชื้อ, ห้องทำงานธุรการและห้องน้ำ, โซนเครื่องซักผ้าใหญ่ 3 เครื่อง, และห้องเก็บผ้าและอุปกรณ์ทางการแพทย์ คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'kitchen', name: 'โรงครัว', icon: '🍳', cat: 'support', type: 'building', interior: 'kitchen',
    px: 365, py: 205, w: 6, d: 4.5, h: 4.5, rot: 0,
    desc: 'อาคารโรงครัวและโภชนาการสำหรับประกอบอาหารผู้ป่วยใน ภายในประกอบด้วย โซนครัวทำอาหารเตรียมวัตถุดิบ, โต๊ะทำครัว 2 จุด, ห้องซ้ายบนมีชั้นเก็บอุปกรณ์และโต๊ะคอมหัวหน้า, ห้องขวาล่างมีชั้นเก็บเครื่องปรุง 2 จุด, โต๊ะปฏิบัติงาน 2 ตัว และโต๊ะคอมโรงครัว คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'power', name: 'โรงไฟฟ้า', icon: '⚡', cat: 'support', type: 'building', interior: 'power',
    px: 415, py: 205, w: 5.5, d: 4, h: 4, rot: 0,
    desc: 'อาคารโรงไฟฟ้าของโรงพยาบาล ภายในติดตั้งเครื่องผลิตไฟฟ้าสำรอง (Emergency Generator) พร้อมประตูทางเข้าและป้ายเตือนอันตรายไฟฟ้าแรงสูงหน้าประตู คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'tank', name: 'แท้งน้ำ', icon: '💧', cat: 'support', type: 'tank',
    px: 502, py: 218, w: 4.5, d: 4.5, h: 7, rot: 0,
    desc: 'ถังเก็บน้ำประปาของโรงพยาบาล' },
  { id: 'waterworks', name: 'โรงน้ำ', icon: '🚰', cat: 'support', type: 'building',
    px: 640, py: 225, w: 5.5, d: 4.5, h: 4, rot: 0,
    desc: 'ระบบผลิตและกรองน้ำดื่ม' },
  { id: 'sala', name: 'ศาลาปันสุข', icon: '🛖', cat: 'landmark', type: 'pavilion',
    px: 525, py: 335, w: 6, d: 6, h: 3, rot: 0,
    desc: 'ศาลาพักผ่อนสำหรับผู้ป่วยและญาติ' },
  { id: 'flag', name: 'เสาธง', icon: '🇹🇭', cat: 'landmark', type: 'flag',
    px: 450, py: 512, w: 16, d: 4.5, h: 10, rot: 0,
    desc: 'ลานเสาธงหน้าตึกอุบัติเหตุฉุกเฉิน' },
  { id: 'parking-flag', name: 'ลานจอดรถหน้าเสาธง (กลางแจ้ง)', icon: '🅿️', cat: 'parking', type: 'parking', interior: 'parking', openAir: true,
    px: 450, py: 546, w: 24, d: 6.8, rot: 0,
    desc: 'ลานจอดรถกลางแจ้ง (Open-Air Parking) บริเวณด้านหน้าเสาธงและหน้าตึกอุบัติเหตุฉุกเฉิน (ER) สำหรับผู้มารับบริการและติดต่อราชการ พื้นแอสฟัลต์ ตีเส้นช่องจอด พร้อมที่กั้นล้อและเสาไฟส่องสว่างโซลาร์เซลล์' },
  { id: 'buddha', name: 'พระประจำโรงพยาบาล', icon: '🪷', cat: 'landmark', type: 'buddha',
    px: 270, py: 636, w: 5.2, d: 5.2, h: 4.8, rot: 0,
    desc: 'พระพุทธรูปศักดิ์สิทธิ์ประจำโรงพยาบาลโคกศรีสุพรรณ ประดิษฐานบนศาลาจตุรมุขยอดมณฑปสีทองอร่าม ท่ามกลางสวนดอกไม้และต้นไม้ร่มรื่นข้างสวนหย่อมหลังป้ายโรงพยาบาล เป็นศูนย์รวมจิตใจและที่สักการะบูชาของบุคลากรทางการแพทย์ ผู้ป่วย และญาติ' },
  { id: 'garden-ipd', name: 'สนามหญ้าหน้าตึกผู้ป่วยใน', icon: '🌿', cat: 'landmark', type: 'garden-ipd',
    px: 235, py: 495, w: 22, d: 8.5, rot: 0,
    desc: 'สนามหญ้าเขียวขจีและสวนหย่อมภูมิทัศน์บริเวณหน้าตึกผู้ป่วยใน (IPD) ร่มรื่นด้วยพรรณไม้ สวนหย่อม และม้านั่งพักผ่อนสำหรับผู้ป่วยและญาติ' },
  { id: 'garden-sign', name: 'สนามนั่งเล่นหลังป้ายโรงพยาบาล', icon: '🌳', cat: 'landmark', type: 'garden-sign',
    px: 195, py: 625, w: 15.5, d: 8.5, rot: 0,
    desc: 'สวนสาธารณะและลานนั่งเล่นพักผ่อนใต้ร่มเงาต้นไม้ใหญ่ บริเวณด้านหลังป้ายโรงพยาบาลโคกศรีสุพรรณ พร้อมม้านั่งและโต๊ะพักผ่อนร่มรื่น' },
  { id: 'drivers', name: 'ตึก พขร. (สำนักงานและโรงจอดรถพยาบาล)', icon: '🚐', cat: 'support', type: 'drivers', interior: 'drivers',
    px: 410, py: 810, w: 10, d: 14, h: 5.8, rot: 90,
    desc: 'อาคารกลุ่มงานยานพาหนะ (ตึก พขร.) อาคารสำนักงาน 2 ชั้น พร้อมโรงจอดรถพยาบาลฉุกเฉิน EMS หันหน้าออกทางทิศตะวันตกไปทางเกาะกลางถนนหน้าโรงพยาบาล คลิกเพื่อดูผัง 3D ภายใน' },
  { id: 'road-median', name: 'เกาะกลางถนนหน้าโรงพยาบาล', icon: '🌴', cat: 'landmark', type: 'median',
    px: 232, py: 840, w: 4.2, d: 36.5, rot: 0,
    desc: 'เกาะกลางถนนแบ่งทิศทางการจราจร 2 เลนบริเวณทางเข้าโรงพยาบาล ตกแต่งด้วยสนามหญ้า พรรณไม้ และเสาไฟส่องสว่างถนน' }
];

// ทางเชื่อมระหว่างอาคาร (Connecting Corridors / Covered Walkway Bridges)
KSS.CORRIDORS = [
  {
    id: 'corridor-ipd-er',
    name: 'ทางเชื่อมตึกผู้ป่วยใน - อุบัติเหตุฉุกเฉิน (IPD ↔ ER)',
    px: 339.5, py: 417,
    w: 2.8, d: 11.5, h: 4.2,
    desc: 'ทางเดินเชื่อมต่อในร่มระหว่างตึกผู้ป่วยใน (IPD) และตึกอุบัติเหตุฉุกเฉิน (ER)'
  },
  {
    id: 'corridor-er-opd',
    name: 'ทางเชื่อมตึกอุบัติเหตุฉุกเฉิน - ผู้ป่วยนอก (ER ↔ OPD)',
    px: 577.0, py: 417,
    w: 5.2, d: 11.5, h: 4.2,
    desc: 'ทางเดินเชื่อมต่อในร่มระหว่างตึกอุบัติเหตุฉุกเฉิน (ER) และอาคารผู้ป่วยนอก (OPD Complex)'
  }
];

// อาคารด้านหลังโรงพยาบาล (จัดเรียงแนวตรงทั้งหมด) [px, py, w, d, h, rot]
KSS.FILLERS = [
  [250, 95, 5, 3.5, 3, 0], [300, 95, 4.5, 3, 3, 0], [350, 95, 4.5, 3, 3, 0], [446, 85, 12.5, 3.5, 3.5, 0], [540, 95, 4.5, 3, 3, 0],
  [250, 132, 5, 3, 3, 0], [300, 132, 5, 3, 3, 0], [350, 132, 4.5, 3, 3, 0], [400, 132, 4.5, 3, 3, 0], [445, 132, 4, 3, 3, 0],
  [490, 132, 4.5, 3, 3, 0], [550, 132, 7.5, 3.5, 3.5, 0], [270, 160, 15, 3.5, 3, 0], [350, 160, 6.5, 5, 4, 0], [400, 160, 8, 4, 3.5, 0],
  [455, 160, 7.5, 5, 4, 0], [508, 160, 7.5, 4, 3.5, 0], [566, 160, 6, 4.5, 4, 0], [620, 85, 4, 3, 3, 0],
  [750, 85, 5, 3, 3, 0], [85, 160, 11, 4, 4, 90]
];

// อาคารรอบนอกโรงพยาบาล
KSS.CONTEXT = [
  [955, 95, 6, 4, 3], [955, 155, 6, 5, 4], [955, 230, 5, 6, 3], [955, 330, 5, 8, 4]
];

// ขอบเขตพื้นที่โรงพยาบาล (กรอบสี่เหลี่ยมผืนผ้าแนวตรงชัดเจน)
KSS.BOUNDARY = [[50, 710], [910, 710], [910, 50], [50, 50]];

// ถนนเส้นหลักของโรงพยาบาล (Hospital Main Road Network ตามแนวผังที่กำหนด)
KSS.ROADS = [
  // 1. ถนนเส้นหลักฝั่งทิศตะวันตก (ทางเข้าข้างป้อมยามยาวไปจนถึงด้านหลัง)
  { w: 6.0, pts: [[135, 960], [135, 740], [135, 538], [135, 170]] },

  // 2. ถนนตัดขวางด้านหน้าตึก IPD (เชื่อมต่อจากถนนตะวันตกมายังทางเข้ากลาง)
  { w: 5.0, pts: [[135, 538], [330, 538]] },

  // 3. ทางเข้าหลักด้านหน้ากลาง (จากถนนใหญ่หน้าโรงพยาบาลตรงเข้ามา)
  { w: 6.0, pts: [[330, 960], [330, 740], [330, 685], [330, 538]] },

  // 4. ถนนวนขึ้น-ลง เทียบรถหน้าตึก ER (ER Ambulance Loop & Drive-Thru)
  { w: 5.5, pts: [[330, 538], [375, 475], [545, 475], [575, 520], [575, 685]] },

  // 5. ถนนเลียบรั้วด้านหน้า (ผ่านหน้าโรงรถและหน้าตึกจิตเวชไปยังมุมตะวันออก)
  { w: 5.0, pts: [[330, 685], [575, 685], [850, 685]] },

  // 6. ถนนเลียบข้างฝั่งตะวันออก (ขึ้นไปยังโรงรถเจ้าหน้าที่และงานช่าง)
  { w: 4.5, pts: [[850, 685], [850, 530]] },

  // 7. ทางเทียบรถหน้าตึกผู้ป่วยนอก (OPD Porte-Cochère Drive-Thru Lane หันหน้าออกทางตึก ER)
  { w: 5.2, pts: [[545, 475], [572, 510], [572, 565], [575, 620], [575, 685]] },

  // 8. ถนนเส้นหลักด้านหน้านอกรั้วโรงพยาบาล (Main Highway along Front Fence)
  { w: 7.0, pts: [[80, 740], [330, 740], [575, 740], [850, 740], [980, 740]] },

  // 9. ทางแยกเข้าตึก พขร. และโรงจอดรถ (Spur into Transportation Dept & Fleet Depot)
  { w: 6.0, pts: [[330, 740], [350, 755], [350, 960]] },

  // 10. ถนนภายนอกฝั่งตะวันออกเลียบรั้ว
  { w: 5.5, pts: [[928, 30], [928, 730]] }
];

// ต้นไม้เพิ่มเติม [px, py]
KSS.TREES = [
  [605, 575], [605, 615], [605, 655], [300, 570], [300, 615], [300, 655],
  [165, 580], [165, 625], [265, 580], [265, 625], [410, 625], [490, 625],
  [850, 110], [850, 150]
];


// =========================================================================
// ข้อมูลเครื่องแม่ข่าย คอนโทรลเลอร์ และอุปกรณ์เครือข่ายศูนย์คอมพิวเตอร์
// โรงพยาบาลโคกศรีสุพรรณ (Data Center & Server Room Equipment)
// =========================================================================
KSS.SERVER_DEVICES = [
  {
    id: 'mikrotik',
    no: 1,
    name: 'Mikrotik',
    type: 'network',
    typeName: 'Core Router & Gateway',
    model: 'MikroTik RouterBOARD Cloud Core Router',
    ip: '10.10.100.1',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.1',
    location: 'Computer-Room',
    username: 'ksp',
    password: 'ksp@',
    role: 'เราเตอร์หลักโรงพยาบาล จัดการ Routing, ควบคุมแบนด์วิธเครือข่าย, จัดสรร DHCP IP และเกตเวย์เชื่อมโยงอินเทอร์เน็ต',
    status: 'online',
    ping: '0.6ms',
    uptime: '240 วัน 11 ชม.',
    cpu: 'Tile Multi-Core 1.2 GHz',
    cpuUsage: 14,
    ram: '2 GB High-Speed RAM',
    ramUsage: 28,
    storage: '1 GB RouterOS Flash',
    storageUsage: 19,
    temp: '31°C',
    power: 'Dual AC Power Bus (Normal)',
    os: 'MikroTik RouterOS v7.14'
  },
  {
    id: 'cisco-sg250',
    no: 2,
    name: 'Cisco SG250',
    type: 'switch',
    typeName: 'Core Managed Switch',
    model: 'Cisco SG250-26 26-Port Gigabit Smart Switch',
    ip: '10.10.100.2',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.2',
    location: 'Computer-Room',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์กระจายสัญญาณหลักศูนย์คอมพิวเตอร์ เชื่อมต่อเซิร์ฟเวอร์, จัดการ VLAN และเชื่อมต่อสาย Fiber Optic ระหว่างอาคาร',
    status: 'online',
    ping: '0.7ms',
    uptime: '228 วัน 9 ชม.',
    cpu: 'Cisco Enterprise Switching ASIC',
    cpuUsage: 9,
    ram: '512 MB Memory',
    ramUsage: 36,
    storage: '256 MB Flash',
    storageUsage: 25,
    temp: '30°C',
    power: 'Internal Power Supply (Good)',
    os: 'Cisco SG250 Firmware v2.5.9'
  },
  {
    id: 'aruba-1930',
    no: 3,
    name: 'Aruba 1930',
    type: 'switch',
    typeName: 'Distribution PoE+ Switch',
    model: 'Aruba Instant On 1930 24G 4SFP+ 370W PoE+ Switch',
    ip: '10.10.150.3',
    port: '443',
    protocol: 'https',
    url: 'https://10.10.150.3',
    location: 'Computer-Room',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ PoE+ จ่ายไฟและส่งข้อมูลให้อุปกรณ์ Access Point Wi-Fi, โทรศัพท์ IP Phone และระบบกล้องวงจรปิด CCTV',
    status: 'online',
    ping: '0.8ms',
    uptime: '194 วัน 16 ชม.',
    cpu: 'ARM Cortex-A9 800 MHz',
    cpuUsage: 11,
    ram: '512 MB SDRAM',
    ramUsage: 32,
    storage: '256 MB Flash',
    storageUsage: 22,
    temp: '32°C',
    power: '142W / 370W PoE Budget (Active)',
    os: 'Aruba Instant On Switch OS v2.8'
  },
  {
    id: 'ksp-sw-opd',
    no: 4,
    name: 'KSP-SW-OPD',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 24G Managed Switch',
    serial: 'CN31LB20R3',
    ip: '10.10.100.6',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.6',
    location: 'ห้องเภสัช',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายห้องเภสัชกรรม (OPD Pharmacy) ติดตั้งในตู้แร็คแขวนผนังช่อง 1 ข้างโต๊ะคอมจ่ายยา 7 เชื่อมต่อคอมพิวเตอร์จ่ายยา 1–7, เครื่องพิมพ์ฉลากยา, เครื่องพิมพ์ใบสั่งยา และระบบ HOSxP',
    status: 'online',
    ping: '0.6ms',
    uptime: '182 วัน 8 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 12,
    ram: '512 MB High-Speed Memory',
    ramUsage: 38,
    storage: '128 MB Flash Memory',
    storageUsage: 26,
    temp: '29°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'ksp-sw-xray',
    no: 5,
    name: 'KSP-SW-XRAY',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 24G Managed Switch',
    serial: 'CN32LB90X7',
    ip: '10.10.100.7',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.7',
    location: 'ห้อง X-Ray (ตึกอุบัติเหตุฉุกเฉิน ER)',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายความเร็วสูงประจำห้องเอกซเรย์ (X-Ray Department) รองรับทราฟฟิกภาพถ่ายรังสีดิจิทัลความละเอียดสูง (PACS / DICOM Workstation), เชื่อมต่อเครื่องตรวจเอกซเรย์ Digital Radiography (DR), เครื่องพิมพ์ฟิล์มเอกซเรย์ Dry Laser Imager, คอมพิวเตอร์อ่านผล X-Ray และ Uplink ไฟเบอร์ไปยัง Server Room',
    status: 'online',
    ping: '0.5ms',
    uptime: '175 วัน 11 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 15,
    ram: '512 MB High-Speed Memory',
    ramUsage: 42,
    storage: '128 MB Flash Memory',
    storageUsage: 28,
    temp: '29°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'ksp-sw-drivers',
    no: 6,
    name: 'KSP-SW-DRIVERS',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 16G Managed Switch',
    serial: 'CN32LB80W1',
    ip: '10.10.100.8',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.8',
    location: 'ตึก พขร. (ศูนย์สั่งการ 1669)',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายกลุ่มงานยานพาหนะ (ตึก พขร.) ติดตั้งในตู้แร็คแขวนผนัง ศูนย์สั่งการและจัดคิวรถพยาบาล 1669 เชื่อมต่อคอมพิวเตอร์จัดคิวและ GPS 1669, วิทยุสื่อสาร Base Station, ระบบกล้องวงจรปิดโรงจอดรถ และ Uplink Fiber SFP ไปยังตึกศูนย์คอมพิวเตอร์',
    status: 'online',
    ping: '0.7ms',
    uptime: '164 วัน 12 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 8,
    ram: '512 MB High-Speed Memory',
    ramUsage: 31,
    storage: '128 MB Flash Memory',
    storageUsage: 24,
    temp: '28°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'ksp-sw-pcu',
    no: 7,
    name: 'KSP-SW-PCU',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 24G Managed Switch',
    serial: 'CN32LB95P4',
    ip: '10.10.100.9',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.9',
    location: 'กลุ่มงาน PCU (ห้องตรวจ 1)',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายกลุ่มงานบริการปฐมภูมิและเวชปฏิบัติครอบครัว (PCU & Family Medicine) ติดตั้งในตู้แร็คแขวนผนังห้องตรวจ 1 เชื่อมต่อระบบคอมพิวเตอร์ห้องตรวจ PCU 1–3, จุดคัดกรอง, ห้องทันตกรรม PCU, งานส่งเสริมสุขภาพ, ระบบวัคซีน และเชื่อมต่อฐานข้อมูล HOSxP Primary Care',
    status: 'online',
    ping: '0.6ms',
    uptime: '178 วัน 16 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 11,
    ram: '512 MB High-Speed Memory',
    ramUsage: 36,
    storage: '128 MB Flash Memory',
    storageUsage: 25,
    temp: '28°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'ksp-sw-ipd',
    no: 8,
    name: 'KSP-SW-IPD',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 24G Managed Switch',
    serial: 'CN32LB98D2',
    ip: '10.10.100.11',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.11',
    location: 'ตึกผู้ป่วยใน (IPD - Nurse Station)',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายหอผู้ป่วยใน (Inpatient Department - IPD) ติดตั้งในตู้แร็คแขวนผนังข้างห้อง Nurse Station เชื่อมต่อคอมพิวเตอร์ IPC 1–3, ระบบเรียกพยาบาล Nurse Call System, แท็บเล็ตตรวจเตียง Smart Ward, กล้องวงจรปิดหอผู้ป่วย และระบบบริหารจัดการเตียง 30 เตียง HOSxP IPD',
    status: 'online',
    ping: '0.6ms',
    uptime: '180 วัน 8 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 14,
    ram: '512 MB High-Speed Memory',
    ramUsage: 39,
    storage: '128 MB Flash Memory',
    storageUsage: 27,
    temp: '29°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'ksp-sw-psych',
    no: 9,
    name: 'KSP-SW-PSYCH',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 24G Managed Switch',
    serial: 'CN32LB99K5',
    ip: '10.10.100.12',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.12',
    location: 'ตึกจิตเวชและยาเสพติด (ห้องที่ 3)',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายกลุ่มงานจิตเวชและยาเสพติด ติดตั้งในตู้แร็คแขวนผนังห้องให้คำปรึกษาและบำบัดกลุ่ม (ห้องที่ 3) เชื่อมต่อคอมหัวหน้ากลุ่มงาน (CONSULT-PC / Port 1), คอมพยาบาลจิตเวช 1 (CSPC-PAN / Port 2), คอมงานบำบัดยาเสพติด 2 (DESKTOP-2JC9KOA / Port 3), จุดคัดกรอง 2Q/9Q/8Q, กล้องวงจรปิดห้องสงบอารมณ์ และ Uplink Fiber SFP ไปยัง Data Center',
    status: 'online',
    ping: '0.6ms',
    uptime: '172 วัน 19 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 12,
    ram: '512 MB High-Speed Memory',
    ramUsage: 34,
    storage: '128 MB Flash Memory',
    storageUsage: 25,
    temp: '28°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'ksp-sw-admin',
    no: 10,
    name: 'KSP-SW-ADMIN',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 24G Managed Switch',
    serial: 'CN32LB99M8',
    ip: '10.10.100.13',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.13',
    location: 'ตึกผู้ป่วยนอก OPD (ห้องกลุ่มงานบริหารทั่วไป)',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายกลุ่มงานบริหารทั่วไป ติดตั้งในตู้แร็คแขวนผนังห้องบริหาร เชื่อมต่อคอมพิวเตอร์สารบรรณ (คอม 1), งานการเงิน (คอม 2), งานพัสดุ e-GP (คอม 3), งานบุคคล HR (คอม 4), งานแผนงาน (คอม 5), งานอาคารยานพาหนะ (คอม 6), งานตรวจภายใน (คอม 7), ระบบหนังสือราชการอิเล็กทรอนิกส์ e-Document และ Uplink Fiber SFP ไปยัง Server Room',
    status: 'online',
    ping: '0.5ms',
    uptime: '179 วัน 21 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 13,
    ram: '512 MB High-Speed Memory',
    ramUsage: 36,
    storage: '128 MB Flash Memory',
    storageUsage: 26,
    temp: '28°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'ksp-sw-rompho1',
    no: 11,
    name: 'KSP-SW-ROMPHO1',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 24G Managed Switch',
    serial: 'CN32LB99R1',
    ip: '10.10.100.14',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.14',
    location: 'ตึกร่มโพธิ์ 3 ชั้น 1 (ห้องพักแพทย์/ห้องคลอด)',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายตึกร่มโพธิ์ 3 ชั้น 1 (แผนกห้องคลอดและสูติกรรม) ติดตั้งในตู้แร็คแขวนผนังห้องพักแพทย์ เชื่อมต่อโต๊ะคอมห้องคลอด 1 (LR-PC: 10.10.40.30 / Port 1), คอมพิวเตอร์งานพัฒนาการเด็ก (PC-DEV-01), คอมพิวเตอร์งานระบาดวิทยา (PC-EPI-01), ระบบจอแดชบอร์ดระบาดวิทยา GIS 506, ระบบเรียกพยาบาลห้องคลอด, กล้องวงจรปิด และ Uplink Fiber SFP ไปยังศูนย์คอมพิวเตอร์',
    status: 'online',
    ping: '0.6ms',
    uptime: '175 วัน 14 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 14,
    ram: '512 MB High-Speed Memory',
    ramUsage: 37,
    storage: '128 MB Flash Memory',
    storageUsage: 27,
    temp: '29°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'ksp-sw-kitchen',
    no: 12,
    name: 'KSP-SW-KITCHEN',
    type: 'switch',
    typeName: 'Distribution Switch Hub',
    model: 'Aruba / HPE 2530 24G Managed Switch',
    serial: 'CN32LB99K7',
    ip: '10.10.100.15',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.100.15',
    location: 'อาคารโรงครัวและโภชนาการ (หน้าห้องหัวหน้าโรงครัว)',
    username: 'admin',
    password: 'ksp@12345',
    role: 'สวิตช์ฮับเครือข่ายกลุ่มงานโภชนาการและโรงครัว ติดตั้งในตู้แร็คแขวนผนังหน้าห้องหัวหน้าโรงครัว เชื่อมต่อโต๊ะคอมหัวหน้างานโภชนาการ (PC-KIT-02), โต๊ะคอมเจ้าหน้าที่โรงครัว (PC-KIT-01), ระบบพิมพ์ใบสั่งอาหารผู้ป่วยใน HOSxP Nutrition, เครื่องสำรองไฟ และ Uplink Fiber SFP ไปยังศูนย์คอมพิวเตอร์',
    status: 'online',
    ping: '0.6ms',
    uptime: '176 วัน 8 ชม.',
    cpu: 'ARM 800 MHz Enterprise Switch Core',
    cpuUsage: 11,
    ram: '512 MB High-Speed Memory',
    ramUsage: 33,
    storage: '128 MB Flash Memory',
    storageUsage: 25,
    temp: '28°C',
    power: 'Internal AC Power Supply (Good)',
    os: 'ArubaOS-Switch Firmware v16.10'
  },
  {
    id: 'idrac-dell',
    no: 13,
    name: 'iDrack server dell T440',
    type: 'controller',
    typeName: 'IPMI / Out-of-band Controller',
    model: 'Integrated Dell Remote Access Controller 9 (iDRAC9)',
    ip: '10.10.150.12',
    port: '443',
    protocol: 'https',
    url: 'https://10.10.150.12',
    location: 'Server-Room',
    username: 'root',
    password: 'Ks@042766054$',
    role: 'คอนโทรลเลอร์ฮาร์ดแวร์ควบคุมเซิร์ฟเวอร์ DELL T440 ระยะไกล จัดการ Power On/Off, Virtual Console (HTML5) และมอนิเตอร์เซ็นเซอร์',
    status: 'online',
    ping: '0.8ms',
    uptime: '148 วัน 6 ชม.',
    cpu: 'Dedicated ARM Management Chip',
    cpuUsage: 12,
    ram: '1 GB Dedicated RAM',
    ramUsage: 35,
    storage: '16 GB eMMC Flash',
    storageUsage: 28,
    temp: '28°C',
    power: 'Auxiliary Standby Rail (Always-On)',
    os: 'Dell iDRAC9 Enterprise v6.10'
  },
  {
    id: 'proxmox-dell',
    no: 14,
    name: 'Proxmox Server DELL T440',
    type: 'server',
    typeName: 'Hypervisor Server (Node 1)',
    model: 'Dell PowerEdge T440 Tower/Rack Server',
    ip: '10.10.10.251:8006',
    port: '8006',
    protocol: 'https',
    url: 'https://10.10.10.251:8006',
    location: 'Server-Room',
    username: 'root',
    password: 'Ks@042766054$',
    role: 'เครื่องแม่ข่ายจำลองเสมือนหลัก (Proxmox VE Node 1) รันระบบ HOSxP Server, ฐานข้อมูล MySQL/MariaDB และระบบสนับสนุนโรงพยาบาล',
    status: 'online',
    ping: '1.2ms',
    uptime: '148 วัน 6 ชม.',
    cpu: 'Intel Xeon Silver 4210R (10C/20T 2.4GHz)',
    cpuUsage: 22,
    ram: '64 GB ECC Registered DDR4',
    ramUsage: 48,
    storage: '4x 1.2TB SAS 10K RAID-10 (4.8TB)',
    storageUsage: 45,
    temp: '32°C',
    power: 'Dual 750W Hot-plug Redundant PSU (OK)',
    os: 'Proxmox VE 8.1 / Debian 12 Bookworm'
  },
  {
    id: 'fortigate',
    no: 15,
    name: 'Fortigate',
    type: 'firewall',
    typeName: 'Next-Gen Firewall / Security Gateway',
    model: 'Fortinet FortiGate Next-Generation Firewall',
    ip: '147.50.107.210',
    port: '443',
    protocol: 'https',
    url: 'https://147.50.107.210',
    location: 'Server-Room',
    username: 'admin',
    password: 'qwertyuiop',
    role: 'ระบบไฟร์วอลล์รักษาความปลอดภัย ป้องกันการบุกรุก (IPS/IDS), กรองมัลแวร์, SSL-VPN เชื่อมต่อจากภายนอก และเชื่อมต่อเครือข่ายกระทรวงสาธารณสุข',
    status: 'online',
    ping: '1.5ms',
    uptime: '210 วัน 18 ชม.',
    cpu: 'FortiASIC CP9 Content Processor',
    cpuUsage: 28,
    ram: '4 GB System Memory',
    ramUsage: 54,
    storage: '32 GB SSD Storage',
    storageUsage: 41,
    temp: '36°C',
    power: 'Redundant Power Modules (Normal)',
    os: 'FortiOS v7.2.5 Security Fabric'
  },
  {
    id: 'ilo-hpe',
    no: 16,
    name: 'iLO Server HPE',
    type: 'controller',
    typeName: 'IPMI / Out-of-band Controller',
    model: 'HPE Integrated Lights-Out 5 (iLO 5) Advanced',
    ip: '10.10.150.11',
    port: '443',
    protocol: 'https',
    url: 'https://10.10.150.11',
    location: 'Server-Room',
    username: 'Administrator',
    password: 'Q68TBKFB',
    role: 'คอนโทรลเลอร์ฮาร์ดแวร์ควบคุมเซิร์ฟเวอร์ HPE DL360 ระยะไกล ดูแลการจ่ายไฟ, พัดลมระบายความร้อน, อุณหภูมิ และฮาร์ดแวร์ภายใน',
    status: 'online',
    ping: '0.9ms',
    uptime: '162 วัน 14 ชม.',
    cpu: 'HPE Sea of Sensors ASIC',
    cpuUsage: 10,
    ram: '1 GB Dedicated RAM',
    ramUsage: 30,
    storage: '4 GB NAND Flash',
    storageUsage: 22,
    temp: '29°C',
    power: 'Auxiliary Power Supply (Active)',
    os: 'HPE iLO 5 Advanced Firmware v2.80'
  },
  {
    id: 'nas-ksp',
    no: 17,
    name: 'NAS-KSP',
    type: 'storage',
    typeName: 'Hospital Backup Storage Array',
    model: 'Enterprise NAS Storage Array (KSP Data Vault)',
    ip: '10.10.10.240',
    port: '80',
    protocol: 'http',
    url: 'http://10.10.10.240',
    location: 'Server-Room',
    username: 'bhremsak',
    password: 'Ksp@042766054$',
    role: 'ระบบจัดเก็บข้อมูลสำรองส่วนกลางของโรงพยาบาล สำรองฐานข้อมูล HOSxP ประจำวัน, ไฟล์ภาพทางการแพทย์ PACS/X-Ray และเอกสารสแกน',
    status: 'online',
    ping: '1.1ms',
    uptime: '185 วัน 2 ชม.',
    cpu: 'Intel Quad-Core Storage Controller',
    cpuUsage: 16,
    ram: '16 GB DDR4 Memory',
    ramUsage: 44,
    storage: '8x 4TB Enterprise SAS RAID-6 (24TB Usable)',
    storageUsage: 61,
    temp: '33°C',
    power: 'Dual Hot-swap Power Supply (Normal)',
    os: 'Enterprise Storage OS / SMB, NFS, iSCSI'
  },
  {
    id: 'proxmox-hpe',
    no: 18,
    name: 'Proxmox Server HPE DL360',
    type: 'server',
    typeName: 'Hypervisor Server (Node 2)',
    model: 'HPE ProLiant DL360 Gen10 1U Rack Server',
    ip: '10.10.10.250:8006',
    port: '8006',
    protocol: 'https',
    url: 'https://10.10.10.250:8006',
    location: 'Server-Room',
    username: 'root',
    password: 'Ks@042766054$',
    role: 'เครื่องแม่ข่ายจำลองเสมือนโหนด 2 (Proxmox VE Cluster Node 2) ฐานข้อมูลสำรอง Replicate แบบ Real-time, ระบบคิว และ Smart Hospital',
    status: 'online',
    ping: '1.0ms',
    uptime: '162 วัน 14 ชม.',
    cpu: 'Intel Xeon Silver 4214 (12C/24T 2.2GHz)',
    cpuUsage: 18,
    ram: '64 GB ECC Registered DDR4',
    ramUsage: 42,
    storage: '4x 960GB Enterprise SSD RAID-5 (2.8TB)',
    storageUsage: 38,
    temp: '34°C',
    power: 'Dual 500W Flex Slot Platinum PSU (OK)',
    os: 'Proxmox VE 8.1 / Debian 12 Bookworm'
  }
];

/* =========================================================================
 * DATABASE DEADLOCK MONITORING & DIAGNOSTICS REGISTRY (HOSxP / MySQL Deadlocks)
 * =========================================================================
 * เก็บบันทึกข้อมูลสถานะเครื่องลูกข่าย (PC Client) ที่เกิดสภาวะ Deadlock ในฐานข้อมูล
 * รองรับการค้นหาตาม IP Address หรือ รหัสครุภัณฑ์ (PC Code)
 * พร้อมคำสั่ง SQL, Thread ID, Locked Tables และคำแนะนำในการแก้ไข (KILL / Remote)
 */
KSS.DEADLOCKS = {
  '192.168.10.43': {
    ip: '192.168.10.43',
    pcCode: 'PC-OPD-03',
    pcName: 'โต๊ะคอมพิวเตอร์ OPD 3 (จุดคัดกรอง)',
    buildingId: 'opd',
    buildingName: 'อาคารผู้ป่วยนอก (OPD)',
    location: 'โถงคัดกรองผู้ป่วยนอก OPD โต๊ะที่ 3',
    dbServer: '10.10.10.251:3306 (MariaDB Primary Master - DELL T440)',
    database: 'hos',
    table: 'ovst, vn_stat, opdscreen',
    threadId: '84920',
    lockTime: '184 วินาที',
    lockSeconds: 184,
    lockType: 'InnoDB Row Lock Contention (Deadlock Detected)',
    waitingQuery: "UPDATE ovst SET oq_status = '2', cur_dep = '018', last_dep = '011' WHERE vn = '671026084922';",
    blockingIp: '192.168.10.63',
    blockingPc: 'PC-EXAM-03 (ห้องตรวจ 3 - นพ.วิทวัส)',
    blockingQuery: "UPDATE vn_stat SET pttype = 'UCS', inc_dru = inc_dru + 150 WHERE vn = '671026084922';",
    state: 'Waiting for table metadata lock / Row Lock on vn=671026084922',
    timeDetected: '10:14:02 น.',
    status: 'DEADLOCK'
  }
};

// Helper: ทำความสะอาด IP string ให้เหลือเฉพาะ IPv4
KSS.cleanIp = function(ipStr) {
  if (!ipStr) return '';
  const match = String(ipStr).match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  return match ? match[1] : String(ipStr).trim();
};

// Helper: ดึงข้อมูล Deadlock ตาม IP หรือ รหัสเครื่อง
KSS.getDeadlock = function(ipOrCode) {
  if (!ipOrCode) return null;
  const clean = KSS.cleanIp(ipOrCode);
  if (clean && KSS.DEADLOCKS[clean]) {
    return KSS.DEADLOCKS[clean];
  }
  const code = String(ipOrCode).trim().toUpperCase();
  for (const key in KSS.DEADLOCKS) {
    const item = KSS.DEADLOCKS[key];
    if (item && (item.pcCode === code || item.ip === clean)) {
      return item;
    }
  }
  return null;
};

// Helper: ตรวจสอบว่า IP/เครื่องนี้มี Deadlock หรือไม่
KSS.isDeadlocked = function(ipOrCode) {
  return !!KSS.getDeadlock(ipOrCode);
};

// Helper: รายการ Deadlock ที่กำลังเกิดขึ้นทั้งหมด
KSS.getAllDeadlocks = function() {
  return Object.values(KSS.DEADLOCKS || {});
};

// Helper: ลงทะเบียนหรือจำลอง Deadlock ใหม่
KSS.setDeadlock = function(ip, data = {}) {
  const clean = KSS.cleanIp(ip);
  if (!clean) return null;
  const def = {
    ip: clean,
    pcCode: data.pcCode || 'PC-' + clean.split('.').pop(),
    pcName: data.pcName || `คอมพิวเตอร์ (${clean})`,
    buildingId: data.buildingId || 'opd',
    buildingName: data.buildingName || 'อาคารผู้ป่วยนอก (OPD)',
    location: data.location || 'จุดบริการในโรงพยาบาล',
    dbServer: data.dbServer || '10.10.10.251:3306 (MariaDB Primary Master)',
    database: data.database || 'hos',
    table: data.table || 'ovst, vn_stat',
    threadId: data.threadId || String(Math.floor(10000 + Math.random() * 90000)),
    lockTime: data.lockTime || '120 วินาที',
    lockSeconds: data.lockSeconds || 120,
    lockType: data.lockType || 'InnoDB Row Lock (Deadlock Conflict)',
    waitingQuery: data.waitingQuery || `UPDATE ovst SET oq_status = '2' WHERE vn = '6710260${Math.floor(100000 + Math.random() * 900000)}';`,
    blockingIp: data.blockingIp || '192.168.10.63',
    blockingPc: data.blockingPc || 'PC-EXAM-03 (ห้องตรวจ)',
    blockingQuery: data.blockingQuery || `UPDATE vn_stat SET pttype = 'UCS' WHERE vn = '671026084922';`,
    state: data.state || 'Waiting for table metadata lock',
    timeDetected: data.timeDetected || new Date().toLocaleTimeString('th-TH'),
    status: 'DEADLOCK'
  };
  KSS.DEADLOCKS[clean] = { ...def, ...data };
  if (window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('kss-deadlock-change', { detail: { type: 'set', ip: clean } }));
  }
  return KSS.DEADLOCKS[clean];
};

// Helper: เคลียร์/ปลดล็อค Deadlock
KSS.clearDeadlock = function(ipOrCode) {
  const dl = KSS.getDeadlock(ipOrCode);
  if (dl && dl.ip && KSS.DEADLOCKS[dl.ip]) {
    delete KSS.DEADLOCKS[dl.ip];
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('kss-deadlock-change', { detail: { type: 'clear', ip: dl.ip } }));
    }
    return true;
  }
  return false;
};

// Helper: สลับสถานะ Deadlock เพื่อทดสอบ
KSS.toggleDeadlock = function(ipOrCode, customData = {}) {
  const dl = KSS.getDeadlock(ipOrCode);
  if (dl) {
    KSS.clearDeadlock(ipOrCode);
    return false;
  } else {
    KSS.setDeadlock(ipOrCode, customData);
    return true;
  }
};

/* =========================================================================
 * MAC ADDRESS & DYNAMIC IP TRACKING REGISTRY (DHCP Lease / Host Inventory)
 * =========================================================================
 * เก็บบันทึก MAC Address และ Switch Port Mapping ของเครื่องลูกข่าย
 * เมื่อเครื่องเปิดใช้งานใหม่และได้รับ IP ใหม่ ระบบจะอัปเดตข้อมูลตาม MAC Address อัตโนมัติ
 */
KSS.MAC_REGISTRY = {
  '14:B3:1F:28:9A:11': {
    mac: '14:B3:1F:28:9A:11',
    hostname: 'NIRUN-PC',
    pcCode: 'PC-ADM-01',
    name: 'คอมประกันสุขภาพ 1',
    currentIp: '10.10.20.21',
    switchId: 'cisco-sg250',
    switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
    switchIp: '10.10.100.2',
    switchPort: 'Port GE7 (GigabitEthernet 7 / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-ADM-01 (ช่องเต้ารับ LAN ผนังห้องประกันสุขภาพ)',
    vlan: 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 11:14:57',
    status: 'online'
  },
  'D8:5E:D3:4A:2C:9B': {
    mac: 'D8:5E:D3:4A:2C:9B',
    hostname: 'TONOLI-PC',
    pcCode: 'PC-ADM-02',
    name: 'คอมประกันสุขภาพ 2',
    currentIp: '10.10.20.147',
    switchId: 'cisco-sg250',
    switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
    switchIp: '10.10.100.2',
    switchPort: 'Port GE8 (GigabitEthernet 8 / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-ADM-02 (ช่องเต้ารับ LAN ผนังห้องประกันสุขภาพ)',
    vlan: 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 11:14:57',
    status: 'online'
  },
  '2C:F0:5D:8B:4E:33': {
    mac: '2C:F0:5D:8B:4E:33',
    hostname: 'พี่ติ๊ก',
    pcCode: 'PC-ADM-03',
    name: 'คอมประกันสุขภาพ 3',
    currentIp: '10.10.20.111',
    switchId: 'cisco-sg250',
    switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
    switchIp: '10.10.100.2',
    switchPort: 'Port GE9 (GigabitEthernet 9 / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-ADM-03 (ช่องเต้ารับ LAN ผนังห้องประกันสุขภาพ)',
    vlan: 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 11:14:57',
    status: 'online'
  },
  '50:EB:71:A9:3D:44': {
    mac: '50:EB:71:A9:3D:44',
    hostname: 'DESKTOP-HOGODQJ',
    pcCode: 'PC-ADM-04',
    name: 'คอมประกันสุขภาพ 4',
    currentIp: '10.10.20.135',
    switchId: 'cisco-sg250',
    switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
    switchIp: '10.10.100.2',
    switchPort: 'Port GE10 (GigabitEthernet 10 / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-ADM-04 (ช่องเต้ารับ LAN ผนังห้องประกันสุขภาพ)',
    vlan: 'VLAN 20 - ประกันสุขภาพและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 11:14:57',
    status: 'online'
  },

  /* กลุ่มงานจิตเวชและยาเสพติด (Psychiatric & Substance Abuse Department) */
  '70:85:C2:58:1A:3B': {
    mac: '70:85:C2:58:1A:3B',
    hostname: 'CONSULT-PC',
    pcCode: 'PC-PSYCH-01',
    name: 'คอมหัวหน้ากลุ่มงานจิตเวชและยาเสพติด',
    currentIp: '10.10.20.108',
    switchId: 'ksp-sw-psych',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
    switchIp: '10.10.100.12',
    switchPort: 'Port 1 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PSYCH-RM1-01 (เต้ารับ LAN ผนังห้องหัวหน้ากลุ่มงานจิตเวชฯ)',
    vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 11:58:12',
    status: 'online'
  },
  'A4:BB:6D:3C:99:1F': {
    mac: 'A4:BB:6D:3C:99:1F',
    hostname: 'CSPC-PAN',
    pcCode: 'PC-PSYCH-02',
    name: 'คอมพยาบาลจิตเวช 1',
    currentIp: '10.10.20.27',
    switchId: 'ksp-sw-psych',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
    switchIp: '10.10.100.12',
    switchPort: 'Port 2 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PSYCH-RM2-01 (เต้ารับ LAN ผนังห้องทำงานกลุ่มงานจิตเวชฯ)',
    vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 11:58:12',
    status: 'online'
  },
  'BC:24:11:8E:72:4D': {
    mac: 'BC:24:11:8E:72:4D',
    hostname: 'DESKTOP-2JC9KOA',
    pcCode: 'PC-PSYCH-03',
    name: 'คอมงานบำบัดยาเสพติด 2',
    currentIp: '10.10.20.126',
    switchId: 'ksp-sw-psych',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
    switchIp: '10.10.100.12',
    switchPort: 'Port 3 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PSYCH-RM2-02 (เต้ารับ LAN ผนังห้องทำงานกลุ่มงานจิตเวชฯ)',
    vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 11:58:12',
    status: 'online'
  },

  /* แผนกห้องคลอดและสูติกรรม ตึกร่มโพธิ์ 3 ชั้น 1 (Labor & Delivery Room) */
  '3C:52:82:7D:6E:19': {
    mac: '3C:52:82:7D:6E:19',
    hostname: 'LR-PC',
    pcCode: 'PC-ROM-01',
    name: 'โต๊ะคอมห้องคลอด 1',
    currentIp: '10.10.40.30',
    switchId: 'ksp-sw-rompho1',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-ROMPHO1 - ห้องพักแพทย์)',
    switchIp: '10.10.100.14',
    switchPort: 'Port 1 (10/100/1000Base-T / VLAN 40 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: ROM1-LR-01 (เต้ารับ LAN ผนังเคาน์เตอร์สูติกรรมห้องคลอด)',
    vlan: 'VLAN 40 - แผนกผู้ป่วยใน สูติกรรม และห้องคลอด (LR)',
    gateway: '10.10.40.1 (IPD & Maternity Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 12:30:00',
    status: 'online'
  },

  /* งานแพทย์แผนไทยและการแพทย์ทางเลือก (Thai Traditional Medicine) */
  '44:8A:5B:91:D2:13': {
    mac: '44:8A:5B:91:D2:13',
    hostname: 'PAN21',
    pcCode: 'PC-THAI-01',
    name: 'โต๊ะคอมแพทย์แผนไทย 1',
    currentIp: '10.10.20.13',
    switchId: 'cisco-sg250',
    switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
    switchIp: '10.10.100.2',
    switchPort: 'Port GE11 (GigabitEthernet 11 / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: THAI-MED-01 (เต้ารับ LAN ผนังห้องทำงานแพทย์แผนไทย)',
    vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 13:28:45',
    status: 'online'
  },

  /* งานการเงินและบัญชี (Finance & Accounting) */
  '48:21:0B:4D:9E:51': {
    mac: '48:21:0B:4D:9E:51',
    hostname: 'MONEY',
    pcCode: 'PC-FIN-01',
    name: 'โต๊ะคอมการเงิน',
    currentIp: '10.10.20.156',
    switchId: 'cisco-sg250',
    switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
    switchIp: '10.10.100.2',
    switchPort: 'Port GE12 (GigabitEthernet 12 / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: FIN-01 (ช่องเต้ารับ LAN เคาน์เตอร์การเงิน)',
    vlan: 'VLAN 20 - งานการเงิน บัญชี และสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 13:48:00',
    status: 'online'
  },

  /* แผนกผู้ป่วยนอก ห้องตรวจโรค (OPD Doctor Examination Rooms) */
  'D4:5D:64:8B:11:01': {
    mac: 'D4:5D:64:8B:11:01',
    hostname: 'CASKCAP',
    pcCode: 'PC-EXAM-01',
    name: 'คอมห้องตรวจ 1',
    currentIp: '10.10.30.43',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 1 (10/100/1000Base-T / VLAN 30 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-EXAM-01 (เต้ารับ LAN ผนังห้องตรวจโรค 1)',
    vlan: 'VLAN 30 - ห้องตรวจแพทย์และบริการผู้ป่วยนอก (OPD)',
    gateway: '10.10.30.1 (OPD Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 13:48:00',
    status: 'online'
  },
  'D4:5D:64:8B:11:03': {
    mac: 'D4:5D:64:8B:11:03',
    hostname: 'DOCTOR-OPD3',
    pcCode: 'PC-EXAM-03',
    name: 'คอมห้องตรวจ 3',
    currentIp: '10.10.30.40',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 3 (10/100/1000Base-T / VLAN 30 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-EXAM-03 (เต้ารับ LAN ผนังห้องตรวจโรค 3)',
    vlan: 'VLAN 30 - ห้องตรวจแพทย์และบริการผู้ป่วยนอก (OPD)',
    gateway: '10.10.30.1 (OPD Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 13:48:00',
    status: 'online'
  },
  'D4:5D:64:8B:11:04': {
    mac: 'D4:5D:64:8B:11:04',
    hostname: 'DOCTOR4',
    pcCode: 'PC-EXAM-04',
    name: 'คอมห้องตรวจ 4',
    currentIp: '10.10.30.38',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 4 (10/100/1000Base-T / VLAN 30 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-EXAM-04 (เต้ารับ LAN ผนังห้องตรวจโรค 4)',
    vlan: 'VLAN 30 - ห้องตรวจแพทย์และบริการผู้ป่วยนอก (OPD)',
    gateway: '10.10.30.1 (OPD Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 13:48:00',
    status: 'online'
  },
  'D4:5D:64:8B:11:05': {
    mac: 'D4:5D:64:8B:11:05',
    hostname: 'DOCTOR5',
    pcCode: 'PC-EXAM-05',
    name: 'คอมห้องตรวจ 5',
    currentIp: '10.10.30.39',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 5 (10/100/1000Base-T / VLAN 30 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-EXAM-05 (เต้ารับ LAN ผนังห้องตรวจโรค 5)',
    vlan: 'VLAN 30 - ห้องตรวจแพทย์และบริการผู้ป่วยนอก (OPD)',
    gateway: '10.10.30.1 (OPD Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 13:48:00',
    status: 'online'
  },

  /* ตึกร่มโพธิ์ 3 ชั้น 3 หอผู้ป่วยพิเศษ (VIP Inpatient Ward) */
  '3C:52:82:7D:6E:24': {
    mac: '3C:52:82:7D:6E:24',
    hostname: 'ROMPHO3',
    pcCode: 'PC-VIP-01',
    name: 'เค้าเตอร์โต๊ะคอมห้องพิเศษ',
    currentIp: '10.10.40.24',
    switchId: 'ksp-sw-rompho1',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-ROMPHO1 - ตึกร่มโพธิ์)',
    switchIp: '10.10.100.14',
    switchPort: 'Port 3 (10/100/1000Base-T / VLAN 40 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: ROMPHO-FL3-NURSE-01 (เต้ารับ LAN เค้าเตอร์พยาบาลห้องพิเศษ ชั้น 3)',
    vlan: 'VLAN 40 - แผนกผู้ป่วยใน สูติกรรม และหอผู้ป่วยพิเศษ (VIP Ward)',
    gateway: '10.10.40.1 (IPD Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 13:48:00',
    status: 'online'
  },

  /* กลุ่มงานการพยาบาล (Nursing Department - OPD & ER) */
  'B4:2E:99:A1:7B:63': {
    mac: 'B4:2E:99:A1:7B:63',
    hostname: 'KIANG',
    pcCode: 'PC-NURSE-01',
    name: 'คอมพยาบาล 1',
    currentIp: '10.10.20.163',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 21 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-NS-01 (เต้ารับ LAN ห้องกลุ่มงานการพยาบาล โต๊ะ 1)',
    vlan: 'VLAN 20 - งานการพยาบาลและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:22:00',
    status: 'online'
  },
  'B4:2E:99:A1:7B:59': {
    mac: 'B4:2E:99:A1:7B:59',
    hostname: 'เหมียว',
    pcCode: 'PC-NURSE-03',
    name: 'คอมพยาบาล 3',
    currentIp: '10.10.20.159',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 23 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-NS-03 (เต้ารับ LAN ห้องกลุ่มงานการพยาบาล โต๊ะ 3)',
    vlan: 'VLAN 20 - งานการพยาบาลและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:22:00',
    status: 'online'
  },

  /* จุดบริการซักประวัติ คัดกรอง และวัดความดัน (OPD Screening & Triage) */
  '90:1B:0E:3C:44:29': {
    mac: '90:1B:0E:3C:44:29',
    hostname: 'OPD4-PC',
    pcCode: 'PC-OPD-04',
    name: 'คอม OPD 4',
    currentIp: '10.10.20.129',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 14 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-NURSE-04 (เต้ารับ LAN โต๊ะซักประวัติหน้าห้องตรวจ 4)',
    vlan: 'VLAN 20 - งานการพยาบาลและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:22:00',
    status: 'online'
  },
  '90:1B:0E:3C:44:76': {
    mac: '90:1B:0E:3C:44:76',
    hostname: 'OPD-BP',
    pcCode: 'PC-OPD-08',
    name: 'คอม OPD 8',
    currentIp: '10.10.20.76',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ตึกผู้ป่วยนอก)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 18 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: OPD-BP-02 (เต้ารับ LAN จุดวัดความดันและคัดกรอง 2)',
    vlan: 'VLAN 20 - งานการพยาบาลและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:22:00',
    status: 'online'
  },

  /* กลุ่มงานเภสัชกรรม (Pharmacy - บริการจ่ายยาผู้ป่วยนอก) */
  '00:2B:67:8A:11:25': {
    mac: '00:2B:67:8A:11:25',
    hostname: 'DRUG001-PC',
    pcCode: 'PC-PHAR-01',
    name: 'โต๊ะคอมจ่ายยา 1 (เคาน์เตอร์ช่อง 1)',
    currentIp: '10.10.20.25',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ห้องยา)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 11 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PHAR-DISP-01 (เต้ารับ LAN เคาน์เตอร์จ่ายยาช่อง 1)',
    vlan: 'VLAN 20 - งานบริการเภสัชกรรมและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:22:00',
    status: 'online'
  },
  '00:2B:67:8A:11:05': {
    mac: '00:2B:67:8A:11:05',
    hostname: 'DRUG004-PC',
    pcCode: 'PC-PHAR-02',
    name: 'โต๊ะคอมจ่ายยา 2 (เคาน์เตอร์ช่อง 2)',
    currentIp: '10.10.20.105',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ห้องยา)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 12 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PHAR-DISP-02 (เต้ารับ LAN เคาน์เตอร์จ่ายยาช่อง 2)',
    vlan: 'VLAN 20 - งานบริการเภสัชกรรมและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:22:00',
    status: 'online'
  },
  '00:2B:67:8A:11:40': {
    mac: '00:2B:67:8A:11:40',
    hostname: 'DRUGNEW-PC',
    pcCode: 'PC-PHAR-05',
    name: 'โต๊ะคอมจ่ายยา 5',
    currentIp: '10.10.20.140',
    switchId: 'ksp-sw-opd',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-OPD - ห้องยา)',
    switchIp: '10.10.100.6',
    switchPort: 'Port 15 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PHAR-DISP-05 (เต้ารับ LAN โต๊ะตรวจสอบและจ่ายยาช่อง 5)',
    vlan: 'VLAN 20 - งานบริการเภสัชกรรมและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:22:00',
    status: 'online'
  },

  /* กลุ่มงานบริการปฐมภูมิและสร้างเสริมสุขภาพ (PCU - Primary Care Unit) */
  '54:BF:64:1C:28:02': {
    mac: '54:BF:64:1C:28:02',
    hostname: 'PCU-02-PC',
    pcCode: 'PC-PCU-03',
    name: 'โต๊ะคอมพิวเตอร์โถง PCU (จุดที่ 1)',
    currentIp: '10.10.40.28',
    switchId: 'ksp-sw-pcu',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
    switchIp: '10.10.100.9',
    switchPort: 'Port 2 (10/100/1000Base-T / VLAN 40 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PCU-HALL-01 (เต้ารับ LAN โถง PCU จุดที่ 1)',
    vlan: 'VLAN 40 - บริการสุขภาพปฐมภูมิ (PCU)',
    gateway: '10.10.40.1 (IPD & PCU Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:50:00',
    status: 'online'
  },
  '54:BF:64:1C:35:C4': {
    mac: '54:BF:64:1C:35:C4',
    hostname: 'DESKTOP-U2S7HC4',
    pcCode: 'PC-PCU-04',
    name: 'โต๊ะคอมพิวเตอร์โถง PCU (จุดที่ 2)',
    currentIp: '10.10.40.35',
    switchId: 'ksp-sw-pcu',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
    switchIp: '10.10.100.9',
    switchPort: 'Port 3 (10/100/1000Base-T / VLAN 40 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PCU-HALL-02 (เต้ารับ LAN โถง PCU จุดที่ 2)',
    vlan: 'VLAN 40 - บริการสุขภาพปฐมภูมิ (PCU)',
    gateway: '10.10.40.1 (IPD & PCU Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:50:00',
    status: 'online'
  },
  '54:BF:64:1C:29:07': {
    mac: '54:BF:64:1C:29:07',
    hostname: 'PCU07-PC',
    pcCode: 'PC-PCU-05',
    name: 'โต๊ะคอมพิวเตอร์ลงทะเบียน PCU (จุดที่ 3)',
    currentIp: '10.10.40.29',
    switchId: 'ksp-sw-pcu',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
    switchIp: '10.10.100.9',
    switchPort: 'Port 4 (10/100/1000Base-T / VLAN 40 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PCU-REG-03 (เต้ารับ LAN โต๊ะลงทะเบียน PCU จุดที่ 3)',
    vlan: 'VLAN 40 - บริการสุขภาพปฐมภูมิ (PCU)',
    gateway: '10.10.40.1 (IPD & PCU Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:50:00',
    status: 'online'
  },
  '54:BF:64:1C:27:06': {
    mac: '54:BF:64:1C:27:06',
    hostname: 'PCU6',
    pcCode: 'PC-PCU-06',
    name: 'โต๊ะคอมพิวเตอร์ประสานงาน PCU',
    currentIp: '10.10.40.27',
    switchId: 'ksp-sw-pcu',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PCU - ตึก PCU)',
    switchIp: '10.10.100.9',
    switchPort: 'Port 5 (10/100/1000Base-T / VLAN 40 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: PCU-COORD-01 (เต้ารับ LAN โต๊ะประสานงาน PCU)',
    vlan: 'VLAN 40 - บริการสุขภาพปฐมภูมิ (PCU)',
    gateway: '10.10.40.1 (IPD & PCU Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 14:50:00',
    status: 'online'
  },

  /* เคาน์เตอร์ลงทะเบียนและจุดบริการตนเอง (Front Registration Counter & Self-Service Kiosk) */
  '70:85:C2:44:A2:42': {
    mac: '70:85:C2:44:A2:42',
    hostname: 'ALL-IN-ONE-ADMI',
    pcCode: 'PC-CARD-03',
    name: 'โต๊ะคอมพิวเตอร์ 2 (เคาน์เตอร์ลงทะเบียนห้องบัตร)',
    currentIp: '10.10.20.42',
    switchId: 'ksp-sw-xray',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-XRAY - ตึก X-Ray/ห้องบัตร)',
    switchIp: '10.10.100.7',
    switchPort: 'Port 8 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: CARD-CTR-02 (เคาน์เตอร์ลงทะเบียนห้องบัตร ช่อง 2)',
    vlan: 'VLAN 20 - งานเวชระเบียนและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 15:38:00',
    status: 'online'
  },
  '00:E0:4C:88:A1:01': {
    mac: '00:E0:4C:88:A1:01',
    hostname: 'KIOSK-CARD-01',
    pcCode: 'KIOSK-REG-01',
    name: 'ตู้ Kiosk ออกบัตรคิวและลงทะเบียนอัตโนมัติ (Smart Queue Kiosk)',
    currentIp: '10.10.20.199',
    switchId: 'ksp-sw-xray',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-XRAY - ตึก X-Ray/ห้องบัตร)',
    switchIp: '10.10.100.7',
    switchPort: 'Port 9 (10/100/1000Base-T / VLAN 20 Untagged)',
    portSpeed: '1000 Mbps Full Duplex',
    wallOutlet: 'Outlet ID: KIOSK-FRONT-01 (เต้ารับ LAN เสาหน้าเคาน์เตอร์ลงทะเบียน)',
    vlan: 'VLAN 20 - งานเวชระเบียนและสารสนเทศยุทธศาสตร์',
    gateway: '10.10.20.1 (Core Gateway)',
    subnet: '255.255.255.0',
    leaseType: 'DHCP Reservation / Dynamic MAC Tracking',
    lastRenew: '26/10/2026 15:38:00',
    status: 'online'
  }
};

/* Specifications Registry สำหรับคอมพิวเตอร์ตึกแพทย์แผนไทย */
KSS.THAIMED_SPECS = {
  '44:8A:5B:91:D2:13': {
    code: 'PC-THAI-01',
    name: 'โต๊ะคอมแพทย์แผนไทย 1',
    hostname: 'PAN21',
    ip: '10.10.20.13',
    mac: '44:8A:5B:91:D2:13',
    switchId: 'cisco-sg250',
    switchName: 'Cisco SG250-26 (Core Managed Switch - Computer Room)',
    switchPort: 'Port GE11 (VLAN 20)',
    wallOutlet: 'THAI-MED-01 (เต้ารับ LAN ผนังห้องทำงานแพทย์แผนไทย)',
    vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
    role: 'ตรวจวินิจฉัยธาตุเจ้าเรือน แมะจับชีพจร บันทึกเวชระเบียน และสั่งการรักษาทางหัตถการ',
    user: 'นางสาวรัตติยากร สมอดง (แพทย์แผนไทย)',
    os: 'Windows 11 Pro 64-bit',
    cpu: 'Intel Core i5-12400 (6C/12T @ 4.4GHz)',
    ram: '16 GB DDR4 3200MHz',
    storage: 'SSD NVMe 512 GB',
    monitor: '24" FHD IPS Display',
    software: 'ระบบแพทย์แผนไทย HOSxP Traditional Thai Medicine, บันทึกเวชระเบียนธาตุเจ้าเรือน, ระบบคลังยาสมุนไพร, e-Prescription',
    peripherals: 'เครื่องอ่าน Smart Card, เครื่องพิมพ์ใบสั่งยาสมุนไพร, เครื่องสแกนบาร์โค้ด, เครื่องสำรองไฟ UPS 1000VA',
    status: '🟢 ออนไลน์ปกติ'
  }
};

/* Specifications Registry สำหรับคอมพิวเตอร์ตึกร่มโพธิ์ 3 (ห้องคลอด, ไตเทียม, VIP) */
KSS.ROMPHO_SPECS = {
  '3C:52:82:7D:6E:19': {
    code: 'PC-ROM-01',
    name: 'โต๊ะคอมห้องคลอด 1',
    hostname: 'LR-PC',
    ip: '10.10.40.30',
    mac: '3C:52:82:7D:6E:19',
    switchId: 'ksp-sw-rompho1',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-ROMPHO1 - ห้องพักแพทย์)',
    switchPort: 'Port 1 (VLAN 40)',
    wallOutlet: 'ROM1-LR-01 (เต้ารับ LAN ผนังเคาน์เตอร์สูติกรรมห้องคลอด)',
    vlan: 'VLAN 40 - แผนกผู้ป่วยใน สูติกรรม และห้องคลอด (LR)',
    role: 'เครื่องบันทึกข้อมูลการคลอด ทะเบียนทารกแรกเกิด และระบบเวชระเบียนสูติ-นรีเวชกรรม',
    user: 'พยาบาลวิชาชีพประจำห้องคลอด',
    os: 'Windows 11 Pro 64-bit',
    cpu: 'Intel Core i5-12400 (6 Cores / 12 Threads, up to 4.40 GHz)',
    ram: '16 GB DDR4 3200MHz',
    storage: '512 GB M.2 NVMe PCIe SSD (High Speed)',
    monitor: 'Dell 24" Full HD IPS (Anti-Glare, ComfortView Plus)',
    software: 'HOSxP / HIS Delivery & Maternity Module, ระบบสูติบัตรและแจ้งเกิดออนไลน์ (e-Birth), EHR, Neonatal Monitor Link',
    peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, เครื่องพิมพ์สูติบัตร, UPS 1000VA',
    status: '🟢 ออนไลน์ปกติ'
  }
};

/* Specifications Registry สำหรับคอมพิวเตอร์กลุ่มงานจิตเวชและยาเสพติด */
KSS.PSYCH_SPECS = {
  '70:85:C2:58:1A:3B': {
    code: 'PC-PSYCH-01',
    name: 'คอมหัวหน้ากลุ่มงานจิตเวชและยาเสพติด',
    hostname: 'CONSULT-PC',
    ip: '10.10.20.108',
    mac: '70:85:C2:58:1A:3B',
    switchId: 'ksp-sw-psych',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
    switchPort: 'Port 1 (VLAN 20)',
    wallOutlet: 'PSYCH-RM1-01 (ห้องหัวหน้ากลุ่มงานจิตเวชฯ)',
    vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
    role: 'บริหารจัดการคลินิกสุขภาพจิต กำกับการบำบัดรักษา และระบบงานยาเสพติด',
    user: 'หัวหน้ากลุ่มงานจิตเวชและยาเสพติด',
    os: 'Windows 11 Pro 64-bit',
    cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
    ram: '16 GB DDR4-3200',
    storage: '512 GB M.2 NVMe SSD',
    monitor: '23.8" IPS Full HD (1920x1080)',
    software: 'HOSxP v3.6, Psychiatric SMI-V, Matrix Program, MOPH Claim',
    peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, UPS 850VA',
    status: '🟢 ออนไลน์ปกติ'
  },
  'A4:BB:6D:3C:99:1F': {
    code: 'PC-PSYCH-02',
    name: 'คอมพยาบาลจิตเวช 1',
    hostname: 'CSPC-PAN',
    ip: '10.10.20.27',
    mac: 'A4:BB:6D:3C:99:1F',
    switchId: 'ksp-sw-psych',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
    switchPort: 'Port 2 (VLAN 20)',
    wallOutlet: 'PSYCH-RM2-01 (ห้องทำงานกลุ่มงานจิตเวชฯ)',
    vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
    role: 'งานซักประวัติ ประเมินสุขภาพจิต คัดกรองภาวะวิกฤต และติดตามผู้ป่วยจิตเวช SMI-V',
    user: 'พยาบาลวิชาชีพจิตเวช (คุณปาน)',
    os: 'Windows 11 Pro 64-bit',
    cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
    ram: '16 GB DDR4-3200',
    storage: '512 GB M.2 NVMe SSD',
    monitor: '23.8" IPS Full HD (1920x1080)',
    software: 'HOSxP v3.6, แบบคัดกรอง 2Q/9Q/8Q, Smart Card Agent',
    peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, UPS 850VA',
    status: '🟢 ออนไลน์ปกติ'
  },
  'BC:24:11:8E:72:4D': {
    code: 'PC-PSYCH-03',
    name: 'คอมงานบำบัดยาเสพติด 2',
    hostname: 'DESKTOP-2JC9KOA',
    ip: '10.10.20.126',
    mac: 'BC:24:11:8E:72:4D',
    switchId: 'ksp-sw-psych',
    switchName: 'Aruba / HPE 2530 24G (KSP-SW-PSYCH - ห้องที่ 3)',
    switchPort: 'Port 3 (VLAN 20)',
    wallOutlet: 'PSYCH-RM2-02 (ห้องทำงานกลุ่มงานจิตเวชฯ)',
    vlan: 'VLAN 20 - บริการคลินิกเฉพาะทางและสุขภาพจิต',
    role: 'งานฟื้นฟูสมรรถภาพผู้ติดยาเสพติด ระบบ Matrix Program และคัดกรอง B-Fast',
    user: 'นักจิตวิทยา / นักวิชาการสาธารณสุข',
    os: 'Windows 11 Pro 64-bit',
    cpu: 'Intel Core i5-12400 (6C/12T, 4.4GHz)',
    ram: '16 GB DDR4-3200',
    storage: '512 GB M.2 NVMe SSD',
    monitor: '23.8" IPS Full HD (1920x1080)',
    software: 'HOSxP v3.6, Matrix Program บำบัดยาเสพติด, B-Fast System',
    peripherals: 'เครื่องอ่านบัตรสมาร์ทการ์ด, Barcode Scanner, UPS 850VA',
    status: '🟢 ออนไลน์ปกติ'
  }
};

KSS.getPcByMac = function(mac) {
  if (!mac) return null;
  const cleanMac = String(mac).trim().toUpperCase();
  return KSS.MAC_REGISTRY[cleanMac] || null;
};

KSS.getPcByIp = function(ip) {
  if (!ip) return null;
  const clean = KSS.cleanIp(ip);
  if (!clean) return null;
  for (const mac in KSS.MAC_REGISTRY) {
    const item = KSS.MAC_REGISTRY[mac];
    if (item.currentIp === clean || item.ip === clean) {
      return item;
    }
  }
  return null;
};

KSS.getPcByHostname = function(hostname) {
  if (!hostname) return null;
  const clean = String(hostname).trim().toUpperCase();
  for (const mac in KSS.MAC_REGISTRY) {
    const item = KSS.MAC_REGISTRY[mac];
    if (item.hostname && item.hostname.toUpperCase() === clean) {
      return item;
    }
  }
  return null;
};

KSS.updatePcIpByMac = function(mac, newIp) {
  if (!mac || !newIp) return false;
  const cleanMac = String(mac).trim().toUpperCase();
  const cleanIp = KSS.cleanIp(newIp);
  if (!cleanIp) return false;

  let record = KSS.MAC_REGISTRY[cleanMac];
  if (!record) {
    record = {
      mac: cleanMac,
      hostname: 'PC-' + cleanIp.replace(/\./g, '-'),
      currentIp: cleanIp,
      leaseType: 'Dynamic DHCP',
      lastRenew: new Date().toLocaleTimeString('th-TH')
    };
    KSS.MAC_REGISTRY[cleanMac] = record;
  } else {
    record.currentIp = cleanIp;
    record.lastRenew = new Date().toLocaleTimeString('th-TH');
  }

  // Update live specs if registered
  if (KSS.INSURANCE_SPECS && KSS.INSURANCE_SPECS[cleanMac]) {
    KSS.INSURANCE_SPECS[cleanMac].ip = cleanIp;
  }
  if (KSS.PSYCH_SPECS && KSS.PSYCH_SPECS[cleanMac]) {
    KSS.PSYCH_SPECS[cleanMac].ip = cleanIp;
  }
  if (KSS.ROMPHO_SPECS && KSS.ROMPHO_SPECS[cleanMac]) {
    KSS.ROMPHO_SPECS[cleanMac].ip = cleanIp;
  }
  if (KSS.THAIMED_SPECS && KSS.THAIMED_SPECS[cleanMac]) {
    KSS.THAIMED_SPECS[cleanMac].ip = cleanIp;
  }
  if (KSS.TONOLI_PC_SPEC && (KSS.TONOLI_PC_SPEC.mac === cleanMac || cleanMac === 'D8:5E:D3:4A:2C:9B')) {
    KSS.TONOLI_PC_SPEC.ip = cleanIp;
  }

  if (window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('kss-mac-ip-updated', {
      detail: { mac: cleanMac, ip: cleanIp, record }
    }));
  }
  return true;
};


