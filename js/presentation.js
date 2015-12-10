function padZeros(value, numberOfDigits){
	var result = ""+value;
	while(result.length < numberOfDigits){
		result = "0" + result;
	}
	return result;
}

var lastTimeStamp = "";

function updateCurrentTime() {

	var now = new Date();
	var hours = now.getHours();
	var ampm = "am";

	if(hours >= 12) {
		if(hours > 12) {
			hours -= 12;
		}
		ampm = "pm";
	}
	var timeStamp = hours + ":" + padZeros(now.getMinutes(), 2) + " " + ampm;

	if(timeStamp != lastTimeStamp){
		document.getElementById("currentTime").innerHTML = timeStamp;	
		lastTimeStamp = timeStamp;
	}
}


var renderer;
var scene;
var camera;
var textGeo;
var textObjectSolid;
var textObjectWire;

var text;

var targetTextPosition;
var targetWireAlpha = 0.4;
var targetSolidAlpha = 0.2;


function resizeViewport(width, height) {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
}


function updateState(){
	
	var show3D = Reveal.getCurrentSlide().classList.contains("show3D");
	
	if(show3D) {
		targetTextPosition.set(0, 3, -5);
		targetWireAlpha = 0.4;
		targetSolidAlpha = 1;
	} else {
		targetTextPosition.set(0, 0, 10);
		targetWireAlpha = 0.025;
		targetSolidAlpha = 0.15;
	}
}


function initThreeJS() {

	targetTextPosition = new THREE.Vector3(0,5,0);

	renderer = new THREE.WebGLRenderer({antialias:true});
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(20, window.innerHeight/window.innerWidth);

	camera.position.set(0, 0, 80);
	camera.lookAt(scene.position);

	renderer.setClearColor(0x002b36);

	var light = new THREE.PointLight( 0xa2cce6, 1, 100 );
	light.position.set( 15, 15, 10 );
	scene.add( light );

	textGeo = new THREE.TextGeometry( "PDXCC", {
		size: 10,
		height: 4,
		curveSegments: 8,
		font: "Titillium Web",
		weight:"bold",
		style:"normal"
	});

	textGeo.computeBoundingBox();
	textGeo.center();

	textObjectWire = new THREE.Mesh( textGeo, new THREE.MeshPhongMaterial({
		blending:THREE.AdditiveBlending,
		wireframe:true,
		depthTest:false,
		depthWrite:false,
		emissive:0x558996,
		opacity:0.2,
		transparent:true
	}) );

	textObjectSolid = new THREE.Mesh( textGeo, new THREE.MeshPhongMaterial({
		blending:THREE.AdditiveBlending,
		color:0xffffff,
		specular:0xffffff,
		shininess:80,
		transparent:true,
		depthTest:false
	}) );

	textObject = new THREE.Object3D();
	textObject.add(textObjectWire);
	textObject.add(textObjectSolid);


	textObject.position.y = 4;

	scene.add(textObject);

	document.getElementById("overlays").appendChild(renderer.domElement);

	resizeViewport(window.innerWidth, window.innerHeight);

	window.addEventListener("resize", function() {
		resizeViewport(window.innerWidth, window.innerHeight);		
	});

	render();
	updateState();
}


function glitchify() {
	for(var i = 0; i < textGeo.vertices.length; i++){
		textGeo.vertices[i].y += (Math.random() * ((textGeo.vertices[i].y + 8) + (textGeo.vertices[i].x + 20))) * 0.1;
		textGeo.vertices[i].x += (Math.random() * ((textGeo.vertices[i].y + 8) + (textGeo.vertices[i].x + 20))) * 0.1;
		//	textGeo.vertices[i].x += Math.random() * (textGeo.vertices[i].z + 10);
	}
	textGeo.verticesNeedUpdate = true;
}

function render(now) {

	// fade opacity.
	textObjectWire.material.opacity += (targetWireAlpha - textObjectWire.material.opacity) * 0.05;
	textObjectSolid.material.opacity += (targetSolidAlpha - textObjectSolid.material.opacity) * 0.05;

	// slowly wobble
	textObject.rotation.y = Math.sin(now*0.0001) * 0.25;
	textObject.rotation.x = Math.sin(now*0.00034) * 0.15;

	// lerp to target position.
	textObject.position.lerp(targetTextPosition, 0.05);

	renderer.render(scene, camera);
	updateCurrentTime();

	window.requestAnimationFrame(render);
}