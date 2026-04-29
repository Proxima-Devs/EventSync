import Navbar from "../../components/ui/NavBar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

export default function EventManagment(){
    return (
        <div className="flex flex-row bg-black text-gray-500 ">
            <div>
                <Navbar/>
            </div>
            <div className="w-full border-1 border-gray-800">
                <div className="flex flex-row justify-between px-20 h-35 items-center ">
                    <div>
                        <h1 className="text-white text-5xl font-bold">Manage Events</h1>
                        <p>Add, edit, or remove events from platform</p>
                    </div>
                    <div>
                        <button className="flex flex-row items-center bg-[#00E5FF] text-black font-bold w-40 h-8 justify-center gap-3 rounded-lg">
                            <FontAwesomeIcon icon={faPlus}/>
                            <p>New Event</p> 
                        </button>
                    </div>
                </div>
                <div className="border-t-1 border-gray-800 flex h-98 items-center justify-center">
                    <div className=" w-220 h-65 border-mist-800 bg-[#101010] border-1 flex flex-col ">
                        <div className=" h-15 flex items-center pl-5 ">
                            <input type="text" className="border-mist-800 border-1 bg-black w-80 rounded-sm h-8 pl-5" placeholder="Search ..."/>

                        </div >
                            <table className="w-full border-1 border-[#080808] h-10 rounded-xl">
                                    <tr className="flex flex-row bg-[#282828] gap-50 pl-10 h-10 items-center rounded-t-xl">
                                        <td>Event name</td>
                                        <td>Slug</td>
                                        <td>Date</td>
                                        <td>Location</td>
                                    </tr>
                                    <tr className="h-25 rounded-xl">
                                        <p className="text-center">No result</p>
                                    </tr>

                            </table>
                        </div>
                    </div>
                </div>
        </div>
    )

}