import { redirect } from "next/navigation";
import Navbar from "../app/components/ui/NavBar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faStar } from "@fortawesome/free-solid-svg-icons";

export default function RootPage() {
  return(
    <div className="flex flex-row">
        <Navbar/>
    </div>
  )
 // redirect("/login");

}
