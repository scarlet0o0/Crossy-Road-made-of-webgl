var gl;
var points = [];
var colors = [];
var bufferId;
var cBufferId;

var displ = [0, 0, 0];
var tree_displ = [0, 0, -20];
var displLoc;
var theta1 = [-10, 0, 0]; //플레이어 각도
var theta2 = [0, 0, 0];
var thetaLoc;
var player_location = [0,0,18];
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye = vec3(0.0, 10.0, 20.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var cameraVec = vec3(0.0, -0.57735, -0.57735);//vec3(-0.57735, -0.57735, -0.57735);

var trballMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

var color_arr = [8,8,9,9,9,9,8,8,8,8,9,9,8,8,9,9,9,9,9,9,8,8,9,9,8,9,8,8,8,8,9,9,9,8,8,9,8,8,9,9,9,9,8,8,8,9,9,9,9];
var g_r_num = 0
var g_num = 0;
var g_arr = [2,4];
var rand_0_1 = 8;

var w_click = 0;
var tree_num = 0;
var tree_location = [];
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available!");
    }

    generateColorCube();
    generateGround();
    //generateTree();

    // virtual trackball
    var trball = trackball(canvas.width, canvas.height);
    var mouseDown = false;
    canvas.addEventListener("mousedown", function (event) {
        trball.start(event.clientX, event.clientY);
        mouseDown = true;
    });
    canvas.addEventListener("mouseup", function (event) {
        mouseDown = false;
    });
    canvas.addEventListener("mousemove", function (event) {
        if (mouseDown) {
            trball.end(event.clientX, event.clientY);
            trballMatrix = mat4(trball.rotationMatrix);
        }
    });

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    // Enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(0.01, 1);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create a buffer object, initialize it, and associate it with 
    // the associated attribute variable in our vertex shader
    cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    displLoc = gl.getUniformLocation(program, "displ"); // 가져오기
    thetaLoc = gl.getUniformLocation(program, "theta");// 가져오기

    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));


    var aspectRatio = canvas.width / canvas.height;
    projectionMatrix = perspective(90, aspectRatio, 0.1, 1000);
    
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
    var sinTheta = Math.sin(0.1);
    var cosTheta = Math.cos(0.1);
    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    
    at[0] = eye[0] + cameraVec[0];
    at[1] = eye[1] + cameraVec[1];
    at[2] = eye[2] + cameraVec[2];
    modelViewMatrix = lookAt(eye, at, up);
    var modelView = mult(modelViewMatrix, trballMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelView));

    
    displ[0] = player_location[0];
    displ[1] = player_location[1];
    displ[2] = player_location[2];
    gl.uniform3fv(displLoc,displ);
    gl.uniform3fv(thetaLoc, theta1)
    gl.drawArrays(gl.TRIANGLES, 0, 180);//gl.drawArrays(gl.TRIANGLES, 0, 36);

    displ[0] = 0.0;
    displ[1] = 0.0;
    displ[2] = 0.0;
    gl.uniform3fv(displLoc,displ);
    gl.uniform3fv(thetaLoc, theta2)
    gl.drawArrays(gl.TRIANGLES, 180, 9840);

    for(var i = 0; i<tree_num; i++){
        tree_displ[0] = tree_location[i][0];
        tree_displ[2] = tree_location[i][1];
        gl.uniform3fv(displLoc,tree_displ);
        gl.uniform3fv(thetaLoc, theta2)
        gl.drawArrays(gl.TRIANGLES, 10020+(36*i), 72);
    }
    
    console.log(points.length,colors.length);
    requestAnimationFrame(render);
}

function generateColorCube() {
    var color_num = 6;
    for(var i=0;i<5;i++){
        if(i == 2){
            color_num = 12;
        }
        else if(i == 4){
            color_num = 1;
        }
        quad(1+(i*8), 0+(i*8), 3+(i*8), 2+(i*8),color_num);
        quad(2+(i*8), 3+(i*8), 7+(i*8), 6+(i*8),color_num);
        quad(3+(i*8), 0+(i*8), 4+(i*8), 7+(i*8),color_num);
        quad(4+(i*8), 5+(i*8), 6+(i*8), 7+(i*8),color_num);
        quad(5+(i*8), 4+(i*8), 0+(i*8), 1+(i*8),color_num);
        quad(6+(i*8), 5+(i*8), 1+(i*8), 2+(i*8),color_num);
    }
}

