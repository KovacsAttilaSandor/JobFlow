import DashboardNavbar from "@/components/dashboard-navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardNavbar />

      <main className="min-h-screen bg-slate-950 text-white">
        {children}
      </main>
    </>
  );
}