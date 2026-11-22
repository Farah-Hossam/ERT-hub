import {
  CalendarDays,
  ClipboardList,
  FileText,
  FolderKanban,
  FolderUp,
  LayoutDashboard,
  Megaphone,
  PartyPopper,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Workspace",
    items: [
      { label: "Tasks", href: "/tasks", icon: ClipboardList },
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    title: "Team",
    items: [
      { label: "Weekly Reports", href: "/reports", icon: FileText },
      { label: "Submissions", href: "/submissions", icon: FolderUp },
      { label: "Announcements", href: "/announcements", icon: Megaphone },
      { label: "Events", href: "/events", icon: PartyPopper },
      { label: "Members", href: "/team", icon: Users },
    ],
  },
  {
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];