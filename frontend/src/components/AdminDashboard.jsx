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
      const response = await axios.get('http://localhost:5000/products');
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
      await axios.post('http://localhost:5000/chain', {
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

  if (loading) return <div className="text-center py-10 font-bold text-gray-500">กำลังโหลดข้อมูลคลังสินค้า...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in-up">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2">
        <Package className="text-blue-600" /> แดชบอร์ดจัดการสถานะสินค้า (Admin Only)
      </h2>

      {updateStatusInfo && (
        <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle className="w-5 h-5" />
          {updateStatusInfo}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
            {/* รูปภาพสินค้า & QR Code */}
            <div className="w-full sm:w-1/3 flex flex-col gap-2 shrink-0">
              <div className="h-32 bg-gray-100 rounded-xl overflow-hidden border">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">ไม่มีรูป</div>
                )}
              </div>
              
              {/* --- โค้ดเพิ่ม QR Code Generator (ดึงจาก API ฟรี ไม่ต้องลงปลั๊กอิน) --- */}
              <div className="bg-gray-50 p-2 rounded-xl border flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-500 mb-1">Scan to Track</span>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/?track=' + product.lotId)}`} 
                  alt="QR Code" 
                  className="w-20 h-20 rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* ข้อมูลและฟอร์มอัปเดต */}
            <div className="w-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                  <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Lot: {product.lotId}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">โรงงาน: {product.factory} | ตัวแทน: {product.dealer}</p>
              </div>

              {/* ฟอร์มเลือกสถานะและสถานที่ */}
              <form onSubmit={(e) => handleUpdateStatus(product, e)} className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
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
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition">
                    อัปเดต
                  </button>
                </div>
              </form>
              
              <button 
                onClick={() => onTrackProduct(product.lotId)}
                className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-sm transition flex justify-center items-center gap-2"
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