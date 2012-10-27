var _ = require("underscore"),
check = require('validator').check,
sanitize = require('validator').sanitize,
mongoose = require('mongoose'),
fs = require('fs'),
swig = require('swig'),
nunjucks = require('nunjucks'),
async = require('async'),
sugar = require('sugar'),
forms = require('./forms'),
fields = forms.fields,
widgets = forms.widgets,
validators = forms.validators,
_fields = {
    'String': 'string',
    'Password': 'password',
    'Email': 'email',
    'Date': 'string',
    'Number': 'number',
    'Url': 'url',
    'Boolean': 'boolean',
    'Array': 'array',
    'ObjectId': 'string'
};

function capitaliseFirstLetter(string){
    return string.capitalize();
}

module.exports = exports = function(schema, options) {
    var paths = schema.paths,
        virtuals = schema.virtuals,
        params = {};

    options = options || {};

    if(!('fields' in options)) {
        options.fields = {};
    }

    if('maps' in options && _.isArray(options.maps)) {
        var map = {};
        _.each(options.maps, function(val) {
            map[val] = true;
        });
        options.maps = map;
    }

    var order = 0;
    var mapFromSchema = {};

    schema.eachPath(function(pathstring, type) {

        if('maps' in options && !(pathstring in options.maps)) {
            return;
        }

        mapFromSchema[pathstring] = true;

        if(!(pathstring in options.fields)) {
            options.fields[pathstring] = {};
        }

        options.fields[pathstring].order = options.fields[pathstring].order || order;
        options.fields[pathstring].mapped = true;
        options.fields[pathstring].type = _.defaults(
            type,
            options.fields[pathstring].type || {}
        );

        if(!('value' in options.fields[pathstring])
           && 'defaultValue' in type 
       && !_.isFunction(type.defaultValue)) {

           options.fields[pathstring].value = type.defaultValue;
       }

       order++;
    });

    for(var field in options.fields) {
        if(!('order' in options.fields[field])) {
            options.fields[field].order = order;
            order++;
        }

        if(!('name' in options.fields[field])) {   
            options.fields[field].name = field;
        }

        if(!('label' in options.fields[field])) {
            options.fields[field].label = field.titleize(); 
        }

        if(!('isValid' in options.fields[field])) {

            options.fields[field].isValid = function(field) {
                return function(value) {

                    field.value = value;

                    if('validate' in field) {
                        try {
                            var newValue = field.validate.call(form, field.value, check, sanitize);
                            if(newValue !== undefined) {
                                field.value = newValue;
                            }

                            if('error' in field) {
                                delete field.error;
                            }

                            valid = true;
                        } catch(err) {
                            field.error = err.message;
                            valid = false; 
                        }

                        return valid;
                    }

                    return true;
                }
            }(options.fields[field]);

        }
    }

    var sorted = [];

    for(var field in options.fields) {
        sorted.push({
            key: field,
            field: options.fields[field]
        });
    }

    sorted = sorted.sortBy(function(n) {
        return n.field.order;
    });

    if(!('maps' in options)) {
        options.maps = mapFromSchema;
    }

    var form = {
        getModel: function() {
            return model;
        },
        eachField: function(fn, ctx) {
            this.fields.forEach(function(v) {
                fn(v.field, v.key);
            });

            return this;
        },
        eachMappedField: function(fn) {
            _.each(this.maps.keys(), function(k, i){
                fn(k, i);
            });
/*
for(var i in options.maps) {
fn(options.fields[ i ], i);
}
*/
            return this;
        },
        getField: function(field) {
            if(field in this.fields) {
                return this.fields[field];
            }
        },
        populate: function(obj) {

            _.each(obj, function(v, k) {
                if(k in this.fields) {
                    this.fields[k].value = v; 
                }
            });

            return this;
        },
        isValid: function(obj) {

            var valid = true;

            this.populate(obj);

            this.eachField(function(field) {

                if(field.name in obj) {
                    field.value = obj[field.name];
                }

                if('validate' in field) {
                    try {
                        var newValue = field.validate.call(form, field.value, check, sanitize);
                        if(newValue !== undefined) {
                            field.value = newValue;
                        }

                        if('error' in field) {
                            delete field.error;
                        }
                    } catch(err) {

                        field.error = err.message;
                        valid = false;
                    }
                }

            });

            return valid;
        },
        getTemplate: function(instance) {

            if(instance in this.templates) {
                return this.templates[instance];
            } else if(instance in this.templateMap && this.templateMap[instance] in this.templates) {
                return this.templates[this.templateMap[instance]]; 
            }

            return this.templates['String'];
        },
        loadTemplates: function() {
            var path = __dirname + '/templates/bootstrap',
            files = fs.readdirSync(path);
            for(var file in files) {

                var match = files[file].match(/(^.+)\.html$/i);
                if (!match || match[1] in this.templates) continue;

                    //var contents = fs.readFileSync(path + '/' + files[file], 'utf8');
                    //templates[match[1]] = swig.compile(contents);
                    this.templates[match[1]] = path + '/' + files[file];
            }
        },
        options: options,
        fields: sorted,
        maps: options.maps,
        templateMap: {
            String: 'Input',
            Date: 'Input',
            Number: 'Input',
            Boolean: 'Checkbox'
        },
        templates: {},
        as_blocks: '',
        init: function(){
            this.loadTemplates();
            var out = '';
            var templates = this.templates;
            var templateMap = this.templateMap;
            this.eachField(function(field){
                var type = 'String';

                if('template' in field) {
                    type = field.template;
                } else if('type' in field && 'instance' in field.type && field.type.instance) {
                    type = field.type.instance;
                }

                var copy = _.extend({}, field);

                if('options' in copy && _.isArray(copy.options)) {
                    for(var i in copy.options) { 
                        if(copy.options[i].value == copy.value) {
                            copy.options[i].selected = true; 
                        }
                    }
                }

                var t;
                if(type in templates) {
                    t = templates[type];
                } else if(type in templateMap && templateMap[type] in templates) {
                    t = templates[templateMap[type]]; 
                }else{
                    t = templates['String'];
                }

                var html
                if(t) {
                    //field.html = swig.compile(fs.readFileSync(t).toString())({field: field});
                    var tmpl = new nunjucks.Template(fs.readFileSync(t).toString());
                    field.html = tmpl.render({field: field});
                    out += field.html;
                }
            });
            this.as_blocks = out;
            return this;
        }
    };

    form.init();

    //return form;
}
