

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
        mesh,
        materialPhong = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors, //ambient: 0x555555,
            side: THREE.DoubleSide, specular: 0xffffff, shininess: 50,
            //shading: THREE.SmoothShading
        });

init();
animate();

function init() {

    prepareScene();

    eventButtons();


    loader.load('./teste.dat', function(geometry) {
        
        mesh = new THREE.Mesh(geometry, materialPhong);        
        scene.add(mesh);
        
        
        //Update camera and controls
        camera.position.copy(geometry.boundingBox.min);
        controls.target.copy(geometry.boundingSphere.center);
  
    });

}


//concertar
function displayIntersect(intersects, loader) {
    var faceIndex, id, intersect, e, ids = '';
    if (intersects.length > 0) {
        intersect = intersects[0];
        faceIndex = intersect.faceIndex;
        id = loader.getElementByFaceIndex(faceIndex).id;        
        e = loader.getElementByFaceIndex(faceIndex);
        ids = e.type + " " + e.id;
        $("#list-ids").html(ids);
        console.log(ids)
    }
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


    //Helpers
    //addLights();




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




function addShadowedLight(x, y, z, color, intensity) {
    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
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






/* - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - -  Draw/Disable Elements  - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - */

// Change color about face range



/* - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - - - - MouseEvents - - - - - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - */

function onDocumentMouseDown(event) {
    mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
    mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

    var intersects = raycaster.intersectObjects(scene.children);
    displayIntersect(intersects, loader);

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

function eventButtons() {    
   
   

    $("#show-all").click(function(event) {
        var obj = scene.getObjectByName(GEO_NAME, true);
        obj.visible = true;

        camera.position.copy(obj.geometry.boundingBox.min);
        controls.target.copy(obj.geometry.boundingSphere.center);

        var obj2 = scene.getObjectByName(SLT_NAME, true);
        if (obj2)
            obj2.visible = false;

    });




}

