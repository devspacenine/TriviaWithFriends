var mongoose = require('mongoose'),
validators = require('../_validators'),
plugins = require('../_plugins'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
LoginLogSchema = new Schema({
    login_ip: {
        type: String,
        required: true,
        validate: [validators.IPAddress, 'Invalid IP Address']
    },
    login_location: String,
    login_latitude: Number,
    login_longitude: Number,
    login_duration: Number,
    _user: {
        type: ObjectId,
        ref: 'User'
    }
});

LoginLogSchema.plugin(plugins.Timestamps);

mongoose.model('LoginLog', LoginLogSchema);
