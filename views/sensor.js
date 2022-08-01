socket.on('resume', (data) => {
    console.log("Affichage ",moduleList.size,"modules")
    let BaliseSonde = document.getElementById('ListeSonde')
    let HTML = 
    `<div class="ms-card ms-inline">
      <div class="row">
    `
    let vMain = ""
    let vSecond = ""
    let symbol = ""
    moduleList.forEach((v, k) => {
      console.log(v.id, v.fct, v.status.power)
      hx = v.address.toString(16).padStart(2,'0').toUpperCase()
      if (v.fct=="energy") {
        vMain = v.status.power+" w"
        vSecond=v.status.index+" wh"
        symbol = "☢️"
      } else if (v.fct=="temp") {
        vMain = v.status.current+"°C"
        vSecond='min:'+v.status.min+" / max:"+v.status.max
        symbol = "🌡️"
      }
      HTML += 
      ` <div class="col-sm-3">
        <a href="/sensor/${v.id}" class="nolink">
        <div class="ms-card ms-border">
          <div class="ms-card-title">
            <h6>${symbol} ${v.name}</h6>
          </div>
          <div class="ms-content">
            <h2>${vMain}</h2>
            <p>${vSecond}</p>
            <p>$${hx} (${v.id})</p>
          </div>
        </div>
        </a>
        </div>
      `
      console.log("Key", k, "Val", v, "address", v.address)
    })
    HTML += `</div></div>`
    console.log(HTML)
    BaliseSonde.innerHTML = HTML
})