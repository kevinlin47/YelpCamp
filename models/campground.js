var mongoose=require("mongoose");

var campgrounSchema=new mongoose.Schema({
	name: String,
	image: String,
	description: String
});

module.exports=mongoose.model("Campground",campgrounSchema);