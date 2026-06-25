import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("[DashboardLayout] Auth error:", authError.message);
      redirect("/login");
    }

    if (!user) {
      redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url, is_approved")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[DashboardLayout] Profile error:", profileError.message, profileError.code);
      throw new Error(`Profile query failed: ${profileError.message} (${profileError.code})`);
    }

    if (!profile) {
      redirect("/login");
    }

    if (profile.role === "affiliate" && !profile.is_approved) {
      redirect("/pending-approval");
    }

    return (
      <div className="min-h-screen bg-slate-50 flex">
        <DashboardSidebar profile={profile as { id: string; full_name: string; email: string; role: string; avatar_url?: string }} />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[DashboardLayout] Uncaught error:", message);
    throw err;
  }
}
