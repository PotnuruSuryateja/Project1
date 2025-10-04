if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// const mongo_url = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl = process.env.ATLAS_URL;

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true,
    }
};

main()
    .then((res)=>{
        console.log("Connection successful");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

// app.get("/",(req,res)=>{
//     res.send("Hi,I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user ;
    next();
});

// app.get("/demouser", async (req,res) =>{
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "surya"
//     });

//     let regUser = await User.register(fakeUser,"1234");
//     res.send(regUser);
// });

// const validateListing = (req,res,next)=>{
//     let { error } = listingSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// };

// const validateReview = (req,res,next)=>{
//     let { error } = reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// };

//listings routes
app.use("/listings",listingRouter);

//reviews routes
app.use("/listings/:id/reviews",reviewsRouter);

//user route

app.use("/",userRouter);


// app.get("/test",async (req,res)=>{
//     let temp = new Listing({
//         title : "my home",
//         description : "good",
//         price : 10000,
//         location : "priyagraharam",
//         country : "India"
//     });

//     await temp.save();
//     res.send("successful");
// });

// //index route

// app.get("/listings",wrapAsync(async(req,res)=>{
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs",{allListings});
//     console.log("Successful!!");
// }));

// //new 
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs");
// });

// app.post("/listings",validateListing, wrapAsync(async (req, res) => {
//   const newListing = new Listing(req.body.listing);
//   await newListing.save();
//   res.redirect("/listings");
// }));

// //update

// app.get("/listings/:id/edit",validateListing,wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     let listing = await Listing.findById(id);
//     res.render("listings/edit.ejs",{listing});
// }));

// app.put("/listings/:id", wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));

// //delete
// app.delete("/listings/:id" ,wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }));

// app.post("/listings",async (req,res)=>{
//     let newlisting = new Listing( req.body.listing);
//     await newlisting.save();
//     console.log("Successful");
//     res.redirect("/listings");
// });

// //show route

// app.get("/listings/:id",wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     let listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{listing});
// }));

// //reviews
// //post review route

// app.post("/listings/:id/reviews",validateReview, wrapAsync(async (req,res)=>{
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();

//     res.redirect(`/listings/${listing._id}`);
// }));

// //delet review route

// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async (req,res)=>{
//     let {id , reviewId} = req.params;

//     await Listing.findByIdAndUpdate(id ,{$pull : {reviews : reviewId}});
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
// }));

app.use((req,res,next)=>{
    throw new ExpressError(404,"Not found!!");
});

app.use((err,req,res,next)=>{
    let {statusCode = 500,message="Something went wrong"}= err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("listening!!");
});