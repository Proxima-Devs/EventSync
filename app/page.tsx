import { redirect } from "next/navigation";
import Navbar from "../app/components/ui/NavBar"

export default function RootPage() {
  return(
    <div>
        <Navbar/>
    </div>
  )
 // redirect("/login");

}
