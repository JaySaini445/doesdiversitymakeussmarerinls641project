// Loading the map data and the state statistics, then render when done.

class NC_Map {

    constructor() {
        this.dispatch = d3.dispatch("selectCounty");
    }

    render(data) {
        // CSV data with stats per county. We process the data to make it easier to look up by county name.
        let nc_county_pop_data = data[0].reduce((indexed_data, d) => {
            // Convert the numerical values from strings to numbers.
            d.pop2022 = +d.pop2022;
            d.GrowthRate = +d.GrowthRate;
            d.popDensity = +d.popDensity;
            d.prosperityZone = d.prosperityZone

            // Store the county data as the value associated with the county's name
            indexed_data[d.CTYNAME] = d;

            // While we iterate, find the max population to use in our color scale.
            if (indexed_data.maxpop < d.pop2022) {
                indexed_data.maxpop = d.pop2022;
            }
            return indexed_data;
        }, {maxpop: 0});

        // TopoJson data, which we convert to GeoJson format for use with D3.
        let nc_county_map_data = topojson.feature(data[1], data[1].objects.cb_2015_north_carolina_county_20m);



        // Define a projection with rotation to make NC "horizontal" (by default, the Albers projection is centered
        // in the middle of the US, which means NC will "tilt" a bit due to its location on the eastern coast).
        let projection = d3.geoAlbers()
            .rotate([79, 0])
            .fitSize([600,400], nc_county_map_data);

        // Define the path generator using the projection.
        let path = d3.geoPath().projection(projection);

        // Select the SVG element for the map.
        let svg = d3.select("#nc_map").append('g');

        // Define a color scale for the map.
        let colormap = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw the county map.
        svg.append("g")
            .attr("class", "county")
            .selectAll("path")
            .data(nc_county_map_data.features, d=>d.properties.NAME)
            .enter().append("path")
            .attr("fill", d=>{
                let county = nc_county_pop_data[d.properties.NAME + " County"];
                let zone = county.prosperityZone;
                return colormap(zone);
            })
            .attr("stroke", "black")
            .attr("d", path)
            // All tiptool and transition code is taken from Hands On 3 code and tweaked
            .attr("data-tippy-content", d => {
                let county = nc_county_pop_data[d.properties.NAME + " County"];
                let pop = county.pop2022;
                let growth_rate = county.GrowthRate
                let pop_density = county.popDensity
                let zone = county.prosperityZone
                let html = "<table>";
                html += "<tr><td>" + "Zone: " + zone + "<br>" + "Population: " + pop.toLocaleString() + "<br>" +
                    "Growth Rate: " + growth_rate.toFixed(2) + "%" + "<br>" + "Population Density: "
                    + pop_density.toFixed(2) + "/mi<sup>2</sup>" + "</td>" +
                    "</td>" + d.properties.NAME + " County" + "</td></tr>"
                return html;
            })

            .on("click", (event,d) => {
                this.dispatch.call("selectCounty", this, parseInt(nc_county_pop_data[d.properties.NAME + " County"].stateIndex))
            })

            .call(selection => tippy(selection.nodes(), {allowHTML: true}));
    }
}

// Renders a map within the DOM element specified by svg_id.
