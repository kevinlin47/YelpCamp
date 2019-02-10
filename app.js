var express=require("express");
var app=express();

app.set("view engine","ejs");

app.get("/",function(req,res){
	res.render("landing");
});

app.get("/campgrounds",function(req,res){
	var campgrounds=[
		{name: "Salmon Creek", image: "https://pixabay.com/get/e834b5062cf4033ed1584d05fb1d4e97e07ee3d21cac104491f9c67ca2efb3ba_340.jpg"},
		{name: "Granite Hill", image: "https://pixabay.com/get/e837b1072af4003ed1584d05fb1d4e97e07ee3d21cac104491f9c67ca2efb3ba_340.jpg"},
		{name: "Mountain Goat's Rest", image: "https://pixabay.com/get/e136b80728f31c22d2524518b7444795ea76e5d004b014459cf7c47ca5ebb7_340.jpg"}
	];

	res.render("campgrounds",{campgrounds:campgrounds});
});

app.listen(3000,"127.0.0.1",function(){
	console.log("YelpCamp Server Started");
});