
/**
 * Structure diagrams question java
 *
 * @copyright  2013 Jose Ignacio Hernando García
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
//------------------------------------------------------------------------------
function init(arg1,barText, solText,flagviga ,mdl_nq, depur, qt_field_name,flag_botones, mi_feedback, internalforceserror, abscissaerror){
    //--------------------------------------------------------------------------
    // Contenedores
    var contenedorCanvas;         // Contenedor del canvas
//    var contenedorTextoPregunta;  // Padre del anterior
//    var contenedorAblock;         // Hermano del anterior. Contiene la resp. 
//    var contenedorAnswer;         // Hijo del anterior. Contiene input
    var input;                    // El input de la respuesta de moodle
    //--------------------------------------------------------------------------
    // Botones
    var ibar_select;
    var curva_select;
    var _scale_button;    //+- de scala
    var scale__button;
    var _scaleEsf_button; //+- de scala Esfuerzos
    var scaleEsf__button;
    var s_input;          //coordenada s
    var s_tol_input;      //tolerancia en s
    var S_input;          //coordenada S
    var S_tol_input;      //tolerancia en S  
    var esf_input;        //valor del esfuerzo (en la abscisa local S)
    var esf_tol_input;    //tolerancia en esf
    var pan_button;       //pan sobre el dibujo
    //--------------------------------------------------------------------------
    // Canvas
    var canvasImageView,  canvasImageTemp, contextImageView, contextImageTemp;
    //--------------------------------------------------------------------------
    var scale=0, _xG=0, _yG=0, _X0=0, _Y0=0; 
    var _xbar= 100000; //Coor max y min de barras
    var xbar_=-100000; 
    var _ybar= 100000;
    var ybar_=-100000; 
    var solM=0;        //Esfuerzo Máximo
    var scaleEsf=-1;
    var margenes=0.75; //margenes de los diagramas
    var s_tol_flag;    //Indicador de si esta activo s o S 
                       //necesario para modificar, o no,  S_tol al cambiar ibar.
    var S_tol;         //coordenada S
    var esf_tol=10;    //Tolerancia en esf
    //--------------------------------------------------------------------------
    var bar= new Array() ; fbar();
    var cbar;                       // Barra "actual"
    var sol= new Array() ; fsol();  // Solucion
    var esf= new Array() ; fesf();  // Respuesta alumnos
    var esfi=new Array() ;                       
    var eOK= new Array() ; fchk();  // chk respuestas
    //--------------------------------------------------------------------------
    var pan=false; 
    var ipan_mousedown=0;                      
    //--------------------------------------------------------------------------
    if(window.addEventListener) {
	window.addEventListener('load', load,false);
    } 
    else if (window.attachEvent) { // IE DOM
	var r = window.attachEvent("on"+'load', load);
	sorry1();
	return r;
    }
    else {
	sorry2("addEventListener/attachEvent");
	return;
    }
    //return;

    //--------------------------------------------------------------------------
    function sorry1() {	
	document.write ("<p>Unfortunately, your browser is currently unsupported by our web application. We are sorry for the inconvenience. Please use one of the supported browsers listed below.</p>");
	document.write ("Supported browsers:<a href='http://www.opera.com'>Opera</a>,<a href='http://www.mozilla.com'>Firefox</a>,<a href='http://www.apple.com/safari'>Safari</a>, and<a href='http://www.konqueror.org'>Konqueror</a>");
	document.write("<p>User-agent header sent: " + navigator.userAgent+
		       "</p>");
    }
    function sorry2(text) {
	document.write ("Your browser does not support "+ text);
    }
    //--------------------------------------------------------------------------
    function contenedores() {
	contenedorCanvas= document.getElementById('container_'+arg1);
	if (!contenedorCanvas) {
	    alert('Error: I cannot find the container_'+arg1+' element!');
	    return;
	}

	aux=qt_field_name.replace("id","answer"); 
	input=document.getElementById(aux);
    }
    //--------------------------------------------------------------------------
    function botones(){
	ibar_select = document.getElementById('ibar_'+arg1);
	curva_select = document.getElementById('curva_'+arg1);
	_scale_button = document.getElementById('_scale'+arg1);
	scale__button = document.getElementById('scale_'+arg1);	
	_scaleEsf_button = document.getElementById('_scaleEsf'+arg1);
	scaleEsf__button = document.getElementById('scaleEsf_'+arg1);
	s_input = document.getElementById('s_'+arg1);
	s_tol_input = document.getElementById('s_tol_'+arg1);
	S_input = document.getElementById('S_'+arg1);
	S_tol_input = document.getElementById('S_tol_'+arg1);
	esf_input = document.getElementById('esf_'+arg1);
	esf_tol_input = document.getElementById('esf_tol_'+arg1);
	pan_button = document.getElementById('pan_'+arg1);	
	if (!ibar_select      || !curva_select || 
	    !_scale_button    || !scale__button|| 
	    !_scaleEsf_button || !scaleEsf__button|| 
	    !s_input          || !s_tol_input ||
	    !S_input          || !S_tol_input ||
	    !esf_input        || !esf_tol_input ||
	    !pan_button) {
	    alert('Error: I cannot find the input element! (botones())'+arg1);
	    return;
	}
    }
    //--------------------------------------------------------------------------
    function ini_botones(){
	var ibar;
	for (ibar=1;ibar <= bar.length; ibar++){
	    var opcion = document.createElement('option');
	    opcion.value=ibar;
	    opcion.text="bar"+ibar;
	    ibar_select.appendChild(opcion);
	}
	var opcion = document.createElement('option');
	opcion.value=0;
	opcion.text="chk";
	ibar_select.appendChild(opcion);
    }
    //--------------------------------------------------------------------------
    function ini_botones_escala(){
	esf_tol_input.value=esf_tol;
	s_tol_input.value=0.25;
	S_tol=s_tol_input.value*tool.lg/scale;
	S_tol_input.value=S_tol;
	s_tol_flag=1;  //Inicialmente está activa s (coordenada relativa) 
    }
    //--------------------------------------------------------------------------
    function canvasWidthHeight(canvasImageView, contenedorCanvas) {
	
    	canvasImageView.width  = contenedorCanvas.offsetWidth;
	scale=(contenedorCanvas.offsetWidth)/(xbar_-_xbar)*margenes;		
    	canvasImageView.height = (ybar_-_ybar)*scale+(xbar_-_xbar)*scale*(1.0-margenes)/margenes;
	contenedorCanvas.height=canvasImageView.height;


	scaleEsf=-((xbar_-_xbar)*scale*(1.0-margenes)/margenes)/solM/2.25;

    }
    //--------------------------------------------------------------------------
    function canvas() {
	canvasImageView = document.createElement('canvas');
	canvasImageTemp = document.createElement('canvas');;
	if (!canvasImageView || !canvasImageTemp) {
	    alert('Error: I cannot create a new canvas element!');
	    return;
	}
	canvasImageView.id= 'imageView_'+arg1;
	canvasWidthHeight(canvasImageView,contenedorCanvas);

	canvasImageView.style.position  = "absolute";
	canvasImageView.style.border=".5px solid #888888";
	contenedorCanvas.appendChild(canvasImageView);
	
	canvasImageTemp.id     = 'imageTemp_'+arg1;
	canvasImageTemp.width  = canvasImageView.width;
	canvasImageTemp.height = canvasImageView.height;
	canvasImageTemp.style.background="#FFFFFF";
	contenedorCanvas.appendChild(canvasImageTemp);

	if(canvasImageView.getContext) {
	    contextImageView = canvasImageView.getContext('2d');
	    contextImageTemp = canvasImageTemp.getContext('2d');
	    if (!contextImageTemp || !contextImageView) {
		alert('Error: failed to getContext!');
		return;
	    }
	}
	else {
	    //OJO OJO AQUI SE PARA IE8
	    alert('Error: Your browser does not support getContext!');
	    throw "exit"; 
	    null.dummy;   //Esto proboca un error y se sale del script
	    
	    sorry1();
	    sorry2("canvasImageView.getContext");
	    return;
	}
	//Se añade texto para navegadores en los que no funciona canvas
	canvasText(canvasImageView);
    }
    //-------------------------------------------------------------------------
    //Texto alternativo a canvas
    function canvasText(canvasImageView) {
	elemento1 = document.createElement('p');
	elemento1.appendChild(document.createTextNode('Unfortunately, your browser is currently unsupported by our web application. We are sorry for the inconvenience. Please use one of the supported browsers listed below'));
	canvasImageView.appendChild(elemento1);
	elemento1 = document.createElement('p');
	elemento1.appendChild(document.createTextNode('Supported browsers:'));
	newlink  = document.createElement('a');
	newlink.appendChild(document.createTextNode('Opera'));
	newlink.setAttribute('href', 'http://www.opera.com');	
	elemento1.appendChild(newlink);
	elemento1.appendChild(document.createTextNode(','));
	newlink  = document.createElement('a');
	newlink.appendChild(document.createTextNode('Firefox'));
	newlink.setAttribute('href', 'http://www.mozilla.com');	
	elemento1.appendChild(newlink);
	elemento1.appendChild(document.createTextNode(','));
	newlink  = document.createElement('a');
	newlink.appendChild(document.createTextNode('Safari'));
	newlink.setAttribute('href', 'http://www.apple.com/safari');	
	elemento1.appendChild(newlink);
	elemento1.appendChild(document.createTextNode(', and'));
	newlink  = document.createElement('a');
	newlink.appendChild(document.createTextNode('Konqueror'));
	newlink.setAttribute('href', 'http://www.konqueror.org');	
	elemento1.appendChild(newlink);
	canvasImageView.appendChild(elemento1);
    }
    //--------------------------------------------------------------------------
    //Se ponen los datos del segundo argumento del script en la variable bar
    //y se calculan los valores max y min de las coordenadas
    function fbar() { 
	var aux=barText.split(";");
	for (var i=0;i<aux.length;i++) {
	    bar[i]=aux[i].split(",");
	    _xbar=Math.min(_xbar,bar[i][0],bar[i][2]);
	    xbar_=Math.max(xbar_,bar[i][0],bar[i][2]);
	    _ybar=Math.min(_ybar,bar[i][1],bar[i][3]);
	    ybar_=Math.max(ybar_,bar[i][1],bar[i][3]);
	}
	
    }   
    //--------------------------------------------------------------------------
    //Se ponen los datos del tercer argumento del script en la variable sol
    function fsol() { 
	
	solM=0;
	var aux_=solText.split(";");       // Barras
	for (var i=0;i<aux_.length;i++) {
	    var aux=aux_[i].split("x");    // Leyes (definidas por tramos)
	    var sol_=new Array();
	    for (var j=0;j<aux.length;j++) {
		sol_[j]=aux[j].split(","); // Valores
		//Se calcula el máximo esfuerzo en valor absoluto
		solM=Math.max(solM,Math.abs(sol_[j][1]),Math.abs(sol_[j][3])); 
		if(sol_[j].length>4){solM=Math.max(solM,Math.abs(sol_[j][5]));}
	    }
	    sol[i]=sol_;
	}
    }       
    //--------------------------------------------------------------------------
    // Se ponen los datos del input de Moodle en la variable esf
    // Y se impide escribir en input de Moodle
    //function fesf2() {}
    function fesf2() { 
	//No se permite escribir en respuesta de moodle 
	input.readOnly=true;
	// Lo que sigue no funciona con IE
	// input.setAttribute("type", "hidden");
	// input.type="hidden";
        // Descomentar la linea siguiente para asegurarse de hidden la respuesta
	//input.parentNode.parentNode.style.visibility = 'hidden'; 
	if(input.value) {
	    var aux=input.value.split("#");
	    if(aux[1]) {
		var aux_=aux[1].split(";");
		for (var i=0;i<aux_.length;i++) {
		    var aux=aux_[i].split("x");
		    esf_=new Array();
		    for (var j=0;j<aux.length;j++) {
			esf_[j]=aux[j].split(",");
		    }
		    esf[i]=esf_;
		}
	    }
	}
    }    
       
    //--------------------------------------------------------------------------
    function fesf() { 
	for (ibar=0;ibar < bar.length; ibar++) {
	    esf[ibar]=new Array(); 
	}
    }    
    //--------------------------------------------------------------------------
    function fchk() { 
	for (ibar=0;ibar < bar.length; ibar++) {
	    eOK[ibar]=false;
	}
    } 
    //--------------------------------------------------------------------------
    function xG(_x){
	return _xG+_x*scale;
    }
    //--------------------------------------------------------------------------
    function yG(_y){
	return _yG-_y*scale;
    } 
    //--------------------------------------------------------------------------
    function ini_xGyG(){
	_xG=canvasImageView.width  / 2-(xbar_+_xbar)/2*scale+_X0;
	_yG=canvasImageView.height / 2+(ybar_+_ybar)/2*scale+_Y0;
	if (flagviga!=1) {
	    _yG+=0.25*(xbar_-_xbar)*scale*(1.0-margenes)/margenes;}
	    
    }   
    //--------------------------------------------------------------------------
    function barDraw() {
	for (ibar=0; ibar < bar.length; ibar++){
	    contextImageView.strokeStyle = "rgb(0,0,0)";
	    if (ibar==cbar) {	
                contextImageView.lineWidth = 3;
		contextImageView.strokeStyle = "rgb(255,0,0)";
	    }
	    contextImageView.beginPath();
	    contextImageView.moveTo(xG(bar[ibar][0]), yG(bar[ibar][1]));
	    contextImageView.lineTo(xG(bar[ibar][2]), yG(bar[ibar][3]));
	    contextImageView.stroke();
	    contextImageView.closePath();
            contextImageView.lineWidth = 1;
	}
    }
    //--------------------------------------------------------------------------
  
    function chkEsf() {
	
	for (ibar=0; ibar < bar.length; ibar++){
	    var iOK=true;
	    
	    if (sol[ibar].length!=esf[ibar].length) {iOK=false;}
	    
	    if (iOK) {
		for (iesf=0; iesf< sol[ibar].length; iesf++) {
		    var nisol=sol[ibar][iesf].length;
		    var niesf=esf[ibar][iesf].length;
		    if (nisol!=niesf) {
			iOK=false;}

		    if(Math.abs(esf[ibar][iesf][0]-sol[ibar][iesf][0])>abscissaerror ||
		       Math.abs(esf[ibar][iesf][niesf-2]-
				sol[ibar][iesf][niesf-2])>abscissaerror ||
		       Math.abs((esf[ibar][iesf][1]-
				 sol[ibar][iesf][1])/
				sol[ibar][iesf][1])>internalforceserror ||
		       Math.abs((esf[ibar][iesf][niesf-1]-
				 sol[ibar][iesf][niesf-1])/
				sol[ibar][iesf][niesf-1])>internalforceserror) {
			iOK=false;
			
		    }
		    
		    if(nisol==6) { //parábola
			
			var solIsos=isos2(sol[ibar][iesf][0],sol[ibar][iesf][1],
					  sol[ibar][iesf][2],sol[ibar][iesf][3],
					  sol[ibar][iesf][4],sol[ibar][iesf][5]
					  );
			var esfIsos=isos2(esf[ibar][iesf][0],esf[ibar][iesf][1],
					  esf[ibar][iesf][2],esf[ibar][iesf][3],
					  esf[ibar][iesf][4],esf[ibar][iesf][5]
					  );
			if(Math.abs((esfIsos-solIsos)/solIsos)>internalforceserror) {
			    iOK=false;
			    
			}
		    }
		    
		}
	    }
	    
	    
	    eOK[ibar]=iOK;
	}
	
    }
    //--------------------------------------------------------------------------
    function isos2(x0_,y0,x1_,y1,x2_,y2) {
	//var x0=0.0;
	//var x2=1.1;
	var x1=(x1_-x0_)/(x2_-x0_);

	var lcierr_x=1.0*y0+(y2-y0)*x1;
	var lcierr_y=lcierr_x-y1;
	
	if(x1*(x1-1)==0) {return 1000000000000000000000;}
	var isos=-1.0/4*lcierr_y/(x1*(x1-1));
	
	return isos;
    }
    //--------------------------------------------------------------------------
    function maxM(x0,y0,x1,y1,x2,y2) {
	// Abscisa y ordenada del maximo de una parábola definida por 3 puntos
	var a=(y0*x1-y0*x2-x0*y1+x0*y2-y2*x1+x2*y1)/
	    (x0*x0*x1-x0*x0*x2-x0*x1*x1+x0*x2*x2-x2*x2*x1+x2*x1*x1);
	var b=-(x1*x1*y0-y2*x1*x1-y1*x0*x0-x2*x2*y0+y1*x2*x2+y2*x0*x0)/
	    (x1-x2)/(-x1*x0+x1*x2+x0*x0-x2*x0);
	var c=(y2*x0*x0*x1-y1*x0*x0*x2-x1*x1*x0*y2+y1*x0*x2*x2+x1*x1*y0*x2-
	       x2*x2*y0*x1)/
	    (x1-x2)/(-x1*x0+x1*x2+x0*x0-x2*x0);
	var xmax=-b/(2*a);
	var ymax=a*xmax*xmax+b*xmax+c;
	return([xmax,ymax]);
    }
    //--------------------------------------------------------------------------
    function solDraw() {
	if(depur==1) {
	    solDraw_(sol,"rgb(255,0,0)",false,"rgb(255,0,0)");
	}
    }    
    function esfDraw() {
	chkEsf();
	solDraw_(esf,"rgb(0,0,0)",true,"rgba(0,255,0,0.35)");
    }
    function solDraw_(sol,Style,Fill, StyleFill) { 
	contextImageView.drawImage(canvasImageTemp, 0, 0);
	for (ibar=0; ibar < bar.length; ibar++){
	    solDrawIbar(sol[ibar],bar[ibar],Style);
	    contextImageView.lineTo(xG(bar[ibar][2]), yG(bar[ibar][3]));
	    contextImageView.fillStyle=StyleFill;
	    if(Fill && eOK[ibar] && mi_feedback==1) {contextImageView.fill();}
	    contextImageView.stroke();
	    contextImageView.closePath();
	}
    }

    function solDrawIbar(sol,bar,Style) {
	var x0=xG(bar[0]);
	var y0=yG(bar[1]);
	var Dx=xG(bar[2])-x0;
	var Dy=yG(bar[3])-y0;
	var lg=Math.sqrt(Dx*Dx+Dy*Dy);
	var e1x=Dx/lg;
	var e1y=Dy/lg;
	var e2x=e1y;
	var e2y=-e1x;
	contextImageView.strokeStyle = Style;
	contextImageView.beginPath();
	contextImageView.moveTo(xG(bar[0]), yG(bar[1]));
	for (j=0; j< sol.length; j++) {
	    _x0=x0+e1x*lg*sol[j][0]+e2x*scaleEsf*sol[j][1];
	    _y0=y0+e1y*lg*sol[j][0]+e2y*scaleEsf*sol[j][1];
	    _x1=x0+e1x*lg*sol[j][2]+e2x*scaleEsf*sol[j][3];
	    _y1=y0+e1y*lg*sol[j][2]+e2y*scaleEsf*sol[j][3];
	    //--------------------------------------------------------------
	    if(sol[j].length==6) { //parabola
		_x2=x0+e1x*lg*sol[j][4]+e2x*scaleEsf*sol[j][5];
		_y2=y0+e1y*lg*sol[j][4]+e2y*scaleEsf*sol[j][5];
		var lcierr_x=1.0*sol[j][1]+(sol[j][5]-
					    sol[j][1]
					    )*sol[j][2];
		
		var lcierr_y=lcierr_x-sol[j][3];
		
		var isos;
		isos=isos2(sol[j][0],sol[j][1],
			   sol[j][2],sol[j][3],
			   sol[j][4],sol[j][5]);
		
		
		var mL_2=(1.0*sol[j][1]+1.0*sol[j][5])/2.0-2.0*isos;
		
		__x1=x0+e1x*lg*(0.5*sol[j][0]+0.5*sol[j][4])+e2x*scaleEsf*mL_2;
		__y1=y0+e1y*lg*(0.5*sol[j][0]+0.5*sol[j][4])+e2y*scaleEsf*mL_2;
		
		
		contextImageView.lineTo(_x0, _y0);
		contextImageView.quadraticCurveTo(__x1,__y1,_x2, _y2);
	    }
	    //--------------------------------------------------------------
	    else { //recta
		contextImageView.lineTo(_x0, _y0);
		contextImageView.lineTo(_x1, _y1);
	    }
	}
	
    }
    
    //-------------------------------------------------------------------------
    function tablaBotones() {
	var fontSize="8pt";
	//---------------------------------------------------------------------
	var miCelda;
	miCelda = document.createElement('td');
	miCelda.style.padding="1pt";
	//---------------------------------------------------------------------
	var miselect;
	miselect=document.createElement('select');
	miselect.style.fontSize=fontSize;
	//---------------------------------------------------------------------
	var mibutton0;
	mibutton0 = document.createElement('input');
	mibutton0.style.fontSize=fontSize;
	mibutton0.style.height="17pt";
	mibutton0.style.width="14pt";
	//---------------------------------------------------------------------
	var mibutton;
	mibutton = mibutton0.cloneNode(true);
	mibutton.type="button";
	//---------------------------------------------------------------------
	//Segundo nivel de tablas (tabla en una celda de la primera tabla)
	var miTabla2; 
	miTabla2 = document.createElement('table');
	miTabla2.style.border=".5px solid #888888";
	miTabla2.style.margin=".5px";
	//---------------------------------------------------------------------
	var miCelda2;
	miCelda2 = document.createElement('td');
	miCelda2.style.padding=0;
	//---------------------------------------------------------------------
	var mibutton2;
	mibutton2 = mibutton.cloneNode(true);
	mibutton2.style.width="40pt";
	//---------------------------------------------------------------------
	var miinput2;
	miinput2 = mibutton0.cloneNode(true);
	miinput2.style.width="25pt";
	miinput2.style.height="12pt";
	miinput2.type="text";
	//---------------------------------------------------------------------
	//---------------------------------------------------------------------
	//---------------------------------------------------------------------
	var mitablaBotones = document.createElement('table');
	if (!mitablaBotones ) {
	    alert('Error: I cannot create a new table element!');
	    return;
	}
	mitablaBotones.id= 'id_tablaBotones_menu'+arg1;
	//---------------------------------------------------------------------
	var micelda;
	micelda= miCelda.cloneNode(true);
	{
	    ibar_select=miselect.cloneNode(true);
	    micelda.appendChild(ibar_select);
	}
	mitablaBotones.appendChild(micelda);
	//---------------------------------------------------------------------
	micelda = miCelda.cloneNode(true);
	{
	    micelda.id= 'id_CURVA'+arg1; 
	    curva_select = miselect.cloneNode(true);
	    curva_select.id = 'curva_'+arg1;
	    {
		var opcion = document.createElement('option');
	        opcion.value="line";
		opcion.text="rect";
		curva_select.appendChild(opcion);
		opcion = document.createElement('option');
		opcion.value="parabola";
		opcion.text="parb";
		curva_select.appendChild(opcion);
	    }
	    micelda.appendChild(curva_select);
	}
	mitablaBotones.appendChild(micelda);
	//---------------------------------------------------------------------
	var span;
	micelda = miCelda.cloneNode(true);
	{
	    micelda.id= 'id_ZOOM'+arg1;
	    var mitablaBotones2 = miTabla2.cloneNode(true);
	    mitablaBotones2.id= 'id_ZOOM_menu'+arg1;
	    var micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_ZOOMP'+arg1; {
		    span=document.createElement('span');
		    span.title = "Disminuye escala de geometría";
		    _scale_button = mibutton.cloneNode(true);
		    _scale_button.value="<";
		    span.appendChild(_scale_button);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_ZOOMM'+arg1; {
		    span=document.createElement('span');
		    span.title = "Aumenta escala de geometría";
		    scale__button =  mibutton.cloneNode(true);
		    scale__button.value=">";
		    span.appendChild(scale__button);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda.appendChild(mitablaBotones2);
	}
	mitablaBotones.appendChild(micelda);
	//---------------------------------------------------------------------
	micelda= miCelda.cloneNode(true);
	{
	    micelda.id= 'id_ZOOM_ESF'+arg1;
	    var mitablaBotones2 = miTabla2.cloneNode(true);
	    mitablaBotones2.id= 'id_ZOOM_ESF_menu'+arg1;
	    var micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_ZOOM_ESFP'+arg1; {
		    span=document.createElement('span');
		    span.title = "Disminuye escala de esfuerzos";
		    _scaleEsf_button = mibutton.cloneNode(true);
		    _scaleEsf_button.value="<";
		    span.appendChild(_scaleEsf_button);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_ZOOM_ESFM'+arg1; {
		    span=document.createElement('span');
		    span.title = "Aumenta escala de esfuerzos";
		    scaleEsf__button = mibutton.cloneNode(true);
		    scaleEsf__button.value=">";
		    span.appendChild(scaleEsf__button);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda.appendChild(mitablaBotones2);
	}
	mitablaBotones.appendChild(micelda);
	//---------------------------------------------------------------------
	micelda= miCelda.cloneNode(true);
	{
	    micelda.id= 'id_DESPLAZA'+arg1;
	    var mitablaBotones2 = miTabla2.cloneNode(true);
	    mitablaBotones2.id= 'id_DESPLAZA_menu'+arg1;
	    var micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_DESPLAZA'+arg1; {
		    span=document.createElement('span');
		    span.title = "Desplaza geometría. Doble click centra el dibujo.";
		    pan_button = mibutton.cloneNode(true);
		    pan_button.value="/";
		    span.appendChild(pan_button);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda.appendChild(mitablaBotones2);
	}
	mitablaBotones.appendChild(micelda);
	//---------------------------------------------------------------------
	micelda= miCelda.cloneNode(true);
	{
	    micelda.id= 'id_COOR_REL'+arg1;
	    var mitablaBotones2 = miTabla2.cloneNode(true);
	    mitablaBotones2.id= 'id_COOR_REL_menu'+arg1;
	    var micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_COOR_REL'+arg1; {
		    span=document.createElement('span');
		    span.title = "Coordenada x relativa del eje local de la barra activa";
		    s_input = mibutton2.cloneNode(true);
		    span.appendChild(s_input);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_COOR_REL_TOL'+arg1; {
		    span=document.createElement('span');
		    span.title = "Precisión de la coordenada x relativa";
		    s_tol_input = miinput2.cloneNode(true);
		    span.appendChild(s_tol_input);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda.appendChild(mitablaBotones2);
	}
	mitablaBotones.appendChild(micelda);
	//---------------------------------------------------------------------
	micelda= miCelda.cloneNode(true);
	{
	    micelda.id= 'id_COOR_ABS'+arg1;
	    var mitablaBotones2 = miTabla2.cloneNode(true);
	    mitablaBotones2.id= 'id_COOR_ABS_menu'+arg1;
	    var micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_COOR_ABS'+arg1; {
		    span=document.createElement('span');
		    span.title = "Coordenada x absoluta del eje local de la barra activa";
		    S_input = mibutton2.cloneNode(true);
		    span.appendChild(S_input);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_COOR_ABS_TOL'+arg1; {
		    span=document.createElement('span');
		    span.title = "Precisión de la coordenada x absoluta";
		    S_tol_input = miinput2.cloneNode(true);
		    span.appendChild(S_tol_input);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda.appendChild(mitablaBotones2);
	}
	mitablaBotones.appendChild(micelda);
	//---------------------------------------------------------------------
	micelda= miCelda.cloneNode(true);
	{
	    micelda.id= 'id_ESF'+arg1;
	    var mitablaBotones2 = miTabla2.cloneNode(true);
	    mitablaBotones2.id= 'id_ESF'+arg1;
	    var micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_ESF'+arg1; {
		    span=document.createElement('span');
		    span.title = "Valor del esfuerzo";
		    esf_input = mibutton2.cloneNode(true);
		    span.appendChild(esf_input);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda2 = miCelda2.cloneNode(true);{
		micelda2.id= 'id_ESF_TOL'+arg1; {
		    span=document.createElement('span');
		    span.title = "Precisión del esfuerzo";
		    esf_tol_input = miinput2.cloneNode(true);
		    span.appendChild(esf_tol_input);
		}
		micelda2.appendChild(span);
	    }
	    mitablaBotones2.appendChild(micelda2);
	    micelda.appendChild(mitablaBotones2);
	}
	mitablaBotones.appendChild(micelda);
	//---------------------------------------------------------------------
	mitablaBotones.style.border=".5px solid #888888";
	mitablaBotones.style.marginBottom="4px";
	contenedorCanvas.appendChild(mitablaBotones);
    }
    //-------------------------------------------------------------------------
    function load() {
	contenedores();  //Inician variables de contenedores
	fesf2();         //Se leen datos de input y se ponen en esf 
	if(flag_botones==1) {
	    tablaBotones();  //Inician variables de botones
	    ini_botones();
	}
	{
	    
	}
	canvas();
	ini_xGyG();
	solDraw();  //Solo para depuración
	esfDraw();  //Se recupera el dibujo de intentos anteriores
	barDraw();
	//---------------------------------------------------------------------
	f_scale__button=new f_scale__buttons();
	_scale_button.addEventListener('mousedown',ev__scale_button, false);
	_scale_button.addEventListener('mousemove',ev__scale_button, false);
	_scale_button.addEventListener('touchstart',ev__scale_button, false);
	scale__button.addEventListener('mousedown',ev_scale__button, false);
	scale__button.addEventListener('mousemove',ev_scale__button, false);
	scale__button.addEventListener('touchstart',ev_scale__button, false);
	//---------------------------------------------------------------------
	f_scaleEsf__button=new f_scaleEsf__buttons();
	_scaleEsf_button.addEventListener('mousedown',ev__scaleEsf_button, false);
	_scaleEsf_button.addEventListener('mousemove',ev__scaleEsf_button, false);
	_scaleEsf_button.addEventListener('touchstart',ev__scaleEsf_button, false);
	scaleEsf__button.addEventListener('mousedown',ev_scaleEsf__button, false);
	scaleEsf__button.addEventListener('mousemove',ev_scaleEsf__button, false);
	scaleEsf__button.addEventListener('touchstart',ev_scaleEsf__button, false);
	//--------------------------------------------------------------------- 
	tool= new tools['line']();
	if(eOK[0]==false) {
	    tool.Ibar(0,false,false);
	}
	//--------------------------------------------------------------------- 
	ini_botones_escala();
	// Attach the mousedown, mousemove and mouseup event listeners.
	canvasImageView.addEventListener('mousedown', ev_canvas, false);
	canvasImageView.addEventListener('mousemove', ev_canvas, false);
	canvasImageView.addEventListener('mouseup',   ev_canvas, false);
	canvasImageView.addEventListener('mouseout',  ev_canvas, false);
	canvasImageView.addEventListener('touchstart',  ev_canvas, false);
	canvasImageView.addEventListener('touchmove',  ev_canvas, false);
	canvasImageView.addEventListener('touchend',  ev_canvas, false);
	//--------------------------------------------------------------------- 
	ibar_select.addEventListener('change', ev_ibar_select, false); 
	//--------------------------------------------------------------------- 
	curva_select.addEventListener('change', ev_curva_select, false);
	//--------------------------------------------------------------------- 
	pan_button.addEventListener('mousedown', ev_pan_button, false); 
	pan_button.addEventListener('dblclick', ev_pan_button, false);
	//---------------------------------------------------------------------
	esf_tol_input.addEventListener('keyup', ev_esf_tol_input, false);
	//--------------------------------------------------------------------- 
	s_tol_input.addEventListener('keyup', ev_s_tol_input, false);
	//--------------------------------------------------------------------- 
	S_tol_input.addEventListener('keyup', ev_S_tol_input, false);
	//--------------------------------------------------------------------- 
	    
    }

    //-------------------------------------------------------------------------
    var inc_scale=0;
    function ev_scale__button (ev) {
	inc_scale=1;
	var func = f_scale__button[ev.type];
	if (func) {func(ev);}
    }
    function ev__scale_button (ev) {
	inc_scale=-1;
	var func = f_scale__button[ev.type];
	if (func) {func(ev);}
    }
    var f_scale__button;  //Instancia al siguiente obj. Se crea (new) en load() 
    var f_scale__buttons=function () {
	var toolb = this;
	this.started = false;
	this.mousemove = function (ev) {
	   if (toolb.started) {
	       redraw();
	       toolb.started = false;
	   }
	};
	this.mousedown = function (ev) {
	    if (toolb.started) {
		redraw()
	    };
	    toolb.started = true;
	    scale=scale+inc_scale;
	    tool.update(scale/(scale-inc_scale),1);
	    redraw();
	};
	this.touchstart=this.mousedown;
    }

    //------------------------------------------------------------------------- 
    var inc_scaleEsf=0;
    function ev_scaleEsf__button (ev) {
	inc_scaleEsf=1.1;
	var func = f_scaleEsf__button[ev.type];
	if (func) {func(ev);}
    }
    function ev__scaleEsf_button (ev) {
	inc_scaleEsf=1/1.1;
	var func = f_scaleEsf__button[ev.type];
	if (func) {func(ev);}
    }
    var f_scaleEsf__button;  //Instancia al siguiente obj. Se crea (new)en load 
    var f_scaleEsf__buttons=function () {
	var toolb = this;
	this.started = false;
	this.mousemove = function (ev) {
	    if (toolb.started) {
		redraw();
		toolb.started = false;
	    }
	};
	this.mousedown = function (ev) {
	    if (toolb.started) {
		redraw();
	    };
	    toolb.started = true;
	    scaleEsf=scaleEsf*inc_scaleEsf;
	    tool.update(1,inc_scaleEsf);
	    redraw();
	};
	this.touchstart=this.mousedown;
    }
    //-------------------------------------------------------------------------
    function inputValue() {
	var txt="";
	var aux=0;
	for (ibar=0;ibar < bar.length; ibar++){
	    for (iesf=0;iesf < esf[ibar].length;iesf++) {
		txt=txt+esf[ibar][iesf];
		if(iesf<esf[ibar].length-1) {txt=txt+"x"};
	    }
	    if(ibar<bar.length-1) {txt=txt+";"};
	    if(eOK[ibar]) {aux++}
	}
	input.value=aux+"#"+txt+"#";
    }
    //-------------------------------------------------------------------------
    function ev_ibar_select (ev) {


	if (this.value>0 && (
	                    mi_feedback==0 || eOK[(this.value)-1.0]==false
	                    )
	   ) {

	    esf[tool.ibar]=esfi;
	    esfi=[];
	    cbar=(this.value)-1.0;
	    tool.Ibar(cbar,false,false);
	    redraw();
	    inputValue();
	    //Se actualizan los botones 
	    if(s_tol_flag==1) {
		S_tol=s_tol_input.value*tool.lg/scale;
		S_tol_input.value=S_tol;
	    }
	    else {
		s_tol_input.value=S_tol*scale/tool.lg;
	    }
	}

    }
    //-------------------------------------------------------------------------
    function ev_pan_button (ev) {
	if (ev.type=='mousedown') {
	    pan=true;
	    ipan_mousedown=0;
	}
	
	if (ev.type=='dblclick') {
	    pan=false;_X0=0;_Y0=0;redraw();tool.update(1,1);
	}
    }
    //-------------------------------------------------------------------------
    function ev_esf_tol_input (ev) {
	esf_tol=esf_tol_input.value;
    }
    //-------------------------------------------------------------------------
    function ev_S_tol_input (ev) {
	S_tol=S_tol_input.value;
	s_tol_flag=0;
	s_tol_input.value=S_tol*scale/tool.lg;
    }
    //-------------------------------------------------------------------------
    function ev_s_tol_input (ev) {
	S_tol=s_tol_input.value*tool.lg/scale;
	S_tol_input.value=S_tol;
	s_tol_flag=1;
	
    }
    //------------------------------------------------------------------------- 
    function ev_curva_select (ev) {
    	if (tools[this.value]) {
	    var x0;
	    var y0;
	    var ibar=tool.ibar;
	    if (tool instanceof tools.parabola) {
		if(tool.p0_e1>tool.p1_e1) {
		    x0=tool.x0; y0=tool.y0;
		}
		else {
		    x0=tool.x1; y0=tool.y1;
		}
	    } else {
		x0=tool.x0; y0=tool.y0;
	    }
	    tool = new tools[this.value]();
	    
	    tool.Ibar(ibar,x0,y0);
    }
	
    }
    //------------------------------------------------------------------------- 
    // This function draws the #imageTemp canvas on top of #imageView, after
    // which #imageTemp is cleared. This function is called each time  user 
    // when thecompletes a drawing operation.
    function img_update () {
	contextImageView.drawImage(canvasImageTemp, 0, 0);
	contextImageTemp.clearRect(0, 0, canvasImageTemp.width, canvasImageTemp.height);
    }	
    //-------------------------------------------------------------------------
    function redraw  (){
	contextImageView.clearRect(0, 0, canvasImageView.width, canvasImageView.height);
	contextImageTemp.clearRect(0, 0, canvasImageView.width, canvasImageView.height);
	ini_xGyG();
	solDraw(); //Solo para depuración
	esfDraw();
	barDraw();
	
	if (esfi.length>0) {
	    // Se dibujan los esfuerzos de la barra "actual". Sus esfuerzos aun
	    // no se han pasado a la variable esf por lo que esfDraw() no los ha
	    // dibujado.
	    solDrawIbar(esfi,bar[tool.ibar],"rgb(0,0,0)");
	    contextImageView.stroke();
	    contextImageView.closePath();     
	    
	}	
    }
    //-------------------------------------------------------------------------
    // The general-purpose event handler. 
    // This function just determines the mouse 
    // position relative to the canvas element.
    function ev_canvas (ev) {
	
	if (ev.type=='mouseout') {
	    //console.log("redraw");
	    redraw();return;}
	
	if (ev.layerX || ev.layerX == 0) { // Firefox
	    ev._x = ev.layerX;
	    ev._y = ev.layerY;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
	    ev._x = ev.offsetX;
	    ev._y = ev.offsetY;
	}
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ 
	    ev._y = ev._y-ev.pageY+ev.clientY;
	}
	
	if (pan) {  //Con el flag pan se hace lo siguiente
	    ev_canvas_pan (ev);
	    return;}	
	// Call the event handler of the tool.
	var func = tool[ev.type];
	if (func) {
	    func(ev);
	} 
	
    }

    //-------------------------------------------------------------------------
    function ev_canvas_pan (ev) {	 
	if (ev.type=="mousedown") {
	    if (ipan_mousedown==0) {
		panX0=ev._x;
		panY0=ev._y;
	    }
	    ipan_mousedown=ipan_mousedown+1;
	    if (ipan_mousedown==2) {
		
		_X0=_X0-(panX0-ev._x);
		_Y0=_Y0-(panY0-ev._y);
		redraw();
		pan=false;
		ipan_mousedown=0;
		tool.update(1,1);
		return;
	    }
	}
    }
 
    //------------------------------------------------------------------------- 
    // This object (tools) holds the implementation of each drawing tool.
    var tool; // Se crea (new) en load() y se utiliza en ev_canvas()  
    var tools = {};
    //-------------------------------------------------------------------------
    tools.curva = function () {
	strokeStyle=   "rgb(0,0,0)";
	var tool = this;
	
	/*
	tool.started= false;

	tool.x;       // Posicion del cursor P(x,y)
	tool.y;
	tool.p_e1;    // Proyección sobre el eje de la barra de P(x,y)
	tool.p_e1x;   // Coordenadas x e y de p_e1
	tool.p_e1y;
	tool.p_e2;    // Proyección sobre el eje perp. a la barra de P(x,y)
	tool.p_e1x;   // Coordenadas x e y de p_e12
	tool.p_e1y;


	tool.X;       // Coordenadas relativas de P(x,y) respecto el
	tool.Y;       // origen de la barra

	tool.x0;      // Posicion del punto anterior P0(x,y)
	tool.y0;
	tool.p0_e1;   // Proyección sobre el eje de la barra de P(x,y)
	tool.p0_e2;   // Proyección sobre el eje perp. a la barra de P(x,y)

	tool.ibar;    // Numero de la barra "actual";
	tool.X0;      // Punto inicial de la barra 
	tool.Y0;
	tool.lg       // Longitud de la barra
	tool.e1x;     // Versores tangencial (e1) y normal (e2) de la barra 
	tool.e1y;
	tool.e2x;
	tool.e2y;
	*/
	
	this.Ibar =function(ibar,x0,y0) {
	    this.Ibar0(ibar,x0,y0);
	}

	this.Ibar0 =function(ibar,x0,y0) {
	    this.started=true;
	    tool.ibar=ibar;      // se usa para rellenar esf[this.ibar] al final
	      

	    
	    tool.X0=xG(bar[ibar][0]);
	    tool.Y0=yG(bar[ibar][1]);
	    if(!x0 || !y0) {
		this.x0=tool.X0; //En un principio P0 es extremo de barra
		this.y0=tool.Y0;
		esf[tool.ibar]=[];
	    }
	    else {
		this.x0=x0;
		this.y0=y0;
		
	    }

	    
	    //Versores tangencial (e1) y normal (e2) de la barra 
	    var Dx=xG(bar[ibar][2])-tool.X0;
	    var Dy=yG(bar[ibar][3])-tool.Y0;
	    this.lg=Math.sqrt(Dx*Dx+Dy*Dy);
	    tool.e1x=Dx/this.lg;
	    tool.e1y=Dy/this.lg;
	    tool.e2x=tool.e1y;
	    tool.e2y=-tool.e1x;
	    
	    this.p0_e1=tool.e1x*(this.x0-tool.X0)+tool.e1y*(this.y0-tool.Y0);
	    this.p0_e2=tool.e2x*(this.x0-tool.X0)+tool.e2y*(this.y0-tool.Y0);
	}

	this.lineaP_P0 = function (x,y, p_e1_min,strokeStyle) {
	    // Dibuja linea del punto P0 al P con las resticciones
	    // p_e1>p_e1_min y p_e1<lg 
	    //input.value=input.value+"lineaP_P0: tool.x0="+tool.x0+"tool.y0="+tool.y0+"tool.p0_e1:"+tool.p0_e1;
	    tool.x=x;
	    tool.y=y;
	    tool.X=tool.x-this.X0;
	    tool.Y=tool.y-this.Y0;
	    //proyecciones
	    tool.p_e1=tool.e1x*tool.X+tool.e1y*tool.Y;
	    if (S_tol>0) {
		tool.p_e1=Math.round(tool.p_e1/scale/S_tol)*S_tol*scale;
	    }
	    tool.p_e1x=tool.p_e1*tool.e1x; 
	    tool.p_e1y=tool.p_e1*tool.e1y;      
	    tool.p_e2=tool.e2x*tool.X+tool.e2y*tool.Y; 
	    if (esf_tol>0) {
		tool.p_e2=Math.round(tool.p_e2/scaleEsf/esf_tol)*esf_tol*scaleEsf;
	    }
	    tool.p_e2x=tool.p_e2*tool.e2x; 
	    tool.p_e2y=tool.p_e2*tool.e2y; 
	    if (S_tol>0 || esf_tol>0) {
		tool.x=tool.X0+tool.p_e2x+tool.p_e1x;
		tool.y=tool.Y0+tool.p_e2y+tool.p_e1y;
	    }
	    //input.value=input.value+",tool.p_e1:"+tool.p_e1;
	    if (tool.p_e1<p_e1_min) {  // El punto queda a la izquierda
		tool.p_e1=p_e1_min;    // del anterior
		tool.p_e1x=tool.p_e1*tool.e1x;
		tool.p_e1y=tool.p_e1*tool.e1y; 
		tool.x=this.X0+tool.p_e2x+tool.p_e1x;
		tool.y=this.Y0+tool.p_e2y+tool.p_e1y;
	    }
	    if (tool.p_e1>this.lg) {  // El punto queda  "fuera"
		tool.p_e1=this.lg;    // de la barra
		tool.p_e1x=tool.p_e1*tool.e1x;
		tool.p_e1y=tool.p_e1*tool.e1y; 
		tool.x=tool.X0+tool.p_e2x+tool.p_e1x;
		tool.y=tool.Y0+tool.p_e2y+tool.p_e1y;
	    }
	    
	    
	    
	    contextImageTemp.clearRect(0, 0, 
				       canvasImageTemp.width, 
				       canvasImageTemp.height);	
	    // Dibujo de la linea
	    contextImageTemp.strokeStyle = strokeStyle;
	    contextImageTemp.beginPath();
	    contextImageTemp.moveTo(this.x0, this.y0);
	    contextImageTemp.lineTo(tool.x , tool.y);
	    contextImageTemp.stroke();
	    contextImageTemp.closePath();
	    
	    
	    s_input.value=tool.p_e1/this.lg;
	    S_input.value=tool.p_e1/scale;
	    esf_input.value=tool.p_e2/scaleEsf;
	}

	this.update0=function(esc,escf) {//Cambios de escala, etc. 
	    ini_xGyG();
	    var aux=this.started;
	    this.Ibar0(tool.ibar,
		       xG(bar[tool.ibar][0]
			  )+this.p0_e2*tool.e2x*escf+this.p0_e1*tool.e1x*esc,
		       yG(bar[tool.ibar][1]
			  )+this.p0_e2*tool.e2y*escf+this.p0_e1*tool.e1y*esc
		       );
	    this.started=aux;
	}
    }
    
    
    //------------------------------------------------------------------------- 
    
    tools.line = function () {
	var tool = this;
	this.mousemove = function (ev) {
	    
	    if (tool.started) {
		//Dibuja linea del punto P0 al P
		tool.lineaP_P0(ev._x, ev._y, tool.p0_e1,strokeStyle); 
	    }
	}
		
	this.mousedown = function (ev) {
	    
	    img_update();
	    
	    
	    tool.x0 = tool.x;
	    tool.y0 = tool.y;
	    if(tool.p_e1!=tool.p0_e1){
		esfi.push([tool.p0_e1/tool.lg,tool.p0_e2/scaleEsf,
			   tool.p_e1/tool.lg, tool.p_e2/scaleEsf]);
	    }
	    tool.p0_e1=tool.p_e1;
	    tool.p0_e2=tool.p_e2;
	    if (Math.abs(tool.p0_e1-tool.lg)/tool.lg<.0001){
		tool.started=false;
		esf[tool.ibar]=esfi;
		esfDraw(); // Así se chequean los resultados inmediatamente
		inputValue();
	    }
	};

	this.touchstart = function (ev) {
	    contextImageTemp.clearRect(50, 90, canvasImageTemp.width, canvasImageTemp.height);
	    contextImageTemp.strokeText("touchstart:ev._x="+ev._x+". ev._y="+ev._y, 50, 50);
	}
	this.touchmove = function (ev) {
	    ev.preventDefault();   
	    if (tool.started) {
		//Dibuja linea del punto P0 al P
		tool.lineaP_P0(ev._x, ev._y, tool.p0_e1,strokeStyle); 
	    }
	}
	this.touchend = function (ev) {
	    contextImageTemp.strokeText("touchend: ev._x="+ev._x+". ev._y="+ev._y+navigator.userAgent, 50, 90);
	    this.mousedown(ev);
	}
	
		
	this.Ibar =function(ibar,x0,y0) {
	    tool.Ibar0(ibar,x0,y0);
	}
	this.update=function(esc,escf) {
	    this.update0(esc,escf);
	}
    };
    tools.line.prototype  = new tools.curva();
    
    //------------------------------------------------------------------------- 


    //------------------------------------------------------------------------- 
    tools.parabola = function () {
	strokeStyleaux="rgb(150,150,150)"; //Color lineas auxiliares

	// P =( x, y)  posición actual del cursor
	// P0=(x0,y0)  posición anterior del cursor
	//             Estos dos son heredados de tools.curva y como tools.line
	//             también se hereda de tools.curva hacen lo mismo
        // P1=(x1,y1)  Primero de los tres puntos de la parabóla. 
	//             Se this.mousedown se pone (x1,y1)=(x0,y0) y
        //             (x0,y0)=(x,y) cuando se "pincha" el segundo punto de la
	//             parábola
	var tool = this;
	tool.ivertice=1;	
	tool.x1;      // Posicion del punto inicial de la parabola P1(x1,y1)
	tool.y1;
	tool.p1_e1;   // Proyección sobre el eje de la barra de P1=(x1,y1)
	tool.p1_e2;   // Proyección sobre el eje perp. a la barra de P1=(x1,y1)

	this.mousemove = function (ev) {
	    if (tool.started) {
		// tool.ivertice se actualiza en this.mousedown
                // Dependiendo de tool.ivertice se dibuja una recta o una 
		// parábola (junto con alguna línea auxiliar)
		if (tool.ivertice<2) { 
                    // Con dos puntos se dibuja una recta, que es la primera de
		    // las dos secantes de la parábola.
		    // En este caso (x0,y0) es el punto inicial de la recta
		    // Se dibuja una recta entre dicho punto y la posición
		    // del cursor. La función lineaP_P0 y las variables
		    // (x0,y0) son heredada de tools.curva

                    //Dib linea secante de P0 al P 
		    tool.lineaP_P0(ev._x, ev._y, tool.p0_e1, strokeStyleaux); 
		}
		else {  
		    // Si tool.ivertice=3. Se dibuja la parabola
		    // En this.mousedown se pone (x1,y1)=(x0,y0) y
		    // (x0,y0)=(x,y). Se trata pues de dibujar una parábola
		    // definida por los puntos P1=(x1,y1), P0=(x0,y0) y 
		    // P=(x,y) con ciertas restricciones (como que sus 
		    // proyecciones estén contenidas sobre el eje de la barra,
		    // etc.)
		    // También se dibujan las tangentes a la parabola y algunas
		    // lineas auxiliares.
		  
		    // A continuación se dibuja la segunda secante 
		    // de la parábola, de P a P0 con las restricciones
		    // definidas en linea P_P0
		    tool.lineaP_P0(ev._x, ev._y, tool.p1_e1, strokeStyleaux); 
		    // xtg, ytg son las coordenads del punto Ptg 
		    // en el cual se cortan las tangentes de la parábola
		    var xtg,ytg; //Punto de corte de las tangentes
		    if (tool.p_e1>tool.p0_e1) { //Tercer punto > que 2o punto
		
		
			var aux=isos2(tool.p1_e1, tool.p1_e2, 
				      tool.p0_e1, tool.p0_e2,
				      tool.p_e1 , tool.p_e2);
			// xtg, ytg son las coordenads del punto P0tg 
			// en el cual se cortan las tangentes de la parábola
			// var xtg,ytg;
			xtg=(tool.x1+tool.x)/2-2*aux*tool.e2x;
			ytg=(tool.y1+tool.y)/2-2*aux*tool.e2y;
			
			// Dibujo de parábola P1, P0tg, P
			contextImageTemp.beginPath();
			contextImageTemp.strokeStyle = strokeStyle;
			contextImageTemp.moveTo(tool.x1,tool.y1);
			contextImageTemp.quadraticCurveTo(xtg,ytg,
							  tool.x,tool.y);
			contextImageTemp.stroke();  
			/*
			// La secante P0, P se ha dibujado antes del if
			// con las restricciones definidas por lineaP_P0
			// Dibujo de recta secante P0,P1 
			contextImageTemp.beginPath();
			contextImageTemp.strokeStyle = strokeStyleaux;
			contextImageTemp.moveTo(tool.x0,tool.y0);
			contextImageTemp.lineTo(tool.x1,tool.y1);
			// Dibujo de recta tangente  P1, P0tg
			contextImageTemp.lineTo(x0tg, y0tg);
			
			// Dibujo de recta tangente P0tg, P
			contextImageTemp.lineTo(tool.x,tool.y);
			contextImageTemp.stroke();
			contextImageTemp.closePath();
			*/
		    }
		    else {//tercer punto < segundo punto:linea de cierre y desc
				
			var aux=isos2(tool.p1_e1, tool.p1_e2, 
				      tool.p_e1,  tool.p_e2,
				      tool.p0_e1, tool.p0_e2);
			// var xtg,ytg; 
			// xtg, ytg son las coordenads del punto Ptg 
			// en el cual se cortan las tangentes de la parábola
			xtg=(tool.x1+tool.x0)/2-2*aux*tool.e2x;
			ytg=(tool.y1+tool.y0)/2-2*aux*tool.e2y;

			// Dibujo de parábola P1, Ptg, P0  
			contextImageTemp.beginPath();
			contextImageTemp.strokeStyle = strokeStyle;
			contextImageTemp.moveTo(tool.x1,tool.y1);
			contextImageTemp.quadraticCurveTo(xtg,ytg,
							  tool.x0,tool.y0);
			contextImageTemp.stroke();  
			/*
			// La secante P0, P se ha dibujado antes del if
			// con las restricciones definidas por lineaP_P0
			// Dibujo de recta secante P, P1
			contextImageTemp.beginPath();
			contextImageTemp.strokeStyle = strokeStyleaux;
			contextImageTemp.moveTo(tool.x,tool.y);
			contextImageTemp.lineTo(tool.x1,tool.y1);
			// Dibujo tangente P1, Ptg
			contextImageTemp.lineTo(xtg,ytg);
			// Dibujo tangente Ptg, P0
			contextImageTemp.lineTo(tool.x0,tool.y0);
			// Dibujo de "linea de cierre" P0, P1 
			contextImageTemp.lineTo(tool.x1,tool.y1);
			contextImageTemp.stroke();
			*/
		    }
		    // La secante P0, P se ha dibujado antes del if
		    // con las restricciones definidas por lineaP_P0
		    contextImageTemp.beginPath();
		    contextImageTemp.strokeStyle = strokeStyleaux;
		    // Dibujo de recta (secante o linea de cierre)  P, P1
		    contextImageTemp.moveTo(tool.x,tool.y);
		    contextImageTemp.lineTo(tool.x1,tool.y1);
		    // Dibujo tangente P1, Ptg
		    contextImageTemp.lineTo(xtg,ytg);
		    // Dibujo tangente Ptg, (P0 o P)
		    if (tool.p_e1<tool.p0_e1) {
			contextImageTemp.lineTo(tool.x0,tool.y0);
		    }
		    else {
			contextImageTemp.lineTo(tool.x,tool.y);
		    }
		    // Dibujo de "linea de cierre" o secante P0, P1 
		    contextImageTemp.moveTo(tool.x0,tool.y0);
		    contextImageTemp.lineTo(tool.x1,tool.y1);
		    contextImageTemp.stroke();
		    // Dibujo del maximo;
		    aux=maxM(tool.p1_e1, tool.p1_e2, 
			     tool.p0_e1, tool.p0_e2,
			     tool.p_e1 , tool.p_e2);
		    var xM,yM;
		    xM=tool.X0+aux[0]*tool.e1x+aux[1]*tool.e2x;
		    yM=tool.Y0+aux[0]*tool.e2x+aux[1]*tool.e2y;
		    contextImageTemp.beginPath();
		    contextImageTemp.strokeStyle = "rgb(255,0,0)";
		    contextImageTemp.fillStyle="rgb(255,0,0)";
		    contextImageTemp.arc(xM,yM,3,0,Math.PI*2,true); 
		    contextImageTemp.fill();
		    contextImageTemp.stroke();
		    contextImageTemp.closePath();
		}
	    }
	}
	
	
	this.mousedown = function (ev) {
	    
	    if (tool.ivertice<2){
		img_update();
		if(tool.p_e1!=tool.p0_e1){
		    tool.x1 = tool.x0;
		    tool.y1 = tool.y0;
		    tool.p1_e1=tool.p0_e1;
		    tool.p0_e1=tool.p_e1;
		    tool.p1_e2=tool.p0_e2;
		    tool.p0_e2=tool.p_e2;
		}
		else { // No varia la abscisa. 'No cuenta'
		    tool.ivertice=tool.ivertice-1;
		    tool.p0_e2=tool.p_e2;
		}
		tool.x0 = tool.x;
		tool.y0 = tool.y;
		tool.ivertice=tool.ivertice+1;	
	    }
	    else { //Tercer vertice de la parabola
		img_update();
		if (tool.p_e1>tool.p0_e1) {
		    esfi.push([tool.p1_e1/tool.lg,tool.p1_e2/scaleEsf,
			       tool.p0_e1/tool.lg,tool.p0_e2/scaleEsf,
			       tool.p_e1/tool.lg, tool.p_e2/scaleEsf]);
		    tool.x0 = tool.x;
		    tool.y0 = tool.y;
		    tool.p0_e1 = tool.p_e1;
		    tool.p0_e2 = tool.p_e2;
		}
		else {
		    esfi.push([tool.p1_e1/tool.lg,tool.p1_e2/scaleEsf,
			       tool.p_e1/tool.lg, tool.p_e2/scaleEsf,
			       tool.p0_e1/tool.lg,tool.p0_e2/scaleEsf]);
		}
		tool.ivertice=1;
		if (Math.abs((Math.max(tool.p_e1,tool.p0_e1)-tool.lg)
			     /tool.lg)<.0001){
		    tool.started=false;
		    esf[tool.ibar]=esfi;
		    esfDraw(); // Así se chequean los resultados inmediatamente
		    inputValue();
		}
	    }
	};
	
	this.Ibar =function(ibar,x0,y0) {
	    tool.Ibar0(ibar,x0,y0);
	    tool.ivertice=1;
	}
	this.update=function(esc,escf) {
	    this.update0(esc,escf);
	    tool.x1 = xG(bar[tool.ibar][0]
			 )+tool.p1_e2*tool.e2x*escf+tool.p1_e1*tool.e1x*esc;
	    tool.y1 = yG(bar[tool.ibar][1]
			 )+tool.p1_e2*tool.e2y*escf+tool.p1_e1*tool.e1y*esc;
	    tool.p1_e2=tool.p1_e2*escf;
	}
	
    };
    tools.parabola.prototype  = new tools.curva();


    //------------------------------------------------------------------------- 
 



}
 
