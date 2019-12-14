/**
 * Define a cylinder that can be drawn with texture or color.
 */
function SolidCurve(gl, radius, length, latitudeBands, longitudeBands, color, wireframe = false, curveRadius = 0.5, curveAngle = Math.PI / 2) {
    function changeColor(color){
        this.color = color;
    }

    function defineVerticesAndTexture(rad, len, latBands, longBands, curveRad, curveAng) {
        let vertices = [];
        let normals = [];
        let textures = [];

        //let curveRadius = 0.5; // between 0 and 1
        //let curveAngle = Math.PI / 2;

        let deflectionMat = mat4.create();

        let sectionDistance = (2 - 2 * (1 - curveRad)) / (latBands - 4);
        let ringCoordinates = [];

        for (let longNumber = 0; longNumber <= longBands; longNumber++) {
            let phi = longNumber * 2 * Math.PI / longBands;

            let sinPhi = Math.sin(phi) * rad;
            let cosPhi = Math.cos(phi) * rad;

            ringCoordinates = ringCoordinates.concat(vec3.fromValues(cosPhi, 0, sinPhi));
        }

        let distanceToNextRing = [];
        distanceToNextRing.push(0);
        distanceToNextRing.push(0);
        distanceToNextRing.push(1 - curveRad);
        for (let i = 0; i < latBands + 1 - 5; i++) {
            distanceToNextRing.push(sectionDistance);
        }
        distanceToNextRing.push(1 - curveRad);
        distanceToNextRing.push(0);

        for (let i = 0; i < distanceToNextRing.length; i++) {
            distanceToNextRing[i] = (distanceToNextRing[i] / 2) * len;
        }

        let direction = vec3.fromValues(0, 1, 0);
        let lastPoint = vec3.fromValues(0, -(len / 2), 0);

        let vSum = 0;

        for (let latNumber = 0; latNumber <= latBands; latNumber++) {
            let endPiece = latNumber === 0 || latNumber === latBands;
            vSum += distanceToNextRing[latNumber];

            // Update deflectionMat
            if (latNumber === 3) {
                mat4.fromZRotation(deflectionMat, curveAng / (latBands + 1 - 5));
            } else if (latNumber === latBands - 1) {
                mat4.identity(deflectionMat);
            }

            // Determine the new direction
            vec3.transformMat4(direction, direction, deflectionMat);
            let newDirection = vec3.clone(direction);
            vec3.scale(newDirection, newDirection, distanceToNextRing[latNumber]);

            let newPoint = vec3.clone(lastPoint);
            vec3.add(newPoint, newPoint, newDirection);

            lastPoint = newPoint;

            let vec;
            for (let longNumber = 0; longNumber <= longBands; longNumber++) {
                vec = vec3.clone(newPoint);
                if (!endPiece) {
                    let ringCoord = ringCoordinates[longNumber];
                    vec3.transformMat4(ringCoord, ringCoord, deflectionMat);
                    vec3.add(vec, vec, ringCoord);
                }

                // Add vertices, normals and texture coordinates
                vertices.push(vec[0]);
                vertices.push(vec[1]);
                vertices.push(vec[2]);

                if (!endPiece) {
                    normals.push(vec[0]);
                    normals.push(vec[1]);
                    normals.push(vec[2]);
                } else {
                    if (latNumber < latBands / 2) {
                        normals.push(0);
                        normals.push(-1);
                        normals.push(0);
                    } else {
                        let normalVec = vec3.fromValues(0, 1, 0);
                        let rotMat = mat4.create();
                        mat4.fromZRotation(rotMat, curveAngle);
                        vec3.transformMat4(normalVec, normalVec, rotMat);
                        normals.push(normalVec[0]);
                        normals.push(normalVec[1]);
                        normals.push(normalVec[2]);
                    }
                }

                let u = 1 - (longNumber / longBands);
                let v = vSum;
                
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

    function defineIndices(latBands, longBands) {
        let indicesArray = [];
        for (let latNumber = 0; latNumber < latBands; latNumber++) {
            for (let longNumber = 0; longNumber < longBands; longNumber++) {
                let first = (latNumber * (longBands + 1)) + longNumber;
                let second = first + longBands + 1;

                indicesArray.push(first + 1);
                indicesArray.push(first);
                indicesArray.push(second);

                indicesArray.push(first + 1);
                indicesArray.push(second);
                indicesArray.push(second + 1);
            }
        }
        return {
            numberOfIndices: indicesArray.length / 3,
            indices: indicesArray
        };
    }

    function defineWireframeIndices(latBands, longBands) {
        let indicesArray = [];
        for (let latNumber = 0; latNumber < latBands; latNumber++) {
            for (let longNumber = 0; longNumber < longBands; longNumber++) {
                let first = (latNumber * (longBands + 1)) + longNumber;
                let second = first + longBands + 1;

                indicesArray.push(first);
                //indicesArray.push(first + 1);
                indicesArray.push(second);

                indicesArray.push(second);
                //indicesArray.push(first + 1);
                indicesArray.push(second + 1);
            }
        }
        return {
            numberOfIndices: indicesArray.length / 2,
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
        if (!wireframe) {
            gl.drawElements(gl.TRIANGLES, this.numberOfPrimitives * 3, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawElements(gl.LINES, this.numberOfPrimitives * 2, gl.UNSIGNED_SHORT, 0);
        }

        // disable attributes
        gl.disableVertexAttribArray(aVertexPositionId);
        gl.disableVertexAttribArray(aVertexNormalId);
    }

    let verticesAndTextures = defineVerticesAndTexture(radius, length, latitudeBands, longitudeBands,
        curveRadius, curveAngle);
    let indices;
    if (!wireframe) {
        indices = defineIndices(latitudeBands, longitudeBands);
    } else {
        indices = defineWireframeIndices(latitudeBands, longitudeBands);
    }

    let pipe = {};

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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices.indices), gl.STATIC_DRAW);

    pipe.numberOfPrimitives = indices.numberOfIndices;
    pipe.color = color;
    pipe.draw = draw;
    pipe.changeColor = changeColor;
    return pipe;
}