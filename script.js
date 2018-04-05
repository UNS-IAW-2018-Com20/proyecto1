$(document).ready(function(){
	cargarEvaluaciones();
});

function cargarEvaluaciones(){
	$.getJSON("datos2.json",
			function(data){
				$.each(data.evaluaciones, function() {
					//Parse de la fecha
					var from = ($(this).attr("fecha")).split("/");
					var f = new Date(from[2], from[1] - 1, from[0]);
					var actual = new Date();
					var clickeable;
					//Si la fecha de la evaluación es anterior o igual a la actual entonces es seleccionable (clickeable)
					if (f <= actual)
						clickeable = true;
					else clickeable = false;
					//Se crea el identificador ev+ id de la evauluación
					var identificacion = "ev"+$(this).attr("evaluacion");
					//Se agrega la fila de la evaluación a la tabla 
        			$("tbody").append("<tr id='"+identificacion+"'><td>"+$(this).attr("nombre")+"</td><td>"+$(this).attr("descripcion")+"</td><td>"+$(this).attr("fecha")+"</td></tr>");
        			//Si es selecccionable entonces se agrega el atributo html clickeable como true y se agrega la función que se ejecuta al clickearla
        			if (clickeable){ 
        				$("#"+identificacion).attr('clickeable','true')
        				$("#"+identificacion).click(function(){
        					clickEvaluacion(identificacion);
        				});
        			}
    			});
			});
}

function clickEvaluacion(identificacion){
	if ( $("#"+identificacion).attr('clickeable') == "true"){
		$("#"+identificacion).attr('clickeable','false');
		
		$.getJSON("datos2.json",
				function(data){
					$.each(data.evaluaciones_comisiones, function() {
						if ("ev"+this.evaluacion == identificacion){
							$("<table id='com"+this.comision+"'><tr><td>HOLA</td></tr></table>").insertAfter($("#"+identificacion));
						}
						
	    			});
				});
	} else{
		$("#com"+identificacion).closest('tr').next().remove();
		$("#"+identificacion).attr('clickeable','true')
	}
}