function generateTree() {
    tree_up(1, 0, 3, 2);
    tree_up(2, 3, 7, 6);
    tree_up(3, 0, 4, 7);
    tree_up(4, 5, 6, 7);
    tree_up(5, 4, 0, 1);
    tree_up(6, 5, 1, 2);

    tree_down(1, 0, 3, 2);
    tree_down(2, 3, 7, 6);
    tree_down(3, 0, 4, 7);
    tree_down(4, 5, 6, 7);
    tree_down(5, 4, 0, 1);
    tree_down(6, 5, 1, 2);
}
function generateTreeColor() {
    treequad(11);
    treequad(11);
    treequad(11);
    treequad(11);
    treequad(11);
    treequad(11);

    treequad(10);
    treequad(10);
    treequad(10);
    treequad(10);
    treequad(10);
    treequad(10);
}

const vertexPos = [
    vec4(-1, -1, -1, 1.0),
    vec4(1, -1, -1, 1.0),
    vec4(1, 1, -1, 1.0),
    vec4(-1, 1, -1, 1.0),
    vec4(-1, -1, 1, 1.0),
    vec4(1, -1, 1, 1.0),
    vec4(1, 1, 1, 1.0),
    vec4(-1, 1, 1, 1.0),

    //위에
    vec4(-1, 1, -1, 1.0),
    vec4(1, 1, -1, 1.0),
    vec4(1, 2, -1, 1.0),
    vec4(-1, 2, -1, 1.0),
    vec4(-1, 1, 0.2, 1.0),
    vec4(1, 1, 0.2, 1.0),
    vec4(1, 2, 0.2, 1.0),
    vec4(-1, 2, 0.2, 1.0),

    //오른쪽
    vec4(1, -0.6, -0.9, 1.0),
    vec4(2, -0.6, -0.9, 1.0),
    vec4(2, 0.6, -0.9, 1.0),
    vec4(1, 0.6, -0.9, 1.0),
    vec4(1, -0.6, 0.5, 1.0),
    vec4(2, -0.6, 0.5, 1.0),
    vec4(2, 0.6, 0.5, 1.0),
    vec4(1, 0.6, 0.5, 1.0),

    //왼쪽
    vec4(-2, -0.6, -0.9, 1.0),
    vec4(-1, -0.6, -0.9, 1.0),
    vec4(-1, 0.6, -0.9, 1.0),
    vec4(-2, 0.6, -0.9, 1.0),
    vec4(-2, -0.6, 0.5, 1.0),
    vec4(-1, -0.6, 0.5, 1.0),
    vec4(-1, 0.6, 0.5, 1.0),
    vec4(-2, 0.6, 0.5, 1.0),

    //벼슬
    vec4(-0.2, 2, -1, 1.0),
    vec4(0.2, 2, -1, 1.0),
    vec4(0.2, 2.8, -1, 1.0),
    vec4(-0.2, 2.8, -1, 1.0),
    vec4(-0.2, 2, 0, 1.0),
    vec4(0.2, 2, 0, 1.0),
    vec4(0.2, 2.8, 0, 1.0),
    vec4(-0.2, 2.8, 0, 1.0)
];

