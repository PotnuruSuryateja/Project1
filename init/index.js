const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

main()
    .then((res)=>{
        console.log("Connection successful");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async ()=> {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({
        ...obj,
        owner : "68c702558be31c918dc323f7",
    }))
    await Listing.insertMany(initData.data);
    console.log("Successful");
} 

initDB();

