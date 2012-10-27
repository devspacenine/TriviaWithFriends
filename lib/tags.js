var parser = require('swig/lib/parser'),
helpers = require('swig/lib/helpers'),
_ = require("underscore"),
fs = require('fs'),
templateMap = {
    String: 'Input',
    Date: 'Input',
    Number: 'Input'
},
templates = {},
path = __dirname + '/templates';

function getTemplate(instance) {

    if(instance in templates) {
        return templates[instance];
    } else if(instance in templateMap && templateMap[instance] in templates) {
        return templates[templateMap[instance]]; 
    }

    return templates['String'];
}

function loadTemplates(path) {
    var files = fs.readdirSync(path);
    for(var file in files) {

        var match = files[file].match(/(^.+)\.html$/i);
        if (!match || match[1] in templates) continue;

        //var contents = fs.readFileSync(path + '/' + files[file], 'utf8');
        //templates[match[1]] = swig.compile(contents);
        templates[match[1]] = path + '/' + files[file];
    }
}

loadTemplates(path + '/bootstrap');

//loadTemplates(path);

function renderField(field) {

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

    var t = getTemplate(type);

    if(t) {
        out = '(function(){\n' +
                helpers.setVar('__template', parser.parseVariable(t)) + '\n' +
                    helpers.setVar('includeContext', parser.parseVariable(field)) + '\n';
        out += 'if(typeof __template === "string") {\n';
        out += '    _output += _this.compileFile(__template).render(includeContext, _parents);\n';
        out += '}\n';
        out += '})();\n';
        return out;
        //return t(copy);
    }

    return '';
}

module.exports.renderForm = function(indent) {
    var args = _.clone(this.args),
    ctx = args.shift(),
    context = '_context["' + ctx + '"] || ' + ctx,
    form = parser.parseVariable(ctx),
    output = [];

    form.eachField(function(field) {
        output.push(renderField(field));
    });

    return output.join('');
}

module.exports.renderForm.ends = false;
