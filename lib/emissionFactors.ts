// lib/emissionFactors.ts

// ตัวคูณการปล่อยก๊าซเรือกระจก (kgCO2e ต่อหน่วย)
export const EMISSION_FACTORS = {
  // Scope 2: ไฟฟ้า (หน่วย: kWh)
  electricity: 0.4154, 
  
  // Scope 1: เชื้อเพลิง (หน่วย: ลิตร)
  diesel: 2.73,       // ดีเซล
  benzene: 2.20,      // เบนซิน
  lpg: 1.51,          // ก๊าซหุงต้ม (LPG)
  
  // Scope 3: ขยะ (หน่วย: กิโลกรัม)
  generalWaste: 0.5,
};