import express, { json } from "express"
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = express();

// app.use(x) is used for apply middleware before reaching to the routes/controllers, Here 'x' is express middleware core part of express.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))   // static files(image, html, css, and js) are checked before APIs
app.use(cookieParser())

// import routers after these middleware declaration only because middleware execute in the order inwhich they are defined.
import userRouter from "./routes/user.router.js"

// router declaration
app.use("/api/v1/users", userRouter)

// https//:localhost/8000/api/v1/users/register

export {app}