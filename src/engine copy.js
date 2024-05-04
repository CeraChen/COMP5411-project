//生成的纹理的分辨率，纹理必须是标准的尺寸 256*256 1024*1024  2048*2048
var resolution = 2048;
var fbo;
var last = 0;
var updateLast = 0;
var updateLast4light = 0;

// Object
var floorTransform = setTransform(0, 0, -30, 4, 4, 4);
var obj1Transform = setTransform(0, 0, 0, 20, 20, 20);
var obj2Transform = setTransform(40, 0, -40, 10, 10, 10);



// light color
var lightColor = [1.0, 1.0, 1.0];//[255/255, 218/255, 185/255];//[1, 1, 1];
var lightPos = [0, 80, 80];
var glslShadow = "none";
var glslSample = "uniform";
var glslName = "./src/shaders/phongShader/phongFragment_none.glsl";

var controls = new function(){
	this.camRotate = false;
	this.lightRotate = false;
	this.orbitSpeed = 1/6;
	this.shadowStrategy = "none";
	this.sampleStrategy = "uniform";
	this.color = [255, 255, 255];
	this.lightX = 0;
	this.lightY = 80;
	this.lightZ = 80;

	this.Marry1x = 0;
	this.Marry1y = 0;
	this.Marry1z = 0;	
	this.Marry1s = 20;

	this.Marry2x = 40;
	this.Marry2y = 0;
	this.Marry2z = -40;	
	this.Marry2s = 10;

}




BallMotionSimulator();

function lightPosChanged(){
	return lightPos[0] != controls.lightX || lightPos[1] != controls.lightY || lightPos[2] != controls.lightZ;
}

function lightColorChanged(currentLightColor){
	return lightColor[0] != currentLightColor[0] || lightColor[1] != currentLightColor[1] || lightColor[2] != currentLightColor[2];
}

function characterChanged(){
	if(obj1Transform['modelTransX'] != controls.Marry1x || obj1Transform['modelTransY'] != controls.Marry1y || obj1Transform['modelTransZ'] != controls.Marry1z)
		return true;

	if(obj1Transform['modelScaleX'] != controls.Marry1s || obj1Transform['modelScaleY'] != controls.Marry1s || obj1Transform['modelScaleZ'] != controls.Marry1s)
		return true;

	if(obj2Transform['modelTransX'] != controls.Marry2x || obj2Transform['modelTransY'] != controls.Marry2y || obj2Transform['modelTransZ'] != controls.Marry2z)
		return true;

	if(obj2Transform['modelScaleX'] != controls.Marry2s || obj2Transform['modelScaleY'] != controls.Marry2s || obj2Transform['modelScaleZ'] != controls.Marry2s)
		return true;

	return false;
}

