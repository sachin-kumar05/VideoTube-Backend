import mongoose, {isValidObjectId} from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiRespone } from "../utils/apiRespone.js";

const createTweet = asyncHandler(async(req, res) => {
    const { content } = req.body

    if(!content?.trim()) {
        throw new apiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        owner: req.user._id,
        content: content.trim()
    })

    return res.status(201).json(
        new apiRespone(201, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async(req, res) => {
    const tweets = await Tweet.find({owner: req.user._id})
    .sort({ createdAt: -1})

    return res.status(200).json(
        new apiRespone(200, tweets, "Tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async(req, res) => {
    const { content } = req.body

    if(!content?.trim()) {
        throw new apiError(400, "Content is required")
    }

    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id")
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user._id
        },
        {
            $set: { content: content.trim() }
        },
        {new: true}
    )

    if(!updatedTweet) {
        throw new apiError(404, "Tweet not found or unauthorized")
    }

    return res.status(200).json(
        new apiRespone(200, updatedTweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async(req, res) => {
    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id")
    }

    const deletedTweet = await Tweet.findOneAndDelete(
        {
            _id: tweetId,
            owner: req.user._id
        }
    )

    if(!deletedTweet) {
        throw new apiError(404, "Tweet not found or unauthorized")
    }

    return res.status(200).json(
        new apiRespone(200, null, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
