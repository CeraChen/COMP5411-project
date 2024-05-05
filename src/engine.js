import { Ball } from "./ball.js";
import * as constraints from "./constraints.js";



// GUI 
var controls = new function(){
    // properties
    this.hasUpdated = true; // set false when new balls are added in gui but not renderer in the scene
    this.colorUpdateQueue = [];
    this.posUpdateQueue = [];

    // this.initializationStatus = "no";
    // this.simulatorStatus = "start";

    this.ball1Num = 0;
    this.ball1Radius = 2;
    this.ball1Density = 1;
    this.ball1Color = [255, 255, 255];
    
    this.ball2Num = 0;
    this.ball2Radius = 2;
    this.ball2Density = 1;
    this.ball2Color = [255, 255, 255];

    this.ball3Num = 0;
    this.ball3Radius = 2;
    this.ball3Density = 1;
    this.ball3Color = [255, 255, 255];


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


    // lighting
    this.lightingUpdated = true;

    this.ambientLightColor = [255, 255, 255];
    // this.ambientLightIntensity = 1;

    this.pointLightColor = [255, 255, 255];
    this.pointLightIntensity = 1;


    // phong model
    this.lightingModelChanged = false;

    this.ambientChanged = false;
    this.ambientScaler = 0.5;
    
    this.diffuseChanged = false;
    this.diffuseScaler = 1;
    
    this.specularChanged = false;
    this.specularScaler = 0; 

    this.shininessChanged = false;
    this.shininessScaler = 1;
    
    this.hasUpdatedPhongModel = function() {
        this.lightingModelChanged = false;
        this.ambientChanged = false;
        this.diffuseChanged = false;
        this.specularChanged = false;        
        this.shininessChanged = false;
    };
    
    this.toUpdatePhongModel = function() {
        this.lightingModelChanged = true;
        this.ambientChanged = true;
        this.diffuseChanged = true;
        this.specularChanged = true;        
        this.shininessChanged = true;
    };
}


var hasInitialized = false;
var isSimulating = false; // enable only after initialization, set true when balls start to move
var isDirty = false; // has merged

var setBtn = document.getElementById("set");
var runBtn = document.getElementById("run");
runBtn.disabled = true;


var mergeCounter = document.getElementById("mergeCnt");
var bounceCounter = document.getElementById("bounceCnt");
var ratioCounter = document.getElementById("ratioVal");

setBtn.onclick = function() {
    hasInitialized = !hasInitialized;
    runBtn.disabled = !hasInitialized;
    setBtn.textContent = (hasInitialized)? "Reset" : "Set";
    if (!hasInitialized) {
        removeBalls(mBallList);
        mBallList.length = 0;
    }
};

runBtn.onclick = function() {
    isSimulating = !isSimulating;
    setBtn.disabled = isSimulating;
    runBtn.textContent = (isSimulating)? "Pause" : "Run";

    if (isSimulating) {
        bounceCnt = 0;
        mergeCnt = 0;

        mergeCounter.textContent = String(mergeCnt);  
        bounceCounter.textContent = String(bounceCnt);  
        ratioCounter.textContent = "-";      
    }
};

