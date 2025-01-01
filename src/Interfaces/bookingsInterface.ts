  export interface BookingInterface {
    _id: number; 
    event_id: number; 
    sub_event_items: any; 
    user_id: number; 
    created_at?: Date; 
    is_main: any; 
    payment_ids?: any,
    payment_method? : string,
    amount: number; 
    status: string;  
  }