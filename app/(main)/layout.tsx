import Sidebar from "../components/Sidebar";
import Navbar from "../components/Sidebar";
import Footer from "../components/Fotter";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030507] text-white flex flex-col">
      <Sidebar />
      <div className="ml-[60px] flex-1 flex flex-col pt-14">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}