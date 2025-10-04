const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const {isLoggedin , isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });



// const validateListing = (req,res,next)=>{
//     let { error } = listingSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// };

//index route

router.get("/",wrapAsync(listingController.index));

//new 
router.get("/new", isLoggedin,(req,res)=>{
    res.render("listings/new.ejs");
});

router.post("/",upload.single("listing[image][url]"),validateListing,wrapAsync(listingController.newFormRender));
//update

router.get("/:id/edit",isLoggedin, isOwner,upload.single("listing[image][url]"),validateListing,wrapAsync(listingController.updateFormRender));

router.put("/:id",upload.single("listing[image][url]"), wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file != "undefined"){
        let url= req.file.path ;
        let filename = req.file.filename;

        listing.image = { url , filename};
        await listing.save();
    }

    req.flash("success","listing Updated!!");
    res.redirect(`/listings/${id}`);
}));

//delete
router.delete("/:id" ,isLoggedin,isOwner,wrapAsync(listingController.destroy));

//show route

router.get("/:id",wrapAsync(listingController.show));

module.exports = router;