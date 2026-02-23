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
      const response = await axios.get(`http://localhost:5001/chain/${searchTerm}`);
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
    axios.get(`http://localhost:5001/chain/${lotId}`)
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
    <div className="min-h-screen font-sans bg-gray-50">
      
      {/* --- Navbar --- */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-3 text-white bg-gray-900 shadow-md">
        <div className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="text-blue-400" />
          Logistics Blockchain 
          {currentUser.role === 'admin' ? (
             <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full ml-2">Admin Mode</span>
          ) : (
             <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full ml-2">User Mode</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">ผู้ใช้งาน: <span className="font-bold text-white">{currentUser.username}</span></span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors">
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* --- Tabs เมนู --- */}
      <div className="sticky top-0 z-20 bg-white border-b shadow">
        <div className="flex justify-center max-w-4xl gap-4 mx-auto overflow-x-auto sm:gap-8">
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
            <div className="px-4 py-12 mb-8 text-white bg-blue-800 shadow-inner bg-opacity-95" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}>
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="flex items-center justify-center gap-3 mb-4 text-4xl font-black tracking-wide">
                        <Link size={36} className="text-blue-300" /> GLOBAL SUPPLY CHAIN
                    </h1>
                    <p className="text-lg text-blue-200">ระบบตรวจสอบเส้นทางสินค้าและโลจิสติกส์ด้วยเทคโนโลยีบล็อกเชน</p>
                </div>
            </div>

            <div className="max-w-3xl px-4 mx-auto">
                <form onSubmit={handleSearch} className="relative mb-8">
                    <input
                        type="text"
                        placeholder="กรอกหมายเลข Tracking / Lot ID (เช่น IP16PM-TH-001)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 text-lg transition-all border-2 border-blue-200 shadow-md outline-none rounded-xl focus:border-blue-600"
                    />
                    <Search className="absolute text-gray-400 transform -translate-y-1/2 left-4 top-1/2" size={24} />
                    <button type="submit" className="absolute px-8 font-bold text-white transition bg-blue-600 rounded-lg right-2 top-2 bottom-2 hover:bg-blue-700">
                        ติดตามสถานะ
                    </button>
                </form>

                {loading ? (
                    <div className="py-12 font-medium text-center text-gray-500 animate-pulse">กำลังซิงค์ข้อมูลจากสายโซ่บล็อกเชน...</div>
                ) : chainData.length > 0 ? (
                    <div>
                        <VerifyBadge />
                        <MapDisplay chain={chainData} />
                        <div className="mt-8">
                            <Timeline chain={chainData} />
                        </div>
                    </div>
                ) : (
                    <div className="py-16 text-center bg-white border-2 border-gray-200 border-dashed shadow-sm rounded-2xl">
                        <Package size={64} className="mx-auto mb-4 text-gray-200" />
                        <h3 className="mb-2 text-xl font-bold text-gray-700">ระบุหมายเลขพัสดุเพื่อตรวจสอบ</h3>
                        <p className="font-medium text-gray-500">ระบบสามารถตรวจสอบข้อมูลย้อนหลังได้ 100% โดยไม่สามารถแก้ไขข้อมูลได้</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

export default App;