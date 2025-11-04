var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var session = require('express-session')
var db = require('./db')
var cors = require('cors')

const testRouter = require('./routes/test/test');
const authRoutes = require('./routes/auth/authRoutes');
const usersRouter = require('./routes/users/userRoutes.js');
const suppliersRouter = require('./routes/suppliers/supplierRoutes.js');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// for passwordless auth
app.use(cors());

// sessions options
const sessionOptions = {
    resave: false,
    saveUninitialized: false,
    secret: 'keyboard cat',
    cookie: {}
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sessionOptions))

app.use('/test', testRouter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', usersRouter);
app.use('/api/v1/suppliers', suppliersRouter);


/*
app.use((err, req, res, next) => {
    console.log(err);

    res.status(500).json({
     status: 'fail',
     message: err,
    });
});
*/

module.exports = app;
