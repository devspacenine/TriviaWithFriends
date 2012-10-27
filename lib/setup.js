module.exports.setup = function(opts){
    var mongoose = opts.mongoose,
    mongodb = opts.mongodb,
    mongooseTypes = require('mongoose-types'),
    express = opts.express,
    nodemailer = require('nodemailer'),
    nunjucks = require('nunjucks'),
    cons = require('consolidate'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    extend = require('xtend'),
    path = require('path'),
    http = require('http');

    /***************************************************************************
    * Global Paths
    ***************************************************************************/
    app.set('paths' ,{
        views: path.join(app.get('root'), 'app', 'views'),
        static: path.join(app.get('root'), 'static'),
        routes: path.join(app.get('root'), 'app', 'routes'),
        models: path.join(app.get('root'), 'app', 'models'),
        tmp: path.join(app.get('root'), 'tmp')
    });
    
    /***************************************************************************
    * MongoDB Connection and Mongoose Setup
    ***************************************************************************/
    var db = mongoose.createConnection('localhost', 'TriviaWithFriends_db');
    mongooseTypes.loadTypes(mongoose);
    db.on('error', console.error.bind(console, 'mongodb connection error'));
    db.once('open', function() {
        require("./models.js");
        console.log('Successfully connected to mongodb and initiated models');
    });

    /***************************************************************************
    * Email Setup
    ***************************************************************************/
    app.set('emailTransport', function() {
        return nodemailer.createTransport("SMTP", {
            host: 'smtp.webfaction.com',
            secureConnection: true,
            port: 465,
            requiresAuth: true,
            auth: {
                user: 'triviawithfriends',
                pass: "]17;8*!=316426O|0aY2q'{722[Ov4"
            }
        });
    });

    /***************************************************************************
    * Passport Authentication Setup
    ***************************************************************************/
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        mongoose.Model('User').findOne(id, function(err, user){
            done(err, user);
        });
    });

    /***************************************************************************
    * Passport Strategy Configuration 
    ***************************************************************************/
    passport.use(new LocalStrategy(function(username, password, done){
        mongoose.model("User").findOne({username: username}, function(err, user){
            if(err) {
                return done(err);
            }
            if(!user) {
                return done(null, false, {message: 'Invalid username'});
            }
            if(!user.validPassword(password)) {
                return done(null, false, {message: 'Invalid password'});
            }
            if(!user.isActive()) {
                return done(null, false, {message: 'Inactive user'});
            }
            return done(null, user);
        });
    }));

    /***************************************************************************
    * Url Routing Setup
    ***************************************************************************/
    require("./routes.js");

    /*************************************************************************** 
    * Express General Configuration - Globals, Templating & Primary Middleware
    ***************************************************************************/
    app.configure(function(){
        // Globals
        app.set('recaptcha_private_key', '6LfDbNYSAAAAAKe1_4ay5OYkgn6LhZcroXTGyMAJ');
        app.set('recaptcha_public_key', '6LfDbNYSAAAAAEvCHOAGJQLRUZ68vhGICeAJ3z-t');
        app.set('secret', '599da1fb19997b63d592806ebda45c5cfb6127fc');

        // View Settings
        var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(app.get('paths').views));
        app.set('nunjucksEnv', env);
        env.express(app);
        app.set('view options', {strict: false, layout: false});

        // Global template variables
        app.locals({
            BASE_URL: 'https://triviawithfriends.coreypauley.com',
            STATIC_URL: '/static/',
            DATETIME: opts.today,
            APP_TITLE: 'Trivia With Friends'
        });

        // Lightweight Middleware
        app.use(express.favicon(path.join(app.get('paths').static, 'img/favicon.ico'), {maxAge: 2592000000}));

        // Query String Middleware
        app.use(express.query());
    });

    /*************************************************************************** 
    * Express Development Configuration - Top Level Logging & File Serving
    ***************************************************************************/
    app.configure('development', function(){
        app.set('port', 8000);
        // Verbose logging during development
        app.use(express.logger({immediate: true, format: 'dev'}));

        // Static files
        app.use('/uploads', express.static(path.join(app.get('root'), 'uploads')));
        app.use('/static', express.static(app.get('paths').static));
    });

    /***************************************************************************
    * Express Production Configuration - Top Level Logging & File Serving
    ***************************************************************************/
    app.configure('production', function(){
        app.set('port', 28493);
        // Minimal logging during production and compress/cache static files
        app.use(express.logger('tiny'));
        app.use(express.compress());
        app.use(express.staticCache());
    
        // Static files
        app.use('/uploads', express.static(path.join(app.get('root'), 'uploads'), {maxAge: 86400000}));
        app.use('/static', express.static(app.get('paths').static, {maxAge: 86400000}));
    });

    /***************************************************************************
    * Express General Configuration - Middleware & Router
    ***************************************************************************/
    app.configure(function(){
        // Request dependent template variables
        app.use(function(req, res, next){
            res.locals.IS_IE = opts.ie_regex.test(req.headers['user-agent']);
            next();
        });

        // Middleware
        app.use(express.cookieParser(app.get('secret')));
        app.use(express.bodyParser({uploadDir: app.get('paths').tmp}));
        app.use(express.session({secret: app.get('secret'), cookie: {maxAge: 20000, secure: true}}));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(express.csrf());
        app.use(express.responseTime());

        // Router
        app.use(app.router);
    });

    /***************************************************************************
    * Express Development Configuration - Bottom Level Error Handling & Logging
    ***************************************************************************/
    app.configure('development', function() {
        app.use(express.logger({format: 'dev'}));

        // Error Handler
        app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    });

    /***************************************************************************
    * Express Production Configuration - Bottom Level Error Handling
    ***************************************************************************/
    app.configure('production', function() {
        app.use(express.errorHandler());
    });

    /***************************************************************************
    * Create the server and listen to the port set in the Express configuration
    ***************************************************************************/
    http.createServer(app).listen(app.get('port'), function() {
        console.log("Express server listening on port " + app.get('port'));
    });
};
