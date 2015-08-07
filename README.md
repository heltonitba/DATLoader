DATLoader using three.js
========

#### three.js ####
[three.js](http://threejs.org/) is a JavaScript library with the aim to create a lightweight 3D library with a very low level of complexity.
You only need a browser with WebGL compatibility (almost all)!

[Three.js Examples](http://threejs.org/examples/)

#### BDF and DAT files ####

BDF and DAT are the geometries files for Nastran and FEMAP Software, both files are almost equal and the geometric data in these files are reported in MSC Nastran [Quick Reference Guide](https://simcompanion.mscsoftware.com/infocenter/index?page=content&id=DOC10004)

Used Version: Nastran 2012 Quick Reference and three.js 71

### Suported Elements: ###
- GRID
- CTRIA3, CTRIA6,CRTIAR and CTRIAX
- CQUAD, CQUAD4, CQUAD6 and CQUAD8 
- CTRETA, CPENTA and CHEXA
- CBAR
 
### Suported Properties: ###
- PBAR
- PSHELL (Just read, doesn't draw)

### Suported Base: ###
- Base Rectangular 


### Usage ###

Include the file:
```html
<script src="js/DATLoader.js"></script>
```

The load method return a THREE.Geometry.
```javascript
var loader = new THREE.DATLoader();    
var material = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors,side: THREE.DoubleSide});

loader.load('./file.dat', function(geometry,DATData) {
        console.log(DATData);
        
        mesh = new THREE.Mesh(geometry, material);        
        scene.add(mesh);
        
        //Update camera and controls
        camera.position.copy(geometry.boundingBox.min);
        controls.target.copy(geometry.boundingSphere.center);
  
    });
```
By default, each Element(CTRIA,CQUAD,etc...) is printed with random color.

Example: https://datloader-heltonitba.c9.io/
