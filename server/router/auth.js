const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const authenticate = require("../middleware/authenticate");
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser())

require("../connection");
const User = require("../model/userschema");



router.get("/register", (req, res) => {
  res.send(`Hello world from the server rotuer js`);
});

//using promises

// router.post('/register', (req, res) => {

//     const  { name,email, phone,work,password,cpassword} =req.body;

//     if(!name || !email || !phone || !work || !password|| !cpassword){
//         return res.status(422).json({error: "plz fill the field properly"});
//     }
// //databse email:: user email
//     User.findOne({email:email})
//         .then((userExist)=>{
//             if(userExist){
//                 return res.status(422).json({error:"Email already Exist"});
//         }
//         const user = new User({name,email, phone,work,password,cpassword});

//         user.save().then(()=>{
//             res.status(201).json({message:"user register successfully"});
//         }).catch((err) =>res.status(500).json({error:"Failed to registerd"}));
//     }).catch(err =>{console.log(err);});
// });

//using async-await
router.post("/register", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;

  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res.status(422).json({ error: "plz fill the field properly" });
  }

  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "Email already Exist" });
    } else if (password != cpassword) {
      return res.status(422).json({ error: "password is not matching" });
    } else {
      const user = new User({ name, email, phone, work, password, cpassword });
      //hash password
      await user.save();

      res.status(201).json({ message: "user register successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

//login route

router.post("/signin", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Invalid" });
    }

    const userLogin = await User.findOne({ email: email });

    // console.log(userLogin);
    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      //generate a token
      token = await userLogin.generateAuthToken();
      console.log(token);

      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true,
      });

      if (!isMatch) {
        res.status(400).json({ error: "Invalid Credientials" });
      } else {
        res.json({ message: "user signin Successfully" });
      }
    } else {
      res.status(400).json({ error: "Invalid Credientials" });
    }
  } catch (err) {
    console.log(err);
  }
});

//about us page

router.get("/about", authenticate, (req, res) => {
  console.log(`hello my about`);
  res.send(req.rootUser);
});

//get user data for contact us and home page
router.get("/getdata", authenticate, (req, res) => {
  console.log(`hello my about`);
  res.send(req.rootUser);
});

//contact us page
router.post("/contact", authenticate, async(req, res) => {
    try{

      const {name,email,phone,message}=req.body;

      if(!name|| !email|| !phone|| !message){
        console.log("error in contact form");
        return res.json({error:"plz fill the contact form"});
      }

      const  userContact =await User.findOne({_id:req.userID});

      if(userContact) {
        const userMessage =await userContact.addMessage(name,email,phone,message);

        await userContact.save();
        res.status(201).json({message:"user Contact Successfully"})
      }
    }catch(err){
      console.log(error);
    }
});

//logout page
router.get("/logout", authenticate, (req, res) => {
  console.log(`hello my LogoutPage`);
  res.clearCookie('jwtoken', {path:'/'});
  res.status(200).send(`User Logout`);
});


router.use(cookieParser()) 

module.exports = router;
