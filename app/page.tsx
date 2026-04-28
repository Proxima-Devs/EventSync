import { redirect } from "next/navigation";
import Navbar from "../app/components/ui/NavBar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faStar } from "@fortawesome/free-solid-svg-icons";

export default function RootPage() {
  return(
    <div className="flex flex-row">
      <div>
        <Navbar/>
      </div>
    <div>
    <div>
      <div className="flex flex-row items-center gap-2 bg-blue-500">
        <FontAwesomeIcon icon={faStar}/>
        <p>Connect & sync</p></div>
          <div>
            <h1>Synchronize Your </h1>
            <span>Event Experience</span>
            <p>Discover the most exciting tech conference, workshops and meetups. </p>
            <p>Manage your schedule, connect with speakers, and never miss a beat</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faSearch}/>
            <input type="text" />
            <button>Search</button>
          </div>
        </div>
      </div>
    </div>
  )
 // redirect("/login");

}
