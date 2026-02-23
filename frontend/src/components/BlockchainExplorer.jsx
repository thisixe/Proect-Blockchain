import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Link2, Box, ArrowDown, Hash } from 'lucide-react';

const BlockchainExplorer = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get('http://localhost:5001/blocks');
        setBlocks(response.data);
      } catch (error) {
        console.error("Error fetching blocks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
  }, []);

  if (loading) return <div className="py-10 text-center">กำลังดึงข้อมูล Global Blockchain...</div>;

  return (
    <div className="max-w-4xl px-4 py-10 mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h2 className="flex items-center justify-center gap-3 text-3xl font-black text-gray-800">
          <Database className="text-blue-600" size={32} /> Global Blockchain Explorer
        </h2>
        <p className="mt-2 text-gray-500">แสดงการเชื่อมโยงข้อมูลของทุกสินค้าในระบบ (Global Ledger)</p>
      </div>

      <div className="flex flex-col items-center">
        {blocks.map((block, i) => (
          <React.Fragment key={block.hash}>
            {/* กล่อง Block */}
            <div className="relative w-full max-w-2xl p-5 bg-white border-2 border-gray-800 shadow-lg rounded-xl">
              <div className="absolute flex items-center justify-center w-10 h-10 font-bold text-white bg-gray-900 rounded-lg shadow-md -top-3 -left-3">
                #{block.index}
              </div>
              
              <div className="flex flex-col gap-2 ml-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Timestamp</span>
                    <p className="text-sm font-medium">{new Date(block.timestamp).toLocaleString('th-TH')}</p>
                  </div>
                  {block.index === 0 ? (
                    <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded">Genesis Block</span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded">
                      <Box size={12} /> {block.data?.item || "N/A"}
                    </span>
                  )}
                </div>

                <div className="p-3 mt-2 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">Previous Hash:</span>
                  </div>
                  <p className="font-mono text-xs text-gray-600 break-all">{block.previousHash}</p>
                  
                  <div className="flex items-center gap-2 mt-3 mb-1">
                    <Hash size={16} className="text-blue-500" />
                    <span className="text-xs font-bold text-blue-600">Block Hash:</span>
                  </div>
                  <p className="p-1 font-mono text-xs font-bold text-blue-700 break-all rounded bg-blue-50">{block.hash}</p>
                </div>
              </div>
            </div>

            {/* ลูกศรเชื่อมโยงระหว่าง Block (ยกเว้น Block สุดท้าย) */}
            {i !== blocks.length - 1 && (
              <div className="flex flex-col items-center py-2">
                <div className="w-1 h-6 bg-gray-400"></div>
                <ArrowDown className="-mt-2 text-gray-500" size={24} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BlockchainExplorer;