const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 1000;
let width, height;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 1.5 + 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 0.005 + 0.001;
    this.distance = Math.random() * 100 + 50;
  }

  update(time) {
    this.x += Math.cos(this.angle + time * this.speed) * 0.5;
    this.y += Math.sin(this.angle + time * this.speed) * 0.5;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    const isLightMode = document.body.classList.contains('light');
    ctx.fillStyle = isLightMode
      ? "rgba(0, 0, 0, 0.1)"
      : "rgba(255, 255, 255, 0.2)";
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animateParticles(time) {
  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    p.update(time);
    p.draw();
  }
  requestAnimationFrame(animateParticles);
}
requestAnimationFrame(animateParticles);

// Theme Switcher Logic
const themeButtons = document.querySelectorAll('.theme-btn');

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;

    if (theme === 'mono') {
      document.body.classList.toggle('mono');
    } else {
      document.body.classList.remove('dark', 'light');
      document.body.classList.add(theme);
    }

    themeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ctx.clearRect(0, 0, width, height); 
  });
});

// Three.js Shader Background 
const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(0.0);
  color.r = smoothstep(0.2, 0.8, abs(sin(u_time * 0.3 + st.x * 3.1415)));
  color.g = smoothstep(0.2, 0.8, abs(sin(u_time * 0.4 + st.y * 3.1415)));
  color.b = smoothstep(0.2, 0.8, abs(sin(u_time * 0.2 + (st.x + st.y) * 3.1415)));
  gl_FragColor = vec4(color, 1.0);
}
`;

let scene, camera, renderer, uniforms;

function initShaderCanvas() {
  const shaderCanvas = document.createElement('canvas');
  shaderCanvas.id = 'shaderCanvas';
  shaderCanvas.style.position = 'fixed';
  shaderCanvas.style.top = 0;
  shaderCanvas.style.left = 0;
  shaderCanvas.style.width = '100%';
  shaderCanvas.style.height = '100%';
  shaderCanvas.style.zIndex = '-3';
  document.body.appendChild(shaderCanvas);

  scene = new THREE.Scene();
  camera = new THREE.Camera();
  camera.position.z = 1;

  renderer = new THREE.WebGLRenderer({ canvas: shaderCanvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  uniforms = {
    u_time: { value: 1.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
  });

  animateShader();
}

function animateShader() {
  requestAnimationFrame(animateShader);
  uniforms.u_time.value += 0.01;
  renderer.render(scene, camera);
}

initShaderCanvas(); 
