export type UserRole = 'customer' | 'admin';

export interface Profile {
    id: string;
    full_name: string | null;
    phone: string | null;
    email?: string | null;
    role: UserRole;
    created_at: string;
}
