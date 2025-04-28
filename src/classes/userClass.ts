import { table } from "console";
import db from "../Config/knex";
import { SquardInterface } from "../Interfaces/userInterface";
import { Iuser } from "../types/express";
import { FormatDateAndTime } from "../Utililes/formatDateAndTime";
import { tableName } from "../tables/table";

export class UserClass {

  private fetchUsersByRole = async (role: String) => {
    return await db.select('_id',
      'name',
      'email',
      'password',
      'c_code',
      'mobile',
      'profile',
      'role',
      'createdAt',
      'requestedAt',
      'approvedBy',
      'approvedAt',
      'denial_reason',
      'location',
      'bookings',
      'proof',
      'longitude',
      'latitude',
      'status').from("users").where({ role: role });
  };

  private fetchUsersByRoleAndStatus = async (role: String, status: string) => {
    return await db.select('_id',
      'name',
      'email',
      'password',
      'c_code',
      'mobile',
      'profile',
      'role',
      'createdAt',
      'requestedAt',
      'approvedBy',
      'approvedAt',
      'denial_reason',
      'location',
      'bookings',
      'proof',
      'longitude',
      'latitude',
      'status').from("users").where({ role: role }).andWhere({ status: status });
  };

  private fetchUsersByRoleAndId = async (role: String, id: number) => {
    return await db.select('_id',
      'name',
      'email',
      'c_code',
      'mobile',
      'profile',
      'role',
      'denial_reason',
      'location',
      'bookings',
      'proof',
      'longitude',
      'latitude',
      'status').from("users").where({ _id: id }).andWhere({ role: role });
  };

  private sanitiseAndFormatUser = (user: any) => {
    user.createdAt != null ? user.createdAt = FormatDateAndTime.formatDate2(user.createdAt) : null;
   user.requestedAt != null ? user.requestedAt = FormatDateAndTime.formatDate2(user.requestedAt) : null;
    user.approvedAt != null ? user.approvedAt = FormatDateAndTime.formatDate2(user.approvedAt) : null;
    delete user.bookings;
    delete user.password;
    delete user.profile;
    console.log(user.proof)
    if (user.proof && user.proof != undefined && user.proof != null) {
      user.proof = JSON.parse(user.proof);
    }
    return user;
  }
  public isUserExistsOnId = async (
    id: number,

  ) => {
    const data: any = await db
      .select("*")
      .from("users")
      .where("_id", id);
    return data;
  };

  isUserExistsOnMobileOrEmail = async (
    email: string,
    mobile: string
  ) => {
    const results: any = await db
      .select("*")
      .from("users")
      .where("email", email)
      .orWhere("mobile", mobile);
    return results;
  };

  public getUsersByRole = async (
    role: string
  ) => {
    let data: any = [];
    switch (role) {
      case "user":
        const users: any = await this.fetchUsersByRole(role);
        data = await Promise.all(
          users.map(async (user: any) => {
            console.log(user.bookings)
            const bookings = await db("bookings").
              select("*").whereIn("_id", user.bookings == null ? [] : JSON.parse(user.bookings));
            bookings.forEach((booking: any) => {
              delete booking.user_id;
              booking.sub_event_items = JSON.parse(booking.sub_event_items);
              booking.createdAt = FormatDateAndTime.formatDate2(booking.createdAt);
            })
            return {
              ...this.sanitiseAndFormatUser(user),
              bookingData: bookings
            }
          })
        );
        break;
      case "organizer":
        const org = await this.fetchUsersByRole(role);
        data = await Promise.all(
          org.map(async (user: any) => {
            console.log(user._id)
            const organization = await db("organizations").
              select("*").where("_id", user._id);
            organization.forEach((user: any) => {
              delete user._id;
              user.pending_events = JSON.parse(user.pending_events);
              user.active_events = JSON.parse(user.active_events);
              user.completed_events = JSON.parse(user.completed_events);
            })
            return {
              ...this.sanitiseAndFormatUser(user),
              organizationData: organization
            }
          })
        );
        break;
      case "squad":
        const squads: any = await this.fetchUsersByRole(role);
        data = await Promise.all(
          squads.map(async (user: any) => {

            return {
              ...this.sanitiseAndFormatUser(user),
            }
          })
        );
        break;

      default:
        data = [];
        break;
    }
    return data;
  }

