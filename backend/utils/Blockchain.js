const SHA256 = require("crypto-js/sha256");

class Blockchain {
    // คำนวณ Hash (รวมข้อมูลทุกอย่างเพื่อล็อคค่า)
    static calculateHash(index, previousHash, timestamp, data) {
        return SHA256(index + previousHash + timestamp + JSON.stringify(data)).toString();
    }

    // ตรวจสอบความถูกต้อง (Validation Loop)
    static isChainValid(chain) {
        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i];
            const previousBlock = chain[i - 1];

            // 1. ตรวจสอบว่าข้อมูลใน Block ถูกแอบแก้หรือไม่?
            const recalculatedHash = this.calculateHash(
                currentBlock.index,
                currentBlock.previousHash,
                currentBlock.timestamp,
                currentBlock.data
            );

            if (currentBlock.hash !== recalculatedHash) {
                console.log(`Invalid Block Content at Index ${currentBlock.index}`);
                return false;
            }

            // 2. ตรวจสอบว่าโซ่ขาดหรือไม่?
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Broken Chain at Index ${currentBlock.index}`);
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain;