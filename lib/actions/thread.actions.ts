/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.models";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import { text } from "stream/consumers";
import Community from "../models/community.models";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

//创建帖子
export async function createThread({text, author, communityId, path}: Params) {
    try {
        connectToDB();
        /** 
         * 查用户，获取 ObjectId
         * 因为 mongodb 的 主键 默认是 _id，创建用户时 clerk 的 userId 存入的是自定义的 id 字段
         * 所以要先通过 id 查询用户记录，再将该记录的 _id 字段的值 传递给 author 参数(ObjectId 类型)
         * 这里与原教程有差异，原教程是直接传入 clerk 的 userId, 在create 时会自动转换成 ObjectId
         * 
         * 因此，如果用自定义的属性查询，则需要指定属性名称
         * **/
        const user = await User.findOne({ id: author });                    // 业务 ID
        if (!user) throw new Error("User not found");

        const communityIdObject = await Community.findOne({id: communityId}, {_id: 1});
        const createThread = await Thread.create({
            text,
            author: user._id,
            community: communityIdObject
        });

        //推送给创建帖子的用户（该推送非网络消息推送，而是把创建的帖子推送至作者本人的模型(User中的 thread 字段), 即所有用户都拥有自己发布的帖子）
        await User.findByIdAndUpdate(user._id, {$push: {threads: createThread._id}});

        if(communityIdObject) {
            //update community model
            await Community.findByIdAndUpdate(communityIdObject, {$push: {threads: createThread._id}});
        }
        revalidatePath(path);
    }
    catch(error: unknown) {
        if(error instanceof Error) {
            throw new Error(`Create Thread Error, ${error.message}`);
        }
        throw new Error('Create Thread Error');
    }
}

//查询帖子（分页）
export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();
    try {
        const skipAmount = (pageNumber -1 ) * pageSize;


        //获取顶级的帖子
        const postQuery = Thread.find({
            parentId: {$in: [null, undefined]}                         //父级id为空或未定义 
        })
        .sort({createAt: 'desc'})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({path: 'author', model: User})                        //附加作者信息
        .populate({path: 'community', model: Community})                //社区信息
        .populate({                                                     //附加评论信息    
            path: 'children',
            populate: {                                                 //附加评论的作者信息
                path: 'author',
                model: User,
                select: '_id name parentId image'
            }
        });

        //顶级帖子总数
        const totalPostsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}});

        const posts = await postQuery.exec();

        //是否还有下一页
        const isNext = totalPostsCount > skipAmount + posts.length;

        return { posts, isNext };
    }
    catch(error: unknown) {
        if(error instanceof Error) {
            throw new Error(`query threads is error, ${error.message}`);
        }
        throw new Error("query threads is error");
    }
}

//通过id获取帖子
export async function fetchThreadById(id: string) {
    connectToDB();

    try {
        //TODO Populate community
        const thread = await Thread.findById(id).populate({
            path: 'author',
            model: 'User',
            select: "_id id name image"
        }).populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                },
                {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    }
                }
            ]
        }).exec();
        return thread;
    }
    catch(error) {
        if(error instanceof Error) {
            throw new Error(`query thread by id is error, ${error.message}`);
        }
        throw new Error("query threads by id is error");
    }
}

//添加评论
export async function addCommentToThread(threadId: string, commenText: string, userId: string, path: string) {
    connectToDB();
    try{
        //1. 找到原贴
        const originalThread = await Thread.findById(threadId);
        if(!originalThread) {
            throw new Error('Thread not found');
        }

        //2. 创建新贴
        const commentThread = new Thread({
            text: commenText,
            author: userId,
            parentId: threadId
        });

        //3. 保存新帖子
        const saveCommentThread = await commentThread.save();

        //4. 推送评论至原帖子
        originalThread.children.push(saveCommentThread._id);

        //5. 保存原帖子
        await originalThread.save();

        //6. 验证路径，使添加立即生效
        revalidatePath(path);
    }
    catch(error) {
        if(error instanceof Error) {
            throw new Error(`add comment is error, ${error.message}`);
        }
        throw new Error("add comment is error");
    }
}

export async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });
    const descendantThreads = await Promise.all(
        childThreads.map((child) => fetchAllChildThreads(child._id.toString()))
    )
    const descendants = descendantThreads.flat();
    return [...childThreads, ...descendants];
}


//删除帖子
export async function deleteThread(id: string, path: string): Promise<void> {
    try {
        connectToDB();
        const mainThread = await Thread.findById(id).populate("author community");
        if (!mainThread) {
            throw new Error("Thread not found");
        }

        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread._id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
        [
            ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
            mainThread.author?._id?.toString(),
        ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
        [
            ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
            mainThread.community?._id?.toString(),
        ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );
        revalidatePath(path);

    } catch (error) {
        if(error instanceof Error) {
            throw new Error(`delete thread is error, ${error.message}`);
        }
        throw new Error("failed to delete thread");
    }
}