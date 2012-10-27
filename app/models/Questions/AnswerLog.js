var mongoose = require('mongoose'),
plugins = require('../_plugins'),
validators = require('../_validators'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
AnswerLogSchema = new Schema({
    _user: {
        type: ObjectId,
        ref: 'User'
    },
    _tournament: {
        type: ObjectId,
        ref: 'Tournament'
    },
    _game: {
        type: ObjectId,
        ref: 'Game'
    },
    _round: {
        type: ObjectId,
        ref: 'Round'
    },
    question_type: {
        type: String,
        enum: ['Multiple Choice', 'MatchList', 'True/False'],
        required: true
    },
    difficulty: {
        type: Number,
        validate: [validators.Difficulty, 'Invalid Difficulty']
    },
    // True False
    true_false_question: {
        type: ObjectId,
        ref: 'TrueFalse'
    },
    // Multiple Choice
    multiple_choice_question: {
        type: ObjectId,
        ref: 'MultipleChoice'
    },
    correct_answer: {
        type: ObjectId,
        ref: 'Answer'
    },
    wrong_answers: [{
        type: ObjectId,
        ref: 'Answer'
    }],
    user_answer: {
        type: ObjectId,
        ref: 'Answer'
    },
    correct: {
        type: Boolean
    },
    // Match List
    match_list: {
        type: ObjectId,
        ref: 'Match List'
    },
    matched_terms: [{
        type: ObjectId,
        ref: 'MatchTerm'
    }],
    unmatched_terms: [{
        type: ObjectId,
        ref: 'MatchTerm'
    }],
    matching_score: {
        type: Number,
        min: 0,
        max: 100
    },
    // Timing
    allowed_time: {
        type: Number,
        min: 0,
        default: 0
    },
    time: {
        type: Number,
        min: 0
    },
    // Category & Tags
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

AnswerLogSchema.plugin(plugins.Timestamps);

mongoose.model('AnswerLog', AnswerLogSchema);
