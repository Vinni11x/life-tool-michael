"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Abmelden({ className = "btn ghost" }: { className?: string }) {
  const router = useRouter();

  async function abmelden() {
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" className={className} onClick={abmelden}>
      Abmelden
    </button>
  );
}
