if (!Detector.webgl)
    Detector.addGetWebGLMessage();
var     raycaster = new THREE.Raycaster(),
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000),
        renderer = new THREE.WebGLRenderer(),
        mouse = new THREE.Vector2(),
        controls = new THREE.OrbitControls(camera, renderer.domElement),
        material;

init();
animate();

document.addEventListener('mousedown', onDocumentMouseDown, false);

function init() {   
        

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    window.addEventListener('resize', onWindowResize, false);    
        
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    
    
    
    // ASCII file
    var loader = new THREE.DATLoader();    
    loader.load('./teste2.dat', function (group) { 
        
        console.log(group);
        for (var i = group.length; i--; ) {            
            if (group[i].name==="SHAPE") {
                material = new THREE.MeshBasicMaterial( 
                        {
                            vertexColors: THREE.VertexColors, 
                            polygonOffset: true, 
                            polygonOffsetFactor: 1,
                            polygonOffsetUnits: 1
                            //side: THREE.DoubleSide
                        });

                var mesh = new THREE.Mesh(group[i], material);
                scene.add(mesh);

                var helper = new THREE.EdgesHelper(mesh, 0x00ffff);
                helper.material.linewidth = 2; 
                scene.add(helper);
            } else if (group[i].name==="LINE") {
                
                material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });                
                mesh = new THREE.Line( group[i], material, THREE.LinePieces );
               scene.add(mesh);

            }
            
            controls.target.copy(group[i].boundingSphere.center);
        }
        camera.position.set(0, 0, 100); 
    }); 
}


function animate() {

    requestAnimationFrame(animate);
    render();

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
function render() {    
    raycaster.setFromCamera(mouse, camera);
    controls.update();
    renderer.render(scene, camera);
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