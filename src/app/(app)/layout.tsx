import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { Logo } from "@/components/ui/Logo";
import { AppNav } from "@/components/app/AppNav";
import { LogoutButton } from "@/components/app/LogoutButton";

// The signed-in app shell: a slim sidebar with brand, navigation, and the org/user footer. Auth is
// re-checked here (not just in Proxy) so a forged cookie that slipped past the optimistic redirect
// still lands on /login.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative flex min-h-dvh">
      {/* animated graphics backdrop */}
      <div className="aurora" aria-hidden />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-surface px-4 py-5 md:flex">
        <div className="px-2">
          <Logo />
        </div>

        <div className="mt-7 flex-1">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Workspace
          </p>
          <AppNav />
        </div>

        <div className="border-t border-line pt-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-wash text-xs font-semibold text-brand-ink">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.org.name}</p>
            </div>
          </div>
          <div className="px-2 pt-1">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 md:pl-60">
        {/* mobile top bar */}
        <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
          <Logo mark={20} />
          <LogoutButton />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
