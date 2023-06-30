const express = require("express");
const app = express();
const connectDB = require("./connection");
const User = require("./model/userschema");
const cookieParser = require('cookie-parser');



app.use(cookieParser())


connectDB();

app.use(express.json());

app.use(require("./router/auth"));

// app.get('/about' ,(req,res)=>{
//     console.log(`hello my about`);
//     res.send(`hello about world from the server`);
// });

app.get("/signin", (req, res) => {
  res.send(`hello Login world from the server`);
});

app.listen(3000, () => {
  console.log("listening to 3000");
});
