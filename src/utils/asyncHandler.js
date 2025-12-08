//asyncHandler is a higher order function that wraps async route handlers in a resolved Promise so that unhandled errors automatically go to Express error middleware using next(err), eliminating the need for repetitive try/catch blocks.



const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler()).reject((err) => next(err))
    }
}

export {asyncHandler}






















//const asyncHandler = () => {}  // Here asyncHandler is a higher order function.
//const asyncHandler = (fun) => { () => {} }  // Here we have taken a function "fun" as argument, and also writen a function inside asycHandler.
//const asyncHandler = (fun) => () => {}    // Here we have removed the currly bracket of asyncHandler function so that we don't have to return.

// const asyncHandler = (fun) => async(req, res, next) => {
//     try {
//         await fun(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }



//export {asyncHandler}