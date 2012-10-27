var mongoose = require('mongoose'),
attachments = require('mongoose-attachments'),
validator = require('mongoose-validator').validator,
setters = require('../_setters'),
validators = require('../_validators'),
plugins = require('../_plugins'),
crypto = require('crypto'),
uuid = require('node-uuid'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
now = new Date(),
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
Email = Schema.Types.Email,
Url = Schema.Types.Url,
UserSchema = new Schema({
    // Login Info
    username: {
        type: String,
        unique: true,
        trim: true,
        validate: [
            {validator: validator.isAlphanumeric, msg: 'Invalid Username: Can only contain letters and numbers'},
            {validator: validators.Max(256), msg: 'Username must be shorter than 256 characters'}
        ],
        required: true
    },
    password_hash: {
        type: String,
        required: true,
        editable: false
    },
    salt: {
        type: String,
        required: true,
        editable: false
    },
    // Email
    email: {
        type: Email,
        lowercase: true,
        trim: true,
        unique: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: true
    },
    email_verification_key: {
        type: String,
        unique: true,
        required: true,
        editable: false
    },
    email_verification_key_expiration_date: {
        type: Date,
        editable: false
    },
    // Identity Info
    first_name: String,
    last_name: String,
    phone_number: {
        type: String,
        validate: [validators.PhoneNumber, 'Invalid Phone Number Format'],
        set: setters.PhoneNumber
    },
    address: {
        line_1: String,
        line_2: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    // Flags
    active: {
        type: Boolean,
        default: false,
        editable: false
    },
    logged_in: {
        type: Boolean,
        default: false,
        editable: false
    },
    disabled: {
        type: Boolean,
        default: false,
        editable: false
    },
    suspended: {
        type: Boolean,
        default: false,
        editable: false
    },
    email_verified: {
        type: Boolean,
        default: false,
        editable: false
    },
    staff: {
        type: Boolean,
        default: false,
        editable: false
    },
    superuser: {
        type: Boolean,
        default: false,
        editable: false
    },
    // Session Info and Logs
    login_ip: {
        type: String,
        editable: false,
        validate: [validators.IPAddress, 'Invalid IP Address']
    },
    login_logs: [{
        type: ObjectId,
        ref: 'LoginLog',
        editable: false
    }],
    // Groups and Permissions
    groups: [{
        type: ObjectId,
        ref: 'Group',
        editable: false
    }],
    permissions: [{
        type: ObjectId,
        ref: 'Permission',
        editable: false
    }],
    // Dates and Times
    suspened_until: {
        type: Date,
        editable: false
    },
    last_login: {
        type: Date,
        editable: false
    },
    date_joined: {
        type: Date,
        editable: false
    }
});

/*******************************************************************************
* Static Methods
*******************************************************************************/

/*******************************************************************************
* hash
* ------------------------------------------------------------------------------
*
* Generates a sha256 HMAC with the supplied salt and arbitrary data and digests
* it in hex format.
*
*******************************************************************************/
UserSchema.static('hash', function(data, salt) {
    return crypto.createHmac('sha256', salt).update(data).digest('hex');
});

/*******************************************************************************
* findByUsername
* ------------------------------------------------------------------------------
*
* Retrieve a User document by username.
*
*******************************************************************************/
UserSchema.static('findByUsername', function(username, done) {
    return this.find({username: username}, done);
});

/*******************************************************************************
* sendVerificationEmail
* ------------------------------------------------------------------------------
*
* Send an email to a newly registered user with a link to verify his/her email
* address and activate their account.
*
*******************************************************************************/
UserSchema.static('sendVerificationEmail', function(name, email, key) {
    var smtp = app.get('emailTransport')(),
    mailOptions = {
        from: app.get('noReplyEmail'),
        to: '"' + name + '" <' + email + '>',
        subject: 'Trivia With Friends - Email Verification',
        html: app.get('templateEnv').getTemplate('email/verify_email.html').render({
            name: name,
            key: key
        })
    };
    smtp.sendMail(mailOptions, function(err, res) {
        if(err) {
            console.log('Error sending verification email');
            console.log(err);
            return;
        }
        console.log('Verification email for {1} sent to {2}.'.assign(name, email));
        // Close email transport
        smtp.close();
    });
});

/*******************************************************************************
* verifyEmail
* ------------------------------------------------------------------------------
*
* Check to see if the given key belongs to a currently inactive/unverified
* user. If it is expired, start the email verification process over.
*
*******************************************************************************/
UserSchema.static('verifyEmail', function(key) {
    mongoose.model('User').findOne({email_verification_key: key}, function(err, user) {
        if(err) {
            console.log(err);
            // TODO send response saying this is an invalid email address blah blah.
            return;
        }
        user.activateAccount(key);
    });
});

/*****************************************************************************
* Instance Methods
*****************************************************************************/
UserSchema.methods.setPassword = function(password) {
    this.password_hash = hash(password, this.salt);
};

UserSchema.methods.validPassword = function(password) {
    return this.password_hash === hash(password, this.salt);
};

UserSchema.methods.isActive = function() {
    return this.active && !this.disabled && !this.suspended;
};

UserSchema.methods.activateAccount = function(key) {
    if(this.email_verified && this.active) {
        // Account is already activated and email confirmed
        return;
    }
    if(key === this.email_verification_key) {
        if(this.email_verification_key_expiration_date.isAfter(new Date())) {
            this.email_verified = true;
            this.active = true;
            this.date_joined = new Date();
            this.email_verification_key_expiration_date = null;
            this.save(function(err) {
                if(err) {
                    console.log('Failed to activate this with valid verification key');
                    console.log(err);
                    // TODO send email response saying activation failed. Reset key and try again.
                    return;
                }
                // TODO send success/thankyou email
            });
        }else{
            // TODO send response saying the key has expired. Reset key and try again
        }
    }else{
        // TODO send response saying the key did not match
    }
};

/*****************************************************************************
* Middleware
*****************************************************************************/
// When the user is created, set an email verification expiration date
UserSchema.pre('save', function(next) {
    if(this.isNew && this.email) {
        this.salt = uuid.v4();
        this.email_verification_key = crypto.createHmac('sha256', uuid.v1()).update(this.email).digest('hex');
        this.email_verification_key_expiration_date = now.setDate(now.getDate() + 3);
    }
    next();
});

UserSchema.plugin(plugins.FormFactory, {
    fields: {
        captcha: {
            widget: 'Captcha',
            order: 100,
            only: ['create'] // only appear on this form
        },
        password: {
            widget: 'Password',
            order: 2,
            forms: ['all'],
            required: true,
            validate: function(value, check, sanitize) {
                check(value, 'Must be at least 6 characters long').len(6);
            }
        },
        confirm_password: {
            widget: 'Password',
            order: 3,
            forms: ['create', 'update'],
            required: true,
            validate: function(value, check) {
                check(value, 'Must be at least 6 characters long').len(6);
            },
            depend: function(value, fields) {
                return value === fields.password.value;
            }
        },
        old_password: {
            widget: 'Password',
            order: 1,
            forms: ['update'],
            required: true,
            validate: function(value, fields, callback) {
            }
        },
        mugshot: {
            widget: 'ImageFile',
            order: 5,
            forms: ['create', 'update'],
            extensions: ['jpg','gif','png','jpeg','bmp']
        },
        remember: {
            widget: 'Checkbox',
            order: 99,
            forms: ['authenticate']
        }
    },
    forms: {
        create: {
            fields: ['mugshot', 'username', 'password', 'confirm_password', 'email', 'vendor', 'captcha'],
            maps: {
                mugshot: 'plugin',
                password: UserSchema.methods.setPassword
            }
        },
        authenticate: {
            fields: ['username', 'password', 'remember']
        },
        update: {
            nested: [{
                change_password: {
                    fields: ['old_password', 'password', 'confirm_password']
                }
            }]
        }
    }
});

UserSchema.plugin(attachments, {
    directory: 'users',
    storage: {
        providerName: 's3',
        options: {
            key: 'AKIAIFHVJWLGWCYUAUJA',
            secret: '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',
            bucket: 'foodtruckfinder'
        }
    },
    properties: {
        mugshot: {
            styles: {
                small: {
                    resize: '48x48'
                },
                large: {
                    resize: '128x128'
                }
            }
        }
    }
});

UserSchema.plugin(plugins.Timestamps);

mongoose.model('User', UserSchema);
