var mongoose = require('mongoose'),
plugins = require('../_plugins'),
getters = require('../_getters'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
PermissionSchema = new Schema({
    value: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        get: getters.Titleize,
        required: true
    },
    _users: [{
        type: ObjectId,
        ref: 'User'
    }],
    _groups: [{
        type: ObjectId,
        ref: 'Group'
    }]
});

PermissionSchema.plugin(plugins.Timestamps);

mongoose.model('Permission', PermissionSchema);
