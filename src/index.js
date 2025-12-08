// require('dotevn').config({path: './env'})        //it will work but breaks the consistancy

import dotenv from "dotenv"
dotenv.config()

import connectDB from "./db/index.js";


connectDB()  // connectDB is an asyn method which we have written in './src/db/index.js' so it return promise.
.then(() => {
    app.on("error: ", ()=> {
        console.log("Error: ", error)
        throw error
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is runnig at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO DB connection FAILED !!! ", err);
})











/*
import mongoose from "mongoose";
import { DB_NAME } from './constants'

This also a way to connect the Database.

import express from "express"
const app = express()

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error", (error) => {
            console.log("Error : ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`app is listening on the port ${process.env.PORT}`)
        })

    } catch (error) {
        console.error("Error : ", error)
        throw error
    }
})()
*/