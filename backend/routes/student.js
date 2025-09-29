const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// --- 身份驗證中間件 ---
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 從 Header 取得 Token
            token = req.headers.authorization.split(' ')[1];
            
            // 驗證 Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 將用戶資訊掛載到請求上
            req.user = { id: decoded.id, role: decoded.role }; 

            // 檢查是否是學生
            if (req.user.role !== 'student') {
                return res.status(403).json({ message: '無權限存取' });
            }

            next(); // 繼續處理後續路由
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token 無效或已過期' });
        }
    }

    if (!token) {
        res.status(401).json({ message: '未授權，無 Token' });
    }
};

// --- 學生路由定義 ---

// GET /api/student/profile - 學生基本資料 (需登入)
router.get('/profile', protect, async (req, res) => {
    // 這裡應從資料庫查詢完整的學生資料，但暫時只返回 Token 中的資訊
    res.json({
        userId: 'S' + req.user.id, // 假設從 ID 組合
        name: '測試學生',
        class: '資工一甲',
        // 實際開發中需連接 User.findById(req.user.id).select('-password')
    });
});

// GET /api/student/projects - 獲取該學生的所有項目
router.get('/projects', protect, async (req, res) => {
    // 這裡應連接 Project 模型，並篩選屬於該學生的項目
    const mockProjects = [
        { id: 1, name: "期中報告", deadline: "2025-11-15", status: "待繳交", score: "N/A", teacher: "T999", requiredFile: true },
        { id: 2, name: "程式設計作業一", deadline: "2025-10-01", status: "已完成", score: 88, teacher: "T999", requiredFile: false },
        { id: 3, name: "期末專題", deadline: "2025-12-30", status: "待審核", score: "N/A", teacher: "T999", requiredFile: true },
    ];
    res.json(mockProjects);
});

// PUT /api/student/password - 更改密碼 (邏輯複雜，這裡僅展示接口)
router.put('/password', protect, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    // 1. 從資料庫取得用戶
    // 2. 驗證 oldPassword
    // 3. 使用 newPassword 重新 save 用戶 (會觸發加密 hook)
    res.json({ message: '密碼已成功更新！' });
});

module.exports = router;
