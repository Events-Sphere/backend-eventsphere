import bcrypt from "bcrypt";
export class PasswordEncryption {
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error("Error while password hashing : " + error);
    }
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const comparedPassword = await bcrypt.compare(password, hashedPassword);
      return comparedPassword;
    } catch (error) {
      throw new Error("Error while password hashing : " + error);
    }
  }
}
