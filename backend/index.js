const config = require('./config/app');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./router');
const port = config.appPort;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(router);
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
