const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN ;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    try {
        const { search } = req.query;
        let allListings;
        let flashMessage = null; // store error temporarily

        if (search && search.trim() !== "") {
            allListings = await Listing.find({
                title: { $regex: search, $options: "i" }
            });

            if (allListings.length === 0) {
                flashMessage = `Not found !`;
                allListings = await Listing.find({});
            }
        } else {
            allListings = await Listing.find({});
        }

        res.render("listings/index.ejs", {
            allListings,
            error: flashMessage // Pass directly to EJS
        });

    } catch (err) {
        console.error("Error fetching listings:", err);
        res.render("listings/index.ejs", {
            allListings: [],
            error: "Something went wrong while fetching listings."
        });
    }
};

module.exports.newFormRender = async (req, res) => {
    let response = await geocodingClient
        .forwardGeocode({
            query : req.body.listing.location,
            limit : 1,
        })
        .send();

    let url = req.file.path;
    let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { filename , url};
  newListing.geometry = response.body.features[0].geometry;
  let saved = await newListing.save();
  console.log(saved);
  req.flash("success","New listing Created!!");
  res.redirect("/listings");
};

module.exports.updateFormRender = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!!");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs",{listing});
};

module.exports.destroy = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!!");
    res.redirect("/listings");
};

module.exports.show = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews",populate : {path : "author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};