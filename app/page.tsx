import { redirect } from "next/navigation";
import Navbar from "./components/ui/NavBar";

export default function RootPage() {
    return (
        <div><Navbar /></div>
    )
//redirect("/login");

}
