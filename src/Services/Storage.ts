import admin from "firebase-admin";
import serviceAccount from "../../stuhub-36067-firebase-adminsdk-xor75-e02a643b9e.json";
import * as dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});


const storage = admin.storage().bucket();

export  class FirebaseStorage {
    static uploadImage = async (
      filePath: string,
      destinationPath: string
    ): Promise<{}> => {
      try {
        await storage.upload(filePath, {
          destination: destinationPath,
          public: true,
          metadata: {
            cacheControl: "public, max-age=31536000",
          },
        });
  
        const file = storage.file(destinationPath);
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-09-2500",
        });
        return { status: true, url : url };
      } catch (error) {
        return { status: false, url: null };
      }
    };
  
    static listImages = async (folderPath: string): Promise<object> => {
      try {
        const [files] = await storage.getFiles({ prefix: folderPath });
        const urls = await Promise.all(
          files.map(async (file) => {
            const [url] = await file.getSignedUrl({
              action: "read",
              expires: "03-09-2500",
            });
            return url;
          })
        );
        return { status: true, urls : urls };
      } catch (error) {
        return { status: false, urls: null };
      }
    };
  
   
    static uploadCoverImages = async (
      files: { filePath: string; destinationPath: string }[]
    ): Promise<object> => {
      try {
        const results = await Promise.all(
          files.map(async (file) => {
            const { filePath, destinationPath } = file;
            return await this.uploadImage(filePath, destinationPath);
          })
        );
        return { status: true, results: results };
      } catch (error) {
        return { status: false, results: null };
      }
    };
  
   
    static getImage = async (imagePath: string): Promise<object> => {
      try {
        const file = storage.file(imagePath);
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-09-2500",
        });
        return { status: true, url: url };
      } catch (error) {
        return { status: false, url: null };
      }
    };
  }
  

