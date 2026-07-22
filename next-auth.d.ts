import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      accessToken: string;
      name?: string | null;
      email?: string | null;
      phoneNumber?: string | null;
      profileImage?: string;
      verified?: boolean;
      location?: string;
    };
  }

  interface User {
    id: string;
    role: string;
    accessToken: string;
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    profileImage?: string;
    verified?: boolean;
    location?: string;
  }
}
