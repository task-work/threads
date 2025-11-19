"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import { FilterQuery, SortOrder } from "mongoose";
import Thread from "../models/thread.models";

interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,                        //简介
    image: string,                      //头像
    path: string                        //路径
}

export async function updateUser({
    userId, 
    username,
    name,
    bio,                    
    image,              
    path   
}: Params): Promise<void> {
    connectToDB();

    try {
        await User.findOneAndUpdate(
        { id: userId },
        {
            username: username.toLowerCase(),
            name,
            bio,
            image,
            onboarded: true
        },
        {upsert: true, new: true}                          //更新和插入，返回更新后的数据
    );
    
    if(path === '/profile/edit') {
        revalidatePath(path);                   //验证与特定路径相关联的数据（nextjs.org 文档）
    }
    } catch(error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to create/update user: ${error.message}`);
        }
        throw new Error('Failed to create/update user: Unknown error');
    }
    
}

export async function fetchUserById(userId: string) {
    try {
        connectToDB();
        return await User.findOne({id: userId});
    }
    catch(error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to create/update user: ${error.message}`);
        }
        throw new Error('Failed to create/update user: Unknown error');
    }
}

export async function fetchUser(id: string) {
    try {
        connectToDB();
        return await User.findOne({id});
    }
    catch(error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to create/update user: ${error.message}`);
        }
        throw new Error('Failed to create/update user: Unknown error');
    }
}

//根据用户id 查询该用户的帖子
export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        //Find all threads authored by user with the given userId
        //TODO Populate Community
        const threads = await User.findOne({id: userId}).populate({
            path: 'threads',
            model: 'Thread',
            populate: {
                path: 'children',
                model: 'Thread',
                populate: {
                    path: 'author',
                    model: 'User',
                    select: "name image id"
                }
            }
        })
        return threads;
    }
    catch(error) {
        if (error instanceof Error) {
            throw new Error(`search user's threads error: ${error.message}`);
        }
        throw new Error('Failed to search user\'s threads');
    }
}

//根据关键字查询用户
export async function fetchUsers(
    {userId, searchString, pageNumber = 1, pageSize = 20, sortBy='desc'} : 
    {userId: string; searchString?: string; pageNumber? : number;  pageSize? : number; sortBy?: SortOrder}
) {
    try {
        connectToDB();
        const skipAmount = (pageNumber - 1) * pageSize;
        const regex = new RegExp(searchString!, "i")         //不区分大小写

        const query: FilterQuery<typeof User> = {            //查询条件对象
            id: {$ne: userId}                                //不等于userId (不等于当前用户)
        }

        if(searchString?.trim() != '') {
            query.$or = [                                    //按名字或用户名搜索
                {username: {$regex: regex}},
                {name: {$regex: regex}}
            ]
        }

        const sortOptions = { createdAt: sortBy };
        const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);
        const totalUsersCount = await User.countDocuments(query);
        const users = await usersQuery.exec();

        //是否有下一页
        const isNext = totalUsersCount > (skipAmount + users.length);

        return { users, isNext };
    }
    catch(error) {
        if (error instanceof Error) {
            throw new Error(`Find user by search key error: ${error.message}`);
        }
        throw new Error('failed to fetch');
    }
}

//根据用户id获取所有用户活动
export async function getActivity(userId: string) {
    try {
        connectToDB();
        const userThreads = await Thread.find({author: userId});
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []);
        const replies = await Thread.find({
            _id: { $in:  childThreadIds},
            author: { $ne: userId }
        }).populate({
            path: 'author',
            model: 'User',
            select: 'name image _id'
        });
        return replies;
    } catch(error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get user activites: ${error.message}`);
        }
        throw new Error('Failed to get user activites error');
    }
}
