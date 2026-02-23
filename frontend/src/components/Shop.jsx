import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, ShieldCheck } from 'lucide-react';

// รับ currentUser มาจาก App.jsx ด้วย
const Shop = ({ onTrackProduct, currentUser }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyStatus, setBuyStatus] = useState(''); // เอาไว้โชว์ข้อความตอนซื้อสำเร็จ

  // ดึงข้อมูลสินค้าจาก Backend
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

  // ฟังก์ชันกดสั่งซื้อสินค้า (สร้าง Block ใหม่ลง Blockchain)
  const handleBuy = async (product) => {
    if (!window.confirm(`ยืนยันการสั่งซื้อ ${product.name} ใช่หรือไม่?`)) return;

    try {
      // ยิง API ไปสร้าง Block ที่ 2 (อัปเดตสถานะเป็น SOLD)
      await axios.post('http://localhost:5001/chain', {
        data: {
          product_id: product.lotId,
          item: product.name,
          status: "SOLD",
          location: { address: "จัดส่งให้ลูกค้า" }, // สมมติที่อยู่
          factory: product.factory,
          dealer: product.dealer,
          sender: product.dealer || "Store",
          receiver: currentUser.username // บันทึกชื่อคนซื้อลง Blockchain!
        }
      });

      setBuyStatus(`สั่งซื้อ ${product.name} สำเร็จ! ข้อมูลถูกบันทึกลง Blockchain แล้ว`);
      setTimeout(() => setBuyStatus(''), 4000); // ซ่อนข้อความหลัง 4 วิ
      
      // ทางเลือกเพิ่มเติม: ถ้าอยากให้ของหายไปจากหน้าร้านหลังซื้อ ก็ยิง API ไปลบ/อัปเดตสถานะในตาราง products ได้ครับ
      // แต่ตอนนี้ปล่อยโชว์ไว้ก่อน จะได้กด Track ดูได้ง่ายๆ

    } catch (error) {
      console.error("Buy error:", error);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ");
    }
  };

  if (loading) return <div className="py-10 text-center">กำลังโหลดสินค้า...</div>;

  return (
    <div className="max-w-6xl px-4 py-10 mx-auto">
      <h2 className="flex items-center gap-2 mb-8 text-3xl font-bold text-gray-800">
        <ShoppingCart className="text-blue-600" /> สินค้าในระบบ Supply Chain
      </h2>

      {buyStatus && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 font-medium text-green-700 border border-green-200 bg-green-50 rounded-xl animate-fade-in-up">
          <ShieldCheck className="w-5 h-5" />
          {buyStatus}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product._id} className="overflow-hidden transition bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
            <div className="relative h-48 bg-gray-100">
              {product.image ? (
                <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">ไม่มีรูปภาพ</div>
              )}
              <div className="absolute px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg top-2 right-2">
                Lot: {product.lotId}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="mb-1 text-xl font-bold text-gray-900">{product.name}</h3>
              <p className="mb-4 text-sm text-gray-500 line-clamp-2">{product.description || "ไม่มีรายละเอียด"}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-orange-600">
                  ฿{product.price ? product.price.toLocaleString() : '0'}
                </span>
                <span className="text-xs text-gray-400">จาก: {product.factory || 'ไม่ระบุ'}</span>
              </div>

              <div className="flex gap-2">
                {/* ปุ่มตรวจสอบเส้นทาง (มีอยู่แล้ว) */}
                <button 
                  onClick={() => onTrackProduct(product.lotId)}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-2 font-bold text-gray-800 transition bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  <Search size={18} /> ตรวจสอบ
                </button>

                {/* ปุ่มสั่งซื้อสินค้า (เพิ่มใหม่) จะโชว์ให้กดได้ทุกคน แต่บันทึกชื่อ currentUser */}
                <button 
                  onClick={() => handleBuy(product)}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-2 font-bold text-white transition bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  <ShoppingCart size={18} /> สั่งซื้อ
                </button>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="py-10 text-center text-gray-500 col-span-full">
            ยังไม่มีสินค้าในระบบ (ให้ Admin เพิ่มสินค้าเข้ามาก่อนนะ)
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;