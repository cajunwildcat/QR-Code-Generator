//the orientation marker in the top corners and the bottom left corner of a QR code represented in binary
const OrientationAnchor: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

const formats: number[] = [
    111011111000100,
    111001011110011,
    111110110101010,
    111100010011101,
    110011000101111,
    110001100011000,
    110110001000001,
    110100101110110,
    101010000010010,
    101000100100101,
    101111001111100,
    101101101001011,
    100010111111001,
    100000011001110,
    100111110010111,
    100101010100000,
    0o011010101011111,
    0o011000001101000,
    0o011111100110001,
    0o011101000000110,
    0o010010010110100,
    0o010000110000011,
    0o010111011011010,
    0o010101111101101,
    0o001011010001001,
    0o001001110111110,
    0o001110011100111,
    0o001100111010000,
    0o000011101100010,
    0o000001001010101,
    0o000110100001100,
    0o000100000111011
];
const QRFormats = new Uint16Array(formats);

type QR = {
    code: number[][],
    version: number,

    addFormat: (ECL, MaskPattern) => QR,
}
type ECL = 'L' | 'M' | 'Q' | 'H';
type MaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

//<==================================>

//constructs the base of a QR code of version V, 
//which includes the orientation anchors, the timing patterns, and the dark module
const QR = (V: number): QR => {
    const size = ((V - 1) * 4) + 21;

    let newCode: number[][] = [];
    for (let row = 0; row < size; row++) {
        newCode[row] = [];

        for (let column = 0; column < size; column++) {
            //top left anchor
            if (row < OrientationAnchor.length && column < OrientationAnchor.length) {
                newCode[row][column] = OrientationAnchor[column][row];
            }

            //top right anchor
            else if (row < OrientationAnchor.length && column > size - 9) {
                newCode[row][column] = OrientationAnchor[Math.abs(column - (size - 1))][row];
            }

            else if (row > size - 9 && column < OrientationAnchor.length) {
                newCode[row][column] = OrientationAnchor[column][Math.abs(row - (size - 1))];
            }

            //horizontal timing
            else if (row === 6) {
                if (column % 2 === 0) {
                    newCode[row][column] = 1;
                }
                else {
                    newCode[row][column] = 0;
                }
            }

            //vertical timing
            else if (column === 6) {
                if (row % 2 === 0) {
                    newCode[row][column] = 1;
                }
                else {
                    newCode[row][column] = 0;
                }
            }

            //fill the rest of the area with empty values
            else {
                newCode[row][column] = 0;
            }
        }
    }
    //dark module
    newCode[V * 4 + 9][8] = 1;

    return {
        version: V,
        code: newCode,

        addFormat: (ecl: ECL, mask: MaskPattern): QR => {
            //generate index based on ecl and mask to get correct format bits from lookup array
            let formatBits: number;
            let formatIndex: number = 0;
            switch (ecl) {
                case 'H':
                    formatIndex += 8;
                case 'Q':
                    formatIndex += 8;
                case 'M':
                    formatIndex += 8;
                    break;
            }
            formatIndex += mask;
            formatBits = QRFormats[formatIndex];

            //fill in the QR code with the correct bits
            let newCode = this.code;

            for (let column = 0; column <= 8; column++) {
                //start of timing pattern, don't touch that bit
                if (column === 6) {
                    continue;
                }
                newCode[8][column] = QRFormats[column];
                //bottom left anchor repeat
                if (column === 8) {

                }
            }
        }
    }
}

//<===========================>

//converts a binary representation of a QR code into a string representation
//using the full block unicode character (u2588) and spaces
const convertToBlocks = (qr: QR): string[] => {
    let newQR: string[] = [];
    //convert each row
    for (let i = 0; i < qr.code.length; i++) {
        //map 1->block 0->[space] then combine them into a single string with no characters between
        let temp: string = qr.code[i].map((n) => n === 1 ? '\u2588' : ' ').join('');
        newQR[i] = temp;
    }

    return newQR;
}

const V1 = convertToBlocks(constructQRBase(1));
const V5 = convertToBlocks(constructQRBase(5));
V1.forEach((s: string) => console.log(s));