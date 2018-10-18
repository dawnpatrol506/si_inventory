const firebase = firebase.datbase();

const firebaseFunctions = {
    nameLookup: function(id, elem, color) {
        firebase.ref('part_lookup/' + id).once('value', snap => {
            elem.text(snap.val() + ' ' + color.toUpperCase());
        })
    },

    add: function(obj){
        firebase.ref('inventory/' + obj.id + '/' + obj.color + '/' + obj.barcode + '/').set({ dateCreated: obj.dateCreated, status: 'active', lastUpdatedBy: obj.user });
    },

    ship: function(shipObject){
        db.ref('inventory/' + shipObject.id + '/' + shipObject.color + '/' + shipObject.barcode + '/').update({ dateShipped: shipObject.dateShipped, tracking: shipObject.tracking, status: 'INACTIVE', lastUpdatedBy: shipObject.user, dateCreated: shipObject.dateCreated });
    },

    lastChanged: function(obj, elementPrefix){
        firebase.ref('inventory/' + obj.id + '/' + obj.color + '/' + obj.barcode + '/').once('value', snap => {
            this.nameLookup(obj.id, $('#' + elementPrefix + '-name'), obj.color);
            $('#' + elementPrefix + '-barcode').text('Barcode: ' + obj.barcode);
            $('#' + elementPrefix + '-date').text('Date Created: ' + snap.val().dateCreated);
            $('#' + elementPrefix + '-status').text('Status: ' + snap.val().status);
            $('#last-' + elementPrefix + '').attr('class', 'green accent-3')
        })
    }
}

module.exports = firebaseFunctions;