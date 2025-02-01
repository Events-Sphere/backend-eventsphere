// export interface EventInterface {
//   name: string;
//   location: string;
  
//   description: string;
//   registration_start: Date | string | any;
//   registration_end: Date | string | any;
//   longitude: number;
//   latitude: number;
//   category: string;
//   tags: string[]; 
//   audience_type: string;
//   currency: string;
//   main_image?: any; 
//   cover_images?: any; 
//   is_main: number; 
  
//   sub_events: SubEventInterface[]; 
  
  
// }

// export interface MainEventInterface extends Omit<EventInterface, "sub_events"> {
//   sub_event_items: string; 
//   tags: string | any; 
//   main_image: string; 
//   cover_images: string; 
//   starting_date: Date | string | any;
//   ending_date: Date | string | any;
  
  
// }

// export interface SubEventInterface {
//   _id?: number;
//   event_id?: number;
//   name: string;
//   description: string;
//   cover_images: string;
//   video_url?: string | null;
//   start_time: any;
//   end_time: any;
//   starting_date: string | Date;
//   hostedBy: string;
//   host_email: string;
//   host_mobile: number;
//   c_code: string;
//   ticket_quantity: number;
//   ticket_sold?: number;
//   ticket_type: string;
//   ticket_price: number;
//   earnings?: number;
//   approvedBy?: string;
//   approvedAt?: string | any;
//   denial_reason?: string | null;
//   restrictions: string;
// }


export interface MainEventInterface {
  name: string;
  location: string;
  description: string;
  registration_start: Date | string | any;
  registration_end: Date | string | any;
  longitude: number;
  latitude: number;
  category: string;
  tags: string[] | string; 
  audience_type: string;
  currency: string;
  main_image?: any | string; 
  cover_images?: any | string; 
  is_main: number;
  starting_date?: Date | string | any; 
  ending_date?: Date | string | any; 
  sub_event_items: string; 
  sub_events ? : SubEventInterface[]
}

export interface SubEventInterface {
  _id?: number;
  event_id?: number; 
  name: string;
  description: string;
  cover_images: string; 
  video_url?: string | null; 
  start_time: any;
  end_time: any;
  starting_date: string | Date;
  hostedBy: string;
  host_email: string;
  host_mobile: number;
  c_code: string; 
  ticket_quantity: number;
  ticket_sold?: number; 
  ticket_type: string;
  ticket_price: number;
  earnings?: number; 
  approvedBy?: string; 
  approvedAt?: string | any; 
  denial_reason?: string | null; 
  restrictions: string;
}
