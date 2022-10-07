.thumb
.syntax unified

.include "gpio_constants.s"     // Register-adresser og konstanter for GPIO
.include "sys-tick_constants.s" // Register-adresser og konstanter for SysTick

.text
	.global Start

Start:
	// R8 is LED address
	LDR R8, = GPIO_BASE + (LED_PORT * PORT_SIZE) + GPIO_PORT_DOUTTGL

	// Init button interrupt
	LDR R0, = GPIO_BASE + GPIO_EXTIPSELH
	MOV R1, 0b0001
	LSL R1, R1, 4
	STR R1, [R0]

	MOV R1, #1
	LSL R1, R1, #BUTTON_PIN
	LDR R0, = GPIO_BASE + GPIO_EXTIFALL
	STR R1, [R0]
	LDR R0, = GPIO_BASE + GPIO_IFC
 	STR R1, [R0]
	LDR R0, = GPIO_BASE + GPIO_IEN
	STR R1, [R0]

	// Init systick interrupt
	LDR R0, = SYSTICK_BASE + SYSTICK_LOAD
	LDR R1, = FREQUENCY / 10
	STR R1, [R0]
	LDR R0, = SYSTICK_BASE + SYSTICK_VAL
	MOV R1, #0
	STR R1, [R0]
	LDR R0, = SYSTICK_BASE + SYSTICK_CTRL
	MOV R1, 0b000
	STR R1, [R0]

	// Set clock to 0
	MOV R9, #0
	LDR R0, = tenths
	STR R9, [R0]
	MOV R10, #0
	LDR R0, = seconds
	STR R10, [R0]
	MOV R11, #0
	LDR R0, = minutes
	STR R11, [R0]

	B Loop

Loop:
	B Loop

.global SysTick_Handler
.thumb_func
SysTick_Handler:
	// Is tenths 9?
	CMP R9, #9
	BNE False0
		// Toggle led:
		MOV R0, #1
		LSL R0, R0, #LED_PIN
		STR R0, [R8]

		MOV R9, #0
		// Is seconds 59?
		CMP R10, #59
		BNE False1
			MOV R10, #0
			ADD R11, R11, #1
			B Endif1
		False1:
			ADD R10, R10, #1
		Endif1:
		B Endif0
	False0:
		ADD R9, R9, #1
	Endif0:

	LDR R0, = tenths
	STR R9, [R0]
	LDR R0, = seconds
	STR R10, [R0]
	LDR R0, = minutes
	STR R11, [R0]

	BX LR

.global GPIO_ODD_IRQHandler
.thumb_func
 GPIO_ODD_IRQHandler:
 	// Toggle systick interrupt
 	LDR R0, = SYSTICK_BASE + SYSTICK_CTRL
 	LDR R1, [R0]
	MOV R2, 0b111
	MOV R3, 0b000

	CMP R1, R3
	BNE False2
		STR R2, [R0]
		B Endif2
	False2:
		STR R3, [R0]
	Endif2:

	// Clear interrupt flag
	LDR R0, = GPIO_BASE + GPIO_IFC
 	MOV R1, #1
 	LSL R1, R1, 9
 	STR R1, [R0]

 	BX LR

NOP // Behold denne på bunnen av fila

