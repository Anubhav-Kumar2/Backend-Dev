import express from "express";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config()
const app = express();

app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: process.env.SECRECT_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

/* ---------------- STEP 1 ---------------- */
app.get("/step1", (req, res) => {
  res.send(`
    <h2>Step 1: Enter Name</h2>
    <form method="POST" action="/step1">
      <input type="text" name="name" required />
      <button type="submit">Next</button>
    </form>
  `);
});

app.post("/step1", (req, res) => {
  req.session.user = { name: req.body.name };
  res.redirect("/step2");
});

/* ---------------- STEP 2 ---------------- */
app.get("/step2", (req, res) => {
  if (!req.session.user) return res.redirect("/step1");

  res.send(`
    <h2>Step 2: Enter Email</h2>
    <form method="POST" action="/step2">
      <input type="email" name="email" required />
      <button type="submit">Next</button>
    </form>
  `);
});

app.post("/step2", (req, res) => {
  req.session.user.email = req.body.email;
  res.redirect("/step3");
});

/* ---------------- STEP 3 ---------------- */
app.get("/step3", (req, res) => {
  if (!req.session.user) return res.redirect("/step1");

  res.send(`
    <h2>Step 3: Enter Password</h2>
    <form method="POST" action="/step3">
      <input type="password" name="password" required />
      <button type="submit">Submit</button>
    </form>
  `);
});

app.post("/step3", (req, res) => {
  req.session.user.password = req.body.password;
  res.redirect("/summary");
});

/* ---------------- SUMMARY ---------------- */
app.get("/summary", (req, res) => {
  if (!req.session.user) return res.redirect("/step1");

  const { name, email, password } = req.session.user;

  res.send(`
    <h2>Summary</h2>
    <p>Name: ${name}</p>
    <p>Email: ${email}</p>
    <p>Password: ${password}</p>
  `);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});