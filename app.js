var express=require("express");
var app=express();

app.get("/",function(req,res){
	res.render("landing");
});

app.listen(3000,"127.0.0.1",function(){
	console.log("YelpCamp Server Started");
});