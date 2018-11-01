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

    populateTable: function (color) {
        $('.table-row').remove();
        let colorKeyArray = [];

        firebase.ref('/color_lookup').once('value', colorSnap => {
            colorSnap = colorSnap.val();
            $.each(colorSnap, (colorKey, colorValue) => {
                if (colorValue.split(', ').indexOf(color.toUpperCase()) !== -1) {
                    colorKeyArray.push(colorKey);
                }
            })
            firebase.ref('/part_lookup').once('value', partSnap => {
                partSnap = partSnap.val();
                $.each(partSnap, (partKey, partValue) => {

                    if (colorKeyArray.indexOf(partKey) !== -1) {
                        if (partKey == 'bi') {
                            let driver = $('<tr class="table-row"><td>4D 800/900 DOOR - DRIVER</td><td id="bi-d">0</td></tr>');
                            let pass = $('<tr class="table-row"><td>4D 800/900 DOOR - PASSENGER</td><td id="bi-p">0</td></tr>');
                            $('#table').append(driver, pass);
                        }
                        else {
                            let newTableRow = $('<tr class="table-row"><td>' + partValue + '</td><td id="' + partKey + '">0</td></tr>');
                            $('#table').append(newTableRow);
                        }
                    }
                })

                firebase.ref('/inventory').once('value', snap => {
                    helper.countActiveParts(snap.val(), color);
                })
            })
        })
    },

    recountItem: function (existingItemsArray, user) {
        const id = helper.parseId(existingItemsArray[0]);
        const color = helper.parseColor(id, existingItemsArray[0]);

        if (existingItemsArray.length === 0) {
            console.log('empty');
        }
        else {
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
            firebase.ref('/inventory').once('value', snap => {
                helper.countActiveParts(snap.val(), color);
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
            firebase.ref('/inventory').once('value', snap => {
                helper.countActiveParts(snap.val(), color);
            })
        })
    },

    inputSalesData: function (shipObject, DateObject) {
        const ref = firebase.ref(`/sales/${shipObject.id}/${shipObject.color.toUpperCase()}/${DateObject.year}/${DateObject.month}/${DateObject.week}/${DateObject.day}/`);
        ref.child(shipObject.barcode).set('_');
    },

    getRecentSalesData: function (id, color, date, callback) {
        const ref = firebase.ref(`sales/${id}/${color}/${date.year()}`);
        ref.once('value', snap => {
            snap = snap.val();

            let todayCount = 0;
            let thisWeekCount = 0;
            let lastWeekCount = 0;

            if (snap === null || snap === undefined) {
                const data = {
                    todayCount,
                    thisWeekCount,
                    lastWeekCount,
                }
                callback(data);
                return;
            }

            for (let i = 0; i < 2; i++) {
                let data = snap[date.month() + i];
                if(data === undefined || data === null){
                    continue;
                }

                if (data[date.week()] !== undefined && data[date.week()] !== null) {
                    if (data[date.week()][date.day()] === null || data[date.week()][date.day()] === undefined) {
                        todayCount = 0;
                    }
                    else {
                        if (typeof (data[date.week()][date.day()]) === 'object')
                            todayCount = Object.keys(data[date.week()][date.day()]).length;
                        else
                            console.log('YESTERDAY: ', typeof (data[date.week()][date.day()]));
                    }
                }

                if (data[date.week()] !== undefined && data[date.week()] !== null) {
                    if (Array.isArray(data[date.week()])) {
                        data[date.week()].forEach(value => {
                            thisWeekCount += Object.keys(value).length;
                        })
                    }
                    else {
                        $.each(data[date.week()], (key, value) => {
                            thisWeekCount += Object.keys(value).length;
                        })
                    }

                }

                if (data[date.week() - 1] !== undefined && data[date.week() - 1] !== null) {
                    if (Array.isArray(data[date.week() - 1])) {
                        data[date.week() - 1].forEach(value => {
                            lastWeekCount += Object.keys(value).length;
                        })
                    }
                    else {
                        $.each(data[date.week() - 1], (key, value) => {
                            lastWeekCount += Object.keys(value).length;
                        })
                    }

                }
            }

            const data = {
                todayCount,
                thisWeekCount,
                lastWeekCount
            };
            callback(data);
        });
    },

    firebase: firebase
}

module.exports = firebaseFunctions;