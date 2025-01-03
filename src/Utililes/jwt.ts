import jwt from "jsonwebtoken";
export class Jwt {
 static generateToken = async (userData: {
    id: number;
    role: string;
  }): Promise<{ status: boolean; data?: any }> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(userData)
        const SECRET_KEY = process.env.JWT_SECRET_KEY || "12345qwer";
        const token =jwt.sign(userData, SECRET_KEY, { expiresIn: '14d' });
        resolve({ status: true, data: token });
      } catch (e) {
        reject({
          status: false,
        });
      }
    });
  };
}
