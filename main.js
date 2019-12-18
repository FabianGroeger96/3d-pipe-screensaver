//
// Windows XP 3D Pipes Screen Saver
//



window.onload = startup;

// the gl object is saved globally
var gl;
var pipes;
var pipes_step;
var pipes_appearances;
var textures;
var rotation_matrices = [];

// useful for debugging but absolutely kills performance
const enableDebugging = false;

// we keep all local parameters for the program in a single object
const ctx = {
    shaderProgram: -1,
    aVertexPositionId: -1,
    aVertexColorId: -1,
    aTextureCoordId: -1,
    aVertexNormalId: -1,
    uEnableTextureId: -1,
    uSampler2DId: -1,
    uProjectionMatId: -1,
    uModelViewMatId: -1,
    uNormalMatId: -1,
    uEnableLightingId: -1,
    uLightPositionId: -1,
    uLightColorId: -1
};

const gridSettings = {
    size: vec3.fromValues(25, 25, 25),
    numberOfPipes: 5,
    steps: 300,
    numberOfWaitElements: 100
};

// defines all the render settings
const renderSettings = {
    viewPort: {
        canvasId: "canvas",
        mode: "perspective", // has no effect
        fovy: 60, // in degrees
        aspect: 1,
        near: 1,
        far: 500,
        backgroundColor: vec4.fromValues(0.1, 0.1, 0.1, 1)
    },
    camera: {
        position: vec3.fromValues(-(gridSettings.size[0] * 0.8), 3.0, 0.0),
        lookAt: vec3.fromValues(0.0, 0.0, 0.0),
        rotation: vec3.fromValues(0.0, 0.0, 1)
    },
    light: {
        position: vec3.fromValues(0, 0, gridSettings.size[2] / 2),
        color: vec3.fromValues(1, 1, 1)
    }
};

var tabIsInBackground = false;
var lastFrameTimestamp = 0;
var frameCount = -1; // Limits the frames drawn

// we keep all the parameters for drawing a specific object together
var objects = {};

function setupRotationMatrices(){
    // PIPES
    // element = 0
    var transformationMatrix = mat4.create();
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0)));
    // element = 1
    transformationMatrix = mat4.create();
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 0));
    // element = 2
    transformationMatrix = mat4.create();
    rotation_matrices.push(mat4.rotateX(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0)));

    // SPHERE
    // element = 3
    transformationMatrix = mat4.create();
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 0));

    // CURVES
    // element = 4
    transformationMatrix = mat4.create();
    mat4.rotateY(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0));
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0)));
    // element = 5
    transformationMatrix = mat4.create();
    mat4.rotateY(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0));
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 0));
    // element = 6
    transformationMatrix = mat4.create();
    mat4.rotateY(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0));
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 270 * (Math.PI / 180.0)));
    // element = 7
    transformationMatrix = mat4.create();
    mat4.rotateY(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0));
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 180 * (Math.PI / 180.0)));

    // element = 8
    transformationMatrix = mat4.create();
    mat4.rotateX(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0));
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0)));
    // element = 9
    transformationMatrix = mat4.create();
    mat4.rotateX(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0));
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 0));
    // element = 10
    transformationMatrix = mat4.create();
    mat4.rotateX(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0));
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 180 * (Math.PI / 180.0)));
    // element = 11
    transformationMatrix = mat4.create();
    mat4.rotateX(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0));
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 270 * (Math.PI / 180.0)));

    // element = 12
    transformationMatrix = mat4.create();
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 90 * (Math.PI / 180.0)));
    // element = 13
    transformationMatrix = mat4.create();
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 270 * (Math.PI / 180.0)));
    // element = 14
    transformationMatrix = mat4.create();
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 180 * (Math.PI / 180.0)));
    // element = 15
    transformationMatrix = mat4.create();
    rotation_matrices.push(mat4.rotateZ(transformationMatrix, transformationMatrix, 0));
    console.log(rotation_matrices);
}


function drawSimpleCurveScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1i(ctx.uEnableLightingId, 1);
    gl.uniform3fv(ctx.uLightPositionId, renderSettings.light.position);
    gl.uniform3fv(ctx.uLightColorId, renderSettings.light.color);

    obj = objects.curve;

    let transformationMatrix = mat4.create();
    mat4.fromTranslation(transformationMatrix, [-gridSettings.size[0] / 2, -gridSettings.size[1] / 2, -gridSettings.size[2] / 2]);
    mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(25, 0, 25));
    mat4.multiply(transformationMatrix, transformationMatrix, rotation_matrices[9])
    let modelViewMatrix = generateModelViewMatrix(transformationMatrix);
    gl.uniformMatrix4fv(ctx.uModelViewMatId, false, modelViewMatrix);
    let normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatId, false, normalMatrix);

    // Enable or disable textures
    if (obj.texture) {
        gl.uniform1i(ctx.uEnableTextureId, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, obj.texture);
        gl.uniform1i(ctx.uSampler2DId, 0);
    } else {
        gl.uniform1i(ctx.uEnableTextureId, 0);
    }

    // Draw the object
    obj.model.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aTextureCoordId, ctx.aVertexNormalId);

}

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    let canvas = document.getElementById(renderSettings.viewPort.canvasId);

    if (enableDebugging) {
        gl = createGLContext(canvas);
    } else {
        gl = canvas.getContext("webgl");
    }
    setupRotationMatrices();
    initGL();
    resizeWindow();

    window.addEventListener("keyup", onKeyup, false);
    window.addEventListener("keydown", onKeydown, false);
    window.addEventListener("resize", resizeWindow, false);
    window.addEventListener("visibilityChange", handleVisibilityChange, false);
    //drawSimpleCurveScene();
    drawAnimated(0);
}

/**
 * Handle a visibility change. If window hidden, stop rendering and start rendering again if window visible.
 */
function handleVisibilityChange() {
    if (tabIsInBackground && document.hidden) {
        tabIsInBackground = document.hidden;
        window.requestAnimationFrame(drawAnimated);
    }

    tabIsInBackground = document.hidden;
}

/**
 * Resizes the window to the current size of the body.
 */
function resizeWindow() {
    let canvas = document.getElementById(renderSettings.viewPort.canvasId);
    setUpViewport(gl, canvas, ctx.uProjectionMatId, window.innerWidth, window.innerHeight, renderSettings.viewPort.fovy,
        renderSettings.viewPort.near, renderSettings.viewPort.far);
}

/**
 * Set all settings for the viewport. Useful for a resize event.
 */
function setUpViewport(webgl, canvas, projectionMatrixId, width, height, fov, clipNear, clipFar) {
    canvas.width = width;
    canvas.height = height;
    let aspect = width / height;
    renderSettings.viewPort.aspect = aspect;
    let projectionMat = generateProjectionMatrix(fov, aspect, clipNear, clipFar);
    webgl.uniformMatrix4fv(ctx.uProjectionMatId, false, projectionMat);
    webgl.viewport(0, 0, width, height);
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
    ctx.shaderProgram = loadAndCompileShaders(gl, 'shader/VertexShader.glsl',
        'shader/FragmentShader.glsl');
    setUpAttributesAndUniforms();
    setUpScene();

    gl.clearColor(renderSettings.viewPort.backgroundColor[0],
        renderSettings.viewPort.backgroundColor[1],
        renderSettings.viewPort.backgroundColor[2],
        renderSettings.viewPort.backgroundColor[3]);

    gl.frontFace(gl.CCW);       // Defines the orientation of front-faces
    gl.cullFace(gl.BACK);       // Defines which face should be culled
    gl.enable(gl.CULL_FACE);    // Enables culling
    gl.enable(gl.DEPTH_TEST);   // Enable z-test
}

/**
 * Generate the projection matrix depending on the selected mode
 */
function generateProjectionMatrix(fov, aspect, near, far) {
    let mat = mat4.create();
    mat4.perspective(mat, (Math.PI / 180.0) * fov, aspect, near, far);

    return mat;
}

/**
 * Combine camera matrix with current transformation matrix. Model view matrix transforms model coordinates
 * to camera coordinates.
 */
function generateModelViewMatrix(transformationMatrix) {
    let modelViewMat = mat4.create();
    mat4.lookAt(modelViewMat, renderSettings.camera.position, renderSettings.camera.lookAt,
        renderSettings.camera.rotation);
    mat4.multiply(modelViewMat, modelViewMat, transformationMatrix);

    return modelViewMat;
}

/**
 * Setup all the attribute and uniform variables.
 */
