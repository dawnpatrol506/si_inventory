const functions = 

function normalizeDB() {
    db.ref('inventory/').once('value', snap => {
        for (part in snap.val()) {
            for (color in snap.val()[part]) {
                for (barcode in snap.val()[part][color]) {
                    if (snap.val()[part][color][barcode].status.toUpperCase() !== 'ACTIVE') {
                        let pasteRef = `/shipped/${part}/${color}/${barcode}`;
                        let cutRef = `/inventory/${part}/${color}/${barcode}`;

                        db.ref(pasteRef).set(snap.val()[part][color][barcode], err => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            else {
                                db.ref(cutRef).set(null, err => {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                })
                            }
                        })
                    }
                }
            }
        }
    });
}