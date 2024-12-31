import {
  OrganizerSignupInterface,
  UserLoginInterface,
  UserSignupInterface,
} from "../../Interfaces/userInterface";
import db from "../../Config/knex";
import { Response } from "express";

export class AuthClass {
  isUserExists = async (email: string, mobile: string): Promise<any[]> => {
    try {
      const results: any = await db
        .select("*")
        .from("users")
        .where("email", email)
        .orWhere("mobile", mobile);
      return results;
    } catch (e) {
      throw e;
    }
  };

  userLogin = async (userData: UserLoginInterface): Promise<any[]> => {
    try {
      const results: any = await db
        .select("*")
        .from("users")
        .where("email", userData.email);
      return results;
    } catch (e) {
      throw e;
    }
  };

  userSignup = async (
    userData: UserSignupInterface,
    res: Response
  ): Promise<any[]> => {
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
      console.log(results);
      return results;
    } catch (e) {
      throw e;
    }
  };

  organizerSignup = async (
    userData: OrganizerSignupInterface
  ): Promise<any[]> => {
    try {
      await db("users").insert({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        c_code: userData.ccode,
        role: userData.role,
        password: userData.password,
        location: userData.location,
        longitude: userData.longitude,
        latitude: userData.latitude,
      });

      await db("organizations").insert({
        name: userData.collegeName,
        code: userData.collegeCode,
        mobile: userData.mobile,
        noc: userData.collegeNoc,
      });
      return [];
    } catch (e) {
      throw e;
    }
  };
}
