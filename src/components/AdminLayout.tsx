"use client";
import { Layout, AppBar } from "react-admin";
import { useSidebar } from "./sidebar-context";

const AdminNavbar = () => {
    const { expanded } = useSidebar();
    const sidebarWidth = expanded ? "220px" : "60px";
    return (
        <AppBar
            sx={{
                left: sidebarWidth,
                width: `calc(100% - ${sidebarWidth})`,
                transition: "left 300ms ease-in-out, width 300ms ease-in-out",
            }}
        />
    );
};

const AdminLayout = (props: any) => <Layout {...props} appBar={AdminNavbar} />;

export default AdminLayout;
