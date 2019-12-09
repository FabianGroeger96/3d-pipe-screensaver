/**
 *
 * Define a pipe that can be drawn with texture or color.
 */

/**
 *
 * @param gl the gl object for which to define the sphere
 * @param latitudeBands the number of bands along the latitude direction
 * @param longitudeBands the number of bands along the longitude direction
 * @param color the color of the sphere
 *
 */
function SolidPipe(gl, latitudeBands, longitudeBands, color) {

    function defineVerticesAndTexture(latitudeBands, longitudeBands) {
        "use strict";
        // define the vertices of the sphere
        var vertices = [];
        var normals = [];
        var textures = [];

        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                if (latNumber > latitudeBands / 2) {
                    var x = cosPhi;
                    var y = cosTheta;
                    var z = sinPhi;
                } else {
                    var x = cosPhi;
                    var y = cosTheta;
                    var z = sinPhi;

                    var vec = vec3.create();
                    vec[0] = x;
                    vec[1] = y;
                    vec[2] = z;

                    var vec_rotate = vec3.create();
                    vec3.rotateZ(vec_rotate, vec, [0, 0, 0], 80);

                    //x = vec_rotate[0] + 1;
                    x = vec_rotate[0];
                    y = vec_rotate[1];
                    z = vec_rotate[2];
                }

                // texture coordinates
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

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
        var indices = [];
        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;

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

    function draw(gl, aVertexPositionId, aVertexColorId, aTextureCoordsId, aVertexNormalId) {
        "use strict";

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

        // elements
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pipe.bufferIndices);
        gl.drawElements(gl.TRIANGLES, this.numberOfTriangles * 3, gl.UNSIGNED_SHORT, 0);

        // disable attributes
        gl.disableVertexAttribArray(aVertexPositionId);
        gl.disableVertexAttribArray(aVertexNormalId);
    }

    var verticesAndTextures = defineVerticesAndTexture(latitudeBands, longitudeBands);
    var indices = defineIndices(latitudeBands, longitudeBands);

    var pipe = {};

    pipe.bufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pipe.bufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.vertices), gl.STATIC_DRAW);


    pipe.bufferNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pipe.bufferNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.normals), gl.STATIC_DRAW);

    pipe.bufferTextures = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pipe.bufferTextures);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.textures), gl.STATIC_DRAW);

    pipe.bufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pipe.bufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    pipe.numberOfTriangles = latitudeBands * longitudeBands * 2;
    pipe.color = color;
    pipe.draw = draw;
    return pipe;
}