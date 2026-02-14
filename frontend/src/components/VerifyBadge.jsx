import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertTriangle, Loader } from 'lucide-react';

const VerifyBadge = () => {
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ให้ React ยิงไปถาม Node.js ว่า Blockchain ทั้งก้อน (Global Chain) ยังสมบูรณ์ดีไหม?
    const checkBlockchain = async () => {
      try {
        const response = await axios.get('http://localhost:5000/validate');
        setIsValid(response.data.valid); // จะได้ค่า true หรือ false
      } catch (error) {
        console.error("Validation error:", error);
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    checkBlockchain();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-500 my-6 py-4 border-2 border-gray-100 rounded-xl bg-white shadow-sm">
        <Loader className="animate-spin" size={20} /> กำลังตรวจสอบความถูกต้องของระบบ Blockchain...
      </div>
    );
  }

  return (
    <div className={`my-6 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-3 font-bold text-lg border-2 shadow-sm animate-fade-in-up transition-colors ${
      isValid 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {isValid ? (
        <>
          <ShieldCheck size={32} className="text-green-600 shrink-0" />
          <span>VERIFIED: ข้อมูลในระบบ Blockchain ถูกต้องและปลอดภัย 100%</span>
        </>
      ) : (
        <>
          <AlertTriangle size={32} className="text-red-600 shrink-0 animate-pulse" />
          <span>WARNING: ตรวจพบการดัดแปลงข้อมูลในระบบ! (Data Tampered)</span>
        </>
      )}
    </div>
  );
};

export default VerifyBadge;