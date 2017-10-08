var wallVertShader = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    // input
    attribute vec3 position;
    attribute vec2 uv;

    varying vec2 vUv; // UV coordinates.

    void main() {
        // Calculate projected point.
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
    }

`;