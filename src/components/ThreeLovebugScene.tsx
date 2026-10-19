import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Sparkles, Heart, Flower2, Eye, EyeOff, RotateCw, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface ThreeLovebugSceneProps {
  onClose?: () => void;
  isOpenAsModal?: boolean;
}

export const ThreeLovebugScene: React.FC<ThreeLovebugSceneProps> = ({
  onClose,
  isOpenAsModal = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [currentMood, setCurrentMood] = useState<'daylight' | 'sunset' | 'candlelight'>('daylight');
  const [mascotAction, setMascotAction] = useState<string>('Happy & Relaxed');

  // Mutable refs for Three.js animation and interaction loop (zero GC inside tick)
  const sceneRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    characterGroup?: THREE.Group;
    wingsGroup?: THREE.Group;
    rubyHeart?: THREE.Mesh;
    keyLight?: THREE.DirectionalLight;
    hemiLight?: THREE.HemisphereLight;
    particlesMesh?: THREE.InstancedMesh;
    targetRotationY: number;
    currentRotationY: number;
    targetRotationX: number;
    currentRotationX: number;
    actionTimer: number;
    isPatted: boolean;
    isSpinning: boolean;
  }>({
    targetRotationY: 0,
    currentRotationY: 0,
    targetRotationX: 0,
    currentRotationX: 0,
    actionTimer: 0,
    isPatted: false,
    isSpinning: false,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfb, 0xe8, 0xee); // Match #FBE8EE
    scene.fog = new THREE.Fog(0xfbe8ee, 8, 22);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.3, 5.2);
    camera.lookAt(0, 0.6, 0);

    // 2. Modern Renderer & Color Pipeline (ACESFilmic + sRGB)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 3. Mandatory Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting Rig (Warm Key Light, Cool/Blush Fill, Rim)
    const keyLight = new THREE.DirectionalLight(0xfff6ec, 2.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    const d = 2.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xfff0f5, 0xe8d5df, 1.2);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0xffdbe8, 1.0);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // 5. Contact Shadow Grounding Plane (flush with ground)
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    // Procedural soft radial gradient shadow texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const grad = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(84, 43, 61, 0.45)');
    grad.addColorStop(0.5, 'rgba(84, 43, 61, 0.18)');
    grad.addColorStop(1, 'rgba(84, 43, 61, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005; // avoid Z-fighting
    scene.add(contactShadow);

    // 6. Composite 3–12 Part Procedural Model: 3D Kawaii Lovebug
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, 0, 0); // pivoted flush with ground

    // PBR Material Palette
    const furMat = new THREE.MeshStandardMaterial({
      color: 0xfff6ec, // warm ivory fur
      roughness: 0.88,
      metalness: 0.02,
    });
    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xfcc7d6, // blush pink
      roughness: 0.65,
      metalness: 0.05,
    });
    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf58aa7, // rosy cheeks
      roughness: 0.5,
      metalness: 0.0,
      transparent: true,
      opacity: 0.8,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x22171d,
      roughness: 0.1,
      metalness: 0.25,
    });
    const eyeSparkleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x42232f,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Part 1: Body (Primary silhouette - soft pear shape)
    const bodyGeo = new THREE.SphereGeometry(0.55, 32, 28);
    bodyGeo.scale(1, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, furMat);
    bodyMesh.position.y = 0.65;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    characterGroup.add(bodyMesh);

    // Part 2: Head (Chubby cheeks)
    const headGeo = new THREE.SphereGeometry(0.52, 32, 28);
    headGeo.scale(1.1, 0.98, 1.02);
    const headMesh = new THREE.Mesh(headGeo, furMat);
    headMesh.position.set(0, 1.35, 0.05);
    headMesh.castShadow = true;
    characterGroup.add(headMesh);

    // Part 3: Left & Right Floppy Ears (Secondary detail)
    const earGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.55, 16);
    earGeo.scale(1, 1, 0.5);
    const leftEar = new THREE.Mesh(earGeo, furMat);
    leftEar.position.set(-0.48, 1.38, 0);
    leftEar.rotation.z = 0.45;
    leftEar.rotation.x = -0.15;
    leftEar.castShadow = true;
    characterGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, furMat);
    rightEar.position.set(0.48, 1.38, 0);
    rightEar.rotation.z = -0.45;
    rightEar.rotation.x = -0.15;
    rightEar.castShadow = true;
    characterGroup.add(rightEar);

    // Inner ear patches
    const innerEarGeo = new THREE.CylinderGeometry(0.08, 0.16, 0.46, 16);
    innerEarGeo.scale(1, 1, 0.3);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
    leftInnerEar.position.set(-0.49, 1.37, 0.06);
    leftInnerEar.rotation.z = 0.45;
    characterGroup.add(leftInnerEar);

    const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
    rightInnerEar.position.set(0.49, 1.37, 0.06);
    rightInnerEar.rotation.z = -0.45;
    characterGroup.add(rightInnerEar);

    // Part 4: Twinkling Eyes
    const eyeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.19, 1.38, 0.5);
    characterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.19, 1.38, 0.5);
    characterGroup.add(rightEye);

    // Eye sparkles
    const sparkleGeo = new THREE.SphereGeometry(0.02, 12, 12);
    const leftSparkle = new THREE.Mesh(sparkleGeo, eyeSparkleMat);
    leftSparkle.position.set(-0.17, 1.41, 0.55);
    characterGroup.add(leftSparkle);

    const rightSparkle = new THREE.Mesh(sparkleGeo, eyeSparkleMat);
    rightSparkle.position.set(0.21, 1.41, 0.55);
    characterGroup.add(rightSparkle);

    // Part 5: Blushing Cheeks
    const blushGeo = new THREE.CircleGeometry(0.08, 16);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.28, 1.28, 0.5);
    leftBlush.rotation.y = -0.3;
    characterGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.28, 1.28, 0.5);
    rightBlush.rotation.y = 0.3;
    characterGroup.add(rightBlush);

    // Part 6: Cute Button Nose & Snout
    const noseGeo = new THREE.SphereGeometry(0.045, 16, 16);
    noseGeo.scale(1.2, 0.9, 0.9);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 1.32, 0.55);
    characterGroup.add(nose);

    // Part 7: Curly Heart Antennae (Accent detail)
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0xdeb8cb,
      roughness: 0.4,
      metalness: 0.2,
    });
    const antennaHeartMat = new THREE.MeshStandardMaterial({
      color: 0xff6b97,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x4a1827,
    });

    const createAntenna = (isLeft: boolean) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(isLeft ? -0.12 : 0.12, 1.75, 0),
        new THREE.Vector3(isLeft ? -0.35 : 0.35, 2.05, 0.05),
        new THREE.Vector3(isLeft ? -0.22 : 0.22, 2.2, 0.08)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.018, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, antennaMat);
      characterGroup.add(tubeMesh);

      // Mini heart on tip
      const heartShape = new THREE.Shape();
      const x = 0, y = 0;
      heartShape.moveTo(x + 0.025, y + 0.025);
      heartShape.bezierCurveTo(x + 0.025, y + 0.025, x + 0.02, y, x, y);
      heartShape.bezierCurveTo(x - 0.03, y, x - 0.03, y + 0.035, x - 0.03, y + 0.035);
      heartShape.bezierCurveTo(x - 0.03, y + 0.055, x - 0.015, y + 0.077, x + 0.025, y + 0.095);
      heartShape.bezierCurveTo(x + 0.065, y + 0.077, x + 0.08, y + 0.055, x + 0.08, y + 0.035);
      heartShape.bezierCurveTo(x + 0.08, y + 0.035, x + 0.08, y, x + 0.05, y);
      heartShape.bezierCurveTo(x + 0.035, y, x + 0.025, y + 0.025, x + 0.025, y + 0.025);

      const tipExtrude = new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.02,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.008,
        bevelThickness: 0.008,
      });
      tipExtrude.center();
      const tipMesh = new THREE.Mesh(tipExtrude, antennaHeartMat);
      tipMesh.scale.set(1.5, 1.5, 1.5);
      tipMesh.position.set(isLeft ? -0.22 : 0.22, 2.22, 0.08);
      tipMesh.rotation.z = isLeft ? 0.2 : -0.2;
      characterGroup.add(tipMesh);
    };
    createAntenna(true);
    createAntenna(false);

    // Part 8: Fluttery Iridescent Wings (MeshPhysicalMaterial with transmission)
    const wingsGroup = new THREE.Group();
    wingsGroup.position.set(0, 0.9, -0.42);

    const wingMat = new THREE.MeshPhysicalMaterial({
      color: 0xffd9e8,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.75,
      thickness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });

    const createWingShape = () => {
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.quadraticCurveTo(0.4, 0.5, 0.65, 0.35);
      s.quadraticCurveTo(0.8, 0.1, 0.6, -0.15);
      s.quadraticCurveTo(0.3, -0.3, 0, 0);
      return s;
    };

    const wingGeo = new THREE.ExtrudeGeometry(createWingShape(), {
      depth: 0.015,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    });

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.scale.set(0.8, 0.8, 0.8);
    leftWing.position.set(-0.05, 0, 0);
    leftWing.rotation.y = -0.4;
    wingsGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.scale.set(-0.8, 0.8, 0.8);
    rightWing.position.set(0.05, 0, 0);
    rightWing.rotation.y = 0.4;
    wingsGroup.add(rightWing);

    characterGroup.add(wingsGroup);

    // Part 9: Procedural 3D Faceted Ruby Heart held by paws
    const rubyHeartShape = new THREE.Shape();
    rubyHeartShape.moveTo(0, 0);
    rubyHeartShape.bezierCurveTo(0, 0.12, -0.15, 0.28, -0.3, 0.28);
    rubyHeartShape.bezierCurveTo(-0.48, 0.28, -0.58, 0.15, -0.58, -0.05);
    rubyHeartShape.bezierCurveTo(-0.58, -0.25, -0.35, -0.5, 0, -0.75);
    rubyHeartShape.bezierCurveTo(0.35, -0.5, 0.58, -0.25, 0.58, -0.05);
    rubyHeartShape.bezierCurveTo(0.58, 0.15, 0.48, 0.28, 0.3, 0.28);
    rubyHeartShape.bezierCurveTo(0.15, 0.28, 0, 0.12, 0, 0);

    const heartExtrude = new THREE.ExtrudeGeometry(rubyHeartShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.05,
      bevelThickness: 0.06,
    });
    heartExtrude.center();

    const rubyHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0xeb3b5a, // strawberry ruby red
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color(0xff4d6d),
      attenuationDistance: 1.2,
    });
    const rubyHeart = new THREE.Mesh(heartExtrude, rubyHeartMat);
    rubyHeart.scale.set(0.55, 0.55, 0.55);
    rubyHeart.position.set(0, 0.72, 0.48);
    rubyHeart.rotation.x = 0.15;
    rubyHeart.castShadow = true;
    characterGroup.add(rubyHeart);

    // Part 10: Front Paws supporting the heart
    const pawGeo = new THREE.SphereGeometry(0.12, 16, 16);
    pawGeo.scale(1, 0.75, 1.2);
    const leftPaw = new THREE.Mesh(pawGeo, furMat);
    leftPaw.position.set(-0.25, 0.65, 0.5);
    leftPaw.rotation.y = 0.3;
    characterGroup.add(leftPaw);

    const rightPaw = new THREE.Mesh(pawGeo, furMat);
    rightPaw.position.set(0.25, 0.65, 0.5);
    rightPaw.rotation.y = -0.3;
    characterGroup.add(rightPaw);

    // Part 11: Daisy Blossom tucked by the ear
    const daisyGroup = new THREE.Group();
    daisyGroup.position.set(-0.38, 1.62, 0.2);
    daisyGroup.scale.set(0.14, 0.14, 0.14);
    daisyGroup.rotation.z = 0.5;

    // Pistil
    const pistilGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const pistilMat = new THREE.MeshStandardMaterial({
      color: 0xfecb38,
      roughness: 0.4,
    });
    daisyGroup.add(new THREE.Mesh(pistilGeo, pistilMat));

    // Petals
    const petalGeo = new THREE.ConeGeometry(0.12, 0.5, 12);
    petalGeo.scale(1, 1, 0.3);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0);
      petal.rotation.z = angle - Math.PI / 2;
      daisyGroup.add(petal);
    }
    characterGroup.add(daisyGroup);

    scene.add(characterGroup);

    // 7. InstancedMesh for floating decorative hearts & petals (> 20 items)
    const particleCount = 28;
    const miniHeartGeo = new THREE.ExtrudeGeometry(rubyHeartShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSize: 0.015,
      bevelThickness: 0.015,
      bevelSegments: 2,
    });
    miniHeartGeo.center();
    miniHeartGeo.scale(0.15, 0.15, 0.15);

    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xff70a6,
      roughness: 0.3,
      metalness: 0.1,
    });
    const particlesMesh = new THREE.InstancedMesh(miniHeartGeo, particleMat, particleCount);
    particlesMesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const particleData: Array<{
      x: number;
      y: number;
      z: number;
      speed: number;
      rotSpeed: number;
      phase: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.3;
      const radius = 1.3 + Math.random() * 1.5;
      const p = {
        x: Math.cos(angle) * radius,
        y: 0.2 + Math.random() * 2.2,
        z: Math.sin(angle) * radius,
        speed: 0.2 + Math.random() * 0.3,
        rotSpeed: 0.5 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
      };
      particleData.push(p);

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      particlesMesh.setMatrixAt(i, dummy.matrix);
    }
    particlesMesh.instanceMatrix.needsUpdate = true;
    scene.add(particlesMesh);

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // Store references
    sceneRef.current = {
      renderer,
      scene,
      camera,
      characterGroup,
      wingsGroup,
      rubyHeart,
      keyLight,
      hemiLight,
      particlesMesh,
      targetRotationY: 0,
      currentRotationY: 0,
      targetRotationX: 0,
      currentRotationX: 0,
      actionTimer: 0,
      isPatted: false,
      isSpinning: false,
    };

    // 8. Interaction handling (Pointer drag & hover parallax)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        sceneRef.current.targetRotationY += dx * 0.008;
        sceneRef.current.targetRotationX = Math.max(
          -0.4,
          Math.min(0.4, sceneRef.current.targetRotationX + dy * 0.005)
        );
      } else {
        // Subtle pointer parallax when floating over canvas
        const normX = (e.clientX / width - 0.5) * 2;
        const normY = (e.clientY / height - 0.5) * 2;
        sceneRef.current.targetRotationY = normX * 0.35;
        sceneRef.current.targetRotationX = normY * 0.15;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 9. Lossless 60fps Loop with Exponential Damping (1 - Math.exp(-k * dt))
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = sceneRef.current;
      if (!state.characterGroup) return;

      // Exponential damping on rotation
      const dampingFactor = 1 - Math.exp(-7 * dt);
      state.currentRotationY += (state.targetRotationY - state.currentRotationY) * dampingFactor;
      state.currentRotationX += (state.targetRotationX - state.currentRotationX) * dampingFactor;

      if (state.isSpinning) {
        state.targetRotationY += 5 * dt;
      }

      state.characterGroup.rotation.y = state.currentRotationY;
      state.characterGroup.rotation.x = state.currentRotationX;

      // Gentle breathing & floating bob
      const breath = Math.sin(time * 0.0025);
      state.characterGroup.position.y = breath * 0.04;

      // Flutter wings with sine wave
      if (state.wingsGroup) {
        state.wingsGroup.children[0].rotation.y = -0.3 + Math.sin(time * 0.015) * 0.35;
        state.wingsGroup.children[1].rotation.y = 0.3 - Math.sin(time * 0.015) * 0.35;
      }

      // Ruby heart subtle pulse and float
      if (state.rubyHeart) {
        const heartPulse = 1 + Math.sin(time * 0.005) * 0.05;
        state.rubyHeart.scale.set(
          0.55 * heartPulse,
          0.55 * heartPulse,
          0.55 * heartPulse
        );
      }

      // Animate floating instanced hearts
      if (state.particlesMesh) {
        for (let i = 0; i < particleCount; i++) {
          const p = particleData[i];
          p.y += p.speed * dt;
          if (p.y > 2.8) p.y = 0.1;

          dummy.position.set(
            p.x + Math.sin(time * 0.002 + p.phase) * 0.1,
            p.y,
            p.z + Math.cos(time * 0.002 + p.phase) * 0.1
          );
          dummy.rotation.y = time * 0.001 * p.rotSpeed + p.phase;
          dummy.rotation.x = Math.sin(time * 0.001 + p.phase) * 0.3;
          dummy.updateMatrix();
          state.particlesMesh.setMatrixAt(i, dummy.matrix);
        }
        state.particlesMesh.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Lighting mood changes
  const applyMood = (mood: 'daylight' | 'sunset' | 'candlelight') => {
    setCurrentMood(mood);
    sound.playSoftTap();
    const state = sceneRef.current;
    if (!state.keyLight || !state.hemiLight || !state.scene) return;

    if (mood === 'daylight') {
      state.keyLight.color.setHex(0xfff6ec);
      state.keyLight.intensity = 2.2;
      state.hemiLight.color.setHex(0xfff0f5);
      state.hemiLight.groundColor.setHex(0xe8d5df);
      state.scene.background = new THREE.Color(0xfbe8ee);
      state.scene.fog = new THREE.Fog(0xfbe8ee, 8, 22);
    } else if (mood === 'sunset') {
      state.keyLight.color.setHex(0xffaa88);
      state.keyLight.intensity = 2.5;
      state.hemiLight.color.setHex(0xffccd5);
      state.hemiLight.groundColor.setHex(0x9d5b7a);
      state.scene.background = new THREE.Color(0xf5d0d9);
      state.scene.fog = new THREE.Fog(0xf5d0d9, 7, 20);
    } else if (mood === 'candlelight') {
      state.keyLight.color.setHex(0xffb86c);
      state.keyLight.intensity = 1.9;
      state.hemiLight.color.setHex(0xffd1dc);
      state.hemiLight.groundColor.setHex(0x4a2536);
      state.scene.background = new THREE.Color(0xedd3dd);
      state.scene.fog = new THREE.Fog(0xedd3dd, 6, 18);
    }
  };

  // Character actions
  const triggerAction = (action: 'pat' | 'hearts' | 'spin') => {
    sound.playSoftTap();
    const state = sceneRef.current;
    if (action === 'pat') {
      setMascotAction('Patted! Blushing happily 🌸');
      sound.playCelebration();
      if (state.characterGroup) {
        state.characterGroup.scale.set(1.08, 0.92, 1.08);
        setTimeout(() => {
          if (state.characterGroup) state.characterGroup.scale.set(1, 1, 1);
        }, 300);
      }
    } else if (action === 'hearts') {
      setMascotAction('Sending romantic sparkles! 💖');
      sound.playCelebration();
      if (state.rubyHeart) {
        state.rubyHeart.scale.set(0.75, 0.75, 0.75);
        setTimeout(() => {
          if (state.rubyHeart) state.rubyHeart.scale.set(0.55, 0.55, 0.55);
        }, 400);
      }
    } else if (action === 'spin') {
      state.isSpinning = !state.isSpinning;
      setMascotAction(state.isSpinning ? 'Twirling in joy! 💫' : 'Slowed down 💕');
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${isOpenAsModal ? 'fixed inset-0 z-50 bg-[#FBE8EE]' : 'min-h-[500px]'}`}>
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto bg-[#FFFDF7]/95 border border-[#F0D5DF] shadow-sm rounded-full px-4 py-1.5 flex items-center gap-2">
          <span className="text-sm font-bold text-[#E66B9A] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#E66B9A]" />
            3D Lovebug Companion
          </span>
          <span className="text-xs text-[#8C6A79] hidden sm:inline">• Drag to rotate</span>
        </div>

        {onClose && (
          <button
            onClick={() => {
              sound.playSoftTap();
              onClose();
            }}
            className="pointer-events-auto bg-[#FFFDF7] hover:bg-[#F8DCE6] text-[#542B3D] border border-[#F0D5DF] rounded-full p-2.5 shadow-sm transition-all"
            aria-label="Close 3D View"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Collapsible Viewport-First Bottom Control Dock (<= 15% viewport footprint) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-[580px] z-20 transition-all duration-300 ${
          isControlsCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => {
              sound.playSoftTap();
              setIsControlsCollapsed(!isControlsCollapsed);
            }}
            className="bg-[#FFFDF7] hover:bg-[#F8DCE6] text-[#542B3D] border-t border-x border-[#F0D5DF] text-xs font-semibold px-4 py-1.5 rounded-t-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            {isControlsCollapsed ? (
              <>
                <Eye className="w-3.5 h-3.5 text-[#E66B9A]" />
                Show Companion Controls
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#8C6A79]" />
                Hide Controls (Zen Mode)
              </>
            )}
          </button>
        </div>

        {/* Dock Card */}
        <div className="bg-[#FFFDF7] border border-[#F0D5DF] rounded-2xl p-3.5 shadow-md flex flex-col gap-2.5">
          {/* Status Message */}
          <div className="flex items-center justify-between text-xs px-1 text-[#8C6A79]">
            <span className="font-semibold text-[#542B3D]">Status: {mascotAction}</span>
            <span>Real-time Studio 3D</span>
          </div>

          {/* Interactive Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => triggerAction('pat')}
              className="bg-[#F8DCE6] hover:bg-[#F0C5D7] active:scale-95 text-[#542B3D] text-xs font-semibold py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all"
            >
              <Flower2 className="w-3.5 h-3.5 text-[#E66B9A]" />
              Pat Head 🐾
            </button>
            <button
              onClick={() => triggerAction('hearts')}
              className="bg-[#FFE3EB] hover:bg-[#FCD0DC] active:scale-95 text-[#B73F65] text-xs font-semibold py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all"
            >
              <Heart className="w-3.5 h-3.5 text-[#E66B9A] fill-[#E66B9A]" />
              Send Love 💖
            </button>
            <button
              onClick={() => triggerAction('spin')}
              className="bg-[#F2E7FE] hover:bg-[#E5D2FC] active:scale-95 text-[#542B3D] text-xs font-semibold py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#A259FF]" />
              Twirl Spin 💫
            </button>
          </div>

          {/* Lighting Ambience Selector */}
          <div className="flex items-center justify-between pt-1 border-t border-[#F0D5DF]/70 text-xs text-[#8C6A79]">
            <span className="font-medium">Atmosphere:</span>
            <div className="flex gap-1.5">
              {(['daylight', 'sunset', 'candlelight'] as const).map((mood) => (
                <button
                  key={mood}
                  onClick={() => applyMood(mood)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                    currentMood === mood
                      ? 'bg-[#E66B9A] text-white shadow-xs'
                      : 'bg-[#FBE8EE] hover:bg-[#F8DCE6] text-[#542B3D]'
                  }`}
                >
                  {mood === 'daylight' ? '☀️ Day' : mood === 'sunset' ? '🌅 Sunset' : '🕯️ Candle'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
