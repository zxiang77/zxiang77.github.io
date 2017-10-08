var skyFragmentShader = `
    precision highp float;
    uniform samplerCube skybox; // k_d, the diffuse color. Use texture2D to look up into this.

    varying vec3 vPosition;

    void main() {
        gl_FragColor = textureCube(skybox, vPosition);
    }
`;