export var PX_PER_PT = 4 / 3;
// Reference: https://www.prepressure.com/library/paper-size/letter
// Letter size is commonly used in US & Canada, while A4 is the standard for rest of world.
export var LETTER_WIDTH_PT = 612;
var LETTER_HEIGHT_PT = 792;
export var LETTER_WIDTH_PX = LETTER_WIDTH_PT * PX_PER_PT;
export var LETTER_HEIGHT_PX = LETTER_HEIGHT_PT * PX_PER_PT;
// Reference: https://www.prepressure.com/library/paper-size/din-a4
export var A4_WIDTH_PT = 595;
var A4_HEIGHT_PT = 842;
export var A4_WIDTH_PX = A4_WIDTH_PT * PX_PER_PT;
export var A4_HEIGHT_PX = A4_HEIGHT_PT * PX_PER_PT;
export var DEBUG_RESUME_PDF_FLAG = undefined; // use undefined to disable to deal with a weird error message
