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
// ... (接續 protect 中間件和 GET /profile, GET /projects 路由)

// GET /api/student/projects/:id - 獲取單個項目詳情及留言
router.get('/projects/:id', protect, async (req, res) => {
    const projectId = req.params.id;
    // 實際應從資料庫查詢項目和相關留言
    const mockProjectDetail = { 
        id: projectId,
        name: "期末報告",
        description: "請提交一份關於本學期課程重點的專題報告，格式不限。",
        deadline: "2025-12-20",
        status: "待繳交",
        current_submission_url: null, // 假設尚未繳交
        messages: [ // 模擬留言
            { id: 101, authorId: 'T999', authorName: '系統管理員(師)', role: 'teacher', content: '大家好，有任何疑問可以在此留言。', timestamp: '2025-10-10 10:00' },
            { id: 102, authorId: 'S2023001', authorName: '測試學生', role: 'student', content: '請問報告需要頁數限制嗎？', timestamp: '2025-10-10 10:30' },
        ]
    };
    res.json(mockProjectDetail);
});

// POST /api/student/messages/:projectId - 學生新增留言
router.post('/messages/:projectId', protect, async (req, res) => {
    const { content } = req.body;
    const projectId = req.params.projectId;
    const authorId = req.user.id; // 從 JWT 取得用戶 ID
    
    // 實際應將留言存入 Message 模型
    // 模擬成功
    const newMessage = { id: Date.now(), authorId: authorId, authorName: '測試學生', role: 'student', content: content, timestamp: new Date().toLocaleString() };
    
    // 返回包含新留言的列表，以便前端更新介面
    const updatedMessages = [
        // 這裡應包含舊留言 + 新留言
        ...[/* 舊留言 */], newMessage
    ];
    res.status(201).json({ success: true, message: '留言成功', messages: updatedMessages });
});

// DELETE /api/student/messages/:messageId - 學生撤回留言
router.delete('/messages/:messageId', protect, async (req, res) => {
    const messageId = req.params.messageId;
    const studentId = req.user.id;

    // 實際應：
    // 1. 查詢該留言 (Message.findById(messageId))
    // 2. 檢查留言的 authorId 是否等於 studentId (只能撤回自己的)
    // 3. 執行 Message.findByIdAndDelete(messageId)
    
    // 模擬成功
    res.json({ success: true, message: '留言已撤回' });
});

// POST /api/student/submit/:projectId - 繳交檔案 (需要檔案上傳庫，如 multer)
// 注意：檔案上傳較為複雜，需要使用 multer 和雲端儲存服務。這裡僅展示接口邏輯。
router.post('/submit/:projectId', protect, async (req, res) => {
    // 實際應使用 multer 處理 req.file 
    // 1. 將檔案存入雲端 (例如 AWS S3)
    // 2. 更新 Project 或 Submission 模型中的 submission_url 和 status = '待審核'
    
    // 模擬成功
    res.json({ success: true, message: '檔案繳交成功，等待教師審核' });
});
module.exports = router;
