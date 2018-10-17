$(document).ready(function () {
    $('.modal').modal();
    $('select').formSelect();


    const db = firebase.database();
    let user;

    const alpha = [];
    for (var i = 97; i < (97 + 26); i++) {
        alpha.push(String.fromCharCode(i));
    }
    for (let i = 0; i < 10; i++) {
        alpha.push(i.toString());
    }

    let colors = ['BLACK', 'WHITE', 'BLUE', 'ORANGE', 'RED', 'LIME', 'GRAY', 'BLACK WRINKLE', 'BLACK TEXTURE'];
    let drpa = ['DRIVER', 'PASSENGER'];
    let ws = ['CLEAR', 'TINTED'];

    function parseId(barcode) {
        return barcode.substring(0, 2);
    }

    function parseColor(id, barcode) {
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
    }

    function parseDateCreated(barcode) {
        let day = alpha.indexOf(barcode.substring(3, 4));
        let month = alpha.indexOf(barcode.substring(4, 5));
        let year = alpha.indexOf(barcode.substring(5, 6));
        let hour = alpha.indexOf(barcode.substring(6, 7));

        return month + '/' + day + '/20' + year + ' ' + hour + ':00';
    }

    function addInventory(barcode) {
        if(!verifyBarcode(barcode)){
            console.log('error');
            $('#added-name').text('Error reading barcode');
            $('#last-add').attr('class', 'red');
            $('#add-barcode').focus();
            return;
        }

        let id = parseId(barcode);
        let color = parseColor(id, barcode);
        let dateCreated = parseDateCreated(barcode);

        db.ref('inventory/' + id + '/' + color + '/' + barcode + '/').set({ dateCreated: dateCreated, status: 'active', lastUpdatedBy: user });
        $('#last-add').attr('class', 'white');

        setTimeout(() => db.ref('inventory/' + id + '/' + color + '/' + barcode + '/').once('value', snap => {
            addNameLookup(id, $('#added-name'), color);
            $('#added-barcode').text('Barcode: ' + barcode);
            $('#added-date').text('Date Created: ' + snap.val().dateCreated);
            $('#added-status').text('Status: ' + snap.val().status);
            $('#last-add').attr('class', 'green accent-3')
        }), 200);
    }

    function shipInventory(barcode, tracking) {
        if(!verifyBarcode(barcode)){
            $('#shipped-name').text('Error reading barcode');
            $('#last-ship').attr('class', 'red');
            $('#ship-barcode').focus();
            return;
        }

        if(!verifyTracking(tracking)){
            $('#shipped-name').text('Error reading tracking #');
            $('#last-ship').attr('class', 'red');
            $('#ship-barcode').focus();
            return;
        }

        let id = parseId(barcode);
        let color = parseColor(id, barcode);
        let dateCreated = parseDateCreated(barcode);
        let dateShipped = new Date();
        tracking = tracking.substring(tracking.length - 12, tracking.length);

        db.ref('inventory/' + id + '/' + color + '/' + barcode + '/').update({ dateShipped: dateShipped, tracking: tracking, status: 'INACTIVE', lastUpdatedBy: user, dateCreated: dateCreated });
        $('#last-ship').attr('class', 'white');

        setTimeout(() => db.ref('inventory/' + id + '/' + color + '/' + barcode + '/').once('value', snap => {
            addNameLookup(id, $('#shipped-name'), color);
            $('#shipped-barcode').text('Barcode: ' + barcode);
            $('#shipped-date').text('Date Created: ' + snap.val().dateCreated);
            $('#shipped-status').text('Status: ' + snap.val().status);
            $('#last-ship').attr('class', 'green accent-3');
        }), 200);
        $('#ship-barcode').focus();
    }

    function addNameLookup(id, elem, color) {
        db.ref('part_lookup/' + id).once('value', snap => {
            elem.text(snap.val() + ' ' + color.toUpperCase());
        })
    }

    function verifyBarcode(barcode){
        let bool = true;

        if(barcode.trim().length !== 18)
            bool = false;
        if(!isNaN(barcode.substring(0,1)))
            bool = false;

        return bool;
    }

    function verifyTracking(tracking){
        let bool = true;

        if(tracking.length < 12)
            bool = false;

        // for(let i = 0; i < tracking.length; i++){
        //     if(!isNaN(tracking.charAt(i)))
        //         bool = false;
        // }

        return bool;
    }

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

        // db.ref('/inventory').once('value', snap => {
        //     snap = snap.val();
        //     countActiveParts(snap, color);                       
        // });
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
        addInventory(barcode);
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
            shipInventory(barcode, tracking);
            $('#ship-barcode').val('');
            $('#ship-tracking').val('');
            $('#ship-tracking').focus();
        }
    })

    function signIn(){
        var provider = new firebase.auth.GoogleAuthProvider();
       firebase.auth().signInWithPopup(provider).then(result => {
            user = result.user.displayName;
            $('#sign-in').attr('style', 'display:none');
            $('#nav-area').attr('style', '');
            $('#main-container').attr('style', '');
        }).catch(err =>{
            if(err) throw err;    
        })
    }

    $('#sign-in-button').on('click', (e) =>{
        signIn();
        $('#sign-in-button').off('click');
    });
})