// 安裝依賴: npm install express dotenv mongoose bcryptjs jsonwebtoken cors
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors'); // 讓前端可以跨域存取後端 API

// 載入環境變數
dotenv.config();

// --- 伺服器設定 ---
const app = express();
app.use(express.json()); // 啟用 Body Parser 來解析 JSON 請求
app.use(cors()); // 啟用 CORS

// --- 資料庫連接 ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB 連接成功!');
    } catch (error) {
        console.error(`MongoDB 連接錯誤: ${error.message}`);
        process.exit(1); // 連接失敗則退出程序
    }
};
connectDB();

// --- 載入模型 (需先創建) ---
const User = require('./models/User'); 
const Project = require('./models/Project');
const Message = require('./models/Message');

// --- 載入路由 ---
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');

// --- 註冊路由 ---
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

// 根路由測試
app.get('/', (req, res) => {
    res.send('API 運行中...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`伺服器運行於 http://localhost:${PORT}`));

// --- 初始化管理員帳號 (首次運行時使用) ---
const initializeData = async () => {
    try {
        // 如果資料庫中沒有使用者，就創建一個教師帳號
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const teacher = new User({
                userId: 'T999',
                password: 'password123', // 在保存時會被加密
                role: 'teacher',
                name: '系統管理員'
            });
            await teacher.save();
            console.log('已創建預設教師帳號: T999 / password123');
        }
    } catch (error) {
        console.error('初始化資料失敗:', error);
    }
}
// initializeData(); // 取消註釋並運行一次來初始化資料
