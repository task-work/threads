import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface Props {
    id: string;
    name: string;
    username: string;
    imgUrl: string;
    bio: string;
    members: {
        image: string;
    }[]
}

function CommunityCard({id, name, username, imgUrl, bio, members} : Props) {
    return (
        <article className="community-card">
            <div className="flex flex-wrap items-center gap-3">
                <Link href={`/communities/${id}`} className="relative h-12 w-12">
                    <Image src={imgUrl} alt="community logo" fill className="rounded-full object-cover" />
                </Link>

                <div>
                    <Link href={`/communities/${id}`}>
                        <h4 className="text-base-semibold text-light-1">{name}</h4>
                    </Link>
                    <p className="text-small-medium text-gray-1">@{username}</p>
                </div>
            </div>

            <p className="mt-4 text-subtle-medium text-gray-1">{bio}</p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Link href={`/communities/${id}`}>
                    <Button size='sm' className="community-card_btn hover:bg-gray-1 cursor-pointer">View</Button>
                </Link>
                {
                    members.length > 0 && (
                        <div className="flex items-center">
                            <div className="flex -space-x-3 *:bg-gray-1 *:w-6 *:h-6">
                                {
                                    members.map((member, index) => (
                                        <Avatar key={`avatar_${index}`}>
                                            <AvatarImage key={index} src={member.image} alt={`user_${index}`} />
                                        </Avatar>
                                    ))
                                }
                            </div>
                            {
                                members.length > 3 &&  (
                                    <p className="ml-1 text-subtle-medium text-gray-1">
                                        {members.length}+ Users
                                    </p>
                                )
                            }
                        </div>
                    )
                }
            </div>
        </article>
    );
}

export default CommunityCard;