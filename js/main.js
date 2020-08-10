var canvas;
var engine;
var scene;
var callReset = false;
var callAnimation = false;

document.addEventListener("DOMContentLoaded", startGame);

function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
}

var createScene = function() {
    var scene = new BABYLON.Scene(engine);
    var assetsManager = new BABYLON.AssetsManager(scene);
    BABYLON.Animation.AllowMatricesInterpolation = true;
    var initialCameraPosition = new BABYLON.Vector3(0,2,-5);
    var cameraTarget = new BABYLON.Vector3(0,0.2,0);
    var animationCamera = new BABYLON.Animation("camAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);   
    var isDown = true;

    var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 6, 0), scene);
    light.intensity = 1;

    var hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);

    var animate = function() {
        if(isDown) {
            scene.beginAnimation(scene.skeletons[0],1,30,false,1);
            isDown=false;
        }
        else {
            scene.beginAnimation(scene.skeletons[0],31,70,false,1);
            isDown= true;
        }
    }
    
    var camera = new BABYLON.ArcRotateCamera('myCamera',0,0,5,cameraTarget, scene);
    camera.position=initialCameraPosition;
    camera.upperRadiusLimit = 10;
    camera.lowerRadiusLimit = 2;
    camera.useAutoRotationBehavior = true;
    camera.autoRotationBehavior.idleRotationSpeed = 0.3;
    camera.wheelPrecision = 100;
    camera.pinchPrecision = 100;
    camera.panningSensibility = 0;
    camera.attachControl(canvas, true);
    var resetCamera = function(currPos) {
        var keys = [];
        keys.push({
            frame: 0,
            value: currPos
        });
        keys.push({
            frame: 500,
            value: initialCameraPosition
        });
        animationCamera.setKeys(keys);
        camera.animations = [];
        camera.animations.push(animationCamera);
        scene.beginAnimation(camera,0,40,false, 1);
    };
    
    var skydomeTask = assetsManager.addMeshTask("load_sky","", "models/skydome/", "skydome.babylon");
    skydomeTask.onSuccess = function(task) {
        var sky = task.loadedMeshes[0];
        sky.position = new BABYLON.Vector3(0,0,0);
        sky.scaling = new BABYLON.Vector3(100,100,100);
        var skyMat = new BABYLON.StandardMaterial("skyMat", scene);
        skyMat.disableLighting = true;
        skyMat.backFaceCulling = false;
        skyMat.emissiveTexture = new BABYLON.Texture("img/skydomeDiff.png",scene);
        sky.material = skyMat;
    };

    var meshTask = assetsManager.addMeshTask("load_main","", "models/press/", "press.babylon");
    meshTask.onSuccess = function (task) {
        var press = task.loadedMeshes[0];
        press.position = new BABYLON.Vector3(0,0,0);
        press.scaling = new BABYLON.Vector3(2.5,2.5,2.5);
        press.name = 'press';
        var pressPbr = new BABYLON.PBRMaterial("pressPbr", scene);
        var base = new BABYLON.Texture('img/base.png',scene);
        var metallicRoughness = new BABYLON.Texture('img/metallicRoughness.png',scene);
        var normal = new BABYLON.Texture('img/normal.png',scene);
        pressPbr.albedoTexture = base;
        pressPbr.metallicTexture = metallicRoughness;
        pressPbr.bumpTexture = normal;
        pressPbr.useRoughnessFromMetallicTextureAlpha = false;
        pressPbr.useRoughnessFromMetallicTextureGreen = true;
        pressPbr.useMetallnessFromMetallicTextureBlue = true;
        var hdrTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("img/environment.env", scene);
        pressPbr.reflectionTexture = hdrTexture;
        press.material = pressPbr;
    };

    assetsManager.onFinish = function () {
        engine.runRenderLoop(function () {
            if(callReset) {
                resetCamera(scene.getCameraByName('myCamera').position);
                callReset = false;
            }
            if(callAnimation){
                animate();
                callAnimation = false;
            }
            scene.render();
        });   
    };

    assetsManager.load();
    return scene;
};

window.addEventListener('resize', function() {
    engine.resize();
});

window.addEventListener('load', function() {
    document.getElementById('resetButton').onmousedown = (evt) => {
        evt.preventDefault();
        callReset = true;
    }
    document.getElementById('handButton').onmousedown = (evt) => {
        evt.preventDefault();
        callAnimation = true;
    }
    
})


