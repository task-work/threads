import Image from "next/image";
import { Avatar, AvatarImage } from "../ui/avatar";
import Link from "next/link";

interface Props {
    accountId: string;
    authUserId: string;
    name: string;
    username: string;
    imgUrl: string;
    bio: string,
    type?: 'User' | 'Community'
}

const ProfileHeader = ({accountId, authUserId, name, username, imgUrl, bio, type} : Props) => {
    return (
        <div>
            <div className="flex w-full flex-col justify-start">
                <div className="flex items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative h-20 w-20 object-cover">
                            <Avatar className="backdrop-contrast-70 w-20 h-20 outline-2 outline-primary-500">
                                <AvatarImage src={imgUrl} alt="Profile image" />
                            </Avatar>
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-row items-center justify-between w-full">
                                <h2 className="text-left text-heading3-bold text-light-1">{name}</h2>
                                {
                                    accountId === authUserId && type !== "Community" && (
                                        <Link href='/profile/edit'>
                                            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
                                                <Image
                                                    src='/assets/edit.svg'
                                                    alt='logout'
                                                    width={16}
                                                    height={16}
                                                />
                                            </div>
                                        </Link>
                                    )
                                }
                            </div>
                            <p className="text-base-medium text-gray-1">@{username}</p>
                        </div>
                    </div>
                </div>
            </div>

            { /*  TODO: Community */ }

            <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>
            <div className="mt-12 h-0.5 w-full bg-dark-3" />
        </div>
    );
}

export default ProfileHeader;