const genChart = config => {
  const options = {
    data: null,
    container: null,
    scale: null,
    zoomable: false,
    brushCallback: null,
    themeColor: "#ff4553"
  };

  const min = d3.min(config.data, d => d.value);
  const max = d3.max(config.data, d => d.value);
  options.scale = [min, max];

  for (let option in config) {
    options[option] = config[option];
  }
  const {
    data,
    container,
    scale,
    zoomable,
    brushCallback,
    themeColor
  } = options;

  $(container).html("");
  let yAxis = g =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g =>
        g
          .append("text")
          .attr("x", -margin.left)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(data.y)
      );

  let xAxis = g =>
    g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(x)
        .tickFormat(i => data[i].name)
        .tickSizeOuter(0)
    );

  let y = d3
    .scaleLinear()
    .domain(scale)
    .range([height - margin.bottom, margin.top]);

  let x = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  const rects = svg
    .append("g")
    .attr("fill", "#555")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d, i) => x(i))
    .attr("y", d => y(d.value))
    .attr("height", d => {
      let h = y(scale[0]) - y(d.value);
      return h > 0 ? h : 0;
    })
    .attr("width", x.bandwidth());

  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);

  if (!zoomable) {
    svg
      .append("rect")
      .attr("class", "blend-mode-mask")
      .attr("width", width)
      .attr("height", height)
      .style("mix-blend-mode", "lighten");
  }

  if (zoomable) {
    const brush = d3.brush().on("start brush end", brushed);
    svg.call(brush);
    function brushed() {
      const selection = d3.event.selection;
      if (selection) {
        brushCallback(selection, x, y);
      }
      d3.select(".selection")
        .attr("fill-opacity", 1)
        .attr("stroke-width", "10")
        .style("mix-blend-mode", "lighten")
        .attr("stroke", "rgba(255,255,255,1)");
    }
  }

  $(container).append(svg.node());
};
