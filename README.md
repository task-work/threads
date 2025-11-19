## base information
### NextJs 16.x
### nvm use 21
### npx create-next-app@latest ./   create project Directory

### Dependencies
    1. @clerk/nextjs                                            https://clerk.com/
    2. @uploadthing/react   uploadthing                         https://uploadthing.com/
    3. mongoose                                                 https://mongodb.com
    4. shadcn-ui                                                https://ui.shadcn.com/
    5. tailwind css 4.x                                         https://tailwindcss.com/

### local settings
    1. create file (.env.local) in root directory;
    2. setting constants by clerk、 uploadthing、 mongoose site;
       Third party constants:
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
            CLERK_SECRET_KEY=
            NEXT_CLERK_WEBHOOK_SECRET=
            UPLOADTHING_TOKEN=
            MONGODB_URL=
    3. setting local constants:
        NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
        NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
        NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/onboarding
        NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/


