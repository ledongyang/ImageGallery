var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    aws = require("aws-sdk"),
    methodOverride = require("method-override"),
    Image = require("./models/image");

//config aws region
aws.config.region="us-east-2";

var S3_BUCKET = process.env.S3_BUCKET;
var url = process.env.DATABASEURL || "mongodb://localhost/image_gallery";
mongoose.connect(url);

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));

app.get("/", function(req, res){
   res.redirect("/images"); 
});
    
app.get("/images", function(req, res){
    Image.find({}).sort({"createdAt":1}).exec(function(err, allImages){
       if(err){
           console.log(err);
       } else{
           res.render("index", {allImages:allImages});
       }
    });
});

app.get("/images/new", function(req, res){
   res.render("new"); 
});

app.post("/images", function(req, res){
    var newImage = req.body.image;
    Image.create(newImage, function(err, image){
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            res.redirect("/images");
        }
    })
});

app.delete("/images/:id", function(req, res){
   Image.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log(err);
       }else{
           res.redirect("/images");
       }
   }) 
});

app.get("/sign-s3", function(req, res){
  var s3 = new aws.S3();
  var fileName = req.query["file-name"];
  var fileType = req.query["file-type"];
  var s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: "public-read"
  };

  s3.getSignedUrl("putObject", s3Params, function(err, data) {
    if(err){
      console.log(err);
      return res.end();
    }
    var returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("server has started"); 
});