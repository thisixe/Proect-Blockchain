import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, MapPin, CheckCircle, Search } from 'lucide-react';

const AdminDashboard = ({ currentUser, onTrackProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateStatusInfo, setUpdateStatusInfo] = useState('');

  // ฟังก์ชันดึงข้อมูลสินค้าทั้งหมดจาก Database
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ฟังก์ชันอัปเดตสถานะลง Blockchain
  const handleUpdateStatus = async (product, e) => {
    e.preventDefault();
    const newStatus = e.target.status.value;
    const location = e.target.location.value;

    if (!newStatus || !location) {
      alert("กรุณาเลือกสถานะและระบุสถานที่อัปเดต");
      return;
    }

    try {
      // ยิง API สร้าง Block ใหม่ใน Blockchain
      await axios.post('http://localhost:5001/chain', {
        data: {
          product_id: product.lotId,
          item: product.name,
          status: newStatus,
          location: { address: location },
          factory: product.factory,
          dealer: product.dealer,
          sender: currentUser.username, // ชื่อ Admin ที่เป็นคนอัปเดต
          receiver: newStatus === 'DELIVERED' ? "Customer" : "Next Station"
        }
      });

      setUpdateStatusInfo(`อัปเดตสถานะ ${product.lotId} เป็น ${newStatus} สำเร็จ!`);
      e.target.reset(); // ล้างฟอร์ม
      setTimeout(() => setUpdateStatusInfo(''), 4000);

    } catch (error) {
      console.error("Update error:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  if (loading) return <div className="py-10 font-bold text-center text-gray-500">กำลังโหลดข้อมูลคลังสินค้า...</div>;

  return (
    <div className="max-w-6xl px-4 py-10 mx-auto animate-fade-in-up">
      <h2 className="flex items-center gap-2 mb-8 text-3xl font-bold text-gray-800">
        <Package className="text-blue-600" /> แดชบอร์ดจัดการสถานะสินค้า (Admin Only)
      </h2>

      {updateStatusInfo && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 font-medium text-green-700 bg-green-50 rounded-xl">
          <CheckCircle className="w-5 h-5" />
          {updateStatusInfo}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {products.map((product) => (
          <div key={product._id} className="flex flex-col gap-4 p-5 bg-white border border-gray-200 shadow-sm rounded-2xl sm:flex-row">
            {/* รูปภาพสินค้า & QR Code */}
            <div className="flex flex-col w-full gap-2 sm:w-1/3 shrink-0">
              <div className="h-32 overflow-hidden bg-gray-100 border rounded-xl">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-sm text-gray-400">ไม่มีรูป</div>
                )}
              </div>
              
              {/* --- โค้ดเพิ่ม QR Code Generator (ดึงจาก API ฟรี ไม่ต้องลงปลั๊กอิน) --- */}
              {/* <div className="flex flex-col items-center justify-center p-2 border bg-gray-50 rounded-xl">
                <span className="mb-1 text-xs font-bold text-gray-500">Scan to Track</span>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/?track=' + product.lotId)}`} 
                  alt="QR Code" 
                  className="w-20 h-20 rounded-lg shadow-sm"
                />
              </div> */}
            </div>

            {/* ข้อมูลและฟอร์มอัปเดต */}
            <div className="flex flex-col justify-between w-full">
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                  <span className="px-2 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded-md">Lot: {product.lotId}</span>
                </div>
                <p className="mb-3 text-sm text-gray-500">โรงงาน: {product.factory} | ตัวแทน: {product.dealer}</p>
              </div>

              {/* ฟอร์มเลือกสถานะและสถานที่ */}
              <form onSubmit={(e) => handleUpdateStatus(product, e)} className="p-3 space-y-2 border border-gray-100 bg-gray-50 rounded-xl">
                <div className="flex gap-2">
                  <select name="status" className="flex-1 p-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- เลือกสถานะขนส่ง --</option>
                    <option value="IN TRANSIT">🚚 IN TRANSIT (กำลังจัดส่ง)</option>
                    <option value="IN WAREHOUSE">🏢 IN WAREHOUSE (ถึงคลังสินค้า)</option>
                    <option value="CUSTOMS CLEARED">🛂 CUSTOMS CLEARED (ผ่านศุลกากร)</option>
                    <option value="DELIVERED">✅ DELIVERED (ส่งมอบสำเร็จ)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input type="text" name="location" placeholder="ระบุสถานที่อัปเดต (เช่น ท่าเรือแหลมฉบัง)..." className="flex-1 p-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="submit" className="px-3 py-2 text-sm font-bold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700">
                    อัปเดต
                  </button>
                </div>
              </form>
              
              <button 
                onClick={() => onTrackProduct(product.lotId)}
                className="flex items-center justify-center w-full gap-2 py-2 mt-3 text-sm font-bold text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Search size={16} /> ดูประวัติ Blockchain ของสินค้านี้
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="text-gray-500">ไม่มีสินค้าในระบบ</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;