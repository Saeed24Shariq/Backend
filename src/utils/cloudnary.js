import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

const uploadFile = async (localFile) => {
    if (localFile) {
        // Configuration
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_CODE
        });
        try {
            const uploadresult = await cloudinary.uploader.upload(localFile, {
                resource_type: "auto",
            });
            // console.log("File Uploaded Sucessfully");
            fs.unlinkSync(localFile);
            return uploadresult.url;
        }
        catch(error){
            fs.unlinkSync(localFile);
            console.log("File Upload Failed", error);
            return null;
        }
    }
    else {
        return null;
    }
}

export {uploadFile}