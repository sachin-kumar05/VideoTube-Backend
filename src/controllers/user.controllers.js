import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {apiRespone} from "../utils/apiRespone.js"
import { use } from "react"


const registerUser = asyncHandler( async (req, res) => {
    // get user input from frontend
    // validate input - not empty
    // check if user already exists: username, email
    // check for images, check avatar
    // upload them to cloudinary - avatar
    // create user object - create entery in db
    // remove password and refresh token field from response
    // check for user creation
    // return respone 

    const {userName, password, fullName, email} = req.body
    console.log("Email : ", email);

    if(
        [fullName, userName, email, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{userName}, {email}]
    })

    if(existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    avatar = await uploadOnCloudinary(avatarLocalPath)
    coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new apiError(400, "Avatar file is required")
    }

    const user = User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiRespone(200, createdUser, "User registered successfully")
    )
})

export { registerUser }