// lib/emissionFactors.ts

// ตัวคูณการปล่อยก๊าซเรือกระจก (kgCO2e ต่อหน่วย) - อ้างอิงค่าเฉลี่ย TGO และ IPCC
export const EMISSION_FACTORS = {
  // Scope 2: พลังงาน
  electricity: 0.4154, // หน่วย: kWh
  water: 0.342,        // หน่วย: ลูกบาศก์เมตร (m3)
  
  // Scope 1: เชื้อเพลิง (หน่วย: ลิตร)
  lpg: 1.51,
  diesel: 2.73,
  gasoline: 2.20,
  
  // Scope 3: ของเสีย (หน่วย: กิโลกรัม)
  generalWaste: 0.5,
  hazardousWaste: 2.0, // ของเสียอันตราย
  
  // Scope 3: อื่นๆ
  rawMaterial: 1.5,    // วัตถุดิบ (ค่าเฉลี่ยต่อกิโลกรัม)
  transport: 0.1,      // การขนส่ง (ค่าเฉลี่ยต่อกิโลเมตร)
};