var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

//Schema Setup
var campgrounSchema=new mongoose.Schema({
	name: String,
	image: String
});

var Campground=mongoose.model("Campground",campgrounSchema);

/*Campground.create(
{		
		name: "Granite Hill", 
		image: "https://pixabay.com/get/ef3cb00b2af01c22d2524518b7444795ea76e5d004b014459cf9c07cafe9b3_340.jpg"
}
	, function(err, campground){
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
			res.render("campgrounds",{campgrounds:allcampgrounds});
		}
	})
});

app.post("/campgrounds",function(req,res){
	var name=req.body.name;
	var image=req.body.image;

	var newCampGround={name:name,image:image};

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

app.listen(3000,"127.0.0.1",function(){
	console.log("YelpCamp Server Started");
});