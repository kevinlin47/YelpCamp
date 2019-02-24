var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var seedDB=require("./seeds")
var passport=require("passport");
var LocalStrategy=require("passport-local");
var User=require("./models/user");

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
seedDB();


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

app.get("/",function(req,res){
	res.render("landing");
});

app.get("/campgrounds",function(req,res){
	// Get all campgrounds from DB
	Campground.find({}, function(err,allcampgrounds){
		if (err)
		{
			console.log(err);
		}
		else
		{
			res.render("campgrounds/index",{campgrounds:allcampgrounds});
		}
	})
});

app.post("/campgrounds",function(req,res){
	var name=req.body.name;
	var image=req.body.image;
	var description=req.body.description;
	var newCampGround={name:name,image:image,description:description};

	//Create a new campground and save to DB
	Campground.create(newCampGround, function(err,newCampground){
		if(err)
		{
			console.log(err)
		}
		else
		{
			res.redirect("/campgrounds");
		}
	});
});

app.get("/campgrounds/new", function(req,res){
	res.render("campgrounds/new");
});

//SHOW- shows more info about one campground
app.get("/campgrounds/:id", function(req,res)
{	
	//find the camoground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("campgrounds/show", {campground:foundCampground});
		}
	});
});

//Comments Routes
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("comments/new", {campground:foundCampground});
		}
	});
});

app.post("/campgrounds/:id/comments", function(req, res){

	Campground.findById(req.params.id, function(err, campground){
		if(err)
		{
			console.log(err);
			res.redirect("/campgrounds");
		}
		else
		{
			Comment.create(req.body.comment, function(err, comment){
				if(err)
				{
					console.log(err);
				}
				else
				{
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/"+campground._id);
				}
			});
		}
	});
});

//Auth Routes

//show register form
app.get("/register", function(req, res){
	res.render("register");
});

//handle sign up logic
app.post("/register", function(req, res){
	var newUser=new User({
		username: req.body.username
	});

	User.register(newUser, req.body.password, function(err, user){
		if(err)
		{
			console.log(err);
			return res.render("register");
		}
		else
		{
			passport.authenticate("local")(req, res, function(){
				res.redirect("/campgrounds");
			});
		}
	});
});

//show login form
app.get("/login", function(req, res){
	res.render("login");
});

//handle login logic
app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
});

//log out route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect("/login");
}

app.listen(3000,"127.0.0.1",function(){
	console.log("YelpCamp Server Started");
});