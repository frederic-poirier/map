import { useAuth } from "~/context/AuthContext";
import { LayoutHeader } from "../component/features/layout/Layout";
import LogOut from "lucide-solid/icons/log-out";

export default function Profile() {
  const { logout, login, user } = useAuth();
  return (
    <div>
      <LayoutHeader title="Profile Page" />
      <button
        class="flex flex-col gap-2 items-center justify-center my-20 w-full text-[var(--text-secondary)]"
        onClick={() => logout()}
      >
        <LogOut size={16} />
        Sign out from your account
        <span class="font-mono text-sm text-[var(--text-secondary)]">
          {user()}
        </span>
      </button>
    </div>
  );
}
