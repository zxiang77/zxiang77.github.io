var skyVertexShader = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    // input
    attribute vec3 position;

    varying vec3 vPosition;

    void main() {
        // Calculate projected point.
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vPosition = vec3(position.x, position.z, -position.y);
    }
`;