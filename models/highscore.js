var mongoose = require("mongoose");

var HighScoreSchema = new mongoose.Schema({
    Title: String, 
    pacmanHighScores: [{username: String, score: Number}],
    tetrisHighScores: [{username: String, score: Number}],
    snakeHighScores: [{username: String, score: Number}]
});

module.exports = mongoose.model("HighScore", HighScoreSchema);