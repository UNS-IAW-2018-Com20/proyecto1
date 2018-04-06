$(document).ready(function(){
	//window.localStorage.clear();
	$("#tablaEvaluar").hide();
	cargarEvaluaciones();

});

function cargarEvaluaciones(){
	if (window.localStorage.getItem("_datos") === null) {
		$.getJSON("datos2.json",
				function(data){
					window.localStorage.setItem("_datos", JSON.stringify(data));
					//Cargo las evaluaciones desde el JSON
					cargarEvaluacionesAux(data.evaluaciones);		
				});
	} else {
		//Cargo las evaluaciones desde el localStorage
		var datos = JSON.parse(window.localStorage.getItem("_datos"));
		cargarEvaluacionesAux(datos.evaluaciones);

	}

}

function cargarEvaluacionesAux(evaluaciones){
	//Carga las evaluaciones desde evaluaciones
	$.each(evaluaciones, function() {
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
	        			$("#tablaEvaluaciones tbody").append("<tr id='"+identificacion+"'><td>"+$(this).attr("nombre")+"</td><td>"+$(this).attr("descripcion")+"</td><td>"+$(this).attr("fecha")+"</td></tr>");
	        			//<td>"+$(this).attr("nombre")+"</td><td>"+$(this).attr("descripcion")+"</td><td>"+$(this).attr("fecha")+"</td>
	        			//Si es selecccionable entonces se agrega el atributo html clickeable como true y se agrega la función que se ejecuta al clickearla
	        			if (clickeable){ 
	        				$("#"+identificacion).attr('clickeable','true');
	        				$("#"+identificacion).attr('creada','false');
	        				$("#"+identificacion).click(function(){
	        					clickEvaluacion(identificacion);
	        				});
	        			}
	   });
}

function clickEvaluacion(identificacion){
	if (( $("#"+identificacion).attr('clickeable') == "true") && ($("#"+identificacion).attr('creada') == "false")){
		$("#"+identificacion).attr('clickeable','false');
		$("#"+identificacion).attr('creada','true');

		var data = JSON.parse(window.localStorage.getItem("_datos"));

		$.each(data.evaluaciones_comisiones, function() {
			//Si la comisión corresponde a la evaluación entonces se agrega
			if ("ev"+this.evaluacion == identificacion){
				var completa = this.evaluacion_completa;
				var nota = (completa === true) ? "Nota: "+ this.nota +"</td><td>Observación: "+this.observaciones : "No Evaluado</td><td><button type='button' id='evalCom"+this.comision+"'>Evaluar</button></td>";
				var comision = getElementArray(data.comisiones,"comision",this.comision);
				$("<tr class='"+identificacion+"''><td>"+comision.nombre+"</td><td>"+nota+"</td></tr>").insertAfter($("#"+identificacion));
				$( "#evalCom"+this.comision).click(function() {
  					horaDeEvaluar(this.comision,comision.nombre);
				});
			}
				
		});

	} else if (( $("#"+identificacion).attr('clickeable') == "true") && ($("#"+identificacion).attr('creada') == "true")){
		$("."+identificacion).show();
		$("#"+identificacion).attr('clickeable','false');
	} else {
		$("."+identificacion).hide();
		$("#"+identificacion).attr('clickeable','true');
	}
}

function getElementArray(arreglo,elemento,valor){
	var resultado = null;
	var encontrado = false;
	var i=0;
	while (i < arreglo.length && !encontrado){
		if (arreglo[i][elemento] == valor){
			encontrado = true;
			resultado = arreglo[i];
		}
		i++;
	}
	return resultado;
}

function horaDeEvaluar(numeroDeComision,nombreDeComision){
	var data = JSON.parse(window.localStorage.getItem("_datos"));
	console.log(data.evaluaciones_comisiones);
	console.log(numeroDeComision);
	var eval_com = getElementArray(data.evaluaciones_comisiones,"comision",numeroDeComision);
	console.log(eval_com);
	var eval = getElementArray(data.evaluaciones,"evaluacion",eval_com.evaluacion);
	$("#tablaEvaluar thead").append("<tr><td colspan='3'>"+eval.nombre+" - "+nombreDeComision+"</td></tr>")
	$("#tablaEvaluaciones").hide();
	$("#tablaEvaluar").show();
}
