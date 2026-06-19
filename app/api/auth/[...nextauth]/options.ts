import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { isCollaborator } from "@/lib/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.login) {
        session.user.login = token.login as string;
        session.user.isCollaborator = token.isCollaborator as boolean;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        const login = (profile as { login: string }).login;
        token.login = login;
        token.isCollaborator = await isCollaborator(login);
      }
      return token;
    },
  },
};
