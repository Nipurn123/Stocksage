import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Make sure we have a secret
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'stocksage-fallback-secret-key-for-development';

if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
  console.warn('Warning: NEXTAUTH_SECRET is not set in production. Using fallback secret.');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Handle guest login (This is a special case for demo purposes)
        if (credentials.email === "guest@stocksage.com" && credentials.password === "guest123") {
          return {
            id: "guest-id",
            name: "Guest User",
            email: "guest@stocksage.com",
            role: "guest",
          };
        }

        // Find user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        // Return user (without password)
        return {
          id: user.id,
          name: user.name || null,
          email: user.email,
          image: user.image || null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string || "user";
      }
      return session;
    },
  },
}; 