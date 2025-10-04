const mongoose = require("mongoose");
const Review = require("./reviews.js");
const { ref } = require("joi");

const listingSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    image : {
        filename : {
            type : String,
            default : "listingimage"
        },
        url :{
           type : String,
            default : "https://img.freepik.com/free-photo/luxury-bedroom-hotel_1150-10836.jpg?semt=ais_hybrid&w=740&q=80",
            set : (v) => v === "" ? "https://img.freepik.com/free-photo/luxury-bedroom-hotel_1150-10836.jpg?semt=ais_hybrid&w=740&q=80" : v 
        }
    },
    price : Number,
    location : String,
    country : String,
    reviews : [ {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Review"
    }, ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

listingSchema.post("findOneAndDelete", async (listing)=>{
    if(listing){
        await Review.deleteMany({_id :{ $in : listing.reviews}});
    }
});

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing ;

