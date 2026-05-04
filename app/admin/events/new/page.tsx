'use Client'
export default function newEvent(){
    return (
        <div className="bg-black w-full h-screen text-white">
            <div className="flex flex-row items-center ">
                <h1 className="text-5xl font-bold mx-15 my-7">Create Your own Event</h1>
            </div>
            <form className="flex flex-col gap-10 ml-15">
                <div className="flex flex-row gap-10 items-center ">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col ">
                            <label className="font-semibold text-lg">Title</label>
                            <input type="text" placeholder="Add new title" className="border-2 border-[#00E5FF] h-12 w-120 pl-3 rounded-lg"/>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold text-lg">Description</label>
                            <input type="text" placeholder="Add new description" className="border-2 border-[#00E5FF] h-12 w-120 pl-3 rounded-lg"/>
                        </div>
                        <div className="flex flex-col  ">
                            <label className="font-semibold text-lg">Start date</label>
                            <input type="date" placeholder="Add event start date" className="border-2 border-[#00E5FF] h-12 w-120 pl-3 rounded-lg"/>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col ">
                            <label className="font-semibold text-lg">End Date</label>
                            <input type="date" placeholder="Add event end date" className="border-2 border-[#00E5FF] h-12 w-120 pl-3 rounded-lg"/>
                        </div>
                        <div className="flex flex-col ">
                            <label className="font-semibold text-lg">Location</label>
                            <input type="text" placeholder="Find event location" className="border-2 border-[#00E5FF] h-12 w-120 pl-3 rounded-lg"/>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold text-lg">Image</label>
                            <input type="file" placeholder="put image here" className="border-2 border-[#00E5FF] h-12 w-120 pl-3 rounded-lg"/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-5">
                    <button type="submit" className="bg-cyan-400 w-30 h-8 rounded-lg text-lg font-semibold">Confirm</button>
                    <button type="submit" className="bg-red-600 w-30 h-8 rounded-lg text-lg font-semibold">Cancel</button>
                </div>

            </form>
        </div>

    )

}