// static/main.js
class Visualizer {
    constructor(audioElement) {
        this.audioElement = audioElement;
        this.particleSystem = null;

        this.initScene();
        this.initAudio();
        this.animate();
    }

    initScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 250;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Particle system setup
        const particleCount = 20000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 200;
            velocities[i] = (Math.random() - 0.5) * 0.1;
            colors[i] = Math.random();
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.7
        });

        this.particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particleSystem);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }

    initAudio() {
        // Web Audio API setup [5]
        const audioContext = new (window.AudioContext |

| window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(this.audioElement);
        this.analyser = audioContext.createAnalyser();

        source.connect(this.analyser);
        this.analyser.connect(audioContext.destination);

        this.analyser.fftSize = 256; // Fast Fourier Transform size [3]
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
    }

    // This is your original function, integrated into the class.
    updateParticles(bass, mid, treble) {
        if (!this.particleSystem) return;

        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        const velocities = this.particleSystem.geometry.attributes.velocity.array;

        // --- This is the "unfinished" part you were likely missing ---
        // We add color and more dynamic movement based on frequencies.
        const bassColor = bass / 255;
        const midColor = mid / 255;
        const trebleColor = treble / 255;
        // --- End of new logic ---

        for (let i = 0; i < positions.length; i += 3) {
            const liquidForce = (bass + mid + treble) / 255 * 0.2; // Normalized force

            velocities[i] += (Math.random() - 0.5) * liquidForce;
            velocities[i + 1] += (Math.random() - 0.5) * liquidForce;
            velocities[i + 2] += (Math.random() - 0.5) * liquidForce;

            // Apply some damping to velocities
            velocities[i] *= 0.98;
            velocities[i + 1] *= 0.98;
            velocities[i + 2] *= 0.98;

            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // Update colors based on frequency
            colors[i] = bassColor;     // Red channel for bass
            colors[i + 1] = midColor;  // Green channel for mid
            colors[i + 2] = trebleColor; // Blue channel for treble

            // Keep particles within boundaries
            if (Math.abs(positions[i]) > 150) velocities[i] *= -0.9;
            if (Math.abs(positions[i + 1]) > 150) velocities[i + 1] *= -0.9;
            if (Math.abs(positions[i + 2]) > 150) velocities[i + 2] *= -0.9;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true; // Important!
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);

            // Calculate average frequency values for bass, mid, and treble [6]
            const bass = this.dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
            const mid = this.dataArray.slice(32, 64).reduce((a, b) => a + b, 0) / 32;
            const treble = this.dataArray.slice(64, 128).reduce((a, b) => a + b, 0) / 64;

            this.updateParticles(bass, mid, treble);
        }

        // Add some rotation for more visual interest
        if (this.particleSystem) {
            this.particleSystem.rotation.y += 0.0005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the visualizer once the window loads
window.onload = () => {
    const audioElement = document.getElementById('audioPlayer');
    new Visualizer(audioElement);
};
