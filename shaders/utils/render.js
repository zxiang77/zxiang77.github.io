var wallPath = "data/wall.jpg";
var floorPath = "data/floor.jpg";
var imagePaths = [wallPath, floorPath];
var imagePathDict = { wallPath: 1, floorPath: 2};
var skyPaths = ["data/skyBox/posx.png", "data/skyBox/negx.png",
    "data/skyBox/posy.png", "data/skyBox/negy.png",
    "data/skyBox/posz.png", "data/skyBox/negz.png",];

var gl = initializeWebGL("webglCanvas");
// skybox
// skyVertexShader, skyFragmentShader
var skyProgram = createGlslProgram(gl, skyVertexShader, skyFragmentShader);

// def seeing to -z as front 
var skyVert = [
        -1, -1, -1, // left, down, back -> ldb
        1, 1, -1,   // rub
        1, 1, -1,   // ??
        -1, 1, -1, // lub
        -1, -1, 1, // ldf
        1, -1, 1,  // r
        1, 1, 1,
        -1, 1, 1,
	];

var skyInd = [
        0, 4, 5,
        0, 5, 1,
        1, 5, 6,
        1, 6, 2,
        2, 6, 7,
        2, 7, 3,
        3, 7, 4,
        3, 4, 0,
        4, 7, 6,
        4, 6, 5,
        0, 1, 2,
        0, 2, 3,
	];

var skyVertArray = new Float32Array(skyVert); // create vertex array
var skyVertBuffer = gl.createBuffer();
bindBuffer(gl, skyVertBuffer, skyVertArray, "array");

var skyIndArray = new Uint16Array(skyInd);
var skyIndBuffer = gl.createBuffer();
bindBuffer(gl, skyIndBuffer, skyIndArray, "element");

// -------------- floor ----------------
var floorProgram = createGlslProgram(gl, floorVertexShader, floorFragmentShader);

function getFloorBuffer() {
	var floorVert = [
			0, 0, 0, 0, 0, // front left
			maze.sizeX, 0, 0, maze.sizeX * 4, 0, 
			maze.sizeX, maze.sizeY, 0, maze.sizeX*4, maze.sizeY*4,
			0, maze.sizeY, 0, 0, maze.sizeY*4, // back left
		];

	var floorInd = [0, 1, 2, 0, 2, 3];
    // console.log("floorVert" );
    // console.log(floorVert);
	var floorVertArray = new Float32Array(floorVert);
	var floorVertBuffer = gl.createBuffer();
	bindBuffer(gl, floorVertBuffer, floorVertArray, "array");

	var floorIndArray = new Uint16Array(floorInd);
	var floorIndBuffer = gl.createBuffer();
	bindBuffer(gl, floorIndBuffer, floorIndArray, "element");
	return {
		"vertBuffer" : floorVertBuffer,
		"indBuffer" : floorIndBuffer
	};
}

// ------------- walls ---------------

var wallProgram =
    createGlslProgram(gl, wallVertShader, wallFragmentShader);


function getNeighWalls(x, y) {
    var neighWalls = [0, 0, 0, 0]; // l, u, r, b
    // left
    if (x == 0 || maze.data[x-1][y] == 1) {
        neighWalls[0] = 1;
    }
    // up
    if (y == maze.sizeY-1 || maze.data[x][y+1] == 1) {
        neighWalls[1] = 1;
    }
    // right
    if (x == maze.sizeX-1 || maze.data[x+1][y] == 1) {
        neighWalls[2] = 1;
    }
    // bottowm
    if (y == 0 || maze.data[x][y-1] == 1) {
        neighWalls[3] = 1;
    }
    return neighWalls;
}

function getWallBuffer() {
    var wallVert = [];
    var n = 0;
    var wallInd = [];
    for (var x = 0; x < maze.sizeX; x++) {
        for (var y = 0; y < maze.sizeY; y++) {
            if (maze.data[x][y] == 0) {
                var neighWalls = getNeighWalls(x, y);
                // a wall on the left
                if (neighWalls[0] == 1) {
                    wallVert = wallVert.concat(
                        [x, y, 1, 0, 0],  //lt
                        [x, y+1, 1, 5, 0],  //rt
                        [x, y+1, 0, 5, 5], //rb
                        [x, y, 0, 0, 5] //lb
                    );
                    wallInd = wallInd.concat([n, n+3, n+1], [n+1, n+3, n+2]);
                    n += 4;
                }
                // a wall on the top
                if (neighWalls[1] == 1) {
                    wallVert = wallVert.concat(
                        [x, y+1, 1, 0, 0],  //lt
                        [x+1, y+1, 1, 5, 0],  //rt
                        [x+1, y+1, 0, 5, 5], //rb
                        [x, y+1, 0, 0, 5] //lb
                    );
                    wallInd = wallInd.concat([n, n+3, n+1], [n+1, n+3, n+2]);
                    n += 4;
                }
                // a wall on the right
                if (neighWalls[2] == 1) {
                    wallVert = wallVert.concat(
                        [x+1, y+1, 1, 0, 0],  //lt
                        [x+1, y, 1, 5, 0],  //rt
                        [x+1, y, 0, 5, 5], //rb
                        [x+1, y+1, 0, 0, 5] //lb
                    );
                    wallInd = wallInd.concat([n, n+3, n+1], [n+1, n+3, n+2]);
                    n += 4;
                }
                // a wall on the bottom
                if (neighWalls[3] == 1) {
                    wallVert = wallVert.concat(
                        [x+1, y, 1, 0, 0],  //lt
                        [x, y, 1, 5, 0],  //rt
                        [x, y, 0, 5, 5], //rb
                        [x+1, y, 0, 0, 5] //lb
                    );
                    wallInd = wallInd.concat([n, n+3, n+1], [n+1, n+3, n+2]);
                    n += 4;
                }
            }
        }
    }

    var wallVertArray = new Float32Array(wallVert);
    var wallVertBuffer = gl.createBuffer();
    bindBuffer(gl, wallVertBuffer, wallVertArray, "array");

    var wallIndArray = new Uint16Array(wallInd);
    var wallIndBuffer = gl.createBuffer();
    bindBuffer(gl, wallIndBuffer, wallIndArray, "element");
    return {
        "vertBuffer": wallVertBuffer,
        "indBuffer": wallIndBuffer,
        "vertCount": n,
        "faceCount": n / 2,
    };
}

