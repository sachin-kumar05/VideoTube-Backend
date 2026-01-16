import mongoose, {isValidObjectId} from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiRespone } from "../utils/apiRespone.js";

const createTweet = asyncHandler(async(req, res) => {
    const { content } = req.body

    if(!content) {
        throw new apiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        owner: req.user._id,
        content
    })

    if(!tweet) {
        throw new apiError(500, "Something went wrong while creating the user")
    }

    return res.status(200).json(
        new apiError(200, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async(req, res) => {
    const tweets = await Tweet.find({owner: req.user._id})

    if(tweets.length == 0) {
        throw new apiError(400, "No tweet found")
    }

    return res.status(200).json(
        new apiRespone(200, tweets, "All tweets fetched Successfully")
    )
})

const updateTweet = asyncHandler(async(req, res) => {
    const { content } = req.body

    if(!content) {
        throw new apiError(400, "Content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        req.params,
        {
            content
        },
        {new: true}
    )

    return res.status(200).json(
        new apiRespone(200, tweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    await Tweet.findByIdAndDelete({tweetId})

    return res.status(200).json(
        new apiRespone(200, "", "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
