/**
 * Define a sphere that can be drawn with texture or color.
 * @param gl the gl object for which to define the sphere
 * @param radius the radius of the sphere
 * @param latitudeBands the number of bands along the latitude direction
 * @param longitudeBands the number of bands along the longitude direction
 * @param color the color of the sphere
 */
function SolidSphere(gl, radius, latitudeBands, longitudeBands, color) {

    function changeColor(color){
        this.color = color;
    }

    function defineVerticesAndTexture(rad, latitudeBands, longitudeBands) {
        // define the vertices of the sphere
        let vertices = [];
        let normals = [];
        let textures = [];

        for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            let theta = latNumber * Math.PI / latitudeBands;
            let sinTheta = Math.sin(theta) * rad;
            let cosTheta = Math.cos(theta) * rad;

            for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                let phi = longNumber * 2 * Math.PI / longitudeBands;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);

                // position (and normals as it is a unit sphere)
                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;

                // texture coordinates
                let u = 1 - (longNumber / longitudeBands);
                let v = 1 - (latNumber / latitudeBands);

                vertices.push(x);
                vertices.push(y);
                vertices.push(z);

                normals.push(x);
                normals.push(y);
                normals.push(z);

                textures.push(u);
                textures.push(v);
            }
        }
        return {
            vertices: vertices,
            normals: normals,
            textures: textures
        }
    }

    function defineIndices(latitudeBands, longitudeBands) {
        let indices = [];
        for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
                let first = (latNumber * (longitudeBands + 1)) + longNumber;
                let second = first + longitudeBands + 1;

                indices.push(first);
                indices.push(first + 1);
                indices.push(second);

                indices.push(second);
                indices.push(first + 1);
                indices.push(second + 1);
            }
        }
        return indices;
    }

    function draw(gl, aVertexPositionId, aVertexColorId, aVertexTextureCoordId, aVertexNormalId) {
        // position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
        gl.vertexAttribPointer(aVertexPositionId, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexPositionId);

        // color is directly specified as an attribute here, as it is valid for the whole object
        gl.disableVertexAttribArray(aVertexColorId);
        gl.vertexAttrib3f(aVertexColorId, this.color[0], this.color[1], this.color[2]);

        // normal
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormals);
        gl.vertexAttribPointer(aVertexNormalId, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexNormalId);

        // Set texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTextures);
        gl.vertexAttribPointer(aVertexTextureCoordId, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexTextureCoordId);

        // elements
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.bufferIndices);
        gl.drawElements(gl.TRIANGLES, this.numberOfTriangles * 3, gl.UNSIGNED_SHORT, 0);

        // disable attributes
        gl.disableVertexAttribArray(aVertexPositionId);
        gl.disableVertexAttribArray(aVertexNormalId);
    }

    let verticesAndTextures = defineVerticesAndTexture(radius, latitudeBands, longitudeBands);
    let indices = defineIndices(latitudeBands, longitudeBands);

    let sphere = {};

    sphere.bufferVertices  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.vertices), gl.STATIC_DRAW);


    sphere.bufferNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.normals), gl.STATIC_DRAW);

    sphere.bufferTextures = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferTextures);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.textures), gl.STATIC_DRAW);

    sphere.bufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.bufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    sphere.numberOfTriangles = latitudeBands*longitudeBands*2;
    sphere.color = color;
    sphere.draw = draw;
    sphere.changeColor = changeColor;
    return sphere;
}