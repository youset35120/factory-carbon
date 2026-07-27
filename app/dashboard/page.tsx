// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // ตรวจสอบ Login
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }

      // ดึงข้อมูลรายงาน
      const reportRes = await fetch("/api/reports");
      if (reportRes.ok) {
        const data = await reportRes.json();
        // เรียงข้อมูลจากเดือนเก่าไปใหม่ เพื่อให้กราฟอ่านง่าย
        data.sort((a: any, b: any) => (a.month > b.month ? 1 : -1));
        setReports(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  // คำนวณตัวเลขสรุปผล
  const totalCO2 = reports.reduce((sum, r) => sum + r.totalCO2, 0);
  const avgCO2 = reports.length > 0 ? totalCO2 / reports.length : 0;
  const maxCO2 = reports.length > 0 ? Math.max(...reports.map(r => r.totalCO2)) : 0;

  // แปลงข้อมูลให้ Recharts ใช้งานได้
  const chartData = reports.map(r => ({
    name: r.month, // เดือน (เช่น 2024-07)
    ก๊าซเรือกระจก: parseFloat(r.totalCO2.toFixed(2)),
  }));

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* แถบบนสุด */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard สรุปผล Carbon Footprint</h1>
            <p className="text-gray-500 text-sm">ภาพรวมการปล่อยก๊าซเรือกระจกของโรงงาน</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              + กรอกข้อมูลใหม่
            </Link>
            <Link href="/api/auth/logout" className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
              ออกจากระบบ
            </Link>
          </div>
        </div>

        {/* การ์ดสรุปผลรวม */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-600 font-semibold mb-1">ผลรวมทั้งหมด (Total Emissions)</p>
            <p className="text-3xl font-bold text-blue-800">{totalCO2.toFixed(2)}</p>
            <p className="text-xs text-gray-500">kgCO2e</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <p className="text-sm text-green-600 font-semibold mb-1">ค่าเฉลี่ยต่อเดือน (Average)</p>
            <p className="text-3xl font-bold text-green-800">{avgCO2.toFixed(2)}</p>
            <p className="text-xs text-gray-500">kgCO2e / เดือน</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
            <p className="text-sm text-orange-600 font-semibold mb-1">ค่าสูงสุดในเดือนเดียว (Max)</p>
            <p className="text-3xl font-bold text-orange-800">{maxCO2.toFixed(2)}</p>
            <p className="text-xs text-gray-500">kgCO2e</p>
          </div>
        </div>

        {/* ส่วนกราฟ */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">กราฟเปรียบเทียบการปล่อยก๊าซรายเดือน</h2>
          <div className="w-full h-72 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {reports.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ก๊าซเรือกระจก" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                ยังไม่มีข้อมูลสำหรับแสดงกราฟ
              </div>
            )}
          </div>
        </div>

        {/* ตารางประวัติละเอียด */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">ตารางประวัติการบันทึก</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">เดือนที่รายงาน</th>
                  <th className="p-3 border">ไฟฟ้า (kWh)</th>
                  <th className="p-3 border">น้ำมันรวม (L)</th>
                  <th className="p-3 border">ขยะรวม (kg)</th>
                  <th className="p-3 border">Total CO2 (kgCO2e)</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-3 border">{r.month}</td>
                      <td className="p-3 border">{r.electricity}</td>
                      <td className="p-3 border">{r.lpg + r.diesel + r.gasoline}</td>
                      <td className="p-3 border">{r.generalWaste + r.hazardousWaste}</td>
                      <td className="p-3 border font-bold text-red-600">{r.totalCO2.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">ยังไม่มีข้อมูลในระบบ</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}