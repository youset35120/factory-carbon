// lib/i18n.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'th' | 'en';

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Lang, Record<string, string>> = {
  th: {
    welcome: "ยินดีต้อนรับ",
    view_dashboard: "ดูกราฟสรุปผล",
    logout: "ออกจากระบบ",
    admin_dashboard: "Admin Dashboard (ภาพรวมระบบ)",
    calculator_title: "Carbon Footprint & Tax Calculator",
    factory_name: "ชื่อโรงงาน (Factory Name)",
    report_month: "เดือนที่รายงาน (Month)",
    scope2: "Scope 2: พลังงาน (Energy)",
    scope1: "Scope 1: เชื้อเพลิง (Fuels)",
    scope3: "Scope 3: ของเสียและอื่นๆ (Waste & Others)",
    electricity: "ค่าไฟฟ้า (Electricity)",
    water: "ค่าน้ำประปา (Water)",
    lpg: "ก๊าซหุงต้ม (LPG)",
    diesel: "ดีเซล (Diesel)",
    gasoline: "เบนซิน (Gasoline)",
    general_waste: "ขยะทั่วไป (General Waste)",
    hazardous_waste: "ของเสียอันตราย (Hazardous Waste)",
    raw_material: "วัตถุดิบ (Raw Material)",
    transport: "การขนส่ง (Transportation)",
    calculate_save: "คำนวณและบันทึกข้อมูล",
    monthly_result: "ผลการคำนวณและภาษีคาร์บอน (รายเดือน)",
    total_ghg: "ปริมาณก๊าซเรือกระจกรวม",
    carbon_tax_est: "ประมาณการภาษีคาร์บอนที่ต้องจ่าย",
    download_monthly: "ดาวน์โหลดรายงานรายเดือน (PDF)",
    download_annual: "ดาวน์โหลดรายงานปี (Annual PDF)",
    history: "ประวัติการบันทึก",
    all_factories: "ข้อมูลรวมทุกโรงงาน (รอตรวจสอบ)",
    export_csv: "Export to CSV",
    status: "สถานะ",
    pending: "รอตรวจสอบ",
    approved: "อนุมัติแล้ว",
    rejected: "ตีกลับ",
    approve_btn: "อนุมัติ",
    reject_btn: "ตีกลับ",
    delete_btn: "ลบ",
    target_title: "🎯 เป้าหมายการลดก๊าซเรือกระจกรายเดือน (Monthly Target)",
    save_target: "บันทึกเป้าหมาย",
    edit: "แก้ไข",
    save: "บันทึก",
    cancel: "ยกเลิก",
    login: "เข้าสู่ระบบ (Login)",
    register: "สมัครสมาชิก (Register)",
    email: "อีเมล (Email)",
    password: "รหัสผ่าน (Password)",
    no_account: "ยังไม่มีบัญชีใช่ไหม? ",
    have_account: "มีบัญชีอยู่แล้ว? ",
    register_here: "สมัครสมาชิกที่นี่",
    login_here: "เข้าสู่ระบบที่นี่",
  },
  en: {
    welcome: "Welcome",
    view_dashboard: "View Dashboard",
    logout: "Logout",
    admin_dashboard: "Admin Dashboard (System Overview)",
    calculator_title: "Carbon Footprint & Tax Calculator",
    factory_name: "Factory Name",
    report_month: "Reporting Month",
    scope2: "Scope 2: Energy",
    scope1: "Scope 1: Fuels",
    scope3: "Scope 3: Waste & Others",
    electricity: "Electricity",
    water: "Water",
    lpg: "LPG",
    diesel: "Diesel",
    gasoline: "Gasoline",
    general_waste: "General Waste",
    hazardous_waste: "Hazardous Waste",
    raw_material: "Raw Material",
    transport: "Transportation",
    calculate_save: "Calculate & Save Data",
    monthly_result: "Calculation & Carbon Tax Result (Monthly)",
    total_ghg: "Total GHG Emissions",
    carbon_tax_est: "Estimated Carbon Tax to Pay",
    download_monthly: "Download Monthly Report (PDF)",
    download_annual: "Download Annual Report (PDF)",
    history: "Report History",
    all_factories: "All Factories Data (Pending Review)",
    export_csv: "Export to CSV",
    status: "Status",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    approve_btn: "Approve",
    reject_btn: "Reject",
    delete_btn: "Delete",
    target_title: "🎯 Monthly GHG Reduction Target",
    save_target: "Save Target",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    no_account: "Don't have an account? ",
    have_account: "Already have an account? ",
    register_here: "Register here",
    login_here: "Login here",
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('th');
  const t = (key: string) => translations[lang][key] || key;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}