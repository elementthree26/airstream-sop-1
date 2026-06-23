"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  GitBranch,
  FileText,
  BarChart2,
  Tag,
  ClipboardList,
  Package,
  CheckSquare,
  LogIn,
  LogOut,
  User,
  Network,
  Megaphone,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/workflow-map", label: "Workflow Map", icon: Network },
  { href: "/meta-forms", label: "Live Meta Forms", icon: Megaphone },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/forms", label: "Forms", icon: FileText },
  { href: "/lead-scoring", label: "Lead Scoring", icon: BarChart2 },
  { href: "/naming-conventions", label: "Naming Conventions", icon: Tag },
  { href: "/new-form-checklist", label: "New Form Checklist", icon: ClipboardList },
  { href: "/new-model-checklist", label: "New Model Checklist", icon: Package },
  { href: "/hygiene-checklist", label: "Hygiene Checklist", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col shrink-0 h-full">
      <div className="px-5 py-5 border-b border-slate-700">
        <h1 className="text-sm font-semibold text-white leading-tight">Airstream</h1>
        <p className="text-xs text-slate-400 mt-0.5">Martech SOP</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-slate-700 text-white font-medium"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            )}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-slate-700 pt-4 space-y-2">
        {session?.user ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <User size={16} className="text-slate-400" />
              )}
              <span className="text-xs text-slate-300 truncate">{session.user.login ?? session.user.name}</span>
              {session.user.isCollaborator && (
                <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">editor</span>
              )}
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            <LogIn size={14} />
            Sign in with GitHub
          </button>
        )}
      </div>
    </aside>
  );
}
