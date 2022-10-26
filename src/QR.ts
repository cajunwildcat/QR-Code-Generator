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

const AlignmentPattern: number[][] = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
]

const AlignmentPatternPositions = {
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
    11: [6, 30, 54],
    12: [6, 32, 58],
    13: [6, 34, 62],
    14: [6, 26, 46, 66],
    15: [6, 26, 48, 70],
    16: [6, 26, 50, 74],
    17: [6, 30, 54, 78],
    18: [6, 30, 56, 82],
    19: [6, 30, 58, 86],
    20: [6, 34, 62, 90],
    21: [6, 28, 50, 72, 94],
    22: [6, 26, 50, 74, 98],
    23: [6, 30, 54, 78, 102],
    24: [6, 28, 54, 80, 106],
    25: [6, 32, 58, 84, 110],
    26: [6, 30, 58, 86, 114],
    27: [6, 34, 62, 90, 118],
    28: [6, 26, 50, 74, 981, 22],
    29: [6, 30, 54, 78, 102, 126],
    30: [6, 26, 52, 78, 104, 130],
    31: [6, 30, 56, 82, 108, 134],
    32: [6, 34, 60, 86, 112, 138],
    33: [6, 30, 58, 86, 114, 142],
    34: [6, 34, 62, 90, 118, 146],
    35: [6, 30, 54, 78, 102, 126, 150],
    36: [6, 24, 50, 76, 102, 128, 154],
    37: [6, 28, 54, 80, 106, 132, 158],
    38: [6, 32, 58, 84, 110, 136, 162],
    39: [6, 26, 54, 82, 110, 138, 166],
    40: [6, 30, 58, 86, 114, 142, 170]
}

const QRFormats: string[] = [
    '111011111000100',
    '111001011110011',
    '111110110101010',
    '111100010011101',
    '110011000101111',
    '110001100011000',
    '110110001000001',
    '110100101110110',
    '101010000010010',
    '101000100100101',
    '101111001111100',
    '101101101001011',
    '100010111111001',
    '100000011001110',
    '100111110010111',
    '100101010100000',
    '011010101011111',
    '011000001101000',
    '011111100110001',
    '011101000000110',
    '010010010110100',
    '010000110000011',
    '010111011011010',
    '010101111101101',
    '001011010001001',
    '001001110111110',
    '001110011100111',
    '001100111010000',
    '000011101100010',
    '000001001010101',
    '000110100001100',
    '000100000111011'
];

type QR = {
    code: number[][],
    version: number,
    size: number

    //addFormat: (ECL, MaskPattern) => QR,
}
type ECL = 'L' | 'M' | 'Q' | 'H';
type MaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

//N(umeric) A(lphanumeric) B(inary) K(anji)
type EncodeMode = 'N' | 'A' | 'B' | 'K';

//<==================================>

//constructs the base of a QR code of version V, 
//which includes the orientation anchors, the timing patterns, and the dark module
const QR = (V: number): QR => {
    const size = ((V - 1) * 4) + 21;

    let newCode: number[][] = [];

    //generate the orientation anchors and timing patterns
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

            //bottom left anchor
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
                newCode[row][column] = -1;
            }
        }
    }

    //alignment modules
    if (V >= 2) {
        let alignments = AlignmentPatternPositions[V];

        for (let i = 0; i < alignments.length; i++) {
            for (let j = 0; j < alignments.length; j++) {
                //skip (0,0), (0,^1), (^1,0)
                if (!((i === 0 && j === 0) ||
                    (i === 0 && j === alignments.length - 1) ||
                    (i === alignments.length - 1 && j === 0))) {
                    for (let row = 0; row < AlignmentPattern.length; row++) {
                        for (let column = 0; column < AlignmentPattern.length; column++) {
                            //-2 is to account for the center needing to be at the coordinates instead of the top left corner
                            newCode[row + alignments[j] - 2][column + alignments[i] - 2] = AlignmentPattern[column][row];
                        }
                    }
                }
            }
        }
    }

    //dark module
    newCode[V * 4 + 9][8] = 1;

    return {
        version: V,
        code: newCode,
        size: size
    }
}

const addFormat = (qr: QR, ecl: ECL, mask: MaskPattern): QR => {
    //generate index based on ecl and mask to get correct format bits from lookup array
    let formatBits: string;
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
    let newCode: number[][] = qr.code;

    //format bits under the top left anchor and next to the bottom left anchor
    for (let column = 0; column < 8; column++) {
        newCode[qr.size - 1 - column][8] = +formatBits[column];
        //start of timing pattern, skip that bit
        if (column === 6) {
            continue;
        }
        newCode[8][column] = +formatBits[column - Math.floor(column / 6)];
    }

    //format bits to the right of the top left anchor and under the top right anchor
    for (let row = 8; row >= 0; row--) {
        newCode[8][qr.size - row] = +formatBits[15 - row];
        if (row === 6) {
            continue;
        }
        newCode[row][8] = +formatBits[15 - row - +!Math.floor(row / 6)];
    }

    return {
        version: qr.version,
        code: newCode,
        size: qr.size,
    }
}

const addMessage = (qr: QR, mode: EncodeMode, value: string): QR => {
    let newCode: number[][] = Array<number[]>(qr.size);
    for (let i = 0; i < newCode.length; i++) {
        let openBits = 0;
        qr.code[i].forEach((bit) => bit === -1 ? openBits++ : 0);
        newCode[i] = Array<number>(openBits);
        //populate with -1
        newCode[i].map((b) => -1);
    }
    let bitPerChar = 0;
    if (qr.version >= 1 && qr.version <= 9) {
        switch (mode) {
            case 'N': bitPerChar = 10; break;
            case 'A': bitPerChar = 9; break;
            case 'B':
            case 'K': bitPerChar = 8; break;
        }
    }
    else if (qr.version >= 10 && qr.version <= 26) {
        switch (mode) {
            case 'N': bitPerChar = 12; break;
            case 'A': bitPerChar = 11; break;
            case 'B': bitPerChar = 16; break;
            case 'K': bitPerChar = 10; break;
        }
    }
    //27-40
    else {
        switch (mode) {
            case 'N': bitPerChar = 14; break;
            case 'A': bitPerChar = 13; break;
            case 'B': bitPerChar = 16; break;
            case 'K': bitPerChar = 12; break;
        }
    }

    //encoding mode bits

    //calculate length

    //encoding length bits

    //encoding actual message

    //encoding end bits

    //endcoding error correction

    return {
        version: qr.version,
        code: qr.code,
        size: qr.size
    }
}

//<===========================>

//converts a binary representation of a QR code into a string representation
//using the full block unicode character (u2588) and spaces
const convertToBlocks = (qr: QR): string[] => {
    let newQR: string[] = [];
    //convert each row
    for (let i = 0; i < qr.code.length; i++) {
        //map 1->empty block 0->block -1 -> space then combine them into a single string with no characters between
        let temp: string = qr.code[i].map((n) => n === 1 ? '\u2591' : (n === 0 ? '\u2588' : ' ')).join('');
        newQR[i] = temp;
    }

    return newQR;
}

let V1 = QR(1);
V1 = addFormat(V1, 'L', 1);
V1 = addMessage(V1, 'B', 'Hello World');


convertToBlocks(V1).forEach((s: string) => console.log(s));

