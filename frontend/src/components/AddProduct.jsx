import React, { useState } from 'react';
import axios from 'axios';
import { PackagePlus, Save, CheckCircle } from 'lucide-react';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '', price: '', image: '', factory: '', dealer: '', lotId: '', description: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      // 1. บันทึกสินค้าลงฐานข้อมูล (Shop)
      await axios.post('http://localhost:5001/products', formData);

      // 2. สร้าง Genesis Block (ประวัติเริ่มต้นใน Blockchain) ทันที
      await axios.post('http://localhost:5001/chain', {
        data: {
          product_id: formData.lotId,
          item: formData.name,
          status: "MANUFACTURED",
          location: { address: formData.factory },
          factory: formData.factory,
          dealer: formData.dealer,
          sender: "System Admin",
          receiver: "Warehouse"
        }
      });

      setStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', price: '', image: '', factory: '', dealer: '', lotId: '', description: '' }); // เคลียร์ฟอร์ม
      
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000); // ซ่อนข้อความสำเร็จหลัง 3 วินาที

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
  };

  return (
    <div className="max-w-2xl px-4 py-10 mx-auto animate-fade-in-up">
      <div className="p-8 bg-white border border-gray-100 shadow-lg rounded-2xl">
        <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-800">
          <PackagePlus className="text-blue-600" /> เพิ่มสินค้าใหม่เข้าคลัง
        </h2>

        {status.success && (
          <div className="flex items-center gap-2 p-4 mb-6 font-medium text-green-700 bg-green-50 rounded-xl">
            <CheckCircle /> เพิ่มสินค้าและสร้างประวัติลง Blockchain สำเร็จ!
          </div>
        )}
        
        {status.error && (
          <div className="p-4 mb-6 font-medium text-red-700 bg-red-50 rounded-xl">{status.error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-bold text-gray-700">ชื่อสินค้า *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="เช่น iPhone 15 Pro" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-bold text-gray-700">รหัสสินค้า (Lot ID) *</label>
              <input type="text" name="lotId" required value={formData.lotId} onChange={handleChange} className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="เช่น IP15-ABC-123" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-bold text-gray-700">ราคา (บาท) *</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="เช่น 41900" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-bold text-gray-700">ลิงก์รูปภาพ (URL)</label>
              <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
            </div>
            <div>
              <label className="block mb-1 text-sm font-bold text-gray-700">โรงงานผู้ผลิต</label>
              <input type="text" name="factory" value={formData.factory} onChange={handleChange} className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="เช่น Foxconn" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-bold text-gray-700">ตัวแทนจำหน่าย</label>
              <input type="text" name="dealer" value={formData.dealer} onChange={handleChange} className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="เช่น iStudio" />
            </div>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">รายละเอียดสินค้า</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="อธิบายจุดเด่นของสินค้า..."></textarea>
          </div>

          <button type="submit" disabled={status.loading} className="flex items-center justify-center w-full gap-2 px-4 py-3 font-bold text-white transition bg-blue-600 hover:bg-blue-700 rounded-xl">
            {status.loading ? "กำลังบันทึก..." : <><Save size={20} /> บันทึกสินค้าเข้าสู่ระบบ</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;