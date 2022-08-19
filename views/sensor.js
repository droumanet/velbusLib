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
    let d=0
    let dnow= new Date()
    let horaire = ""
    moduleList.forEach((v, k) => {
      console.log(v.id, v.fct, v.status.power)
      hx = v.address.toString(16).padStart(2,'0').toUpperCase()
      d = new Date(v.status.timestamp)
      horaire = d.toLocaleString()
      if ((dnow-d)/1000 > 1*70) { classTime="smallRed" } else {classTime="small"}
      
        if (v.fct.toLowerCase()=="energy") {
          if (v.address < 300) {
            vMain = v.status.power+" w"
            vSecond=v.status.index+" wh"
          } else {
            vMain = v.status.power+" w"
            if (v.part == 1) vSecond=v.status.indexHP+" Kwh"+"<br>"+v.status.indexHC+" Kwh"
            if (v.part == 2) vSecond=v.status.indexProd+" Kwh"+"<br>"+v.status.indexConso+" Kwh"
          }
          symbol = "☢️"
        } else if (v.fct.toLowerCase()=="temp") {
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
            <p class="${classTime}">${horaire}</p>
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