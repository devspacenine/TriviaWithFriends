var mongoose = require('mongoose'),
plugins = require('../_plugins'),
getters = require('../_getters'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
AnswerTypeSchema = new Schema({
    title: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        get: getters.Titleize,
        required: true
    }
});

AnswerTypeSchema.plugin(plugins.Timestamps);

mongoose.model('AnswerType', AnswerTypeSchema);
