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

    var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 6, 0), scene);
    light.intensity = 1;

    var hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);

    var hdrTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("img/environment.env", scene);
    scene.environmentTexture = hdrTexture;
    
    var camera = new BABYLON.ArcRotateCamera('myCamera',0,0,5,new BABYLON.Vector3.Zero(), scene);
    camera.setPosition(new BABYLON.Vector3(0,0,-5));
    camera.attachControl(canvas, true);

    var sphere = new BABYLON.Mesh.CreateSphere('mySphere', 16, 2, scene);
    sphere.position = new BABYLON.Vector3(-2.5,0,0);
    var pbr = new BABYLON.PBRMetallicRoughnessMaterial("pbr", scene);
    sphere.material = pbr;
    pbr.baseColor = new BABYLON.Color3.White();
    pbr.metallic = 0.5;
    pbr.roughness = 0.2;
    pbr.alpha = 0.3;
    

    var poly = new BABYLON.Mesh.CreatePolyhedron('myPoly',{type:3}, scene);
    poly.position = new BABYLON.Vector3.Zero();
    var polyMaterial = new BABYLON.StandardMaterial('polyMat',scene);
    poly.material = polyMaterial;


    var meshTask = assetsManager.addMeshTask("load_main","", "models/", "export.babylon");
    meshTask.onSuccess = function (task) {
        var press = task.loadedMeshes[0];
        press.position = new BABYLON.Vector3(2.5,0,0);
        press.scaling = new BABYLON.Vector3(2.5,2.5,2.5);
        var pressPbr = new BABYLON.PBRMaterial("pressPbr", scene);
        var base = new BABYLON.Texture('models/1014339264_14339264_Base.png',scene);
        var metallicRoughness = new BABYLON.Texture('models/metallicRoughness.png',scene);
        var normal = new BABYLON.Texture('models/1014339264_14339264_Normal.png',scene);
        pressPbr.albedoTexture = base;
        pressPbr.metallicTexture = metallicRoughness;
        pressPbr.bumpTexture = normal;
        pressPbr.useRoughnessFromMetallicTextureAlpha = false;
        pressPbr.useRoughnessFromMetallicTextureGreen = true;
        pressPbr.useMetallnessFromMetallicTextureBlue = true;
        press.material = pressPbr;

    }

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