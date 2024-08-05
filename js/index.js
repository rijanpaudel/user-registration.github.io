const express = require("express");
const app = express();
const path = require("path");
const collection = require("./mongodb");
app.use(express.json());

const mainPath = path.join(__dirname, '../main');
const publicPath = path.join(__dirname, '../public');

app.set("view engine", "hbs");
app.set("views", mainPath);
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/passwordreset", (req,res)=>{
    res.render("passwordreset");
})

app.post("/signup", async (req, res) => {
    let {fullname, username, email, phone, password, confirmpassword} = req.body;
    if(!fullname || !username || !email || !phone || !password || !confirmpassword){
        return res.status(400).json({ error:'All fields are required' });
    }
    if (password !== confirmpassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }
    const existingUser = await collection.findOne({$or: [{username}, {email}, {phone}]
    });
    if(existingUser){
        return res.status(400).json({ error: 'User already exists' });
    }
    const data = {
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
    };

    await collection.insertMany([data]);

    res.redirect("/home");
});

app.post("/login", async (req, res) => {
    try {
        let {email, password} = req.body;
        if(email == "" && password == ""){
            return res.status(400).json({ error:'Email and Password Required' });
        }
        if(email == ""){
            return res.status(400).json({ error:'Email Required' });
        }
        if(password == ""){
            return res.status(400).json({ error:'Password Required' });
        }
        if(!email || !password){
            return res.status(400).json({ error:'Email and password are incorrect' });
        }
        let user = await collection.findOne({ email });

        if(!user){
            return res.status(401).json({ error: 'Incorrect email' });
        }

        if(user.password !== password){
            return res.status(401).json({ error: 'Incorrect password' });
        }
        
        res.redirect("/home");
    } catch (error){
        res.status(500).json({ error: 'An error occured during login' })
    }
});

app.post("/passwordreset", async(req, res)=>{
    try{
        let {email, currentpassword, newpassword} = req.body;
        let user = await collection.findOne({ email });
        if (!user){
            return res.status(404).send("User not found");
        }

        if (user.password !== currentpassword){
            return res.status(400).send("Current password is incorrect");
        }

        user.password = newpassword;
        await user.save();

        res.send("Password changed successfully");
    } catch (error){
        res.status(500).send("An error occured while changing the password")
    }
});

app.get("/home", async (req, res) => {
    const users = await collection.find();
    res.render("home", { users });
});

app.get("/api/users", async(req,res)=>{
    try{
        const users = await collection.find();
        res.json(users);
    } catch(error){
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
})

app.listen(3000, () => {
    console.log("Port Connected");
});