// ---------- @draw function -------------


function drawSky(vbuf, ibuf, gl, program, attrName, length){
    setVertexBufferAttr(gl, program, "array", vbuf, attrName, {
        unitSize : 3,
        step     : 3*4,
        offset   : 0,
    });
    drawTriangleFromElementBuffer(ibuf, length, 0);
}

function drawSquares(vbuf, ibuf, gl, program, posAttrName, uvAttrName, length){
    setVertexBufferAttr(gl, program, "array", vbuf, posAttrName, {
        unitSize : 3,
        step     : 4*5,
        offset   : 0,
    });
    setVertexBufferAttr(gl, program, "array", vbuf, uvAttrName, {
        unitSize : 2,
        step     : 4*5,
        offset   : 4*3,
    });
    drawTriangleFromElementBuffer(ibuf, length, 0);
}

var skyPer = mat4.create();
mat4.perspective(skyPer, 85 * Math.PI / 180.0, 4.0 / 3.0, 0.1, 5.0);

// -------- drawing logic ------------
function runWebGL(images, skys) {
	var skyTextureCube = createTextureCube(gl, skyProgram, skys);
	var wallTexture = createTextureObj(gl, wallProgram, images[wallPath]);
	var floorTexture = createTextureObj(gl, floorProgram, images[floorPath]);

	function updateWebGL(time) {
		camera.moveEye();
		camera.updateEyeMatrix();
		gl.clearColor(0.3, 0.7, 1.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.disable(gl.DEPTH_TEST);

		// draw sky
		gl.useProgram(skyProgram);
        var mvloc = gl.getUniformLocation(skyProgram, "modelViewMatrix");
        var projloc = gl.getUniformLocation(skyProgram, "projectionMatrix");
        gl.uniformMatrix4fv(projloc, false, skyPer);
        gl.uniformMatrix4fv(mvloc, false, camera.MfixedObjview);
        setTextureCube(gl, skyProgram, "skybox", skyTextureCube, 0)

		drawSky(
			skyVertBuffer, 
			skyIndBuffer,
			gl, 
			skyProgram,
			"position",
			36
		);

		gl.depthFunc(gl.LESS);
		gl.enable(gl.DEPTH_TEST);

		// draw floor
        gl.useProgram(floorProgram);
        var mvloc = gl.getUniformLocation(floorProgram, "modelViewMatrix");
        var projloc = gl.getUniformLocation(floorProgram, "projectionMatrix");
        gl.uniformMatrix4fv(projloc, false, camera.Mper);
        gl.uniformMatrix4fv(mvloc, false, camera.Mobjview);
        setTexture(gl, floorProgram, "floorTexture", floorTexture, 1);
        var floorBufs = getFloorBuffer();
        drawSquares(
            floorBufs["vertBuffer"],
            floorBufs["indBuffer"],
            gl,
            floorProgram,
            "position",
            "uv",
            6
        );

        // draw wall
        var wallData = getWallBuffer();
        var wallVertBuffer = wallData["vertBuffer"];
        var wallIndBuffer = wallData["indBuffer"];

        var nFaces = wallData["faceCount"] * 3;

        gl.useProgram(wallProgram);
        var mvloc = gl.getUniformLocation(wallProgram, "modelViewMatrix");
        var projloc = gl.getUniformLocation(wallProgram, "projectionMatrix");
        gl.uniformMatrix4fv(projloc, false, camera.Mper);
        gl.uniformMatrix4fv(mvloc, false, camera.Mobjview);
        setTexture(gl, wallProgram, "wallTexture", wallTexture, 2);
        drawSquares(
            wallVertBuffer,
            wallIndBuffer,
            gl,
            wallProgram,
            "position",
            "uv",
            nFaces
        );
        window.requestAnimationFrame(updateWebGL);

	}

	window.requestAnimationFrame(updateWebGL);

}

function loadImage(paths, idx, images, skys){
    var path = paths[idx];
    var image = new Image();
    images[path] = image;
    image.onload = function() {
        if (idx + 1 >= paths.length){
            runWebGL(images, skys);
        }else{
            loadImage(paths, idx + 1, images, skys);
        }
    };
    image.src = path;
}

function loadSky(skyPaths, idx, images, paths){
    var path = skyPaths[idx];
    var image = new Image();
    images[idx] = image;
    image.onload = function() {
        if (idx + 1 >= skyPaths.length){
            loadImage(paths, 0, {}, images);
        }
        else{
            loadSky(skyPaths, idx + 1, images, paths);
        }
    };
    image.src = path;
}


function loadAll(skyPaths, paths) {
	loadSky(skyPaths, 0, new Array(6), paths);
}

function startWebGL() {
	loadAll(skyPaths, imagePaths);
}

startWebGL();