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
  static uploadMainImage = async (
    file: Express.Multer.File,
    eventId: number
  ): Promise<{ status: boolean; url?: string; message?: string }> => {
    const uniqueFileName = `events/${eventId}/main_${Date.now()}.jpg`;

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
      console.error(`Error uploading main event image for event ${eventId}:`, error);
      return { status: false, message: "Failed to upload main image" };
    }
  };

  static uploadCoverImages = async (
    files: Express.Multer.File[],
    eventId: number
  ): Promise<{ status: boolean; urls?: string[]; message?: string }> => {
    try {
      const urls: string[] = [];

      await Promise.all(
        files.map(async (file, index) => {
          const uniqueFileName = `events/${eventId}/coverImages/cover_${index}_${Date.now()}.jpg`;

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
      console.error(`Error uploading cover images for event ${eventId}:`, error);
      return { status: false, message: "Failed to upload cover images" };
    }
  };

  static uploadSubEventCoverImages = async (
    files: Express.Multer.File[],
    eventId: number,
    subEventId: number
  ): Promise<{ status: boolean; urls?: string[]; message?: string }> => {
    try {
      const urls: string[] = [];

      await Promise.all(
        files.map(async (file, index) => {
          const uniqueFileName = `events/${eventId}/subevents/${subEventId}/cover_${index}_${Date.now()}.jpg`;

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
        `Error uploading sub-event cover images for event ${eventId}, sub-event ${subEventId}:`,
        error
      );
      return { status: false, message: "Failed to upload sub-event cover images" };
    }
  };
}
