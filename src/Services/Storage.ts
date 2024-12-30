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

  static uploadMainImage = async (event: any): Promise<{status:boolean , url?:any , urls?:any , message?:string}> => {
  
  const uniqueMainImageName = `events/${
    event._id
  }/main_image_${Date.now()}.jpg`;

  try {
    await storage.upload(event.main_image.path, {
      destination: uniqueMainImageName,
      public: true,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    const file = storage.file(uniqueMainImageName);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2030",
    });
    return { status: true, url: url };
  } catch (error) {
    console.log("Error : uploading main event image :"+error);
    return { status: false, url: null };
  }

};

static uploadCoverImages = async (event: any): Promise<{status:boolean , url?:any , urls?:any , message?:string}> => {
  const coverImages = JSON.parse(event.cover_images || "[]");

  if (coverImages.length === 0) {
    return {status: false , urls:null};
  }

  const images: { filePath: string; destinationPath: string }[] = coverImages.map((image: string, index: number) => {
    const uniqueCoverImageName = `events/${
      event._id
    }/cover_images/cover_${index}_${Date.now()}.jpg`;
    return { filePath: image, destinationPath: uniqueCoverImageName };
  });

  try {

     const imageUrls : string[] = [];

     await Promise.all(
      images.map(async (image) => {
        const { filePath, destinationPath } = image;
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
            expires: "03-09-2030",
          });
          imageUrls.push(url);
        } catch (error) {
            return {status : false , message:"something went wrong try again"};
        }
      })
    );

    return { status: true, urls:imageUrls };

  } catch (error) {
    return { status: false, urls: null };
  }
};

 static uploadSubEventCoverImages = async (event: any): Promise<{status:boolean , url?:any , urls?:any , message?:string}> => {
  if (!Array.isArray(event.sub_events)) {
    return {status:false , urls:null};
  }

  const subEventUrls: string[][] = [];

  for (const subEvent of event.sub_events) {
    if (Array.isArray(subEvent.cover_images)) {
      const urls: string[] = [];

      for (let imageIndex = 0; imageIndex < subEvent.cover_images.length; imageIndex++) {
        const image = subEvent.cover_images[imageIndex];
        const uniqueSubEventImageName = `events/${event._id}/sub_events/${subEvent._id}/cover_${imageIndex}_${Date.now()}.jpg`;

        try {
          await storage.upload(image, {
            destination: uniqueSubEventImageName,
            public: true,
            metadata: {
              cacheControl: "public, max-age=31536000",
            },
          });

          const file = storage.file(uniqueSubEventImageName);
          const [url] = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2030",
          });

          urls.push(url);
        } catch (error) {
          return {status : false , message: `Failed to upload sub-event image for sub_event_id ${subEvent._id}:`};
        }
      }
      subEventUrls.push(urls);
    } else {
       return {status : false, urls:null};
    }
  }
  return {status : true , urls : subEventUrls};
};

};
