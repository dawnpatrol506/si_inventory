$(document).ready(function () {
    $('.modal').modal();
    $('select').formSelect();
    $('.dropdown-trigger').dropdown({ constrainWidth: false });
    $('.sidenav').sidenav({preventScrolling: false});



    const add = require('./functions/add');
    const ship = require('./functions/ship');
    const firebaseFunctions = require('./functions/firebaseFunctions');
    const helper = require('./functions/helperFunctions');
    const firebase = require('firebase/app');
    require('firebase/auth');
    let user;


    firebase.auth().onAuthStateChanged(userAuth => {
        if (userAuth) {
            $('#sign-in').attr('style', 'display:none');
            $('#nav-area').attr('style', '');
            $('#main-container').attr('style', '');
            $('#side-nav').attr('style', '');
            user = userAuth.displayName;
        }
        else {
            $('#sign-in').attr('style', '');
            $('#nav-area').attr('style', 'display:none');
            $('#main-container').attr('style', 'display:none');
            $('#side-nav').attr('style', 'display:none');
            user = '';


            $('#sign-in-button').on('click', (e) => {
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                    .then(() => {
                        const provider = new firebase.auth.GoogleAuthProvider();
                        return firebase.auth().signInWithPopup(provider).then(result => {

                            $('#sign-in').attr('style', 'display:none');
                            $('#nav-area').attr('style', '');
                            $('#main-container').attr('style', '');
                            $('#side-nav').attr('style', 'display:none');
                            user = (result.user.displayName);
                        }).catch(err => {
                            if (err) throw err;
                        })
                    });
                $('#sign-in-button').off('click');
            });
        }
    });

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

    $(document).on('click', '#check-sbmt', function (e) {
        e.preventDefault();
        if (!helper.verifyBarcode($('#check-barcode').val())) {
            $('#check-barcode').val('');
            $('#check-barcode').focus();
            return;
        }
        let id = $('.showing-buttons').children().eq(1).attr('id');
        let color = $('#color-selector').val().toUpperCase();
        let barcode = $('#check-barcode').val().trim();
        let scanId = helper.parseId(barcode);
        let scanColor = helper.parseColor(scanId, barcode);
        scanColor = scanColor.toUpperCase();

        if (scanId !== id || scanColor !== color) {
            $('#check-barcode').val('');
            $('#check-barcode').focus();
            return;
        }
        $('#current-count').val('Current Items: ' + $('.showing-buttons').children().eq(1).val());
        $('#new-count').val('Scanned Items: ' + ($('#new-count').val() + 1));

        let newRow = $('<tr><td>' + $('#check-barcode').val() + '</td></tr>');
        $('#existing-items-array').append(newRow);
        $('#check-barcode').val('');
        $('#check-barcode').focus();
    })

    $(document).on('click', '#submit-new-count', function (e) {
        e.preventDefault();

        let existingItemsArray = [];
        $('#existing-items-array').find('td').each((key, value) => existingItemsArray.push(value.textContent.trim()));

        let sbmt = confirm('Are you sure you want to submit this list of barcodes? Empty lists will remove all items of this type from inventory');

        if (sbmt) {
            if (existingItemsArray.length < 1)
                firebaseFunctions.removeAll($('.showing-buttons').children().eq(1).attr('id'), $('#color-selector').val().toUpperCase(), user);
            else
                firebaseFunctions.recountItem(existingItemsArray, user);
        }

        $('#existing-items-array').empty();
    })

    $('select').on('change', (e) => {
        $('#existing-items-array').empty();

        firebaseFunctions.firebase.ref('/inventory').on('value', snap => {
            let color = $('#color-selector').val();
            snap = snap.val();
            helper.countActiveParts(snap, color);
        })
    })

    $(document).on('click', '.table-row', function () {
        $('#existing-items-array').empty();

        if ($(this).hasClass('showing-buttons') || $(this).hasClass('buttons-removed')) {
            $(this).removeClass('buttons-removed');
        }
        else {
            if ($('tooltipped').length) {
                $('tooltipped').tooltip('destroy');
            }
            $('.temp-td').remove();
            $('.showing-buttons').removeClass('showing-buttons');
            let countBtn = $('<a href="#check-modal" class="btn-small waves-effect waves-light green tooltipped black-text modal-trigger" data-position="top" data-tooltip="Correct inventory count"><i class="material-icons">check</i></a>');
            let reviewBtn = $('<a class="btn-small waves-effect waves-light orange tooltipped black-text review-btn" data-position="top" data-tooltip="Request inventory count"><i class="material-icons">priority_high</i></a>');
            let closeBtn = $('<a class="btn-small waves-effect waves-light red td-closer tooltipped black-text" data-position="top" data-tooltip="Hide buttons"><i class="material-icons">close</i></a>');
            let td = $('<td>').append(countBtn, reviewBtn, closeBtn);
            $(this).addClass('showing-buttons');



            firebaseFunctions.getRecentSalesData($('.showing-buttons').children().eq(1).attr('id'), $('#color-selector').val().toUpperCase(), moment(), function (data) {
                let thisWeek = $('<span class="sales-data red-text tooltipped" data-position="top" data-tooltip="yesterday">' + data.yesterdayCount + '</span>');
                let lastWeek = $('<span class="sales-data blue-text">' + data.thisWeekCount + '</span>');
                let thisMonth = $('<span class="sales-data green-text">' + data.lastWeekCount + '</span>');
                let weeklyAvg = $('<span class="sales-data orange-text">?</span>');

                let row = $('<tr class="temp-td">').append(td, $('<td class="bold">').append(thisWeek, lastWeek, thisMonth, weeklyAvg));
                $('.showing-buttons').after(row);
                $('.tooltipped').tooltip();

            });
        }
    })

    $(document).on('click', '.td-closer', function () {
        $('.tooltipped').tooltip('destroy');
        $('.temp-td').remove();
        $('.showing-buttons').addClass('buttons-removed');
        $('.showing-buttons').removeClass('showing-buttons');
    });

    $(document).on('click', '.review-btn', function () {
        let id = $('.showing-buttons').children().eq(1).attr('id');
        let color = $('#color-selector').val();
        firebaseFunctions.firebase.ref('part_lookup/' + id).once('value', snap => {
            firebaseFunctions.firebase.ref('review_requests/' + snap.val() + '/' + color + '/').set({ open: true });
        });
    });

    firebaseFunctions.firebase.ref('review_requests/').on('value', snap => {
        $('#notification-dropdown-1').empty();
        $('#notification-dropdown-2').empty();
        let count = 0;
        $.each(snap.val(), (key, value) => {
            $.each(value, (nextKey, nextValue) => {
                count++;
                let newNotification = $('<li><a href="#" class="delete-notification">' + key.toUpperCase() + ': ' + nextKey.toUpperCase() + '     </a></li>');

                $('#notification-dropdown-1').append(newNotification);
                $('#notification-dropdown-2').append(newNotification.clone());
            })
        })
        if (count === 0) {
            $('#notification-badge').attr('class', 'badge');
        }
        else {
            $('#notification-badge').attr('class', 'badge new red');
        }

        $('.notification-badge').text(count);
    });

    $(document).on('click', '.delete-notification', function () {
        console.log($(this).text());
        let splitArray = $(this).text().split(':');
        console.log(splitArray);
        firebaseFunctions.firebase.ref('review_requests/' + splitArray[0].trim() + '/' + splitArray[1].trim().toLowerCase()).remove()
    })

    $(document).on('click', '#log-out', () => {
        firebase.auth().signOut().then(() => console.log(`Signed out: ${user}`), (err) => { if (err) console.log(err); });
    })

    firebaseFunctions.populateTable();
})