var idEvaluador = 1;

$(document).ready(function(){

	//Acción del click en el botón de volver de la pantalla de evaluación
	$("#backButton").click(function(){
		volver();
	});
	
	//Acción del submit del formulario de evaluación
	$("#formEvaluacion").submit(function(event){
		event.preventDefault();
		//Se agrega la nota general al formulario
		$('<input>').attr({
    		type: 'hidden',
    		name: 'nota_General',
    		value: $("#nota_general").text()
		}).appendTo('#formEvaluacion');

		evaluar($("#formEvaluacion").serializeArray());
		$(this).unbind('submit').submit();		
	});

	$("#divEvaluarGeneral").hide();
	$("#ventana_registro").hide();
	if (JSON.parse(window.localStorage.getItem("_login")) === null){
		//Oculto la pantalla de evaluaciones
		$("#divEvaluacionesGeneral").hide();
	} else {
		$("#ventana_login").hide();
		cargarEvaluaciones();
	}


	if($(window).width()<=421)
  				$("#divEvaluaciones").attr("class","table-responsive");

	$(window).resize(function() {

  			if($(window).width()<=421)
  				$("#divEvaluaciones").attr("class","table-responsive");
  			else
  				$("#divEvaluaciones").attr("class","table-responsive");

	});

	cambiarEstilo();
	iniciarSesion();
	registrarse();

});

function volver(){

	$("#divCriterios").empty();
	$("#divEvaluarGeneral").hide();
	$("#divEvaluacionesGeneral").show();
	$("#tituloEvaluar").empty();
}

function cargarEvaluaciones(){
	if (window.localStorage.getItem("_datos") === null) {
		$.getJSON("datos.json",
				function(data){
					window.localStorage.setItem("_datos", JSON.stringify(data));	
					var datos = JSON.parse(window.localStorage.getItem("_datos"));
					cargarEvaluacionesAux(datos.evaluaciones,datos.evaluaciones_comisiones);
				});
	} else {
		//Cargo las evaluaciones desde el localStorage
		var datos = JSON.parse(window.localStorage.getItem("_datos"));
		cargarEvaluacionesAux(datos.evaluaciones,datos.evaluaciones_comisiones);
	}

}

