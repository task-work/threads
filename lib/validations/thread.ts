import * as z from 'zod';

//帖子发布验证
export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(3, {message: 'Minimum 3 characters'}),
    accountId: z.string()
});

//评论发布验证
export const CommentValidation = z.object({
    thread: z.string().nonempty().min(3, {message: 'Minimum 3 characters'})
});