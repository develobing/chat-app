const config = require('./config/app');
const express = require('express');
const bodyParser = require('body-parser');
const port = config.appPort;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const router = require('./router');
app.use(router);

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
