export interface Room {
  id: string;
  title: string;
  roomType: 'Single' | 'Double' | 'Family' | 'Hall' | 'Suite' | 'Deluxe';
  capacity: number;
  floor: number;
  hotel: string;
  details: string;
  bookedStatus: 'Available' | 'Booked';
  price: number;
  imagesUrl: string[];
  location: string;
}
