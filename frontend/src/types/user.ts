export interface User {
    id: string;
    clerkUserId: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
    credit: number | null;
    createdAt: Date;
    updatedAt: Date;
  }