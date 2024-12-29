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
    sub_events: any
  }
  