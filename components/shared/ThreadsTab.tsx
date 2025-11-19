import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

interface Props {
    currentUserId: string;          // clerk user id
    accountId: string;              // mongodb user _id
    accountType: string;            // 用户类型
}

const ThreadsTab = async ({currentUserId, accountId, accountType}: Props) => {
    const result = await fetchUserPosts(accountId);
    if(!result) redirect('/');
    return (
        <section className="mt-9 flex flex-col gap-10">
            {
                result.threads.map((thread) => (
                    <ThreadCard
                        key={thread._id} 
                        id={thread._id} 
                        currentUserId={currentUserId} 
                        parentId={thread.parentId}
                        content={thread.text}
                        author={
                            accountType === 'User' 
                            ? {name: result.name, image: result.image, id: result.id}           //结果来自 result 根节点
                            : {name: thread.author.name, image: thread.author.name, id: thread.author.id}  //结果来自子节点
                        }                      
                        community={thread.community}                //todo
                        createAt={String(thread.createAt)}
                        comments={thread.children}
                     />
                ))
            }
        </section>
    )
}

export default ThreadsTab;