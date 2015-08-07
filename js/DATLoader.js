THREE.DATLoader = function (manager) {
     
    this.nodes = [];
    this.elements = [];    
    this.properties =[];
    this.faceElement = [];//faceElement[face]=idElement = relation with faceID and Element ID
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
    
};

THREE.DATLoader.prototype = {
    constructor: THREE.DATLoader,
    load: function(url, onLoad, onProgress, onError) {

        var scope = this;

        var loader = new THREE.XHRLoader(scope.manager);
        loader.setCrossOrigin(this.crossOrigin);
        loader.load(url, function(text) {
            onLoad(scope.geometry = scope.parse(text));
        }, onProgress, onError);

    },

   /* fileApi: function(File,onLoad){
        var scope = this;

        var reader = new FileReader();
        reader.error = function(e) {
            alert("Error reading DAT file");
        };

        reader.onloadend = function(e) {
            if(scope.buffer)
                onLoad(scope.parseBuffer(text));
            else
                onLoad(scope.parse(text));
        };

        reader.readAsText(File);

    },*/
    
    addNode: function() {
       
        return function(id, x, y, z) {            
            this.nodes[id] = {id: id,name:"GRID "+id,x: x,y: y,z: z,elements:[]}
        };
    }(),
    
    addElement: function() {        
        return function(json) {            
            var faceID,nodeID;
            //add element            
            this.elements[json.id] = json;
            
            //add faces
            for(var i=0;i<json.faces.length;i++){
                faceID = json.faces[i];
                this.faceElement[faceID] = json.id;
            }
            //add property            
            if(this.properties[json.pid])
                this.properties[json.pid].elements.push(json.id);
            
            //add Nodes
             for(var i=0;i<json.verticesID.length;i++){
                 nodeID = json.verticesID[i]
                 this.nodes[nodeID].elements.push(json.id)
             }
            
        };
    }(),
    addPropriety: function() {        
       return function(prop){            
           this.properties[prop.id] = prop;
       };
    }(),
    
    getElementByFaceIndex: function(face) {
            var id = this.faceElement[face];
            return this.elements[id];        
    },
     getElementByVerticeIndex: function(verticeID) {
            var id = this.faceElement[verticeID];
            return this.elements[id];        
    },
    
    getElemetByID: function(id) {
        return this.elements[id];
    },
    
    getFacesByID: function(id) {
        var f = [];
        this.faceElement.forEach(function(v, i) {
            if (v === id)
                f.push(i);
        });
        return f;
    }, 
    
    
    parse: function (textFile) {
        var length, id, geo_type, G, G1, G2, P1, P2, lenFaces, rst = [], pattern;
        var width, area, pid, temp, mid, rgb = {}, aux = [];
        var geometry = new THREE.Geometry();
        var middle, dir, quaternion, matrix;
        

        //----------------------------------------------------------------------
        // GRID
        //----------------------------------------------------------------------
        pattern = /GRID\s{3,4}(.{8})(.{8})(.{8})(.{8})(.{1,8}).*/g;
        
        while ((rst = pattern.exec(textFile)) !== null) {
            id = parseInt(rst[1]);
            this.addNode(id, pTF(rst[3]),pTF(rst[4]),pTF(rst[5]));            
        }
        
        if (this.nodes.length === 0)
            throw new Error("This files has zero vertices!");
        //----------------------------------------------------------------------
        
        
        
        //----------------------------------------------------------------------
        // PSHELL
        //----------------------------------------------------------------------
        pattern = /(PSHELL\s{2})(.{8})(.{8})(.{8}).*/g;
        while ((rst = pattern.exec(textFile)) !== null) {
            
            geo_type = rst[1].replace(/\s/g, '');
            id = parseInt(rst[2]);
            mid = parseInt(rst[3]);            
            
            //Need to Implement more
            this.addPropriety({
                id: id,
                name: geo_type+ " " + id,
                type: geo_type,
                mid : mid,
                elements: []                       
            });          
        }
        //----------------------------------------------------------------------
        
        
        
        //----------------------------------------------------------------------
        // PBAR
        //----------------------------------------------------------------------
        pattern = /(PBAR\s{4})(.{8})(.{8})(.{8}).*/g;
        while ((rst = pattern.exec(textFile)) !== null) {
            id = parseInt(rst[2]),
            geo_type = rst[1].replace(/\s/g, '');
            this.addPropriety({
                id: id,
                name: geo_type+ " " + id,
                type: geo_type,
                mid : parseInt(rst[3]),
                area : pTF(rst[4]),
                elements: []
            });          
        }
        //----------------------------------------------------------------------
        
        
        
        
        
        
        //----------------------------------------------------------------------
        // CTRIA
        //----------------------------------------------------------------------
        pattern = /(CTRIA\s{3}|CTRIA3\s{2}|CTRIA6\s{2}|CTRIAR\s{2}|CTRIAX\s{2})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {
            rgb = {r: Math.random(), g: Math.random(), b: Math.random()};
            id = parseInt(rst[2]),
            geo_type = rst[1].replace(/\s/g, '');
            pid = parseInt(rst[3]);

            //Vertices
            for (var i =4;i<=6;i++){
                G = this.nodes[parseInt(rst[i])]; 
                geometry.vertices.push(new THREE.Vector3(G.x, G.y, G.z));
            }
            
            //Faces
            length = geometry.vertices.length;            
            geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1));
            
                        
           
            
            
            //userData and Face Color
            lenFaces = geometry.faces.length;    
            geometry.faces[lenFaces - 1].color.setRGB(rgb.r,rgb.g,rgb.b);
                
            this.addElement({
                id: id,
                type: geo_type,
                faces : [lenFaces - 1],
                pid:pid,
                verticesID: [
                    parseInt(rst[4]),
                    parseInt(rst[5]),
                    parseInt(rst[6])
                ]
            });          
        }
        //----------------------------------------------------------------------
      
      
      
      
      
      
      
        //----------------------------------------------------------------------
        // CQUAD
        //----------------------------------------------------------------------    
        pattern = /(CQUAD\s{3}|CQUAD4\s{2}|CQUAD6\s{2}|CQUAD8\s{2})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;        
        while ((rst = pattern.exec(textFile)) !== null) {
            rgb = {r: Math.random(), g: Math.random(), b: Math.random()};
            id = parseInt(rst[2]),
            geo_type = rst[1].replace(/\s/g, '');
            pid = parseInt(rst[3]); //Prop. ID
                      
            //Vertices
            for (var i =4;i<=7;i++){
                G = this.nodes[parseInt(rst[i])]; 
                geometry.vertices.push(new THREE.Vector3(G.x, G.y, G.z));
            }            
    
            //Faces; 123-341            
            length = geometry.vertices.length;
            geometry.faces.push(new THREE.Face3(length - 4, length - 3, length - 2));    
            geometry.faces.push(new THREE.Face3(length - 2, length - 1, length - 4)); 
                               
            //userData
            lenFaces = geometry.faces.length;
            aux =[];
            
            //userData and Face Color
            for (var i = 2; i >= 1; i--) {
                geometry.faces[lenFaces - i].color.setRGB(rgb.r,rgb.g,rgb.b);
                aux.push(lenFaces - i);
            }
            
            
            this.addElement({
                id: id,
                type: geo_type,
                faces : aux,
                pid:pid,
                verticesID: [
                    parseInt(rst[4]),
                    parseInt(rst[5]),
                    parseInt(rst[6]),
                    parseInt(rst[7])
                ]
            });            
        }
        //----------------------------------------------------------------------
      
      
      
      
      
      
        //----------------------------------------------------------------------
        // CTETRA
        //----------------------------------------------------------------------            
        pattern = /(CTETRA\s{2})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {
            rgb = {r: Math.random(), g: Math.random(), b: Math.random()};
            id = parseInt(rst[2]),
            geo_type = rst[1].replace(/\s/g, '');
            pid = parseInt(rst[3]); //Prop. ID
                      
            //Vertices = 4
            for (var i =4;i<=7;i++){
                G = this.nodes[parseInt(rst[i])]; 
                geometry.vertices.push(new THREE.Vector3(G.x, G.y, G.z));
            }
            
    
            //Faces; 132-124-234-314           
            length = geometry.vertices.length;            
            geometry.faces.push(new THREE.Face3(length - 4, length - 2, length - 3));                 
            geometry.faces.push(new THREE.Face3(length - 4, length - 3, length - 1));
            geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1));
            geometry.faces.push(new THREE.Face3(length - 2, length - 4, length - 1));
            
           
            //Userdata
            lenFaces = geometry.faces.length;
            aux =[];
            
            ///userData and Face Color
            for (var i = 4; i >= 1; i--) {
                geometry.faces[lenFaces - i].color.setRGB(rgb.r,rgb.g,rgb.b);
                aux.push(lenFaces - i);
            }
            
            
            this.addElement({
                id: id,
                type: geo_type,
                faces : aux,
                pid: pid,
                verticesID: [
                    parseInt(rst[4]),
                    parseInt(rst[5]),
                    parseInt(rst[6]),
                    parseInt(rst[7])
                ]
            });
        }
        //----------------------------------------------------------------------
      
      
      
      
      
      
        //----------------------------------------------------------------------
        // CPENTA
        //----------------------------------------------------------------------        
        pattern = /(CPENTA\s{2})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {    
            rgb = {r: Math.random(), g: Math.random(), b: Math.random()};
            id = parseInt(rst[2]),
            geo_type = rst[1].replace(/\s/g, '');
            pid = parseInt(rst[3]); //Prop. ID
    
            //Vertices = 4 até 9 = 6
            for (var i =4;i<=9;i++){
                G = this.nodes[parseInt(rst[i])]; 
                geometry.vertices.push(new THREE.Vector3(G.x, G.y, G.z));
            }
            
             //Faces; 132-154-512-346-431-265-623-456           
            length = geometry.vertices.length;            
            //1->6 | 2->5 | 3->4 | 4->3 | 5->2 | 6->1
            geometry.faces.push(new THREE.Face3(length - 6,length - 4,length - 5));//132                 
            geometry.faces.push(new THREE.Face3(length - 6,length - 2,length - 3));//154
            geometry.faces.push(new THREE.Face3(length - 2,length - 6,length - 5));//512
            geometry.faces.push(new THREE.Face3(length - 4,length - 3,length - 1));//346
            geometry.faces.push(new THREE.Face3(length - 3,length - 4,length - 6));//431                
            geometry.faces.push(new THREE.Face3(length - 5,length - 1,length - 2));//265
            geometry.faces.push(new THREE.Face3(length - 1,length - 5,length - 4));//623
            geometry.faces.push(new THREE.Face3(length - 3,length - 2,length - 1));//456
            
            
            //Userdata
            lenFaces = geometry.faces.length;
            aux =[];
            
            
            //userData and Face Color
            for (var i = 8; i >= 1; i--) {
                geometry.faces[lenFaces - i].color.setRGB(rgb.r,rgb.g,rgb.b);
                aux.push(lenFaces - i);
            }
            
            
            this.addElement({
                id: id,
                type: geo_type,
                faces : aux,
                pid: pid,
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
        //----------------------------------------------------------------------
      
      
      
      
      
      
        //----------------------------------------------------------------------
        // CHEXA
        //----------------------------------------------------------------------
        pattern = /(CHEXA\s{3})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8}).*\r\n.{8}(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {        
            rgb = {r: Math.random(), g: Math.random(), b: Math.random()};
            id = parseInt(rst[2]),
            geo_type = rst[1].replace(/\s/g, '');
            pid = parseInt(rst[3]); //Prop. ID
            
                      
            //Vertices = 11~4 = 8
            for (var i =4;i<=11;i++){
                G = this.nodes[parseInt(rst[i])]; 
                geometry.vertices.push(new THREE.Vector3(G.x, G.y, G.z));
            }
            
    
            //Faces; 458-541-165-612-276-723-748-473-867-685-421-243
            //1->8 | 2->7 | 3->6 | 4->5 | 5->4 | 6->3 | 7->2 | 8->1
            length = geometry.vertices.length;            
            geometry.faces.push(new THREE.Face3(length - 5, length - 4, length - 1));//458                 
            geometry.faces.push(new THREE.Face3(length - 4,length - 5,length - 8));//541
            geometry.faces.push(new THREE.Face3(length - 8,length - 3,length - 4));//165
            geometry.faces.push(new THREE.Face3(length - 3,length - 8,length - 7));//612
            geometry.faces.push(new THREE.Face3(length - 7,length - 2,length - 3));//276
            geometry.faces.push(new THREE.Face3(length - 2,length - 7,length - 6));//723
            geometry.faces.push(new THREE.Face3(length - 2,length - 5,length - 1));//748
            geometry.faces.push(new THREE.Face3(length - 5,length - 2,length - 6));//473
            geometry.faces.push(new THREE.Face3(length - 1,length - 3,length - 2));//867
            geometry.faces.push(new THREE.Face3(length - 3,length - 1,length - 4));//685
            geometry.faces.push(new THREE.Face3(length - 5,length - 7,length - 8));//421
            geometry.faces.push(new THREE.Face3(length - 7,length - 5,length - 6));//243
            
            //Userdata
            lenFaces = geometry.faces.length;
            aux =[];
            
            
            //userData and Face Color
            for (var i = 12; i >= 1; i--) {
                geometry.faces[lenFaces - i].color.setRGB(rgb.r,rgb.g,rgb.b);
                aux.push(lenFaces - i);
            }
            
            
            this.addElement({
                id: id,
                type: geo_type,
                faces : aux,
                pid: pid,
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
      
      
      
      
      
    
        //----------------------------------------------------------------------
        // CBAR
        //----------------------------------------------------------------------
        pattern = /(CBAR\s{4})(.{8})(.{8})(.{8})(.{8})(.{8})(.{8})(.{1,8})/g;
        while ((rst = pattern.exec(textFile)) !== null) {
            rgb = {r: Math.random(), g: Math.random(), b: Math.random()};
            id = parseInt(rst[2]),
            geo_type = rst[1].replace(/\s/g, '');
            pid = parseInt(rst[3]); //Prop. ID
           
            //Nodes
            G1 = this.nodes[parseInt(rst[4])];
            G2 = this.nodes[parseInt(rst[5])];
            P1 = new THREE.Vector3(G1.x, G1.y, G1.z);
            P2 = new THREE.Vector3(G2.x, G2.y, G2.z);
            
            // width and area
            width = P1.distanceTo(P2);            
            area = this.properties[pid].area;

            //BoxGeometry            
            temp = new THREE.BoxGeometry( width, Math.sqrt(area), Math.sqrt(area));
            
            
            //Change position and rotation
            middle = new THREE.Vector3().copy(P1).lerp(P2, 0.5);
            dir = new THREE.Vector3().copy(P2).sub(P1).normalize();
            quaternion = new THREE.Quaternion().setFromUnitVectors( new THREE.Vector3(1, 0, 0), dir )
            matrix = new THREE.Matrix4().compose( middle, quaternion, new THREE.Vector3(1,1,1) );
            
            
            // Merge Geometry
            // lenFaces += 12
            length = geometry.vertices.length;  
            geometry.merge( temp, matrix );
            
            //Userdata   
            lenFaces = geometry.faces.length;
            aux =[];
            
            
            //userData Face
            for (var i = 12; i >= 1; i--){
                aux.push(lenFaces - i);
                geometry.faces[lenFaces - i].color.setRGB(rgb.r,rgb.g,rgb.b);
            }
                        
            
            //Add element
            this.addElement({
                id: id,                
                type: geo_type,
                faces : aux,
                pid: pid,
                propriety: pid,
                verticesID: [ parseInt(rst[4]), parseInt(rst[5]) ]
            });   
        }
                
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();        
        
        return geometry;
    }
};


function pTF(val) {
    var rt = null, aux;
    
  

    if ((aux = /(\+?\-?\d*\.\d*)((\-|\+)\d+)/g.exec(val))) //0.7+1 ou .70+1 ou 70.-1
        rt = parseFloat(aux[1]) * Math.pow(10, aux[2]);

    if (rt === null) {         
        rt = parseFloat(val);
        if(isNaN(rt)){
            console.error("O arquivo pode estar fora dos padr?es de representa??o de ponto flutuante:" + val +
                    "\nEx: O valor 7 pode ser representado como 7. | 7.0 | .7E1 | 0.7+1 | .70+1 | 7.E+0 | 70.-1");
        }else{
            return rt;
        }
                
    }else{
        return rt;
    }
}
