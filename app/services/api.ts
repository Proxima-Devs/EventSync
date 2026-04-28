const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchData<T>(endpoint: string): Promise<T>{
    const res = await fetch(`${BASE_URL}${endpoint}`)
    if (!res.ok) throw new Error('API Error');
        return res.json()
        
}