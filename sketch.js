// 串行通信变量
let mSerial;
let connectButton;
let readyToReceive;

// 项目变量
let lastShapeTime = 0;
let shapeDelay = 100;

function setup() {
  // 创建画布并设置初始背景
  createCanvas(windowWidth, windowHeight);
  background(240, 240, 240);
  noFill();

  // 设置串行通信
  readyToReceive = false;
  mSerial = createSerial();
  connectButton = createButton("连接串口");
  connectButton.position(width/2, height/2);
  connectButton.mousePressed(connectToSerial);
  
  console.log("Setup complete");
}

function drawShape(x, y, potValue) {
  // 确保在绘制前保存当前状态
  push();
  
  // 设置颜色和透明度
  let rr = random(255);
  let rg = random(255);
  let rb = random(255);
  let alpha = random(100, 255);
  stroke(rr, rg, rb, alpha);
  
  // 设置线条粗细
  let strokeW = map(potValue, 0, 4095, 1, 10);
  strokeWeight(strokeW);
  
  // 移动到指定位置
  translate(x, y);
  
  // 设置旋转
  angleMode(DEGREES);
  let rotation = map(potValue, 0, 4095, -15, 15);
  rotate(rotation);
  
  // 设置形状大小
  let shapeSize = map(potValue, 0, 4095, 10, 25);
  
  // 绘制形状
  rect(0, 0, shapeSize, shapeSize,
       random(0, 10), random(0, 10),
       random(0, 10), random(0, 10));
  
  // 恢复之前的状态
  pop();
  
  console.log("Shape drawn at:", x, y, "with size:", shapeSize);
}

function receiveSerial() {
  let line = mSerial.readUntil("\n");
  trim(line);
  
  if (!line || line.charAt(0) != "{") return;

  try {
    let data = JSON.parse(line).data;
    let joystick = data.joystick;
    let potValue = data.A2.value;
    let buttonPressed = data.D2.isPressed;

    // 打印原始值以进行调试
    console.log("Raw joystick values - X:", joystick.x, "Y:", joystick.y);

    if (buttonPressed && millis() - lastShapeTime > shapeDelay) {
      // X轴映射
      let x;
      if (joystick.x <= 3150) {
        // 0-3150 映射到 0-width/2
        x = map(joystick.x, 0, 3150, 0, width/2);
      } else {
        // 3150-4095 映射到 width/2-width
        x = map(joystick.x, 3150, 4095, width/2, width);
      }

      // Y轴映射
      let y;
      if (joystick.y <= 3150) {
        // 0-3150 映射到 0-height/2
        y = map(joystick.y, 0, 3150, 0, height/2);
      } else {
        // 3150-4095 映射到 height/2-height
        y = map(joystick.y, 3150, 4095, height/2, height);
      }
      
      // 确保位置在画布范围内
      x = constrain(x, 50, width-50);
      y = constrain(y, 50, height-50);
      
      console.log("Mapped position:", x, y);
      drawShape(x, y, potValue);
      lastShapeTime = millis();
    }
  } catch (e) {
    console.error("Error parsing data:", e);
  }

  readyToReceive = true;
}

function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);
    console.log("Serial port opened");
    readyToReceive = true;
    connectButton.hide();
  }
}

function draw() {
  // 串行通信更新
  if (mSerial.opened() && readyToReceive) {
    readyToReceive = false;
    mSerial.clear();
    mSerial.write(0xab);
  }

  if (mSerial.availableBytes() > 8) {
    receiveSerial();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(240, 240, 240);
}