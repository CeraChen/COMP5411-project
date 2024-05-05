// GUI 
var controls = new function(){
    this.hasUpdated = true; // set false when new balls are added in gui but not renderer in the scene

    this.hasInitialized = false;
    this.initializationStatus = "no";
    
    this.isSimulating = false; // enable only after initialization, set true when balls start to move
    this.simulatorStatus = "stop";

    this.ball1Num = 0;
    this.ball1Radius = 0;
    this.ball1Mass = 0;
    this.ball1Color = [255, 255, 255];
    
    this.ball2Num = 0;
    this.ball2Radius = 0;
    this.ball2Mass = 0;
    this.ball2Color = [255, 255, 255];

    this.ball3Num = 0;
    this.ball3Radius = 0;
    this.ball3Mass = 0;
    this.ball3Color = [255, 255, 255];


    this.updateInitializationStatus = function() {
        this.hasInitialized = !this.hasInitialized;
    }

    this.updateBallProps = function() {
        this.hasUpdated = false;
    }

    this.updateSimulatorStatus = function() {
        this.isSimulating = !this.isSimulating;
    }
}

function createGUI() {
    const gui = new dat.gui.GUI();
    const initialization = gui.addFolder('Balls properties'); // support adding up to three different balls
    const simulation = gui.addFolder('Balls motion');

    const ball1 = initialization.addFolder("Ball 1");
    ball1.add(controls, "ball1Num").step(1).name("Quantity").onChange(controls.updateBallProps);
    ball1.add(controls, "ball1Radius").name("Radius").onChange(controls.updateBallProps);
    ball1.add(controls, "ball1Mass").name("Mass").onChange(controls.updateBallProps);
    ball1.addColor(controls, "ball1Mass").name("Color").onChange(controls.updateBallProps);

    const ball2 = initialization.addFolder("Ball 2");
    ball2.add(controls, "ball2Num").step(1).name("Quantity").onChange(controls.updateBallProps);
    ball2.add(controls, "ball2Radius").name("Radius").onChange(controls.updateBallProps);
    ball2.add(controls, "ball2Mass").name("Mass").onChange(controls.updateBallProps);
    ball2.addColor(controls, "ball2Mass").name("Color").onChange(controls.updateBallProps);

    const ball3 = initialization.addFolder("Ball 3");
    ball3.add(controls, "ball3Num").step(1).name("Quantity").onChange(controls.updateBallProps);
    ball3.add(controls, "ball3Radius").name("Radius").onChange(controls.updateBallProps);
    ball3.add(controls, "ball3Mass").name("Mass").onChange(controls.updateBallProps);
    ball3.addColor(controls, "ball3Mass").name("Color").onChange(controls.updateBallProps);

    const onInitialized = function() {
        controls.updateInitializationStatus();
        if (controls.hasInitialized) {
            initialization.close();
            simulation.open();
        }
        else {            
            initialization.open();
            simulation.close();
        }
    }
    initialization.add(controls, "initializationStatus", ["yes", "no"]).name("Confirm").onChange(onInitialized);

    simulation.add(controls, "simulatorStatus", ["stop", "start"]).name("Simulator").onChange(controls.updateSimulatorStatus);

}
createGUI();


// scene
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

var container = document.getElementById("container");
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);



// mainLoop
function mainLoop() {
    requestAnimationFrame(mainLoop);
    if (controls.hasInitialized) {
        if (controls.isSimulating) {
            // update ball motion

        }
    }
    else {
        if (!controls.hasUpdated) {
            // update ball props
        }
    }
    renderer.render(scene, camera);
}

mainLoop();

// import * as THREE from 'three';
// 创建场景
// var scene = new THREE.Scene();

// // 创建相机
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 5;

// var light = new THREE.DirectionalLight( 0xffffff, 0.8 );
// scene.add( light );

// // 创建渲染器
// var container = document.getElementById( 'container' );
// var renderer = new THREE.WebGLRenderer();
// renderer.setPixelRatio( window.devicePixelRatio );
// renderer.setSize(window.innerWidth, window.innerHeight);
// container.appendChild(renderer.domElement);

// // 创建球体
// var geometry = new THREE.SphereGeometry(1, 32, 32);
// var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// var sphere = new THREE.Mesh(geometry, material);

// // 将球体添加到场景中
// scene.add(sphere);

// // 渲染循环
// function animate() {
//     requestAnimationFrame(animate);
//     sphere.rotation.x += 0.01;
//     sphere.rotation.y += 0.01;
//     renderer.render(scene, camera);
// }

// animate();