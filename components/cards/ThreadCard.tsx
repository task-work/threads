//* eslint-disable react/jsx-key */
import Link from "next/link";
import Image from "next/image";
import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface Props {
    id: string;
    currentUserId: string;
    parentId: string | undefined | null;
    content: string
    author: {
        name: string;
        image: string;
        id: string;
    },
    community: {
        id: string;
        name: string;
        image: string;
    } | null;
    createAt: string
    comments: {
        author: {
            image: string;
        }
    }[],
    isComment? : boolean;
}

const ThreadCard = ({
    id,
    currentUserId,
    parentId,
    content,
    author,
    community,
    createAt,
    comments,
    isComment,
}: Props) => {
    return(
        <article className={`flex w-full flex-col rounded-xl ${isComment ? 'px-0 sm:px-7' : 'bg-dark-2 p-7'}`}>
            <div className="flex items-start justify-between">
                <div className="flex w-full flex-1 flex-row gap-4">
                    <div className="flex flex-col items-center">
                        <Link href={`/profile/${author.id}`}>
                            <Avatar className="w-11 h-11 cursor-pointer bg-gray-50">
                                <AvatarImage src={author.image} alt="Profile image" />
                            </Avatar>
                        </Link>

                        <div className="thread-card_bar" /> 
                    </div>

                    <div className="flex w-full flex-col">
                        <div className="flex justify-between">
                            <Link href={`/profile/${author.id}`} className="w-fit">
                                <h4 className="cursor-pointer text-base-semibold text-light-1">{author.name}</h4>
                            </Link>
                            <span className="text-light-1">
                                {
                                    !community && (
                                        <span className="text-gray-1 text-subtle-medium">{formatDateString(createAt)}</span>
                                    )
                                }
                            </span>
                        </div>
                        <p className="mt-2 text-small-regular text-light-2">{content}</p>
                        {/* {帖子操作按钮} */}
                        <div className={`${isComment && 'mb-10'} mt-5 flex flex-col gap-3`}>
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex gap-3.5">
                                    <Image src="/assets/heart-gray.svg" alt="heart" title="heart" width={24} height={24} className="cursor-pointer object-contain" />
                                    <Link href={`/thread/${id}`}>
                                        <Image src="/assets/reply.svg" alt="reply" title="reply" width={24} height={24} className="cursor-pointer object-contain hover:scale-120" />
                                    </Link>
                                    <Image src="/assets/repost.svg" alt="repost" title="repost" width={24} height={24} className="cursor-pointer object-contain" />
                                    <Image src="/assets/share.svg" alt="share" title="share" width={24} height={24} className="cursor-pointer object-contain" />
                                </div>
                                {/** TDELETE thread */}
                                <DeleteThread
                                    threadId={JSON.stringify(id)}
                                    currentUserId={currentUserId}
                                    authorId={author.id}
                                    parentId={parentId}
                                    isComment={isComment}
                                />
                            </div>
                            
                            {
                                //展示评论
                                isComment && comments.length > 0 && (
                                    <Link href={`/thread/${id}`}>
                                        <p className="mt-1 text-subtle-medium text-gary-1">{comments.length} replies</p>
                                    </Link>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
            {/** Show comment logos */}
            {
                !isComment && comments.length > 0 && (
                    <div className='ml-1 mt-3 flex items-center gap-2'>
                        <div className="flex -space-x-3 *:bg-gray-1 *:w-6 *:h-6">
                           {    
                                //去重
                                comments.filter((c, index, arr) =>
                                    index === arr.findIndex(item => item.author.image === c.author.image)
                                ).slice(0, 3).map((comment, index) => (
                                    <Avatar key={`avatar_${index}`}>
                                        <AvatarImage key={index} src={comment.author.image} alt={`user_${index}`} />
                                    </Avatar>
                                ))
                                
                           }
                        </div>
                        {
                            comments.length >= 3 && (<p className="text-subtle-medium text-gray-1">...</p>)
                        }
                        <Link href={`/thread/${id}`}>
                            <p className='mt-1 text-subtle-medium text-gray-1'>
                                {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                            </p>
                        </Link>
                    </div>
                )
            }

            {
                !isComment && community && (
                    <Link href={`/communities/${community.id}`} className="mt-5 flex items-center">
                        <p className="text-subtle-medium text-gray-1">
                            {formatDateString(createAt)} - {community.name} Community
                        </p>
                        <Avatar className="w-4 h-4 ml-2">
                            <AvatarImage src={community.image} alt={community.name} />
                        </Avatar>
                    </Link>
                )
            }
        </article>
    );
}

export default ThreadCard;