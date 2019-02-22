var mongoose=require("mongoose");

var campgrounSchema=new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	comments: [{
		type: mongoose.Schema.Type.ObjectId,
		ref: "Comment"
	}]
});

module.exports=mongoose.model("Campground",campgrounSchema);