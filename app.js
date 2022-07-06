var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var session = require('express-session');
// var flash = require('connect-flash');
var db = require('./config/connection');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const { helpers } = require('handlebars');
const { registerHelper } = require('hbs');
var hbsn = hbs.create({});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname:'hbs',
  defaultLayout:'layout',
  layoutsDir:__dirname+'/views/layout/',
  partialsDir:__dirname+'/views/partials/',

  helpers:{
    math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    }
  
  }
}))

hbsn.handlebars.registerHelper("eq", function(string1, string2, options) {
  var str1 = string1.toString();
  var str2 = string2.toString();
  if (str1 === str2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

hbsn.handlebars.registerHelper("setVar", function(varName, varValue, options) {
  options.data.root[varName] = varValue;
});

// hbsn.handlebars.registerHelper('eq', function () {
//   const args = Array.prototype.slice.call(arguments, 0, -1);
//   return args.every(function (expression) {
//       return args[0] === expression;
//   });
// });




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'key',cookie:{maxAge:600000}}))
// app.use(flash())
// app.use(function(req, res, next){
//   app.locals.success = req.flash('success');
//   next();
// });

db.connect((err) => {
  if(err) console.log("Connection Error"+err);
  else console.log("Database Connected");
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
