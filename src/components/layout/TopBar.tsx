import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { getTheme } from "@/lib/theme-server";

export default async function TopBar({ username }: { username: string }) {
  const theme = await getTheme();

  return (
    <header className="flex items-center justify-end border-b border-gray-200 bg-white px-8 py-4">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <ThemeToggle initial={theme} />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-babyblue-100 text-xs font-semibold text-babyblue-700">
          {username.charAt(0).toUpperCase()}
        </div>
        <span>{username}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
