import { Ball } from './ball.js';

// GUI 
var controls = new function(){
    this.hasUpdated = true; // set false when new balls are added in gui but not renderer in the scene
    this.colorUpdateQueue = [];
    this.posUpdateQueue = [];

    this.hasInitialized = false;
    this.initializationStatus = "no";
    
    this.isSimulating = false; // enable only after initialization, set true when balls start to move
    this.simulatorStatus = "stop";

    this.ball1Num = 0;
    this.ball1Radius = 1;
    this.ball1Mass = 0;
    this.ball1Color = [255, 255, 255];
    
    this.ball2Num = 0;
    this.ball2Radius = 1;
    this.ball2Mass = 0;
    this.ball2Color = [255, 255, 255];

    this.ball3Num = 0;
    this.ball3Radius = 1;
    this.ball3Mass = 0;
    this.ball3Color = [255, 255, 255];



    this.updateInitializationStatus = function() {
        this.hasInitialized = !this.hasInitialized;

        if (!this.hasInitialized) {
            this.simulatorStatus = "stop";
            this.isSimulating = false;
        }
    }

    this.updateSimulatorStatus = function() {
        this.isSimulating = !this.isSimulating;
    }
    
    this.toUpdateBallPos = function(idx) {
        this.hasUpdated = false;
        this.posUpdateQueue.push(idx);
    }
    
    this.toUpdateBallColor = function(idx) {
        this.hasUpdated = false;
        this.colorUpdateQueue.push(idx);
    }

    this.hasUpdatedBallProps = function() {
        this.hasUpdated = true;
        this.colorUpdateQueue = [];
        this.posUpdateQueue = [];
    }
}

function createGUI() {
    const gui = new dat.gui.GUI();
    const initialization = gui.addFolder('Balls properties'); // support adding up to three different balls
    const simulation = gui.addFolder('Balls motion');

    const ball1 = initialization.addFolder("Ball 1");
    ball1.add(controls, "ball1Num", 0, 100).step(1).name("Quantity").onChange(function() {
        controls.toUpdateBallPos(1);
      });
    ball1.add(controls, "ball1Radius", 0.1, 5.0).step(0.1).name("Radius").onChange(function() {
        controls.toUpdateBallPos(1);
      });
    ball1.add(controls, "ball1Mass").name("Mass");
    ball1.addColor(controls, "ball1Color").name("Color").onChange(function() {
        controls.toUpdateBallColor(1);
      });

    const ball2 = initialization.addFolder("Ball 2");
    ball2.add(controls, "ball2Num", 0, 100).step(1).step(1).name("Quantity").onChange(function() {
        controls.toUpdateBallPos(2);
      });
    ball2.add(controls, "ball2Radius", 0.1, 5.0).step(0.1).name("Radius").onChange(function() {
        controls.toUpdateBallPos(2);
      });
    ball2.add(controls, "ball2Mass").name("Mass");
    ball2.addColor(controls, "ball2Color").name("Color").onChange(function() {
        controls.toUpdateBallColor(2);
      });

    const ball3 = initialization.addFolder("Ball 3");
    ball3.add(controls, "ball3Num", 0, 100).step(1).step(1).name("Quantity").onChange(function() {
        controls.toUpdateBallPos(3);
      });
    ball3.add(controls, "ball3Radius", 0.1, 5.0).step(0.1).name("Radius").onChange(function() {
        controls.toUpdateBallPos(3);
      });
    ball3.add(controls, "ball3Mass").name("Mass");
    ball3.addColor(controls, "ball3Color").name("Color").onChange(function() {
        controls.toUpdateBallColor(3);
      });

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
var container = document.getElementById("container");
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100;

const cameraControls = new THREE.OrbitControls(camera, container);
cameraControls.enableZoom = true;
cameraControls.enableRotate = true;
cameraControls.enablePan = true;
cameraControls.rotateSpeed = 0.3;
cameraControls.zoomSpeed = 1.0;
cameraControls.panSpeed = 0.8;
cameraControls.target.set(0, 0, 0);

var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
scene.add( light );

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);



// setting
const CONTAINER_LENGTH = 100;
const CONTAINER_WIDTH = 100;
const CONTAINER_HEIGHT = 100;

const BALL_SEGMENTS = 36;
const MAX_VELOCITY = 50;

var mBall1List = [];
var mBall2List = [];
var mBall3List = [];
var mBallList = [mBall1List, mBall2List, mBall3List];


// mainLoop
function mainLoop() {
    requestAnimationFrame(mainLoop);

    var mBallNum = [controls.ball1Num, controls.ball2Num, controls.ball3Num];
    var mBallRadius = [controls.ball1Radius, controls.ball2Radius, controls.ball3Radius];
    var mBallColor = [controls.ball1Color, controls.ball2Color, controls.ball3Color];
    // [colorScaler(controls.ball1Color), colorScaler(controls.ball2Color), colorScaler(controls.ball3Color)];
    // [controls.ball1Color, controls.ball2Color, controls.ball3Color];

    if (controls.hasInitialized) {
        if (controls.isSimulating) {
            // update ball motion

        }
    }
    else {
        if (!controls.hasUpdated) {
            // update ball props
            if (controls.posUpdateQueue.length > 0) {
                for (var idx = 0; idx < 3; idx++) {
                    if (controls.posUpdateQueue.includes(idx+1)) {
                        removeBalls(mBallList[idx]);
                        mBallList[idx].length = 0;

                        for (var i=0; i<mBallNum[idx]; i++) {
                            const geometry = new THREE.SphereGeometry(mBallRadius[idx], BALL_SEGMENTS, BALL_SEGMENTS);
                            const material = new THREE.MeshBasicMaterial({ color: rgb2hex(mBallColor[idx])}); 
                            console.log(mBallColor[idx]);
                            const item = new THREE.Mesh(geometry, material);

                            const position = randomPos(mBallRadius[idx]);
                            item.position.set(position.x, position.y, position.z);
                            scene.add(item);

                            const ball = new Ball(item, Math.random()*MAX_VELOCITY, position);
                            mBallList[idx].push(ball);
                        }
                        
                    }
                }
            }
            else {
                for (var idx = 0; idx < 3; idx++) {
                    if (controls.colorUpdateQueue.includes(idx+1)) {
                        for (var i=0; i<mBallList[idx].length; i++) {
                            mBallList[idx][i].item.material.color.set(rgb2hex(mBallColor[idx]));
                        }
                    }
                }
            }
            controls.hasUpdatedBallProps();
        }
    }
    renderer.render(scene, camera);
}

function removeBalls(ballList) {
    for (var i=0; i<ballList.length; i++) {
        scene.remove(ballList[i].item);
    }
}

function randomPos(radius) {
    const x = Math.random() * (CONTAINER_LENGTH - radius);
    //  - (CONTAINER_LENGTH * 2 - radius);
    const y = Math.random() * (CONTAINER_WIDTH - radius);
    //  - (CONTAINER_WIDTH * 2 - radius);
    const z = Math.random() * (CONTAINER_HEIGHT - radius);
    //  - (CONTAINER_HEIGHT * 2 - radius);
    return { x, y, z };
}

function colorScaler(rgb) {
    return [rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0];
}

function rgb2hex(rgb) {
    var strHex = "#";
    for (var i=0; i<rgb.length; i++) {
        var hex = Math.floor(Number(rgb[i])).toString(16);
        if (hex.length < 2) {
            hex = '0' + hex;    
        }
        strHex += hex;
    }
    return strHex;
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