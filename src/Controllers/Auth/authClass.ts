import {
  OrganizerSignupInterface,
  SquardInterface,
  UserLoginInterface,
  UserSignupInterface,
  VerifyUserIdentityInterface,
} from "../../Interfaces/userInterface";
import db from "../../Config/knex";
import { FormatDateAndTime } from "../../Utililes/formatDateAndTime";
import { tableName } from "../../tables/table";

export class AuthClass {
  isUserExistsOnMobileOrEmail = async (
    email: string,
    mobile: string
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results: any = await db
          .select("*")
          .from("es_users")
          .where("email", email)
          .orWhere("mobile", mobile);
        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };

  isUserExistsOnIdAndRole = async (
    id: number,
    role: string
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results: any = await db
          .select("*")
          .from("users")
          .where("_id", id)
          .andWhere("role", role);
        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };

  isOrganizationCodeExists = async (
    code: number,
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results: any = await db
          .select("*")
          .from("es_organizations ")
          .where("code", code)

        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };

  isUserExistsOnMobileOrEmailWithoutSpecificId = async (
    id: number,
    email: string,
    mobile: string
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        // const results: any = await db
        //   .select("*")
        //   .from("users")
        //   .where("email", email)
        //   .orWhere("mobile", mobile)
        //   .whereNot({ _id: id });
        const results: any = await db
          .select("*")
          .from("users")
          .where((query) => {
            query.where("email", email).orWhere("mobile", mobile)
          })
          .whereNot({ _id: id });
        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };

  updateUserIdentity = async (
    id: number,
    userData: VerifyUserIdentityInterface
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const currentTime = FormatDateAndTime.getCurrentTimestamp();
        const results: any = await db("users").where({ _id: id }).update({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          c_code: userData.ccode,
          role: userData.role,
          password: userData.password,
          location: userData.location,
          proof: userData.proof,
          profile: userData.profile,
          status:"pending",
          requestedAt:currentTime
          
        });
        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };

  userLogin = async (
    userData: UserLoginInterface
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results: any = await db
          .select("*")
          .from("users")
          .where("email", userData.email);

        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };

