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
            {group: 'American Indian', value: race_data[0].american_indian, nc_avg: 1},
            {group: 'Asian/Pacific Isl.', value: race_data[1].asian_pacific_islander, nc_avg: 4},
            {group: 'Black', value: race_data[2].black, nc_avg: 24},
            {group: 'Hispanic', value: race_data[3].hispanic, nc_avg: 19},
            {group: 'Multiracial', value: race_data[4].multiracial, nc_avg: 6},
            {group: 'White', value: race_data[5].white, nc_avg: 46}
        ];

        // set the dimensions and margins of the graph
        let margin = {top: 0, right: 10, bottom: 40, left: 90},
            width = 630 - margin.left - margin.right,
            height = 265 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select(".chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

            // Add X axis
        let x = d3.scaleLinear()
            .domain([0, 100])
            .range([ 0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('y', 260)
            .attr('x', 257)
            .style('text-anchor', 'middle')
            .text('% of County Public School Population');

            // Y axis
        let y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(d) { return d.group; }))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y))

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0) )
            .attr("y", function(d) { return y(d.group); })
            .attr("width", function(d) { return x(d.value); })
            .attr("height", y.bandwidth() )
            .attr("fill", "#69b3a2")
            .attr("data-tippy-content", d => {
                let html = "<table>";
                html += "<tr><td>" + "County: " + d.value + "%" + "<br>" + "NC Avg: " + d.nc_avg + "%" + "</td></tr>"
                return html;
            })
            .call(selection => tippy(selection.nodes(), {allowHTML: true}));

        bar = svg.selectAll("myRect")
            .data(data)
            .enter()
        bar.append("line")
            .attr("x1", function(d) { return x(d.nc_avg)})
            .attr("y1", function(d) { return y(d.group); })
            .attr('x2', function(d) { return x(d.nc_avg)})
            .attr("y2", function(d) { return y(d.group) +y.bandwidth(); })
            .attr("stroke-width", 1)
            .attr("stroke", "black");

        this.svg = svg
        this.y = y
        this.x = x
    }

    loadAndPrepare2(county) {
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
            let race_data = [
                {american_indian: data[county].american_indian_pub_students},
                {asian_pacific_islander: data[county].asian_pacific_islander_pub_students},
                {black: data[county].black_pub_students},
                {hispanic: data[county].hispanic_pub_students},
                {multiracial: data[county].multiracial_pub_students},
                {white: data[county].white_pub_students}
            ]

            let combined_data = [
                {group: 'American Indian', value: race_data[0].american_indian, nc_avg: 1},
                {group: 'Asian/Pacific Isl.', value: race_data[1].asian_pacific_islander, nc_avg: 4},
                {group: 'Black', value: race_data[2].black, nc_avg: 24},
                {group: 'Hispanic', value: race_data[3].hispanic, nc_avg: 19},
                {group: 'Multiracial', value: race_data[4].multiracial, nc_avg: 6},
                {group: 'White', value: race_data[5].white, nc_avg: 46}
            ]

            this.render2(combined_data)
        })
    }

    render2(combined_data) {
        console.log(combined_data)

        let x = this.x
        let y = this.y

        this.svg.selectAll("rect").data(combined_data).join(
            enter => enter,
            update => update.attr("x", x(0) )
                .attr("y", function(d) { return y(d.group); })
                .attr("width", function(d) { return x(d.value); })
                .attr("height", y.bandwidth() )
                .attr("fill", "#69b3a2"),
            exit => exit.style("fill", "black")
        )

        console.log("fuck")
    }

    filterCounty(county) {
        // Get matching data.
        // let matching_data = this.county === data;

        this.county = county

        console.log(this.county)

        this.loadAndPrepare2(county)

        d3.select('#county_select').property('value', county)


        console.log(this.county + " is toolbar index")
        console.log(county + " is the on click index")

        // console.log(county_name)
        // console.log(this.data[0][0].CTYNAME)
    }

        /*
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

         */
}