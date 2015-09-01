

if (!Detector.webgl)
    Detector.addGetWebGLMessage();


var     raycaster = new THREE.Raycaster(),
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000),
        renderer = new THREE.WebGLRenderer({antialias: true, alpha: false}),
        controls = new THREE.OrbitControls(camera, renderer.domElement),
        loader = new THREE.DATLoader(),
        container = document.getElementById('container'),
        mouse = new THREE.Vector2(),
        material = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors,side: THREE.DoubleSide}),
	material2 = new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.SmoothShading, side: THREE.DoubleSide} ),
	line = new THREE.MeshBasicMaterial ({ color: 0x000000, wireframe: true }),
        mesh,userData;

init();
animate();

function init() {

    prepareScene();

	// Lights

	scene.add( new THREE.AmbientLight( 0xffffff ) );

	addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
	addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );


    loader.load('./models/contact.bdf', function(geometry,DATData) {
        // set var userData
        userData = DATData

        mesh = new THREE.Mesh(geometry, material2);
        scene.add(mesh);
	wireframe = new THREE.Mesh (geometry,line)
	scene.add (wireframe);

	edges = new THREE.EdgesHelper( mesh, 0x000000 );
	//scene.add( edges );
        
        //Update camera and controls
        var position = geometry.boundingBox.max.clone();
        position.x = position.x + 100;
        position.y = position.y + 30;
        camera.position.copy(position)
        controls.target.copy(geometry.boundingSphere.center);
  
    });

}






/* - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - - - - - Scene   - - - - - - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - */

function prepareScene() {

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x2F3E6B, 0); 
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);    
    document.addEventListener('mousemove', onDocumentMouseMove, true);
    document.addEventListener('mousedown', onDocumentMouseDown, true);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    raycaster.setFromCamera(mouse, camera);
    renderer.render(scene, camera);
}


/* - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - - - - MouseEvents - - - - - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - */

function onDocumentMouseDown(event) {
    mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
    mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

    var intersects = raycaster.intersectObjects(scene.children);
    displayIntersect(intersects, userData);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
    mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;  
}


/* - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - - - - DisplayEvents - - - - - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - */

function displayIntersect(intersects, userData) {
    var faceIndex, intersect, e, ids = '';
    if (intersects.length > 0) {
        intersect = intersects[0];
        faceIndex = intersect.faceIndex;
        e = userData.getElementByFaceIndex(faceIndex);
        ids = e.type + " " + e.id;
        $("#list-ids").html(ids);
        console.log(ids)
    }
}


function addShadowedLight( x, y, z, color, intensity ) {

	var directionalLight = new THREE.DirectionalLight( color, intensity );
	directionalLight.position.set( x, y, z )
	scene.add( directionalLight );

	directionalLight.castShadow = true;
	// directionalLight.shadowCameraVisible = true;

	var d = 1;
	directionalLight.shadowCameraLeft = -d;
	directionalLight.shadowCameraRight = d;
	directionalLight.shadowCameraTop = d;
	directionalLight.shadowCameraBottom = -d;

	directionalLight.shadowCameraNear = 1;
	directionalLight.shadowCameraFar = 4;

	directionalLight.shadowMapWidth = 1024;
	directionalLight.shadowMapHeight = 1024;

	directionalLight.shadowBias = -0.005;
	directionalLight.shadowDarkness = 0.15;

}
