$(document).ready(function(){
	//window.localStorage.clear();
	//console.log("carga");

	//Acción del click en el botón de volver de la pantalla de evaluación
	$("#backButton").click(function(){
		volver();
	});
	//Acción del submit del formulario de evaluación
	$("#formEvaluacion").submit(function(event){
		event.preventDefault();
		evaluar($("#formEvaluacion").serializeArray());
		$(this).unbind('submit').submit();
	});
	//Oculto la pantalla de evaluación
	$("#divEvaluar").hide();

	cargarEvaluaciones();

});


function volver(){
	$("#tablaEvaluar thead tr").remove();
	$("#tablaEvaluar tbody tr:first").remove();
	$("#divEvaluar").hide();
	$("#divEvaluaciones").show();
}

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
	//Si la evaluación es clickeable y no fue creada es necesaria obtener de local storage los datos 
	if (( $("#"+identificacion).attr('clickeable') == "true") && ($("#"+identificacion).attr('creada') == "false")){
		$("#"+identificacion).attr('clickeable','false');
		$("#"+identificacion).attr('creada','true');

		var data = JSON.parse(window.localStorage.getItem("_datos"));

		$.each(data.evaluaciones_comisiones, function() {
			//Si la comisión corresponde a la evaluación entonces se agrega
			if ("ev"+this.evaluacion == identificacion){
				var completa = this.evaluacion_completa;
				var nota = (completa === true) ? "Nota: "+ this.nota +"</td><td>Observación: "+this.observaciones : "No Evaluado</td><td><button type='button' id='evalCom"+this.comision+"'>Evaluar</button></td>";
				var numeroComision = this.comision;
				var comision = getElementArray(data.comisiones,"comision",numeroComision);
				$("<tr class='"+identificacion+"''><td>"+comision.nombre+"</td><td>"+nota+"</td></tr>").insertAfter($("#"+identificacion));
				$( "#evalCom"+numeroComision).click(function() {
  					horaDeEvaluar(numeroComision,comision.nombre);
				});
			}
				
		});
	
	} else if (( $("#"+identificacion).attr('clickeable') == "true") && ($("#"+identificacion).attr('creada') == "true")){
		//Si había sido creada simplemente se muestra nuevamente
		$("."+identificacion).show();
		$("#"+identificacion).attr('clickeable','false');
	} else {
		//Si no era clickeable entonces estaba expandida y se oculta
		$("."+identificacion).hide();
		$("#"+identificacion).attr('clickeable','true');
	}
}

//Devuelve un objeto de "arreglo" cuyo atributo "elemento" sea igual a "valor"
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

//Devuelve varios objetos de "arreglo" cuyos atributos "elemento" sean igual a "valor"
function getElementsArray(arreglo,elemento,valor){
	var resultado = new Object();
	var i=0;
	var j=0;
	while (i < arreglo.length){
		if (arreglo[i][elemento] == valor){
			resultado[j] = arreglo[i];
			j++;
		}
		i++;
	}
	return resultado;	
}


//Cambio de pantalla a evaluación
function horaDeEvaluar(numeroDeComision,nombreDeComision){

	var data = JSON.parse(window.localStorage.getItem("_datos"));
	//Obtiene la evaluación de la comisión
	var eval_com = getElementArray(data.evaluaciones_comisiones,"comision",numeroDeComision);
	var eval = getElementArray(data.evaluaciones,"evaluacion",eval_com.evaluacion);

	//Obtengo las notas de la escala
	var escala_datos = getElementArray(data.escalas_notas,"escala_notas",eval.escala_notas);
	var escalaNotas = getElementsArray(data.escala_notas_detalles,"escala_notas",eval.escala_notas);

	//Creación del botón para seleccionar la nota correspondiente
	var select = $(document.createElement('select'));
	$.each(escalaNotas,function(){
		select.append("<option>"+this.nota+"</option>")
	});
	select.attr("id","criterio"+this.criterio_evaluacion);


	$("#tablaEvaluar thead").append("<tr><th colspan='3'>"+eval.nombre+" - "+nombreDeComision+"</th></tr>");

	//Se crea una lista, se obtienen los miembros de la comisión, y se agregan a la misma
	$("#tablaEvaluar tbody").prepend("<tr><td colspan='3'><ul></ul></td></tr>");
	var miembros = getElementsArray(data.comisiones_integrantes,"comision",numeroDeComision);
	$("#tablaEvaluar tbody tr td ul").append("<li>Integrantes</li>");
	$.each(miembros,function(){
		var alumno = getElementArray(data.alumnos,"alumno",this.alumno);
		$("#tablaEvaluar tbody tr td ul").append("<li>"+alumno.apellido+", "+alumno.nombre+"</li>");
	});

	//Se obtienen los criterios de la evaluación
	var criterios = getElementsArray(data.criterio_evaluables,"evaluacion",eval.evaluacion);
	$.each(criterios,function(){
		
		//Creación del botón para seleccionar la nota correspondiente
		var select = $(document.createElement('select'));
		select.attr("name","notas");
		$.each(escalaNotas,function(){
			select.append("<option>"+this.nota+"</option>")
		});
		select.attr("name","criterio"+this.criterio_evaluacion);
		
		$("#comentario_general_label").before(this.descripcion+" ");
		$("#comentario_general_label").before(select);
		$("#comentario_general_label").before("<br><textarea rows='2' name='obs"+this.criterio_evaluacion+"' form='formEvaluacion' cols='50' placeholder='Observación...'></textarea><br>");


	});

	$("#formEvaluacion").prepend("Criterios de Evaluacion<br>");


	$("#divEvaluaciones").hide();
	$("#divEvaluar").show();
}

function evaluar(arreglo_formulario){
	//Se reciben los datos del formulario como un arreglo
	console.log(arreglo_formulario);
	//EN proceso
	window.localStorage.setItem("_form", JSON.stringify(arreglo_formulario));
}