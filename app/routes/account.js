module.exports = (function(){
/********************************************************************
* GET register page.
********************************************************************/
    app.get('/register/', function(req, res){
        res.render('account/register.html', {});
    });
})();
