module.exports = {
    /*****************************************************************************
    * Publish Plugin
    *-----------------------------------------------------------------------------
    *
    * Provides documents with a field to indicate it as published or
    * unpublished. Also provides the option to set a 'Publish From' and
    * 'Publish To' date to allow for more fine tuning. Documents with a
    * 'Publish To' date will be marked as unpublished before the date and
    * published after. 'Publish From' dates affect the publish status in
    * reverse.
    *
    *****************************************************************************/
    Publishing: function(schema, opts) {
        var _ = require('underscore');

        // Fallback to default opts if not given
        opts = _.defaults(opts || {}, {
            publishFromTo: false,
            publishFromDefault: new Date(),
            publishToDefault: Date.create('3000')
        });

        // Add publish flag field
        schema.add({
            published: {
                type: Boolean,
                default: true
            }
        });
        if(opts.publishFromTo) {
            // Add publishFrom and publishTo
            schema.add({
                publishFrom: {
                    type: Date,
                    default: opts.publishFromDefault
                },
                publishTo: {
                    type: Date,
                    default: opts.publishToDefault
                }
            });
            
            // Make sure publishFrom date is before publishTo date
            schema.path('publishFrom').validate(function(val) {
                if(val instanceof Date && this.publishTo instanceof Date) {
                    if(val.isBefore(this.publishTo)) {
                        return true;
                    }else{
                        return false;
                    }
                }
                return true;
            }, 'publishFrom Date must be before publishTo date');

            // Make sure publishTo date is after publishFrom date
            schema.path('publishTo').validate(function(val) {
                if(val instanceof Date && this.publishFrom instanceof Date) {
                    if(val.isAfter(this.publishFrom)) {
                        return true;
                    }else{
                        return false;
                    }
                }
                return true;
            }, 'publishTo Date must be after publishFrom date');

            // Before saving, make sure this document is between the
            // publishFrom and publishTo dates
            schema.pre('save', function(next) {
                var now = new Date();
                if(this.publishFrom instanceof Date) {
                    if(this.publishFrom.isBefore(now) || this.publishFrom.is(now)) {
                        this.publish = true;
                    }else{
                        this.publish = false;
                    }
                }
                if(this.publishTo instanceof Date) {
                    if(this.publishTo.isBefore(now) || this.publishTo.is(now)) {
                        this.publish = false;
                    }else{
                        this.publish = true;
                    }
                }
                next();
            });
        }
    },
    
    /*****************************************************************************
    * TimeStamps Plugin
    *-----------------------------------------------------------------------------
    *
    * Provides timestamps for the creation date and last modified date of a
    * document. The values are populated automatically on creation and update.
    *
    *****************************************************************************/
    Timestamps: function(schema, opts) {
        if(schema.path('_id')) {
            schema.add({
              last_modified: {
                  type: Date,
                  editable: false
              }
            });
            schema.virtual('date_created').get(function() {
                if(this._date_created) {
                    return this._date_created;
                }
                var unixtime = BinaryParser.decodeInt(this._id.id.slice(0, 4), 32, true, true);
                return this._date_created = new Date(unixtime * 1000);
            });
            schema.pre('save', function(next) {
                if(this.isNew) {
                    this.last_modified = this.date_created;
                }else{
                    this.last_modified = new Date();
                }
                next();
            });
        }else{
            schema.add({
                date_created: {
                    type: Date,
                    editable: false
                },
                last_modified: {
                    type: Date,
                    editable: false
                }
            });
            schema.pre('save', function(next) {
                if(!this.date_created) {
                    this.date_created = this.last_modified = new Date();
                }else{
                    this.last_modified = new Date();
                }
                next();
            });
        }
    },

    /*****************************************************************************
    * FormFactory Plugin
    *-----------------------------------------------------------------------------
    *
    * Provides methods for rendering HTML forms for a Schema and validates
    * input.
    *
    *****************************************************************************/
    FormFactory: function(schema, opts) {
    }
}