const vertexColor = [
    vec4(0.0, 0.0, 0.0, 1.0),   // black 0
    vec4(1.0, 0.0, 0.0, 1.0),   // red 1
    vec4(1.0, 1.0, 0.0, 1.0),   // yellow 2
    vec4(0.0, 1.0, 0.0, 1.0),   // green 3
    vec4(0.0, 0.0, 1.0, 1.0),   // blue 4
    vec4(1.0, 0.0, 1.0, 1.0),   // magenta 5
    vec4(1.0, 1.0, 1.0, 1.0),   // white 6
    vec4(0.0, 1.0, 1.0, 1.0),    // cyan 7
    vec4(0.59375, 1.0, 0.59375, 1.0),// test 8
    vec4(0.32549, 0.337254, 0.352941, 1.0),// test 9
    vec4(0.549019, 0.32549, 0.105882, 1.0),// 나무 기둥색
    vec4(0.3490196, 0.666666, 0.22352, 1.0),// 나무잎 색
    vec4(0.75294, 0.75294, 0.75294, 1.0)// 회색 12
];

function quad(a, b, c, d,e) {
    points.push(vertexPos[a]);
    colors.push(vertexColor[e]);
    points.push(vertexPos[b]);
    colors.push(vertexColor[e]);
    points.push(vertexPos[c]);
    colors.push(vertexColor[e]);
    points.push(vertexPos[a]);
    colors.push(vertexColor[e]);
    points.push(vertexPos[c]);
    colors.push(vertexColor[e]);
    points.push(vertexPos[d]);
    colors.push(vertexColor[e]);
}

function treequad(a) {
    colors.push(vertexColor[a]);
    colors.push(vertexColor[a]);
    colors.push(vertexColor[a]);
    colors.push(vertexColor[a]);
    colors.push(vertexColor[a]);
    colors.push(vertexColor[a]);
}


const treevertexPos = [
    vec4(-1, 1, -1, 1.0),
    vec4(1, 1, -1, 1.0),
    vec4(1, 4, -1, 1.0),
    vec4(-1, 4, -1, 1.0),
    vec4(-1, 1, 1, 1.0),
    vec4(1, 1, 1, 1.0),
    vec4(1, 4, 1, 1.0),
    vec4(-1, 4, 1, 1.0),

    vec4(-0.5, -1, -0.5, 1.0),
    vec4(0.5, -1, -0.5, 1.0),
    vec4(0.5, 1, -0.5, 1.0),
    vec4(-0.5, 1, -0.5, 1.0),
    vec4(-0.5, -1, 0.5, 1.0),
    vec4(0.5, -1, 0.5, 1.0),
    vec4(0.5, 1, 0.5, 1.0),
    vec4(-0.5, 1, 0.5, 1.0)
];

function tree_up(a, b, c, d) {
    points.push(treevertexPos[a]);
    colors.push(vertexColor[11]);
    points.push(treevertexPos[b]);
    colors.push(vertexColor[11]);
    points.push(treevertexPos[c]);
    colors.push(vertexColor[11]);
    points.push(treevertexPos[a]);
    colors.push(vertexColor[11]);
    points.push(treevertexPos[c]);
    colors.push(vertexColor[11]);
    points.push(treevertexPos[d]);
    colors.push(vertexColor[11]);

}

function tree_down(a, b, c, d){
    points.push(treevertexPos[a+8]);
    colors.push(vertexColor[10]);
    points.push(treevertexPos[b+8]);
    colors.push(vertexColor[10]);
    points.push(treevertexPos[c+8]);
    colors.push(vertexColor[10]);
    points.push(treevertexPos[a+8]);
    colors.push(vertexColor[10]);
    points.push(treevertexPos[c+8]);
    colors.push(vertexColor[10]);
    points.push(treevertexPos[d+8]);
    colors.push(vertexColor[10]);
}

