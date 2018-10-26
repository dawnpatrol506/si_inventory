$(document).ready(function () {
    $('.sidenav').sidenav({ preventScrolling: false });

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
    
    function createLineChart(element, data){
        const chart = new Chart(element, {
            type: 'line',
            data: data,
        });
    };


    function getData(path, numberOfPoints, callback){
        let data = {
            labels: [],
            xAxisID: 'Time in Weeks',
            yAxisID: 'Number of packages Shipped',
            datasets: []
        }

        for(let i = 1; i <= numberOfPoints; i++){data.labels.push(i)};

        db.ref(path).once('value', snap =>{
            $.each(snap.val(), (yearKey, valueKey) =>{
                let arr = [];
                for(let i = 1; i <= numberOfPoints; i++){
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

    getData('/report_data', 52, data => {
        createLineChart($('#main-chart'), data);
    })




})