import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const container = document.getElementById('threeContainer');
const loading = container.querySelector('.three-loading');
const status = document.getElementById('modelStatus');
const rotate = document.getElementById('rotateModel');
const wireframe = document.getElementById('wireframeModel');
const reset = document.getElementById('resetModel');
const color = document.getElementById('modelColor');

try {
  // Сцена, камера и область рисования.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08090b);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.append(renderer.domElement);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', '3D-модель. Стрелки — вращение, плюс и минус — масштаб.');

  // OrbitControls отвечает за мышь и касания.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2;
  controls.maxDistance = 12;
  controls.autoRotateSpeed = 1.6;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x434958, 3));
  const mainLight = new THREE.DirectionalLight(0xffffff, 4);
  mainLight.position.set(3, 5, 4);
  scene.add(mainLight);
  const backLight = new THREE.DirectionalLight(0xb8ff3d, 2);
  backLight.position.set(-3, 2, -2);
  scene.add(backLight);
  const grid = new THREE.GridHelper(10, 30, 0x353a32, 0x1c201c);
  scene.add(grid);

  // Все части модели используют один материал: цвет и сетка меняются сразу.
  const material = new THREE.MeshStandardMaterial({
    color: color.value,
    metalness: 0.5,
    roughness: 0.38,
  });
  const model = new THREE.Group();
  scene.add(model);
  function resetView() {
    camera.position.set(3.5, 2, 5.5);
    controls.target.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    controls.autoRotate = false;
    rotate.setAttribute('aria-pressed', 'false');
    controls.update();
  }
  resetView();

  new FBXLoader().load('models/gun_low.fbx', (object) => {
    // Центрируем модель и приводим её к размеру сцены.
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 3 / Math.max(size.x, size.y, size.z);
    object.scale.multiplyScalar(scale);
    object.position.sub(center.multiplyScalar(scale));
    object.traverse((part) => {
      if (part.isMesh) part.material = material;
    });
    model.add(object);
    grid.position.y = -size.y * scale / 2 - 0.04;
    loading.hidden = true;
    status.textContent = 'Модель загружена';
    container.dataset.loaded = 'true';
    document.querySelectorAll('.viewer-controls button, .viewer-controls input').forEach((button) => {
      button.disabled = false;
    });
  }, (progress) => {
    if (progress.total) {
      loading.textContent = 'Загрузка модели: ' + Math.round(progress.loaded / progress.total * 100) + '%';
    }
  }, () => {
    loading.textContent = 'Не удалось загрузить модель. Обновите страницу или посмотрите рендеры выше.';
    status.textContent = 'Модель недоступна';
  });

  // Кнопки управления моделью.
  rotate.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    rotate.setAttribute('aria-pressed', String(controls.autoRotate));
  });
  wireframe.addEventListener('click', () => {
    material.wireframe = !material.wireframe;
    wireframe.setAttribute('aria-pressed', String(material.wireframe));
  });
  color.addEventListener('input', () => material.color.set(color.value));
  reset.addEventListener('click', resetView);
  renderer.domElement.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowLeft': model.rotation.y -= 0.15; break;
      case 'ArrowRight': model.rotation.y += 0.15; break;
      case 'ArrowUp': model.rotation.x -= 0.15; break;
      case 'ArrowDown': model.rotation.x += 0.15; break;
      case '+':
      case '=':
      case '-': {
        const distance = camera.position.length() * (event.key === '-' ? 1.1 : 0.9);
        camera.position.setLength(Math.max(2, Math.min(12, distance)));
        break;
      }
      default: return;
    }
    event.preventDefault();
  });

  // Размер canvas меняется вместе с контейнером, в том числе после фильтрации.
  new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }).observe(container);

  // Не рисуем сцену, когда она за пределами экрана или вкладка скрыта.
  let visible = false;
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }).observe(container);
  renderer.setAnimationLoop(() => {
    if (visible && !document.hidden) {
      controls.update();
      renderer.render(scene, camera);
    }
  });
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    loading.hidden = false;
    loading.textContent = '3D-контекст потерян. Обновите страницу.';
  });
} catch (error) {
  loading.textContent = 'Не удалось запустить 3D-просмотр. Рендеры модели доступны выше.';
  status.textContent = '3D-просмотр недоступен';
  console.error(error);
}