function cargarEvaluacionesAux(evaluaciones,evaluaciones_comisiones){
	//Carga las evaluaciones desde evaluaciones
	$.each(evaluaciones, function() {
						//Por cada evaluación se obtienen las comisiones de la misma
						var evaluacion_Comisiones = getElementsArray(evaluaciones_comisiones,"evaluacion",this.evaluacion);
						//Luego se corrobora si alguna de esas comisiones son evaluadas por el evaluador (En caso de implementar el login podrían ser varios evaluadores)
						var evaluador_Comisiones = getElementArray(evaluacion_Comisiones,"evaluador",idEvaluador);
						
						if (evaluador_Comisiones != null){
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
		        			$("#tablaEvaluaciones tbody").append("<tr bgColor=#2f96b4 id='"+identificacion+"'><td>"+$(this).attr("nombre")+"</td><td>"+$(this).attr("descripcion")+"</td><td>"+$(this).attr("fecha")+"</td></tr>");
		        			//Si es selecccionable entonces se agrega el atributo html clickeable como true y se agrega la función que se ejecuta al clickearla
		        			if (clickeable){ 
		        				$("#"+identificacion).attr('clickeable','true');
		        				$("#"+identificacion).attr('creada','false');
		        				$("#"+identificacion).click(function(){
		        					clickEvaluacion(identificacion);
		        				});
		        			}
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
			//Si la comisión corresponde a la evaluación y al evaluador entonces se agrega
			if (("ev"+this.evaluacion == identificacion)&& (this.evaluador== idEvaluador)){ 
				var completa = this.evaluacion_completa;
				var nota = (completa === true) ? "<td>Nota: "+ this.nota +"</td><td>Observación: "+this.observaciones+"</td>" : "<td> No Evaluado</td><td><button type='button' class='btn btn-primary' id='evalCom"+this.comision+"'>Evaluar</button></td>";
				var numeroComision = this.comision;
				var comision = getElementArray(data.comisiones,"comision",numeroComision);
				$("<tr class='"+identificacion+"' trComision'><td>"+comision.nombre+"</td>"+nota+"</tr>").insertAfter($("#"+identificacion));
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
	while (i < Object.keys(arreglo).length && !encontrado){
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
	while (i < Object.keys(arreglo).length){
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
	select.attr("form-control");
	select.attr("id","criterio"+this.criterio_evaluacion);


	$("#tituloEvaluar").append("<h2>"+eval.nombre+" - "+nombreDeComision+"</h2>");

	//Se crea una lista, se obtienen los miembros de la comisión, y se agregan a la misma
	/*$("#tablaEvaluar tbody").prepend("<tr><td colspan='3'><ul></ul></td></tr>");*/
	var miembros = getElementsArray(data.comisiones_integrantes,"comision",numeroDeComision);
	
	$.each(miembros,function(){
		var alumno = getElementArray(data.alumnos,"alumno",this.alumno);
		$("#tituloEvaluar").append("<h3>"+alumno.apellido+", "+alumno.nombre+"</h3>");
	});

	//Se obtienen los criterios de la evaluación
	var criterios = getElementsArray(data.criterio_evaluables,"evaluacion",eval.evaluacion);
	var long = criterios.lenght
	$.each(criterios,function(){
		
		//Creación del botón para seleccionar la nota correspondiente
		var select = $(document.createElement('select'));
		select.attr("name","notas");
		$.each(escalaNotas,function(){
			select.append("<option>"+this.nota+"</option>")
		});
		select.attr("name","criterio"+this.criterio_evaluacion);
		select.attr("id","criterio"+this.criterio_evaluacion);


		select.change(function(){
				//Al cambiar una opción se recalcula la nota
				var cantidadCriterios = Object.keys(criterios).length;
				var i;
				var total=0;
				for (i=0;i<cantidadCriterios;i++){
					total+= parseInt($("#criterio"+criterios[i].criterio_evaluacion).find(":selected").text());
				}
				$("#nota_general").text(total/cantidadCriterios);
		});
		
		$("#divCriterios").append(this.descripcion+" ");
		$("#divCriterios").append(select);
		$("#divCriterios").append("<br><textarea class='form-control' rows='2' name='obs"+this.criterio_evaluacion+"' form='formEvaluacion' cols='50' placeholder='Observación...'></textarea><br>");


	});

	$("#nota_general").text(1);
	

	//Se agrega el número de comisión y de evaluación
	$('<input>').attr({
    	type: 'hidden',
    	name: 'nro_Comision',
    	value: numeroDeComision
	}).appendTo('#formEvaluacion');
	
	$('<input>').attr({
    	type: 'hidden',
    	name: 'nro_Evaluacion',
    	value: eval.evaluacion
	}).appendTo('#formEvaluacion');


	$("#divEvaluacionesGeneral").hide();
	$("#divEvaluarGeneral").show();
}

function evaluar(arreglo_formulario){
	//Se reciben los datos del formulario como un arreglo
	var largo = arreglo_formulario.length;
	//Los últimos cuatro elementos representan las observaciones generales, el número de comisión, el de evaluación y la nota general respectivamente
	var nota_General = arreglo_formulario[largo-1].value;

	var numeroEvaluacion = arreglo_formulario[largo-2].value;

	var numeroComision = arreglo_formulario[largo-3].value;

	var obs = arreglo_formulario[largo-4].value;


	//Al ser evaluado es necesario modificar "evaluaciones_comisiones" y "evaluciones_comisiones_criterios"
	//Primero se modifica la evaluacion_comisiones
	var encontrado = false;
	var i = 0;
	var datos = JSON.parse(window.localStorage.getItem("_datos")); 
	while (!encontrado){
		if ((datos.evaluaciones_comisiones[i].comision == numeroComision) && (datos.evaluaciones_comisiones[i].evaluacion == numeroEvaluacion)){
			encontrado = true;
			datos.evaluaciones_comisiones[i].observaciones = obs;
			datos.evaluaciones_comisiones[i].evaluacion_completa = true;
			datos.evaluaciones_comisiones[i].nota = nota_General;
		}
		i++;
	}

	//Luego se modifica evaluaciones_comisiones_criterios
	i = 0;
	j = 0;
	while (j<(largo - 4)){ //Mientras haya criterios 
		console.log(datos.evaluaciones_comisiones_criterios);
		if (datos.evaluaciones_comisiones_criterios[i].comision == numeroComision){
			datos.evaluaciones_comisiones_criterios[i].nota = arreglo_formulario[j].value;
			datos.evaluaciones_comisiones_criterios[i].observaciones = arreglo_formulario[j+1].value; 
			j+=2;
		}
		i++;
	}

	window.localStorage.setItem("_datos", JSON.stringify(datos));
}



function cambiarEstilo(){


	if(localStorage.getItem("Estilo")==2)
		$("head").append('<link id="estiloCargado" rel="stylesheet" href="css/estiloOpcion.css">');


	$("#b").click(function(){

 	 
 	 
 	 var cambioEstilo= localStorage.getItem("Estilo");

 	 if(cambioEstilo==null){

 	 	$("head").append('<link id="estiloCargado" rel="stylesheet" href="css/estiloOpcion.css">');
 	 	localStorage.setItem("Estilo",2);
 	 }
 	 else{
	 	 	if(cambioEstilo==2){
	 	 		$("#estiloCargado").remove();
	 	 		localStorage.setItem("Estilo",1);
	 	 	}
	 	 	else{//Si estilo es igual a 1
					$("head").append('<link id="estiloCargado" rel="stylesheet" href="css/estiloOpcion.css">');
	 	 			localStorage.setItem("Estilo",2);
	 	 		
	 	 		}

 	 }
  			

	});



}

function iniciarSesion(){
	$("#iniciar_sesion").click(function(){

		//Registra en local storage que está logueado y carga las evaluaciones
		window.localStorage.setItem("_login","true");
		cargarEvaluaciones();
		
		$("#ventana_login").remove();

		$("#menuAcceso").remove();
		$("#misMenues").append('<a class="nav-item nav-link" href="#">Home</a>');
		$("#misMenues").append('<a class="nav-item nav-link" href="#">Item1</a>');
		$("#misMenues").append('<a class="nav-item nav-link" href="#">Item2</a>');

		$("#menuDerecha").append('		<div class="btn-group"> <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownmenu1" data-toggle="dropdown" aria-extended="true"><span class="fa fa-user"></span> Jorge Cardozo <span class="caret"></span> </button> <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownmenu1"> <a class="dropdown-item" href="#"> <span class="fa fa-cogs"></span>Configuracion</a> <form class="form-inline"><a class="dropdown-item" href="#"><span class="fa fa-power-off"></span> Cerrar Sesion</a> </form></ul> </div>');
		$("#divEvaluacionesGeneral").show();

	});
}

function registrarse(){
	$("#registrarse").click(function(){
		$("#ventana_login").remove();
		$("#ventana_registro").show();

	});

}




