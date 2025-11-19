import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({

    //帖子内容
    text: {type: String, required: true},  
    //作者                     
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    //所属社区
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    //父级id
    parentId: {
        type: String
    },
    //评论
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ]
});

//第一次调用时User的实例并不存在，所以会从userSchema创建
const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);

export default Thread;