export interface Room {
  id: string;
  title: string;
  roomType: 'Room' | 'Hall';
  floor: number;
  hotel: string;
  details: string;
  bookedStatus: 'Available' | 'Booked' | 'Pending';
  price: number;
  imagesUrl: string[];
  location: string;
}
