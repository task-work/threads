import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: String,
    bio: String,
    //一个用户会有多个帖子
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tread'
        }
    ],
    //onboarded 状态（创建账号后，必须完成注册流程）
    onboarded: {
        type: Boolean,
        default: false
    },
    //一个用户可以关联多个社区
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community'
        }
    ]
});

//第一次调用时User的实例并不存在，所以会从userSchema创建
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;