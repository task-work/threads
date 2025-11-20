import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
    currentUserId: string;          // clerk user id
    accountId: string;              // mongodb user _id
    accountType: string;            // 用户类型
}

const ThreadsTab = async ({currentUserId, accountId, accountType}: Props) => {
    let result;
    if(accountType === 'Community') {
        result = await fetchCommunityPosts(accountId);
    }
    else {
        result = await fetchUserPosts(accountId);
    }

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
                            ? {name: result.name, image: result.image, id: result.id}                               //结果来自 result 根节点
                            : {name: thread.author.name, image: thread.author.image, id: thread.author.id}           //结果来自子节点
                        }                      
                        community={
                            accountType === 'Community'
                            ? {name: result.name, image: result.image, id: result.id}
                            : thread.community
                        }                
                        createAt={String(thread.createAt)}
                        comments={thread.children}
                     />
                ))
            }
        </section>
    )
}

export default ThreadsTab;