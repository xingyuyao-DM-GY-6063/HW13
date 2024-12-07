// 串行通信变量
let mSerial;
let connectButton;
let readyToReceive;

// 项目变量
let lastShapeTime = 0;
let shapeDelay = 100; // 控制生成形状的频率

function setup() {
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
  push();
  
  let rr = random(255);
  let rg = random(255);
  let rb = random(255);
  let alpha = random(100, 255);
  stroke(rr, rg, rb, alpha);
  
  let strokeW = map(potValue, 0, 4095, 1, 15);
  strokeWeight(strokeW);
  
  translate(x, y);
  angleMode(DEGREES);
  let rotation = map(potValue, 0, 4095, -45, 45);
  rotate(rotation);
  
  let shapeSize = map(potValue, 0, 4095, 10, 50);
  
  rect(0, 0, shapeSize, shapeSize,
       random(0, 10), random(0, 10),
       random(0, 10), random(0, 10));
  
  pop();
}

function receiveSerial() {
  let line = mSerial.readUntil("\n");
  trim(line);
  
  if (!line || line.charAt(0) != "{") return;

  try {
    let data = JSON.parse(line).data;
    let joystick = data.joystick;
    let potValue = data.A2.value;

    // 检查是否到达生成新形状的时间
    if (millis() - lastShapeTime > shapeDelay) {
      // X轴映射
      let x;
      if (joystick.x <= 3150) {
        x = map(joystick.x, 0, 3150, 0, width/2);
      } else {
        x = map(joystick.x, 3150, 4095, width/2, width);
      }

      // Y轴映射
      let y;
      if (joystick.y <= 3150) {
        y = map(joystick.y, 0, 3150, 0, height/2);
      } else {
        y = map(joystick.y, 3150, 4095, height/2, height);
      }
      
      // 确保位置在画布范围内
      x = constrain(x, 50, width-50);
      y = constrain(y, 50, height-50);
      
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
    readyToReceive = true;
    connectButton.hide();
  }
}

function draw() {
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
}