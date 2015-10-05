var express = require('express');
var app = express();

app.use('/images',express.static('images'));
app.use('/js',express.static('js'));
app.use('/css',express.static('css'));
app.use('/bower_components',express.static('bower_components'));

app.get('/',function(req,res){res.sendFile(__dirname+'/index.html')});

app.listen(80);