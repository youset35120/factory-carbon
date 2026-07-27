// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [factoryName, setFactoryName] = useState("");
  const [reports, setReports] = useState<any[]>([]);

  const [formData, setFormData] = useState<Record<string, string | number>>({
    factoryName: "",
    month: "",
    electricity: 0,
    water: 0,
    lpg: 0,
    diesel: 0,
    gasoline: 0,
    generalWaste: 0,
    hazardousWaste: 0,
    rawMaterial: 0,
    transport: 0,
  });

  const [result, setResult] = useState<{ total: number; scope1: number; scope2: number; scope3: number } | null>(null);

  // ตรวจสอบสถานะ Login และดึงข้อมูลมาแสดง
  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/auth/me"); // เราจะสร้าง API นี้ในขั้นตอนถัดไป
      if (res.ok) {
        const data = await res.json();
        setFactoryName(data.factoryName);
        setFormData((prev) => ({ ...prev, factoryName: data.factoryName }));
      } else {
        router.push("/login"); // ไม่ได้ Login ให้ไปหน้า Login
      }

      const reportRes = await fetch("/api/reports");
      if (reportRes.ok) {
        setReports(await reportRes.json());
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumberField = ["electricity", "water", "lpg", "diesel", "gasoline", "generalWaste", "hazardousWaste", "rawMaterial", "transport"].includes(name);
    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { calculateCarbonFootprint } = await import("@/lib/reportGenerator");
    const calculation = calculateCarbonFootprint(formData as any);
    setResult(calculation);

    // บันทึกลง Database
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, totalCO2: calculation.total }),
    });

    // อัปเดตประวัติ
    const reportRes = await fetch("/api/reports");
    if (reportRes.ok) setReports(await reportRes.json());
  };

  const handleDownloadReport = async () => {
    const { calculateCarbonFootprint, generatePDFReport } = await import("@/lib/reportGenerator");
    const calculation = calculateCarbonFootprint(formData as any);
    generatePDFReport(formData as any, calculation);
  };

  const renderInput = (name: string, label: string, unit: string, placeholder: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          name={name}
          value={(formData[name] as number) || ""}
          onChange={handleChange}
          required
          min="0"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black pr-12"
          placeholder={placeholder}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  if (!factoryName) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* แถบบนสุด */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Carbon Footprint Calculator</h1>
            <p className="text-gray-500 text-sm">ยินดีต้อนรับ, <span className="font-semibold">{factoryName}</span></p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
            ออกจากระบบ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโรงงาน (Factory Name)</label>
              <input type="text" name="factoryName" value={formData.factoryName as string} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-gray-100" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เดือนที่รายงาน (Month)</label>
              <input type="month" name="month" value={formData.month as string} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-blue-700 mb-4 border-b pb-2">Scope 2: พลังงาน (Energy)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput("electricity", "ค่าไฟฟ้า (Electricity)", "kWh", "เช่น 15000")}
              {renderInput("water", "ค่าน้ำประปา (Water)", "m³", "เช่น 500")}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-orange-700 mb-4 border-b pb-2">Scope 1: เชื้อเพลิง (Fuels)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderInput("lpg", "ก๊าซหุงต้ม (LPG)", "L", "เช่น 100")}
              {renderInput("diesel", "ดีเซล (Diesel)", "L", "เช่น 500")}
              {renderInput("gasoline", "เบนซิน (Gasoline)", "L", "เช่น 200")}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">Scope 3: ของเสียและอื่นๆ (Waste & Others)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {renderInput("generalWaste", "ขยะทั่วไป (General Waste)", "kg", "เช่น 200")}
              {renderInput("hazardousWaste", "ของเสียอันตราย (Hazardous Waste)", "kg", "เช่น 50")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput("rawMaterial", "วัตถุดิบ (Raw Material)", "kg", "เช่น 5000")}
              {renderInput("transport", "การขนส่ง (Transportation)", "km", "เช่น 1500")}
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg">
            คำนวณและบันทึกข้อมูล
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-green-50 border border-green-200 p-8 rounded-xl text-center">
            <h2 className="text-xl font-semibold text-green-800 mb-4">ผลการคำนวณ (รายเดือน)</h2>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-sm text-gray-500">Scope 1</p><p className="text-xl font-bold text-orange-600">{result.scope1.toFixed(2)}</p></div>
              <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-sm text-gray-500">Scope 2</p><p className="text-xl font-bold text-blue-600">{result.scope2.toFixed(2)}</p></div>
              <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-sm text-gray-500">Scope 3</p><p className="text-xl font-bold text-green-600">{result.scope3.toFixed(2)}</p></div>
            </div>
            <p className="text-4xl font-bold text-gray-800 mb-2">{result.total.toFixed(2)} <span className="text-xl text-gray-600">kgCO2e</span></p>
            <button onClick={handleDownloadReport} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 mt-4">
              ดาวน์โหลดรายงาน (PDF Report)
            </button>
          </div>
        )}

        {/* ส่วนแสดงประวัติ */}
        {reports.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ประวัติการบันทึก</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border">เดือน</th>
                    <th className="p-3 border">ไฟฟ้า (kWh)</th>
                    <th className="p-3 border">น้ำมัน (L)</th>
                    <th className="p-3 border">ขยะ (kg)</th>
                    <th className="p-3 border">Total CO2 (kgCO2e)</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-3 border">{r.month}</td>
                      <td className="p-3 border">{r.electricity}</td>
                      <td className="p-3 border">{r.lpg + r.diesel + r.gasoline}</td>
                      <td className="p-3 border">{r.generalWaste + r.hazardousWaste}</td>
                      <td className="p-3 border font-bold text-red-600">{r.totalCO2.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}