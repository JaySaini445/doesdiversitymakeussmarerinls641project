class BarGraph {
    constructor(svg_id) {
        this.url = "myfuturenc.csv";
        this.svg_id = svg_id;

        this.loadAndPrepare();
    }
    loadAndPrepare(county) {
        d3.csv(this.url, d => {
            return {
                american_indian_pub_students: d.american_indian_pub_students,
                asian_pacific_islander_pub_students: d.asian_pacific_islander_pub_students,
                black_pub_students: d.black_pub_students,
                hispanic_pub_students: d.hispanic_pub_students,
                multiracial_pub_students: d.multiracial_pub_students,
                white_pub_students: d.white_pub_students,
                K13_Students_Traditional_Schools: +d.K13_Students_Traditional_Schools,
                Geographic_Type: d.Geographic_Type,
                Name: d.Name
            }
        }).then(data => {
            if (county == undefined) {
                county = 1;
            }
            else {
                county = +county;
            }

            console.log(data[county].Name)

            let race_data = [
                {american_indian: parseFloat(data[county].american_indian_pub_students)},
                {asian_pacific_islander: parseFloat(data[county].asian_pacific_islander_pub_students)},
                {black: parseFloat(data[county].black_pub_students)},
                {hispanic: parseFloat(data[county].hispanic_pub_students)},
                {multiracial: parseFloat(data[county].multiracial_pub_students)},
                {white: parseFloat(data[county].white_pub_students)}
            ]

            this.render(county, race_data)
        })
    }

    render(county, race_data) {

        console.log(county)

        let data = [
            {group:'American Indian', value: race_data[0].american_indian},
            {group: 'Asian/Pacific Islander', value: race_data[1].asian_pacific_islander},
            {group: 'Black', value: race_data[2].black},
            {group: 'Hispanic', value: race_data[3].hispanic},
            {group: 'Multiracial', value: race_data[4].multiracial},
            {group: 'White', value: race_data[5].white}
        ];

        let max_value = d3.max(data, d => d.value);

        let x = d3.scaleLinear()
            .domain([0, max_value])
            .range([0, 1500]);

        // Select the chart div which will be the container for the new bar chart
        let chart = d3.select(".chart");

        chart.selectAll("div")
            .data(data).join("div")
            .style("background", "steelblue")
            .style("color", "white")
            .style("text-align", "right")
            .style("font", "10px san-serif")
            .style("padding", "10px")
            .style("margin", "1px")
            .style("width", d => x(d.value)+"px")
            .text((d,i) => data[i].group)
            .attr("data-tippy-content", d => {
                let html = "<table>";
                html += "<tr><td>"+ d.value + "%" + "</td></tr>"
                return html;
            })
            .call(selection => tippy(selection.nodes(), {allowHTML: true}));

        console.log(data[0].value)
    }
}