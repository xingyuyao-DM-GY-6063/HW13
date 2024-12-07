// 定义引脚
const int JOYSTICK_X = A0;    // 操纵杆X轴
const int JOYSTICK_Y = A1;    // 操纵杆Y轴
const int POT_PIN = A2;       // 电位器

void setup() {
  Serial.begin(9600);
  pinMode(JOYSTICK_X, INPUT);
  pinMode(JOYSTICK_Y, INPUT);
  pinMode(POT_PIN, INPUT);
}

void loop() {
  if (Serial.available() > 0) {
    if (Serial.read() == 0xAB) {
      // 读取传感器数据
      int xValue = analogRead(JOYSTICK_X);
      int yValue = analogRead(JOYSTICK_Y);
      int potValue = analogRead(POT_PIN);
      
      // 发送JSON格式数据
      Serial.print("{\"data\":{");
      
      // 操纵杆数据
      Serial.print("\"joystick\":{");
      Serial.print("\"x\":");
      Serial.print(xValue);
      Serial.print(",\"y\":");
      Serial.print(yValue);
      Serial.print("},");
      
      // 电位器数据
      Serial.print("\"A2\":{\"value\":");
      Serial.print(potValue);
      Serial.print("}");
      
      Serial.println("}}");
    }
  }
}