var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
var middleware=require("../middleware");

//root route
router.get("/",function(req,res){
	res.render("landing");
});

//show register form
router.get("/register", function(req, res){
	res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register", function(req, res){
	var newUser=new User({
		username: req.body.username,
		firstName: req.body.firstname,
		lastName: req.body.lastname,
		email: req.body.email,
		avatar: req.body.avatar
	});

	if(req.body.adminCode===process.env.ADMIN_CODE)
	{
		newUser.isAdmin=true;
	}

	User.register(newUser, req.body.password, function(err, user){
		if(err)
		{
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		else
		{
			passport.authenticate("local")(req, res, function(){
				req.flash("success", "Welcome to YelpCamp " + user.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

//show login form
router.get("/login", function(req, res){
	res.render("login", {page: "login"});
});

//handle login logic
router.post("/login", passport.authenticate("local", 
	{
		failureRedirect: "/login",
		failureFlash: true,
	}), function(req, res){
				req.flash("success", "Welcome back "+req.user.username);
				res.redirect("/campgrounds");
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

// User profile
router.get("/users/:id", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err)
		{
			req.flash("error", "Something went wrong.")
			res.redirect("/");
		}
		else
		{
			res.render("users/show", {user:foundUser});
		}
	});
});

module.exports=router;