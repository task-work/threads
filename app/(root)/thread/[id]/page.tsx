import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUserById } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation';

/**
 * 从url中获取参数
 * Next.js 14 及以后的版本，params 是一个 Promise，此处与原教程不同
 * 
 *  **/
const Page = async ({ params }: {params: Promise<{ id: string }>}) => {

    const { id } = await params;
    if(!id) return null;

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUserById(user.id);
    if(!userInfo?.onboarded) redirect('/onboarding');

    const thread = await fetchThreadById(id);

    return (
        <section className="relative">
            <div>
                <ThreadCard
                    key={thread._id} 
                    id={thread._id} 
                    currentUserId={user?.id || ''} 
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createAt={String(thread.createAt)}
                    comments={thread.children} />
            </div>
            {/* {评论区域} */}
            <div className="mt-7">
                <Comment
                    threadId={id}
                    currentUserImg={userInfo.image}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
            </div>
            
            {/* {评论列表} */}
            <div className="mt-10">
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    thread.children.map((item: any) => (
                        <ThreadCard
                            key={item._id} 
                            id={item._id} 
                            currentUserId={user.id} 
                            parentId={item.parentId}
                            content={item.text}
                            author={item.author}
                            community={item.community}
                            createAt={String(thread.createAt)}
                            comments={item.children}
                            isComment />
                    ))
                }
            </div>
        </section>
    );
}

export default Page;