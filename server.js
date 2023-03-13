require('./config/database').connect();
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); 
const { PORT, MONGODB_URL, SESSION_SECRET_KEY } = process.env;
const expressLayouts = require('express-ejs-layouts');
const path = require('path')
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');

const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const customMware = require('./config/middleware');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(expressLayouts);


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(
  session({
    name: 'employee-review-system',
    secret: SESSION_SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 1000 * 120 * 500,},
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);


app.use('/', require('./routes'));

app.listen(PORT || 3333  ,(err)=>{
    if(err){console.log("Can't start server")} 
    console.log(`Server connected at http://localhost:${PORT}/ `)
})
