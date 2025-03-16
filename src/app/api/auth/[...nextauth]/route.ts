import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Set the runtime to edge for faster execution (optional but recommended)
export const runtime = 'nodejs';

// Add explicit cache control for Vercel
export async function OPTIONS(request: Request) {
  const res = new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
    },
  });
  return res;
}

// Define guest user credentials
const GUEST_EMAIL = "guest@stocksage.com";
const GUEST_PASSWORD = "guest123";

// Mock guest user data
const GUEST_USER = {
  id: "guest-user-id",
  name: "Guest User",
  email: GUEST_EMAIL,
  role: "guest",
};

// Demo user credentials
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
  }
];

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
          throw new Error("Email and password are required");
        }

        // Check if guest login
        if (credentials.email === GUEST_EMAIL && credentials.password === GUEST_PASSWORD) {
          return {
            id: GUEST_USER.id,
            name: GUEST_USER.name,
            email: GUEST_USER.email,
            role: GUEST_USER.role,
          };
        }

        // Check for demo users first (works in both dev and prod)
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

        try {
          // For database users
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // No user found with that email
          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Check password
          const passwordValid = await bcrypt.compare(
            credentials.password,
            user.password || ''
          );

          if (!passwordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          throw new Error("Authentication failed");
        }
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
  secret: process.env.NEXTAUTH_SECRET || "stocksage-secret-key",
});

export { handler as GET, handler as POST }; 