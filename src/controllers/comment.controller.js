import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js"
import { apiError } from "../utils/apiError.js";
import { apiRespone } from "../utils/apiRespone.js";
import { asyncHandler } from "../utils/asyncHandler";


const getVideoComments = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video id")
    }
    const { page = 1, limit = 10 } = req.query

    const pageNum = Math.max(parseInt(page), 1)
    const limitNum = Math.min(parseInt(limit), 50)

    const aggregate = Video.aggregate([
        {
            $match: {video: new mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                "owner.password": 0,
                "owner.email": 0,
                "owner.fullName": 0,
                "owner.refreshToken": 0,
                "owner.watchHistory": 0,
                "owner.coverImage": 0
            }
        }
    ])

    const Options = {
        page: pageNum,
        limit: limitNum,
        createdAt: -1
    }

    const result = await Comment.aggregatePaginate(aggregate, Options)

    return res.status(200).json(
        new apiRespone(200, result, "Comments fetched successfully")
    )
})

const addComment = asyncHandler(async(req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new apiError(400, "VideoId is not valid")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new apiError(404, "Video not found")
    }

    const { content } = req.body
    if(!content?.trim()) {
        throw new apiError(400, "Comment should not be empty")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })

    return res.status(201).json(
        new apiRespone(201, comment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async(req, res) => {
    const { commentId } = req.params

    if(!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment id")
    }

    const { content } = req.body

    if(!content?.trim()) {
        throw new apiError(400, "Comment cannot be empty")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            $set: { content: content.trim() }
        },
        {new: true}
    )

    if(!updatedComment) {
        throw new apiError(404, "Comment not found or unauthorized")
    }

    return res.status(200).json(
        new apiRespone(200, updatedComment, "Updated comment successfully")
    )
})

const deleteComment = asyncHandler(async(req, res) => {
    const { commentId } = req.params

    if(!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid commentId")
    } 

    const deletedComment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: req.user._id
        }
    )

    if(!deletedComment) {
        throw new apiError(404, "Comment not found or Unauthorized")
    }

    return res.status(200).json(
        new apiRespone(200, null, "Deleted comment successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}