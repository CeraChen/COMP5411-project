import { Ball } from "./ball.js";
import * as constraints from "./constraints.js";



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
    this.ball1Density = 1;
    this.ball1Color = [255, 255, 255];
    
    this.ball2Num = 0;
    this.ball2Radius = 1;
    this.ball2Density = 1;
    this.ball2Color = [255, 255, 255];

    this.ball3Num = 0;
    this.ball3Radius = 1;
    this.ball3Density = 1;
    this.ball3Color = [255, 255, 255];


    this.updateInitializationStatus = function() {
        this.hasInitialized = !this.hasInitialized;

        if (!this.hasInitialized) {
            this.simulatorStatus = "stop";
            this.isSimulating = false;
        }
    };

    this.updateSimulatorStatus = function() {
        this.isSimulating = !this.isSimulating;
    };
    
    this.toUpdateBallPos = function(idx) {
        this.hasUpdated = false;
        this.posUpdateQueue.push(idx);
    };
    
    this.toUpdateBallColor = function(idx) {
        this.hasUpdated = false;
        this.colorUpdateQueue.push(idx);
    };

    this.toUpdateBallDensity = function() {
        this.hasUpdated = false;
    };

    this.hasUpdatedBallProps = function() {
        this.hasUpdated = true;
        this.colorUpdateQueue = [];
        this.posUpdateQueue = [];
    };
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
    ball1.add(controls, "ball1Density").name("Density").onChange(controls.toUpdateBallDensity);
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
    ball2.add(controls, "ball2Density").name("Density").onChange(controls.toUpdateBallDensity);
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
    ball3.add(controls, "ball3Density").name("Density").onChange(controls.toUpdateBallDensity);
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

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1e-2, 1000);
camera.position.x = constraints.CONTAINER_LENGTH*1.5;
camera.position.y = 0;
camera.position.z = 0;

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



// items
var mBall1List = [];
var mBall2List = [];
var mBall3List = [];


// mainLoop
function mainLoop() {
    requestAnimationFrame(mainLoop);
    if (controls.hasInitialized) {
        if (controls.isSimulating) {
            // update ball motion 
            var mBallSimulatedList = mBall1List.concat(mBall2List, mBall3List); 
            for (var i=0; i<mBallSimulatedList.length; i++) {
                mBallSimulatedList[i].updateVelocity();
            }


        }
    }
    else {   
        if (!controls.hasUpdated) {  
            // update ball props           
            var mBallInitialList = [mBall1List, mBall2List, mBall3List];    
            var mBallNum = [controls.ball1Num, controls.ball2Num, controls.ball3Num];
            var mBallRadius = [controls.ball1Radius, controls.ball2Radius, controls.ball3Radius];
            var mBallColor = [controls.ball1Color, controls.ball2Color, controls.ball3Color];
            var mBallDensity = [controls.ball1Density, controls.ball2Density, controls.ball3Density];

            if (controls.posUpdateQueue.length > 0) {
                for (var idx = 0; idx < 3; idx++) {
                    if (controls.posUpdateQueue.includes(idx+1)) {
                        removeBalls(mBallInitialList[idx]);
                        mBallInitialList[idx].length = 0;

                        for (var i=0; i<mBallNum[idx]; i++) {
                            const geometry = new THREE.SphereGeometry(mBallRadius[idx], constraints.BALL_SEGMENTS, constraints.BALL_SEGMENTS);
                            const material = new THREE.MeshBasicMaterial({ color: rgb2hex(mBallColor[idx])}); 
                            console.log(mBallColor[idx]);
                            const item = new THREE.Mesh(geometry, material);

                            const position = randomPos(mBallRadius[idx]);
                            item.position.set(position.x, position.y, position.z);
                            scene.add(item);

                            const velocity = randomV();

                            const ball = new Ball(item, position, velocity, mBallRadius[idx], mBallDensity[idx], mBallColor[idx]);
                            mBallInitialList[idx].push(ball);
                        }
                        
                    }
                }
            }
            else {
                if (controls.colorUpdateQueue.length > 0) {                    
                    for (var idx = 0; idx < 3; idx++) {
                        if (controls.colorUpdateQueue.includes(idx+1)) {
                            for (var i=0; i<mBallInitialList[idx].length; i++) {
                                mBallInitialList[idx][i].item.material.color.set(rgb2hex(mBallColor[idx]));
                            }
                        }
                    }
                }
                else {
                    for (var idx = 0; idx < 3; idx++) {
                        if (mBallNum[idx] > 0) {
                            for (var i=0; i<mBallInitialList[idx].length; i++) {
                                mBallInitialList[idx][i].m = mBallDensity[idx];
                            }
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
    const x = Math.random() * (constraints.CONTAINER_LENGTH - 2*radius) - (constraints.CONTAINER_LENGTH / 2 - radius);
    const y = Math.random() * (constraints.CONTAINER_WIDTH - 2*radius) - (constraints.CONTAINER_WIDTH / 2 - radius);
    const z = Math.random() * (constraints.CONTAINER_HEIGHT - 2*radius) - (constraints.CONTAINER_HEIGHT / 2 - radius);
    return { x, y, z };
}

function randomV() {
    const v_x = Math.random()*constraints.MAX_VELOCITY;
    const v_y = Math.random()*constraints.MAX_VELOCITY;
    const v_z = Math.random()*constraints.MAX_VELOCITY;
    return {v_x, v_y, v_z};
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