var express=require("express");
var router=express.Router();
var Campground=require("../models/campground");

//INDEX - show all campgrounds
router.get("/",function(req,res){

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

//CREATE - add new campground to DB
router.post("/", isLoggedIn, function(req,res){
	var name=req.body.name;
	var image=req.body.image;
	var description=req.body.description;
	var author={
		id: req.user._id,
		username: req.user.username
	}
	var newCampGround={name:name,image:image,description:description, author: author};

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

//NEW - show form to create new campground
router.get("/new", isLoggedIn, function(req,res){
	res.render("campgrounds/new");
});

//SHOW- shows more info about one campground
router.get("/:id", function(req,res)
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

//Edit campground route
router.get("/:id/edit", function(req, res){
	if(req.isAuthenticated())
	{
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err)
			{
				res.redirect("/campgrounds");
			}
			else
			{
				res.render("campgrounds/edit", {campground: foundCampground});
			}
		});
	}
	else
	{
		console.log("You need to be loggined in");
	}
});

//Update campground route
router.put("/:id", function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
		if(err)
		{
			res.redirect("/campgrounds");
		}
		else
		{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//Delete campground route
router.delete("/:id", function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err)
		{
			res.redirect("/campgrounds");
		}
		else
		{
			res.redirect("/campgrounds");
		}
	});
});

//middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect("/login");
}

module.exports=router;