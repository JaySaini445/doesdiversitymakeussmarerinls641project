Highcharts.setOptions({
    chart: {
        inverted: true,
        marginLeft: 50,
        type: 'bullet'
    },
    title: {
        text: "NC Data"
    },
    legend: {
        enabled: false
    },
    yAxis: {
        gridLineWidth: 0
    },
    plotOptions: {
        series: {
            pointPadding: 0.25,
            borderWidth: 0,
            color: '#000',
            targetOptions: {
                width: '200%'
            }
        }
    },
    credits: {
        enabled: false
    },
    exporting: {
        enabled: false
    }
});

Highcharts.chart('container1', {
    chart: {
        marginTop: 40
    },
    title: {
        text: '2017 YTD'
    },
    xAxis: {
        categories: ['<span class=".chart">data</span><br/>%']
    },
    yAxis: {
        plotBands: [{
            from: 0,
            to: 33,
            color: '#666'
        }, {
            from: 33,
            to: 66,
            color: '#999'
        }, {
            from: 66,
            to: 100,
            color: '#bbb'
        }],
        title: null
    },
    series: [{
        data: [{
            y: 100,
            target: 90
        }]
    }],
    tooltip: {
        pointFormat: '<b>{point.y}</b> (with target at {point.target})'
    }
});
