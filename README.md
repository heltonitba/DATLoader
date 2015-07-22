BDF-DAT-Loader using three.js
========

#### three.js ####
[three.js](http://threejs.org/) is a JavaScript library with the aim to create a lightweight 3D library with a very low level of complexity.
You only need a browser with WebGL compatibility (almost all)!

[Three.js Examples](http://threejs.org/examples/)

#### BDF and DAT files ####

BDF and DAT are the geometries files for Nastran Software, both files are almost equal and the geometric data in these files are reported in MSC Nastran [Quick Reference Guide](https://simcompanion.mscsoftware.com/infocenter/index?page=content&id=DOC10004)

Used Version: Nastran 2012 Quick Reference and three.js 71

### Suported Elements: ###
- GRID
- CTRIA3, CTRIA6,CRTIAR and CTRIAX
- CQUAD, CQUAD4, CQUAD6 and CQUAD8 
- CTRETA, CPENTA and CHEXA
- CBAR (Lines)


### Usage ###
Include the DATLoader:
```html
<script src="js/DATLoader.js"></script>
```

The load method return one array with one or two THREE.BufferGeometry.
```javascript
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
```

UserData of any BufferGeometry has details of all elements and points. If you try
```javascript
  array[0].userData
```
will return this schema:
```javascript
{
  GRID:[{ id: Number, x: Float, y: Float, z: Float  }],
  elements:[{
              id:Number,
              type: String, //CTRIA3,CTRIA6,CRTIAR,CTRIAX,CQUAD,CQUAD4,CQUAD6,CQUAD8,CTRETA,CPENTA or CHEXA
              vertices: [Float], //sequence of positions [x,y,z,x,y,z...]
              centroid: {x: Float, y: Float, z: Float},
              verticesID: [Number] //List of all GRID ID (Point ID) in usage
            }]
}
```
