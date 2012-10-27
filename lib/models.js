module.exports = (function() {
    var fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

    function getModels(dirPath) {
        var files = fs.readdirSync(dirPath),
        models = [];
        _.each(files, function(file) {
            var filePath = path.join(dirPath, file),
            fileStat = fs.statSync(filePath);
            if(fileStat.isDirectory()) {
                models = models.concat(getModels(filePath));
            }else{
                if(fileStat.isFile() && path.basename(file).charAt(0) !== '_' && path.extname(file) === '.js') {
                    models.push(filePath);
                }
            }
        });
        return models;
    }

    _.each(getModels(app.get('paths').models), function(model) {
        require(model);
    });
})();
