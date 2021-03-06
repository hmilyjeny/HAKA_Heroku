import Express from 'express';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import bodyParser from 'body-parser';
import path from 'path';


var express = require("express");
var app = new Express();

import webpack from 'webpack';
import config from './webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath}));
  app.use(webpackHotMiddleware(compiler));
}


// MongoDB Connection
import serverConfig from './config';
import dummyData from './dummyData';

mongoose.connect(serverConfig.mongoURL, (error) => {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
    throw error;
  }
  var conn = mongoose.connection;
  Grid.mongo = mongoose.mongo;
  conn.once('open', function () {
    var gfs = Grid(conn.db);
    app.set('gridfs', gfs);
  });
  // feed some dummy data in DB.
  dummyData();
});

import auth from './api/routes/auth.routes';
import project from './api/routes/project.routes';
import system from './api/routes/system.routes';
import channels from './api/routes/channels.routes';
//import upload from './api/routes/upload.routes';
import passport from 'passport';
import {tokenCheck} from './api/utils/passport_jwt';

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(passport.initialize());
tokenCheck(passport);

app.use('/api/auth', auth);
app.use('/api/project',project);
app.use('/api/system',system);
app.use('/api/channels',channels);

app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

//app.use('/api/upload',upload);

// start app
var server=app.listen(serverConfig.port, (error) => {
  if (!error) {
    var port = server.address().port;
    console.log("App now running on port", port);
  }
});
