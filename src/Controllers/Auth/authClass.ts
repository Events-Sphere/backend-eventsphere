import {
  OrganizerSignupInterface,
  SquardInterface,
  UserLoginInterface,
  UserSignupInterface,
  VerifyUserIdentityInterface,
} from "../../Interfaces/userInterface";
import db from "../../Config/knex";
import { FormatDateAndTime } from "../../Utililes/formatDateAndTime";

export class AuthClass {
  isUserExistsOnMobileOrEmail = async (
    email: string,
    mobile: string
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results: any = await db
          .select("*")
          .from("users")
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

  isUserExistsOnMobileOrEmailWithoutSpecificId = async (
    id: number,
    email: string,
    mobile: string
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const results: any = await db
          .select("*")
          .from("users")
          .where("email", email)
          .orWhere("mobile", mobile)
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
        const results: any = await db("users").where({ _id: id }).update({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          c_code: userData.ccode,
          role: userData.role,
          password: userData.password,
          location: userData.location,
          proof: userData.proof,
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
        resolve({ status: true, data: [] });
      } catch (e) {
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
     const result=   await db("users").insert({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          c_code: userData.ccode,
          role: userData.role,
          password: userData.password,
          location: userData.location,
          longitude: parseFloat(userData.longitude),
          latitude:parseFloat(userData.latitude) ,
          proof:userData.proof
        });

        await db("organizations").insert({
          _id:result[0],
          name: userData.collegeName,
          code: userData.collegeCode,
          noc: userData.collegeNoc,
        });
        resolve({ status: true, data:result });
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

  getSingleUser = async (
    role: string,
    id: number
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        let results: any;
        switch (role) {
          case "user":
            results = await db.select("*").from("users").where({ _id: id });
            break;
          case "organizer":
            //PENDING --> Combine two tables
            results = await db.select("*").from("users").where({ _id: id });
            break;
          case "squard":
            results = await db.select("*").from("users").where({ _id: id });
            break;
          default:
            results = [];
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

  getAllUsers = async (
    role: string
  ): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        let results: any;
        switch (role) {
          case "user":
            results = await db.select("*").from("users");
            break;
          case "organizer":
            //PENDING --> Combine two tables
            results = await db.select("*").from("users");
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
