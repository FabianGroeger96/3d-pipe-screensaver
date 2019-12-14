//
// Windows XP 3D Pipes Screen Saver
//

window.onload = startup;

// the gl object is saved globally
var gl;

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

// defines all the render settings
const renderSettings = {
    viewPort: {
        canvasId: "canvas",
        mode: "perspective", // has no effect
        fovy: 60, // in degrees
        aspect: 1,
        near: 1,
        far: 100,
        backgroundColor: vec4.fromValues(0.1, 0.1, 0.1, 1)
    },
    camera: {
        position: vec3.fromValues(-5, 0, 0),
        lookAt: vec3.fromValues(0, 0, 0),
        rotation: vec3.fromValues(0, 0, 1)
    },
    light: {
        position: vec3.fromValues(0, 2, 0),
        color: vec3.fromValues(1, 1, 1)
    }
};

var tabIsInBackground = false;
var lastFrameTimestamp = 0;
var frameCount = -1; // Limits the frames drawn

// we keep all the parameters for drawing a specific object together
var objects = {};

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    let canvas = document.getElementById(renderSettings.viewPort.canvasId);

    gl = createGLContext(canvas);
    initGL();
    resizeWindow();

    window.addEventListener("keyup", onKeyup, false);
    window.addEventListener("keydown", onKeydown, false);
    window.addEventListener("resize", resizeWindow, false);
    window.addEventListener("visibilityChange", handleVisibilityChange, false);

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
    "use strict";
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

/**
 * Setup scene.
 */
function setUpScene() {
    let offset = 1;
    let translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, vec3.fromValues(0, offset, 0));

    objects.cube = {
        model: new SolidCubeWithNormals(gl, [[0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0]]),
        texture: createTextureFromFile("lena512.png"),
        transform: translationMatrix
    };

    translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, vec3.fromValues(0, -offset, 0));

    objects.sphere = {
        model: new SolidSphere(gl, 0.5, 30, 30, [0.3, 0.8, 0.3]),
        transform: translationMatrix
    };

    translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, vec3.fromValues(0, 3 * offset, 0));

    objects.pipe = {
        model: new SolidCurve(gl, 0.2, 1, 30, 30, [0.8, 0.8, 0.3],
            false, 0.5, Math.PI / 2),
        transform: translationMatrix
    };

    translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, vec3.fromValues(0, -3 * offset, 0));

    objects.cylinder = {
        model: new SolidPipe(gl, 0.2, 1, 16, [0.8, 0.8, 0.3]),
        texture: createTextureFromFile("candy_cane.png"),
        transform: translationMatrix
    }
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1i(ctx.uEnableLightingId, 1);
    gl.uniform3fv(ctx.uLightPositionId, renderSettings.light.position);
    gl.uniform3fv(ctx.uLightColorId, renderSettings.light.color);

    for (const [name, obj] of Object.entries(objects)) {
        // Set unique ModelViewMatrix and NormalMatrix
        let modelViewMatrix = generateModelViewMatrix(obj.transform);
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
}

function drawAnimated(timeStamp) {
    // calculate time since last call
    let elapsedTime = 0;
    if (lastFrameTimestamp !== 0) {
        elapsedTime = (timeStamp - lastFrameTimestamp) / 1000.0;
    }
    lastFrameTimestamp = timeStamp;

    // move or change objects
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

    draw();

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
