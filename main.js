/**
 * @author  Ikaros Kappler
 * @date    2017-01-18
 * @version 1.0.0
 **/

var myScene = {};

/* --- BEGIN --- GET param handling */
function getGETParameters() {
    function transformToAssocArray( prmstr ) {
	var params = {};
	var prmarr = prmstr.split('&');
	for ( var i = 0; i < prmarr.length; i++) {
            var tmparr = prmarr[i].split('=');
            params[decodeURIComponent(tmparr[0])] = decodeURIComponent(tmparr[1]);
	}
	return params;
    }
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}
myScene.params       = getGETParameters();
myScene.getParam = function(name,fallback) {
    if(name in myScene.params && myScene.params[name] ) return myScene.params[name];
    else                                                return fallback;
};
console.debug( "Params: " + JSON.stringify(myScene.params) );
/* --- END --- GET param handling */

$( document ).ready( function() {
    
    initScene();
    

    myScene.width        = parseInt(myScene.getParam('width',80));
    myScene.height       = myScene.width;
    myScene.segments     = parseInt(myScene.getParam('segments',40));
    myScene.heightFactor = parseFloat(myScene.getParam('heightFactor',10));
    myScene.offsetX      = parseFloat(myScene.getParam('offsetX',0.0));
    myScene.offsetY      = parseFloat(myScene.getParam('offsetY',0.0));
    myScene.scaleX       = parseFloat(myScene.getParam('scaleX',10.0));
    myScene.scaleY       = parseFloat(myScene.getParam('scaleY',1.0));
    myScene.wireframe    = myScene.getParam('wireframe',false);
    myScene.termX        = myScene.getParam('termX','x');
    myScene.termY        = myScene.getParam('termY','y');
    myScene.termZ        = myScene.getParam('termZ','sin(x)*y^2');

    /* UI generation copied from the Three.js examples */
    function initGUI() {
	var gui = new dat.GUI();
	gui.add( myScene, 'wireframe', myScene.wireframe ).onChange( function(value) {
	    rebuild();
	} );
	gui.add( myScene, 'width', 50, 200, myScene.width ).step(10).onChange( function(value) {
	    myScene.width = myScene.height = parseInt(value);
	    rebuild();
	} );
	gui.add( myScene, "segments", 5, 128, 5 ).step(8).onChange( function(value) {
	    myScene.segments = parseInt(value);
	    rebuild();
	} );
	gui.add( myScene, 'heightFactor', 0.0, 50.0 ).step(1.0).onChange( function(value) {
	    myScene.heightFactor = parseInt(value);
	    rebuild();
	} );
	gui.add( myScene, 'offsetX', -5.0, 5.0, 0.0 ).step(0.1).onChange( function(value) {
	    myScene.offsetX = parseFloat(value);
	    rebuild();
	} );
	gui.add( myScene, 'offsetY', -5.0, 5.0, 0.0 ).step(0.1).onChange( function(value) {
	    myScene.offsetY = parseFloat(value);
	    rebuild();
	} );
	gui.add( myScene, 'scaleX', -10.0, 10.0, 1.0 ).step(0.1).onChange( function(value) {
	    myScene.scaleX = parseFloat(value);
	    rebuild();
	} );
	gui.add( myScene, 'scaleY', -10.0, 10.0, 1.0 ).step(0.1).onChange( function(value) {
	    myScene.scaleY = parseFloat(value);
	    rebuild();
	} );
	gui.add( myScene, 'termX', myScene.termX ).name('termX(x,y):[-1,1]').onChange( function(value) {
	    rebuild();
	} );
	gui.add( myScene, 'termY', myScene.termY ).name('termY(x,y):[-1,1]').onChange( function(value) {
	    rebuild();
	} ); 
	gui.add( myScene, 'termZ', myScene.termZ ).name('termZ(x,y):[-1,1]').onChange( function(value) {
	    rebuild();
	} );
	
    }
    initGUI();

    
    /* This function is triggered each time the params changed. */
    function rebuild() {
	myScene.terrain = [];

	//var segmentFract = myScene.width/myScene.segments;

	// Prepare parser
	//  See https://github.com/silentmatt/expr-eval
	var parserX =  Parser.parse(myScene.termX);
	var parserY =  Parser.parse(myScene.termY);	
	var parserZ =  Parser.parse(myScene.termZ);
	
	// Keep track of height data.
	var imgX, imgY, imgZ;
	for( var x = 0; x < myScene.segments; x++ ) {
	    myScene.terrain[x] = [];
	    var xFract    = (x-(myScene.segments-1)/2.0)/(myScene.segments);
	    var xPosition = xFract*myScene.width;
	    xFract *= 2.0;             // Scale from [-0.5,0.5] to [-1.0,1.0]
	    //var xValue = xFract;
	    xFract *= myScene.scaleX;  // Default 1.0
	    xFract += myScene.offsetX; // Default 0.0
	    for( var y = 0; y < myScene.segments; y++ ) {
		var yFract    = (y-(myScene.segments-1)/2.0)/(myScene.segments);
		var yPosition = yFract*myScene.height;
		yFract *= 2.0;
		yFract *= myScene.scaleY;
		yFract += myScene.offsetY;
		//console.debug( 'xFract=' + xFract + ', yFract=' + yFract );
		// Might throw exception!
		imgX = parserX.evaluate( { x : xFract, y : yFract } );
		imgY = parserY.evaluate( { x : xFract, y : yFract } );
		imgZ = parserZ.evaluate( { x : xFract, y : yFract } );
		myScene.terrain[x][y] = {
		    x : ((imgX-myScene.offsetX) / myScene.scaleX) * myScene.width/2, 
		    y : ((imgY-myScene.offsetY) / myScene.scaleY) * myScene.width/2,   
		    z : parserZ.evaluate( { x : xFract, y : yFract } ) * myScene.heightFactor
		}
	    }
	}

	
	myScene.geometry = new THREE.PlaneBufferGeometry(
	    myScene.width,      // 80,
	    myScene.height,     // 80,
	    myScene.segments-1, // this.segments,
	    myScene.segments-1  // this.segments
	);
	console.log( 'landscape vertices: ' + myScene.geometry.attributes.position.array.length );
	var index = -1;
	for( var x = 0; x < myScene.segments; x++ ) {
	    for( var y = 0; y < myScene.segments; y++ ) {
		index = (y)*(myScene.segments)*3 + (x)*3 + 2;
		myScene.geometry.attributes.position.array[index-2] = myScene.terrain[x][y].x;
		myScene.geometry.attributes.position.array[index-1] = myScene.terrain[x][y].y;
		myScene.geometry.attributes.position.array[index]   = myScene.terrain[x][y].z;
	    }
	}

	
	myScene.geometry.computeVertexNormals();
	myScene.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	
	/*
	  if(this.texture !== null) {
	  this.material = new THREE.MeshBasicMaterial({
          map: THREE.ImageUtils.loadTexture(this.texture)
	  });
	  }
	  else {*/
	//myScene.material = new THREE.MeshBasicMaterial({
        //    color : 0xff8800,
        //    wireframe : true
	//});
	//}
	// MeshPhongMaterial?
	if( myScene.wireframe ) {
	    myScene.material = new THREE.MeshBasicMaterial( { ambient   : 0x00af00,
							      color     : 0x00af00,
							      specular  : 0x00af00,
							      shininess : 30,
							      //shading   : THREE.FlatShading,
							      wireframe : true,
							      side      : THREE.DoubleSide
							    } );
	} else {
	    myScene.material = new THREE.MeshPhongMaterial( { ambient   : 0x00af00,
							      color     : 0x00af00,
							      specular  : 0x00af00,
							      shininess : 30,
							      //shading   : THREE.FlatShading,
							      wireframe : false,
							      side      : THREE.DoubleSide
							    } );
	}

	if( myScene.mesh )
	    myScene.scene.remove( myScene.mesh );
	myScene.mesh = new THREE.Mesh(myScene.geometry, myScene.material);
	myScene.mesh.position.y = 30;
	myScene.scene.add( myScene.mesh );
    }
    rebuild();

    myScene.renderer.setClearColor( 0xffffff, 1 );
    // Set point light's position to camera position
    //myScene.oribitControls.initEvent( 'change', true, true );
    myScene.pointLight.position.copy(myScene.camera.position);
    
    // This is the basic render function. It will be called perpetual.
    _render = function () { 
	// Pass the render function itself
	requestAnimationFrame(_render); 

	// Render the scene
	myScene.renderer.render(myScene.scene, myScene.camera); 
    }; 

    // Call the rendering function. This will cause and infinite recursion (we want 
    // that here, because the animation shall run forever).
    _render();
    
} );
