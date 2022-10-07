#include "o3.h"
#include "gpio.h"
#include "systick.h"


volatile systick_map_t* systick_map = (systick_map_t*) SYSTICK_BASE;
volatile gpio_map_t* gpio_map = (gpio_map_t*) GPIO_BASE;
char timestamp[7] = "";
int seconds = 0;
int minutes = 0;
int hours = 0;
int state = 0;
// STATES
// 0: Still sekunder
// 1: Still minutter
// 2: Still timer
// 3: Tell ned
// 4: Alarm!

/**************************************************************************//**
 * @brief Konverterer nummer til string 
 * Konverterer et nummer mellom 0 og 99 til string
 *****************************************************************************/
void int_to_string(char *timestamp, unsigned int offset, int i) {
    if (i > 99) {
        timestamp[offset]   = '9';
        timestamp[offset+1] = '9';
        return;
    }

    while (i > 0) {
	    if (i >= 10) {
		    i -= 10;
		    timestamp[offset]++;
		
	    } else {
		    timestamp[offset+1] = '0' + i;
		    i=0;
	    }
    }
}

/**************************************************************************//**
 * @brief Konverterer 3 tall til en timestamp-string
 * timestamp-argumentet må være et array med plass til (minst) 7 elementer.
 * Det kan deklareres i funksjonen som kaller som "char timestamp[7];"
 * Kallet blir dermed:
 * char timestamp[7];
 * time_to_string(timestamp, h, m, s);
 *****************************************************************************/
void time_to_string(char *timestamp, int h, int m, int s) {
    timestamp[0] = '0';
    timestamp[1] = '0';
    timestamp[2] = '0';
    timestamp[3] = '0';
    timestamp[4] = '0';
    timestamp[5] = '0';
    timestamp[6] = '\0';

    int_to_string(timestamp, 0, h);
    int_to_string(timestamp, 2, m);
    int_to_string(timestamp, 4, s);
}

void toggle_led() {
	gpio_map->ports[GPIO_PORT_E].MODEL = GPIO_MODE_OUTPUT << 8;
	gpio_map->ports[GPIO_PORT_E].DOUTTGL = 0b1 << 2;
}

void clear_interrupt_flags() {
	gpio_map->IFC = 0b11 << 9;
}

void init_button_interrupts() {
	gpio_map->ports[GPIO_PORT_B].MODEH = 0b00010001 << 4;
	gpio_map->EXTIPSELH = 0b00010001 << 4;
	gpio_map->EXTIFALL = 0b11 << 9;
	clear_interrupt_flags();
	gpio_map->IEN = 0b11 << 9;
}

void init_systick() {
	systick_map->CTRL = 0b000;
	systick_map->LOAD = FREQUENCY;
	systick_map->VAL = 0;
}

void enable_systick() {
	systick_map->CTRL = 0b111;
}

void disable_systick() {
	systick_map->CTRL = 0b000;
}

void lcd_write_hms() {
	time_to_string(timestamp, hours, minutes, seconds);
	lcd_write(timestamp);
}

void GPIO_ODD_IRQHandler() {
	switch (state) {
		case 0: // Still sekunder
			if (seconds == 59) {
				seconds = 0;
			} else {
				seconds++;
			}
			break;
		case 1: // Still minutter
			if (minutes == 59) {
				minutes = 0;
			} else {
				minutes++;
			}
			break;
		case 2: // Still timer
			if (hours == 99) {
				hours = 0;
			} else {
				hours++;
			}
			break;
		case 3: // Tell ned
			break;
		case 4: // Alarm
			break;
	}
	lcd_write_hms();
	clear_interrupt_flags();
}

void GPIO_EVEN_IRQHandler() {
	switch (state) {
		case 0: // Still sekunder
			state++;
			break;
		case 1: // Still minutter
			state++;
			break;
		case 2: // Still timer
			state++;
			enable_systick();
			break;
		case 3: // Tell ned
			break;
		case 4: // Alarm
			toggle_led();
			state = 0;
			break;
	}
	clear_interrupt_flags();
}

void SysTick_Handler() {
	if (seconds == 0) {
		if (minutes == 0) {
			if (hours == 0) {
				disable_systick();
				state++;
				toggle_led();
			} else {
				minutes = 59;
				hours--;
			}
		} else {
			seconds = 59;
			minutes--;
		}
	} else {
		seconds--;
	}
	lcd_write_hms();
}

int main(void) {
    init();

    init_button_interrupts();
    init_systick();
    lcd_write_hms();

    return 0;
}


