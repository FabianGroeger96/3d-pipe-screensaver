/**
 * Define a cylinder that can be drawn with texture or color.
 */
function SolidPipe(gl, radius, length, longitudeBands, color) {
    function changeColor(color){
        this.color = color;
    }

    function defineVerticesAndTexture(rad, len, longBands) {
        let vertices = [];
        let normals = [];
        let textures = [];

        for (let latNumber = 0; latNumber < 4; latNumber++) {
            let endPiece = latNumber === 0 || latNumber === 3;
            let latHeight = 0;
            if (latNumber < 2) {
                latHeight = 1;
            } else {
                latHeight = -1;
            }

            let sinTheta = endPiece ? 0 : 1;
            let cosTheta = (latHeight / 2) * len;

            for (let longNumber = 0; longNumber <= longBands; longNumber++) {
                let phi = longNumber * 2 * Math.PI / longBands;
                let sinPhi = Math.sin(phi) * rad;
                let cosPhi = Math.cos(phi) * rad;

                // Position
                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;

                // texture coordinates
                let u = 1 - (longNumber / longBands);
                let v = latHeight > 0 ? 1 : 0;

                vertices.push(x);
                vertices.push(y);
                vertices.push(z);

                normals.push(x);
                normals.push(endPiece ? latHeight : 0); // Normal correction
                normals.push(z);

                textures.push(u);
                textures.push(v);
            }
        }
        return {
            numberOfVertices: vertices.length / 3,
            vertices: vertices,
            normals: normals,
            textures: textures
        }
    }

    function defineIndices(longBands) {
        let indicesArray = [];
        for (let latNumber = 0; latNumber < 4 - 1; latNumber++) {
            for (let longNumber = 0; longNumber < longBands; longNumber++) {
                let first = (latNumber * (longBands + 1)) + longNumber;
                let second = first + longBands + 1;

                indicesArray.push(first);
                indicesArray.push(first + 1);
                indicesArray.push(second);

                indicesArray.push(second);
                indicesArray.push(first + 1);
                indicesArray.push(second + 1);
            }
        }
        return {
            numberOfIndices: indicesArray.length / 3,
            indices: indicesArray
        };
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
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);
        gl.drawElements(gl.TRIANGLES, this.numberOfTriangles * 3, gl.UNSIGNED_SHORT, 0);

        // disable attributes
        gl.disableVertexAttribArray(aVertexPositionId);
        gl.disableVertexAttribArray(aVertexNormalId);
    }


    let verticesAndTextures = defineVerticesAndTexture(radius, length, longitudeBands);
    let indices = defineIndices(longitudeBands);

    let cylinder = {};

    cylinder.bufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder.bufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.vertices), gl.STATIC_DRAW);


    cylinder.bufferNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder.bufferNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.normals), gl.STATIC_DRAW);

    cylinder.bufferTextures = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder.bufferTextures);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.textures), gl.STATIC_DRAW);

    cylinder.bufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder.bufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices.indices), gl.STATIC_DRAW);

    cylinder.numberOfTriangles = indices.numberOfIndices;
    cylinder.color = color;
    cylinder.draw = draw;
    cylinder.changeColor = changeColor;
    return cylinder;
}