$(document).ready(function(){
	cargarEvaluaciones();
});

function cargarEvaluaciones(){
	$.getJSON("datos2.json",
			function(data){
				$.each(data, function() {
        			$("ul").append("<li>Pepe</li>");
    			});
			});
}
