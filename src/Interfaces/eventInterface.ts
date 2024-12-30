export interface EventInterface {
    _id: number;
    name: string;
    location: string;
    org_id: number;
    description: string;
    registration_start: Date;
    registration_end: Date;
    longitude: number;
    latitude: number;
    category: string;
    sub_event_items: string;
    tags: string;
    audience_type: string;
    currency: string;
    main_image: string;
    cover_images: string;
    is_main: number;
    status: number;
    sub_events: SubEventInterface[]
  }

  export interface MainEventInterface {
    _id: number;
    name: string;
    location: string;
    org_id: number;
    description: string;
    registration_start: Date;
    registration_end: Date;
    longitude: number;
    latitude: number;
    category: string;
    sub_event_items: string;
    tags: string;
    audience_type: string;
    currency: string;
    main_image: string;
    cover_images: string;
    is_main: number;
    status: number;
  }


export interface SubEventInterface {
    _id: number;
    event_id: number;
    name: string;
    description: string;
    cover_images: string[];
    video_url?:string;
    start_time: EpochTimeStamp;
    end_time:EpochTimeStamp;
    starting_data:Date;
    hostedBy:string;
    host_email:string;
    host_mobile:number;
    c_code:string;
    ticket_quantity:number;
    ticket_sold:number;
    ticket_type:string;
    ticket_price:number;
    earnings:number;
    approvedBy:string;
    approvedAt:EpochTimeStamp;
    denial_reason?:string;
    restriction:string[];
  }
  