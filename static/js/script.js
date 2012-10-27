(function($){
    // Load pollyfills
    $.webshims.polyfill();

    /* 
    * Author: Corey Pauley
    */

    /*
    * jQuery.ready
    */
    $(function(){
        /*
        * Debug
        */
        $('#header').on('click', '#debug_link a', function(e){
            $('#debug').toggleClass('hidden');
        });
    });
})(jQuery);
