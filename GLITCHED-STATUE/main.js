import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from 'https://unpkg.com/dat.gui@0.7.9/build/dat.gui.module.js';
import { EffectComposer } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js";

// Create a scene
const scene = new THREE.Scene();
const canvas = document.querySelector('canvas.webgl');

// Group for torus and model
const group = new THREE.Group();
scene.add(group);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
);
floor.rotation.x = -Math.PI * 0.5;
// scene.add(floor);

// Torus with emissive material
const geometry = new THREE.TorusGeometry(0.2, 0.04, 4, 20);
const material = new THREE.MeshStandardMaterial({
    color: 0x2555FD,
    emissive: 0x2555FD,  // ✅ Torus now emits light
    emissiveIntensity: 5,  // ✅ Increased glow
    wireframe: true
});
const torus = new THREE.Mesh(geometry, material);
torus.position.set(0, 1.8, 0);
group.add(torus);

const BLOOM_LAYER = 1;
torus.layers.enable(BLOOM_LAYER);  // Only torus glows



// ✅ Move the PointLight inside the Torus
const torusLight = new THREE.PointLight(0xffffff, 0.01, 0.25, 0.0004); // (color, intensity, distance, decay)
torusLight.position.set(0, 1.8, -2); // ✅ Inside the torus
scene.add(torusLight);

// ✅ Light Helper
const torusLightHelper = new THREE.PointLightHelper(torusLight);
// scene.add(torusLightHelper);

const spotLight = new THREE.SpotLight(0xffffff, 17, 100, 10, 10);
spotLight.position.set(0, 3, 0.5);
spotLight.castShadow = true;
scene.add(spotLight);


const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);


// Soft fill light from the left
const fillLight = new THREE.PointLight(0x5599FF, 30, 5, 2);
fillLight.position.set(-2, 2, 2);
// scene.add(fillLight);

// Rim light from the back for depth
const rimLight = new THREE.PointLight(0xffffff, 20, 1, 1.5);
rimLight.position.set(1, 1, 1);
scene.add(rimLight);

const fillLightHelper = new THREE.PointLightHelper(fillLight);
const rimLightHelper = new THREE.PointLightHelper(rimLight);
// scene.add( fillLightHelper);
// scene.add( rimLightHelper);

// GLTF Loader
const gltfLoader = new GLTFLoader();
const loadModel = (path, position, rotation = { x: 0, y: 0, z: 0 }) => {
    gltfLoader.load(path, (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        group.add(mesh);  // ✅ Add model to the group
        console.log(gltf.scene);
        // ✅ Hide loader when model is ready
        const loaderEl = document.getElementById('preloader');
        if (loaderEl) {
            gsap.to(loaderEl, {
                scale: 1.5,
                opacity: 0,
                // y:"-100%",
                duration: 0.5,
                ease: "linear",
                onComplete: () => loaderEl.remove()
            });
        }
    });
    (xhr) => {
        // Optional: Progress feedback (in case you want percentage)
        const percent = (xhr.loaded / xhr.total) * 100;
        console.log(`Loading model: ${percent.toFixed(0)}%`);
    },
        (error) => {
            console.error('Error loading model', error);
        }
};

// Load multiple models
loadModel('https://raw.githubusercontent.com/Sabur-Ahemad/roman-godess-3d/main/flora/scene.gltf', { x: 0, y: 10.8, z: -15 });

// Sizes
const sizes = { width: window.innerWidth, height: window.innerHeight };

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(0, 2, 2);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);

// Scroll-based rotation for the group
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(group.rotation, {
        y: "+=6.28", // ✅ Rotate in the same direction as the wheel event
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Smooth scrolling effect
        }
    });

    gsap.to(camera.position, {
        y: 1, // ✅ Moves downward instead of upward
        z: 1.7, // ✅ Moves backward instead of forward
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
        }
    });
}

const composer = new EffectComposer(renderer);
composer.setSize(sizes.width, sizes.height);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    1,   // strength — glow intensity
    1.0,   // radius — spread
    0    // threshold — how bright a pixel must be to glow
);
composer.addPass(bloomPass);

// dat.GUI Setup
const gui = new GUI({ width: 350 });

// Torus Controls
const torusFolder = gui.addFolder('Torus');
torusFolder.add(torus.position, 'x', -5, 5, 0.1).name('Position X');
torusFolder.add(torus.position, 'y', -5, 5, 0.1).name('Position Y');
torusFolder.add(torus.position, 'z', -5, 5, 0.1).name('Position Z');
torusFolder.add(torus.rotation, 'x', 0, Math.PI * 2, 0.1).name('Rotation X');
torusFolder.add(torus.rotation, 'y', 0, Math.PI * 2, 0.1).name('Rotation Y');
torusFolder.add(torus.rotation, 'z', 0, Math.PI * 2, 0.1).name('Rotation Z');
torusFolder.add(material, 'emissiveIntensity', 0, 10, 0.1).name('Emissive Intensity');
torusFolder.addColor({ color: '#2555FD' }, 'color').onChange((value) => {
    material.color.set(value);
    material.emissive.set(value);
}).name('Color');
// Camera Controls
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'x', -10, 10, 0.1).name('Position X');
cameraFolder.add(camera.position, 'y', -10, 10, 0.1).name('Position Y');
cameraFolder.add(camera.position, 'z', -10, 10, 0.1).name('Position Z');
cameraFolder.add(camera, 'fov', 10, 150, 1).onChange(() => {
    camera.updateProjectionMatrix();
}).name('Field of View');

