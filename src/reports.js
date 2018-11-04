$(document).ready(function () {
    $('.sidenav').sidenav({ preventScrolling: false });
    $('select').formSelect();

    const Chart = require('chart.js');
    const firebase = require('firebase');

    var config = {
        apiKey: "AIzaSyD2CbEExz1gA7rxIviKjncl9Rpw03WpbXY",
        authDomain: "strandindinventory.firebaseapp.com",
        databaseURL: "https://strandindinventory.firebaseio.com",
        projectId: "strandindinventory",
        storageBucket: "strandindinventory.appspot.com",
        messagingSenderId: "854079353246"
    };

    firebase.initializeApp(config);

    const db = firebase.database();

    function createLineChart(element, data) {
        // console.log(element, data);
        var chart = new Chart(element, {
            type: 'line',
            data: data,
        });
    };

    db.ref('/part_lookup').once('value', snap => {
        $.each(snap.val(), (key, value) => {
            let newOption = $(`<option data-value="${key}">${value}</option>`)
            $('#part-selector').append(newOption);
        })
        $('#part-selector').formSelect();
    })

    $(document).on('change', '#part-selector', function (e) {
        let id = $('#part-selector > option:selected').attr('data-value');
        db.ref(`/color_lookup/${id}/`).once('value', snap => {
            let colors = snap.val().split(', ');
            $('#color-selector').empty();

            colors.forEach(color => {
                let newOption = $(`<option data-value="${color}">${color}</option>`);
                $('#color-selector').append(newOption);
            })
            $('#color-selector').formSelect();
        })
    })

    $(document).on('click', '#generate-graph', function (e) {
        let id = $('#part-selector > option:selected').attr('data-value');
        let color = $('#color-selector > option:selected').attr('data-value').toUpperCase();
        getIndividualPartData(id, color, (data) => {
            createLineChart($('#main-chart'), data);
        })
    })

    function getIndividualPartData(id, color, callback) {
        let data = {
            labels: [],
            xAxisID: 'Time in Weeks',
            yAxisID: 'Number of Packages Shipped',
            datasets: []
        }
        let date = moment();

        for(let i = 1; i < 53; i++){
            data.labels.push(i);
        }

        db.ref(`/sales/${id}/${color}/`).once('value', snap => {
            // console.log('SNAP: ', snap.val());
            $.each(snap.val(), (yearKey, yearValue) => {
                let arr = [];
                for (let i = 1; i < 53; i++) {
                    let count = 0;
                    $.each(yearValue, (monthKey, monthValue) => {
                        $.each(monthValue, (weekKey, weekValue) => {
                            //console.log('week', weekKey, ' i', i);
                            if (parseInt(weekKey) === i) {
                                $.each(weekValue, (dayKey, dayValue) => {
                                    // console.log(dayKey, ': ', dayValue);
                                    if (dayValue !== undefined && dayValue !== null)
                                        count += Object.keys(dayValue).length;
                                        // console.log('COUNT: ', count);
                                })
                            }
                        })
                    })
                    if (count > 0) {
                        arr.push(count);
                    }
                }
                let rgba;
                if(yearKey === '2017')
                    rgba = 'rgba(63, 81, 181, 1)';
                else
                    rgba = 'rgba(0, 150, 136, 1)';

                data.datasets.push({
                    label: yearKey,
                    fill: false,
                    data: arr,
                    borderColor: rgba,
                    borderWidth: 3,
                    pointBackgroundColor: rgba
                });
            })
            callback(data);
        })
    }

    function getYearData(path, numberOfPoints, callback) {
        let data = {
            labels: [],
            xAxisID: 'Time in Weeks',
            yAxisID: 'Number of packages Shipped',
            datasets: []
        }

        for (let i = 1; i <= numberOfPoints; i++) { data.labels.push(i) };

        db.ref(path).once('value', snap => {
            $.each(snap.val(), (yearKey, valueKey) => {
                let arr = [];
                for (let i = 1; i <= numberOfPoints; i++) {
                    arr.push(snap.val()[yearKey][i]);
                }
                let lineData = {
                    data: arr,
                    label: yearKey,
                    fill: false,
                    borderColor: snap.val()[yearKey].rgb,
                    borderWidth: 3,
                    pointBackgroundColor: snap.val()[yearKey].rgb
                }
                data.datasets.push(lineData);
            })
            callback(data);
        })
    }

    getYearData('/report_data', 52, data => {
        createLineChart($('#main-chart'), data);
        // console.log(data);
    })




})