var lyricsSearcherMusixmatch = require("lyrics-searcher-musixmatch")
const api = lyricsSearcherMusixmatch.default;
api("never going home kungs").then((x)=>{console.log(x)});