  public getUsersByRoleAndStatus = async (
    role: string,
    status: string
  ) => {
    let data: any = [];
    switch (role) {
      case "user":
        console.log(role+":"+status)
        const users: any = await this.fetchUsersByRoleAndStatus(role, status);
        console.log(users)
        data = await Promise.all(
          users.map(async (user: any) => {
            console.log(user.bookings)
            const bookings = await db("bookings").
              select("*").whereIn("_id", user.bookings == null ? [] : JSON.parse(user.bookings));
            bookings.forEach((booking: any) => {
              delete booking.user_id;
              booking.sub_event_items = JSON.parse(booking.sub_event_items);
              booking.createdAt = FormatDateAndTime.formatDate2(booking.createdAt);
            })
            if(status == "pending"){
              const{approvedBy,approvedAt,denial_reason,...remaining}=this.sanitiseAndFormatUser(user)
              // return {
              //   ...this.sanitiseAndFormatUser(user),
              //   delete user.approvedBy,

              // }
              return remaining;
            }
            else{
              const{denial_reason,...remaingData}=this.sanitiseAndFormatUser(user)
              return {
                ...remaingData,
                bookingData: bookings
              }
            }
          })
        );
        break;
      case "organizer":
        const org = await this.fetchUsersByRoleAndStatus(role, status);
        data = await Promise.all(
          org.map(async (user: any) => {
            console.log(user._id)
            const [organization] = await db("organizations").
              select("*").where("_id", user._id);
            
              delete organization._id;
              


            if(status == "pending"){
              const{approvedBy,approvedAt,requestedAt,denial_reason,...remaining}=this.sanitiseAndFormatUser(user)
        
              return {
                ...remaining,
                organizationData: {
                  name:organization.name,
                  code:organization.code,
                  noc:organization.noc

                }
              }
            }
            else{
              organization.pending_events = JSON.parse(organization.pending_events);
              organization.active_events = JSON.parse(organization.active_events);
              organization.completed_events = JSON.parse(organization.completed_events);
            
              return {
                ...this.sanitiseAndFormatUser(user),
                organizationData: organization
              }
            }
            



            
          })
        );
        break;
      case "squard":
        data = await db.select("*").from("users");
        break;
      default:
        data = [];
        break;
    }
    return data;
  }

  public getUserProfileByRoleAndId = async (
    role: string,
    id: number
  ) => {
    switch (role) {
      case "user":
        const [user]: any = await this.fetchUsersByRoleAndId(role, id);
        if (!user) return null
        return await this.sanitiseAndFormatUser(user);
      case "organizer":
        const [org] = await this.fetchUsersByRoleAndId(role, id);
        if (!org) return null
        const [orgData] = await db("organizations").
          select("*").where("_id", org._id);
        const organization = {
          ...orgData,
          pending_events: JSON.parse(orgData.pending_events),
          active_events: JSON.parse(orgData.active_events),
          completed_events: JSON.parse(orgData.completed_events),
        };
        delete organization._id
        return await {
          ...this.sanitiseAndFormatUser(org),
          organizationData: organization
        };
      case "squad":
      const [squard]: any = await this.fetchUsersByRoleAndId(role, id);
        if (!squard) return null
        return await this.sanitiseAndFormatUser(squard)
      default:
        return null;
    }
  }

  createSquad = async (
    userData: SquardInterface
  ) => {
    const currentTime= FormatDateAndTime.getCurrentTimestamp();
    const results = await db("users").insert({
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      c_code: userData.ccode,
      role: "squad",
      password: userData.password,
      location: userData.location,
      profile: userData.profile,
      status: "active",
      approvedBy:userData.approvedBy,
      approvedAt:currentTime
    });
    return results;
  };

  createAdmin = async (
    email: String,
    password: String
  ) => {
    const results = await db(tableName.ADMIN).insert({
      email: email,
      password: password,

    });
    return results;
  };


}


export default UserClass;