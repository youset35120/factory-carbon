// app/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<number>(0); // <--- เพิ่ม State เก็บเป้าหมาย
  
  const [year1, setYear1] = useState<string>("");
  const [year2, setYear2] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        
        // ดึงค่าเป้าหมายมาแสดงในกราฟ
        const meData = await meRes.json();
        setTarget(meData.monthlyTarget || 0);

        const reportRes = await fetch("/api/reports");
        if (reportRes.ok) {
          const data: any[] = await reportRes.json();
          data.sort((a: any, b: any) => (a.month > b.month ? 1 : -1));
          setReports(data);
          
          const years: string[] = [...new Set(data.map((r: any) => r.month.split('-')[0]))].sort();
          if (years.length > 0) setYear1(years[years.length - 1] as string);
          if (years.length > 1) setYear2(years[years.length - 2] as string);
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const availableYears = useMemo(() => {
    return [...new Set(reports.map(r => r.month.split('-')[0]))].sort() as string[];
  }, [reports]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  const totalCO2 = reports.reduce((sum, r) => sum + r.totalCO2, 0);
  const avgCO2 = reports.length > 0 ? totalCO2 / reports.length : 0;

  const chartData = reports.map(r => ({
    name: r.month,
    ก๊าซเรือกระจก: parseFloat(r.totalCO2.toFixed(2)),
  }));

  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const comparisonData = months.map(m => {
    let point: any = { name: m };
    if (year1) {
      const total1 = reports.filter(r => r.month.startsWith(year1) && r.month.endsWith(`-${m}`)).reduce((sum, r) => sum + r.totalCO2, 0);
      point[`ปี ${year1}`] = parseFloat(total1.toFixed(2));
    }
    if (year2) {
      const total2 = reports.filter(r => r.month.startsWith(year2) && r.month.endsWith(`-${m}`)).reduce((sum, r) => sum + r.totalCO2, 0);
      point[`ปี ${year2}`] = parseFloat(total2.toFixed(2));
    }
    return point;
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard สรุปผล Carbon Footprint</h1>
            <p className="text-gray-500 text-sm">ภาพรวมการปล่อยก๊าซเรือกระจกและการเปรียบเทียบรายปี</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ กรอกข้อมูลใหม่</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
            <p className="text-sm text-blue-600 font-semibold mb-1">ยอดรวมทั้งหมด (Total Emissions)</p>
            <p className="text-4xl font-bold text-blue-800">{totalCO2.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">kgCO2e</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm">
            <p className="text-sm text-green-600 font-semibold mb-1">ค่าเฉลี่ยต่อเดือน (Average)</p>
            <p className="text-4xl font-bold text-green-800">{avgCO2.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">kgCO2e / เดือน</p>
          </div>
        </div>

        {/* ส่วนกราฟเปรียบเทียบข้ามปี (Year-over-Year) */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">กราฟเปรียบเทียบข้ามปี (Year-over-Year Comparison)</h2>
            <div className="flex gap-4 mt-4 md:mt-0">
              <select value={year1} onChange={(e) => setYear1(e.target.value)} className="p-2 border border-gray-300 rounded-lg outline-none text-black">
                {availableYears.map(y => <option key={y} value={y}>ปี {y}</option>)}
              </select>
              <span className="self-center text-gray-500 font-semibold">VS</span>
              <select value={year2} onChange={(e) => setYear2(e.target.value)} className="p-2 border border-gray-300 rounded-lg outline-none text-black">
                {availableYears.map(y => <option key={y} value={y}>ปี {y}</option>)}
              </select>
            </div>
          </div>
          <div className="w-full h-80 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {reports.length > 0 && year1 && year2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={`ปี ${year1}`} stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey={`ปี ${year2}`} stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-center">
                ต้องมีข้อมูลอย่างน้อย 2 ปี เพื่อทำการเปรียบเทียบ<br/>(เช่น มีข้อมูลปี 2023 และ 2024)
              </div>
            )}
          </div>
        </div>

        {/* ส่วนกราฟแท่งรวม (เพิ่มเส้นเป้าหมาย ReferenceLine) */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">กราฟแท่งเปรียบเทียบปริมาณรายเดือนทั้งหมด</h2>
          <div className="w-full h-80 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {reports.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ก๊าซเรือกระจก" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  
                  {/* ลากเส้นเป้าหมายสีแดงถ้ามีการตั้งเป้าหมายไว้ */}
                  {target > 0 && (
                    <ReferenceLine y={target} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'right', value: `เป้าหมาย (${target})`, fill: '#ef4444', fontSize: 12 }} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">ยังไม่มีข้อมูลสำหรับแสดงกราฟ</div>
            )}
          </div>
        </div>

        {/* ตารางประวัติละเอียด */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">ตารางประวัติการบันทึก</h2>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-4 border border-gray-700 font-semibold">เดือนที่รายงาน</th>
                  <th className="p-4 border border-gray-700 font-semibold">ไฟฟ้า (kWh)</th>
                  <th className="p-4 border border-gray-700 font-semibold">น้ำมันรวม (L)</th>
                  <th className="p-4 border border-gray-700 font-semibold">ขยะรวม (kg)</th>
                  <th className="p-4 border border-gray-700 font-semibold">Total CO2 (kgCO2e)</th>
                  <th className="p-4 border border-gray-700 font-semibold text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-4 border border-gray-300 text-gray-800 font-medium">{r.month}</td>
                      <td className="p-4 border border-gray-300 text-gray-800 font-medium">{r.electricity}</td>
                      <td className="p-4 border border-gray-300 text-gray-800 font-medium">{r.lpg + r.diesel + r.gasoline}</td>
                      <td className="p-4 border border-gray-300 text-gray-800 font-medium">{r.generalWaste + r.hazardousWaste}</td>
                      <td className="p-4 border border-gray-300 font-bold text-red-600">{r.totalCO2.toFixed(2)}</td>
                      <td className="p-4 border border-gray-300 text-center">
                        {r.status === 'APPROVED' ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">อนุมัติแล้ว</span>
                        ) : r.status === 'REJECTED' ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">ตีกลับ</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">รอตรวจสอบ</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-400">ยังไม่มีข้อมูลในระบบ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}