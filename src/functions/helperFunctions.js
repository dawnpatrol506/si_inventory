const helper = {
    parseId: function(barcode){
        return barcode.substring(0, 2);
    },

    parseColor: function(id, barcode) {
        let colorCode = alpha.indexOf(barcode.substring(2, 3));
        if (id === 'bi') {
            return drpa[colorCode];
        }
        else if (id === 'aj' || id === 'ak') {
            return ws[colorCode];
        }
        else {
            return colors[colorCode];
        }
    },

    parseDateCreated: function(barcode) {
        let day = alpha.indexOf(barcode.substring(3, 4));
        let month = alpha.indexOf(barcode.substring(4, 5));
        let year = alpha.indexOf(barcode.substring(5, 6));
        let hour = alpha.indexOf(barcode.substring(6, 7));

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
    }
}

module.exports = helper;