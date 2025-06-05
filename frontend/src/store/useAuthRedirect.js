import { useEffect } from "react";
import { useUserStore } from "./userStore";

export function useAuthRedirect() {
  const username = useUserStore((s) => s.username);
  useEffect(() => {
    if (!username) {
      window.location.href = "/";
    }
  }, [username]);
}
