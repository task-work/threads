import * as z from 'zod';

export const UserValidation = z.object({
    //图片字符串不能为空
    profile_photo: z.string().nonempty().pipe(z.url()),
    //名字长度限制，最少3个字符，最多30个字符，可以自定义提示信息
    name: z.string().min(3, {message: 'MINIMUM 3 Chars'}).max(30),
    //用户名
    username: z.string().min(3).max(30),
    //简介
    bio: z.string().min(3).max(1000),
});