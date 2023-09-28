const express = require("express");
const app = express();
const port = 3000;
const passwordHash = require("password-hash")
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./serviceAccountKey.json");
const { QuerySnapshot } = require("@google-cloud/firestore");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.get("/signup.ejs", (req, res) => {
  res.render("signup");
});
app.get("/login.ejs", (req, res) => {
  res.render("login");
});
app.get("/index", (req, res) => {
  res.render("index");
});


app.post("/loginsubmit", (req, res) => {
  const email = req.body.mail;
  const password = req.body.password;
  db.collection("users")
    .where("email", "==", email)
    .get()
    .then((docs) => {
      let verified = false;
      docs.forEach((doc)=> {
        verified = passwordHash.verify(password, doc.data().password);
      });
      if(verified){
        res.render("index", {result: null});
      }
      else{
        res.send("loginFail")
      }
    });
  });
      //if (QuerySnapshot.empty){
        //return res.render("login", {
          //error:"Invalid email"
        //});
      //}
      // there's a user with this email, check the password
      //const user = QuerySnapshot.docs[0].data();
      //if(user.password === password){
        //password is correct, render the index page
        //return res.render("index")
      //} else {
        //password is incorrect
        //return res.render("login", {
          //error: "Invalid password"
        //});
      //}
    //})
    //.catch((error) => {
      //handle other error is needed
      //console.error("Error checking login:", error);
      //res.status(500).send("internal server error");
   // });
//});

app.post("/signupsubmit", (req, res) => {
  db.collection("users")
  .where("email", "==", req.body.email)
  .get()
  .then((docs) =>{
    if (docs.size > 0) {
      res.send("Hey this account is already exists with email. so please, login");
    }else {

  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const email = req.body.email;
  const password = passwordHash.generate(req.body.password);


  //Adding new data to collection
  db.collection("users")
    .add({
      name: first_name + " " + last_name,
      email: email,
      password: password,
    })
    .then(() => {
      res.render("index");
    });
  }});
});





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});