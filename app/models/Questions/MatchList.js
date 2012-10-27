var mongoose = require('mongoose'),
validators = require('../_validators'),
plugins = require('../_plugins'),
getters = require('../_getters'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
Url = Schema.Types.Url,
MatchListSchema = new Schema({
    title: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        get: getters.Titleize
    },
    description: {
        type: String,
        trim: true
    },
    terms: [{
        type: ObjectId,
        ref: 'MatchListTerm'
    }],
    difficulty: {
        type: Number,
        validate: [validators.Difficulty, 'Invalid Difficulty']
    },
    category: {
        type: ObjectId,
        ref: 'Category'
    },
    sub_category: {
        type: ObjectId,
        ref: 'SubCategory'
    },
    tags: [{
        type: ObjectId,
        ref: 'Tag'
    }]
});

MatchListSchema.plugin(plugins.Timestamps);
MatchListSchema.plugin(plugins.Publishing);

mongoose.model('MatchList', MatchListSchema);
