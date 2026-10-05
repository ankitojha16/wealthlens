import { redirect } from "next/navigation";
import ResearchClient from "./research-client";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function ResearchPage() {
  const { data: { user } } = await (await getSupabaseServerClient()).auth.getUser();
  if (!user) redirect("/login");

  return <ResearchClient />;
}
