export interface CampEvent {
    id: number | string;
    title: string;
    location: string;
    
    // Legacy
    date?: Date;
    endDate?: Date;
    description?: string;
    time?: string;
    spots?: number;
    available?: number;
    image?: string;

    // Supabase
    date_string?: string;
    capacity?: number;
    price?: number;
    status?: string;
    image_url?: string;
    registered?: number;
}
