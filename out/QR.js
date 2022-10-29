//the orientation marker in the top corners and the bottom left corner of a QR code represented in binary
var OrientationAnchor = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
var AlignmentPattern = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
];
var AlignmentPatternPositions = {
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
};
var QRFormats = [
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
//<==================================>
//constructs the base of a QR code of version V, 
//which includes the orientation anchors, the timing patterns, and the dark module
var QR = function (V) {
    var size = ((V - 1) * 4) + 21;
    var newCode = [];
    //generate the orientation anchors and timing patterns
    for (var y = 0; y < size; y++) {
        newCode[y] = [];
        for (var x = 0; x < size; x++) {
            //top left anchor
            if (y < OrientationAnchor.length && x < OrientationAnchor.length) {
                newCode[y][x] = OrientationAnchor[x][y];
            }
            //top right anchor
            else if (y < OrientationAnchor.length && x > size - 9) {
                newCode[y][x] = OrientationAnchor[Math.abs(x - (size - 1))][y];
            }
            //bottom left anchor
            else if (y > size - 9 && x < OrientationAnchor.length) {
                newCode[y][x] = OrientationAnchor[x][Math.abs(y - (size - 1))];
            }
            //horizontal timing
            else if (y === 6) {
                if (x % 2 === 0) {
                    newCode[y][x] = 1;
                }
                else {
                    newCode[y][x] = 0;
                }
            }
            //vertical timing
            else if (x === 6) {
                if (y % 2 === 0) {
                    newCode[y][x] = 1;
                }
                else {
                    newCode[y][x] = 0;
                }
            }
            //fill the rest of the area with empty values
            else {
                newCode[y][x] = -1;
            }
        }
    }
    //alignment modules
    if (V >= 2) {
        var alignments = AlignmentPatternPositions[V];
        for (var i = 0; i < alignments.length; i++) {
            for (var j = 0; j < alignments.length; j++) {
                //skip (0,0), (0,^1), (^1,0)
                if (!((i === 0 && j === 0) ||
                    (i === 0 && j === alignments.length - 1) ||
                    (i === alignments.length - 1 && j === 0))) {
                    for (var row = 0; row < AlignmentPattern.length; row++) {
                        for (var column = 0; column < AlignmentPattern.length; column++) {
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
    };
};
var addFormat = function (qr, ecl, mask) {
    //generate index based on ecl and mask to get correct format bits from lookup array
    var formatBits;
    var formatIndex = 0;
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
    var newCode = qr.code;
    //format bits under the top left anchor and next to the bottom left anchor
    for (var x = 0; x < 7; x++) {
        //bottom left
        newCode[qr.size - 1 - x][8] = +formatBits[x];
        //start of timing pattern, skip that bit
        //top left
        newCode[8][x + Math.floor(x / 6)] = +formatBits[x];
    }
    //format bits to the right of the top left anchor and under the top right anchor
    for (var y = 8; y > 0; y--) {
        //top right
        newCode[8][qr.size - y] = +formatBits[15 - y];
        //top left
        newCode[y - (+!Math.floor(y / 7))][8] = +formatBits[15 - y];
    }
    return {
        version: qr.version,
        code: newCode,
        size: qr.size,
    };
};
var addMessage = function (qr, mode, value) {
    var bitsPerChar = 0;
    if (qr.version >= 1 && qr.version <= 9) {
        switch (mode) {
            case 'N':
                bitsPerChar = 10;
                break;
            case 'A':
                bitsPerChar = 9;
                break;
            case 'B':
            case 'K':
                bitsPerChar = 8;
                break;
        }
    }
    else if (qr.version >= 10 && qr.version <= 26) {
        switch (mode) {
            case 'N':
                bitsPerChar = 12;
                break;
            case 'A':
                bitsPerChar = 11;
                break;
            case 'B':
                bitsPerChar = 16;
                break;
            case 'K':
                bitsPerChar = 10;
                break;
        }
    }
    //27-40
    else {
        switch (mode) {
            case 'N':
                bitsPerChar = 14;
                break;
            case 'A':
                bitsPerChar = 13;
                break;
            case 'B':
                bitsPerChar = 16;
                break;
            case 'K':
                bitsPerChar = 12;
                break;
        }
    }
    var message = '';
    //determine mode bits
    var modeBits;
    switch (mode) {
        case 'N':
            modeBits = '0001';
            break;
        case 'A':
            modeBits = '0010';
            break;
        case 'B':
            modeBits = '0100';
            break;
        case 'K':
            modeBits = '1000';
            break;
    }
    message += modeBits;
    //calculate length bits
    var lengthBits = convertToBits(value.length, bitsPerChar);
    message += lengthBits;
    //convert message to binary
    var messageBits = '';
    for (var i = 0; i < value.length; i++) {
        messageBits += convertToBits(value.charCodeAt(i), bitsPerChar);
    }
    message += messageBits;
    //add end bits
    //need to double check this
    message += '0000';
    //make a multiple of 8
    while (message.length % 8 != 0) {
        message += '0';
    }
    var minLength = 55 * 8;
    for (var i = 1; message.length < minLength; i++) {
        if (i % 2 === 0) {
            message += '00010001';
        }
        else {
            message += '11101100';
        }
    }
    //add error correction
    //copy encoded message onto QR
    var dir = 1;
    for (var x = qr.size - 1, y = qr.size - 1, codeIndex = 0; codeIndex < message.length; y -= dir) {
        //hit bottom of qr code
        //hit top of qr code
        if (y === qr.size ||
            y === -1) {
            dir *= -1;
            x -= 2;
        }
        //empty space in code
        else {
            if (qr.code[y][x] === -1) {
                qr.code[y][x] = +message[codeIndex++];
            }
            if (qr.code[y][x - 1] === -1) {
                qr.code[y][x - 1] = +message[codeIndex++];
            }
        }
    }
    return {
        version: qr.version,
        code: qr.code,
        size: qr.size
    };
};
//<===========================>
var convertToBits = function (value, bits) {
    var newVal = value.toString(2);
    for (; newVal.length < 8; newVal = '0' + newVal)
        ;
    return newVal;
};
//converts a binary representation of a QR code into a string representation
//using the full block unicode character (u2588) and spaces
var convertToBlocks = function (qr) {
    var newQR = [];
    //convert each row
    for (var i = 0; i < qr.code.length; i++) {
        //map 1->empty block 0->block -1 -> space then combine them into a single string with no characters between
        var temp = qr.code[i].map(function (n) { return n === 1 ? '\u2591' : (n === 0 ? '\u2588' : ' '); }).join('');
        newQR[i] = temp;
    }
    return newQR;
};
var consoleLogQR = function (qr) {
    convertToBlocks(qr).forEach(function (s) { return console.log(s); });
};
var canvas = document.querySelector('#canvas');
var setCanvasSize = function (qr) {
    canvas.height = qr.size;
    canvas.width = qr.size;
};
var fillCanvas = function (qr) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, qr.size, qr.size);
    for (var y = 0; y < qr.size; y++) {
        for (var x = 0; x < qr.size; x++) {
            if (qr.code[y][x] === 1) {
                ctx.fillStyle = 'black';
                ctx.fillRect(x, y, 1, 1);
            }
            else if (qr.code[y][x] === 0) {
                ctx.fillStyle = 'white';
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
};
var V1 = QR(3);
V1 = addFormat(V1, 'L', 7);
V1 = addMessage(V1, 'B', 'Mr. Watson, come here - I want to see you.');
//consoleLogQR(V1);
setCanvasSize(V1);
fillCanvas(V1);
//# sourceMappingURL=QR.js.map