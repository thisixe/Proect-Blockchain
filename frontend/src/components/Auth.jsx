import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, LogIn, UserPlus, ShieldAlert } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true); // สลับหน้า Login / Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? 'http://localhost:5001/login' : 'http://localhost:5001/register';
      const res = await axios.post(endpoint, { username, password });

      if (isLogin) {
        // ถ้าเป็นการ Login สำเร็จ -> เก็บ Token ลงเครื่อง แล้วแจ้ง App.jsx ว่าล็อกอินแล้ว
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        // ถ้าเป็นการสมัครสมาชิกสำเร็จ -> สลับกลับไปหน้า Login
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-xl rounded-3xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Tech Trace</h2>
          <p className="mt-2 text-gray-500">
            {isLogin ? "เข้าสู่ระบบเพื่อจัดการ Supply Chain" : "สมัครสมาชิกสำหรับแอดมิน"}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 px-4 py-3 mb-6 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
            <ShieldAlert className="flex-shrink-0 w-5 h-5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full py-3 pl-10 pr-3 transition-all border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="กรอกชื่อผู้ใช้งาน"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full py-3 pl-10 pr-3 transition-all border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full gap-2 p-3 font-bold text-white transition-colors bg-gray-900 rounded-xl hover:bg-blue-600 active:scale-95 disabled:bg-gray-400"
          >
            {isLoading ? "กำลังโหลด..." : isLogin ? <><LogIn className="w-5 h-5"/> เข้าสู่ระบบ</> : <><UserPlus className="w-5 h-5"/> สร้างบัญชีใหม่</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-800"
          >
            {isLogin ? "ยังไม่มีบัญชีใช่ไหม? สมัครสมาชิก" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบเลย"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;