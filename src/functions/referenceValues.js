const references = {
    alpha: createAlpha(),
    colors: ['BLACK', 'WHITE', 'BLUE', 'ORANGE', 'RED', 'LIME', 'GRAY', 'BLACK WRINKLE', 'BLACK TEXTURE'],
    drpa: ['DRIVER', 'PASSENGER'],
    ws: ['CLEAR', 'TINTED'],
}

module.exports = references;

function createAlpha() {
    let alpha = [];
    for (var i = 97; i < (97 + 26); i++) {
        alpha.push(String.fromCharCode(i));
    }
    for (let i = 0; i < 10; i++) {
        alpha.push(i.toString());
    }

    return alpha;
}