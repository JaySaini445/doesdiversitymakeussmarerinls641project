class Scatterplot {
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
            .select('#scatterplot1')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Define a variety of scales, for color, x axis and y axis.
        // Poverty rates are all below 30 percent.
        this.x = d3
            .scaleLinear()
            .domain([0, 100])
            .range([this.margin, this.width - this.margin]);

        // Life expectancy values all fall between 70 and 90.
        this.y = d3
            .scaleLinear()
            .domain([21, 9])
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
            .text('Diversity Index');

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
            .text('Public School Expenditure per Student');

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

    loadAndPrepare(county) {
        d3.csv(this.url, d => {
            return {
                K13_Students_Traditional_Schools: parseInt(d.K13_Students_Traditional_Schools.replace(/,/g, '')),
                Diversity_Index: +parseFloat(d.Diversity_Index).toFixed(2),
                Expenditure_per_Student_in_Thousands: +d.Expenditure_per_Student_in_Thousands,
                Prosperity_Zone: d.Prosperity_Zone,
                Name: d.Name
            }
        }).then(data => {

            let combined_array = new Array(101)

            for (let i = 0; i < combined_array.length; i += 1) {
                combined_array[i] = {CountyName: data[i].Name, Zone: data[i].Prosperity_Zone, Diversity: data[i].Diversity_Index, Expenditure: data[i].Expenditure_per_Student_in_Thousands}
            }

            this.combined_array = combined_array

            console.log(combined_array)
            console.log(combined_array[0].CountyName)

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
        // Filter the data
        let circles = this.svg
            .selectAll('circle')
            .data(this.combined_array, d => d.CountyName);
        circles.join(
            (enter) =>
                enter
                    .append('circle')
                    .attr('r', 0)
                    .attr('cx', (d) => this.x(d.Diversity))
                    .attr('cy', (d) => this.y(d.Expenditure))
                    .on(
                        'mouseover',
                        (e, d) =>
                            (document.getElementById('details').innerHTML =
                                d.CountyName +
                                ' has a diversity index of ' +
                                d.Diversity +
                                ' and overall expenditure is $' +
                                (1000*d.Expenditure).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                                ' per student.')
                    )
                    .on(
                        'mouseout',
                        (e, d) =>
                            (document.getElementById('details').innerHTML = '&nbsp;')
                    )
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
        console.log(countynum)

        console.log(this.combined_array[countynum])

        let matching_data = this.combined_array.filter(d => d.CountyName === this.combined_array[countynum].CountyName);

        console.log(matching_data)

        this.svg.selectAll("circle").data(matching_data, d => d.CountyName).join(
            enter => enter,
            update => update.style("fill", "red").raise(),
            exit => exit.style("fill", "black")
        )
    }

    // Update the correlation score based on the selected subset.
    /* updateCorrelation(data_subset, _region) {
      d3.selectAll('#line').remove();
      const data = data_subset.sort(
              (a, b) => a.diversity_index - b.diversity_index
      );

      let linearRegression = ss.linearRegression(
              data.map((d) => [d.diversity_index, d.public_school_expenditure])
      );
      console.log(linearRegression);
      const linearRegressionLine =
              ss.linearRegressionLine(linearRegression);
      const firstX = data[0].diversity_index;
      const lastX = data.slice(-1)[0].diversity_index;
      const xCoordinates = [firstX, lastX];

      const regressionPoints = xCoordinates.map((d) => ({
        x: d,
        y: linearRegressionLine(d),
      }));
      let line = d3.line()
              .x((d) => {
                console.log(d);
                return this.x(d.x);
              })
              .y((d) => this.y(d.y));
      this.svg
              .append('path')
              .classed('regressionLine', true)
              .attr('id', 'line')
              .datum(regressionPoints)
              .attr('d', line);
      document.getElementById(
              'details'
      ).innerHTML = `In ${_region}, life expectancy and poverty rate have a corelation score of
          ${linearRegression.m.toFixed(2)}`;
    }
     */
}