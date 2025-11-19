"use server"

import { FilterQuery, SortOrder } from "mongoose";
import { connectToDB } from "../mongoose";
import User from "../models/user.models";
import Thread from "../models/thread.models";
import Community from "../models/community.models";

interface Params {
    id: string,
    username: string,
    name: string,
    bio: string,                        //简介
    image: string,                      //头像
    createById: string
}

// 创建社区
export async function createCommunity(params: Params) {
    try {
        connectToDB();
        const user = await User.findOne({id: params.createById});
        if(!user) {
            throw new Error("User not found");
        }

        const newCommunity = new Community({
            id: params.id,
            name: params.name,
            username: params.username,
            image: params.image,
            bio: params.bio,
            createBy: user._id
        });

        const createdCommunity = await newCommunity.save();
        user.communities.push(createdCommunity._id);
        await user.save();

        return createdCommunity;

    } catch(error: unknown) {
        if(error instanceof Error) {
            throw new Error(`create community error: ${error.message}`);
        }
        throw new Error("Failed by create community: unknow");
    }
}

// 根据id社区详细信息
export async function fetchCommunityDetails(id: string) {
    try {
        connectToDB();
        const communityDetails = await Community.findOne({id}).populate([
            "createBy",
            {
                path: 'members',
                model: User,
                select: "name username image _id id"
            }
        ]);
        return communityDetails;
    } catch (error: unknown) {
        if(error instanceof Error) {
            throw new Error(`fetching community's detail error: ${error.message}`);
        }
        throw new Error("Failed by search community: unknow");
    }
}

// 根据社区id获取社区帖子
export async function fetchCommunityPosts(id: string) {
    try {
        connectToDB();
        const communityPosts = await Community.findById(id).populate({
            path: 'threads',
            model: Thread,
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                },
                {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'image _id'
                    }
                }
            ]
        });
        return communityPosts;
    } catch (error: unknown) {
        if(error instanceof Error) {
            throw new Error(`fetching community's threads error: ${error.message}`);
        }
        throw new Error("Failed by fetching community's threads: unknow");
    }
}

// 分页查询社区
export async function fetchCommunities({searchString = "", pageNumber = 1, pageSize = 20, sortBy = 'desc'} : {
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;
        const regex = new RegExp(searchString, "i");
        const query: FilterQuery<typeof Community> = {};

        if(searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }

        const sortOptions = { createdAt: sortBy };

        const communityQuery = Community.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize).populate('members');

        const totalCommunitiesCount = await Community.countDocuments(query);

        const communities = await communityQuery.exec();

        const isNext = totalCommunitiesCount > (skipAmount + communities.length);

        return { communities, isNext };

    } catch (error: unknown) {
        if(error instanceof Error) {
            throw new Error(`fetching community by search key error: ${error.message}`);
        }
        throw new Error("Failed by search community: unknow");
    }
}

// 加入新成员到社区
export async function addMemberToCommunity(communityId: string, memberId: string) {
    try {
        connectToDB();

        const community = await Community.findOne({id: communityId});
        if(!community) {
            throw new Error("Community not found");
        }

        const user = await User.findOne({id: memberId});
        if(!user) {
           throw new Error("User not found"); 
        }

        if(community.members.includes(user._id)) {
            throw new Error("User is already a member of the community");
        }

        community.members.push(user._id);
        await community.save();

        user.communities.push(community._id);
        await user.save();

        return community;

    } catch (error: unknown) {
        if(error instanceof Error) {
            throw new Error(`user add community error: ${error.message}`);
        }
        throw new Error("Failed by user add community: unknow");
    }
}

// 删除社区
export async function deleteCommunity(communityId: string) {
    try {
        connectToDB();
        const deletedCommunity = await Community.findOneAndDelete({
            id: communityId,
        });

        if (!deletedCommunity) {
            throw new Error("Community not found");
        }

        // Delete all threads associated with the community
        await Thread.deleteMany({ community: communityId });

        // Find all users who are part of the community
        const communityUsers = await User.find({ communities: communityId });

        // Remove the community from the 'communities' array for each user
        const updateUserPromises = communityUsers.map((user) => {
            user.communities.pull(communityId);
            return user.save();
        });
        await Promise.all(updateUserPromises);
        return deletedCommunity;
    } catch (error: unknown) {
        if(error instanceof Error) {
            throw new Error(`delete a community error: ${error.message}`);
        }
        throw new Error("Failed by delete community: unknow");
    }
}

// 更新社区信息
export async function updateCommunityInfo(communityId: string, name: string, username: string, image: string) {
    try {
        connectToDB();
        const updatedCommunity = await Community.findOneAndUpdate(
            { id: communityId },
            { name, username, image }
        );

        if (!updatedCommunity) {
            throw new Error("Community not found");
        }
        return updatedCommunity;

    } catch (error) {
        if(error instanceof Error) {
            throw new Error(`update community information error: ${error.message}`);
        }
        throw new Error("Failed by update community: unknow");
    }
}


export async function removeUserFromCommunity(userId: string, communityId: string) {
    try {
        connectToDB();

        const userIdObject = await User.findOne({ id: userId }, { _id: 1 });

        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        if (!userIdObject) {
            throw new Error("User not found");
        }

        if (!communityIdObject) {
            throw new Error("Community not found");
        }

        // Remove the user's _id from the members array in the community
        await Community.updateOne(
            { _id: communityIdObject._id },
            { $pull: { members: userIdObject._id } }
        );

        // Remove the community's _id from the communities array in the user
        await User.updateOne(
            { _id: userIdObject._id },
            { $pull: { communities: communityIdObject._id } }
        );
        return { success: true };
    } catch (error) {
        if(error instanceof Error) {
            throw new Error(`Remove user for community error: ${error.message}`);
        }
        throw new Error("Failed by reemove community's user: unknow");
    }
}
