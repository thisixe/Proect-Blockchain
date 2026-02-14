import React from 'react';
import { Package, Truck, Home, UserCheck, Factory } from 'lucide-react';

const Timeline = ({ chain }) => {
  // ฟังก์ชันเลือกไอคอนตามสถานะ
  const getIcon = (status) => {
    if (status === 'MANUFACTURED') return <Factory size={20} className="text-white" />;
    if (status === 'IN_TRANSIT') return <Truck size={20} className="text-white" />;
    if (status === 'DELIVERED') return <UserCheck size={20} className="text-white" />;
    return <Package size={20} className="text-white" />;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📦 เส้นทางสินค้า (Blockchain History)</h2>
      <div className="relative border-l-4 border-blue-200 ml-3">
        {chain.map((block, index) => (
          <div key={block.hash} className="mb-8 ml-6 relative">
            {/* จุดกลมๆ ตรงเส้น */}
            <span className="absolute -left-10 bg-blue-500 rounded-full p-2 ring-4 ring-white">
              {getIcon(block.data.status)}
            </span>
            
            {/* การ์ดข้อมูล */}
            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  Block #{block.index}
                </span>
                <span className="text-gray-400 text-xs">{new Date(block.timestamp).toLocaleString()}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800">{block.data.status}</h3>
              <p className="text-gray-600">📍 {block.data.location?.address || 'Unknown Location'}</p>
              
              {/* ส่วนแสดง Hash */}
              <div className="mt-3 bg-gray-50 p-2 rounded text-xs font-mono break-all border">
                <p><span className="text-gray-500">Hash:</span> {block.hash}</p>
                <p><span className="text-gray-500">Prev:</span> {block.previousHash}</p>
              </div>

              {/* ส่วนแสดงลายเซ็น (ถ้ามี) */}
              {block.data.signature && block.data.signature !== 'none' && (
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">✍️ Digital Signature:</p>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div> 
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;