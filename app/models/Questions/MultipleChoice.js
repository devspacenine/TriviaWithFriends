var mongoose = require('mongoose'),
validators = require('../_validators'),
plugins = require('../_plugins'),
setters = require('../_setters'),
attachments = require('mongoose-attachments'),
mongooseValidator = require('mongoose-validator').validator,
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
Url = Schema.Types.Url,
MultipleChoiceSchema = new Schema({
    // Question
    question: {
        type: String,
        trim: true
    },
    question_lower: {
        type: String,
        trim: true,
        lowercase: true,
        set: setters.CompactLower,
        unique: true
    },
    // Answers
    answer: {
        type: ObjectId,
        ref: 'Answer'
    },
    answer_type: {
        type: ObjectId,
        ref: 'AnswerType'
    },
    wrong_answers: [{
        type: ObjectId,
        ref: 'Answer'
    }], 
    // Info
    factoids: [{
        type: String,
        trim: true
    }],
    difficulty: {
        type: Number,
        validate: [validators.Difficulty, 'Invalid Difficulty']
    },
    visual: {
        type: Boolean,
        default: false
    },
    // Category and Tags
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
    }],
    // Counters
    impressions: {
        type: Number,
        min: 0,
        default: 0
    },
    correctAnswers: {
        type: Number,
        min: 0,
        default: 0
    },
    wrongAnswers: {
        type: Number,
        min: 0,
        default: 0
    },
    skips: {
        type: Number,
        min: 0,
        default: 0
    },
    timeouts: {
        type: Number,
        min: 0,
        default: 0
    }
});

// Save a compacted, lowercase version of the question to make sure its unique
MultipleChoiceSchema.pre('save', function(next) {
    if(this.question) {
        this.question_lower = this.question.toLowerCase().compact();
    }else{
        this.question_lower = null;
    }
    next();
});

MultipleChoiceSchema.plugin(attachments, {
    directory: 'multiple-choice-questions',
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

// Plugins
MultipleChoiceSchema.plugin(plugins.Timestamps);
MultipleChoiceSchema.plugin(plugins.Publishing);

mongoose.model('MultipleChoice', MultipleChoiceSchema);
