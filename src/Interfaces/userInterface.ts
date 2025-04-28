export interface UserLoginInterface {
  email: string; 
  password: string; 
}

export interface UserSignupInterface {
  name:string;
  email: string; 
  mobile:string;
  ccode:string;
  role:string;
  location:string;
  password: string;
}

export interface VerifyUserIdentityInterface {
  name:string;
  email: string; 
  mobile:string;
  ccode:string;
  role:string;
  location:string;
  password: string;
  proof:string;
  profile:String;
}

export interface OrganizerSignupInterface {
  name:string;
  email: string; 
  mobile:string;
  ccode:string;
  role:string;
  location:string;
  password: string;
  proof:string;
  longitude:string;
  latitude:string;
  collegeName:string;
  collegeCode:string;
  collegeNoc:string;
}
export interface SquardInterface {
  name:string;
  email: string; 
  mobile:string;
  ccode:string;
  role:string;
  location:string;
  password: string;
  proof:string[];
  profile:string;
  status:string;
  approvedBy:number
}

