var express         = require("express"),
    bodyParser      = require("body-parser"),
    serveStatic     = require('serve-static'),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    User            = require("./models/user"),
    HighScore       = require("./models/highscore"),
    flash           = require("connect-flash"), 
    path            = require('path'),
    app             = express();

//mongoose.connect("mongodb://localhost/Classic_Games_Database");
mongoose.connect("mongodb://shaq:john@ds257485.mlab.com:57485/klassicgames");

//app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/styles", express.static(__dirname + "/styles"));
//app.use(flash());

app.use(require("express-session")({
    secret: "Abracadabra, alakazam",
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
   next();
});

var title = "Scores";
HighScore.findOne({Title: title}, function(err, foundScores) {
        if (!foundScores) {
            HighScore.create({Title : title});
        }
});


app.get("/", function(req, res){
    //console.log(req.user);
    res.render("index.ejs");
});

// app.get("/about", function(req, res){
//    res.render("about.ejs"); 
// });

app.get("/login", function(req, res){
    res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "login"
    }), function(req, res){
});

app.get("/register", function(req, res){
    res.render("register.ejs");
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
            return res.render("register.ejs");
        }
        passport.authenticate("local")(req, res, function(){
          // req.flash("success", "Welcome to Classic Games" + user.username);
           res.redirect("/"); 
        });
    });
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

app.get("/tetris", function(req, res){
    res.render("TetrisGame/index.ejs");
});

app.get("/pacman", function(req, res){
    res.render("PacmanGame/index.ejs");
});

app.get("/snake", function(req, res){
    res.render("SnakeGame/index.ejs");
});

// app.get("*", function(req, res){
//     res.send("Cannot find that page");
//     res.redirect("index.html");
// });

app.post("/tetrissave", isLoggedIn, function(req, res){
    //gives username
    var userName = req.session.passport.user;
    //gives score
    var savedScore = parseInt(req.body.score, 10);
    
    //retrieves score database and saves tetris score to database
    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            foundUser.tetrisScores.push(savedScore);
            foundUser.save();
            HighScore.findOne({Title: title}, function (err, foundScores){
                if (err) {
                    console.log(err);
                }
                else {
                    var objScore = { username: userName, score: savedScore};
                    var highScoresArray = foundScores.tetrisHighScores;
                    foundScores.tetrisHighScores.push(objScore);
                    highScoresArray = sortHighScores(highScoresArray);
                    if (highScoresArray.length > 10) {
                        highScoresArray = highScoresArray.splice(10, 1);
                    }
                    foundScores.save();
                }
            });
        }
    });
    
    res.end();
});

app.post("/pacmansave", isLoggedIn, function(req, res){
    //gives username
    var userName = req.session.passport.user;
    //gives score
    var savedScore = parseInt(req.body.score, 10);
    
    //retrieves score database and saves pacman score to database
    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            foundUser.pacmanScores.push(savedScore);
            foundUser.save();
            HighScore.findOne({Title: title}, function (err, foundScores){
                if (err) {
                    console.log(err);
                }
                else {
                    var objScore = { username: userName, score: savedScore};
                    var highScoresArray = foundScores.pacmanHighScores;
                    foundScores.pacmanHighScores.push(objScore);
                    highScoresArray = sortHighScores(highScoresArray);
                    if (highScoresArray.length > 10) {
                        highScoresArray = highScoresArray.splice(10, 1);
                    }
                    foundScores.save();
                }
            });
        }
    });

    res.end();
});

app.post("/snakesave", isLoggedIn, function(req, res){
    //gives username
    var userName = req.session.passport.user;
    //gives score
    var savedScore = parseInt(req.body.score, 10);
    
    //retrieves score database and saves snake score to database
    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            foundUser.snakeScores.push(savedScore);
            foundUser.save();
            HighScore.findOne({Title: title}, function (err, foundScores){
                if (err) {
                    console.log(err);
                }
                else {
                    var objScore = { username: userName, score: savedScore};
                    var highScoresArray = foundScores.snakeHighScores;
                    foundScores.snakeHighScores.push(objScore);
                    highScoresArray = sortHighScores(highScoresArray);
                    if (highScoresArray.length > 10) {
                        highScoresArray = highScoresArray.splice(10, 1);
                    }
                    foundScores.save();
                }
            });
        }
    });

    res.end();
});

app.get("/scores", isLoggedIn, function(req, res){
    //gives username
    var userName = req.session.passport.user;
    //retrieves scores database and saves snake score to database
    User.findOne({username: userName}, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("scores.ejs", {tetrisArrays:JSON.stringify(foundUser.tetrisScores), 
                                      pacmanArrays:JSON.stringify(foundUser.pacmanScores), 
                                      snakeArrays:JSON.stringify(foundUser.snakeScores)});
        }
    });
    // console.log("Outside findOne function:" + snakeArrays);
    // res.render("scores.ejs", {tetrisArrays: tetrisArrays, pacmanArrays: pacmanArrays, snakeArrays: snakeArrays});
});

app.get("/highscores", function(req, res){

    HighScore.findOne({Title: title}, function(err, foundScores) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("highscores.ejs", {tetrisArrays:JSON.stringify(foundScores.tetrisHighScores), 
                                      pacmanArrays:JSON.stringify(foundScores.pacmanHighScores), 
                                      snakeArrays:JSON.stringify(foundScores.snakeHighScores)});
        }
    });
});

// app.get("*", function(req, res) {
//     res.redirect("/");
// });

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.render("login.ejs");
};

function sortHighScores(highScoreArray) {
    var x, y, temp;
    for (var i = 0; i < highScoreArray.length-1; i++) {
        for (var j = i+1; j < highScoreArray.length; j++) {
            x = highScoreArray[i].score;
            y = highScoreArray[j].score;
            if (y > x) {
                temp = highScoreArray[i];
                highScoreArray[i] = highScoreArray[j];
                highScoreArray[j] = temp;
            }
        }
    }
    return highScoreArray;
};


app.use(serveStatic(__dirname)).listen(process.env.PORT || 8080, function(){
    console.log('Classic Games Server running on 8080...');
});