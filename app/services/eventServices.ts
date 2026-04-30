import {EventPayload} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

console.log("BASE_URL:", process.env.NEXT_PUBLIC_APP_URL);
type EventResponses = {
    data: EventPayload[];
    meta: {total: number; page: number; perPage: number};
}

export const eventService = {
    getAllEvents: async (page: number = 1, perPage: number = 10): Promise<EventResponses> => {
        const params = new URLSearchParams({
            page: String(page),
            perPage: String(perPage),
        });
        const res = await fetch(`${BASE_URL}/api/events?${params}`);
        if(!res.ok) throw new Error("fetching error");
        return res.json();
    },

}