// Torus Light Controls
const torusLightFolder = gui.addFolder('Torus Light');
torusLightFolder.add(torusLight.position, 'x', -5, 5, 0.1).name('Position X');
torusLightFolder.add(torusLight.position, 'y', -5, 5, 0.1).name('Position Y');
torusLightFolder.add(torusLight.position, 'z', -5, 5, 0.1).name('Position Z');
torusLightFolder.add(torusLight, 'intensity', 0, 200, 1).name('Base Intensity');
torusLightFolder.add(torusLight, 'distance', 0, 10, 0.1).name('Distance');
torusLightFolder.add(torusLight, 'decay', 0, 5, 0.1).name('Decay');
torusLightFolder.addColor({ color: '#ffffff' }, 'color').onChange((value) => {
    torusLight.color.set(value);
}).name('Color');

// Spot Light Controls
const spotLightFolder = gui.addFolder('Spot Light');
spotLightFolder.add(spotLight.position, 'x', -10, 10, 0.1).name('Position X');
spotLightFolder.add(spotLight.position, 'y', -10, 10, 0.1).name('Position Y');
spotLightFolder.add(spotLight.position, 'z', -10, 10, 0.1).name('Position Z');
spotLightFolder.add(spotLight, 'intensity', 0, 50, 1).name('Intensity');
spotLightFolder.add(spotLight, 'distance', 0, 200, 1).name('Distance');
spotLightFolder.add(spotLight, 'angle', 0, Math.PI / 2, 0.01).name('Angle');
spotLightFolder.add(spotLight, 'penumbra', 0, 1, 0.01).name('Penumbra');
spotLightFolder.addColor({ color: '#ffffff' }, 'color').onChange((value) => {
    spotLight.color.set(value);
}).name('Color');

// Rim Light Controls
const rimLightFolder = gui.addFolder('Rim Light');
rimLightFolder.add(rimLight.position, 'x', -10, 10, 0.1).name('Position X');
rimLightFolder.add(rimLight.position, 'y', -10, 10, 0.1).name('Position Y');
rimLightFolder.add(rimLight.position, 'z', -10, 10, 0.1).name('Position Z');
rimLightFolder.add(rimLight, 'intensity', 0, 50, 1).name('Intensity');
rimLightFolder.add(rimLight, 'distance', 0, 10, 0.1).name('Distance');
rimLightFolder.add(rimLight, 'decay', 0, 5, 0.1).name('Decay');
rimLightFolder.addColor({ color: '#ffffff' }, 'color').onChange((value) => {
    rimLight.color.set(value);
}).name('Color');

// Bloom Effect Controls
const bloomFolder = gui.addFolder('Bloom Effect');
bloomFolder.add(bloomPass, 'strength', 0, 3, 0.01).name('Strength');
bloomFolder.add(bloomPass, 'radius', 0, 2, 0.01).name('Radius');
bloomFolder.add(bloomPass, 'threshold', 0, 1, 0.01).name('Threshold');

// Animation Controls
const animationParams = {
    flickerSpeed: 0.02,
    flickerIntensity: 10,
    autoRotation: true,
    rotationSpeed: 1
};

const animationFolder = gui.addFolder('Animation');
animationFolder.add(animationParams, 'flickerSpeed', 0, 0.1, 0.001).name('Flicker Speed');
animationFolder.add(animationParams, 'flickerIntensity', 0, 50, 1).name('Flicker Intensity');
animationFolder.add(animationParams, 'autoRotation').name('Auto Rotation');
animationFolder.add(animationParams, 'rotationSpeed', 0, 5, 0.1).name('Rotation Speed');

// Group Controls
const groupFolder = gui.addFolder('Group Transform');
groupFolder.add(group.position, 'x', -10, 10, 0.1).name('Position X');
groupFolder.add(group.position, 'y', -10, 10, 0.1).name('Position Y');
groupFolder.add(group.position, 'z', -10, 10, 0.1).name('Position Z');
groupFolder.add(group.rotation, 'x', 0, Math.PI * 2, 0.1).name('Rotation X');
groupFolder.add(group.rotation, 'y', 0, Math.PI * 2, 0.1).name('Rotation Y');
groupFolder.add(group.rotation, 'z', 0, Math.PI * 2, 0.1).name('Rotation Z');

