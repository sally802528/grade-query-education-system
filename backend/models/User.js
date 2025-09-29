// backend/models/User.js (接續 server.js 中的 require)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // 用於密碼加密

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], default: 'student' },
    name: { type: String, required: true },
    class: { type: String },
    // 個人資料的加密處理: 這裡僅對密碼加密，其他資料保持明文以方便查詢
});

// 密碼雜湊加密 (Bcrypt)
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 密碼比對方法
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
