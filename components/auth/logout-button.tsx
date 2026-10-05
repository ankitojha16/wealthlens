"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase?.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return <Button type="button" onClick={handleLogout}>Log out</Button>;
}