gui.close();
// Scene Controls
const sceneFolder = gui.addFolder('Scene');
sceneFolder.addColor({ backgroundColor: '#000000' }, 'backgroundColor').onChange((value) => {
    scene.background = new THREE.Color(value);
}).name('Background Color');

// Renderer Controls
const rendererFolder = gui.addFolder('Renderer');
rendererFolder.add(renderer, 'toneMappingExposure', 0, 3, 0.01).name('Exposure');

// Helper toggles
const helpersFolder = gui.addFolder('Helpers');


const helperControls = {
    showTorusLightHelper: false,
    showSpotLightHelper: false,
    showRimLightHelper: false,
    showFillLightHelper: false
};


helpersFolder.add(helperControls, 'showTorusLightHelper').onChange((value) => {
    if (value) {
        scene.add(torusLightHelper);
    } else {
        scene.remove(torusLightHelper);
    }
}).name('Torus Light Helper');

helpersFolder.add(helperControls, 'showSpotLightHelper').onChange((value) => {
    if (value) {
        scene.add(spotLightHelper);
    } else {
        scene.remove(spotLightHelper);
    }
}).name('Spot Light Helper');

helpersFolder.add(helperControls, 'showRimLightHelper').onChange((value) => {
    if (value) {
        scene.add(rimLightHelper);
    } else {
        scene.remove(rimLightHelper);
    }
}).name('Rim Light Helper');

helpersFolder.add(helperControls, 'showFillLightHelper').onChange((value) => {
    if (value) {
        scene.add(fillLightHelper);
    } else {
        scene.remove(fillLightHelper);
    }
}).name('Fill Light Helper');



window.addEventListener('resize', () => {
    // ✅ Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // ✅ Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // ✅ Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ✅ Update composer
    composer.setSize(sizes.width, sizes.height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
let time = 0;
const tick = () => {
    time += animationParams.flickerSpeed;

    // Flickering light effect using GUI parameters
    torusLight.intensity = torusLight.intensity + Math.sin(time) * animationParams.flickerIntensity;

    // Auto rotation using GUI parameters
    if (animationParams.autoRotation) {
        torus.rotation.z += 0.01 * animationParams.rotationSpeed;
        // torus.rotation.y += 0.01 * animationParams.rotationSpeed;
    }

    renderer.render(scene, camera);
    composer.render();
    window.requestAnimationFrame(tick);
};
tick();

// gsap.to("img", {
//     y: -50, // Move up by 50px
//     duration: 1,
//     ease: "power2.out",
//     scrollTrigger: {
//         trigger: '.banner-section h1',
//         start: "top 10%", // Animation starts when top of element reaches 80% viewport height
//         end: "bottom 10%", // Animation ends when top reaches 50% viewport height
//         scrub: 1, // Smooth animation linked to scroll
//         markers: true,
//     }
// });


const images = document.querySelectorAll('.images-container .img-main ');

images.forEach((img, index) => {
    // Apply fade-in and slide-up effect
    // gsap.from(img, {
    //     opacity: 0,
    //     y: 100, // Moves up while fading in
    //     duration: 1.2,
    //     ease: "power2.out",
    //     scrollTrigger: {
    //         trigger: img,
    //         start: "top 85%", // Starts when the image reaches 85% of viewport
    //         end: "top 50%",
    //         scrub: 1, // Smooth scrolling effect
    //         // markers: true
    //     }
    // });

    // Apply Parallax Effect
    gsap.to(img, {
        // y: index % 2 === 0 ? "-=50" : "+=50", // Moves alternately up/down
        y: 0,
        opacity: 1,
        ease: "none",
        opacity: 1,
        scrollTrigger: {
            trigger: img,
            start: "top bottom", // Starts when the image enters the viewport
            end: "bottom bottom", // Ends when it leaves viewport
            scrub: 1, // Smooth parallax effect
            // markers:true
        }
    });
});


window.onload = function () {
    gsap.from(".banner-section", {
        opacity: 0,
        y: 50, // Move up while appearing
        duration: 1.5,
        ease: "power2.out"
    });

    gsap.from(".images-container .img", {
        opacity: 0,
        scale: 0.8, // Slight zoom-in effect
        stagger: 0.2, // Delays between each image animation
        duration: 1.2,
        ease: "power2.out"
    });
};

// gsap.to("#loading-text", {
//   duration: 2,
//   scrambleText: {
//     text: "loading",
//     chars: "upperCase",
//     revealDelay: 0.5,
//     speed: 0.1
//   },
//   ease: "power1.inOut",
//   repeat: -1,
//   yoyo: true
// });
const split = new SplitText("#loading-text", { type: "chars" });
gsap.to(split.chars, {
  y: -10,
  opacity: 0,
  duration: 0.6,
  yoyo: true,
  repeat: -1,
  stagger: 0.05,
  ease: "sine.inOut"
});