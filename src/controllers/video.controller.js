import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiRespone } from "../utils/apiRespone.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async(req, res) => {
    // get userId
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query
    const allVideos = await Video.aggregate([
        //TODO: I have to write aggreagate pipeline
    ])
})

const publishAVideo = asyncHandler(async(req, res) => {
    // verify input from user both text and file
    // Calculate the duration of video.
    const {title, description} = req.body
    if(!(title && description)) {
        throw new apiError(400, "Title and Description is required")
    } 

    const videoFileLocalPath = req.files?.videoFile?.[0].path;
    const thumbnailLocalPath = req.files?.videoFile?.[0].path;

    if(!videoFileLocalPath) {
        throw new apiError(400, "Video file is required")
    }
    
    if(!thumbnailLocalPath) {
        throw new apiError(400, "Thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    if(!videoFile.url) {
        throw new apiError(400, "Error while uploading the videoFile on cloudinary")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail.url) {{
        throw new apiError(400, "Error while uploading the thumbnail on cloudinary")
    }}

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })

    return res.status(200).json(
        new apiRespone(200, video, "Videofile uploaded successfully")
    )
})

const getVideoById = asyncHandler(async(req, res) => {
    // verify if video exist 
    // send the video in response
    const {videoId} = req.params

    const video = await Video.findById(videoId)
    if(!video) {
        throw new apiError(404, "Video is not found")
    }

    return res.status(200).json(
        new apiRespone(200, video, "Found video successfully")
    )
})

const updateVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    
    const {title, description} = req.body

    if(!(title && description)) {
        throw new apiError(400, "title and description both fields are required")
    }
    //TODO: I have to also update thumbnail.
    const updatedVideoDetails = await Video.findByIdAndUpdate(
        {
            videoId,
            $set: {
                title: title,
                description: description
            },
        },
        {new: true}
    )

    return res.status(200).json(
        new apiRespone(200, updatedVideoDetails, "Video details updated successfully")
    )
})

const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = params

    const deletedVideo = await Video.findByIdAndDelete({videoId})

    return res.status(200).json(
        new apiRespone(200, deleteVideo, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async(req, res) => {
    const {videoId} = req.params

    await findByIdAndUpdate(
        {
            videoId,
            $set: {
                isPublic: !isPublic
            }
        }
    )

    return res.status(200).json(
        new apiRespone(200, "", "toggled successfully")
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

