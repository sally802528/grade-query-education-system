const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 引入 User 模型
// ... 引入 Project, Message 模型

// --- 教師權限保護中間件 ---
const protectTeacher = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.id, role: decoded.role }; 

            // 嚴格檢查角色是否為 'teacher'
            if (req.user.role !== 'teacher') {
                return res.status(403).json({ message: '無權限存取：僅限教師' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Token 無效或已過期' });
        }
    }
    if (!token) {
        res.status(401).json({ message: '未授權，無 Token' });
    }
};

// --- 教師路由定義 ---

// GET /api/teacher/students - 獲取所有學生資料 (表格介面核心)
router.get('/students', protectTeacher, async (req, res) => {
    // 實際應從資料庫查詢所有 role: 'student' 的用戶
    const mockStudents = [
        { id: 1, userId: 'S2023001', name: '王小明', class: '資工一甲', email: 's001@school.edu', projectCount: 3, completedCount: 1, pendingReview: 1 },
        { id: 2, userId: 'S2023002', name: '李大華', class: '資工一甲', email: 's002@school.edu', projectCount: 3, completedCount: 2, pendingReview: 0 },
        // ...
    ];
    res.json(mockStudents);
});

// POST /api/teacher/students - 新增學生
router.post('/students', protectTeacher, async (req, res) => {
    const { userId, name, class, initialPassword } = req.body;
    // 實際應創建新的 User({ role: 'student', password: initialPassword })
    // 模擬成功
    res.status(201).json({ success: true, message: `已成功新增學生 ${name}` });
});

// PUT /api/teacher/students/:id - 編輯學生資料
router.put('/students/:id', protectTeacher, async (req, res) => {
    // 實際應更新 User 模型
    res.json({ success: true, message: '學生資料更新成功' });
});

// POST /api/teacher/assign - 分配新項目給學生
router.post('/assign', protectTeacher, async (req, res) => {
    const { studentIds, projectName, deadline, description } = req.body;
    // 實際應在 Project 模型中創建新紀錄，並鏈結到指定 studentIds
    // 模擬成功
    res.status(201).json({ success: true, message: `項目 "${projectName}" 已分配給 ${studentIds.length} 位學生` });
});

// GET /api/teacher/submissions - 獲取所有待審核的繳交作業
router.get('/submissions', protectTeacher, async (req, res) => {
    // 實際應查詢 Submission 模型中 status: '待審核' 的記錄
    const mockSubmissions = [
        { id: 501, projectId: 1, projectName: '期末報告', studentName: '王小明', studentId: 'S2023001', submissionUrl: '/files/report-s001.pdf', submittedAt: '2025-11-10' }
    ];
    res.json(mockSubmissions);
});

// PUT /api/teacher/review/:submissionId - 審核學生繳交 (通過/退回)
router.put('/review/:submissionId', protectTeacher, async (req, res) => {
    const { action, score, feedback } = req.body; // action: 'pass' 或 'reject'
    // 實際應更新 Submission 和 Project 模型中的狀態和分數
    res.json({ success: true, message: `審核操作成功：已標記為 ${action === 'pass' ? '通過' : '退回'}` });
});

// DELETE /api/teacher/messages/:messageId - 屏蔽學生留言 (刪除或軟刪除)
router.delete('/messages/:messageId', protectTeacher, async (req, res) => {
    // 實際應刪除或將 Message 模型中的 is_hidden 標記為 true
    res.json({ success: true, message: '留言已屏蔽/刪除' });
});

// GET /api/teacher/export - 製表功能 (匯出資料)
router.get('/export', protectTeacher, async (req, res) => {
    // 1. 查詢資料庫 (學生、項目、成績等)
    // 2. 使用第三方庫 (如 'exceljs') 將資料組合成 Excel 或 CSV
    // 3. 設定 HTTP Headers 讓瀏覽器下載檔案
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=grade_report.xlsx');
    // 模擬返回成功
    res.send({ success: true, message: '資料正在下載' }); 
});

module.exports = router;
