import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { ARButton } from 'https://unpkg.com/three@0.160.0/examples/jsm/webxr/ARButton.js';

const hint = document.getElementById('hint');
const contact = document.getElementById('contact');
const unsupported = document.getElementById('not-supported');

if (!navigator.xr) {
  unsupported.style.display = 'grid';
} else {
  init();
}

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x223344, 1.2);
  scene.add(light);

  const dir = new THREE.DirectionalLight(0xaeeaff, 0.6);
  dir.position.set(1, 2, 1);
  scene.add(dir);

  const cardGroup = buildCard();
  cardGroup.visible = false;
  scene.add(cardGroup);

  const reticleGeo = new THREE.RingGeometry(0.08, 0.1, 40).rotateX(-Math.PI / 2);
  const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8 });
  const reticle = new THREE.Mesh(reticleGeo, reticleMat);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  shadow.visible = false;
  scene.add(shadow);

  let hitTestSource = null;
  let hitTestSourceRequested = false;

  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (!reticle.visible) return;
    cardGroup.visible = true;
    shadow.visible = true;
    cardGroup.position.setFromMatrixPosition(reticle.matrix);
    cardGroup.quaternion.setFromRotationMatrix(reticle.matrix);
    cardGroup.rotateX(-Math.PI / 2);
    cardGroup.position.y += 0.12;

    shadow.position.setFromMatrixPosition(reticle.matrix);
    hint.textContent = 'Card placed. Move around to see AR depth. Tap links on right.';
    contact.classList.add('show');
  });
  scene.add(controller);

  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay'],
    domOverlay: { root: document.body }
  });
  arButton.style.position = 'fixed';
  arButton.style.bottom = '24px';
  arButton.style.left = '50%';
  arButton.style.transform = 'translateX(-50%)';
  arButton.style.zIndex = '20';
  document.body.appendChild(arButton);

  renderer.xr.addEventListener('sessionstart', () => {
    hint.textContent = 'Move phone slowly to detect a surface.';
  });

  renderer.xr.addEventListener('sessionend', () => {
    hitTestSourceRequested = false;
    hitTestSource = null;
    reticle.visible = false;
    cardGroup.visible = false;
    shadow.visible = false;
    contact.classList.remove('show');
    hint.textContent = 'Tap Start AR, move phone slowly, then tap to place card.';
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  renderer.setAnimationLoop((timestamp, frame) => {
    const elapsed = clock.getElapsedTime();
    if (cardGroup.visible) {
      cardGroup.position.y += Math.sin(elapsed * 2.0) * 0.0008;
      cardGroup.rotation.z = Math.sin(elapsed * 1.3) * 0.03;
    }

    if (frame) {
      const session = renderer.xr.getSession();
      const referenceSpace = renderer.xr.getReferenceSpace();

      if (!hitTestSourceRequested) {
        session.requestReferenceSpace('viewer').then((viewerSpace) => {
          session.requestHitTestSource({ space: viewerSpace }).then((source) => {
            hitTestSource = source;
          });
        });

        session.addEventListener('end', () => {
          hitTestSourceRequested = false;
          hitTestSource = null;
        });

        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length) {
          const pose = hitTestResults[0].getPose(referenceSpace);
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        } else {
          reticle.visible = false;
        }
      }
    }

    renderer.render(scene, camera);
  });
}

function buildCard() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.002, 0.13),
    new THREE.MeshStandardMaterial({ color: 0x050b1f, metalness: 0.2, roughness: 0.65 })
  );
  group.add(base);

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.215, 0.125),
    new THREE.MeshStandardMaterial({ color: 0x0b1533, emissive: 0x03111f, metalness: 0.1, roughness: 0.55 })
  );
  face.position.y = 0.002;
  face.rotation.x = -Math.PI / 2;
  group.add(face);

  const neonLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.215, 0.003),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.95 })
  );
  neonLine.position.set(0, 0.003, -0.061);
  neonLine.rotation.x = -Math.PI / 2;
  group.add(neonLine);

  const textTexture = makeLabelTexture();
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.095),
    new THREE.MeshBasicMaterial({ map: textTexture, transparent: true })
  );
  textPlane.position.set(0, 0.0035, 0);
  textPlane.rotation.x = -Math.PI / 2;
  group.add(textPlane);

  return group;
}

function makeLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, 'rgba(0,229,255,0.12)');
  grad.addColorStop(1, 'rgba(118,255,3,0.07)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 82px Arial';
  ctx.fillText('DINESH S', 70, 145);

  ctx.fillStyle = '#00e5ff';
  ctx.font = '600 34px Arial';
  ctx.fillText('AI & Machine Learning Engineer', 70, 215);

  ctx.fillStyle = '#9ec7ff';
  ctx.font = '500 30px Arial';
  ctx.fillText('Full-Stack Developer | Data Science Enthusiast', 70, 265);

  ctx.fillStyle = '#7e8fb2';
  ctx.font = '500 30px Arial';
  ctx.fillText('Chennai, Tamil Nadu, India', 70, 315);

  ctx.strokeStyle = 'rgba(0,229,255,0.7)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
