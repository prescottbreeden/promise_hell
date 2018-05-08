// dependencies
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(session({
    secret: "rubberbabybuggybumpers",
    name: 'cookie_monster',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(favicon(path.join(__dirname, './public', 'images', 'user-favicon.ico')));
app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './bower_components')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/login_reg')
    .then(success => {
        console.log("connected to db");
    })
    .catch(err => {
        console.log("unable to connect to database");
    })

// user schema
const UserSchema = new mongoose.Schema({
    first_name: {type: String, required: [true, 'First name cannot be blank']},
    last_name: {type: String, required: [true, 'Last name cannot be blank']},
    email: {type: String, required: [true, 'Email cannot be blank'], lowercase: true},
    password: {type: String, required: true}
}, {timestamps: true})

mongoose.model('User', UserSchema);
const User = mongoose.model('User');

app.get('/', (req, res, next) => {
    res.render('index');
})

app.post('/register', (req, res) => {
    // new user registration
    var error_message = [];
    var password = req.body.password;
    User.find({email: req.body.email})
        .then(find => {
            if(find.length > 0) {
                error_message.push("email already exists")
            }
            else if(password === req.body.cpassword) {
                bcrypt.hash(password, 10)
                    .then(hash => {    
                        password = hash;
                        var user = new User({
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email: req.body.email,
                            password: password
                        })
                        user.save()
                        .then(user => {
                            res.render('success', {user: user});
                        })
                        .catch(bad => {
                            error_message.push(`${bad} happened`)
                            res.render('failed', {errors: error_message});    
                        })
                    })
                    .catch(bad => {
                        error_message.push(`${bad} happened`)
                    })
            }
            else {
                error_message.push("passwords don't match");
                res.render('failed', {errors: error_message});
            }
        })
        .catch(bad => {
            error_message.push(`${bad} happened`)
            res.render('failed', {errors: error_message});
        })
})

// user login
app.post('/login', (req, res) => {
    var error_message = [];
    User.findOne({email: req.body.login_email})
        .then( user => {
            bcrypt.compare(req.body.login_password, user.password)
                .then(result => {
                    console.log(`${user.name} has logged in to server`);
                    res.render('success', {user: user});
                })
                .catch(err => {
                    error_message.push('passwords do not match')
                    res.render('failed', {errors: error_message});
                })
        })
        .catch( err => {
            error_message.push('server failed')
            res.render('failed', {errors: error_message});
        })
})

// user in session redirect to success
app.get('/success', function(req, res, next) {
    res.render('success')
})
// something went wrong
app.get('/failed', function(req, res, next) {
    res.render('failed')
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
})

app.listen(8000, function() {
    console.log("Power Overwhelming...")
})