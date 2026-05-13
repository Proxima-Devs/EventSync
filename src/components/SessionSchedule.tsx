
import { string } from "better-auth";
import { useEffect, useState } from "react";

interface Speaker {
  id: string;
  fullName: string;
  photo?: string | null;
}

interface Room {
  id: string;
  name: string;
}

interface Session {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  capacity?: number | null;
  isLive: boolean;
  room?: Room | null;
  speakers: Speaker[];
  _count: { questions: number };
}

interface SessionFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  capacity: string;
  roomId: string;
  speakerIds: string[];
}


export default function SessionCardSchedule({ eventId }: { eventId: string }){
    const [ session, setSession ] = useState<Session[] | []>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);

    if (!session) {
      return (
        <div>Session introuvable</div>
      )
      
    }

    useEffect(() => {
      const fetchSession = async () => {
        try{
          const response = await fetch(`/api/events/${eventId}/sessions`);
          if(!response.ok) throw new Error("Internal Servor Error");
          const data: Session[] = await response.json();
          setSession(data);

        }catch(err){
          setError("Session charge failed");

        }finally{
          setLoading(false);
        }
      }
      fetchSession

    }, [eventId]);

    const room = [...new Set(session.map(s => s.room?.name).filter(Boolean) as string[])];
    const salle = [...new Set(session.map(s => new Date(s.startTime).getHours()))].sort((a,b) => a - b );
    if(loading) return <div>Chargement de l'emploi du temps</div>
    if(error) return <div>{error}</div>

    return (
      <div>
          Hello hello, can you hear me ?
      </div>
    )
}



