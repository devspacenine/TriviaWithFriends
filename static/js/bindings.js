(function($) {
/*********************
* DOM ready function
 *********************/
	$(document).ready(function(){
	    /*************************************************************************
	     * Common jQuery object initializations for the global $ite variable and image
	     * preloads
	     *************************************************************************/
	    $ite.static_url = '/static/';
        $ite.content = $('#content');
	    $ite.preLoadImages([]);
	});
})(jQuery);