  adminLogin = async (
    userData: UserLoginInterface
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      
      try {
        const results: any = await db
          .select("*")
          .from(tableName.ADMIN)
          .where("email", userData.email);

        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };

  userSignup = async (
    userData: UserSignupInterface
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results = await db("users").insert({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          c_code: userData.ccode,
          role: userData.role,
          password: userData.password,
          location: userData.location,
        });
        resolve({ status: true, data: results });
      } catch (e) {
        console.log(e)
        reject({
          status: false,
        });
      }
    });
  };

  organizerSignup = async (
    userData: OrganizerSignupInterface
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db("es_users").insert({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          c_code: userData.ccode,
          role: userData.role,
          password: userData.password,
          location: userData.location,
          longitude: parseFloat(userData.longitude),
          latitude: parseFloat(userData.latitude),
          proof: userData.proof,
          status:"pending"
        });

        await db("es_organizations").insert({
          _id: result[0],
          name: userData.collegeName,
          code: userData.collegeCode,
          noc: userData.collegeNoc,
        });
        resolve({ status: true, data: result });
      } catch (e) {
        console.log(e)
        reject({
          status: false,
        });
      }
    });
  };

  isVerifiedUser = async (
    id: number
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results = await db.select("*").from("users").where({ _id: id });
        resolve({ status: true, data: results });
      } catch (error) {
        reject({
          status: false,
        });
      }
    });
  };

  getUserProfile = async (
    role: string,
    id: number
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        let results: any;
        switch (role) {
          case "user":
            const user = await db.select("name", "email", "c_code", "mobile", "profile", "role", "location", "proof", "status").from("users").where({ _id: id });
            results =
            {
              name: user[0].name,
              email: user[0].email,
              c_code: user[0].c_code,
              mobile: user[0].mobile,
              profile: user[0].profile,
              role: user[0].role,
              location: user[0].location,
              proof: JSON.parse(user[0].proof),
              status: user[0].status,

            }

            break;
          case "organizer":
            //PENDING --> Combine two tables
            // "_id", "name", "email", "password", "c_code", "mobile", "profile", "role", "createdAt", "requestedAt", "approvedBy", "approvedAt", "denial_reason", "location", "favorite_events", "cart_events", "bookings", "proof", "longitude", "latitude", "status"


            const data1 = await db.select("name", "email", "c_code", "mobile", "profile", "role", "location", "proof", "status").from("users").where({ _id: id });
            const data2 = await db.select("name", "code", "noc").from("organizations").where({ _id: id });
            results = [
              {
                name: data1[0].name,
                email: data1[0].email,
                c_code: data1[0].c_code,
                mobile: data1[0].mobile,
                profile: data1[0].profile,
                role: data1[0].role,
                location: data1[0].location,
                proof: JSON.parse(data1[0].proof),
                status: data1[0].status,
                collegeName: data2[0].name,
                collegeCode: data2[0].code,
                noc: data2[0].noc,
              }
            ]
            break;
          case "squard":
            const squard = await db.select("name", "email", "c_code", "mobile", "profile", "role", "location", "proof", "status").from("users").where({ _id: id });
            results = [
              {
                name: squard[0].name,
                email: squard[0].email,
                c_code: squard[0].c_code,
                mobile: squard[0].mobile,
                profile: squard[0].profile,
                role: squard[0].role,
                location: squard[0].location,
                proof: JSON.parse(squard[0].proof),
                status: squard[0].status,

              }
            ]
            break;
          default:
            results = [];
            break;
        }
        resolve({ status: true, data: results });
      } catch (error) {
        console.log(error)
        reject({
          status: false,
        });
      }
    });
  };


  getUserNameAndLocation = async (
    role: string,
    id: number
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {

        const user = await db.select("name", "location").from("users").where({ _id: id });
        const results =
        {
          name: user[0].name,

          location: user[0].location,


        }


        resolve({ status: true, data: results });
      } catch (error) {
        console.log(error)
        reject({
          status: false,
        });
      }
    });
  };
  getAllUsers = async (
    role: string
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        let results: any;
        switch (role) {
          case "user":
            const users = await db.select('_id',
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
              'status').from("users").where({ role: "user" });
            // console.log(users);
            results = await Promise.all(
              users.map(async (user: any) => {
                console.log(user.bookings)
                const booking = await db("bookings").
                  select("*").whereIn("_id", user.bookings == null ? [] : JSON.parse(user.bookings));
                console.log(booking)
                return {
                  ...user,
                  bookingData: booking
                }
              })
            );
            results.forEach((user: any) => {
              user.createdAt = FormatDateAndTime.formatDate2(user.createdAt);
              user.requestedAt = user.requestedAt != null ? user.requestedAt = FormatDateAndTime.formatDate2(user.requestedAt) : null;
              user.approvedAt = user.approvedAt != null ? user.approvedAt = FormatDateAndTime.formatDate2(user.approvedAt) : null;
              delete user.bookings;
              delete user.password;
              delete user.profile;
              user.proof = JSON.parse(user.proof);
              user.bookingData.forEach((user: any) => {
                delete user.user_id;
                user.sub_event_items = JSON.parse(user.sub_event_items);
                user.createdAt = FormatDateAndTime.formatDate2(user.createdAt);
              })
            })
            break;
          case "organizer":
            //PENDING --> Combine two tables
            const org = await db.select('_id',
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
              'status').from("users").where({ role: "organizer" });
            // console.log(users);
            results = await Promise.all(
              org.map(async (user: any) => {
                console.log(user._id)
                const organization = await db("organizations").
                  select("*").where("_id", user._id);
                console.log(organization)
                return {
                  ...user,
                  organizationData: organization
                }
              })
            );
            results.forEach((user: any) => {
              user.createdAt = FormatDateAndTime.formatDate2(user.createdAt);
              user.requestedAt = user.requestedAt != null ? user.requestedAt = FormatDateAndTime.formatDate2(user.requestedAt) : null;
              user.approvedAt = user.approvedAt != null ? user.approvedAt = FormatDateAndTime.formatDate2(user.approvedAt) : null;
              delete user.bookings;
              delete user.password;
              delete user.profile;
              user.proof = JSON.parse(user.proof);
              user.organizationData.forEach((user: any) => {
                delete user._id;
                user.pending_events = JSON.parse(user.pending_events);
                user.active_events = JSON.parse(user.active_events);
                user.completed_events = JSON.parse(user.completed_events);
              })
            })
            break;
          case "squard":
            results = await db.select("*").from("users");
            break;
          default:
            results = [];
            break;
        }
        resolve({ status: true, data: results });
      } catch (error) {
        console.log(error)
        reject({
          status: false,
        });
      }
    });
  };

  deleteUser = async (
    role: string,
    id: number
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        let results: any;
        switch (role) {
          case "user":
            results = await db("users").where({ _id: id }).delete();
            break;
          case "organizer":
            //PENDING --> Delete two tables
            results = await db("users").where({ _id: id }).delete();
            break;
          case "squard":
            results = await db("users").where({ _id: id }).delete();
            break;
          default:
            results = 0;
            break;
        }
        resolve({ status: true, data: results });
      } catch (error) {
        reject({
          status: false,
        });
      }
    });
  };

  updateUserStatus = async (
    state: string,
    userId: number,
    approvedBy: number,
    denialReason?: string
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const currentTimestamp = FormatDateAndTime.getCurrentTimestamp();
        let results: any;
        if (state === "approve") {
          results = await db("users").where({ _id: userId }).update({
            approvedBy: approvedBy,
            approvedAt: currentTimestamp,
            status: "active",
          });
        } else {
          results = await db("users").where({ _id: userId }).update({
            approvedBy: approvedBy,
            approvedAt: currentTimestamp,
            status: "rejected",
            denial_reason: denialReason,
          });
        }

        resolve({ status: true, data: results });
      } catch (error) {
        reject({
          status: false,
        });
      }
    });
  };

  createSquard = async (
    userData: SquardInterface
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results = await db("users").insert({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          c_code: userData.ccode,
          role: userData.role,
          password: userData.password,
          location: userData.location,
          proof: userData.proof,
          profile: userData.profile,
          status: "active",
        });
        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };

  updateSquard = async (
    userData: any
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results = await db("users")
          .where({ _id: userData.userId })
          .update({
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            c_code: userData.ccode,
            role: userData.role,
            password: userData.password,
            location: userData.location,
            status: userData.status,
          });
        resolve({ status: true, data: results });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };
}
