const helper = require('./helperFunctions');
const firebaseFunctions = require('./firebaseFunctions');

const add = {

    addInventory: function (barcode, user) {
        if (!helper.verifyBarcode(barcode)) {
            $('#added-name').text('Error reading barcode');
            $('#last-add').attr('class', 'red');
            $('#add-barcode').focus();
            return;
        }

        const addObject = {
            id: helper.parseId(barcode),
            color: helper.parseColor(helper.parseId(barcode), barcode),
            dateCreated: helper.parseDateCreated(barcode),
            barcode: barcode,
            user: user
        }

        firebaseFunctions.add(addObject);

        $('#last-added').attr('class', 'white');

        setTimeout(firebaseFunctions.lastChanged(addObject, 'added'), 200);
    }


}

module.exports = add;