var bodyParser  = require("body-parser"),
    methodOverride=require("method-override"),
    mongoose    = require("mongoose"),
    sanitizer   = require("express-sanitizer"),
    express     = require("express"),
    app         = express(),
    passport              = require("passport"),
    User                  = require("./models/User"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
    //app config
    mongoose.connect("mongodb://localhost/RestBlog");
    app.set("view engine","ejs");
    app.use(express.static("public"));
    app.use(methodOverride("_method"));
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(sanitizer());
    //User authentication
    //---------------------------
    app.use(require("express-session")({
    secret: "thank you for chosing us",
    resave: false,
    saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    //======================================
    //mongoose/model config
   //========================
    var blogSchema=new mongoose.Schema({
        title:String,
        image:String,
        body:String,
        created:{type:Date,default:Date.now}
    });
    var Blog=mongoose.model("Blog",blogSchema);


//     var ashutosh= new Blog({
//     title:"ashutosh",image:"bkbdefewhpjrpfjepgw.jpg",body:"other fndspieoabfvpibdr[jfdzpdz[kfidhpoiej[jrwnggd[grfro[g"
// });
// ashutosh.save(function(err,fnd){
//     if(err)
//     console.log("something went wrong");
// });
    //========================    
    //restful routes
    //========================
    //Root Route
     app.get("/",function(req,res){
     res.render("landing");
     });
     //Index Route
     app.get("/blogs",isLoggedIn,function(req,res){
     Blog.find({},function(err,blogs){
         if(err)
            console.log("err");
        else
            res.render("index",{blogs:blogs});
          });
     });
     //create route
     app.get("/blogs/new",isLoggedIn,function(req,res){
         res.render("new.ejs");
     });
     app.post("/blogs",function(req,res){
        Blog.create(req.body.blog,function(err,blogpost){
            if(err)
            console.log("error in creation");
            else
            res.redirect("/blogs");
        });
     });
     //Read
     app.get("/blogs/:id",isLoggedIn,function(req,res){
        Blog.findById(req.params.id,function(err,foundBlog){
            if(err)
            {res.redirect("/blogs");
            console.log("error");}
            else
            res.render("show",{blog:foundBlog});
        }) ;
     });
   
     //Update
      app.get("/blogs/:id/edit",isLoggedIn,function(req,res){
         Blog.findById(req.params.id,function(err,foundBlog){
            if(err)
            {res.redirect("/blogs");
            console.log("error");}
            else
            res.render("edit",{blog:foundBlog});
        }) ;
     });
       app.put("/blogs/:id",function(req,res){
         Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err)
            {res.redirect("/blogs");
            console.log("error");}
         else
            res.redirect("/blogs/"+req.params.id);
         });
     });
     //delete route
     app.delete("/blogs/:id",function(req,res){
         Blog.findByIdAndRemove(req.params.id,function(err,updatedBlog){
        if(err)
            {res.redirect("/blogs");
            console.log("error");}
         else
            res.redirect("/blogs");
         });
     });
    //========================
    //Authentification routes
    //=========================
    app.get("/register", function(req, res){
    res.render("register"); 
    });
    //handling user sign up
    app.post("/register", function(req, res){
        User.register(new User({username: req.body.username}), req.body.password, function(err, user){
            if(err){
                console.log(err);
                return res.render('register');
            }
            passport.authenticate("local")(req, res, function(){
               res.redirect("/blogs");
            });
        });
    });
    
    // LOGIN ROUTES
    //render login form
    app.get("/login", function(req, res){
       res.render("login"); 
    });
    //login logic
    //middleware
    app.post("/login", passport.authenticate("local", {
        successRedirect: "/blogs",
        failureRedirect: "/login"
    }) ,function(req, res){
    });
    
    app.get("/logout", function(req, res){
        req.logout();
        res.redirect("/");
    });
     function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}    
    app.listen(8000,function(){
            console.log("Blog Server Started  ");
    });