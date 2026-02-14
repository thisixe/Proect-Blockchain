import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Link2, Box, ArrowDown, Hash } from 'lucide-react';

const BlockchainExplorer = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/blocks');
        setBlocks(response.data);
      } catch (error) {
        console.error("Error fetching blocks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
  }, []);

  if (loading) return <div className="text-center py-10">กำลังดึงข้อมูล Global Blockchain...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in-up">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-gray-800 flex justify-center items-center gap-3">
          <Database className="text-blue-600" size={32} /> Global Blockchain Explorer
        </h2>
        <p className="text-gray-500 mt-2">แสดงการเชื่อมโยงข้อมูลของทุกสินค้าในระบบ (Global Ledger)</p>
      </div>

      <div className="flex flex-col items-center">
        {blocks.map((block, i) => (
          <React.Fragment key={block.hash}>
            {/* กล่อง Block */}
            <div className="bg-white border-2 border-gray-800 p-5 rounded-xl shadow-lg w-full max-w-2xl relative">
              <div className="absolute -top-3 -left-3 bg-gray-900 text-white font-bold w-10 h-10 flex items-center justify-center rounded-lg shadow-md">
                #{block.index}
              </div>
              
              <div className="ml-6 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</span>
                    <p className="text-sm font-medium">{new Date(block.timestamp).toLocaleString('th-TH')}</p>
                  </div>
                  {block.index === 0 ? (
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Genesis Block</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <Box size={12} /> {block.data?.item || "N/A"}
                    </span>
                  )}
                </div>

                <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">Previous Hash:</span>
                  </div>
                  <p className="text-xs font-mono text-gray-600 break-all">{block.previousHash}</p>
                  
                  <div className="flex items-center gap-2 mt-3 mb-1">
                    <Hash size={16} className="text-blue-500" />
                    <span className="text-xs font-bold text-blue-600">Block Hash:</span>
                  </div>
                  <p className="text-xs font-mono text-blue-700 font-bold break-all bg-blue-50 p-1 rounded">{block.hash}</p>
                </div>
              </div>
            </div>

            {/* ลูกศรเชื่อมโยงระหว่าง Block (ยกเว้น Block สุดท้าย) */}
            {i !== blocks.length - 1 && (
              <div className="py-2 flex flex-col items-center">
                <div className="w-1 h-6 bg-gray-400"></div>
                <ArrowDown className="text-gray-500 -mt-2" size={24} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BlockchainExplorer;