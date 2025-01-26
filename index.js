const express = require('express');
const cors = require('cors')
const app = express();
const bodyparser = require("body-parser")
const fileupload = require("express-fileupload");
const router = require('./Route/router');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

app.use(cors());
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))
app.use(fileupload())

app.use(router)

app.use(function (error, request, response, next) {
  if (error) {
    console.error('json error', error);
    return response.json({
      Status: "Error",
      Message: "Error has occured! Please contact your administrator."
    });
  }
  return next();
});



const { updateExpireStatus } = require('./Controller/productExpire_sts_control')

cron.schedule('0 * * * *', () => {
  const currentDate = new Date();
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formatter = new Intl.DateTimeFormat([], options);
  const formattedDate = formatter.format(currentDate);

  console.log('Cron job running at:', formattedDate);
  updateExpireStatus();

});



app.listen(3500, () => {
  console.log("The server is running on port 3500.");
}) 