function generateGround() {
    var scale = 20;
    var num_color = 8;
    var count = 0 

    for (var z = scale; z >= -scale; z--){
        num_color = color_arr[count];
        for (var x = -scale; x <= scale-1; x++) {
            points.push(vec4(x, -1.0, z, 1.0));
            colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
            points.push(vec4(x, -1.0, z-1, 1.0));
            colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
            points.push(vec4(x+1, -1.0, z-1, 1.0));
            colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));

            points.push(vec4(x, -1.0, z, 1.0));
            colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
            points.push(vec4(x+1, -1.0, z-1, 1.0));
            colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
            points.push(vec4(x+1, -1.0, z, 1.0));
            colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
        }
        count++;
        
    }
    

}
window.onkeydown = function (event) {
    var sinTheta = Math.sin(0.1);
    var cosTheta = Math.cos(0.1);
    // Event listeners for buttons
    switch (event.keyCode) {
        case 37:
            var newVecX = cosTheta * cameraVec[0] + sinTheta * cameraVec[2];
            var newVecZ = -sinTheta * cameraVec[0] + cosTheta * cameraVec[2];
            //cameraVec[0] = newVecX;
            //cameraVec[2] = newVecZ;
            player_location[0] -= 1;
            for(var i = 0; i <tree_num;i++){ //충돌 체크
                
                if(tree_location[i][1] == player_location[2] && tree_location[i][0] == player_location[0]){
                    alert("으악");
                    location.reload();
                }
            } 
            break;
        case 39:
            var newVecX = cosTheta * cameraVec[0] - sinTheta * cameraVec[2];
            var newVecZ = sinTheta * cameraVec[0] + cosTheta * cameraVec[2];
            //cameraVec[0] = newVecX;
            //cameraVec[2] = newVecZ;
            player_location[0] += 1;
            for(var i = 0; i <tree_num;i++){ //충돌 체크
                
                if(tree_location[i][1] == player_location[2] && tree_location[i][0] == player_location[0]){
                    alert("으악");
                    location.reload();
                }
            } 
            break;
        case 38:
            var newPosX = eye[0] + 0.5 * cameraVec[0];
            var newPosZ = eye[2] + 0.5 * cameraVec[2];
           
            var scale = 20;
            var num_color = 0;
            var count = 0 ;

            

            if(g_num == g_r_num){ //바닥 색 랜점으로 
                g_r_num = g_arr[Math.floor(Math.random() * 2)];
                rand_0_1 = Math.floor(Math.random() * 2)+8;
                g_num = 1;
            } 
            else{ 
                g_num++;
            }

            for(var i = 0; i <color_arr.length-1;i++){ //바닥 색 뒤로 한칸식 이동
                color_arr[i] =  color_arr[i+1];
            } 
            color_arr[color_arr.length-1] = rand_0_1;
            
            colors = colors.slice(0,180);
            for (var z = scale; z >= -scale; z--){ //바닥 색 배열에 삽입
                num_color = color_arr[count];
                for (var x = -scale; x <= scale-1; x++) {
                    colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
                    colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
                    colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
    
                    colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
                    colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
                    colors.push(vertexColor[num_color]);//colors.push(vec4(0.8, 0.8, 0.8, 1.0));
                }
                count=(count+1)%(scale*2);
            }
            for(var i = 0; i <tree_num;i++){
                generateTreeColor();
            }

            if(color_arr[scale*2-1] == 8){
                var add_tree_num = Math.floor(Math.random() * 5) //한줄에 추가할 나무의 수
                tree_num += add_tree_num;
                for(var i = 0; i <add_tree_num;i++){ //나무 생성
                    generateTree();
                    var tree_x = Math.floor(Math.random() * 40)-20 //나무의 x축
                    tree_location.push([tree_x,-20]) // 나무의 x축 저장
                } 
            }
            

            var tree_num2= 0;
            for(var i = 0; i <tree_num;i++){ //바닥뒤로 넘어간 나무들은 제거
                if(tree_location[i][1] == 20){
                    tree_num2 +=1;
                    points.splice(10020,72);
                    colors.splice(10020,72);
                }
                else{
                    tree_location[i][1] += 1;
                }
            } 
            tree_location.splice(0,tree_num2)
            tree_num -=tree_num2;

            for(var i = 0; i <tree_num;i++){ //충돌 체크
                
                if(tree_location[i][1] == player_location[2] && tree_location[i][0] == player_location[0]){
                    alert("으악");
                    location.reload();
                }
            } 

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
            // gl.enableVertexAttribArray(vPosition);
        
            gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
            // gl.enableVertexAttribArray(vColor);
            //tree_displ[2] += 1;
            w_click += 1;
            break;
        
        
    }
    

}
