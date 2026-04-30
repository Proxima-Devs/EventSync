import { useState, useEffect } from "react";


export interface Event {
    id: string
    userId: string
    slug: string
    title: string
    description: string | null
    startDate: string
    endDate: string
    location: string | null
    imageUrl: string | null

}

export const useEvent = () => {

    

}