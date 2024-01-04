// Declare data variable
let data;

// Fetch data from the provided URL
d3.json("https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json")
  .then(responseData => {
    // Assign responseData to the data variable
    data = responseData;

    // Handle the data here
    console.log(data);

    // Extracting "id" values from the data
    const ids = data.names;

    // Adding options to the dropdown
    d3.select("#testSubject")
      .selectAll("option")
      .data(ids)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);

    // Display metadata key-value pairs
    function displayMetadata(selectedId) {
        const metadata = data.metadata.find(item => item.id.toString() === selectedId);

        // Clear previous content
        d3.select("#metadataBox").selectAll("ul").remove();

        // Create a list for key-value pairs
        const list = d3.select("#metadataBox").append("ul");

        // Add key-value pairs to the list
        Object.entries(metadata).forEach(([key, value]) => {
            list.append("li").text(`${key}: ${value}`);
        });
    }

    // Event listener for dropdown change
    d3.select("#testSubject")
      .on("change", function() {
        const selectedId = this.value;
        displayMetadata(selectedId);

        // Call functions to update charts with new data
        updateBarChart(selectedId);
        updateGaugeChart(selectedId);
        updateBubbleChart(selectedId);
      });

    // Display metadata for the initial selection
    const initialId = ids[0];
    displayMetadata(initialId);

    // Initial call to create charts
    updateBarChart(initialId);
    updateGaugeChart(initialId);
    updateBubbleChart(initialId);
  })
  .catch(error => console.error("Error fetching data:", error));

// Function to update the bar chart using Plotly
function updateBarChart(selectedId) {
    // Access the selected data based on the ID
    const sampleData = data.samples.find(sample => sample.id === selectedId);

    // Sort data in ascending order based on sample_values
    const sortedData = sampleData.sample_values
        .map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value);

    // Extract the top 10 OTUs from the sorted data
    const top10OTUs = sortedData.slice(-10).map(item => item.value);
    const top10OTUIndices = sortedData.slice(-10).map(item => item.index);
    const top10OTUIds = top10OTUIndices.map(index => `OTU ${sampleData.otu_ids[index]}`);
    const top10OTULabels = top10OTUIndices.map(index => sampleData.otu_labels[index]);

    // Create a horizontal bar chart using Plotly
    const trace = {
        x: top10OTUs,
        y: top10OTUIds,
        text: top10OTULabels,
        type: 'bar',
        orientation: 'h',
    };

    const layout = {
        xaxis: { title: 'Sample Values/Counts' },
        yaxis: { title: 'OTU ID' },
    };

    Plotly.newPlot('barSvg', [trace], layout);
}

// Function to update the gauge chart using Plotly
function updateGaugeChart(selectedId) {
    // Access the selected data based on the ID
    const metadata = data.metadata.find(item => item.id.toString() === selectedId);

    // Extract the washing frequency from the metadata
    const washingFrequency = metadata.wfreq;

    // Create a gauge chart using Plotly
    const trace = {
        type: 'indicator',
        mode: 'gauge+number',
        value: washingFrequency,
        gauge: {
            axis: { range: [0, 9] },
            steps: [
                { range: [0, 1], color: 'rgba(255, 255, 255, 0)' },
                { range: [1, 2], color: 'rgba(232, 226, 202, .5)' },
                { range: [2, 3], color: 'rgba(210, 206, 145, .5)' },
                { range: [3, 4], color: 'rgba(202, 209, 95, .5)' },
                { range: [4, 5], color: 'rgba(170, 202, 42, .5)' },
                { range: [5, 6], color: 'rgba(110, 154, 22, .5)' },
                { range: [6, 7], color: 'rgba(14, 127, 0, .5)' },
                { range: [7, 8], color: 'rgba(10, 117, 0, .5)' },
                { range: [8, 9], color: 'rgba(0, 102, 0, .5)' },
            ],
        },
    };

    const layout = { width: 400, height: 300, margin: { t: 0, b: 0 } };

    Plotly.newPlot('gaugeSvg', [trace], layout);
}

// Function to update the bubble chart using Plotly
function updateBubbleChart(selectedId) {
    // Access the selected data based on the ID
    const sampleData = data.samples.find(sample => sample.id === selectedId);

    // Create a bubble chart using Plotly
    const trace = {
        x: sampleData.otu_ids,
        y: sampleData.sample_values,
        mode: 'markers',
        marker: {
            size: sampleData.sample_values,
            color: sampleData.otu_ids,
            colorscale: 'Viridis',
        },
        text: sampleData.otu_labels,
    };

    const layout = {
        xaxis: { title: 'OTU ID' },
        yaxis: { title: 'Sample Value/Count' },
    };

    Plotly.newPlot('bubbleSvg', [trace], layout);
}