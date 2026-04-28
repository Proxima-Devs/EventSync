import Sidebar from "../components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030507] text-white flex">
      <Sidebar />
      <div className="ml-[60px] flex-1">
        {children}
      </div>
    </div>
  );
}