$(document).ready(function () {
    $('.modal').modal();
    $('select').formSelect();

    const add = require('./functions/add');
    const ship = require('./functions/ship');
    const firebaseFunctions = require('./functions/firebaseFunctions');
    const helper = require('./functions/helperFunctions');
    const firebase = require('firebase');
    let user;

    //listeners
    firebaseFunctions.firebase.ref('/inventory').on('value', snap => {
        let color = $('#color-selector').val();
        snap = snap.val();
        helper.countActiveParts(snap, color);
    })

    $('#add-sbmt').on('click', function (e) {
        e.preventDefault();
        const barcode = $('#add-barcode').val();
        add.addInventory(barcode, user);
        $('#add-barcode').val('');
        $('#add-barcode').focus();
    })

    $('#ship-sbmt').on('click', function (e) {
        e.preventDefault();
        if ($('#ship-tracking').val() === '') {
            $('#ship-tracking').focus();
        }
        else {
            const barcode = $('#ship-barcode').val();
            const tracking = $('#ship-tracking').val();
            ship.ship(barcode, tracking, user);
            $('#ship-barcode').val('');
            $('#ship-tracking').val('');
        }
    })

    $('#sign-in-button').on('click', (e) => {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then(result => {
                
                $('#sign-in').attr('style', 'display:none');
                $('#nav-area').attr('style', '');
                $('#main-container').attr('style', '');
                user = (result.user.displayName);
            }).catch(err => {
                if (err) throw err;
            })
        $('#sign-in-button').off('click');
    });

    $('select').on('change', (e) => {
        firebaseFunctions.firebase.ref('/inventory').on('value', snap => {
            let color = $('#color-selector').val();
            snap = snap.val();
            helper.countActiveParts(snap, color);
        })
    })

    firebaseFunctions.populateTable();
})