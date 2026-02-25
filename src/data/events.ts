import { CampEvent } from '../types';

export const EVENTS: CampEvent[] = [
    {
        id: 1,
        date: new Date(2026, 7, 15),
        endDate: new Date(2026, 7, 18),
        title: "Campamento Renacer",
        description: "Un tiempo de renovación espiritual y conexión con Dios en medio de la naturaleza. Disfruta de plenarias, fogatas, y dinámicas de equipo diseñadas para fortalecer tu fe.",
        location: "Comitán de Domínguez, Chiapas",
        time: "08:00 AM - 04:00 PM",
        spots: 120,
        available: 45,
        image: "https://picsum.photos/seed/camp1/600/400"
    },
    {
        id: 2,
        date: new Date(2026, 9, 10),
        endDate: new Date(2026, 9, 12),
        title: "Retiro de Jóvenes: Fuego",
        description: "Tres días intensos de adoración, palabra y dinámicas para encender tu pasión por Cristo. Un espacio para jóvenes que buscan un encuentro real y transformador.",
        location: "Lagos de Montebello, Chiapas",
        time: "02:00 PM - 12:00 PM",
        spots: 80,
        available: 12,
        image: "https://picsum.photos/seed/camp2/600/400"
    },
    {
        id: 3,
        date: new Date(2027, 0, 5),
        endDate: new Date(2027, 0, 9),
        title: "Campamento Extremo",
        description: "Desafía tus límites físicos y espirituales en este campamento de inicio de año. Actividades al aire libre, competencias extremas y tiempos profundos de oración.",
        location: "Las Nubes, Chiapas",
        time: "06:00 AM - 05:00 PM",
        spots: 150,
        available: 150,
        image: "https://picsum.photos/seed/camp3/600/400"
    }
];

export const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
