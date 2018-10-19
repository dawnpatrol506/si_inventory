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

    $(document).on('click', '.table-row', function () {
        if ($(this).hasClass('showing-buttons') || $(this).hasClass('buttons-removed')) {
            $(this).removeClass('buttons-removed');
        }
        else {
            if($('tooltipped').length){
                $('tooltipped').tooltip('destroy');
            }
            $('.table-row').find('.temp-td').remove();
            $('.showing-buttons').removeClass('showing-buttons');
            let countBtn = $('<a class="btn-small waves-effect waves-light green tooltipped black-text" data-position="top" data-tooltip="Correct inventory count"><i class="material-icons">check_circle_outline</i></a>');
            let reviewBtn = $('<a class="btn-small waves-effect waves-light orange tooltipped black-text" data-position="top" data-tooltip="Request inventory count"><i class="material-icons">radio_button_unchecked</i></a>');
            let closeBtn = $('<a class="btn-small waves-effect waves-light red td-closer tooltipped black-text" data-position="top" data-tooltip="Hide buttons"><i class="material-icons">cancel</i></a>');
            let row = $('<td class="temp-td">').append(countBtn, reviewBtn, closeBtn);
            $(this).append(row);
            $(this).addClass('showing-buttons');
            $('.tooltipped').tooltip();
        }
    })

    $(document).on('click', '.td-closer', function(){
        $('.tooltipped').tooltip('destroy');
        $('.temp-td').remove();
        $('.showing-buttons').addClass('buttons-removed');
        $('.showing-buttons').removeClass('showing-buttons');
    });

    firebaseFunctions.populateTable();
})