const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
    index: { type: Number, required: true },
    timestamp: { type: String, required: true },
    data: {
        product_id: String,      // เช่น SN-001
        sender: String,          // เช่น Factory A
        receiver: String,        // เช่น Warehouse
        location: {              // พิกัดแผนที่
            lat: Number,
            lng: Number,
            address: String
        },
        status: String,          // Manufactured, Shipped, Delivered
        signature: String        // รูป Base64 ลายเซ็นลูกค้า (ถ้ามี)
    },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true }
});

module.exports = mongoose.model('Block', BlockSchema);