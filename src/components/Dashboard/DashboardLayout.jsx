import { useState } from "react";


export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#050505]/30 via-[#0a0a1f]/20 to-[#000000]/20 text-foreground">
      {/* Sidebar */}
      {/* //<DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} /> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden mt-20">
        {/* <DashboardTopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} /> */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