function setUpAttributesAndUniforms() {
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.aVertexColorId = gl.getAttribLocation(ctx.shaderProgram, "aVertexColor");
    ctx.aTextureCoordId = gl.getAttribLocation(ctx.shaderProgram, "aTextureCoord");
    ctx.aVertexNormalId = gl.getAttribLocation(ctx.shaderProgram, "aVertexNormal");
    ctx.uEnableTextureId = gl.getUniformLocation(ctx.shaderProgram, "uEnableTexture");
    ctx.uSampler2DId = gl.getUniformLocation(ctx.shaderProgram, "uSampler2D");
    ctx.uModelViewMatId = gl.getUniformLocation(ctx.shaderProgram, "uModelViewMat");
    ctx.uProjectionMatId = gl.getUniformLocation(ctx.shaderProgram, "uProjectionMat");
    ctx.uNormalMatId = gl.getUniformLocation(ctx.shaderProgram, "uNormalMat");
    ctx.uEnableLightingId = gl.getUniformLocation(ctx.shaderProgram, "uEnableLighting");
    ctx.uLightPositionId = gl.getUniformLocation(ctx.shaderProgram, "uLightPosition");
    ctx.uLightColorId = gl.getUniformLocation(ctx.shaderProgram, "uLightColor");
}

/**
 * Initialize texture from an image.
 */
function initTexture(image, textureObject) {
    // create a new texture
    gl.bindTexture(gl.TEXTURE_2D, textureObject);
    // set parameters for the texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    // turn texture off again
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Load an image as a texture. Works asynchronously, but returned texture can already be used.
 */
function createTextureFromFile(filename) {
    let image = new Image();
    let texture = gl.createTexture();
    image.onload = function () {
        initTexture(image, texture);
    };
    // setting the src will trigger onload
    image.src = filename;

    return texture;
}

function getAppearances(length) {
    let appearances = [];
    for (var i = 0; i < length; i++){
        let random = getRandomInt(2);
        if (random === 0) {
            let appearance = [0, getRandomInt(255) / 255,
                                getRandomInt(255) / 255,
                                getRandomInt(255) / 255];
            appearances.push(appearance)
        }
        if (random === 1){
            let texture_number = getRandomInt(textures.length);
            let appearance = [1, texture_number];
            appearances.push(appearance)
        }
    }
    return appearances;
}

/**
 * Setup scene.
 */
function setUpScene() {
    console.log("create pipes");
    pipes = getPaths(gridSettings.size, gridSettings.steps, gridSettings.numberOfPipes, gridSettings.numberOfWaitElements);
    pipes_step = 0;
    textures = [];
    textures.push(createTextureFromFile("candy_cane.png"));
    textures.push(createTextureFromFile("knitting_pattern.png"));
    textures.push(createTextureFromFile("christmas_green.jpg"));
    textures.push(createTextureFromFile("christmas_white.jpg"));
    pipes_appearances = getAppearances(pipes.length);
    console.log("pipes created");

    objects.sphere = {
        model: new SolidSphere(gl, 0.4, 16, 16, [0.3, 0.8, 0.3])
    };

    objects.pipe = {
        model: new SolidPipe(gl, 0.2, 1, 16,[0.8, 0.8, 0.3])
    };

    objects.curve = {
        model: new SolidCurve(gl, 0.2, 1, 12, 16, [0.8, 0.8, 0.3])
    };

}

/**
 * Draw the path.
 */
function drawPath() {
    for (let i = 0; i < pipes.length; i++){
        let pipe = pipes[i];
        for (let j = 0; j < pipes_step && j < pipe.length; j++){
            let element = pipe[j];
            let coords = element[0];
            let drawedObjNumber = element[1];
            let transformationMatrix = mat4.create();
            mat4.fromTranslation(transformationMatrix, [-gridSettings.size[0] / 2, -gridSettings.size[1] / 2, -gridSettings.size[2] / 2]);
            let obj = -1;
            if (drawedObjNumber !== -1) {
                mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(coords[0], coords[1], coords[2]));
                if (drawedObjNumber === 0) {
                    obj = objects.pipe;
                }
                if (drawedObjNumber === 1) {
                    obj = objects.pipe;
                }
                if (drawedObjNumber === 2) {
                    obj = objects.pipe;
                }
                if (drawedObjNumber === 3) {
                    obj = objects.sphere;
                }
                if (drawedObjNumber > 3) {
                    obj = objects.curve;
                }
                mat4.multiply(transformationMatrix, transformationMatrix, rotation_matrices[drawedObjNumber]);
                let modelViewMatrix = generateModelViewMatrix(transformationMatrix);
                gl.uniformMatrix4fv(ctx.uModelViewMatId, false, modelViewMatrix);
                let normalMatrix = mat3.create();
                mat3.normalFromMat4(normalMatrix, modelViewMatrix);
                gl.uniformMatrix3fv(ctx.uNormalMatId, false, normalMatrix);

                if (pipes_appearances[i][0] === 0){
                    obj.model.changeColor([pipes_appearances[i][0], pipes_appearances[i][1], pipes_appearances[i][2]]);
                    gl.uniform1i(ctx.uEnableTextureId, 0);
                }
                if (pipes_appearances[i][0] === 1){
                    let texture = pipes_appearances[i][1];
                    gl.uniform1i(ctx.uEnableTextureId, 1);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textures[texture]);
                    gl.uniform1i(ctx.uSampler2DId, 0);
                }
                obj.model.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aTextureCoordId, ctx.aVertexNormalId);
            }
        }
    }
}

