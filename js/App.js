if (!Detector.webgl)
    Detector.addGetWebGLMessage();
var     raycaster = new THREE.Raycaster(),
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000),
        renderer = new THREE.WebGLRenderer(),
        mouse = new THREE.Vector2(),
        controls = new THREE.OrbitControls(camera, renderer.domElement),
        materialLine = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }),
		materialShape = new THREE.MeshBasicMaterial( 
                        {
                            vertexColors: THREE.VertexColors, 
                            polygonOffset: true, 
                            polygonOffsetFactor: 1,
                            polygonOffsetUnits: 1
                            //side: THREE.DoubleSide
                        });
		
		

init();
animate();



function init() {   
        

    
    
    
    
    var loader = new THREE.DATLoader();    
    loader.load('./teste2.dat', function (array) { 
		//array - array of BufferGeometry      
	  
        for (var i = array.length; i--; ) {            
			
            if (array[i].name==="SHAPE") {
                
                var mesh = new THREE.Mesh(array[i], materialShape);
                scene.add(mesh);
				
				//Optional
                var helper = new THREE.EdgesHelper(mesh, 0x00ffff);
                helper.material.linewidth = 2; 
                scene.add(helper);
				
				
            } else if (array[i].name==="LINE") {                
                                
               mesh = new THREE.Line( array[i], materialLine, THREE.LinePieces );
               scene.add(mesh);

            }        
			//can be changed
            controls.target.copy(array[i].boundingSphere.center);
        }
        
    }); 
	
	renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);
    
    window.addEventListener('resize', onWindowResize, false);  
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
	
}


function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {    
    raycaster.setFromCamera(mouse, camera);
    controls.update();
    renderer.render(scene, camera);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

function onDocumentMouseDown(event) {
    
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    var intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        for (var i = intersects.length; i--; ) {
            console.log(intersects[i].point)
            var selectedFace = intersects[i].face;
            if (selectedFace) {
				
                var faces = intersects[i].object.geometry.attributes.face.array;
                var element_ID = faces[selectedFace.a * 3];
                var elements = intersects[i].object.geometry.userData.elements;
                var element = elements.filter(function (obj) {
                    return obj.id === element_ID
                });

                console.log("ID: " + element_ID);
                console.log("Type: " + element[0].type);
                console.log(element[0]);
            }
        }
    }
}