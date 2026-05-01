import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarAwareMain from "@/components/sidebar-aware-main";
import { SidebarProvider } from "@/components/sidebar-context";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
            <body>
                <SidebarProvider>
                    <Sidebar />
                    <SidebarAwareMain>
                        {children}
                        <Footer />
                    </SidebarAwareMain>
                </SidebarProvider>
            </body>
        </html>
    );
}