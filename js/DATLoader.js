THREE.DATLoader = function (manager) {

    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

};

THREE.DATLoader.prototype = {
    constructor: THREE.DATLoader,
    load: function (url, onLoad, onProgress, onError) {

        var scope = this;

        var loader = new THREE.XHRLoader(scope.manager);
        loader.setCrossOrigin(this.crossOrigin);
        loader.load(url, function (text) {

            onLoad(scope.parse(text));

        }, onProgress, onError);

    },
    /*
     * @param {Object} File - FileAPI 
     */
    fileApi: function(File,cb){
        var scope = this;
        
        var reader = new FileReader();
        reader.error = function(e) {
            alert("Error reading DAT file");
        };

        reader.onloadend = function(e) {
            cb(scope.parse(this.result));
        };

        reader.readAsText(File);
        
        
        
    },
    parse: function (textFile) {
        console.log("Start DAT reading...");

        var rst = [], positions = [], faces = [],
                positionsLines = [], facesLines = [], colorArray = [],
                pattern,
                bufferGeo = new THREE.BufferGeometry(),
                bufferGeoLine = new THREE.BufferGeometry(),
                group = [],
                userData = {
                    // Points os all vertices
                    GRID: new Array(),
                    // general elements CTRIA, CQUAD, CBAR
                    elements: new Array()
                };


        //----------------------------------------------------------------------
        // GRID
        //----------------------------------------------------------------------
        pattern = /GRID\s{3,4}(.{8})(.{8})(.{8})(.{8})(.{1,8}).*/g;

        while ((rst = pattern.exec(textFile)) !== null) {
            id = parseInt(rst[1]);
            userData.GRID[id] = {
                id: id,
                x: pTF(rst[3]),
                y: pTF(rst[4]),
                z: pTF(rst[5])
            };
        }
        if (userData.GRID.length === 0)
            throw new Error("This files has zero vertices!");


        //----------------------------------------------------------------------
        // CTRIA3    | EID | PID | G1  |  G2 | G3 | MCID |  ZOFFS |
        //
        //            G3 .
        //              /\
        //             /  \
        //            /    \
        //           /      \
        //          /        \
        //      G1 .----------. G2
        //
        // CTRIA3, CTRIA6,CRTIAR, CTRIAX  
        //----------------------------------------------------------------------        
        pattern = /(CTRIA\s{3}|CTRIA3\s{2}|CTRIA6\s{2}|CTRIAR\s{2}|CTRIAX\s{2})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        
        while ((rst = pattern.exec(textFile)) !== null) {
            var G1 = userData.GRID[parseInt(rst[4])],
                G2 = userData.GRID[parseInt(rst[5])],
                G3 = userData.GRID[parseInt(rst[6])];
        
            var aux = [
                
                G1.x, G1.y, G1.z,                                        
                G2.x, G2.y, G2.z,
                G3.x, G3.y, G3.z, 
            ];

            //Geometry
            var id = parseInt(rst[2]);
            var geo_type = rst[1].replace(/\s/g, '');

            for (var i = 0; i < aux.length; i++) {
                positions.push(aux[i]);
                faces.push(id);
            }


            userData.elements.push({
                id: id,
                type: geo_type,
                vertices: aux,
                centroid: {
                    x: (aux[0] + aux[3] + aux[6]) / 3,
                    y: (aux[1] + aux[4] + aux[7]) / 3,
                    z: (aux[2] + aux[5] + aux[8]) / 3
                },
                verticesID: [
                    parseInt(rst[4]),
                    parseInt(rst[5]),
                    parseInt(rst[6]),
                ]
            });
        }


        //----------------------------------------------------------------------
        // CQUAD     | EID | PID | G1  |  G2 | G3  | G4  | MCID |ZOFFS |    
        //
        //      G2 .------------. G3        
        //         |            |
        //         |            |
        //         |            |
        //      G1 .------------. G4
        //
        // Normal in front of the square
        // CQUAD, CQUAD4, CQUAD6 and CQUAD8               
        //----------------------------------------------------------------------
        pattern = /(CQUAD\s{3}|CQUAD4\s{2}|CQUAD6\s{2}|CQUAD8\s{2})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {
            
            var G1 = userData.GRID[parseInt(rst[4])],
                G2 = userData.GRID[parseInt(rst[5])],
                G3 = userData.GRID[parseInt(rst[6])],
                G4 = userData.GRID[parseInt(rst[7])];

            var aux = [
                
                G1.x, G1.y, G1.z,                                        
                G2.x, G2.y, G2.z,
                G3.x, G3.y, G3.z, 
                
                G3.x, G3.y, G3.z,
                G4.x, G4.y, G4.z,
                G1.x, G1.y, G1.z 
            ];



            var id = parseInt(rst[2]);
            var geo_type = rst[1].replace(/\s/g, '');

            for (var i = 0; i < aux.length; i++) {
                positions.push(aux[i]);
                faces.push(id);
            }

            userData.elements.push({
                id: id,
                type: geo_type,
                vertices: aux,
                centroid: {
                    x: (aux[0] + aux[3] + aux[6] + aux[9]) / 4,
                    y: (aux[1] + aux[4] + aux[7] + aux[10]) / 4,
                    z: (aux[2] + aux[5] + aux[8] + aux[11]) / 4
                },
                verticesID: [
                    parseInt(rst[4]),
                    parseInt(rst[5]),
                    parseInt(rst[6]),
                    parseInt(rst[7])
                ]


            });
        }





        //----------------------------------------------------------------------
        // CTETRA | EID | PID | G1 | G2 | G3 | G4 | G5 | G6 |   |
        //     0  | 1   |  2  | 3  | 4  | 5  | 6  | 7  | 8  |   |
        //----------------------------------------------------------------------
        //     +  | G7 | G8  | G9 | G10 |
        //        | 1  |  2  | 3  | 4   |
        //----------------------------------------------------------------------   
        // G5 - G10 are optional

        pattern = /(CTETRA\s{2})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {
            var G1 = userData.GRID[parseInt(rst[4])],
                G2 = userData.GRID[parseInt(rst[5])],
                G3 = userData.GRID[parseInt(rst[6])],
                G4 = userData.GRID[parseInt(rst[7])];

            var aux = [
                 
                G1.x, G1.y, G1.z,                         
                G3.x, G3.y, G3.z, 
                G2.x, G2.y, G2.z,  
                                            
                G1.x, G1.y, G1.z,                
                G2.x, G2.y, G2.z, 
                G4.x, G4.y, G4.z, 

                G2.x, G2.y, G2.z,                 
                G3.x, G3.y, G3.z, 
                G4.x, G4.y, G4.z, 

                          
                G3.x, G3.y, G3.z,                 
                G1.x, G1.y, G1.z, 
                G4.x, G4.y, G4.z, 

               

            ];

            var id = parseInt(rst[2]);
            var geo_type = rst[1].replace(/\s/g, '');

            for (var i = 0; i < aux.length; i++) {
                positions.push(aux[i]);
                faces.push(id);
            }

            userData.elements.push({
                id: id,
                type: geo_type,
                vertices: aux,
                centroid: {
                    x: (aux[0] + aux[3] + aux[6] + aux[9]) / 4,
                    y: (aux[1] + aux[4] + aux[7] + aux[10]) / 4,
                    z: (aux[2] + aux[5] + aux[8] + aux[11]) / 4
                },
                verticesID: [
                    parseInt(rst[4]),
                    parseInt(rst[5]),
                    parseInt(rst[6]),
                    parseInt(rst[7])
                ]
            });
        }




        //----------------------------------------------------------------------
        // CPENTA | EID | PID | G1 | G2 | G3 | G4 | G5 | G6 |    |  
        //     0  | 1   |  2  | 3  | 4  | 5  | 6  | 7  | 8  |    |
        //----------------------------------------------------------------------
        //     +  | G7 | G8  | G9 | G10 | G11 | G12 | G13 | G14 |
        //     0  | 1  |  2  | 3  |  4  |  5  |  6  |  7  |  8  |
        //----------------------------------------------------------------------
        //     +  | G15 |
        //     0  |  1  |
        // G7 - G15 are optional            
        //----------------------------------------------------------------------
        pattern = /(CPENTA\s{2})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {            
            var G1 = userData.GRID[parseInt(rst[4])],
                G2 = userData.GRID[parseInt(rst[5])],
                G3 = userData.GRID[parseInt(rst[6])],
                G4 = userData.GRID[parseInt(rst[7])],
                G5 = userData.GRID[parseInt(rst[8])],
                G6 = userData.GRID[parseInt(rst[9])];
        
            var aux = [
                
                G1.x, G1.y, G1.z,                
                G3.x, G3.y, G3.z,
                G2.x, G2.y, G2.z,
                
                G1.x, G1.y, G1.z,                
                G5.x, G5.y, G5.z,
                G4.x, G4.y, G4.z,
                
                G5.x, G5.y, G5.z,                
                G1.x, G1.y, G1.z,
                G2.x, G2.y, G2.z,
                
                G3.x, G3.y, G3.z,                
                G4.x, G4.y, G4.z,
                G6.x, G6.y, G6.z,
                
                G4.x, G4.y, G4.z,
                G3.x, G3.y, G3.z,
                G1.x, G1.y, G1.z,
                
                G2.x, G2.y, G2.z,
                G6.x, G6.y, G6.z,
                G5.x, G5.y, G5.z,
                
                G6.x, G6.y, G6.z,
                G2.x, G2.y, G2.z,
                G3.x, G3.y, G3.z,
               
                G4.x, G4.y, G4.z,
                G5.x, G5.y, G5.z,
                G6.x, G6.y, G6.z

            ];

            var id = parseInt(rst[2]);
            var geo_type = rst[1].replace(/\s/g, '');

            for (var i = 0; i < aux.length; i++) {
                positions.push(aux[i]);
                faces.push(id);
            }

            userData.elements.push({
                id: id,
                type: geo_type,
                vertices: aux,
                centroid: {
                    x: (aux[0] + aux[3] + aux[6] + aux[9] +
                            aux[12] + aux[15] + aux[18] + aux[21]) / 8,
                    y: (aux[1] + aux[4] + aux[7] + aux[10] +
                            aux[13] + aux[16] + aux[19] + aux[22]) / 8,
                    z: (aux[2] + aux[5] + aux[8] + aux[11] +
                            aux[14] + aux[17] + aux[20] + aux[23]) / 8
                },
                verticesID: [
                    parseInt(rst[4]),
                    parseInt(rst[5]),
                    parseInt(rst[6]),
                    parseInt(rst[7]),
                    parseInt(rst[8]),
                    parseInt(rst[9])
                ]
            });
        }





        // CHEXA | EID | PID | G1 | G2 | G3 | G4 | G5 | G6 |   |  
        //     0  | 1   |  2  | 3  | 4  | 5  | 6  | 7  | 8  |   |
        //----------------------------------------------------------------------
        //     +  | G7 | G8  | G9 | G10 | G11 | G12 | G13 | G14 |
        //     0  | 1  |  2  | 3  |  4  |  5  |  6  |  7  |  8  |
        //----------------------------------------------------------------------
        //     +  | G15 | G16  | G17 | G18 | G19 | G20 | 
        //     0  |  1  |  2   |  3  |  4  |  5  |  6  |
        //----------------------------------------------------------------------     
        // G9 - G20 are optional           
        //----------------------------------------------------------------------
        pattern = /(CHEXA\s{3})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8}).*\r\n.{8}(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {
         
            var G1 = userData.GRID[parseInt(rst[4])],
                G2 = userData.GRID[parseInt(rst[5])],
                G3 = userData.GRID[parseInt(rst[6])],
                G4 = userData.GRID[parseInt(rst[7])],
                G5 = userData.GRID[parseInt(rst[8])],
                G6 = userData.GRID[parseInt(rst[9])],
                G7 = userData.GRID[parseInt(rst[10])],
                G8 = userData.GRID[parseInt(rst[11])];
        
            var aux = [
               
                G4.x, G4.y, G4.z,                
                G5.x, G5.y, G5.z,
                G8.x, G8.y, G8.z,
                
                G5.x, G5.y, G5.z,
                G4.x, G4.y, G4.z,
                G1.x, G1.y, G1.z,

                G1.x, G1.y, G1.z,
                G6.x, G6.y, G6.z,               
                G5.x, G5.y, G5.z,

                
                G6.x, G6.y, G6.z,
                G1.x, G1.y, G1.z,            
                G2.x, G2.y, G2.z,

                
                G2.x, G2.y, G2.z,
                G7.x, G7.y, G7.z,            
                G6.x, G6.y, G6.z,

                
                G7.x, G7.y, G7.z,
                G2.x, G2.y, G2.z,               
                G3.x, G3.y, G3.z,

                
                G7.x, G7.y, G7.z,
                G4.x, G4.y, G4.z,               
                G8.x, G8.y, G8.z,

                
                G4.x, G4.y, G4.z,
                G7.x, G7.y, G7.z,               
                G3.x, G3.y, G3.z,

                
                G8.x, G8.y, G8.z,
                G6.x, G6.y, G6.z,            
                G7.x, G7.y, G7.z,

                
                G6.x, G6.y, G6.z,
                G8.x, G8.y, G8.z,              
                G5.x, G5.y, G5.z,

                               
                G4.x, G4.y, G4.z,
                G2.x, G2.y, G2.z,             
                G1.x, G1.y, G1.z,

                
                G2.x, G2.y, G2.z,
                G4.x, G4.y, G4.z,
                G3.x, G3.y, G3.z


            ];

            var id = parseInt(rst[2]);
            var geo_type = rst[1].replace(/\s/g, '');

            for (var i = 0; i < aux.length; i++) {
                positions.push(aux[i]);
                faces.push(id);
            }

            userData.elements.push({
                id: id,
                type: geo_type,
                vertices: aux,
                centroid: {
                    x: (aux[0] + aux[3] + aux[6] + aux[9] + aux[12] +
                            aux[15] + aux[18] + aux[21] + aux[24] + aux[27]) / 10,
                    y: (aux[1] + aux[4] + aux[7] + aux[10] + aux[13] +
                            aux[16] + aux[19] + aux[22] + aux[25] + aux[28]) / 10,
                    z: (aux[2] + aux[5] + aux[8] + aux[11] + aux[14] +
                            aux[17] + aux[20] + aux[23] + aux[26] + aux[29]) / 10
                },
                verticesID: [
                    parseInt(rst[4]),
                    parseInt(rst[5]),
                    parseInt(rst[6]),
                    parseInt(rst[7]),
                    parseInt(rst[8]),
                    parseInt(rst[9]),
                    parseInt(rst[10]),
                    parseInt(rst[11])
                ]
            });
        }



        
        //----------------------------------------------------------------------
        // CBAR   | EID | PID | GA | GB | X1 | X2 | X3 | OFFT |   |
        //     0  | 1   |  2  | 3  | 4  | 5  | 6  | 7  |   8  |   |
        //----------------------------------------------------------------------
        //CBAR     1811631 1802025 1806751 1806744      1.      0.      0.
        //CBAR         146     101     146     147      0.      1.      0.
        pattern = /CBAR\s{4}(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {
            var aux = [
                //ponto 1
                userData.GRID[parseInt(rst[3])].x,
                userData.GRID[parseInt(rst[3])].y,
                userData.GRID[parseInt(rst[3])].z,
                //ponto 2
                userData.GRID[parseInt(rst[4])].x,
                userData.GRID[parseInt(rst[4])].y,
                userData.GRID[parseInt(rst[4])].z
            ];
            
            for (var i = 0; i < aux.length; i++) {
                positionsLines.push(aux[i]);
                facesLines.push(id);
            }

            userData.elements.push({
                id: parseInt(rst[1]),
                type: 'CBAR',
                centroid: {
                    x: (aux[0] + aux[3]) / 2,
                    y: (aux[1] + aux[4]) / 2,
                    z: (aux[2] + aux[5]) / 2
                },
                vertices: aux,
                verticesID: [
                    parseInt(rst[3]),
                    parseInt(rst[4])
                ]
            });

            


        }
        

        /* BufferGeometry*/
        
        if(positions.length>3){
            
            for (var i = positions.length; i--; )
                colorArray[i] = Math.random();
            bufferGeo.name = "SHAPE"
            bufferGeo.userData = userData;
            bufferGeo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            bufferGeo.addAttribute('face', new THREE.BufferAttribute(new Uint32Array(faces), 3));
            bufferGeo.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), 3));
            bufferGeo.computeVertexNormals();
            bufferGeo.computeFaceNormals();
            bufferGeo.computeBoundingSphere();
            bufferGeo.computeBoundingBox();
            group.push(bufferGeo);
        }
        /* Lines*/
        if (positionsLines.length > 3) {
            var index = [];
            for (var i = 0; i < positionsLines.length; i++)
                colorArray[i] = Math.random();
            for (var i = 0; i < positionsLines.length / 3; i++)
                index[i] = i;

            bufferGeoLine.name = "LINE";
            bufferGeoLine.userData = userData;
            bufferGeoLine.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(index), 1));
            bufferGeoLine.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positionsLines), 3));
            bufferGeoLine.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), 3));
            bufferGeoLine.addAttribute('face', new THREE.BufferAttribute(new Uint32Array(facesLines), 3));
            bufferGeoLine.computeBoundingSphere();
            group.push(bufferGeoLine);
        }
        console.log('Finish DAT!');

        return group;
    }
};


function pTF(val) {
    var rt = null, aux;

    if ((aux = /(\.\d+)\E(\d+)/g.exec(val))) //.7E1
        rt = parseFloat(aux[1]) * Math.pow(10, aux[2]);

    if ((aux = /(\d*\.\d+)\+(\d+)/g.exec(val))) //0.7+1 ou .70+1
        rt = parseFloat(aux[1]) * Math.pow(10, aux[2]);

    if ((aux = /(\d+\.)\E\+(\d+)/g.exec(val))) //7.E+0
        rt = parseFloat(aux[1]) * Math.pow(10, aux[2]);

    if ((aux = /(\d+\.)(\-\d+)/g.exec(val))) //70.-1
        rt = parseFloat(aux[1]) * Math.pow(10, aux[2]);

    if (rt === null) {
        rt = parseFloat(val);
        if (rt.isNaN)
            console.error("O arquivo pode estar fora dos padr?es de representa??o de ponto flutuante:" + val +
                    "\nEx: O valor 7 pode ser representado como 7. | 7.0 | .7E1 | 0.7+1 | .70+1 | 7.E+0 | 70.-1");
    }
    return rt;

}