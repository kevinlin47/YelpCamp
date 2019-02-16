var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

//Schema Setup
var campgrounSchema=new mongoose.Schema({
	name: String,
	image: String,
	description: String
});

var Campground=mongoose.model("Campground",campgrounSchema);

/*Campground.create(
{
	name: "Granite Hill",
	image: "https://farm6.staticflickr.com/5181/5641024448_04fefbb64d.jpg",
	description: "This is a hue granite hill, no bathrooms. No water. Beautiful granite!"
}, function(err,campground){
	if(err)
	{
		console.log(err);
	}
	else
	{
		console.log("Newly created campground: ");
		console.log(campground);
	}
});*/

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
			res.render("index",{campgrounds:allcampgrounds});
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
	res.render("new");
});

//SHOW- shows more info about one campground
app.get("/campgrounds/:id", function(req,res)
{	
	//find the camoground with provided ID
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("show", {campground:foundCampground});
		}
	});
});

app.listen(3000,"127.0.0.1",function(){
	console.log("YelpCamp Server Started");
});