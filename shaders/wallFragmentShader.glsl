var wallFragmentShader = `
    precision highp float;
    uniform sampler2D wallTexture; // k_d, the diffuse color. Use texture2D to look up into this.

    varying vec2 vUv; // UV coordinates.

    void main() {
       vec4 kd = texture2D(wallTexture, vUv);
        // vec4 error = vec4(1.0, 0.0, 0.0, 0.0);
       gl_FragColor = kd;
    }
`;