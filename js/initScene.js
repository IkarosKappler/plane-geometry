

var myScene = {};


function initScene() {

    // Create new scene
    myScene.scene = new THREE.Scene(); 

    // Create a camera to look through
    myScene.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); 

    // Initialize a new THREE renderer (you are also allowed 
    // to pass an existing canvas for rendering).
    myScene.renderer = new THREE.WebGLRenderer( { antialias : true } ); 
    myScene.renderer.setSize( window.innerWidth, 
			   window.innerHeight
			 ); 

    // ... and append it to the DOM
    document.body.appendChild(myScene.renderer.domElement); 


    // Create a geometry conaining the logical 3D information (here: a cube)
    var geometry = new THREE.CubeGeometry(12,12,12); 

    // Pick a material, something like MeshBasicMaterial, PhongMaterial, 
    var material = new THREE.MeshPhongMaterial({color: 0x00ff00}); 
    
    // Create the cube from the geometry and the material ...
    //var cube = new THREE.Mesh(geometry, material); 
    //cube.position.set( 12, 12, 12 );

    // ... and add it to your scene.
    //myScene.scene.add(cube); 
    //console.debug('x');

    // Add some light
    myScene.pointLight = new THREE.PointLight(0xFFFFFF);
    //this.pointLight = new THREE.AmbientLight(0xFFFFFF);

    // set its position
    myScene.pointLight.position.x = 10;
    myScene.pointLight.position.y = 50;
    myScene.pointLight.position.z = 130;

    // Add to the scene
    myScene.scene.add( myScene.pointLight );


    // Add grid helper
    var gridHelper = new THREE.GridHelper( 90, 9, 0x0000a8, 0xa8e8e8 );
    //gridHelper.colorGrid = 0xF8F8F8; // 0xE8E8E8;
    myScene.scene.add( gridHelper );


    // Add an axis helper
    var ah                  = new THREE.AxisHelper(50);
    ah.position.y -= 0.1;  // The axis helper should not intefere with the grid helper
    myScene.scene.add( ah );


    // Set the camera position
    myScene.camera.position.set( 75, 75, 75 );
    // And look at the cube again
    //myScene.camera.lookAt( new THREE.Point3(0,0,0) ); // cube.position );


    // Finally we want to be able to rotate the whole scene with the mouse: 
    // add an orbit control helper.
    var _self = myScene;
    myScene.orbitControls = new THREE.OrbitControls( myScene.camera, myScene.renderer.domElement ); 
    // Always move the point light with the camera. Looks much better ;)
    myScene.orbitControls.addEventListener( 'change', 
					    function() { myScene.pointLight.position.copy(myScene.camera.position); } 
					  );
    myScene.pointLight.position.copy(myScene.camera.position);
    //myScene.oribitControls.trigger( 'change' );

    myScene.orbitControls.enableDamping = true;
    myScene.orbitControls.dampingFactor = 1.0;
    myScene.orbitControls.enableZoom    = true;
    //myScene.orbitControls.target.copy( cube.position );  


/*
    // This is the basic render function. It will be called perpetual, again and again,
    // depending on your machines possible frame rate.
    this._render = function () { 
	// Pass the render function itself
	requestAnimationFrame(this._render); 
	
	// Let's animate the cube: a rotation.
	cube.rotation.x += 0.05; 
	cube.rotation.y += 0.04; 

	this.renderer.render(this.scene, this.camera); 
    }; 

    // Call the rendering function. This will cause and infinite recursion (we want 
    // that here, because the animation shall run forever).
    this._render();
*/

    function onWindowResize(){	
	myScene.camera.aspect = window.innerWidth / window.innerHeight;
	myScene.camera.updateProjectionMatrix();
	myScene.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( 'resize', onWindowResize, false );
    

}
 
