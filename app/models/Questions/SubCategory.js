var mongoose = require('mongoose'),
plugins = require('../_plugins'),
getters = require('../_getters'),
formFactory = require('../../../lib/mongoose-form-factory').FormFactory,
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
SubCategorySchema = new Schema({
    title: {
        type: String,
        trim: true,
        get: getters.Titleize,
        required: true
    },
    title_lower: {
        type: String,
        trim: true,
        lowercase: true
    },
    _category: {
        type: ObjectId,
        ref: 'Category',
        required: true
    }
});

// Before inserting/updating, save a compacted, lowercase version of the title and validate
// that it is unique among sibling sub-categories
SubCategorySchema.pre('save', function(next) {
    if(this.title) {
        this.title_lower = this.title.toLowerCase().compact();
    }else{
        this.title_lower = null;
    }
    mongoose.model('SubCategory').where('_category', this._category).where('title_lower', this.title_lower).count(function(err, count) {
        if(err) {
            console.log(err);
            next();
        }
        if(count > 0) {
            return next(new Error('Sub-category title already exists for this category'));
        }
        next();
    });
});

SubCategorySchema.plugin(plugins.Timestamps);

mongoose.model('SubCategory', SubCategorySchema);
