import {EventPayload} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

console.log("BASE_URL:", process.env.NEXT_PUBLIC_APP_URL);
type EventResponses = {
    data: EventPayload[];
    meta: {total: number; page: number; perPage: number};
}

export const eventService = {
    getAllEvents: async (): Promise<EventResponses> => {
        const res = await fetch(`${BASE_URL}/api/events`);
        if(!res.ok) throw new Error("fetching error");
        return res.json();
    },

}