import {User} from "./../models/user.model.js";
import { ApiError } from "./ApiError.js";

const accessAndRefreshTokenGeneration = async (userId) => {
    const user = await User.findOne({_id: userId});
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    if(!accessToken || !refreshToken){
        throw new ApiError(501, "Something went Wrong in generating authentication token");
    }
    return {accessToken, refreshToken};
}

export default accessAndRefreshTokenGeneration