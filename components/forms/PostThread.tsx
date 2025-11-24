"use client"

import * as z from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useOrganization } from '@clerk/nextjs';
import { Textarea } from '@/components/ui/textarea';
import { usePathname, useRouter } from 'next/navigation';
// import { updateUser } from '@/lib/actions/user.actions';
import { ThreadValidation } from '@/lib/validations/thread';
import { createThread } from '@/lib/actions/thread.actions';
interface Props {
    userId: string
}

function PostThread({ userId }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    
    const { organization } = useOrganization();

    const form = useForm({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: '',
            accountId: userId
        }
    });
    const [loading, setLoading] = useState(false);
    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        setLoading(true);
        await createThread({
            text: values.thread,
            author: userId,
            communityId: organization ? organization.id : null,
            path: pathname
        }).finally(() => setLoading(false));
        router.push('/');
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start mt-10 gap-10">
                <FormField control={form.control} name="thread"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                               Content
                            </FormLabel>
                            <FormControl>
                                <Textarea rows={15} className='not-focus border border-dark-4 bg-dark-3 text-light-1' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className='bg-primary-500 hover:bg-gray-1 cursor-pointer' disabled={loading}>
                    <Spinner className={loading ? 'block' : 'hidden'} />
                    Post Thread
                </Button>
            </form>
        </Form>
    );
}

export default PostThread;