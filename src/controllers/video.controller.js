import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiRespone } from "../utils/apiRespone.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async(req, res) => {
    const {
        page = 1, 
        limit = 10, 
        query, 
        sortBy = "createdAt", 
        sortType = "desc", 
        userId
    } = req.query
    
    const pageNum = Math.max(parseInt(page), 1)
    const limitNum = Math.min(parseInt(limit), 50)

    const matchStage = { isPublic: true }

    if(query?.trim()) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    if(userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    if(!matchStage) {
        throw new apiError(400, "Nothing to match")
    }

    const sortStage = {
        [sortBy]: sortType === "asc" ? 1 : -1
    }

    const aggregate = Video.aggregate([
        {
            $match: matchStage
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

    const options = {
        page: pageNum,
        limit: limitNum,
        sort: sortStage
    }

    const result = await Video.aggregatePaginate(aggregate, options)

    return res.status(200)
    .json(
        new apiRespone(200, result, "Video fetched successfully")
    )

})

const publishAVideo = asyncHandler(async(req, res) => {

    const {title, description} = req.body

    if(!(title?.trim() && description?.trim())) {
        throw new apiError(400, "Title and description is required")
    } 

    const videoFileLocalPath = req.files?.videoFile?.[0].path;

    if(!videoFileLocalPath) {
        throw new apiError(400, "Video file is required")
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

    if(!thumbnailLocalPath) {
        throw new apiError(400, "Thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)

    if(!videoFile.url) {
        throw new apiError(500, "Something went wrong while uploading the videoFile.")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url) {{
        throw new apiError(400, "Something went wrong while uploading the thumbnail.")
    }}

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: videoFile.duration,
        owner: req.user._id
    })

    return res.status(201).json(
        new apiRespone(201, video, "Video file uploaded successfully")
    )
})

const getVideoById = asyncHandler(async(req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video id")
    }

    const video = await Video.findOne({
        _id: videoId,
        $or: [
            {isPublic: true},
            {owner: req.user._id}
        ]
    })

    if(!video) {
        throw new apiError(404, "Video not found")
    }

    return res.status(200).json(
        new apiRespone(200, video, "Found video successfully")
    )
})

const updateVideo = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video id")
    }
    
    const { title, description } = req.body
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

    const updateField = {}

    if(title?.trim()) updateField.title = title.trim()
    if(description?.trim()) updateField.description = description.trim()

    if(thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if(!thumbnail.url) {
            throw new apiError(500, "Thumbnail upload failed")
        }

        updateField.thumbnail = thumbnail.url
    }

    if(!Object.keys(updateField).length) {
        throw new apiError(400, "Nothing to update")
    }

    const updatedVideoDetails = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user._id
        },
        {
            $set: updateField
        },
        {new: true}
    )

    if(!updatedVideoDetails) {
        throw new apiError(404, "Video not found or unauthorized")
    }

    return res.status(200).json(
        new apiRespone(200, updatedVideoDetails, "Video details updated successfully")
    )
})

const deleteVideo = asyncHandler(async(req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video id")
    }

    const deletedVideo = await Video.findOneAndDelete(
        {
            _id: videoId,
            owner: req.user._id
        }
    )

    if(!deletedVideo) {
        throw new apiError(404, "Video not found or unauthorized")
    }

    return res.status(200).json(
        new apiRespone(200, null, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video id")
    }

    const video = await Video.findOneAndUpdate(
        { 
            _id: videoId, 
            owner: req.user._id 
        },
        [
            { $set: 
                { isPublic: 
                    { $not: "$isPublic" } 
                } 
            }
        ],
        { new: true }
    )

    if(!video) {
        throw new apiError(404, "Video not found or unauthorized")
    }

    return res.status(200).json(
        new apiRespone(200, "", "Toggled successfully")
    )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

