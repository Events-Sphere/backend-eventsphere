import admin from "firebase-admin";
import serviceAccount from "../../stuhub-36067-firebase-adminsdk-xor75-e02a643b9e.json";
import * as dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const storage = admin.storage().bucket();

export class FirebaseStorage {
  static uploadSingleImage = async (
    baseUrl : string,
    file: Express.Multer.File
  ): Promise<{ status: boolean; url?: string; message?: string }> => {
    const uniqueFileName = `${baseUrl}/main_${Date.now()}.jpg`;

    try {
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

      return { status: true, url : uniqueFileName };
    } catch (error) {
      console.error(`Error uploading image file : `, error);
      return { status: false, message: "Failed to upload image" };
    }
  };

  static uploadCoverImages = async (
    baseUrl : string,
    files: Express.Multer.File[]
  ): Promise<{ status: boolean; urls?: string[]; message?: string }> => {
    try {
      const urls: string[] = [];

      await Promise.all(
        files.map(async (file, index) => {
          const uniqueFileName = `${baseUrl}/cover_${index}_${Date.now()}.jpg`;

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
    baseUrl : string,
    files: Express.Multer.File[]
  ): Promise<{ status: boolean; urls?: string[]; message?: string }> => {
    try {
      const urls: string[] = [];

      await Promise.all(
        files.map(async (file, index) => {
          const uniqueFileName = `${baseUrl}/cover_${index}_${Date.now()}.jpg`;

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
      console.error(
        `Error uploading sub-event cover images : `,
        error
      );
      return { status: false, message: "Failed to upload sub-event cover images" };
    }
  };
}
