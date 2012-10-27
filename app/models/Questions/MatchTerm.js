var mongoose = require('mongoose'),
plugins = require('../_plugins'),
getters = require('../_getters'),
validators = require('../_validators'),
attachments = require('mongoose-attachments'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
MatchTermSchema = new Schema({
    value: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        get: getters.Titleize,
        required: true
    },
    facts: [{
        type: String,
        trim: true
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

MatchTermSchema.plugin(attachments, {
    directory: 'match-terms',
    storage: {
        providerName: 's3',
        options: {
            key: 'AKIAIFHVJWLGWCYUAUJA',
            secret: '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',
            bucket: 'foodtruckfinder'
        }
    },
    properties: {
        image: {
            styles: {
                ldpi: {
                    resize: 'x96'
                },
                mdpi: {
                    resize: 'x128'
                },
                hdpi: {
                    resize: 'x192'
                },
                xhdpi: {
                    resize: 'x256'
                }
            }
        }
    }
});

MatchTermSchema.plugin(plugins.Timestamps);
MatchTermSchema.plugin(plugins.Publishing);

mongoose.model('MatchTerm', MatchTermSchema);