function createGUI() {
    const gui = new dat.gui.GUI();
    const initialization = gui.addFolder('Balls properties'); // support adding up to three different balls
    const lighting = gui.addFolder('Light properties');

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

    // const onInitialized = function() {
    //     // controls.updateInitializationStatus();
    //     if (hasInitialized) {
    //         initialization.close();
    //         simulation.open();
    //     }
    //     else {            
    //         initialization.open();
    //         simulation.close();
    //     }
    // }
    // initialization.add(controls, "initializationStatus", ["yes", "no"]).name("Confirm").onChange(onInitialized);
    // simulation.add(controls, "simulatorStatus", ["stop", "start"]).name("Simulator");//.onChange(controls.updateSimulatorStatus);

    const phongModel = lighting.addFolder("Phong model");
    phongModel.add(controls, "ambientScaler", 0, 1).name("Ambient").onChange(function() {
        controls.ambientChanged = true;
        controls.lightingModelChanged = true;
    });

    phongModel.add(controls, "diffuseScaler", 0, 1).name("Diffuse").onChange(function() {
        controls.diffuseChanged = true;
        controls.lightingModelChanged = true;
    });
    
    phongModel.add(controls, "specularScaler", 0, 1).name("Specular").onChange(function() {
        controls.specularChanged = true;
        controls.lightingModelChanged = true;
    });

    phongModel.add(controls, "shininessScaler", 0, 1000).name("Shininess").onChange(function() {
        controls.shininessChanged = true;
        controls.lightingModelChanged = true;
    });

    
    const lightControl = lighting.addFolder("Lights");

    const ambientLightControl = lightControl.addFolder("Ambient light");
    ambientLightControl.addColor(controls, "ambientLightColor").name("Color").onChange(function() {
        controls.ambientChanged = true;
        controls.lightingModelChanged = true;
        controls.lightingUpdated = false;
    })
    // ambientLightControl.add(controls, "ambientLightIntensity", 0, 10).name("Intensity").onChange(function() {
    //     controls.lightingUpdated = false;
    // })

    const pointLightControl = lightControl.addFolder("Point light");
    pointLightControl.addColor(controls, "pointLightColor").name("Color").onChange(function() {
        controls.specularChanged = true;
        controls.lightingModelChanged = true;
        controls.lightingUpdated = false;
    })
    pointLightControl.add(controls, "pointLightIntensity", 0, 5).name("Intensity").onChange(function() {
        controls.lightingUpdated = false;
    })
}
createGUI();



// scene
var container = document.getElementById("container");
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1e-2, 1000);
camera.position.x = constraints.CONTAINER_LENGTH*2.2;
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

// var directlight = new THREE.DirectionalLight(0xffffff, 1);
// scene.add(directlight);

var mAmbientLight = new THREE.AmbientLight(0xffffff, controls.ambientScaler);
scene.add(mAmbientLight);

var mPointLight = new THREE.PointLight(0xffffff, 1);
mPointLight.position.set(0.8*constraints.CONTAINER_LENGTH, 0.8*constraints.CONTAINER_WIDTH, 0.8*constraints.CONTAINER_HEIGHT);
scene.add(mPointLight);

var lightGeometry = new THREE.BoxGeometry(2, 2, 2);
var lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
var lightCube = new THREE.Mesh(lightGeometry, lightMaterial);
lightCube.position.copy(mPointLight.position);
scene.add(lightCube);

var geometry = new THREE.BoxGeometry(constraints.CONTAINER_LENGTH, constraints.CONTAINER_WIDTH, constraints.CONTAINER_HEIGHT);
var material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: constraints.CONTAINER_OPACITY });
var cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);


var planeGeometry = new THREE.PlaneGeometry(3*constraints.CONTAINER_LENGTH, 3*constraints.CONTAINER_HEIGHT);
var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x606060, side: THREE.DoubleSide });
var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.position.set(0, -constraints.CONTAINER_WIDTH/2, 0);
planeMesh.rotation.x = Math.PI * -0.5;
scene.add(planeMesh);

var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);



// items
var mBall1List = [];
var mBall2List = [];
var mBall3List = [];
var mBallList = [];

// count
var mergeCnt = 0;
var bounceCnt = 0;


