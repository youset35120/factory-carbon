// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allReports, setAllReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        
        if (meData.role !== 'ADMIN') {
          router.push("/");
          return;
        }

        const reportRes = await fetch("/api/reports");
        if (reportRes.ok) {
          const data = await reportRes.json();
          setAllReports(data);
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>;

  // ===== คำนวณสถิติต่างๆ =====
  const totalFactories = new Set(allReports.map(r => r.userId)).size;
  const approvedReports = allReports.filter(r => r.status === 'APPROVED');
  const pendingReports = allReports.filter(r => r.status === 'PENDING');
  
  const totalEmissions = approvedReports.reduce((sum, r) => sum + r.totalCO2, 0);
  const totalTax = totalEmissions * 0.20;

  // จัดอันดับโรงงานที่ปล่อยก๊าซเยอะที่สุด
  const factoryMap: Record<string, number> = {};
  approvedReports.forEach(r => {
    const name = r.user?.factoryName || 'Unknown';
    factoryMap[name] = (factoryMap[name] || 0) + r.totalCO2;
  });

  const rankingData = Object.entries(factoryMap)
    .map(([name, emissions]) => ({ name, emissions: parseFloat(emissions.toFixed(2)) }))
    .sort((a, b) => b.emissions - a.emissions)
    .slice(0, 5);

  const barColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e'];

  // ===== เตรียมข้อมูลสรุปตามโรงงานเพื่อแสดงในตาราง (แก้ปัญหา Type Unknown) =====
  type FactoryStat = { total: number; approved: number; pending: number; rejected: number };
  const factoryStatsMap: Record<string, FactoryStat> = {};

  allReports.forEach(r => {
    const name = r.user?.factoryName || 'Unknown';
    if (!factoryStatsMap[name]) {
      factoryStatsMap[name] = { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    factoryStatsMap[name].total++;
    if (r.status === 'APPROVED') factoryStatsMap[name].approved++;
    if (r.status === 'PENDING') factoryStatsMap[name].pending++;
    if (r.status === 'REJECTED') factoryStatsMap[name].rejected++;
  });

  const factoryStatsArray = Object.entries(factoryStatsMap);

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Admin Overview Dashboard
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">SYSTEM ADMIN</span>
            </h1>
            <p className="text-gray-500 text-sm">ภาพรวมระบบบริหารจัดการคาร์บอนฟุตพริ้นต์ของโรงงานทั้งหมด</p>
          </div>
          <Link href="/" className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 text-sm">
            กลับหน้าจัดการข้อมูล
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold mb-1">โรงงานในระบบ</p>
            <p className="text-2xl font-bold text-blue-800">{totalFactories}</p>
            <p className="text-xs text-gray-500">Factories</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <p className="text-xs text-yellow-600 font-semibold mb-1">รอตรวจสอบ</p>
            <p className="text-2xl font-bold text-yellow-800">{pendingReports.length}</p>
            <p className="text-xs text-gray-500">Pending Approvals</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-xs text-green-600 font-semibold mb-1">ยอดก๊าซรวม (Verified)</p>
            <p className="text-2xl font-bold text-green-800">{totalEmissions.toFixed(2)}</p>
            <p className="text-xs text-gray-500">kgCO2e</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-xs text-red-600 font-semibold mb-1">ภาษีคาร์บอนประมาณการ</p>
            <p className="text-2xl font-bold text-red-800">{totalTax.toFixed(2)}</p>
            <p className="text-xs text-gray-500">THB</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🏆 อันดับโรงงานที่ปล่อยก๊าซเรือกระจกสูงสุด 5 อันดับแรก</h2>
          <div className="w-full h-80 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {rankingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="emissions" name="Total CO2 (kgCO2e)" radius={[0, 4, 4, 0]}>
                    {rankingData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                ยังไม่มีข้อมูลที่ผ่านการอนุมัติสำหรับการจัดอันดับ
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">สรุปสถานะการทำรายงานของโรงงานทั้งหมด</h2>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-4 border border-gray-700 font-semibold">ชื่อโรงงาน</th>
                  <th className="p-4 border border-gray-700 font-semibold text-center">จำนวนรายงานทั้งหมด</th>
                  <th className="p-4 border border-gray-700 font-semibold text-center">อนุมัติแล้ว</th>
                  <th className="p-4 border border-gray-700 font-semibold text-center">รอตรวจสอบ</th>
                  <th className="p-4 border border-gray-700 font-semibold text-center">ตีกลับ</th>
                </tr>
              </thead>
              <tbody>
                {factoryStatsArray.length > 0 ? (
                  factoryStatsArray.map(([factoryName, counts], index) => (
                    <tr key={factoryName} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 border border-gray-300 text-gray-800 font-medium">{factoryName}</td>
                      <td className="p-4 border border-gray-300 text-center text-gray-800">{counts.total}</td>
                      <td className="p-4 border border-gray-300 text-center"><span className="font-bold text-green-600">{counts.approved}</span></td>
                      <td className="p-4 border border-gray-300 text-center"><span className="font-bold text-yellow-600">{counts.pending}</span></td>
                      <td className="p-4 border border-gray-300 text-center"><span className="font-bold text-red-600">{counts.rejected}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-400">ยังไม่มีข้อมูลในระบบ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}