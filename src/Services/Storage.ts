import admin from "firebase-admin";
import serviceAccount from "../Config/firebase-config"
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const storage = admin.storage().bucket();

export class FirebaseStorage {
  static uploadSingleImage = async (
    baseUrl: string,
    file: Express.Multer.File
  ): Promise<{ status: boolean; url?: string; message?: string }> => {
    try {
      const uniqueFileName = `${baseUrl}/${uuidv4()}.jpg`;
      const firebaseFile = storage.file(uniqueFileName);

      await firebaseFile.save(file.buffer, {
        public: true,
        metadata: {
          contentType: file.mimetype,
          cacheControl: "public, max-age=31536000",
        },
      });

      const [url] = await firebaseFile.getSignedUrl({
        action: "read",
        
        expires: "03-09-2030",
      });

      return { status: true, url: uniqueFileName };
    } catch (error) {
      console.error(`Error uploading image file : `, error);
      return { status: false, message: "Failed to upload image" };
    }
  };

  static uploadCoverImages = async (
    baseUrl: string,
    files: Express.Multer.File[]
  ): Promise<{ status: boolean; urls?: string[]; message?: string }> => {
    try {
      const urls: string[] = [];
      await Promise.all(
        files.map(async (file) => {
          const uniqueFileName = `${baseUrl}/${uuidv4()}.jpg`;
          const firebaseFile = storage.file(uniqueFileName);

          await firebaseFile.save(file.buffer, {
            public: true,
            metadata: {
              contentType: file.mimetype,
              cacheControl: "public, max-age=31536000",
            },
          });

          const [url] = await firebaseFile.getSignedUrl({
            action: "read",
            expires: "03-09-2030",
          });

          urls.push(uniqueFileName);
        })
      );

      return { status: true, urls };
    } catch (error) {
      console.error(`Error uploading cover images : `, error);
      return { status: false, message: "Failed to upload cover images" };
    }
  };

  static uploadSubEventCoverImages = async (
    baseUrl: string,
    files: Express.Multer.File[]
  ): Promise<{ status: boolean; urls?: string[]; message?: string }> => {
    try {
      const urls: string[] = [];

      await Promise.all(
        files.map(async (file) => {
          const uniqueFileName = `${baseUrl}/${uuidv4()}.jpg`;
          const firebaseFile = storage.file(uniqueFileName);

          await firebaseFile.save(file.buffer, {
            public: true,
            metadata: {
              contentType: file.mimetype,
              cacheControl: "public, max-age=31536000",
            },
          });

          const [url] = await firebaseFile.getSignedUrl({
            action: "read",
            expires: "03-09-2030",
          });

          urls.push(uniqueFileName);
        })
      );

      return { status: true, urls };
    } catch (error) {
      console.error(`Error uploading sub-event cover images : `, error);
      return {
        status: false,
        message: "Failed to upload sub-event cover images",
      };
    }
  };

  static deleteFile = async (
    filePath: string
  ): Promise<{ status: boolean; message?: string }> => {
    try {
      const file = storage.file(filePath);
      await file.delete();
      return { status: true, message: "File deleted successfully" };
    } catch (error) {
      console.error(`Error deleting file : `, error);
      return { status: false, message: "Failed to delete file" };
    }
  };

  static updateFile = async (
    filePath: string,
    file: Express.Multer.File
  ): Promise<{ status: boolean; url?: string; message?: string }> => {
    try {
      const firebaseFile = storage.file(filePath);

      await firebaseFile.save(file.buffer, {
        public: true,
        metadata: {
          contentType: file.mimetype,
          cacheControl: "public, max-age=31536000",
        },
      });

      const [url] = await firebaseFile.getSignedUrl({
        action: "read",
        expires: "03-09-2030",
      });

      return { status: true, url: filePath };
    } catch (error) {
      console.error(`Error updating file : `, error);
      return { status: false, message: "Failed to update file" };
    }
  };
}
