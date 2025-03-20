import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Use these config options for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Define demo user credentials - these don't require database access
const DEMO_USERS = [
  {
    id: "admin-user-id",
    name: "Admin User",
    email: "admin@stocksage.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "user-1",
    name: "Demo User",
    email: "user@stocksage.com",
    password: "user123",
    role: "user",
  },
  {
    id: "guest-user-id",
    name: "Guest User",
    email: "guest@stocksage.com",
    password: "guest123", 
    role: "guest",
  }
];

// Get environment variables and ensure defaults for development
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "d41d8cd98f00b204e9800998ecf8427e4b6de62a859c9a0ae9af5c86c7ad1b89";

// Create the NextAuth handler
const handler = NextAuth({
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

        // Check for demo users (works without DB)
        const demoUser = DEMO_USERS.find(user => 
          user.email === credentials.email && user.password === credentials.password
        );
        
        if (demoUser) {
          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
          };
        }

        // No matching user
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
});

export { handler as GET, handler as POST }; 