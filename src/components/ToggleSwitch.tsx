"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faCalendar } from "@fortawesome/free-solid-svg-icons";


export default function ToggleSwitch({isOn, setIsOn }: { isOn: boolean,setIsOn: (value: boolean) => void}) {


    return (
        <div onClick={() => {setIsOn(!isOn)}} className={`bg-gray-300 w-[160px] rounded-full cursor-pointer transition-all duration-300 relative h-[55px] shadow-inner flex flex-row`}>

            <div className={`${isOn? 'left-[60px]':'left-[0]'} w-[100px] h-[55px] bg-white text-xl rounded-full shadow-md absolute  transition-all duration-300`}>{isOn? (<div className="flex  items-center justify-center h-14 gap-2">
                <FontAwesomeIcon icon={faCalendar}/> 
              
                </div>): (<div className="flex items-center justify-center h-14 gap-2">
                    <FontAwesomeIcon icon={faList}/>
                    
                </div>)}</div>
        </div>
    )

}