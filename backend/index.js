const http = require('http');
const config = require('./config/app');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./router');
const SocketServer = require('./socket/index.js');

const port = config.appPort;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

const server = http.createServer(app);
SocketServer(server);

server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
