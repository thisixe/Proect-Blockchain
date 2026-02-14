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
      const endpoint = isLogin ? 'http://localhost:5000/login' : 'http://localhost:5000/register';
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Tech Trace</h2>
          <p className="text-gray-500 mt-2">
            {isLogin ? "เข้าสู่ระบบเพื่อจัดการ Supply Chain" : "สมัครสมาชิกสำหรับแอดมิน"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="กรอกชื่อผู้ใช้งาน"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white p-3 rounded-xl font-bold hover:bg-blue-600 transition-colors active:scale-95 disabled:bg-gray-400"
          >
            {isLoading ? "กำลังโหลด..." : isLogin ? <><LogIn className="w-5 h-5"/> เข้าสู่ระบบ</> : <><UserPlus className="w-5 h-5"/> สร้างบัญชีใหม่</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="text-blue-600 font-bold hover:text-blue-800 text-sm transition-colors"
          >
            {isLogin ? "ยังไม่มีบัญชีใช่ไหม? สมัครสมาชิก" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบเลย"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;