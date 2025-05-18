export interface Room{
    id: string;
    title: string;
    roomType: "Room"| "Hall";
    floor: number;
    building: string;
    details: string;
    bookedStatus: string;
}