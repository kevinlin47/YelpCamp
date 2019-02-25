var express=require("express");
var router=express.Router();

router.get("/campgrounds",function(req,res){

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

router.post("/campgrounds",function(req,res){
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

router.get("/campgrounds/new", function(req,res){
	res.render("campgrounds/new");
});

//SHOW- shows more info about one campground
router.get("/campgrounds/:id", function(req,res)
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

module.exports=router;