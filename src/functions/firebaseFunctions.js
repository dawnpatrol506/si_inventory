const fb = require('firebase');
const helper = require('./helperFunctions');

var config = {
    apiKey: "AIzaSyD2CbEExz1gA7rxIviKjncl9Rpw03WpbXY",
    authDomain: "strandindinventory.firebaseapp.com",
    databaseURL: "https://strandindinventory.firebaseio.com",
    projectId: "strandindinventory",
    storageBucket: "strandindinventory.appspot.com",
    messagingSenderId: "854079353246"
};

fb.initializeApp(config);


const firebase = fb.database();

const firebaseFunctions = {
    nameLookup: function (id, elem, color) {
        firebase.ref('part_lookup/' + id).once('value', snap => {
            elem.text(snap.val() + ' ' + color.toUpperCase());
        })
    },

    add: function (obj) {
        firebase.ref('inventory/' + obj.id + '/' + obj.color + '/' + obj.barcode + '/').set({ dateCreated: obj.dateCreated, status: 'active', lastUpdatedBy: obj.user });
    },

    ship: function (shipObject) {
        firebase.ref('inventory/' + shipObject.id + '/' + shipObject.color + '/' + shipObject.barcode + '/').update({ dateShipped: shipObject.dateShipped, tracking: shipObject.tracking, status: 'INACTIVE', lastUpdatedBy: shipObject.user, dateCreated: shipObject.dateCreated });
    },

    lastChanged: function (obj, elementPrefix) {
        firebase.ref('inventory/' + obj.id + '/' + obj.color + '/' + obj.barcode + '/').once('value', snap => {
            this.nameLookup(obj.id, $('#' + elementPrefix + '-name'), obj.color);
            $('#' + elementPrefix + '-barcode').text('Barcode: ' + obj.barcode);
            $('#' + elementPrefix + '-date').text('Date Created: ' + snap.val().dateCreated);
            $('#' + elementPrefix + '-status').text('Status: ' + snap.val().status);
            $('#last-' + elementPrefix + '').attr('class', 'green accent-3')
        })
    },

    populateTable: function(){
        firebase.ref('/part_lookup').once('value', snap => {

            snap = snap.val();
            $.each(snap, (key, value) => {
                let newTableRow = $('<tr class="table-row"><td>' + value + '</td><td id="' + key + '">0</td></tr>');
                $('#table').append(newTableRow);
            })

            firebase.ref('/inventory').once('value', snap =>{
                helper.countActiveParts(snap.val(), 'black');
            })

        })
    },



    firebase: firebase
}

module.exports = firebaseFunctions;