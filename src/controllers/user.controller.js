import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import accessAndRefreshTokenGeneration from "./../utils/Access_Refresh_Generation.js";
import jwt, { decode } from "jsonwebtoken";

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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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
    const createdUser = await User.findOne({ username }).select(
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


const loginUser = asyncHandler(async (req, res) => {
    // data from frontend
    const { username, password } = req.body;
    // authenticate the data
    if (!username && !password) {
        throw new ApiError(400, "Username and password is required...");
    }
    const user = await User.findOne({ username });
    // authenticate the password
    if (! await user.isPasswordCorrect(password)) {
        throw new ApiError(401, "Invalid Credentials");
    }
    // refresh and access token
    const { accessToken, refreshToken } = await accessAndRefreshTokenGeneration(user._id);
    // saving refresh token in database
    user.refreshToken = refreshToken;
    user.save(
        {
            validateBeforeSave: false
        },
        {
            new: true
        }
    );
    // setting the options for cookie
    const options = {
        httpsOnly: true,
        secure: true
    }
    // return res and setting cookie and header
    return res.
        status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "User Logined Sucessfullty....", user)
        );

});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findOneAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpsOnly: true,
        secure: true
    }
    console.log(user.refreshToken)
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, "User Logout Sucessfully")
        );
})

const refreshAcess = asyncHandler(async (req, res) => {
    const incoomingRefreshToken = req.cookie?.refreshToken || req.header("Authorization")?.replace("Bearer", "");
    if (!incoomingRefreshToken) {
        throw new ApiError(401, "Invalid User");
    }
    const decodedToken = jwt.verify(incoomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid User Request");
    }

    if (user.refreshToken !== incoomingRefreshToken) {
        throw new ApiError(401, "Unauthorized User");
    }

    console.log(await accessAndRefreshTokenGeneration(user._id));
    const { accessToken, refreshToken } = await accessAndRefreshTokenGeneration(user._id);

    console.log(accessToken);
    console.log(refreshToken);

    user.refreshToken = refreshToken;

    user.save(
        {
            validateBeforeSave: false
        },
        {
            new: true
        }
    )

    const options = {
        httpsOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "Access and Refresh Token Renewed")
        );

})

export { registerUser, loginUser, logoutUser, refreshAcess };