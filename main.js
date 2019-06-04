const initialHues = [30,270]

const huePickerGen = (w, h) => (v) => {

  const context = d3.create("canvas").attr("width", w).attr("height", h).node().getContext("2d")
  const hue = d3.scaleLinear().domain([5,w-5]).range([0,360]).clamp(true)

  context.canvas.value = v

  function render (value) {
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
      context.clearRect(0, 0, w, h)
      render(hue(d3.event.x))
      context.canvas.value = hue(d3.event.x)
      context.canvas.dispatchEvent(new CustomEvent('input'))
    })
   )

  return context.canvas
}

// const hueToColor = h => chroma.hcl(h,100,50).hex()
//
// const colors = ([hue1, hue2]) = chroma.bezier(["white",hueToColor(hue1),hueToColor(hue2),"black"])
// .scale()
// .correctLightness()
// .colors(steps+2)
// .filter((_,i) => i > 0 && i < steps+1) // the first and last colors are just white and black



const huePicker = huePickerGen(400, 20)

const inputs = d3.select("section#input").selectAll("div.inputs")
  .data(initialHues)
  .enter().append("div").classed("inputs", true)
  inputs
    .append("p").html((_,i) => i ? "end hue " : "start hue ").classed("pickerLabel", true)
  inputs
    .each(function(d) {
      this.appendChild(huePicker(d))
    })

d3.selectAll(".inputs").select("canvas").on("input", () => update(d3.selectAll(".inputs").select("canvas").nodes().reduce((acc, inc) => acc.concat(inc.value), [])))


const update = ([start, end]) => {
  // d3.select("#output")
  //   .
  console.log(start, end)
}
update(initialHues)
