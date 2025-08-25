import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middlewares/multer.middleware.js";

const registerUser = asyncHandler(async (req, res) => {
    // Data From Frontend
    const { username, email, password, fullName } = req.body;
    // console.log(req.body)
    // username = username.toLowerCase();

    // data validation - empty or not
    if (username === "" || email === "" || password === "" || fullName === "") {
        throw new ApiError(400, "Fields are Required");
    }
    // check if user already exist
    else if (await User.findOne({ $or: [{ username }, { email }] })) {
        console.log(await User.findOne({ $or: [{ username }, { email }] }))
        throw new ApiError(400, "USER is already Regestered");
    }
    console.log(req.files);
    const localFileAvatar = req.files?.avatar[0]?.path;
    console.log(localFileAvatar);
    let localFileCoverImage;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        localFileCoverImage = req.files.coverImage[0].path;
    }

    if (!localFileAvatar) {
        throw new ApiError(400, "Avatar is Required");
    }
    // upload image to cloudnary
    const avatarUrl = await uploadFile(localFileAvatar);
    const coverImageUrl = await uploadFile(localFileCoverImage);
    // chaeck image uploaded to the cloudnary
    console.log(avatarUrl);
    console.log(coverImageUrl)
    if (!avatarUrl) {
        throw new ApiError(400, "Avatar is Required!!!");
    }
    // add to the database
    console.log(fullName);
    await User.create(
        {
            fullname: fullName,
            email: email,
            password: password,
            username: username,
            avatar: avatarUrl,
            coverImage: coverImageUrl || ""
        }
    )
    // remove password and refresh token from the response
    const createdUser = await User.findOne({username}).select(
        "-password -refreshToken"
    );

    // return response
    if (!createdUser) {
        throw new ApiError(500, "Failed to Regester User!!!");
    }
    return res.status(201).json(
        createdUser,
        new ApiResponse(201, "User Regestered Sucessfully!!!")
    )
})

export { registerUser };