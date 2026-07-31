// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // true: หน้า Login, false: หน้า Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [factoryName, setFactoryName] = useState("");
  const [logo, setLogo] = useState<string | null>(null); // <--- เพิ่มตัวแปรเก็บโลโก้
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      // เพิ่ม logo เข้าไปใน payload ตอนสมัครสมาชิก
      const payload = isLogin 
        ? { email, password } 
        : { email, password, factoryName, logo };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // เพิ่มส่วนนี้เพื่อดัก Error ที่ชัดเจนขึ้น
      const text = await res.text(); // อ่านค่ากลับมาเป็น Text ก่อน
      try {
        const data = JSON.parse(text); // ลองแปลงเป็น JSON
        if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
        
        if (isLogin) {
          router.push("/");
          router.refresh();
        } else {
          setIsLogin(true);
          setError("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        }
      } catch (parseError) {
        // ถ้าแปลงเป็น JSON ไม่ได้ (แปลว่าได้ HTML กลับมา)
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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
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
              
              {/* ส่วนอัปโหลดโลโก้ */}
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
                        setLogo(reader.result as string); // แปลงรูปเป็น Base64
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