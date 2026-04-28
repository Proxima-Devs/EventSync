import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faHeart, faCalendar, faTableCells, faUser, faDoorOpen, faArrowRightFromBracket, faUserShield } from "@fortawesome/free-solid-svg-icons";


export default function Navbar(){
    
    return(
<<<<<<< HEAD
        <div className="bg-black text-gray-400 w-70 h-140 pl-1 flex flex-col gap-5">
            <div className="flex flex-row items-center gap-3  pt-5">
                <button className=" w-10 h-10 rounded-full ml-5 bg-[#00E5FF] font-bold text-black">E</button>
                <h2 className="text-white font-bold text-xl ">EventSync</h2>
            </div>
            <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <p className="text-xs ml-3">EXPLORE</p>
                <Link href="/">
                <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[#00E5FF]">
=======
        <div>
            <div>

                <h2 className="">EventSync</h2>
            </div>
            <div>
                <p>EXPLORE</p>
                <Link href="/">
                <span className="">
>>>>>>> 168a5a6 (feat: add navbar)
                    <FontAwesomeIcon icon={faHouse}/>
                    <p>Discover</p>
                </span>

                </Link>
                <Link href="/favourites">
<<<<<<< HEAD
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[#00E5FF]">
                       <FontAwesomeIcon icon={faHeart}/>
                       <p>My Favourites</p>
                    </span>
                </Link>        
                </div>
                <div className="flex flex-col gap-2 ">
                    <span className="flex flex-row gap-2 items-center text-[#00E5FF] ml-3">
                        <FontAwesomeIcon className="text-xs"icon={faUserShield}/>
                        <h3 className=" text-sm font-semibold">ADMIN</h3>
                    </span>
                <Link href="admin/dashboard">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[#00E5FF]">
=======
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
>>>>>>> 168a5a6 (feat: add navbar)
                        <FontAwesomeIcon icon={faTableCells}/>
                        <p>DashBoard</p>
                    </span>
                </Link>
<<<<<<< HEAD
                <Link href="admin/events">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[#00E5FF]">
=======
                <Link href="/events">
                    <span>
>>>>>>> 168a5a6 (feat: add navbar)
                        <FontAwesomeIcon icon={faCalendar}/>
                        <p>Manage Events</p>
                    </span>
                </Link>
<<<<<<< HEAD
                <Link href="admin/speakers">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[#00E5FF]">
=======
                <Link href="/speaker">
                    <span>
>>>>>>> 168a5a6 (feat: add navbar)
                        <FontAwesomeIcon icon={faUser}/>
                        <p>Speakers</p>
                    </span>
                </Link>
<<<<<<< HEAD
                <Link href="admin/rooms">
                    <span className="flex flex-row items-center gap-2 h-10 px-3 w-55 rounded-xl hover:text-black hover:bg-[#00E5FF]">
=======
                <Link href="/room">
                    <span>
>>>>>>> 168a5a6 (feat: add navbar)
                        <FontAwesomeIcon icon={faDoorOpen}/>
                        <p>Rooms</p>
                    </span>
                </Link>
<<<<<<< HEAD
                </div>
            </div>
            <div>
                <button className="flex flex-row items-center">
=======
            </div>
            <div>
                <button>
>>>>>>> 168a5a6 (feat: add navbar)
                    <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                    <p>Logout</p>
                </button>
            </div>
        </div>
    )
}