/**
 * Draw the edges.
 */
function drawEdges() {
    let offX = gridSettings.size[0] / 2;
    let offY = gridSettings.size[1] / 2;
    let offZ = gridSettings.size[2] / 2;

    let coords = [
        [-offX, -offY, -offZ],
        [-offX, -offY, offZ],
        [-offX, offY, -offZ],
        [-offX, offY, offZ],
        [offX, -offY, -offZ],
        [offX, -offY, offZ],
        [offX, offY, -offZ],
        [offX, offY, offZ]
    ];
    for (var i = 0; i < coords.length; i++) {
        let transformationMatrix = mat4.create();
        mat4.fromTranslation(transformationMatrix, vec3.fromValues(coords[i][0], coords[i][1], coords[i][2]));
        let obj = objects.sphere;
        let modelViewMatrix = generateModelViewMatrix(transformationMatrix);
        gl.uniformMatrix4fv(ctx.uModelViewMatId, false, modelViewMatrix);
        let normalMatrix = mat3.create();
        mat3.normalFromMat4(normalMatrix, modelViewMatrix);
        gl.uniformMatrix3fv(ctx.uNormalMatId, false, normalMatrix);
        obj.model.changeColor([1, 1, 1]);
        gl.uniform1i(ctx.uEnableTextureId, 0);
        obj.model.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aTextureCoordId, ctx.aVertexNormalId);
    }
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1i(ctx.uEnableLightingId, 1);
    gl.uniform3fv(ctx.uLightPositionId, renderSettings.light.position);
    gl.uniform3fv(ctx.uLightColorId, renderSettings.light.color);
    //drawEdges();
    drawPath();
}

function drawAnimated(timeStamp) {
    // calculate time since last call
    let elapsedTime = 0;
    if (lastFrameTimestamp !== 0) {
        elapsedTime = (timeStamp - lastFrameTimestamp) / 1000.0;
    }
    lastFrameTimestamp = timeStamp;

    /*
    for (const [name, obj] of Object.entries(objects)) {
        let cubeTransform = obj.transform;
        let rotationSpeed = 180 * elapsedTime;
        if (isDown(key.LEFT)) {
            mat4.rotateX(cubeTransform, cubeTransform, rotationSpeed * (Math.PI / 180.0));
        }
        if (isDown(key.DOWN)) {
            mat4.rotateY(cubeTransform, cubeTransform, rotationSpeed * (Math.PI / 180.0));
        }
        if (isDown(key.RIGHT)) {
            mat4.rotateZ(cubeTransform, cubeTransform, rotationSpeed * (Math.PI / 180.0));
        }
        obj.transform = cubeTransform;
    }
    */
    draw();
    pipes_step++;
    if (pipes_step >= pipes[0].length) {
        setUpScene();
    }
    // request the next frame
    if (frameCount !== 0 && !tabIsInBackground) {
        window.requestAnimationFrame(drawAnimated);
        if (frameCount > 0) {
            frameCount--;
        }
    }
}

// Key Handling
const key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};

function isDown(keyCode) {
    return key._pressed[keyCode];
}

function onKeydown(event) {
    key._pressed[event.keyCode] = true;
}

function onKeyup(event) {
    delete key._pressed[event.keyCode];
}

function Sleep(milliseconds) {
   return new Promise(resolve => setTimeout(resolve, milliseconds));
}