function BallMotionSimulator() {
	// Init canvas and gl
	const canvas = document.querySelector('#glcanvas');
	canvas.width = window.screen.width;
	canvas.height = window.screen.height;
	const gl = canvas.getContext('webgl');
	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	}

	// Add camera
	let cameraPosition = [100, 100, 100];
	const camera = new THREE.PerspectiveCamera(75, gl.canvas.clientWidth / gl.canvas.clientHeight, 1e-2, 1000);
	camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

	// Add resize listener
	function setSize(width, height) {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}
	setSize(canvas.clientWidth, canvas.clientHeight);
	window.addEventListener('resize', () => setSize(canvas.clientWidth, canvas.clientHeight));

	// Add camera control
	const cameraControls = new THREE.OrbitControls(camera, canvas);
	cameraControls.enableZoom = true;
	cameraControls.enableRotate = true;
	cameraControls.enablePan = true;
	cameraControls.rotateSpeed = 0.3;
	cameraControls.zoomSpeed = 1.0;
	cameraControls.panSpeed = 0.8;
	cameraControls.target.set(0, 0, 0);

	// Add renderer
	const renderer = new WebGLRenderer(gl, camera);

	// Add lights
	// light - is open shadow map == true
	let focalPoint = [0, 0, 0];
	let lightUp = [0, 1, 0];
	var directionLight = new DirectionalLight(5000, lightColor, lightPos, focalPoint, lightUp, true, renderer.gl);
	
	
	renderer.addLight(directionLight);



	

	loadOBJ(renderer, 'assets/mary/', 'Marry', 'PhongMaterial', obj1Transform, glslName, "Marry1", updateLast);
	loadOBJ(renderer, 'assets/mary/', 'Marry', 'PhongMaterial', obj2Transform, glslName, "Marry2", updateLast);
	loadOBJ(renderer, 'assets/floor/', 'floor', 'PhongMaterial', floorTransform, glslName, "floor", updateLast);
	

	function createGUI() {
		const gui = new dat.gui.GUI();
		
		const shadowModel = gui.addFolder('Shadow properties');
		shadowModel.add(controls, "shadowStrategy", ["none", "default", "PCF", "PCSS"]).name('shadow strategy');
		shadowModel.add(controls, "sampleStrategy", ["uniform", "poisson"]).name('sample strategy');


		const lightModel = gui.addFolder('Light properties');
		lightModel.addColor(controls, "color").name('light color');
		lightModel.add(controls, "lightX").name('position x');
		lightModel.add(controls, "lightY").name('position y');
		lightModel.add(controls, "lightZ").name('position z');

		const characterModel = gui.addFolder('Character properties');
		const Marry1 = characterModel.addFolder('Marry No.1');
		Marry1.add(controls, "Marry1x").name('x');
		Marry1.add(controls, "Marry1y").name('y');
		Marry1.add(controls, "Marry1z").name('z');
		Marry1.add(controls, "Marry1s", 0, 100).name('scale');

		const Marry2 = characterModel.addFolder('Marry No.2');
		Marry2.add(controls, "Marry2x").name('x');
		Marry2.add(controls, "Marry2y").name('y');
		Marry2.add(controls, "Marry2z").name('z');
		Marry2.add(controls, "Marry2s", 0, 100).name('scale');

		
		const displayModel = gui.addFolder('Display properties');
		displayModel.add(controls, "lightRotate").name('light rotation');
		displayModel.add(controls, "camRotate").name('camera rotation');
		displayModel.add(controls, "orbitSpeed", -2, 2).name('camera speed');

		shadowModel.open();
		lightModel.open();
		displayModel.open();
	}
	createGUI();


	function mainLoop(now) {		
		let update = Math.trunc(now)/5000;
		if(update > updateLast){
			let currentLightColor = [controls.color[0]/255, controls.color[1]/255, controls.color[2]/255];
			let changed = false;

			if(lightColorChanged(currentLightColor) || lightPosChanged() && !controls.lightRotate){
				let currentLightPos = [controls.lightX, controls.lightY, controls.lightZ];
				lightPos = currentLightPos;
				lightColor = currentLightColor;
				changed = true;
			}

			if(Math.trunc(update*3) > updateLast4light && controls.lightRotate){
				console.log(update);
				updateLast4light = Math.trunc(update*3);
				let i = (update)%(12);
				h = lightPos[1];
				r = Math.sqrt(lightPos[0]**2+lightPos[2]**2);
				lightPos = [r*Math.sin(Math.PI*(1/4+i/6)), h, r*Math.cos(Math.PI*(1/4+i/6))];
				controls.lightX = lightPos[0];
				controls.lightY = lightPos[1];
				controls.lightZ = lightPos[2];
				changed = true;
			}

			if(characterChanged()){
				obj1Transform = setTransform(controls.Marry1x, controls.Marry1y, controls.Marry1z, controls.Marry1s, controls.Marry1s, controls.Marry1s);
				obj2Transform = setTransform(controls.Marry2x, controls.Marry2y, controls.Marry2z, controls.Marry2s, controls.Marry2s, controls.Marry2s);
				changed = true;
			}

			if(glslShadow != controls.shadowStrategy || glslSample != controls.sampleStrategy){
				if(controls.shadowStrategy == "PCF" || controls.shadowStrategy == "PCSS"){
					glslName = "./src/shaders/phongShader/phongFragment_" + controls.shadowStrategy + '_' + controls.sampleStrategy + ".glsl";
				}
				else{
					glslName = "./src/shaders/phongShader/phongFragment_" + controls.shadowStrategy + ".glsl";
				}
				glslShadow = controls.shadowStrategy;
				glslSample = controls.sampleStrategy;
				changed = true;
			}

			if(changed){
				renderer.clearLight();
				let focalPoint = [0, 0, 0];
				let lightUp = [0, 1, 0];
				var directionLight = new DirectionalLight(5000, lightColor, lightPos, focalPoint, lightUp, true, renderer.gl);		
				renderer.addLight(directionLight);

				loadOBJ(renderer, 'assets/mary/', 'Marry', 'PhongMaterial', obj1Transform, glslName, "Marry1", update);
				loadOBJ(renderer, 'assets/mary/', 'Marry', 'PhongMaterial', obj2Transform, glslName, "Marry2", update);
				loadOBJ(renderer, 'assets/floor/', 'floor', 'PhongMaterial', floorTransform, glslName, "floor", update);
			}

			updateLast = update;
		}




		let time = Math.trunc(now)/2000;
		if(time > last){
			if(controls.camRotate){
				let i = (time)%(2/controls.orbitSpeed);
				last = time;

				h = camera.position.y;
				r = Math.sqrt(camera.position.x**2+camera.position.z**2);
				camera.position.set(r*Math.sin(Math.PI*(1/4+i*controls.orbitSpeed)), h, r*Math.cos(Math.PI*(1/4+i*controls.orbitSpeed)));
			}
		}


		
		
		cameraControls.update();
		renderer.render();
		requestAnimationFrame(mainLoop);
	}




	requestAnimationFrame(mainLoop);
}

function setTransform(t_x, t_y, t_z, s_x, s_y, s_z) {
	return {
		modelTransX: t_x,
		modelTransY: t_y,
		modelTransZ: t_z,
		modelScaleX: s_x,
		modelScaleY: s_y,
		modelScaleZ: s_z,
	};
}
