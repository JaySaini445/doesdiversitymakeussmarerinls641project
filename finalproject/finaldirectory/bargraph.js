class BarGraph {
    constructor(svg_id) {
        this.url = "myfuturenc.csv";
        this.svg_id = svg_id;
        this.dispatch = d3.dispatch("selectCounty");

        this.loadAndPrepare();
    }

    loadAndPrepare(county) {
        d3.csv(this.url, d => {
            return {
                american_indian_pub_students: parseFloat(d.american_indian_pub_students),
                asian_pacific_islander_pub_students: parseFloat(d.asian_pacific_islander_pub_students),
                black_pub_students: parseFloat(d.black_pub_students),
                hispanic_pub_students: parseFloat(d.hispanic_pub_students),
                multiracial_pub_students: parseFloat(d.multiracial_pub_students),
                white_pub_students: parseFloat(d.white_pub_students),
                K13_Students_Traditional_Schools: parseInt(d.K13_Students_Traditional_Schools.replace(/,/g, '')),
                Geographic_Type: d.Geographic_Type,
                Name: d.Name
            }
        }).then(data => {
            if (county == undefined) {
                county = 1;
            } else {
                county = +county;
            }

            let race_data = [
                {american_indian: data[county].american_indian_pub_students},
                {asian_pacific_islander: data[county].asian_pacific_islander_pub_students},
                {black: data[county].black_pub_students},
                {hispanic: data[county].hispanic_pub_students},
                {multiracial: data[county].multiracial_pub_students},
                {white: data[county].white_pub_students}
            ]

            this.render(county, race_data)
        })
    }

    render(county, race_data) {

        this.county = county

        let data = [
            {group: 'American Indian', value: race_data[0].american_indian},
            {group: 'Asian/Pacific Islander', value: race_data[1].asian_pacific_islander},
            {group: 'Black', value: race_data[2].black},
            {group: 'Hispanic', value: race_data[3].hispanic},
            {group: 'Multiracial', value: race_data[4].multiracial},
            {group: 'White', value: race_data[5].white}
        ];

        let max_value = d3.max(data, d => d.value);

        let x = d3.scaleLinear()
            .domain([0, max_value])
            .range([0, 600]);

       // this.region_color =  d3.scaleOrdinal()
          //  .domain = (['American Indian', 'Asian/Pacific Islander', 'Black', 'Hispanic', 'Multiracial', 'White'])
           // .range = (["#e06666", "#f6b26b", "#93c47d", "#6fa8dc", "#8e7cc3", "#c27ba0"]);
        this.region_color = d3.scaleOrdinal(["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"]);

        // Select the chart div which will be the container for the new bar chart
        let chart = d3.select(".chart");

        chart.selectAll("div")
            .data(data).join("div")
            .style("background", d => this.region_color(d.group))
            .style("color", "black")
            .style("text-align", "right")
            .style("font", "10px san-serif")
            .style("padding", "10px")
            .style("margin", "1px")
            .style("width", d => x(d.value) + "px")
            .text((d, i) => data[i].group)
            .attr("data-tippy-content", d => {
                let html = "<table>";
                html += "<tr><td>" + d.value + "%" + "</td></tr>"
                return html;
            })
            .call(selection => tippy(selection.nodes(), {allowHTML: true}));
    }

    filterCounty(data) {
        // Get matching data.
        // let matching_data = this.county === data;

        this.county = data

        bar.loadAndPrepare(data)

        d3.select('#county_select').property('value', data)


        console.log(this.county + " is toolbar index")
        console.log(data + " is the on click index")

        // console.log(county_name)
        // console.log(this.data[0][0].CTYNAME)
    }

}