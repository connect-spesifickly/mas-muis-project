import "next-auth";
declare module "next-auth" {
  interface User {
    data: {
      tokens: { accessToken?: string; refreshToken?: string };
      email?: string;
      id?: string;
      role?: string;
    };
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    email?: string;
    id?: string;
    role?: string;
  }
}
