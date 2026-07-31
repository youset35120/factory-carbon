// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  
  const [factoryName, setFactoryName] = useState("");
  const [role, setRole] = useState("USER");
  const [reports, setReports] = useState<any[]>([]);
  const [isEditingFactory, setIsEditingFactory] = useState(false);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0);
  const [showNotifs, setShowNotifs] = useState(false); // <--- State เปิด/ปิดเมนูแจ้งเตือน

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
    logo: "",
  });

  const [result, setResult] = useState<{ total: number; scope1: number; scope2: number; scope3: number; carbonTax: number } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setFactoryName(data.factoryName);
          setRole(data.role);
          setMonthlyTarget(data.monthlyTarget || 0);
          setFormData((prev) => ({ ...prev, factoryName: data.factoryName, logo: data.logo || "" }));
        } else {
          router.push("/login");
          return;
        }

        const reportRes = await fetch("/api/reports");
        if (reportRes.ok) setReports(await reportRes.json());
      } catch (error) {
        router.push("/login");
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
    setFormData((prev) => ({ ...prev, [name]: isNumberField ? (value === "" ? 0 : parseFloat(value)) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { calculateCarbonFootprint } = await import("@/lib/reportGenerator");
    const calculation = calculateCarbonFootprint(formData as any);
    setResult(calculation);

    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, totalCO2: calculation.total }),
    });

    const reportRes = await fetch("/api/reports");
    if (reportRes.ok) setReports(await reportRes.json());
  };

  const handleDownloadReport = async (mode: 'monthly' | 'annual') => {
    const { calculateCarbonFootprint, generatePDFReport } = await import("@/lib/reportGenerator");
    const calculation = calculateCarbonFootprint(formData as any);
    
    let reportsForPdf = reports;
    let currentStatus = 'PENDING';

    if (mode === 'annual' && formData.month) {
      const year = (formData.month as string).split('-')[0];
      reportsForPdf = reports.filter((r: any) => r.month.startsWith(year));
      reportsForPdf.sort((a: any, b: any) => (a.month > b.month ? 1 : -1));
      
      if (reportsForPdf.length > 0 && reportsForPdf.every((r: any) => r.status === 'APPROVED')) {
        currentStatus = 'APPROVED';
      }
    } else {
      const foundReport = reports.find((r: any) => r.month === formData.month);
      if (foundReport) {
        currentStatus = foundReport.status;
      }
    }

    generatePDFReport(formData as any, calculation, mode, reportsForPdf, currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        const reportRes = await fetch("/api/reports");
        if (reportRes.ok) setReports(await reportRes.json());
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const reportRes = await fetch("/api/reports");
      if (reportRes.ok) setReports(await reportRes.json());
    }
  };

  const handleUpdateFactoryName = async () => {
    const res = await fetch("/api/auth/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ factoryName: formData.factoryName }),
    });
    if (res.ok) {
      setFactoryName(formData.factoryName as string);
      setIsEditingFactory(false);
    }
  };

  const handleUpdateTarget = async () => {
    const res = await fetch("/api/auth/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyTarget }),
    });
    if (res.ok) alert("Saved!");
  };

  const handleExportCSV = () => {
    let headers = ["Month", "Electricity (kWh)", "Water (m3)", "LPG (L)", "Diesel (L)", "Gasoline (L)", "General Waste (kg)", "Hazardous Waste (kg)", "Raw Material (kg)", "Transport (km)", "Total CO2 (kgCO2e)", "Carbon Tax (THB)", "Status"];
    if (role === 'ADMIN') headers.unshift("Factory Name");
    let csvContent = headers.join(",") + "\n";

    reports.forEach((r) => {
      let row = [];
      if (role === 'ADMIN') row.push(`"${r.user?.factoryName || '-'}"`);
      row.push(r.month);
      row.push(r.electricity);
      row.push(r.water);
      row.push(r.lpg);
      row.push(r.diesel);
      row.push(r.gasoline);
      row.push(r.generalWaste);
      row.push(r.hazardousWaste);
      row.push(r.rawMaterial);
      row.push(r.transport);
      row.push(r.totalCO2.toFixed(2));
      row.push((r.totalCO2 * 0.20).toFixed(2));
      row.push(r.status);
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Carbon_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderInput = (name: string, label: string, unit: string, placeholder: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input type="number" name={name} value={(formData[name] as number) || ""} onChange={handleChange} required min="0" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black pr-12" placeholder={placeholder} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  if (!factoryName) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // ===== ตรรกะการแจ้งเตือน =====
  // Admin จะเห็นรายการที่ PENDING, User จะเห็นรายการที่ APPROVED หรือ REJECTED
  const notifications = role === 'ADMIN' 
    ? reports.filter(r => r.status === 'PENDING').slice(0, 5)
    : reports.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED').slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* แถบบนสุด */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{role === 'ADMIN' ? t('admin_dashboard') : t('calculator_title')}</h1>
            <p className="text-gray-500 text-sm">{t('welcome')}, <span className="font-semibold">{factoryName}</span> {role === 'ADMIN' && <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">ADMIN</span>}</p>
          </div>
          
          <div className="flex gap-2 items-center relative">
            {/* ปุ่มสลับภาษา */}
            <button onClick={() => setLang('th')} className={`px-3 py-2 rounded-lg text-sm font-semibold ${lang === 'th' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>TH</button>
            <button onClick={() => setLang('en')} className={`px-3 py-2 rounded-lg text-sm font-semibold ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>EN</button>
            
            {/* ===== ไอคอนระฆังแจ้งเตือน ===== */}
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* จุดสีแดงแจ้งเตือน */}
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* กล่อง Dropdown แสดงรายการแจ้งเตือน */}
            {showNotifs && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="font-bold text-gray-800 text-sm">การแจ้งเตือน (Notifications)</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((r) => (
                      <div key={r.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                        {role === 'ADMIN' ? (
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">{r.user?.factoryName || 'Unknown'}</span> ส่งรายงานเดือน <span className="font-semibold">{r.month}</span> มารอตรวจสอบ
                          </p>
                        ) : (
                          <p className="text-sm text-gray-700">
                            รายงานเดือน <span className="font-semibold">{r.month}</span> ของคุณถูก 
                            <span className={`font-semibold ${r.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}> {r.status === 'APPROVED' ? 'อนุมัติ' : 'ตีกลับ'} </span>
                            แล้ว
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">ไม่มีการแจ้งเตือนใหม่</div>
                  )}
                </div>
              </div>
            )}
            {/* ================================ */}

            {role === 'ADMIN' && (
              <a href="/admin" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold hidden md:inline-block">Admin Overview</a>
            )}
            <a href="/dashboard" className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 text-sm hidden md:inline-block">{t('view_dashboard')}</a>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">{t('logout')}</button>
          </div>
        </div>

        {role === 'USER' && (
          <>
            {/* กล่องตั้งค่าเป้าหมาย */}
            <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-yellow-800 mb-1">{t('target_title')}</label>
                <input type="number" value={monthlyTarget || ""} onChange={(e) => setMonthlyTarget(parseFloat(e.target.value))} className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-black" placeholder="5000" />
              </div>
              <button onClick={handleUpdateTarget} className="bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 whitespace-nowrap">{t('save_target')}</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('factory_name')}</label>
                  <div className="flex gap-2">
                    <input type="text" name="factoryName" value={formData.factoryName as string} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black" disabled={!isEditingFactory} />
                    {!isEditingFactory ? (
                      <button type="button" onClick={() => setIsEditingFactory(true)} className="bg-gray-200 text-gray-700 px-4 rounded-lg hover:bg-gray-300 text-sm font-semibold whitespace-nowrap">{t('edit')}</button>
                    ) : (
                      <>
                        <button type="button" onClick={handleUpdateFactoryName} className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 text-sm font-semibold whitespace-nowrap">{t('save')}</button>
                        <button type="button" onClick={() => { setIsEditingFactory(false); setFormData(prev => ({ ...prev, factoryName })); }} className="bg-gray-300 text-gray-700 px-4 rounded-lg hover:bg-gray-400 text-sm font-semibold whitespace-nowrap">{t('cancel')}</button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('report_month')}</label>
                  <input type="month" name="month" value={formData.month as string} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black" />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-blue-700 mb-4 border-b pb-2">{t('scope2')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput("electricity", t('electricity'), "kWh", "15000")}
                  {renderInput("water", t('water'), "m³", "500")}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-orange-700 mb-4 border-b pb-2">{t('scope1')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderInput("lpg", t('lpg'), "L", "100")}
                  {renderInput("diesel", t('diesel'), "L", "500")}
                  {renderInput("gasoline", t('gasoline'), "L", "200")}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">{t('scope3')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {renderInput("generalWaste", t('general_waste'), "kg", "200")}
                  {renderInput("hazardousWaste", t('hazardous_waste'), "kg", "50")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput("rawMaterial", t('raw_material'), "kg", "5000")}
                  {renderInput("transport", t('transport'), "km", "1500")}
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg">{t('calculate_save')}</button>
            </form>
          </>
        )}

        {result && role === 'USER' && (
          <div className="mt-8 bg-green-50 border border-green-200 p-8 rounded-xl text-center">
            <h2 className="text-xl font-semibold text-green-800 mb-4">{t('monthly_result')}</h2>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-sm text-gray-500">Scope 1</p><p className="text-xl font-bold text-orange-600">{result.scope1.toFixed(2)}</p></div>
              <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-sm text-gray-500">Scope 2</p><p className="text-xl font-bold text-blue-600">{result.scope2.toFixed(2)}</p></div>
              <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-sm text-gray-500">Scope 3</p><p className="text-xl font-bold text-green-600">{result.scope3.toFixed(2)}</p></div>
            </div>
            
            <p className="text-2xl font-bold text-gray-800 mb-1">{t('total_ghg')}: {result.total.toFixed(2)} kgCO2e</p>
            
            <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-lg inline-block">
              <p className="text-sm text-red-600 font-semibold">{t('carbon_tax_est')}</p>
              <p className="text-3xl font-bold text-red-600">{result.carbonTax.toFixed(2)} THB</p>
              <p className="text-xs text-gray-500 mt-1">(Rate: 200 THB / Ton CO2e)</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
              <button onClick={() => handleDownloadReport('monthly')} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 inline-flex items-center gap-2 justify-center">{t('download_monthly')}</button>
              <button onClick={() => handleDownloadReport('annual')} className="bg-blue-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-900 inline-flex items-center gap-2 justify-center">{t('download_annual')}</button>
            </div>
          </div>
        )}

        {reports.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{role === 'ADMIN' ? t('all_factories') : t('history')}</h2>
              <button onClick={handleExportCSV} className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-semibold inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                {t('export_csv')}
              </button>
            </div>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    {role === 'ADMIN' && <th className="p-4 border border-gray-700 font-semibold">{t('factory_name')}</th>}
                    <th className="p-4 border border-gray-700 font-semibold">{t('report_month')}</th>
                    <th className="p-4 border border-gray-700 font-semibold">Total CO2 (kgCO2e)</th>
                    <th className="p-4 border border-gray-700 font-semibold text-center">{t('status')}</th>
                    {role === 'ADMIN' && <th className="p-4 border border-gray-700 font-semibold text-center">Admin</th>}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, index) => (
                    <tr key={r.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {role === 'ADMIN' && <td className="p-4 border border-gray-300 text-gray-800 font-medium">{r.user?.factoryName || '-'}</td>}
                      <td className="p-4 border border-gray-300 text-gray-800 font-medium">{r.month}</td>
                      <td className="p-4 border border-gray-300 font-bold text-red-600">{r.totalCO2.toFixed(2)}</td>
                      <td className="p-4 border border-gray-300 text-center">
                        {r.status === 'APPROVED' ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{t('approved')}</span>
                        ) : r.status === 'REJECTED' ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">{t('rejected')}</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">{t('pending')}</span>
                        )}
                      </td>
                      {role === 'ADMIN' && (
                        <td className="p-4 border border-gray-300 text-center">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleUpdateStatus(r.id, 'APPROVED')} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs font-semibold">{t('approve_btn')}</button>
                            <button onClick={() => handleUpdateStatus(r.id, 'REJECTED')} className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 text-xs font-semibold">{t('reject_btn')}</button>
                            <button onClick={() => handleDelete(r.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs font-semibold">{t('delete_btn')}</button>
                          </div>
                        </td>
                      )}
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