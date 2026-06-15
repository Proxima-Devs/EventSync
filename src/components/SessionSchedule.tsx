import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";



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
  slug: string;
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



export default function SessionCardSchedule(
  { session,
    selectedRoom, toggle, isFavorite, slug } : {
    session: Session[],
     selectedRoom: string | null, 
     toggle: (sessionId: string) => void, 
     isFavorite: (sessionId: string) => boolean,
     slug: string
}){

  const timeSlots = [...new Set(
  session.map(s => s.startTime.substring(11, 16))
)].sort();
   
   const router = useRouter();

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
    const filterRooms = selectedRoom ? rooms.filter(r => r === selectedRoom) : rooms;

    if (!session.length) return <div>Session not found</div>

    return (
  
        <table>
          <thead >
            <tr >
              <th className="text-white px-10 text-lg font-extralight">Heure</th>
              {filterRooms.map(room => (
              <th className=" px-10 py-3 text-lg w-300 font-extralight text-white mx-3 rounded-2xl " key={room}>
                {room}</th>
          ))}
            </tr>
          </thead>
          <tbody className="h-120">
           {
            timeSlots.map(time => (
              <tr key={time} className="py-6">
                <td className="font-medium h-30 text-center text-white">{time}</td>
                {filterRooms.map((roomName, i) => {

                  const sessionTime = getSessionAtTime(time, roomName)
               
                  return (
                    <td key={`${time}-${roomName}-${i}`}>{
                      sessionTime ? (
                        <div className="border-1 border-[#3A4A5A] text-white rounded-lg px-5 py-2 flex flex-row justify-between m-5 " onClick={() => router.push(`/events/${slug}/sessions/${sessionTime.slug}`)}>
                          <div>
                            <h1 className="font-bold">{sessionTime.title}</h1>
                            <p className="text-sm text-[#3A4A5A]">{sessionTime.startTime.substring(11,16)}-{sessionTime.endTime.substring(11,16)}</p>
                            <p className="text-[12px] font-bold text-[#00EEFF]">{sessionTime.speakers.map(s => s.fullName).join(", ")}</p>   
                          </div>
                          <div>
                            <button onClick={() => toggle(sessionTime.id)}>{
                                isFavorite(sessionTime.id) ? <FontAwesomeIcon icon={faStar} className="text-yellow-500"/> : <FontAwesomeIcon icon={faStar} className="text-gray-400"/>
                              }
                            </button>
                          </div>
                        </div>
                      ):
                      (<div>

                      </div>
                      )}</td>
                  );
                })
                }
              </tr>
            ))
           }
          </tbody>

        </table>
    )
}



