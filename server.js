require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')

app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => { console.log("DB connected") }).catch((err) => console.log(err))

app.use(require("./routes/auth"));
app.use(require("./routes/posts"));

app.listen(9999, () => {console.log('Server up at 9999')})