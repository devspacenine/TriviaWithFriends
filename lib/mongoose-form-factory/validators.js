var check = require('validator').check;

exports.matchField = function (match_field) {
    return function(form, field, callback) {
        check(field.data, 'Does not match ' + match_field + '.').equals(form.fields[match_field]);
        callback();
    };
};

exports.min = function (val) {
    return function(form, field, callback) {
        check(field.data, 'Please enter a value greater than or equal to ' + val + '.').len(val);
        callback();
    };
};

exports.max = function (val) {
    return function (form, field, callback) {
        check(field.data, 'Please enter a value less than or equal to ' + val + '.').max(val);
        callback();
    };
};

exports.range = function (min, max) {
    return function (form, field, callback) {
        check(field.data, 'Please enter a value between ' + min + ' and ' + max + '.').min(min).max(max);
        callback();
    };
};

exports.minlength = function (val) {
    return function (form, field, callback) {
        check(field.data, 'Please enter at least ' + val + ' characters.').len(val);
        callback();
    };
};

exports.maxlength = function (val) {
    return function (form, field, callback) {
        check(field.data, 'Please enter no more than ' + val + ' characters.').len(0, val);
        callback();
    };
};

exports.rangelength = function (min, max) {
    return function (form, field, callback) {
        check(field.data, 'Please enter a value between ' + min + ' and ' + max + ' characters long.').len(min, max);
        callback();
    };
};

exports.regexp = function (re, message) {
    re = (typeof re === 'string') ? new RegExp(re) : re;
    return function (form, field, callback) {
        check(field.data, message || 'Invalid format.').regex(re);
        callback();
    };
};

exports.email = function () {
    return function(form, field, callback) {
        check(field.data, 'Please enter a valid email address.').isEmail();
        callback();
    };
    // regular expression by Scott Gonzalez:
    // http://projects.scottsplayground.com/email_address_validation/
    //return exports.regexp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, 'Please enter a valid email address.');
};

exports.url = function () {
    return function(form, field, callback) {
        check(field.data, 'Please enter a valid URL.').isUrl();
        callback();
    };
    // regular expression by Scott Gonzalez:
    // http://projects.scottsplayground.com/iri/
    //return exports.regexp(/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i, 'Please enter a valid URL.');
};

exports.alpha = function () {
    return function(form, field, callback) {
        check(field.data, 'Please enter a value with only letters.').isAlpha();
        callback();
    };
};

exports.alphanumeric = function () {
    return function(form, field, callback) {
        check(field.data, 'Please enter a value with only letters and numbers.').isAlphanumeric();
        callback();
    };
};

exports.int = function () {
    return function(form, field, callback) {
        check(field.data, 'Please enter an integer.').isInt();
        callback();
    };
};

exports.creditcard = function() {
    return function(form, field, callback) {
        check(field.data, 'Please enter a valid credit card number.').isCreditCard();
        callback();
    };
};
