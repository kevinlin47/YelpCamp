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
	image: String
});

var Campground=mongoose.model("Campground",campgrounSchema);

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

app.get("/campgrounds/:id", function(req,res)
{
	res.send("Thiis will be the show page one day");
});

app.listen(3000,"127.0.0.1",function(){
	console.log("YelpCamp Server Started");
});