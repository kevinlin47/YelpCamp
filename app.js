var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

var campgrounds=[
		{name: "Salmon Creek", image: "https://pixabay.com/get/e837b1072af4003ed1584d05fb1d4e97e07ee3d21cac104491f9c878a2e5b1be_340.jpg"},
		{name: "Granite Hill", image: "https://pixabay.com/get/ef3cb00b2af01c22d2524518b7444795ea76e5d004b014459cf9c07cafe9b3_340.jpg"},
		{name: "Mountain Goat's Rest", image: "https://pixabay.com/get/e834b5062cf4033ed1584d05fb1d4e97e07ee3d21cac104491f9c878a2e5b1be_340.jpg"}
	];

app.get("/",function(req,res){
	res.render("landing");
});

app.get("/campgrounds",function(req,res){
	res.render("campgrounds",{campgrounds:campgrounds});
});

app.post("/campgrounds",function(req,res){
	var name=req.body.name;
	var image=req.body.image;

	var newCampGround={name:name,image:image};
	campgrounds.push(newCampGround);

	res.redirect("/campgrounds");
});

app.get("/campgrounds/new", function(req,res){
	res.render("new");
});

app.listen(3000,"127.0.0.1",function(){
	console.log("YelpCamp Server Started");
});