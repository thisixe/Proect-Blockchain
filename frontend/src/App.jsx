import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 1. เพิ่ม Database ไอคอน
import { Search, Link, ShieldCheck, Map, Truck, Package, LogOut, PlusCircle, LayoutDashboard, Database } from 'lucide-react';
import Timeline from './components/Timeline';
import VerifyBadge from './components/VerifyBadge';
import MapDisplay from './components/MapDisplay';
import Auth from './components/Auth'; 
import AddProduct from './components/AddProduct'; 
import AdminDashboard from './components/AdminDashboard';
// 2. Import หน้า Explorer เข้ามา
import BlockchainExplorer from './components/BlockchainExplorer'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chainData, setChainData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('track'); 

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // 3. โค้ดใหม่: รับค่าจาก URL เพื่อให้สแกน QR Code แล้วค้นหาอัตโนมัติ
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get('track');
    
    // ถ้ามี User ล็อกอินอยู่ และมี param ?track=... ให้ทำการค้นหาเลย
    if (currentUser && trackId) {
      handleTrackProduct(trackId);
      // เคลียร์ URL ให้สะอาด
      window.history.replaceState({}, document.title, "/"); 
    }
  }, [currentUser]); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/chain/${searchTerm}`);
      setChainData(response.data);
      setActiveTab('track'); 
    } catch (error) {
      console.error("Error fetching data:", error);
      setChainData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackProduct = (lotId) => {
    setSearchTerm(lotId);
    setLoading(true);
    axios.get(`http://localhost:5000/chain/${lotId}`)
      .then(res => {
         setChainData(res.data);
         setActiveTab('track'); 
         setLoading(false);
         window.scrollTo(0, 0); 
      })
      .catch(err => {
         console.error(err);
         setLoading(false);
      });
  };

  if (!currentUser) {
    return <Auth onLogin={(userData) => setCurrentUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- Navbar --- */}
      <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-md relative z-30">
        <div className="font-bold text-xl flex items-center gap-2">
          <ShieldCheck className="text-blue-400" />
          Logistics Blockchain 
          {currentUser.role === 'admin' ? (
             <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full ml-2">Admin Mode</span>
          ) : (
             <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full ml-2">User Mode</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">ผู้ใช้งาน: <span className="text-white font-bold">{currentUser.username}</span></span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors">
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* --- Tabs เมนู --- */}
      <div className="bg-white shadow border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-center gap-4 sm:gap-8 overflow-x-auto">
            {/* เมนูที่ทุกคนเห็น */}
            <button 
                onClick={() => setActiveTab('track')}
                className={`flex items-center gap-2 py-4 px-4 sm:px-6 border-b-2 font-bold transition whitespace-nowrap ${activeTab === 'track' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Search size={20}/> ตรวจสอบเส้นทาง
            </button>

            {/* 4. เพิ่มปุ่ม Blockchain Explorer */}
            <button 
                onClick={() => setActiveTab('explorer')}
                className={`flex items-center gap-2 py-4 px-4 sm:px-6 border-b-2 font-bold transition whitespace-nowrap ${activeTab === 'explorer' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
            >
                <Database size={20}/> Blockchain Explorer
            </button>
            
            {/* เมนูที่เห็นเฉพาะ Admin */}
            {currentUser.role === 'admin' && (
              <>
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 py-4 px-4 sm:px-6 border-b-2 font-bold transition whitespace-nowrap ${activeTab === 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-orange-600'}`}
                >
                    <LayoutDashboard size={20}/> จัดการสถานะขนส่ง
                </button>
                <button 
                    onClick={() => setActiveTab('add')}
                    className={`flex items-center gap-2 py-4 px-4 sm:px-6 border-b-2 font-bold transition whitespace-nowrap ${activeTab === 'add' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-green-600'}`}
                >
                    <PlusCircle size={20}/> สร้างข้อมูลสินค้าใหม่
                </button>
              </>
            )}
        </div>
      </div>

      {/* --- ส่วนแสดงผล --- */}
      {/* 5. แทรกเงื่อนไขหน้า Explorer ตรงนี้ */}
      {activeTab === 'explorer' ? (
        <BlockchainExplorer />
      ) : activeTab === 'dashboard' && currentUser.role === 'admin' ? (
        <AdminDashboard currentUser={currentUser} onTrackProduct={handleTrackProduct} />
      ) : activeTab === 'add' && currentUser.role === 'admin' ? (
        <AddProduct />
      ) : (
        <div className="pb-10 animate-fade-in-up">
            <div className="bg-blue-800 text-white py-12 px-4 shadow-inner mb-8 bg-opacity-95" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}>
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-black mb-4 flex justify-center items-center gap-3 tracking-wide">
                        <Link size={36} className="text-blue-300" /> GLOBAL SUPPLY CHAIN
                    </h1>
                    <p className="text-blue-200 text-lg">ระบบตรวจสอบเส้นทางสินค้าและโลจิสติกส์ด้วยเทคโนโลยีบล็อกเชน</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4">
                <form onSubmit={handleSearch} className="relative mb-8">
                    <input
                        type="text"
                        placeholder="กรอกหมายเลข Tracking / Lot ID (เช่น IP16PM-TH-001)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 rounded-xl border-2 border-blue-200 focus:border-blue-600 outline-none shadow-md text-lg transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                    <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-8 font-bold rounded-lg hover:bg-blue-700 transition">
                        ติดตามสถานะ
                    </button>
                </form>

                {loading ? (
                    <div className="text-center py-12 text-gray-500 font-medium animate-pulse">กำลังซิงค์ข้อมูลจากสายโซ่บล็อกเชน...</div>
                ) : chainData.length > 0 ? (
                    <div>
                        <VerifyBadge />
                        <MapDisplay chain={chainData} />
                        <div className="mt-8">
                            <Timeline chain={chainData} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
                        <Package size={64} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">ระบุหมายเลขพัสดุเพื่อตรวจสอบ</h3>
                        <p className="text-gray-500 font-medium">ระบบสามารถตรวจสอบข้อมูลย้อนหลังได้ 100% โดยไม่สามารถแก้ไขข้อมูลได้</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

export default App;