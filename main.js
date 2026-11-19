import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

/* =========================================
   RESPONSIVE SETUP
========================================= */

const canvas = document.querySelector('#ocean-canvas');

const isMobile = () => window.innerWidth <= 800;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x061722, 0.018);

const camera = new THREE.PerspectiveCamera(
    isMobile() ? 55 : 42,
    innerWidth / innerHeight,
    0.1,
    160
);

camera.position.set(
    0.4,
    1.0,
    isMobile() ? 17 : 12.5
);

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

/* =========================================
   LIGHTING
========================================= */

scene.add(
    new THREE.HemisphereLight(
        0x9cecff,
        0x06111b,
        2.1
    )
);

const key = new THREE.DirectionalLight(
    0xc8f5ff,
    3.2
);

key.position.set(-5, 8, 7);
scene.add(key);

const rim = new THREE.DirectionalLight(
    0x168bff,
    3.8
);

rim.position.set(5, 1, -6);
scene.add(rim);

const fill = new THREE.PointLight(
    0x24c8ef,
    90,
    28
);

fill.position.set(2, 1, 5);
scene.add(fill);

/* =========================================
   SUBMARINE MODEL
========================================= */

const craft = new THREE.Group();
scene.add(craft);

const titanium = new THREE.MeshStandardMaterial({
    color: 0xb8cbd0,
    metalness: 0.88,
    roughness: 0.23
});

const darkTitanium = new THREE.MeshStandardMaterial({
    color: 0x203b48,
    metalness: 0.82,
    roughness: 0.28
});

const glass = new THREE.MeshPhysicalMaterial({
    color: 0x2ab9e8,
    metalness: 0.25,
    roughness: 0.06,
    transmission: 0.25,
    transparent: true,
    opacity: 0.88,
    clearcoat: 1,
    emissive: 0x063b58,
    emissiveIntensity: 0.65
});

const glowMat = new THREE.MeshBasicMaterial({
    color: 0x8ceeff
});

const orange = new THREE.MeshStandardMaterial({
    color: 0xffb45e,
    metalness: 0.55,
    roughness: 0.32,
    emissive: 0x6a2600,
    emissiveIntensity: 0.35
});

function mesh(
    geo,
    mat,
    parent = craft,
    pos = [0, 0, 0],
    scale = [1, 1, 1],
    rot = [0, 0, 0]
) {
    const m = new THREE.Mesh(geo, mat);

    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);

    parent.add(m);

    return m;
}

/* Main hull */

mesh(
    new THREE.SphereGeometry(1, 64, 40),
    titanium,
    craft,
    [0, 0, 0],
    [2.65, 0.82, 0.9]
);

/* Nose */

mesh(
    new THREE.ConeGeometry(0.78, 1.45, 48),
    titanium,
    craft,
    [2.78, 0, 0],
    [1, 1, 1],
    [0, 0, -Math.PI / 2]
);

/* Front glass */

mesh(
    new THREE.SphereGeometry(0.74, 48, 32),
    glass,
    craft,
    [2.2, 0.13, 0],
    [0.8, 0.72, 0.79]
);

/* Top command dome */

mesh(
    new THREE.CylinderGeometry(0.48, 0.58, 0.34, 40),
    darkTitanium,
    craft,
    [-0.45, 0.72, 0]
);

mesh(
    new THREE.SphereGeometry(0.52, 48, 32),
    glass,
    craft,
    [-0.45, 1.02, 0],
    [1, 0.66, 0.9]
);

/* Reinforcement bands */

for (let x = -1.85; x <= 1.25; x += 0.62) {

    const band = mesh(
        new THREE.TorusGeometry(0.78, 0.045, 12, 64),
        darkTitanium,
        craft,
        [x, 0, 0]
    );

    band.rotation.y = Math.PI / 2;
    band.scale.set(1, 1, 1.08);
}

/* Tail fins */

