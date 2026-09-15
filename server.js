<<<<<<< HEAD
// ตัวอย่างสำหรับ server.js หรือ index.js
const express = require('express');
const path = require('path');
const app = express();

// กำหนดพอร์ตโดยให้ความสำคัญกับ Environment Variable ของ Render ก่อน
const PORT = process.env.PORT || 3000;

// เสิร์ฟไฟล์ static 
app.use(express.static(path.join(__dirname, 'public')));

// ส่งหน้า Under Construction เป็นหน้าหลัก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'under-construction.html'));
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`J.A.R.V.I.S. Protocol active on port ${PORT}`);
=======
// ตัวอย่างสำหรับ server.js หรือ index.js
const express = require('express');
const path = require('path');
const app = express();

// กำหนดพอร์ตโดยให้ความสำคัญกับ Environment Variable ของ Render ก่อน
const PORT = process.env.PORT || 3000;

// เสิร์ฟไฟล์ static 
app.use(express.static(path.join(__dirname, 'public')));

// ส่งหน้า Under Construction เป็นหน้าหลัก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'under-construction.html'));
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`J.A.R.V.I.S. Protocol active on port ${PORT}`);
>>>>>>> 9b33230c94799db1862c65987b2f8218f458ce30
});