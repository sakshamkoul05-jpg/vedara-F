import { create } from 'zustand';

interface BookingState {
  checkIn: Date | null;
  checkOut: Date | null;
  cottageId: string | null;
  adults: number;
  children: number;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  setCottageId: (id: string | null) => void;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  checkIn: null,
  checkOut: null,
  cottageId: null,
  adults: 2,
  children: 0,
  setCheckIn: (date) => set({ checkIn: date }),
  setCheckOut: (date) => set({ checkOut: date }),
  setCottageId: (id) => set({ cottageId: id }),
  setAdults: (n) => set({ adults: n }),
  setChildren: (n) => set({ children: n }),
  reset: () => set({ checkIn: null, checkOut: null, cottageId: null, adults: 2, children: 0 }),
}));
