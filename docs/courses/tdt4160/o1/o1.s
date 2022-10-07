.thumb
.syntax unified

.include "gpio_constants.s"     // Register-adresser og konstanter for GPIO

.text
	.global Start
	
Start:
	LDR R0, = GPIO_BASE + (LED_PORT * PORT_SIZE) + GPIO_PORT_DOUT
	LDR R1, = GPIO_BASE + (BUTTON_PORT * PORT_SIZE) + GPIO_PORT_DIN

	MOV R2, #1
	LSL R2, R2, #BUTTON_PIN

	Loop:
		LDR R7, [R1]
		AND R7, R7, R2
		CMP R7, 0
		BEQ TurnOn
		B TurnOff

	TurnOn:
		MOV R7, #1
		LSL R7, R7, #LED_PIN
		STR R7, [R0]
		B Loop

	TurnOff:
		MOV R7, #0
		LSL R7, R7, #LED_PIN
		STR R7, [R0]
		B Loop

NOP // Behold denne på bunnen av fila