mesh(
    new THREE.BoxGeometry(0.95, 0.12, 1.5),
    darkTitanium,
    craft,
    [-2.35, 0.72, 0],
    [1, 1, 1],
    [0, 0, -0.22]
);

mesh(
    new THREE.BoxGeometry(0.85, 0.12, 1.25),
    darkTitanium,
    craft,
    [-2.35, -0.7, 0],
    [1, 1, 1],
    [0, 0, 0.22]
);

mesh(
    new THREE.BoxGeometry(0.95, 1.25, 0.12),
    titanium,
    craft,
    [-2.35, 0, 0]
);

/* Side thrusters */

for (const side of [-1, 1]) {

    mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 1.15, 32),
        darkTitanium,
        craft,
        [-1.55, -0.18, side * 0.92],
        [1, 1, 1],
        [Math.PI / 2, 0, 0]
    );

    mesh(
        new THREE.TorusGeometry(0.27, 0.055, 12, 40),
        orange,
        craft,
        [-1.55, -0.18, side * 1.5],
        [1, 1, 1],
        [Math.PI / 2, 0, 0]
    );

    const lamp = new THREE.SpotLight(
        0x8ceeff,
        75,
        18,
        0.38,
        0.55,
        1.4
    );

    lamp.position.set(2.5, -0.22, side * 0.45);

    lamp.target.position.set(7, -1, side * 1.3);

    craft.add(lamp, lamp.target);
}

/* Portholes */

for (const side of [-1, 1]) {

    for (let x = -1.15; x <= 0.85; x += 0.67) {

        mesh(
            new THREE.TorusGeometry(0.19, 0.055, 12, 36),
            titanium,
            craft,
            [x, 0.12, side * 0.86],
            [1, 1, 1],
            [Math.PI / 2, 0, 0]
        );

        mesh(
            new THREE.CircleGeometry(0.16, 32),
            glowMat,
            craft,
            [x, 0.12, side * 0.91],
            [1, 1, 1],
            [Math.PI / 2, 0, 0]
        );
    }
}

/* Propeller */

const propeller = new THREE.Group();

propeller.position.set(-3.15, 0, 0);

craft.add(propeller);

mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.28, 24),
    orange,
    propeller,
    [0, 0, 0],
    [1, 1, 1],
    [Math.PI / 2, 0, 0]
);

for (let i = 0; i < 5; i++) {

    const blade = mesh(
        new THREE.BoxGeometry(0.13, 1.05, 0.12),
        titanium,
        propeller,
        [0, 0, 0]
    );

    blade.rotation.z = i * Math.PI * 2 / 5;
}

/* Light strips */

for (const side of [-1, 1]) {

    mesh(
        new THREE.BoxGeometry(2.6, 0.035, 0.035),
        glowMat,
        craft,
        [0, -0.53, side * 0.83]
    );
}

/* =========================================
   RESPONSIVE SUBMARINE POSITIONING
========================================= */

function setCraftLayout() {

    if (isMobile()) {

        craft.position.set(0.2, -1.5, -1.2);

        craft.rotation.set(
            0.04,
            -0.18,
            -0.035
        );

        craft.scale.setScalar(0.72);

    } else {

        craft.position.set(
            1.15,
            -0.28,
            -1.2
        );

        craft.rotation.set(
            0.04,
            -0.18,
            -0.035
        );

        craft.scale.setScalar(1.12);
    }
}

setCraftLayout();

/* =========================================
   OCEAN FLOOR
========================================= */

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({
        color: 0x061b26,
        roughness: 1,
        metalness: 0
    })
);

floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -7, -35);

scene.add(floor);

/* =========================================
   PARTICLES
========================================= */

const count = 2600;

const positions = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {

    positions[i * 3] = (Math.random() - 0.5) * 36;

    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;

    positions[i * 3 + 2] = (Math.random() - 0.5) * 38 - 4;
}

const pGeo = new THREE.BufferGeometry();

pGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
);

