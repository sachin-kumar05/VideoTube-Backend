import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRespone } from "../utils/apiRespone.js";
import { asyncHandler } from "../utils/asyncHandler";


const getVideoComments = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const aggregate = await Comment.aggregate([
        {
            $match: {video: videoId}
        }
    ])

    const Options = {
        page,
        limit
    }

    const comments = await Comment.aggregatePaginate(aggregate, Options)

    if(!comments) {
        throw new apiError(500, "Something went wrong while fetching comments")
    }

    return res.status(200).json(
        new apiRespone(200, comments, "Comments fetched successfully")
    )
})

const addComment = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if(!content) {
        throw new apiError(400, "Comment can not be empty")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    if(!comment) {
        throw new apiError(500, "Something went wrong while creating comment")
    }

    return res.status(200).json(
        new apiRespone(200, comment, "Created comment successfully")
    )
})

const updateComment = asyncHandler(async(req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if(!content) {
        throw new apiError(400, "comment field can not be empty")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        },
        {new: true}
    )

    if(!updatedComment) {
        throw new apiError(500, "Something went wrong while updating the comment")
    }

    return res.status(200).json(
        new apiRespone(200, updatedComment, "Updated comment successfully")
    )
})

const deleteComment = asyncHandler(async(req, res) => {
    const { commentId } = req.params

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new apiRespone(200, "", "Deleted comment successfully")
    )
})

export{
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}