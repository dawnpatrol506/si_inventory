$(document).ready(function () {
    $('.modal').modal();


    let db = firebase.database();
    let storedb = firebase.firestore();

    let alpha = [];
    for (var i = 97; i < (97 + 26); i++) {
        alpha.push(String.fromCharCode(i));
    }
    for (let i = 0; i < 10; i++) {
        alpha.push(i);
    }

    let colors = ['BLACK', 'WHITE', 'BLUE', 'ORANGE', 'RED', 'LIME', 'GRAY', 'BLACK WRINKLE', 'BLACK TEXTURE'];
    let drpa = ['DRIVER', 'PASSENGER'];
    let ws = ['CLEAR', 'TINTED'];

    function parseId(barcode) {
        return barcode.substring(0, 2);
    }

    function parseColor(id, barcode) {
        let colorCode = alpha.indexOf(barcode.substring(2, 3));

        if (id === 'bi') {
            return drba[colorCode];
        }
        else if (id === 'aj' || id === 'ak') {
            return ws[colorCode];
        }
        else {
            return colors[colorCode];
        }
    }

    function parseDateCreated(barcode) {
        let day = alpha.indexOf(barcode.substring(3, 4));
        let month = alpha.indexOf(barcode.substring(4, 5));
        let year = alpha.indexOf(barcode.substring(5, 6));
        let hour = alpha.indexOf(barcode.substring(6, 7));

        return month + '/' + day + '/20' + year + ' ' + hour + ':00';
    }

    function addInventory(barcode) {

        let id = parseId(barcode);
        let color = parseColor(id, barcode);
        let dateCreated = parseDateCreated(barcode);

        db.ref(id + '/' + color + '/' + id + '/').set({dateCreated: dateCreated, status: 'In Stock' });
    }

    $('#add-barcode').on('keyup', function (event) {
        if (event.which === 13) {
            addInventory($(this).val());
            $(this).val('');
            $('#add-modal').modal();
            $(this).focus();
        }
    });

})