const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
        color: 0x9cecff,
        size: 0.035,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    })
);

scene.add(particles);

/* =========================================
   LIGHT RAYS
========================================= */

const rays = new THREE.Group();

scene.add(rays);

for (let i = 0; i < 9; i++) {

    const mat = new THREE.MeshBasicMaterial({
        color: 0x63dfff,
        transparent: true,
        opacity: 0.045,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const ray = new THREE.Mesh(
        new THREE.PlaneGeometry(0.65, 19),
        mat
    );

    ray.position.set(
        -8 + i * 2,
        3,
        -10 - i * 0.7
    );

    ray.rotation.z = -0.13;

    rays.add(ray);
}

/* =========================================
   POINTER INTERACTION
========================================= */

let mx = 0;
let my = 0;
let progress = 0;

addEventListener('pointermove', e => {

    mx = (e.clientX / innerWidth - 0.5) * 2;

    my = (e.clientY / innerHeight - 0.5) * 2;

    const el = document.querySelector('.cursor-glow');

    if (el) {

        el.style.left = e.clientX + 'px';

        el.style.top = e.clientY + 'px';
    }
});

/* =========================================
   CAMERA TARGET
========================================= */

const aim = {
    x: isMobile() ? 0 : 0.8,
    y: isMobile() ? -1.2 : 0,
    z: -1.2
};

/* =========================================
   CINEMATIC CAMERA JOURNEY
========================================= */

const journey = gsap.timeline({
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '+=220%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: s => progress = s.progress
    }
});

if (isMobile()) {

    /* MOBILE CAMERA */

    journey

        .to(camera.position, {
            x: 0,
            y: 0.2,
            z: 15,
            ease: 'none'
        }, 0)

        .to(aim, {
            x: 0,
            y: -1.2,
            z: -1.2,
            ease: 'none'
        }, 0)

        .to(craft.rotation, {
            y: -0.4,
            z: 0.04,
            ease: 'none'
        }, 0.25)

        .to(camera.position, {
            x: 1,
            y: 0,
            z: 14,
            ease: 'none'
        }, 0.48)

        .to(aim, {
            x: 0,
            y: -1.2,
            z: -1.4,
            ease: 'none'
        }, 0.48)

        .to(craft.rotation, {
            y: 0.35,
            z: -0.04,
            ease: 'none'
        }, 0.52)

        .to(camera.position, {
            x: -0.5,
            y: -0.4,
            z: 16,
            ease: 'none'
        }, 0.82)

        .to(aim, {
            x: 0,
            y: -1.2,
            z: -2,
            ease: 'none'
        }, 0.82);

} else {

    /* DESKTOP CAMERA */

    journey

        .to(camera.position, {
            x: -0.2,
            y: 0.25,
            z: 7.5,
            ease: 'none'
        }, 0)

        .to(aim, {
            x: 1.1,
            y: 0,
            z: -1.2,
            ease: 'none'
        }, 0)

        .to(craft.rotation, {
            y: -0.58,
            z: 0.08,
            ease: 'none'
        }, 0.22)

        .to(camera.position, {
            x: 3.2,
            y: 0.15,
            z: 4.1,
            ease: 'none'
        }, 0.48)

        .to(aim, {
            x: 1.0,
            y: 0,
            z: -1.4,
            ease: 'none'
        }, 0.48)

        .to(craft.rotation, {
            y: 0.48,
            z: -0.08,
            ease: 'none'
        }, 0.52)

        .to(camera.position, {
            x: -1.2,
            y: -0.7,
            z: 10.5,
            ease: 'none'
        }, 0.82)

        .to(aim, {
            x: 0,
            y: 0,
            z: -2,
            ease: 'none'
        }, 0.82);
}

/* Hero text animation during scroll */

journey

    .to('.hero-copy', {
        y: -100,
        opacity: 0,
        ease: 'none'
    }, 0.3)

    .to('.hero-topline,.hero-stats,.hero-side-note', {
        opacity: 0,
        ease: 'none'
    }, 0.2);

/* =========================================
   ANIMATIONS
========================================= */

/* Propeller */

gsap.to(propeller.rotation, {
    z: Math.PI * 2,
    duration: 2.2,
    repeat: -1,
    ease: 'none'
});

/* Submarine floating */

gsap.to(craft.position, {
    y: '+=0.16',
    duration: 3.4,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut'
});

/* Submarine movement */

gsap.to(craft.rotation, {
    x: 0.09,
    duration: 4,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut'
});

/* Hero heading */

gsap.to('.hero-title span', {
    y: 0,
    opacity: 1,
    duration: 1.25,
    stagger: 0.16,
    ease: 'power4.out',
    delay: 0.2
});

gsap.from('.hero .eyebrow,.hero-bottom-copy', {
    y: 22,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.65
});

/* =========================================
   REVEAL ANIMATIONS
========================================= */

gsap.utils.toArray('.reveal').forEach(el => {

    gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',

        scrollTrigger: {
            trigger: el,
            start: 'top 82%'
        }
    });
});

