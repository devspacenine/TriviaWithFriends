module.exports = (function() {
    var fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

    function getRoutes(dirPath) {
        var files = fs.readdirSync(dirPath),
        routes = [];
        _.each(files, function(file) {
            var filePath = path.join(dirPath, file),
            fileStat = fs.statSync(filePath);
            if(fileStat.isDirectory()) {
                routes = routes.concat(getRoutes(filePath));
            }else{
                if(fileStat.isFile() && path.basename(file).charAt(0) !== '_' && path.extname(file) === '.js') {
                    routes.push(filePath);
                }
            }
        });
        return routes;
    }

    _.each(getRoutes(app.get('paths').routes), function(route) {
        require(route);
    });
})();
