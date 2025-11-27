import 'next-auth';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    role?: string;
  }
  interface Session {
    accessToken?: string;
    user: {
      id?: string | null;
      role?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
    role?: string;
  }
}
