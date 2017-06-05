var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
    imageURL:String,
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("Image", imageSchema);