const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const eventService = {
    getAllEvents: async () => {
        const res = await fetch(`${BASE_URL}/api/event`);
        if(!res.ok) throw new Error("fetching error");
        return res.json();
    },
 
    createNewEvent: async (data: object, userId: string) => {
        

    }


}