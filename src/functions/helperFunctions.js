const references = require('./referenceValues');

const helper = {
    parseId: function(barcode){
        return barcode.substring(0, 2);
    },

    parseColor: function(id, barcode) {
        let colorCode = references.alpha.indexOf(barcode.substring(2, 3));
        if (id === 'bi') {
            return references.drpa[colorCode];
        }
        else if (id === 'aj' || id === 'ak') {
            return references.ws[colorCode];
        }
        else {
            return references.colors[colorCode];
        }
    },

    parseDateCreated: function(barcode) {
        let day = references.alpha.indexOf(barcode.substring(3, 4));
        let month = references.alpha.indexOf(barcode.substring(4, 5));
        let year = references.alpha.indexOf(barcode.substring(5, 6));
        let hour = references.alpha.indexOf(barcode.substring(6, 7));

        return month + '/' + day + '/20' + year + ' ' + hour + ':00';
    },

    verifyBarcode: function(barcode){
        if(barcode.trim().length !== 18)
            return false;
        if(!isNaN(barcode.substring(0,1)))
            return false;

        return true;
    },

    verifyTracking: function(trackingNumber){
        let bool = true;
        if(trackingNumber.trim().length < 12)
            return false;
        for(let i = 0; i < trackingNumber.length; i++){
            if(isNaN(trackingNumber.charAt(i)))
                bool = false;
        }
        return bool;
    },

    countActiveParts: function(snap, color) {
        if(color === null)
            return;

        $.each(snap, (key, value) => {
            let count = 0;
            $.each(value, (key, value) => {
                if (key.toUpperCase() === color.toString().toUpperCase()) {
                    $.each(value, (key, value) => {
                        if (value.status.toUpperCase() === 'ACTIVE') {
                            count++;
                        }
                    })
                }
            })

            $('#' + key).text(count);
        })
    }

}

module.exports = helper;