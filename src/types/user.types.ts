export type UserRole =
  | "member"
  | "department_head"
  | "operations"
  | "leadership"
  | "admin";

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  department_id: string | null;
  role: UserRole;
  job_title: string | null;
  avatar_url: string | null;
  is_active: boolean;
}