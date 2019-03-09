var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
var Campground=require("../models/campground");
var middleware=require("../middleware");
var async=require("async");
var nodemailer=require("nodemailer");
var crypto=require("crypto");

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
				if(req.user.isAdmin)
				{
					req.flash("success", "Welcome back "+req.user.username+"\n Logged in as administrator");
					res.redirect("/campgrounds");
				}
				else
				{
					req.flash("success", "Welcome back "+req.user.username);
					res.redirect("/campgrounds");
				}
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

//forgot password
router.get("/forgot", function(req, res){
	res.render("forgot");
});

router.post("/forgot", function(req, res, next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buf){
				var token=buf.toString("hex");
				done(err, token);
			});
		},
		function(token, done){
			User.findOne({email: req.body.email}, function(err, user){
				if(!user)
				{
					req.flash("error", "No account with that email address exists.");
					return res.redirect("/forgot");
				}

				user.resetPasswordToken=token;
				user.resetPasswordExpires=Date.now()+3600000; //1 hour

				user.save(function(err){
					done(err, token, user);
				});
			});
		},
		function(token, user, done){
			var smtpTransport=nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: "kevin.java.lin@gmail.com",
					pass: process.env.GMAILPW
				}
			});
			var mailOptions={
				to: user.email,
				from: "kevin.java.lin@gmail.com",
				subject: "Password Reset",
				text: "You are receving this because you (or someone else) have requested the reset of the password for your account.\n\n"
				+ "Please click on the following link or paste this into your browswer to complete the process:\n\n" +
				"http://"+ req.headers.host + "/reset/" + token + "\n\n" +
				"If you did not request this, please ignore this email and your password will remain unchanged.\n"
			};
			smtpTransport.sendMail(mailOptions, function(err){
				console.log("mail sent");
				req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
				done(err, "done");
			});
		}], function(err){
			if(err)
			{
				return next(err);
			}
			else
			{
				res.redirect("/forgot");
			}
		});
});

router.get("/reset/:token", function(req, res){
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, 
		function(err, user){
			if(!user)
			{
				req.flash("error", "Password reset token is invalid or has expired.");
				return res.redirect("/forgot");
			}
			else
			{
				res.render("reset", {token: req.params.token});
			}
		});
});

router.post("/reset/:token", function(req, res){
	async.waterfall([
		function(done){
			User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
				if(!user)
				{
					req.flash("error", "Password reset token is invalid or has expired.");
					return res.redirect("back");
				}
				else
				{
					if(req.body.password===req.body.confirm)
					{
						user.setPassword(req.body.password, function(err){
							user.resetPasswordToken=undefined;
							user.resetPasswordExpires=undefined;

							user.save(function(err){
								req.logIn(user, function(err){
									return done(err, user);
								});
							});
						});
					}
					else
					{
						req.flash("error", "Passwords do not match.");
						return res.redirect("back");
					}
				}
			});
		},
		function(user, done){
			var smtpTransport=nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: "kevin.java.lin@gmail.com",
					pass: process.env.GMAILPW
				}
			});
			var mailOptions={
				to: user.email,
				from: "kevin.java.lin@gmail.com",
				subject: "Your password has been changes",
				text: "Hello,\n\n" + "This is a confirmation that the password for your account " + user.email + " has been changed.\n" 
			};
			smtpTransport.sendMain(mailOptions, function(err){
				req.flash("success", "Success! Yout passsword has been changed.");
				done(err);
			});
		}],
		function(err){
			res.redirect("/campgrounds");
		});
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
			Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
				if(err)
				{
					req.flash("error", "Something went wrong.")
					res.redirect("/");
				}
				else
				{
					res.render("users/show",{user: foundUser, campgrounds:campgrounds});
				}
			});
		}
	});
});

module.exports=router;