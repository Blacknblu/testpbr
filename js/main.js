var canvas;
var engine;
var scene;

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

    var CoT = new BABYLON.TransformNode("root");
    CoT.position = new BABYLON.Vector3(0.8,0.8,-0.3);

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");


    var pressText = new BABYLON.GUI.Image("pressText","img/pressText.svg");
    advancedTexture.addControl(pressText);
    pressText.width= "500px";
    pressText.height = "67px";
    pressText.left = "20px";
    pressText.top = "20px";
    pressText.horizontalAlignment = BABYLON.GUI.Image.HORIZONTAL_ALIGNMENT_LEFT;
    pressText.verticalAlignment = BABYLON.GUI.Image.VERTICAL_ALIGNMENT_TOP;

    // var handButton = new BABYLON.GUI.Button.CreateImageOnlyButton("handButton", "img/handButton.png");
    // advancedTexture.addControl(handButton);
    // handButton.width = "90px";
    // handButton.height = "90px";
    // handButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    // handButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    // handButton.top = "20%";
    // handButton.isPointerBlocker = true; 
    // handButton.thickness = 0;
    // handButton.onPointerDownObservable.add(function() {
    //     console.log(isDown);
    //     if(isDown) {
    //         scene.beginAnimation(scene.skeletons[0],1,30,false,1);
    //         isDown=false;
    //     }
    //     else {
    //         scene.beginAnimation(scene.skeletons[0],31,70,false,1);
    //         isDown= true;
    //     }
    // });

    var resetButton = new BABYLON.GUI.Button.CreateImageOnlyButton('resetButton','img/resetButton.svg');
    advancedTexture.addControl(resetButton);
    resetButton.width = "100px";
    resetButton.height = "100px";
    resetButton.horizontalAlignment = BABYLON.GUI.Image.HORIZONTAL_ALIGNMENT_RIGHT;
    resetButton.verticalAlignment = BABYLON.GUI.Image.VERTICAL_ALIGNMENT_BOTTOM;
    resetButton.left= "-20px";
    resetButton.top="-20px";
    resetButton.thickness = 0;
    resetButton.isPointerBlocker = true;
    resetButton.onPointerDownObservable.add(function() {
        resetCamera(scene.getCameraByName('myCamera').position);
    });
    
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
        skyMat.emissiveTexture = new BABYLON.Texture("img/skydomeDiff.jpg",scene);
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
            scene.render();
        });   
    };

    assetsManager.load();
    return scene;
};

window.addEventListener('resize', function() {
    engine.resize();
});


