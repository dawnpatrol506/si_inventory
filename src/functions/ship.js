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
        let date = moment();

        let shipObject = {
            id: helper.parseId(barcode),
            color: helper.parseColor(helper.parseId(barcode), barcode),
            dateCreated: helper.parseDateCreated(barcode),
            dateShipped: date.format('MMM DD, YYYY'),
            tracking: tracking.substring(tracking.length - 12, tracking.length),
            user: user,
            barcode: barcode.trim()
        }

        let dateObject = {
            year: date.year(),
            month: (date.month() + 1),
            week: date.week(),
            day: date.day()
        }

        firebaseFunctions.ship(shipObject);
        firebaseFunctions.inputSalesData(shipObject, dateObject);

        $('#last-shipped').attr('class', 'white');

        setTimeout(firebaseFunctions.lastChanged(shipObject, 'shipped'), 200);
        $('#ship-barcode').focus();
    }
}

module.exports = ship;