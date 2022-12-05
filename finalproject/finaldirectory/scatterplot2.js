class Scatterplot2 {
    constructor() {
        this.url = "myfuturenc.csv";
        this.dispatch = d3.dispatch("selectCounty");

        // These variables are used to define size of the visualization canvas and the
        // margin (or "padding") around the scattter plot.  We use the margin to draw
        // things like axis labels.
        this.height = 500;
        this.width = 500;
        this.margin = 40;

        // Create the SVG canvas that will be used to render the visualization.
        this.svg = d3
            .select('#scatterplot2')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Define a variety of scales, for color, x axis and y axis.
        // Poverty rates are all below 30 percent.
        this.x = d3
            .scaleLinear()
            .domain([150, 1350])
            .range([this.margin, this.width - this.margin]);

        // Life expectancy values all fall between 70 and 90.
        this.y = d3
            .scaleLinear()
            .domain([100, 70])
            .range([this.margin, this.height - this.margin]);

        // There are 4 regions in the continental US, plus "Other" for
        // Hawaii and Alaska.
        this.region_color = d3.scaleOrdinal(d3.schemeCategory10);


        // Add axes.  First the X axis and label.
        this.svg
            .append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (500 - this.margin) + ')')
            .call(d3.axisBottom(this.x));

        this.svg
            .append('text')
            .attr('class', 'axis-label')
            .attr('y', 495)
            .attr('x', 0 + 500 / 2)
            .style('text-anchor', 'middle')
            .text('Students per School Counselor');

        // Now the Y axis and label.
        this.svg
            .append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + this.margin + ',0)')
            .call(d3.axisLeft(this.y));

        this.svg
            .append('text')
            .attr('transform', 'rotate(90)')
            .attr('class', 'axis-label')
            .attr('y', -5)
            .attr('x', 0 + 500 / 2)
            .style('text-anchor', 'middle')
            .text('Graduation Rate (%)');

        // Add a clip path.
        this.svg
            .append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('x', this.margin)
            .attr('y', this.margin)
            .attr('width', this.width - 2 * this.margin)
            .attr('height', this.height - 2 * this.margin);

        this.region_color = d3.scaleOrdinal(d3.schemeCategory10);

        this.loadAndPrepare()
    }

    loadAndPrepare() {
        d3.csv(this.url, d => {
            return {
                High_School_Graduation_Rate: parseFloat(d.High_School_Graduation_Rate),
                Students_per_School_Counselor: d.Students_per_School_Counselor.replace(/,/g, ''),
                Prosperity_Zone: d.Prosperity_Zone,
                Color: d.Color,
                Name: d.Name
            }
        }).then(data => {

            let combined_array = new Array(101)

            for (let i = 0; i < combined_array.length; i += 1) {
                combined_array[i] = {CountyName: data[i].Name, Zone: data[i].Prosperity_Zone, Color: data[i].Color, Grad_Rate: data[i].High_School_Graduation_Rate, Students_per_Counselor: data[i].Students_per_School_Counselor}
            }

            this.combined_array = combined_array

            this.render()
        })
    }

    // Next, we define the render callback.  This is used when the page first loads
    // to draw data for the entire US.  It is also called whenever the select control
    // is changed (e.g., to show only the South or only the Northeast).
    //
    // The _subset parameter will have one of six possible values: 'us', 'northeast',
    // 'south', 'west', 'midwest', or 'other'.
    render() {
        let colormap = d3.scaleOrdinal(d3.schemeCategory10);

        // Filter the data
        let circles = this.svg
            .selectAll('circle')
            .data(this.combined_array, d => d.CountyName);
        circles.join(
            (enter) =>
                enter
                    .append('circle')
                    .attr('r', 0)
                    .attr('cx', (d) => this.x(d.Students_per_Counselor))
                    .attr('cy', (d) => this.y(d.Grad_Rate))
                    .attr("fill", d => d.Color)

                    .attr("data-tippy-content", d => {
                        let html = "<table>";
                        html += "<tr><td>" + "Zone: " + d.Zone + "<br>" +  "High School Graduation Rate: " + d.Grad_Rate + "%<br>" + "Students per School Counselor: " +
                            d.Students_per_Counselor + "</td>" + "</td>" + d.CountyName + "</td></tr>"
                        return html;
                    })

                    .on("click", (event,d) => {
                        // Deal with the click locally for this chart.
                        let countyindex = this.combined_array.map(d => d.CountyName).indexOf(d.CountyName);

                        this.highlightCounty(countyindex);

                        let matching_data = this.combined_array.filter(d => d.CountyName === this.combined_array[countyindex].CountyName);

                        // Tell other "listening" charts that the specials has changed.
                        this.dispatch.call("selectCounty", this, countyindex)
                    })

                    .call(selection => tippy(selection.nodes(), {allowHTML: true}))

                    // Animate the radius to have the circles slowly grow to full size.
                    .transition()
                    .delay(500 * !circles.exit().empty())
                    .duration(500)
                    .attr('r', 5)
                    // Finally, go back to the enter selection (the circles to which we just added a transition) to
                    // add an svg:title for mouse hovers.
                    .selection()
                    .append('svg:title')
                    .text((d) => d.county),

            // There is no modification required for updated circles. They can remain unchanged...
            (update) => update,

            (exit) => exit.transition().duration(500).attr('r', 0).remove()
        );
    }

    highlightCounty(countynum) {
        let matching_data = this.combined_array.filter(d => d.CountyName === this.combined_array[countynum].CountyName);

        this.scatterDetails(matching_data)

        this.svg.selectAll("circle").data(matching_data, d => d.CountyName).join(
            enter => enter,
            update => update.style("fill", "yellow").raise().attr('r', 12),
            exit => exit.attr('r', 5).style("fill", null)
        )
    }

    scatterDetails(d) {
        document.getElementById('details2').innerHTML = 'a graduation rate of ' + d[0].Grad_Rate + '%, and ' +
            d[0].Students_per_Counselor + ' students per school counselor.'
    }
}