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
//<==================================>
//constructs the base of a QR code of version V, 
//which includes the orientation anchors, the timing patterns, and the dark module
var constructQRBase = function (V) {
    var size = ((V - 1) * 4) + 21;
    var qr = {
        code: [],
        version: V,
        addFormat: addQRFormat
    };
    for (var row = 0; row < size; row++) {
        qr.code[row] = [];
        for (var column = 0; column < size; column++) {
            //top left anchor
            if (row < OrientationAnchor.length && column < OrientationAnchor.length) {
                qr.code[row][column] = OrientationAnchor[column][row];
            }
            //top right anchor
            else if (row < OrientationAnchor.length && column > size - 9) {
                qr.code[row][column] = OrientationAnchor[Math.abs(column - (size - 1))][row];
            }
            else if (row > size - 9 && column < OrientationAnchor.length) {
                qr.code[row][column] = OrientationAnchor[column][Math.abs(row - (size - 1))];
            }
            //horizontal timing
            else if (row === 6) {
                if (column % 2 === 0) {
                    qr.code[row][column] = 1;
                }
                else {
                    qr.code[row][column] = 0;
                }
            }
            //vertical timing
            else if (column === 6) {
                if (row % 2 === 0) {
                    qr.code[row][column] = 1;
                }
                else {
                    qr.code[row][column] = 0;
                }
            }
            //fill the rest of the area with empty values
            else {
                qr.code[row][column] = 0;
            }
        }
    }
    //dark module
    qr.code[V * 4 + 9][8] = 1;
    return qr;
};
var addQRFormat = function (ecl, mask) {
    var newQR;
    return newQR;
};
//<===========================>
//converts a binary representation of a QR code into a string representation
//using the full block unicode character (u2588) and spaces
var convertToBlocks = function (qr) {
    var newQR = [];
    //convert each row
    for (var i = 0; i < qr.code.length; i++) {
        //map 1->block 0->[space] then combine them into a single string with no characters between
        var temp = qr.code[i].map(function (n) { return n === 1 ? '\u2588' : ' '; }).join('');
        newQR[i] = temp;
    }
    return newQR;
};
var V1 = convertToBlocks(constructQRBase(1));
var V5 = convertToBlocks(constructQRBase(5));
V1.forEach(function (s) { return console.log(s); });
//# sourceMappingURL=QR.js.map