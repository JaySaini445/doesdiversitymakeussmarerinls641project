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

        this.nc_county_map_data = nc_county_map_data


        // Define a projection with rotation to make NC "horizontal" (by default, the Albers projection is centered
        // in the middle of the US, which means NC will "tilt" a bit due to its location on the eastern coast).
        let projection = d3.geoAlbers()
            .rotate([79, 0])
            .fitSize([650,450], nc_county_map_data);

        // Define the path generator using the projection.
        let path = d3.geoPath().projection(projection);

        // Select the SVG element for the map.
        let svg = d3.select("#nc_map").append('g');

        this.svg = svg

        // Define a color scale for the map.
        let colormap = d3.scaleOrdinal(d3.schemeCategory10);

        this.colormap = colormap

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

            .on("mouseover", function(d) {
                d3.select(this)
                    .attr("fill" , "lightskyblue")
            })

            .on("mouseout", function(d) {
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr("fill", d=>{
                        let county = nc_county_pop_data[d.properties.NAME + " County"];
                        let zone = county.prosperityZone;
                        return colormap(zone);
                    })})

            .on("click", function (event,d) {
                let countyindex = map.nc_county_map_data.features.map(d => d.properties.NAME).indexOf(d.properties.NAME);

                let countynameabbr = map.nc_county_map_data.features[countyindex].properties.NAME + ' County'

                function selectWhere(data, propertyName) {
                    for (let i = 0; i < 100; i++) {
                        if (data[i].CountyName == propertyName)
                            return i;
                    }
                    return null;
                }

                let matchingmapindex = selectWhere(scatter1.combined_array, countynameabbr);

                map.clickMark(matchingmapindex)
                map.dispatch.call("selectCounty", NC_Map, parseInt(nc_county_pop_data[d.properties.NAME + " County"].stateIndex));
            })

            .call(selection => tippy(selection.nodes(), {allowHTML: true}));
    }
    clickMark(countynum) {

        let countynameabbrev = scatter1.combined_array[countynum].CountyName.replace(' County','');

        function selectWhere(data, propertyName) {
            for (let i = 0; i < 100; i++) {
                if (data[i].properties.NAME == propertyName)
                    return i;
            }
            return null;
        }

        let matchingmapindex = selectWhere(this.nc_county_map_data.features, countynameabbrev);

        if (matchingmapindex == null) {
            let matching_data = this.nc_county_map_data.features

            this.svg.attr("class", "county").selectAll("path").data(matching_data, d => d.properties.NAME).join(
                enter => enter,
                update => update.style("fill", "yellow").raise(),
                exit => exit.style("fill", null)
            )
        } else {
            let matching_data = this.nc_county_map_data.features[matchingmapindex]

            this.svg.attr("class", "county").selectAll("path").data([matching_data], d => d.properties.NAME).join(
                enter => enter,
                update => update.style("fill", "yellow").raise(),
                exit => exit.style("fill", null)
            )
        }
    }
}

// Renders a map within the DOM element specified by svg_id.