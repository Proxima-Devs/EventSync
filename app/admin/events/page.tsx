"use client"
import Sidebar from "../../../src/components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

import {useEvent} from "../../hooks/useEvents";
import {Pagination} from "../../components/ui/Pagination";

export default function EventManagment(){
    const { filtered, loading, search, setSearch, page,setPage, totalPage } = useEvent();

    return (
        <div className="flex flex-row bg-black text-gray-500 ">
            <div>
                <Sidebar/>
            </div>
            <div className="w-full border-1 border-gray-800 ">
                <div className="flex flex-row justify-between px-30 h-40 items-center ">
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
                <div className="border-t border-mist-800 flex h-98 items-center justify-center flex-col text-white">
                    <div className=" w-220 h-65 border-mist-800 bg-[#101010] border flex flex-col rounded-lg">
                        <div className=" h-15 flex items-center pl-5 ">
                            <input type="text"
                                   className="border-mist-800 border bg-black w-80 rounded-sm h-8 pl-5"
                                   placeholder="Search ..."
                                   value={search}
                                   onChange={(e) => setSearch(e.target.value)}
                            />
                        </div >
                        <div className="overflow-x-auto rounded-xl border border-mist-700 shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#282828] text-gray-500 uppercase text-xs tracking-wider w-full">
                                <tr>
                                    <td className="px-6 py-3 font-semibold">Event name</td>
                                    <td className="px-6 py-3 font-semibold">Slug</td>
                                    <td className="px-6 py-3 font-semibold">Date</td>
                                    <td className="px-6 py-3 font-semibold">Location</td>
                                </tr>
                                </thead>
                                <tbody className="h-30">{
                                    loading ? (
                                        <tr>
                                            <td className="text-center">
                                                Loading ...
                                            </td>
                                        </tr>
                                    ): filtered.length === 0 ? (
                                        <tr className="text-center">
                                            <td>No result</td>
                                        </tr>
                                    ) : (
                                            filtered.map((event) => (
                                                <tr key={event.id}>
                                                    <td className="p-3">{event.title}</td>
                                                    <td>{event.slug}</td>
                                                    <td>{event.startDate}</td>
                                                    <td>{event.location}</td>
                                                    <td className="flex gap-3">
                                                        <button className="text-red-600 text-lg"><FontAwesomeIcon icon={faTrash}/></button>
                                                        <button className="text-cyan-500 text-lg"><FontAwesomeIcon icon={faPencil}/></button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )
                                }</tbody>
                            </table>
                          </div>
                        <Pagination page={page} totalPages={totalPage} onPageChange={setPage}></Pagination>
                        </div>
                    </div>
                </div>

        </div>
    )

}