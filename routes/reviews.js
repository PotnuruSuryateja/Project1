const express = require("express");
const router = express.Router({mergeParams : true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Review = require("../models/reviews.js");
const {validateReview,isLoggedin,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// const validateReview = (req,res,next)=>{
//     let { error } = reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// };

//reviews
//post review route

router.post("/",isLoggedin,validateReview, wrapAsync(reviewController.newReview));

//delet review route

router.delete("/:reviewId",isLoggedin,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports = router ;