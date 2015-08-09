THREE.DATLoader = function (manager) {
     
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
    
};

THREE.DATLoader.prototype = {
    constructor: THREE.DATLoader,
    load: function(url, onLoad, onProgress, onError) {

        var scope = this;

        var loader = new THREE.XHRLoader(scope.manager);
        loader.setCrossOrigin(this.crossOrigin);
        loader.load(url, function(text) {
            var array = scope.parse(text);
            onLoad(array[0],array[1]);
        }, onProgress, onError);

    },
    toGeometry: function(P1,P2,width,height){
            var x = width/2;
            var y = height/2;
            var geo = new THREE.Geometry();

            geo.vertices.push(new THREE.Vector3(P1.x+x,P1.y+y,P1.z));
            geo.vertices.push(new THREE.Vector3(P1.x+x,P1.y+y,P1.z));
            geo.vertices.push(new THREE.Vector3(P1.x-x,P1.y+y,P1.z));
            geo.vertices.push(new THREE.Vector3(P1.x-x,P1.y-y,P1.z));

            geo.vertices.push(new THREE.Vector3(P2.x+x,P2.y-y,P2.z));
            geo.vertices.push(new THREE.Vector3(P2.x+x,P2.y+y,P2.z));
            geo.vertices.push(new THREE.Vector3(P2.x-x,P2.y+y,P2.z));
            geo.vertices.push(new THREE.Vector3(P2.x-x,P2.y-y,P2.z));


            //Face behind
            geo.faces.push(new THREE.Face3(0,1,2));
            geo.faces.push(new THREE.Face3(2,3,0));

            //Face in front
            geo.faces.push(new THREE.Face3(6,5,4));
            geo.faces.push(new THREE.Face3(4,7,6));

            //Face right
            geo.faces.push(new THREE.Face3(1,5,6));
            geo.faces.push(new THREE.Face3(6,2,1));

            //Face left
            geo.faces.push(new THREE.Face3(4,0,3));
            geo.faces.push(new THREE.Face3(3,7,4));

            //Face top
            geo.faces.push(new THREE.Face3(0,4,5));
            geo.faces.push(new THREE.Face3(5,1,0));

            //Face bottom
            geo.faces.push(new THREE.Face3(2,6,7));
            geo.faces.push(new THREE.Face3(7,3,2));

            return geo;
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

    
    parse: function (textFile) {
        var length, id, geo_type, G, G1, G2, P1, P2, lenFaces, rst = [], pattern;
        var width,heigth, area, pid, temp, mid, rgb = {}, aux = [];
        var geometry = new THREE.Geometry();
        var data = new THREE.DATData()



        //----------------------------------------------------------------------
        // GRID
        //----------------------------------------------------------------------
        pattern = /GRID\s{3,4}(.{8})(.{8})(.{8})(.{8})(.{1,8}).*/g;
        
        while ((rst = pattern.exec(textFile)) !== null) {
            id = parseInt(rst[1]);
            data.addNode(id, pTF(rst[3]),pTF(rst[4]),pTF(rst[5]));
        }
        
        if (data.nodes.length === 0)
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
            data.addPropriety({
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
            data.addPropriety({
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
                G = data.nodes[parseInt(rst[i])];
                geometry.vertices.push(new THREE.Vector3(G.x, G.y, G.z));
            }
            
            //Faces
            length = geometry.vertices.length;            
            geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1));
            
                        
           
            
            
            //userData and Face Color
            lenFaces = geometry.faces.length;    
            geometry.faces[lenFaces - 1].color.setRGB(rgb.r,rgb.g,rgb.b);
                
            data.addElement({
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
                G = data.nodes[parseInt(rst[i])];
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
            
            
            data.addElement({
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
                G = data.nodes[parseInt(rst[i])];
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
            
            
            data.addElement({
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
                G = data.nodes[parseInt(rst[i])];
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
            
            
            data.addElement({
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
                G = data.nodes[parseInt(rst[i])];
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
            
            
            data.addElement({
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
            G1 = data.nodes[parseInt(rst[4])];
            G2 = data.nodes[parseInt(rst[5])];

            // Vertices
            P1 = new THREE.Vector3(G1.x, G1.y, G1.z);
            P2 = new THREE.Vector3(G2.x, G2.y, G2.z);

            //Area
            area = data.properties[pid].area;
            width = Math.sqrt(area);
            heigth = width;

            //TRHEE.Geometry
            temp = this.toGeometry(P1,P2,width,heigth);

            // Merge Geometry master with temp geometry
            geometry.merge( temp);

            //userData
            lenFaces = geometry.faces.length;
            aux =[];


            //userData and Face Color
            for (var i = 12; i >= 1; i--) {
                geometry.faces[lenFaces - i].color.setRGB(rgb.r,rgb.g,rgb.b);
                aux.push(lenFaces - i);
            }
            
            //Add element
            data.addElement({
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
        
        return [geometry,data];
    }
};



THREE.DATData = function(){
    this.nodes = [];
    this.elements = [];
    this.properties =[];
    this.faceElement = [];//faceElement[face]=idElement = relation with faceID and Element ID
};

THREE.DATData.prototype = {
    constructor: THREE.DATData,
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
    /*
    getElementByVerticeID: function(verticeID) {
        var id = this.faceElement[verticeID];
        return this.elements[id];
    },
    */

    getElemet: function(id) {
        return this.elements[id];
    },

    getFacesOfElementID: function(id) {
        var f = [];
        this.faceElement.forEach(function(v, i) {
            if (v === id)
                f.push(i);
        });
        return f;
    }

}

function pTF(val) {
    var rt = null, aux;

    if ((aux = /(\+?\-?\d*\.\d*)((\-|\+)\d+)/g.exec(val))) //0.7+1 ou .70+1 ou 70.-1
        rt = parseFloat(aux[1]) * Math.pow(10, aux[2]);

    if (rt === null) {
        rt = parseFloat(val);
        if(isNaN(rt)){
            throw new Error("Error reading Float value: " + val)
        }else{
            return rt;
        }
                
    }else{
        return rt;
    }
}
