import { Divide } from "lucide-react";
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



export default function SessionCardSchedule({ eventId }: { eventId: string }){
    const [ session, setSession ] = useState<Session[] | []>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);

    useEffect(() => {
      const fetchSession = async () => {
        try{
          const response = await fetch(`/api/events/${eventId}/sessions`);
          if(!response.ok) throw new Error("Internal Servor Error");
          const data = await response.json(); 
          
          setSession(data);

        }catch(err){
          setError("Session charge failed");

        }finally{
          setLoading(false);
        }
      }
      fetchSession()

    }, [eventId]);

    const timeSlots = ["09:00", "11:00", "12:00", "13:00", "14:00", "15:00", "17:00", "18:00"];

    const getSessionAtTime = (time: string, roomName: string) => {
      return session.find(session => {
        let sessionStart = session.startTime

        if (sessionStart.includes('T')) {
          const date = new Date(sessionStart);
          sessionStart = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          console.log(`Comparaison: ${sessionStart} === ${time} pour salle ${session.room?.name} === ${roomName}`)
        } else {
          
          sessionStart = sessionStart?.substring(0, 5);
        }
        
        return sessionStart === time && session.room?.name == roomName;
      })
    }

    const room = [...new Set(session.map(s => s.room?.name).filter(Boolean) as string[])];
    if(loading) return <div>Chargement de l'emploi du temps</div>
    if(error) return <div>{error}</div>
    if (!session.length) return <div>Session not found</div>

    return (
      <div className="mt-10">
        <table>
          <thead>
            <tr className="">
              <th className="text-grey-700 px-10 text-lg font-extralight">Heure</th>
              {room.map(room => (
              <th className="bg-gray-200 px-10 py-3 text-lg w-300 font-extralight rounded-2xl" key={room}>{room}</th>
          ))}
            </tr>
          </thead>
          <tbody className="border-black border-1 h-120">
           {
            timeSlots.map(time => (
              <tr key={time} className=" py-6">
                <td className="font-medium bg-gray-300 text-center">{time}</td>
                {room.map((roomName, i) => {

                  const sessionTime = getSessionAtTime(time, roomName)

                  console.log("Session trouvée:", sessionTime);
               
                  return (
                    <td key={`${time}-${roomName}-${i}`}>{
                      sessionTime ? (
                        <div className="bg-white h-30 ">
                          <p>{sessionTime.title}</p>
                        </div>

                      ):
                      (<div></div>)}</td>
                  );
                })
                }
              </tr>
            ))
           }
          </tbody>

        </table>

      </div>
    )
}



