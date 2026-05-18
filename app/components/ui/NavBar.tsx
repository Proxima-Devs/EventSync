import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faHeart, faCalendar, faTableCells, faUser, faDoorOpen, faArrowRightFromBracket, faUserShield } from "@fortawesome/free-solid-svg-icons";


export default function Navbar(){
    
    return(
        <div className="bg-black text-gray-400 w-60 h-140 pl-1 flex flex-col gap-5">
            <div className="flex flex-row items-center gap-3  pt-5">
                <button className=" w-10 h-10 rounded-full ml-5 bg-[var(--color-primary)] font-bold text-black">E</button>
                <h2 className="text-white font-bold text-xl ">EventSync</h2>
            </div>
            <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <p className="text-xs ml-3">EXPLORE</p>
                <Link href="/">
                <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[var(--color-primary)]">
                    <FontAwesomeIcon icon={faHouse}/>
                    <p>Discover</p>
                </span>

                </Link>
                <Link href="/favourites">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[var(--color-primary)]">
                       <FontAwesomeIcon icon={faHeart}/>
                       <p>My Favourites</p>
                    </span>
                </Link>        
                </div>
                <div className="flex flex-col gap-2 ">
                    <span className="flex flex-row gap-2 items-center text-[var(--color-primary)] ml-3">
                        <FontAwesomeIcon className="text-xs"icon={faUserShield}/>
                        <h3 className=" text-sm font-semibold">ADMIN</h3>
                    </span>
                <Link href="admin/dashboard">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[var(--color-primary)]">
                        <FontAwesomeIcon icon={faTableCells}/>
                        <p>DashBoard</p>
                    </span>
                </Link>
                <Link href="admin/events">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[var(--color-primary)]">
                        <FontAwesomeIcon icon={faCalendar}/>
                        <p>Manage Events</p>
                    </span>
                </Link>
                <Link href="admin/speakers">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[var(--color-primary)]">
                        <FontAwesomeIcon icon={faUser}/>
                        <p>Speakers</p>
                    </span>
                </Link>
                <Link href="admin/rooms">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[var(--color-primary)]">
                        <FontAwesomeIcon icon={faDoorOpen}/>
                        <p>Rooms</p>
                    </span>
                </Link>
                </div>
            </div>
            <div>
                <button className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                    <p>Logout</p>
                </button>
            </div>
        </div>
    )
}

