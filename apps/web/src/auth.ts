import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { api } from "./utils/axios";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      authorize: async (credentials) => {
        try {
          const response = await api.post<{
            data: {
              user: { id: string; email: string; role: string };
              token: {
                accessToken: string;
                refreshToken: string;
              };
            };
          }>("/auth/login", credentials);

          // Return an object that matches the expected User shape
          const user = {
            data: {
              tokens: {
                accessToken: response.data.data.token.accessToken,
                refreshToken: response.data.data.token.refreshToken,
              },
              id: response.data.data.user.id,
              email: response.data.data.user.email,
              role: response.data.data.user.role,
            },
          };
          return user;
        } catch (error) {
          console.error("Authorize error in production:", error);
          console.error(error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.accessToken = user.data.tokens.accessToken;
        token.refreshToken = user.data.tokens.refreshToken;
        token.email = user.data.email;
        token.id = user.data.id;
        token.role = user.data.role;
      } else if (token.accessToken || trigger === "update") {
        try {
          const newToken = await api.post<{
            data: {
              accessToken: string;
              refreshToken?: string;
            };
          }>("/auth/refresh-token", {
            refreshToken: token.refreshToken,
          });
          token.accessToken = newToken.data.data.accessToken;
          token.refreshToken = newToken.data.data.refreshToken;
        } catch (error) {
          console.error("Token refresh failed:", error);
          // Clear tokens if refresh fails
          delete token.accessToken;
          delete token.refreshToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.email = token.email as string;
        session.id = token.id as string;
        session.role = token.role as string;
      }
      return session;
    },
  },
});
