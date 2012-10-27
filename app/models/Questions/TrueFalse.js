var mongoose = require('mongoose'),
validators = require('../_validators'),
setters = require('../_setters'),
plugins = require('../_plugins'),
attachments = require('mongoose-attachments'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
Url = Schema.Types.Url,
TrueFalseSchema = new Schema({
    statement: {
        type: String,
        trim: true
    },
    statement_lower: {
        type: String,
        trim: true,
        lowercase: true,
        set: setters.CompactLower,
        unique: true
    },
    answer: {
        type: ObjectId,
        ref: 'Answer'
    },
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

// Save a compacted, lowercase version of the statement to make sure its unique
TrueFalseSchema.pre('save', function(next) {
    if(this.statement) {
        this.statement_lower = this.statement.toLowerCase().compact();
    }else{
        this.statement_lower = null;
    }
    next();
});

TrueFalseSchema.plugin(plugins.Timestamps);
TrueFalseSchema.plugin(plugins.Publishing);

TrueFalseSchema.plugin(attachments, {
    directory: 'true-false-questions',
    storage: {
        providerName: 's3',
        options: {
            key: 'AKIAIFHVJWLGWCYUAUJA',
            secret: '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',
            bucket: 'triviawithfriends'
        }
    },
    properties: {
        image: {
            styles: {
                ldpi: {
                    resize: 'x128'
                },
                mdpi: {
                    resize: 'x170'
                },
                hdpi: {
                    resize: 'x256'
                },
                xhdpi: {
                    resize: 'x341'
                }
            }
        },
        image2: {
            styles: {
                ldpi: {
                    resize: 'x128'
                },
                mdpi: {
                    resize: 'x170'
                },
                hdpi: {
                    resize: 'x256'
                },
                xhdpi: {
                    resize: 'x341'
                }
            }
        }
    }
});

mongoose.model('TrueFalse', TrueFalseSchema);
