const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user');
const postModel = require('./models/posts');
const upload = require('./config/multerconfig');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());



// Home page
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/profileimage',(req,res)=>{
    res.render('profileimage');
})

app.post('/upload',requireAuth,upload.single('image'),async(req,res)=>{
    let user =await userModel.findOne({email:req.user.email}); 
    console.log(req.file);
    user.profilepic = req.file.filename ; 
    await user.save();
    res.redirect('/profile');
})

// Register new user
app.post('/create', async (req, res) => {
    let { username, email, password, age } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let newUser = await userModel.create({
        username,
        email,
        password: hash,
        age
    });

    let token = jwt.sign({ email: email, userid: newUser._id }, 'shhhh');
    res.cookie('token', token);
    res.send(newUser);
});

// Login Page 
app.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('login');
});

// Profile page
app.get('/profile', requireAuth, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    res.render('profile', { user });
});

app.post('/posts', redirectIfLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let { content } = req.body;
    let post = await postModel.create({
        user: user._id,
        content: content
    });
    console.log(post);
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
});


// login 
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) return res.status(401).send("User not found");

    bcrypt.compare(password, user.password, function (err, result) {
        if (err) return res.status(500).send("Error while comparing passwords");
        if (result) {
            const token = jwt.sign({ email: user.email, userid: user._id }, 'shhhh');
            res.cookie('token', token, { httpOnly: true });
            return res.redirect('/profile');
        } else {
            return res.redirect('/login');
        }
    });
});


app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});


function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    try {
        const decoded = jwt.verify(token, 'shhhh');
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect('/login');
    }
}

function redirectIfLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) return next();
    try {
        jwt.verify(token, 'shhhh');
        return res.redirect('/profile');
    } catch (err) {
        next();
    }
}

app.listen(8000, () => {
    console.log(`App Running on PORT 8000`);
});