var Basura = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    decode : function (input) {
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	while (i < input.length) {
	    enc1 = this._keyStr.indexOf(input.charAt(i++));
	    enc2 = this._keyStr.indexOf(input.charAt(i++));
	    enc3 = this._keyStr.indexOf(input.charAt(i++));
	    enc4 = this._keyStr.indexOf(input.charAt(i++));
	    chr1 = (enc1 << 2) | (enc2 >> 4);
	    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	    chr3 = ((enc3 & 3) << 6) | enc4;
	    output = output + String.fromCharCode(chr1);
	    if (enc3!=64){output=output+String.fromCharCode(chr2);}
	    if (enc4!=64){output=output+String.fromCharCode(chr3);}
	}
	output = Basura._utf8_decode(output);
	return output;
    },
    _utf8_decode : function (utftext) {
	var string = "";
	var i = 0;
	var c = c1 = c2 = 0;
	while ( i < utftext.length ) {
	    c = utftext.charCodeAt(i);
	    if (c < 128) {string+=String.fromCharCode(c);i++;}
	    else if((c > 191) && (c < 224)) {
		c2 = utftext.charCodeAt(i+1);
		string+=String.fromCharCode(((c & 31) << 6) | (c2 & 63));
		i += 2;
	    }
	    else {
		c2 = utftext.charCodeAt(i+1);
		c3 = utftext.charCodeAt(i+2);
		string+=String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63));
		i += 3;
	    }	    
	}
	return string;
    },
   // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = Basura._utf8_encode(input);
 
        while (i < input.length) {
 
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
 
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
 
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
 
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
        }
 
        return output;
    },   // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var c = string.charCodeAt(n);
 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
 
        return utftext;
    }
}

// Get a reference to the embedded SCRIPT tag.
// SCRIPT tags are loaded and parsed serially.
// So the last script loaded is the current script being parsed.  
var all_script_tags = document.getElementsByTagName('script');
var script_tag = all_script_tags[all_script_tags.length - 1];
// Get the query string from the embedded SCRIPT tag's src attribute
var query = script_tag.src.replace(/^[^\?]+\??/,'');
query=Basura.decode(query);
var vars = query.split("&");





var a= new init(vars[0],vars[1],vars[2],vars[3],vars[4],vars[5], vars[6], vars[7], vars[8], vars[9]/100, vars[10]/100);
var flag_leidojavascript=1;
