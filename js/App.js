

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
        mesh,userData;

init();
animate();

function init() {

    prepareScene();

    loader.load('./teste.dat', function(geometry,DATData) {
        // set var userData
        userData = DATData

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        //Update camera and controls
        camera.position.copy(geometry.boundingBox.min);
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
