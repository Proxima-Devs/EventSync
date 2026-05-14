
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

    const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "17:00", "18:00"];

 const getSessionAtTime = (time: string, roomName: string) => {
  return session.find(session => {
    let sessionStart = "";
    if (session.startTime.includes('T')) {
      sessionStart = session.startTime.substring(11, 16);
    } else if (session.startTime.includes(' ')) {
      sessionStart = session.startTime.split(' ')[1].substring(0, 5);
    } else {
      sessionStart = session.startTime.substring(0, 5);
    }
    
    const match = sessionStart === time && session.room?.name === roomName;
    
    return match;
  });
};

    const rooms = [...new Set(session.map(s => s.room?.name).filter(Boolean) as string[])];
    if(loading) return <div>Chargement de l'emploi du temps</div>
    if(error) return <div>{error}</div>
    if (!session.length) return <div>Session not found</div>

    return (
      <div className="mt-10 bg-gray-100">
        <table>
          <thead >
            <tr >
              <th className="text-grey-700 px-10 text-lg font-extralight">Heure</th>
              {rooms.map(room => (
              <th className="bg-gray-200 px-10 py-3 text-lg w-300 font-extralight border-5 border-gray-100 mx-3 rounded-2xl " key={room}>
                {room}</th>
          ))}
            </tr>
          </thead>
          <tbody className="h-120">
           {
            timeSlots.map(time => (
              <tr key={time} className=" py-6">
                <td className="font-medium h-30 text-center">{time}</td>
                {rooms.map((roomName, i) => {

                  const sessionTime = getSessionAtTime(time, roomName)
               
                  return (
                    <td key={`${time}-${roomName}-${i}`}>{
                      sessionTime ? (
                        <div className="bg-white border-1 border-gray-400 rounded-lg px-5 py-2">
                          <h1 className="font-bold">{sessionTime.title}</h1>
                          <p className="text-sm ">{sessionTime.startTime.substring(11,16)}-{sessionTime.endTime.substring(11,16)}</p>
                          <p className="text-[12px] font-bold text-blue-700">{sessionTime.speakers.map(s => s.fullName).join(", ")}</p>

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



