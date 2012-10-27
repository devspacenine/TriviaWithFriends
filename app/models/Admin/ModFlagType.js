var mongoose = require('mongoose'),
plugins = require('../_plugins'),
getters = require('../_getters'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
ModFlagTypeSchema = new Schema({
    value: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        get: getters.Titleize,
        required: true
    }
});

ModFlagTypeSchema.plugin(plugins.Timestamps);

mongoose.model('ModFlagType', ModFlagTypeSchema);
