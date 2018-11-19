$(document).ready(function () {
    $('.sidenav').sidenav({ preventScrolling: false });
    $('select').formSelect();
    $('.datepicker').datepicker();

    const noUiSlider = require('nouislider');
    
    var slider = document.getElementById('range-slider');
    noUiSlider.create(slider, {
     start: [20, 80],
     connect: true,
     step: 1,
     direction: 'rtl',
     orientation: 'horizontal', // 'horizontal' or 'vertical'
     range: {
       'min': 0,
       'max': 100
     },
     format: wNumb({
       decimals: 0
     })
    });
    

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

    function createChart(element, data, type, options) {
        let canvas = $('<canvas>');
        var chart = new Chart(canvas, {
            type: type,
            data: data,
            options: options
        });

        element.empty();
        element.append(canvas);
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
        let color = $('#color-selector > option:selected').attr('data-value') || 'BLACK';
        let options = {
            title: {
                display: true,
                position: 'top',
                fontSize: '20',
                text: `${$('#part-selector > option:selected').text()}: ${color} by Week`
            }
        }

        getIndividualPartData(id, color, (data) => {
            createChart($('#main-chart'), data, $('.graph-type:checked').val(), options);
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

        for (let i = 1; i < 53; i++) {
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
                if (yearKey === '2017')
                    rgba = 'rgba(63, 81, 181, 1)';
                else
                    rgba = 'rgba(0, 150, 136, 1)';

                data.datasets.push({
                    label: yearKey,
                    fill: $('.graph-type:checked').val() === 'line' ? false : true,
                    data: arr,
                    borderColor: rgba,
                    borderWidth: 3,
                    pointBackgroundColor: rgba,
                    backgroundColor: rgba
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
                    fill: $('.graph-type:checked').val() === 'line' ? false : true,
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
        let options = {
            title: {
                display: true,
                position: 'top',
                fontSize: '20',
                text: 'Packages by Week'
            }
        }
        createChart($('#main-chart'), data, $('.graph-type:checked').val(), options);
    })




})