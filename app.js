const express = require('express');
const path = require('path');

const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const userModel = require('./models/user');
const { profile } = require('console');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/create', (req, res) => {
    let { username, email, password, age } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            });

            let token = jwt.sign({ email }, 'shhhh');
            res.cookie('token', token);
            res.send(createUser);
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/profile',(req,res)=>{
    res.render('profile')
})


app.post('/login', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.send('something wrong');

    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if(result) return res.redirect('/profile');
        else res.send('you cannot login');
    })
});

app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.send('logout');
});

app.listen(8000, () => {
    console.log(`App Running on PORT 8000`);

});