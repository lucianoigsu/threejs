import * as THREE from '/node_modules/three/build/three.module.js';

// Observe a scene or a renderer
if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
    __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
    __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
}

var activeCamera,camera,cameraTop, scene, renderer, dirLight, hemiLight;
var group,cube,cone,sphere;

var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector3();
var selectedObject = null;

init();
animate();

function init() {

    var container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.set( 0, 0, 250 );
    activeCamera = camera;

    cameraTop = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
    cameraTop.position.set(0, 400, 250 );
    cameraTop.rotation.set(-1,0,0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xadcdff)
    scene.fog = new THREE.Fog( scene.background, 1, 5000 );

    setLights();
    setGround();
    setObjects();
    setEventListeners();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( "mousemove", onDocumentMouseMove, false );
}

function setObjects(){
    group = new THREE.Group();
	scene.add( group );

    var cubeGeo = new THREE.BoxGeometry(10,10,10);
    var cubeMat = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    cube = new THREE.Mesh( cubeGeo, cubeMat );
    cube.receiveShadow = true;
    cube.castShadow = true;
    cube.position.x = 20;
    group.add(cube);

    var geometry = new THREE.ConeGeometry( 5, 20, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    cone = new THREE.Mesh( geometry, material );
    cone.receiveShadow = true;
    cone.castShadow = true;
    cone.position.x = 50;
    group.add( cone )

    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00aa00} );
    sphere = new THREE.Mesh( geometry, material );
    sphere.receiveShadow = true;
    sphere.castShadow = true;
    sphere.position.z = 10;
    sphere.position.y = -5;
    group.add( sphere );
}

function onDocumentMouseMove( event ) {

    event.preventDefault();
    if ( selectedObject ) {
        selectedObject = null;
    }
    var intersects = getIntersects( event.layerX, event.layerY );
    if ( intersects.length > 0 ) {

        var res = intersects.filter( function ( res ) {
            return res && res.object;
        } )[ 0 ];

        if ( res && res.object ) {
            selectedObject = res.object;
            switch (res.object.geometry.type) {
                case "SphereGeometry":
                    if(selectedObject.position.y < 10)
                        selectedObject.position.y +=0.1;
                    else
                        selectedObject.position.y = 0;
                    break;
            
                case "ConeGeometry":
                    selectedObject.rotation.z += 0.1
                    break

                case "BoxGeometry":
                    selectedObject.rotation.y += 0.1
                        break
            }
        }
    }
}

function getIntersects( x, y ) {

    x = ( x / window.innerWidth ) * 2 - 1;
    y = - ( y / window.innerHeight ) * 2 + 1;

    mouseVector.set( x, y, 0.5 );
    raycaster.setFromCamera( mouseVector, activeCamera );

    return raycaster.intersectObject( group, true );
}

function setLights(){
    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.39, 0.82, 0.36 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    dirLight = new THREE.DirectionalLight( 0xff4b2b, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( - 1, 1.75, 1 );
    dirLight.position.multiplyScalar( 30 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;

    var dir = 50;

    dirLight.shadow.camera.left = - dir;
    dirLight.shadow.camera.right = dir;
    dirLight.shadow.camera.top = dir;
    dirLight.shadow.camera.bottom = - dir;

    dirLight.shadow.camera.far = 1000;
    dirLight.shadow.bias = - 0.0001;
}

function setGround(){
    var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
    var groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    groundMat.color.setRGB( 0.9, 0.5, 0.05 );

    var ground = new THREE.Mesh( groundGeo, groundMat );
    ground.position.y = - 33;
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );
}

function setEventListeners(){
    var hemiLightButton = document.getElementById( 'hemiLight' );
    hemiLightButton.addEventListener( 'click', function () {
        hemiLight.visible = ! hemiLight.visible;
    } );

    var dirLightButton = document.getElementById( 'dirLight' );
    dirLightButton.addEventListener( 'click', function () {
        dirLight.visible = ! dirLight.visible;
    } );

    var cameraSideButton = document.getElementById( 'cameraSide' );
    cameraSideButton.addEventListener( 'click', function () {
        activeCamera = camera;
    } );

    var cameraTopButton = document.getElementById( 'cameraTop' );
    cameraTopButton.addEventListener( 'click', function () {
        activeCamera = cameraTop;
    } );

    var addObjectButton = document.getElementById( 'addObj' );
    addObjectButton.addEventListener( 'click', createRandomObject );
}

function createRandomObject(){
    var cubeGeo = new THREE.BoxGeometry(getRandom(10),getRandom(10),getRandom(10));
    var cubeMat = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    cubeMat.color.setRGB( getRandom(1,false), getRandom(1,false), getRandom(1,false) );
    var newCube = new THREE.Mesh( cubeGeo, cubeMat );
    newCube.receiveShadow = true;
    newCube.castShadow = true;
    newCube.position.x = getRandom(50);
    newCube.position.y = getRandom(50);
    newCube.position.z = getRandom(50);
    group.add(newCube);
}

function getRandom(max,floor=true){
    return floor ? Math.floor(Math.random() * max) : Math.random() * max
}

function animate() {

    requestAnimationFrame( animate );

    render();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {

    renderer.render( scene, activeCamera );
}