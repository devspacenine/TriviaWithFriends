var mongoose = require('mongoose'),
plugins = require('../_plugins'),
attachments = require('mongoose-attachments'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
AnswerSchema = new Schema({
    value: {
        type: String,
        trim: true,
        required: true
    },
    answer_type: {
        type: ObjectId,
        ref: 'AnswerType'
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

AnswerSchema.plugin(attachments, {
    directory: 'answers',
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

AnswerSchema.plugin(plugins.Timestamps);
AnswerSchema.plugin(plugins.Publishing);

mongoose.model('Answer', AnswerSchema);
