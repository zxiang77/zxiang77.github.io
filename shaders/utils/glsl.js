function initializeWebGL(canvasName) {
	var canvas = $("#" + canvasName);
    canvas.height($(window).height());
    canvas.width($(window).width());
    
	var gl = canvas[0].getContext("experimental-webgl");
	if(!gl) {
		gl = canvas.getContent("webgl");
		if(!gl) {
			alert("Could not get WebGL context!");
			throw new Error("Could not get WebGL context!");
		}
	}
	return gl;
}

function createShader(gl, shaderSource, type) {
	var shaderSource = shaderSource;
	var shaderType = null;
	shaderType = type;
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		var infoLog = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error("An error occured on compiling the shader: \n" + infoLog);
	} else {
		return shader;
	}
}

function createGlslProgram(gl, vertexShaderSource, fragmentShaderSource) {
	var program = gl.createProgram();
	gl.attachShader(program, createShader(gl, vertexShaderSource, gl.VERTEX_SHADER));
	gl.attachShader(program, createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER));

	gl.linkProgram(program);
	gl.validateProgram(program);

	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		var infoLog = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error("An error occured on linking the program: \n" + infoLog);
	} else {
		return program;
	}
}

// bind [array/element] buffers
function bindBuffer(gl, buffer, data, kind) {
    var glkind = kind == "array" ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER;
    gl.bindBuffer(glkind, buffer);
    gl.bufferData(glkind, data, gl.STATIC_DRAW);
    gl.bindBuffer(glkind, null);
}

// set up vertex attribute
function setVertexBufferAttr(gl, program, kind, buffer, attr, conf){
    var glkind = kind == "array" ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER;
    gl.bindBuffer(glkind, buffer);
    var attrLocation = gl.getAttribLocation(program, attr);
    gl.enableVertexAttribArray(attrLocation);
    gl.vertexAttribPointer(
        attrLocation, conf.unitSize, gl.FLOAT, false, conf.step, conf.offset
    );
    gl.bindBuffer(glkind, null);
}

// draw from buffer prep
function drawFromElementBuffer(buffer, numPoints, offset, drawKind){
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.drawElements(drawKind, numPoints, gl.UNSIGNED_SHORT, offset);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function drawFromArrayBuffer(buffer, numPoints, offset, drawKind){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.drawArrays(drawKind, 0, numPoints);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// draw from buffers impl
function drawTriangleFromElementBuffer(buffer, numPoints, offset){
    drawFromElementBuffer(buffer, numPoints, offset, gl.TRIANGLES);
}

function drawTriangleFromArrayBuffer(buffer, numPoints, offset){
    drawFromArrayBuffer(buffer, numPoints, offset, gl.TRIANGLES);
}

function drawLineFromArrayBuffer(buffer, numPoints, offset){
    drawFromArrayBuffer(buffer, numPoints, offset, gl.LINES);
}

function drawLineStripFromArrayBuffer(buffer, numPoints, offset){
    drawFromArrayBuffer(buffer, numPoints, offset, gl.LINE_STRIP);
}

function drawLineloopFromElementBuffer(buffer, numPoints, offset){
    drawFromElementBuffer(buffer, numPoints, offset, gl.LINE_LOOP);
}

function drawLineFromElementBuffer(buffer, numPoints, offset){
    drawFromElementBuffer(buffer, numPoints, offset, gl.LINES);
}

// set uniforms
function setUniform3f(gl, program, name, x, y, z){
    var loc = gl.getUniformLocation(program, name);
    gl.uniform3f(loc, x, y, z);
}
function setUniform2f(gl, program, name, x, y){
    var loc = gl.getUniformLocation(program, name);
    gl.uniform2f(loc, x, y);
}
function setUniform1f(gl, program, name, x){
    var loc = gl.getUniformLocation(program, name);
    gl.uniform1f(loc, x);
}
function setUniform1i(gl, program, name, x){
    var loc = gl.getUniformLocation(program, name);
    gl.uniform1i(loc, x);
}
function setUniform3fa(gl, program, name, count, data){
    for(var i=0; i<count; i++) {
       var uniformName = name+"[" + i + "]";
       setUniform3f(gl, program, uniformName, data[i*3], data[i*3+1], data[i*3+2]);
   }
}
function setUniform1fa(gl, program, name, count, data){
    for(var i=0; i<count; i++) {
       var uniformName = name+"[" + i + "]";
       setUniform1f(gl, program, uniformName, data[i]);
   }
}
function setUniform1ia(gl, program, name, count, data){
    for(var i=0; i<count; i++) {
       var uniformName = name+"[" + i + "]";
       setUniform1i(gl, program, uniformName, data[i]);
   }
}

// create/ set textures
function createTextureObj(gl, program, image) {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
}

function createTextureCube(gl, program, sky){
    // Step 1: Create the texture object.
    var texture = gl.createTexture();
    // Step 2: Bind the texture object to the "target" TEXTURE_2D
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    // Step 3: (Optional) Tell WebGL that pixels are flipped vertically,
    //         so that we don't have to deal with flipping the y-coordinate.
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    var targets = [
       gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
       gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
       gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];
    // Step 4: Download the image data to the GPU.
    for (var j = 0; j < 6; j++) {
        gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sky[j]);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    // Step 5: Creating a mipmap so that the texture can be anti-aliased.
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    // Step 6: Clean up.  Tell WebGL that we are done with the target.
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    return texture;
}

function setTextureCube(gl, program, name, texture, idx) {
	var loc = gl.getUniformLocation(program, name);
	if(loc != null) {
		gl.activeTexture(gl.TEXTURE0 + idx);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		gl.uniform1i(loc, idx);
	}
}

function setTexture(gl, program, name, texture, idx) {
	var loc = gl.getUniformLocation(program, name);
	if(loc != null) {
		gl.activeTexture(gl.TEXTURE0 + idx);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(loc, idx);
	}
}