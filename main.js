const initialHues = [30,270]

const huePickerGen = (w, h) => (v) => {

  const context = d3.create("canvas").attr("width", w).attr("height", h).node().getContext("2d")
  const hue = d3.scaleLinear().domain([5,w-5]).range([0,360]).clamp(true)

  function render (value) {
    context.clearRect(0, 0, w, h)
    context.canvas.value = value

    d3.range(0,w)
    .forEach(col => {
      context.fillStyle = d3.hcl(hue(col), 50, 70)
      context.fillRect(col, h*.5 - h*.125, 1, h*.25)
    })

    context.fillStyle = d3.hcl(value, 50, 70)
    context.fillRect(hue.invert(value)-5, 0, 10, h)
    context.beginPath()
  }
  render(v)

  d3.select(context.canvas)
  .call(d3.drag()
    .on("start drag end", d => {
      render(hue(d3.event.x))
      context.canvas.dispatchEvent(new CustomEvent('input'))
    })
   )

  return context.canvas
}

const hueToColor = h => chroma.hcl(h,100,50).hex(),
      colorScale = ([hue1, hue2, steps]) => chroma.bezier(["white",hueToColor(hue1),hueToColor(hue2),"black"])
                                                  .scale()
                                                  .correctLightness()
                                                  .colors(steps+2)
                                                  .filter((_,i) => i > 0 && i < steps+1) // the first and last colors are just white and black




const huePicker = huePickerGen(320, 20)

const inputs = d3.select("div#sliders").selectAll("div.inputs")
  .data(initialHues)
  .enter().append("div").classed("inputs", true)
inputs
  .append("p").html((_,i) => i ? "End hue " : "Start hue ").classed("pickerLabel", true)
inputs
  .each(function(d) {
    this.appendChild(huePicker(d))
  })

const update = () => {

  const inputs = d3.selectAll(".inputs").select("canvas").nodes() // get all the sliders
                .reduce((acc, inc) => acc.concat(inc.value), []) // flatten them into an array of their values
                .concat(+d3.select("form input").property("value")) // add the number input value to that array, too

  const svg = d3.select("#output svg")
  const width = svg.node().parentNode.getBoundingClientRect().width
  svg.attr("width", width)

  const colors = colorScale(inputs)
  const x = d3.scaleBand().domain(colors).range([0,width])

  const update = svg.selectAll("rect")
    .data(colors)
  update
    .enter().append("rect")
      .attr("y", 0)
      .attr("height", 50)
      .style("shape-rendering", "crispEdges")
        .merge(update)
        .attr("x", d => x(d))
        .attr("width", x.bandwidth())
        .style("fill", d => d)
  update.exit().remove()
}

d3.selectAll(".inputs").select("canvas").on("input", () => update())
d3.selectAll("input[type=number]").on("input", () => update())
window.addEventListener("resize", update)

update()
