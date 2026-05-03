import { redirect } from "next/navigation";
import Navbar from "./components/ui/NavBar";

export default function RootPage() {
  redirect("/auth/login");
}
