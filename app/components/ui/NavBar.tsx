import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faHeart, faCalendar, faTableCells, faUser, faDoorOpen, faArrowRightFromBracket, faUserShield } from "@fortawesome/free-solid-svg-icons";


export default function Navbar(){
    
    return(
        <div>
            <div>

                <h2 className="">EventSync</h2>
            </div>
            <div>
                <p>EXPLORE</p>
                <Link href="/">
                <span className="">
                    <FontAwesomeIcon icon={faHouse}/>
                    <p>Discover</p>
                </span>

                </Link>
                <Link href="/favourites">
                    <span>
                       <FontAwesomeIcon icon={faHeart}/>
                       <p>My Favourites</p>
                    </span>
                </Link>
                <Link href="/dashboard">
                <span>
                    <FontAwesomeIcon icon={faUserShield}/>
                    <h3>Admin</h3>
                </span>
                    <span>
                        <FontAwesomeIcon icon={faTableCells}/>
                        <p>DashBoard</p>
                    </span>
                </Link>
                <Link href="/events">
                    <span>
                        <FontAwesomeIcon icon={faCalendar}/>
                        <p>Manage Events</p>
                    </span>
                </Link>
                <Link href="/speaker">
                    <span>
                        <FontAwesomeIcon icon={faUser}/>
                        <p>Speakers</p>
                    </span>
                </Link>
                <Link href="/room">
                    <span>
                        <FontAwesomeIcon icon={faDoorOpen}/>
                        <p>Rooms</p>
                    </span>
                </Link>
            </div>
            <div>
                <button>
                    <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                    <p>Logout</p>
                </button>
            </div>
        </div>
    )
}

