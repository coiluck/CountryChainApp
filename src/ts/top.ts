// top.ts
import { changeModal, showModal} from './modules/changeModal';
import { setUpSettings } from './settings';

document.querySelectorAll('.button-container button').forEach(button => {
  button.addEventListener('click', () => {
    switch (button.classList.value) {
      case 'achievements-button':
        showModal('achievements', null, true);
        break;
      case 'about-button':
        showModal('about', null, true);
        break;
      case 'settings-button':
        showModal('settings', null, true);
        setUpSettings();
        setTimeout(() => {
          document.querySelector('.settings-title-container')?.classList.add('active');
        }, 500);
        break;
      case 'top-button':
        changeModal('top', null, 500, true);
        // animationの停止はうまくいかないからいいや
        break;
    }
  });
});

import { startNewGame } from './game';

document.getElementById('top-start-button')?.addEventListener('click', () => {
  changeModal('game', null, 500, true);
  setTimeout(() => {
    startNewGame(); // modalが表示された後に開始しないといけない
  }, 500);
});


import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const initEarthMap = () => {
  const container = document.getElementById('top-map-container') as HTMLElement;

  if (!container) {
    console.error("Container element #top-map-container not found");
    return;
  }

  // シーンの作成
  const scene = new THREE.Scene();

  // カメラの作成
  const width = container.clientWidth;
  const height = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5); // 手前（Z軸）に配置

  // レンダラーの作成
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // 照明
  const ambientLight = new THREE.AmbientLight(0xffffff, 3.0); // 全体光
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5); // 指向性光
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  // OrbitControlsの設定
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.enableZoom = false;

  // モデルのロード
  const loader = new GLTFLoader();
  loader.load(
    '/low_poly_planet_earth.glb',
    (gltf) => {
      const model = gltf.scene;

      // モデルの位置調整
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // シーンに追加
      const group = new THREE.Group();
      group.add(model);
      scene.add(group);
    },
    undefined,
    (error) => {
      console.error('An error happened loading the GLB:', error);
    }
  );

  // アニメーションループ
  let animationId: number;

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // リサイズ対応
  const onWindowResize = () => {
    if (!container) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };

  window.addEventListener('resize', onWindowResize);

  // クリーンアップ
  // うまくいかないからつかわない
  /*
  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onWindowResize);
    container.removeChild(renderer.domElement);
    renderer.dispose();
    // シーン内のオブジェクトも解放
    scene.traverse((object) => {
      if ((object as any).isMesh) {
        (object as any).geometry.dispose();
        if ((object as any).material.map) (object as any).material.map.dispose();
        (object as any).material.dispose();
      }
    });
  };
  */
};