import { UserLoginInterface } from "../../Interfaces/userInterface";
import db from "../../Config/knex";

export class AuthClass {
  userLogin = async (userData: UserLoginInterface): Promise<any[]> => {
    return new Promise(async (resolve, rejects) => {
      try {
        const results: any[] = await db("users").where(userData.email);
        if (results.length === 0) {
          rejects([]);
        } else {
          resolve(results);
        }
      } catch (e) {
        rejects([]);
      }
    });
  };
}
