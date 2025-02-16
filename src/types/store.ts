export interface Store {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  schedule?: StoreSchedule;
  isActive: boolean;
}

export interface StoreSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
  isOpen: boolean;
}
