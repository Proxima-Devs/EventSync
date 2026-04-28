import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faHeart, faCalendar, faTableCells, faUser, faDoorOpen, faArrowRightFromBracket, faUserShield } from "@fortawesome/free-solid-svg-icons";


export default function Navbar(){
    
    return(
        <div className="bg-black text-gray-400 w-60 h-140 pl-1 flex flex-col gap-5">
            <div className="flex flex-row items-center gap-3  pt-5">
                <button className=" w-10 h-10 rounded-full  bg-[#00E5FF] font-bold text-black">E</button>
                <h2 className="text-white font-bold text-xl">EventSync</h2>
            </div>
            <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
               <p className="text-xs">EXPLORE</p>
                <Link href="/">
                <span className="flex flex-row items-center gap-2 h-10 p-2 rounded-xl hover:text-black hover:bg-[#00E5FF]">
                    <FontAwesomeIcon icon={faHouse}/>
                    <p>Discover</p>
                </span>

                </Link>
                <Link href="/favourites">
                    <span className="flex flex-row gap-2 items-center hover:text-black hover:bg-[#00E5FF]">
                       <FontAwesomeIcon icon={faHeart}/>
                       <p>My Favourites</p>
                    </span>
                </Link>        
                </div>
                <div className="flex flex-col gap-4 ">
                    <span className="flex flex-row gap-2 items-center text-[#00E5FF] hover:text-black hover:bg-[#00E5FF]">
                        <FontAwesomeIcon className="text-xs"icon={faUserShield}/>
                        <h3 className=" text-sm font-semibold">ADMIN</h3>
                    </span>
                <Link href="/dashboard">
                    <span className="flex flex-row items-center gap-2 hover:text-black hover:bg-[#00E5FF]">
                        <FontAwesomeIcon icon={faTableCells}/>
                        <p>DashBoard</p>
                    </span>
                </Link>
                <Link href="/events">
                    <span className="flex flex-row items-center gap-2 hover:text-black hover:bg-[#00E5FF]">
                        <FontAwesomeIcon icon={faCalendar}/>
                        <p>Manage Events</p>
                    </span>
                </Link>
                <Link href="/speaker">
                    <span className="flex flex-row items-center gap-2 hover:text-black hover:bg-[#00E5FF]">
                        <FontAwesomeIcon icon={faUser}/>
                        <p>Speakers</p>
                    </span>
                </Link>
                <Link href="/room">
                    <span className="flex flex-row items-center gap-2 hover:text-black hover:bg-[#00E5FF]">
                        <FontAwesomeIcon icon={faDoorOpen}/>
                        <p>Rooms</p>
                    </span>
                </Link>
                </div>
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

