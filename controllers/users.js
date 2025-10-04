const User = require("../models/user.js");

module.exports.signup = async(req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser = new User({email,username});
        const regUser = await User.register(newUser,password);
        console.log(regUser);
        req.login(regUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust!!");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.login = async (req,res)=>{
        req.flash("success","Welcome back!!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
};

module.exports.logout = (req,res)=>{
    req.logout((err)=>{
        if(err) {
            return next(err);
        }
        req.flash("success","logged you out !");
        res.redirect("/listings");
    });

};