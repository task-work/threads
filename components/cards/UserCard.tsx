
'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
interface Props {
    id: string;
    name: string;
    username: string;
    imgUrl: string;
    personType: string
}

const UserCard = (params: Props) => {
    const router = useRouter();
    const isCommunity = params.personType === "Community";
    return(
        <article className="user-card">
            <div className="user-card_avatar">
                <Avatar className="bg-gray-50">
                    <AvatarImage src={params.imgUrl} alt="logo" width={48} height={48} />
                </Avatar>
                <div className="flex-1 text-ellipsis">
                    <h4 className="text-base-semibold text-light-1">{params.name}</h4>
                    <p className="text-small-medium text-gray-1">@{params.username}</p>
                </div>
            </div>
            <Button className="user-card_btn hover:bg-gray-1 cursor-pointer" onClick={() => {
                if(isCommunity) {
                    router.push(`/communities/${params.id}`)
                }
                else {
                    router.push(`/profile/${params.id}`)
                }
            }}>View</Button>
        </article>
    );
}

export default UserCard;