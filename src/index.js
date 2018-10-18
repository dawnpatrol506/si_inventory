$(document).ready(function () {
    $('.modal').modal();
    $('select').formSelect();

    const signIn = require('./functions/signIn');
    const add = require('./functions/add');
    const ship = require('./functions/ship');
    let user;

    function countActiveParts(snap, color) {
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

    db.ref('/part_lookup').once('value', snap => {
        let color = $('#color-selector').formSelect('getSelectedValues')[0];

        snap = snap.val();
        $.each(snap, (key, value) => {
            let newTableRow = $('<tr><td>' + value + '</td><td id="' + key + '">0</td></tr>');
            $('#table').append(newTableRow);
        })
    })

    $('select').on('change', function (e) {
        let color = $(this).val();
        db.ref('/inventory').once('value', snap => {
            snap = snap.val();
            countActiveParts(snap, color);
        })
    })

    db.ref('/inventory').on('value', snap => {
        let color = $('#color-selector').val();
        snap = snap.val();
        countActiveParts(snap, color);
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
            ship.ship(barcode, tracking);
            $('#ship-barcode').val('');
            $('#ship-tracking').val('');
            $('#ship-tracking').focus();
        }
    })

    $('#sign-in-button').on('click', (e) =>{
        user = signIn.signIn();
        $('#sign-in-button').off('click');
    });
})