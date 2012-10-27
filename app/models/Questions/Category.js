var mongoose = require('mongoose'),
plugins = require('../_plugins'),
getters = require('../_getters'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
CategorySchema = new Schema({
    title: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        get: getters.Titleize,
        required: true
    },
    sub_categories: [{
        type: ObjectId,
        ref: 'SubCategory'
    }]
});

CategorySchema.plugin(plugins.Timestamps);

mongoose.model('Category', CategorySchema);
