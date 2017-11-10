var express         = require("express"),
    bodyParser      = require("body-parser"),
    serveStatic     = require('serve-static'),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    User            = require("./models/user"),
    flash           = require("connect-flash"), 
    path            = require('path'),
    app             = express();

//mongoose.connect("mongodb://localhost/Classic_Games_Database");
mongoose.connect("mongodb://shaq:john@ds257485.mlab.com:57485/klassicgames");

//app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/styles", express.static(__dirname + "/styles"));
//app.use(flash());

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   //res.locals.error = req.flash("error");
   //res.locals.success = req.flash("success");
   next();
});



app.get("/", function(req, res){
    res.render("index.html");
});

app.get("/about", function(req, res){
   res.render("about.html"); 
});

app.get("/login", function(req, res){
    res.render("login.html");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "about",
        failureRedirect: "login"
    }), function(req, res){
});

app.get("/register", function(req, res){
    res.render("register.html");
});

app.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username, 
        pacmanScores: [0],
        snakeScores: [0],
        tetrisScores: [0]    
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
          //  req.flash("error", err.message);
            console.log(err);
            return res.render("register.html");
        }
        passport.authenticate("local")(req, res, function(){
          // req.flash("success", "Welcome to Classic Games" + user.username);
           res.redirect("about"); 
        });
    });
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("about");
})

app.get("/tetris", function(req, res){
    res.render("TetrisGame/index.html");
});

app.get("/pacman", function(req, res){
    res.render("PacmanGame/index.html");
});

app.get("/snake", function(req, res){
    res.render("SnakeGame/index.html");
});

// app.get("*", function(req, res){
//     res.send("Cannot find that page");
//     res.redirect("index.html");
// });

app.post("/tetrissave", isLoggedIn, function(req, res){
    //gives username
    var userName = req.session.passport.user;
    console.log(userName);
    //gives score
    var savedScore = parseInt(req.body.score, 10);
    var userId;
    
    //retrieves score database and saves tetris score to database
    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(foundUser);
            console.log(savedScore);
            foundUser.tetrisScores.push(savedScore);
            foundUser.save();
            console.log(foundUser);
        }
    });

    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Score should be in array");
            console.log(foundUser);
        }
    });
    
    res.end();
});

app.post("/pacmansave", isLoggedIn, function(req, res){
    //gives username
    var userName = req.session.passport.user;
    console.log(userName);
    //gives score
    var savedScore = parseInt(req.body.score, 10);
    var userId;
    
    //retrieves score database and saves pacman score to database
    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(foundUser);
            console.log(savedScore);
            foundUser.pacmanScores.push(savedScore);
            foundUser.save();
            console.log(foundUser);
        }
    });

    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Score should be in array");
            console.log(foundUser);
        }
    });

    res.end();
});

app.post("/snakesave", isLoggedIn, function(req, res){
    //gives username
    var userName = req.session.passport.user;
    console.log(userName);
    //gives score
    var savedScore = parseInt(req.body.score, 10);
    var userId;
    
    //retrieves score database and saves snake score to database
    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(foundUser);
            console.log(savedScore);
            foundUser.snakeScores.push(savedScore);
            foundUser.save();
            console.log(foundUser);
        }
    });

    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Score should be in array");
            console.log(foundUser);
        }
    });

    res.end();
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("login");
};


app.use(serveStatic(__dirname)).listen(process.env.PORT || 8080, function(){
    console.log('Classic Games Server running on 8080...');
});