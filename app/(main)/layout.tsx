import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarAwareMain from "@/components/sidebar-aware-main";
import { SidebarProvider } from "@/components/sidebar-context";
import { ThemeProvider } from "@/providers/theme-provider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Sidebar />
        <SidebarAwareMain>
          {children}
          <Footer />
        </SidebarAwareMain>
      </SidebarProvider>
    </ThemeProvider>
  );
}