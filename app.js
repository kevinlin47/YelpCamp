var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var Campground=require("./models/campground");
var seedDB=require("./seeds")

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
seedDB();

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
app.get("/campgrounds/:id/comments/new", function(req, res){
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
	
});

app.listen(3000,"127.0.0.1",function(){
	console.log("YelpCamp Server Started");
});