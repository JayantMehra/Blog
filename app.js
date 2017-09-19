var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");
 
//  APP CONFIG   
mongoose.connect("mongodb://localhost/blog", {useMongoClient: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer()); //Always after bodyParser
   
//  MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema ({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//  RESTFUL ROUTES
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

//  INDEX
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log("Oops! Something went wrong!");
        }
        else {
            res.render("index", {blogs: blogs});   
        }
    });
});

//  NEW
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//  CREATE
app.post("/blogs", function(req, res) {
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.create(req.body.blog, function(err, newBlog) {
       if (err) {
           console.log(err);
       }
       else {
           res.redirect("/blogs/" + newBlog._id);
       }
   });
});

//SHOW
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, blog) {
      if (err) {
          console.log("Oops! Something went wrong!");
      } 
      else {
          res.render("show", {blog: blog});
      }
   });
});

//  EDIT
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, blog) {
        if (err) {
            console.log("Oops! Something went wrong!");
        }
        else {
            res.render("edit", {blog: blog}); 
        }
    });
});

//  UPDATE
app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog) {
        if(err) {
            console.log("Oops! Something went wrong!");    
        }
        else {
            res.redirect("/blogs/" + blog._id);
        }
    });
});

//  DESTROY
app.delete("/blogs/:id", function(req, res) {
   Blog.findByIdAndRemove(req.params.id, function(err) {
      if (err) {
          console.log("Oops! Something went wrong!");
      } 
      else {
          res.redirect("/blogs");
      }
   });
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("Server Started!"); 
});