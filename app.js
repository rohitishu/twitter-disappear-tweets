var express=require("express");
var app=express();
var mongoose=require("mongoose");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var methodOverride=require("method-override");
var User=require("./models/user");
mongoose.connect("mongodb://localhost:27017/twitter",{useNewUrlParser: true, useUnifiedTopology: true});
var bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.use(express.static(__dirname +"/public"));

app.use(require("express-session")({
    secret:"my pet name is oxli",
    resave:false,
    saveUninitialized:false
 }));
 
 app.use(passport.initialize());
 app.use(passport.session());
 
 passport.use(new LocalStrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());
 
 app.use(function(req,res,next){
 res.locals.currentUser=req.user;
 next();
 });
var commentScehma= new mongoose.Schema({
    name:{
       type: String,
       required: true
   },
    description:{
       type: String,
       required: true
   },
   created:{type:Date, default:Date.now}
   });

   var Comment=mongoose.model("Comment",commentScehma);

 /*  Comment.create({
    
    name:"#neetpostponed" ,
    description:"dssdgsdg gsgsdgsdg rrararar gfgngfnfgngf sdsdfsdfsdf afafafafa"
    
 },function(err,data){
 if(err)
 {
     console.log(err);
 }
 else
 {
     console.log("newly data created");
     console.log(data);
 }

 });
*/
Comment.remove({"expire": new Date(Date.now() + 1*60*1000)});

 app.get("/landing",function(req,res){
    //  displaying the data inside the DB
    Comment.find({},function(err,data){
      if(err)
      {
          console.log(err);
      }
      else
      {
       res.render("landing",{landing:data});
      }
   
    });
   
});
app.post("/landing",isLogIn,function(req,res){
    // get data form and add to new covid19 patient details
    var name=req.body.name;
    var description=req.body.description;
    var newreport={name:name , description:description};
    // create a new report and save to DB
    Comment.create(newreport,function(err,data){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.redirect("/landing");
        }
     
      });
    // redirect back to report page
    
});
app.get("/comment",isLogIn,function(req,res){
 res.render("comment");
});
// edit route
app.get("/landing/:id/edit",isLogIn,function(req,res){
    Comment.findById(req.params.id,function(err,foundreport){
    if(err)
    {
        res.redirect("/landing");
    }
    else
    {
        res.render("edit",{landing:foundreport});
    }
    });
});
// update route
app.put("/landing/:id",isLogIn,function(req,res){

    Comment.findByIdAndUpdate(req.params.id,req.body.landing,function(err,updateData)
    {
            if(err)
            {
                res.redirect("/landing");
            }
            else
            {
                res.redirect("/landing");
            }
    });
});

// delete routes
app.delete("/landing/:id",isLogIn,function(req,res){

Comment.findByIdAndRemove(req.params.id,function(err){
       if(err)
       {
           res.redirect("/landing");
       }
       else
       {
        res.redirect("/landing");

       }
});
});
app.get("/register",function(req,res){
res.render("register");
});

app.post("/register",function(req,res){
  newUser= new User({username: req.body.username});
  User.register(newUser,req.body.password,function(err,user){
   if(err)
   {
   console.log(err);
   return res.render("register");
   }
   passport.authenticate("local")(req,res,function(){
         res.redirect("/landing");
   });

  });

});
app.get("/login",function(req,res){

    res.render("login");
});

app.post("/login",passport.authenticate("local",
{
    successRedirect:"/landing",
    failureRedirect:"/login"
}),function(req,res){

});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/comment");
});

function isLogIn(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}
app.listen(3009,function(){
    console.log("the twitter server has started!!"); 
 });