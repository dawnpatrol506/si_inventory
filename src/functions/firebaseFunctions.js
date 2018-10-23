const fb = require('firebase/app');
require('firebase/database');
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

    populateTable: function () {
        firebase.ref('/part_lookup').once('value', snap => {

            snap = snap.val();
            $.each(snap, (key, value) => {
                let newTableRow = $('<tr class="table-row"><td>' + value + '</td><td id="' + key + '">0</td></tr>');
                $('#table').append(newTableRow);
            })

            firebase.ref('/inventory').once('value', snap => {
                helper.countActiveParts(snap.val(), 'black');
            })

        })
    },

    recountItem: function (existingItemsArray, user) {
        const id = helper.parseId(existingItemsArray[0]);
        const color = helper.parseColor(id, existingItemsArray[0]);

        firebase.ref('/inventory/' + id + '/' + color.toUpperCase() + '/').once('value', (snap) => {
            let dbBarcodes = [];
            $.each(snap.val(), (key, value) => dbBarcodes.push(key));

            dbBarcodes.forEach(code => {
                let index = existingItemsArray.indexOf(code);
                if (index < 0) {
                    firebase.ref('/inventory/' + id + '/' + color.toUpperCase() + '/' + code + '/').update({ status: 'Inactive', lastUpdatedBy: user, dateShipped: 'unknown' });
                }
                else {
                    existingItemsArray.splice(index, 1);
                    if (snap.val()[code].status !== 'active') {
                        firebase.ref('/inventory/' + id + '/' + color.toUpperCase() + '/' + code + '/').update({ status: 'Active', lastUpdatedBy: user, dateShipped: '' });
                    }
                }
            })
        })

        if (existingItemsArray.length > 0) {
            existingItemsArray.forEach(barcode => {
                const obj = {
                    id: id,
                    color: color,
                    barcode: barcode,
                    dateCreated: helper.parseDateCreated(barcode),
                    user: user
                }

                this.add(obj);
            })
        }
    },

    removeAll: function (id, color, user) {
        firebase.ref(`/inventory/${id}/${color.toUpperCase()}/`).once('value', snap => {
            $.each(snap.val(), (key, value) => {
                if (value.status.toUpperCase() === 'ACTIVE') {
                    let ref = `/inventory/${id}/${color}/${key}/`;
                    firebase.ref(ref).update({ status: 'Inactive', lastUpdatedBy: user, dateShipped: 'Unknown' });
                }
            })
        })
    },

    inputSalesData: function (shipObject, DateObject) {
        const ref = firebase.ref(`/sales/${shipObject.id}/${shipObject.color.toUpperCase()}/${DateObject.year}/${DateObject.month}/${DateObject.week}/${DateObject.day}/`);
        ref.child(shipObject.barcode).set('_');
    },

    getRecentSalesData: function (id, color, date, callback) {
        const ref = firebase.ref(`sales/${id}/${color}/${date.year()}/${date.month() + 1}`);
        ref.once('value', snap => {
            snap = snap.val();

            let yesterdayCount = 0;
            let thisWeekCount = 0;
            let lastWeekCount = 0;

            if (snap === null) {
                const data = {
                    yesterdayCount,
                    thisWeekCount,
                    lastWeekCount,
                }
                callback(data);
                return;
            }

            if (snap[date.week()][date.day() - 1] !== null) {
                yesterdayCount = Object.keys(snap[date.week()][date.day() - 1]).length;
            }

            if (snap[date.week()] !== undefined) {
                snap[date.week()].forEach(value => {
                    thisWeekCount += Object.keys(value).length;
                })
            }


            if (snap[date.week() - 1] !== undefined) {
                snap[date.week() - 1].forEach(value => {
                    lastWeekCount += Object.keys(value).length;
                })
            }

            const data = {
                yesterdayCount,
                thisWeekCount,
                lastWeekCount
            };

            callback(data);
        });
    },

    firebase: firebase
}

module.exports = firebaseFunctions;