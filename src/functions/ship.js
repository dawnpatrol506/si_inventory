const helper = require('./helperFunctions');
const firebaseFunctions = require('./firebaseFunctions');

const ship = {
    ship: function (barcode, tracking, user) {
        if (!helper.verifyBarcode(barcode)) {
            $('#shipped-name').text('Error reading barcode');
            $('#last-shipped').attr('class', 'red');
            $('#ship-barcode').focus();
            return;
        }

        if (!helper.verifyTracking(tracking)) {
            $('#shipped-name').text('Error reading tracking #');
            $('#last-shipped').attr('class', 'red');
            $('#ship-barcode').focus();
            return;
        }

        let shipObject = {
            id: helper.parseId(barcode),
            color: helper.parseColor(id, barcode),
            dateCreated: helper.parseDateCreated(barcode),
            dateShipped: new Date(),
            tracking: tracking.substring(tracking.length - 12, tracking.length),
            user: user,
            barcode: barcode
        }

        firebaseFunctions.ship(shipObject);

        $('#last-shipped').attr('class', 'white');

        setTimeout(firebaseFunctions.lastChanged(shipObject, 'shipped'), 200);
        $('#ship-barcode').focus();
    }
}

module.exports = ship;