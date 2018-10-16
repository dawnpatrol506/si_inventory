$(document).ready(function () {
    $('.modal').modal();
    $('select').formSelect();


    let db = firebase.database();
    let storedb = firebase.firestore();

    let alpha = [];
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
        let id = parseId(barcode);
        let color = parseColor(id, barcode);
        let dateCreated = parseDateCreated(barcode);

        db.ref('inventory/' + id + '/' + color + '/' + barcode + '/').set({dateCreated: dateCreated, status: 'active' });
        $('#last-add').attr('class', 'white');

        setTimeout(() => db.ref('inventory/' + id + '/' + color + '/' + barcode + '/').once('value', snap => {
            addNameLookup(id, $('#added-name'), color);
            $('#added-barcode').text('Barcode: ' + barcode);
            $('#added-date').text('Date Created: ' + snap.val().dateCreated);
            $('#added-status').text('Status: ' + snap.val().status);
            $('#last-add').attr('class', 'green accent-3')
        }), 200);
    }

    function addNameLookup(id, elem, color){
        db.ref('part_lookup/' + id).once('value', snap => {
            elem.text(snap.val() + ' ' + color.toUpperCase());
        })
    }

    // function verifyAddInventory(barcode){}

    function countActiveParts(snap, color){
        $.each(snap, (key, value) => {
            let count = 0;
            $.each(value, (key, value) =>{
                if(key.toUpperCase() === color.toString().toUpperCase()){
                    $.each(value, (key, value) => {
                        if(value.status.toUpperCase() === 'ACTIVE'){
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

    $('select').on('change', function(e){
        let color = $(this).val();
        db.ref('/inventory').once('value', snap => {
            snap = snap.val();
            countActiveParts(snap, color);
        })
    })

    db.ref('/inventory').on('value', snap => {
        let color = $('#color-selector').val();
        console.log(color);
        snap = snap.val();
        countActiveParts(snap, color);
    })
    

    $('#add-sbmt').on('click', function(e){
        e.preventDefault();
        const barcode = $('#add-barcode').val();
        addInventory(barcode);
        $('#add-barcode').val('');
        $('#add-barcode').focus();
    })

})