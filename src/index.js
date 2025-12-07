// require('dotevn').config({path: './env'})        it will work but breaks the consistancy

import dotenv from "dotenv"
dotenv.config()

import connectDB from "./db/index.js";



connectDB()












/*
import mongoose from "mongoose";
import { DB_NAME } from './constants'

This also a way to connect the Database.

import express from "express"
const app = express()

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    } catch (error) {
        console.error("Error : ", error)
        throw error
    }

    app.listen(process.env.PORT, () => {
        console.log(`app is listening on the port ${process.env.PORT}`)
    })
})()
*/