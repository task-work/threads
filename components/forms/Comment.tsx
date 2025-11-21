"use client"

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CommentValidation } from '@/lib/validations/thread';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { addCommentToThread } from '@/lib/actions/thread.actions';
import { Avatar, AvatarImage } from '../ui/avatar';

interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string
}

const Comment = ({threadId, currentUserImg, currentUserId}: Props) => {

    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: ''
        }
    });
    
    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname);
        form.reset();
        // router.push('/');
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
                <FormField control={form.control} name="thread"
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                            <FormLabel>
                                <Avatar className='backdrop-contrast-50 w-12 h-12'>
                                    <AvatarImage src={currentUserImg} alt='Profile image' />
                                </Avatar>
                            </FormLabel>
                            <FormControl className='border-none bg-transparent'>
                                <Input type="text" placeholder='Commnet...' className='not-focus text-light-1 outline-none' {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" className='comment-form_btn text-small-regular'>Reply</Button>
            </form>
        </Form>
    );
}

export default Comment;