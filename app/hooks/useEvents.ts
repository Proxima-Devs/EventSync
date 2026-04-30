import {useState, useEffect, useMemo} from "react";
import {EventPayload} from "@/types";
import {eventService} from "../services/eventServices";



export const useEvent = () => {
    const [events, setEvents] = useState<EventPayload[]>([]);
    const [loading, setLoading ] = useState<boolean>(false);
    const [search, setSearch ] = useState("");
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const perPage = 20;

    useEffect(() => {
        eventService.getAllEvents(page, perPage).then((res) => {
            setEvents(res.data);
            setTotalPage(res.meta.total);

        })
            .finally(() => setLoading(false));
    }, [page]);

    const filtered = useMemo(() => {

        const q = search.toLowerCase();
        return events.filter((e) => e.title.toLowerCase().includes(q))
    },[search, events]);

    return {filtered, loading, search, setSearch, page, perPage, totalPage};
}