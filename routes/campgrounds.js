var express=require("express");
var router=express.Router();
var Campground=require("../models/campground");
var middleware=require("../middleware");
var NodeGeoCoder=require("node-geocoder");

var multer=require("multer");
var storage=multer.diskStorage({
  filename: function(req, file, callback){
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter=function(req, file, cb){
  //accept image files only
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
    return cb(new Error("Only image files are allowed."), false);
  }
  cb(null,true);
};
var upload=multer({storage: storage, fileFilter: imageFilter});

var cloudinary=require("cloudinary");
cloudinary.config({
  cloud_name: "lockheed-martin",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var options={
	provider: "google",
	httpAdapter: "https",
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

var geocoder=NodeGeoCoder(options);

//INDEX - show all campgrounds
router.get("/",function(req,res){
  var noMatch;
  if(req.query.search)
  { 
      const regex=new RegExp(escapeRegex(req.query.search), "gi");
      Campground.find({name: regex}, function(err,allcampgrounds){
      if (err)
      {
        console.log(err);
      }
      else
      { 
        if(allcampgrounds.length==0)
        {
          noMatch="No campgrounds match that query, please try again.";
        }
        res.render("campgrounds/index",{campgrounds:allcampgrounds, page:"campgrounds", noMatch:noMatch});
      }
    });
  }
  else
  {
  	// Get all campgrounds from DB
  	Campground.find({}, function(err,allcampgrounds){
  		if (err)
  		{
  			console.log(err);
  		}
  		else
  		{
  			res.render("campgrounds/index",{campgrounds:allcampgrounds, page:"campgrounds", noMatch:noMatch});
  		}
  	});
  }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var price = req.body.price;
  var author = {
      id: req.user._id,
      username: req.user.username
  };
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, price:price, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/new");
});

//SHOW- shows more info about one campground
router.get("/:id", function(req,res)
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

//Edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
	res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//Update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//Delete campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err)
		{
			res.redirect("/campgrounds");
		}
		else
		{ 
      req.flash("error", "Successfully Deleted");
			res.redirect("/campgrounds");
		}
	});
});

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
};

module.exports=router;