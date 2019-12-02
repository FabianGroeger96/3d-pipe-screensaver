/**
 * Created by toko on 13.05.17.
 */

/**
 *
 * Define a wire frame cube with methods for drawing it.
 *
 * @param gl
 * @param sideColors
 * @returns object with draw method
 * @constructor
 */
function SolidCubeWithNormals(gl, sideColors) {
    function defineVertices(gl) {
        // define the vertices of the cube
        let vertices = [
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,

            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,

            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,

            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,

            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,

            -0.5, 0.5, -0.5,
            -0.5, -0.5, -0.5,
            -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5,
        ];
        let buffer  = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        buffer.bufferLength = vertices.length;
        return buffer;
    }


    function defineIndices(gl) {
        // define the edges for the cube, there are 12 triangles for a cube
        let vertexIndices = [
            // Bottom faces
            0, 2, 1,
            1, 2, 3,
            // Top faces
            4, 5, 6,
            5, 7, 6,
            // Side face 1
            8, 10, 9,
            9, 10, 11,
            // Side face 2 (opposite of 1)
            12, 13, 14,
            13, 15, 14,
            // Side face 3
            16, 18, 17,
            17, 18, 19,
            // Side face 4 (opposite of 3)
            20, 21, 22,
            21, 23, 22
        ];
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
        buffer.bufferLength = vertexIndices.length;
        return buffer;
    }

    function defineColors(gl, colorPerSide) {
        // define the colors of the vertices
        let colors = [];
        for (let i = 0; i < 6; i++) {
            for (let x = 0; x < 4; x++) {
                colors = colors.concat(colorPerSide[i], 1);
            }
        }

        let buffer  = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        buffer.bufferLength = colors.length;
        return buffer;
    }

    function defineTextureCoordinates(gl) {
        let textureCoords = [
            // Bottom
            1.0, 1.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 0.0,
            // Top
            1.0, 1.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 0.0,
            // Side 1
            1.0, 1.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 0.0,
            // Side 2
            1.0, 1.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 0.0,
            // Side 3
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 1.0,
            // Side 4
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 1.0
        ];

        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        return buffer;
    }

    function defineNormals(gl) {
        var bottomNormal = [0.0, 0.0, -1.0];
        var topNormal = [0.0, 0.0, 1.0];
        var side1Normal = [0.0, -1.0, 0.0];
        var side2Normal = [0.0, 1.0, 0.0];
        var side3Normal = [1.0, 0.0, 0.0];
        var side4Normal = [-1.0, 0.0, 0.0];


        // make 4 entries, one for each vertex
        var bottomSideNormal  = bottomNormal.concat(bottomNormal, bottomNormal, bottomNormal);
        var topSideNormal     = topNormal.concat(topNormal, topNormal, topNormal);
        var sideOneNormal    = side1Normal.concat(side1Normal, side1Normal, side1Normal);
        var sideTwoNormal    = side2Normal.concat(side2Normal, side2Normal, side2Normal);
        var sideThreeNormal   = side3Normal.concat(side3Normal, side3Normal, side3Normal);
        var sideFourNormal   = side4Normal.concat(side4Normal, side4Normal, side4Normal);

        var allSidesNormal = [].concat(bottomSideNormal, topSideNormal,
                               sideOneNormal, sideTwoNormal, sideThreeNormal, sideFourNormal);

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allSidesNormal), gl.STATIC_DRAW);
        return buffer;
    }

    return {
        bufferVertices: defineVertices(gl),
        bufferIndices: defineIndices(gl),
        bufferColors: defineColors(gl, sideColors),
        bufferTextureCoordinates: defineTextureCoordinates(gl),
        bufferNormals: defineNormals(gl),

        draw: function(gl, aVertexPositionId, aVertexColorId, aVertexTextureCoordId, aVertexNormalId) {
            // Set vertex buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
            gl.vertexAttribPointer(aVertexPositionId, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aVertexPositionId);

            // Set indices buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);

            // Set color
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferColors);
            gl.vertexAttribPointer(aVertexColorId, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aVertexColorId);

            // Set texture coordinates
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTextureCoordinates);
            gl.vertexAttribPointer(aVertexTextureCoordId, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aVertexTextureCoordId);

            // Set normals
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormals);
            gl.vertexAttribPointer(aVertexNormalId, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aVertexNormalId);

            // Draw
            gl.drawElements(gl.TRIANGLES, this.bufferIndices.bufferLength, gl.UNSIGNED_SHORT, 0);

            // disable all attributes
            gl.disableVertexAttribArray(aVertexPositionId);
            gl.disableVertexAttribArray(aVertexColorId);
            gl.disableVertexAttribArray(aVertexTextureCoordId);
            gl.disableVertexAttribArray(aVertexNormalId);
        }
    }
}



