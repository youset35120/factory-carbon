// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [factoryName, setFactoryName] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email, password } 
        : { email, password, factoryName, logo };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
        
        if (isLogin) {
          router.push("/calculator");
          router.refresh();
        } else {
          setIsLogin(true);
          setError("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        }
      } catch (parseError) {
        console.error("API Response (ไม่ใช่ JSON):", text);
        throw new Error("ระบบมีปัญหา (ได้รับ HTML แทน JSON) โปรดเช็ค Terminal");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* ปรับปุ่มกลับหน้าหลักให้เด่นชัดขึ้น และใช้ <a> tag เพื่อบังคับโหลดหน้าใหม่ */}
      <div className="w-full max-w-md flex justify-start mb-4">
        <a href="/" className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          กลับหน้าหลัก
        </a>
      </div>

      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {isLogin ? "เข้าสู่ระบบ (Login)" : "สมัครสมาชิก (Register)"}
        </h1>

        {error && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${error.includes("สำเร็จ") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโรงงาน</label>
                <input
                  type="text"
                  value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  placeholder="บริษัท โรงงานตัวอย่าง จำกัด"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">โลโก้บริษัท (Logo) - ไม่ใส่ก็ได้</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setLogo(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="********"
            />
            <div className="text-right mt-2">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">ลืมรหัสผ่าน?</Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "กำลังประมวลผล..." : isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้ว? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? "สมัครสมาชิกที่นี่" : "เข้าสู่ระบบที่นี่"}
          </button>
        </div>
      </div>
    </main>
  );
}