// mainLoop
function mainLoop() {
    requestAnimationFrame(mainLoop);
    if (hasInitialized) {
        // console.log("has initialized, controls.isSimulating", controls.isSimulating);
        if (isSimulating) {
            // console.log("is simulating");
            // update ball motion 
             
            for (var i=0; i<mBallList.length; i++) {
                mBallList[i].update_v_by_acceleration();
                mBallList[i].update_pos();
                mBallList[i].update_v_if_reflected();
            }

            var mMergeGroupList = [];
            for (var i=0; i<mBallList.length; i++) {
                if (!mBallList[i].merged) {
                    var curMergeGroup = [];
                    
                    for (var j=i+1; j<mBallList.length; j++) {
                        if (mBallList[i].collision_check(mBallList[j].pos, mBallList[j].r)) {
                            
                            if (!mBallList[i].merged) {
                                mBallList[i].merged= true;
                                curMergeGroup.push(mBallList[i]);
                            }

                            mBallList[j].merged = true;
                            curMergeGroup.push(mBallList[j]);
                        }
                    }

                    if (curMergeGroup.length > 0) {
                        mMergeGroupList.push(curMergeGroup);
                    }

                    isDirty = mMergeGroupList.length > 0;
                }
            }

            if (isDirty) { 
                for (var i=0; i<mMergeGroupList.length; i++) {
                    var dice = Math.random();
                    if (dice < constraints.MERGING_PROB || mMergeGroupList[i].length > 2) {  
                        mergeCnt += 1;
                        mergeCounter.textContent = String(mergeCnt);                       
                        ratioCounter.textContent = String((mergeCnt/(bounceCnt+mergeCnt)).toFixed(3));
                        
                        var mass = 0;
                        var density = 0;
                        var momentum = [0, 0, 0];
                        var rgb = [0, 0, 0];

                        var x = 0;
                        var y = 0;
                        var z = 0;

                        for (var j=0; j<mMergeGroupList[i].length; j++) {
                            mass += mMergeGroupList[i][j].m;
                            density += mMergeGroupList[i][j].den;

                            momentum[0] += mMergeGroupList[i][j].m*mMergeGroupList[i][j].v.x;
                            momentum[1] += mMergeGroupList[i][j].m*mMergeGroupList[i][j].v.y;
                            momentum[2] += mMergeGroupList[i][j].m*mMergeGroupList[i][j].v.z;

                            x += mMergeGroupList[i][j].pos.x;
                            y += mMergeGroupList[i][j].pos.y;
                            z += mMergeGroupList[i][j].pos.z;

                            rgb[0] += mMergeGroupList[i][j].color[0];
                            rgb[1] += mMergeGroupList[i][j].color[1];
                            rgb[2] += mMergeGroupList[i][j].color[2];
                        }

                        density /= mMergeGroupList[i].length;
                        const radius = Math.floor(Math.pow(mass/density, 1/3)*10)/10;
                        
                        x /= mMergeGroupList[i].length;
                        y /= mMergeGroupList[i].length;
                        z /= mMergeGroupList[i].length;
                        const position = {x, y, z};

                        const velocity = {x: momentum[0]/mass, y: momentum[1]/mass, z: momentum[2]/mass};
                        const color = [rgb[0]/mMergeGroupList[i].length*controls.diffuseScaler, 
                                        rgb[1]/mMergeGroupList[i].length*controls.diffuseScaler,
                                        rgb[2]/mMergeGroupList[i].length*controls.diffuseScaler];


                        // const mass = sum(m);
                        // const position = average();
                        // const density = average();
                        // const r = Math.floor(Math.pow(mass/density, 1/3)*10)/10; // %0.1

                        // const velocity = momentumConversed();
                        // const color = average()(weight m);

                        const geometry = new THREE.SphereGeometry(radius, constraints.BALL_SEGMENTS, constraints.BALL_SEGMENTS);
                        const material = new THREE.MeshPhongMaterial({ color: rgb2hex(color)}); 
                        const item = new THREE.Mesh(geometry, material);
                        item.position.set(position.x, position.y, position.z);
                        scene.add(item);

                        const ball = new Ball(item, position, velocity, radius, density, color);
                        mBallList.push(ball);
                    }
                    else {    
                        bounceCnt += 1;
                        bounceCounter.textContent = String(bounceCnt);
                        ratioCounter.textContent = String((mergeCnt/(bounceCnt+mergeCnt)).toFixed(3));

                        for (var j=0; j<mMergeGroupList[i].length; j++) {
                            mMergeGroupList[i][j].merged = false;
                        }
                        const momentum = {
                            x: mMergeGroupList[i][0].v.x*mMergeGroupList[i][0].m + mMergeGroupList[i][1].v.x*mMergeGroupList[i][1].m,
                            y: mMergeGroupList[i][0].v.y*mMergeGroupList[i][0].m + mMergeGroupList[i][1].v.y*mMergeGroupList[i][1].m,
                            z: mMergeGroupList[i][0].v.z*mMergeGroupList[i][0].m + mMergeGroupList[i][1].v.z*mMergeGroupList[i][1].m
                        }
                        const v_extra = randomV(0.3);
                        const v_0 = {
                            x: -1*Math.sign(mMergeGroupList[i][0].v.x)*(v_extra.x + ((momentum.x*mMergeGroupList[i][0].v.x < 0)? (Math.abs(momentum.x)/mMergeGroupList[i][0].m) : 0)),
                            y: -1*Math.sign(mMergeGroupList[i][0].v.y)*(v_extra.y + ((momentum.y*mMergeGroupList[i][0].v.y < 0)? (Math.abs(momentum.y)/mMergeGroupList[i][0].m) : 0)),
                            z: -1*Math.sign(mMergeGroupList[i][0].v.z)*(v_extra.z + ((momentum.z*mMergeGroupList[i][0].v.z < 0)? (Math.abs(momentum.z)/mMergeGroupList[i][0].m) : 0))
                        };
                        const v_1 = {
                            x: -1*Math.sign(mMergeGroupList[i][1].v.x)*(v_extra.x + ((momentum.x*mMergeGroupList[i][1].v.x < 0)? (Math.abs(momentum.x)/mMergeGroupList[i][1].m) : 0)),
                            y: -1*Math.sign(mMergeGroupList[i][1].v.y)*(v_extra.y + ((momentum.y*mMergeGroupList[i][1].v.y < 0)? (Math.abs(momentum.y)/mMergeGroupList[i][1].m) : 0)),
                            z: -1*Math.sign(mMergeGroupList[i][1].v.z)*(v_extra.z + ((momentum.z*mMergeGroupList[i][1].v.z < 0)? (Math.abs(momentum.z)/mMergeGroupList[i][1].m) : 0))
                        };
                        mMergeGroupList[i][0].v = v_0;
                        mMergeGroupList[i][1].v = v_1;
                    }

                }


                var tmpList = [];
                for (var i=0; i<mBallList.length; i++) {
                    if (mBallList[i].merged) {
                        scene.remove(mBallList[i].item);
                    }
                    else {
                        tmpList.push(mBallList[i]);
                    }
                }
                mBallList = tmpList;
                isDirty = false;
            }
        }
    }
    else {   
        // console.log("hasn't initialized");
        if (!controls.hasUpdated) {  
            // update ball props           
            var mBallInitialList = [mBall1List, mBall2List, mBall3List];    
            var mBallNum = [controls.ball1Num, controls.ball2Num, controls.ball3Num];
            var mBallRadius = [controls.ball1Radius, controls.ball2Radius, controls.ball3Radius];
            var mBallColor = [controls.ball1Color, controls.ball2Color, controls.ball3Color];
            var mBallDensity = [controls.ball1Density, controls.ball2Density, controls.ball3Density];

            if (controls.posUpdateQueue.length > 0 || isDirty) {
                for (var idx = 0; idx < 3; idx++) {
                    if (controls.posUpdateQueue.includes(idx+1)) {
                        removeBalls(mBallInitialList[idx]);
                        mBallInitialList[idx].length = 0;

                        for (var i=0; i<mBallNum[idx]; i++) {
                            const geometry = new THREE.SphereGeometry(mBallRadius[idx], constraints.BALL_SEGMENTS, constraints.BALL_SEGMENTS);
                            const material = new THREE.MeshPhongMaterial({ color: rgb2hex(mBallColor[idx])}); 
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
                mBallList = mBall1List.concat(mBall2List, mBall3List);
            }
            else {
                if (controls.colorUpdateQueue.length > 0) {                    
                    for (var idx = 0; idx < 3; idx++) {
                        if (controls.colorUpdateQueue.includes(idx+1)) {
                            for (var i=0; i<mBallInitialList[idx].length; i++) {
                                var diffuseColor = [mBallColor[idx][0]*controls.diffuseScaler, mBallColor[idx][1]*controls.diffuseScaler, mBallColor[idx][2]*controls.diffuseScaler];
                                mBallInitialList[idx][i].item.material.color.set(rgb2hex(diffuseColor));
                                mBallInitialList[idx][i].color = mBallColor[idx];
                            }
                        }
                    }
                }
                else {
                    for (var idx = 0; idx < 3; idx++) {
                        if (mBallNum[idx] > 0) {
                            for (var i=0; i<mBallInitialList[idx].length; i++) {
                                mBallInitialList[idx][i].den = mBallDensity[idx];                                
                                mBallInitialList[idx][i].m = mBallInitialList[idx][i].den*mBallInitialList[idx][i].r**3;
                            }
                        }
                    }
                }
            }
            controls.hasUpdatedBallProps();            
            controls.toUpdatePhongModel();
        }
    }

    if (!controls.lightingUpdated) {
        mPointLight.color = new THREE.Color(rgb2hex(controls.pointLightColor));
        mPointLight.intensity = controls.pointLightIntensity;
        lightCube.material.color.set(rgb2hex(controls.pointLightColor));

        mAmbientLight.color = new THREE.Color(rgb2hex(controls.ambientLightColor)); // 设置点光源的颜色为红色
        // mAmbientLight.intensity = controls.ambientLightIntensity;

        controls.lightingUpdated = true;
    }

    if (controls.lightingModelChanged) {
        updateLighting();
        controls.hasUpdatedPhongModel();
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

function randomV(scaler=1) {
    const x = Math.random()*constraints.MAX_VELOCITY*scaler;
    const y = Math.random()*constraints.MAX_VELOCITY*scaler;
    const z = Math.random()*constraints.MAX_VELOCITY*scaler;
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


// Phong lighting
function updateLighting() {
    if (controls.ambientChanged) {
        mAmbientLight.intensity = controls.ambientScaler;
    }

    for (var i=0; i<mBallList.length; i++) {
        // if (controls.ambientChanged) {
        //     var ambientColor = [controls.ambientLightColor[0]*controls.ambientScaler, controls.ambientLightColor[1]*controls.ambientScaler, controls.ambientLightColor[2]*controls.ambientScaler];
        //     mBallList[i].item.material.ambient.set(rgb2hex(ambientColor));            
        // }

        if (controls.diffuseChanged) {
            var diffuseColor = [mBallList[i].color[0]*controls.diffuseScaler, mBallList[i].color[1]*controls.diffuseScaler, mBallList[i].color[2]*controls.diffuseScaler];
            mBallList[i].item.material.color.set(rgb2hex(diffuseColor));  
        }
        
        if (controls.specularChanged) {
            var specularColor = [controls.pointLightColor[0]*controls.specularScaler, controls.pointLightColor[1]*controls.specularScaler, controls.pointLightColor[2]*controls.specularScaler];
            mBallList[i].item.material.specular.set(rgb2hex(specularColor));  
        }

        if (controls.shininessChanged) {
            mBallList[i].item.material.shininess = controls.shininessScaler;  
        }
    }

    if (controls.diffuseChanged) {
        var diffuseColor = [255*controls.diffuseScaler, 255*controls.diffuseScaler, 255*controls.diffuseScaler];
        cube.material.color.set(rgb2hex(diffuseColor));  
    }
    
    if (controls.specularChanged) {
        var specularColor = [controls.pointLightColor[0]*controls.specularScaler, controls.pointLightColor[1]*controls.specularScaler, controls.pointLightColor[2]*controls.specularScaler];
        cube.material.specular.set(rgb2hex(specularColor));  
    }

    if (controls.shininessChanged) {
        cube.material.shininess = controls.shininessScaler;  
    }
}

mainLoop();