/* Services */

gsap.utils.toArray('.service-row').forEach((el, i) => {

    gsap.from(el, {
        x: -35,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.06,

        scrollTrigger: {
            trigger: el,
            start: 'top 88%'
        }
    });
});

/* Manifesto */

gsap.to('.manifesto-content', {
    y: -90,
    ease: 'none',

    scrollTrigger: {
        trigger: '.manifesto',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
    }
});

/* =========================================
   SCROLL PROGRESS
========================================= */

ScrollTrigger.create({
    trigger: document.body,
    start: 0,
    end: 'max',

    onUpdate: s => {

        const bar = document.querySelector(
            '.scroll-progress span'
        );

        if (bar) {

            bar.style.width = (s.progress * 100) + '%';
        }
    }
});

/* =========================================
   RENDER LOOP
========================================= */

function animate(t) {

    requestAnimationFrame(animate);

    const time = t * 0.0002;

    particles.rotation.y = time * 0.055;

    particles.position.y = Math.sin(time) * 0.16;

    craft.rotation.z += Math.sin(time * 1.5) * 0.00003;

    camera.lookAt(
        aim.x + mx * 0.12 * (1 - progress),
        aim.y - my * 0.08 * (1 - progress),
        aim.z
    );

    renderer.render(scene, camera);
}

animate(0);

/* =========================================
   RESPONSIVE RESIZE
========================================= */

addEventListener('resize', () => {

    camera.aspect = innerWidth / innerHeight;

    if (isMobile()) {

        camera.fov = 55;

        craft.scale.setScalar(0.72);

        craft.position.set(
            0.2,
            -1.5,
            -1.2
        );

    } else {

        camera.fov = 42;

        craft.scale.setScalar(1.12);

        craft.position.set(
            1.15,
            -0.28,
            -1.2
        );
    }

    camera.updateProjectionMatrix();

    renderer.setSize(
        innerWidth,
        innerHeight
    );

    renderer.setPixelRatio(
        Math.min(devicePixelRatio, 2)
    );

    ScrollTrigger.refresh();
});

/* =========================================
   MOBILE MENU
========================================= */

const menu = document.querySelector('.menu-toggle');

if (menu) {

    menu.addEventListener('click', () => {

        let panel = document.querySelector('.mobile-panel');

        if (panel) {

            panel.remove();

            return;
        }

        panel = document.createElement('div');

        panel.className = 'mobile-panel';

        panel.innerHTML = `
            <a href="#about">ABOUT</a>
            <a href="#services">CAPABILITIES</a>
            <a href="#work">SELECTED WORK</a>
            <a href="#contact">LET'S TALK ↗</a>
        `;

        document.body.appendChild(panel);

        panel.querySelectorAll('a').forEach(a => {

            a.addEventListener('click', () => {

                panel.remove();
            });
        });
    });
}
