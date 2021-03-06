require("dotenv").config();
var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var flash=require("connect-flash");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var seedDB=require("./seeds")
var passport=require("passport");
var LocalStrategy=require("passport-local");
var User=require("./models/user");
var methodOverride=require("method-override");

var campgroundRoutes=require("./routes/campgrounds");
var commentRoutes=require("./routes/comments");
var indexRoutes=require("./routes/index")

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment=require("moment");

//Passport configuration
app.use(require("express-session")({
	secret: "Teemo is evil!",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

 //Local host connection
/*  app.listen(3000,"127.0.0.1",function(){
 	console.log("YelpCamp Server Started");
 }); */

 //Heroku host connection
 app.listen(process.env.PORT || 3000, "0.0.0.0", function(){
 	console.log("YelpCamp Server Started");
 });


