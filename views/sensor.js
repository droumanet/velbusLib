socket.on('resume', (data) => {
    console.log("Affichage ",moduleList.size,"modules")
    let BaliseSonde = document.getElementById('ListeSonde')
    let HTML = 
    `<div class="ui cards">
    `
    let vMain = ""
    let vSecond = ""
    let symbol = ""
    let d=0
    let dnow= new Date()
    let horaire = ""

    // Drawing a card for each module (energy or temp)
    moduleList.forEach((v, k) => {
      hx = v.address.toString(16).padStart(2,'0').toUpperCase()
      d = new Date(v.status.timestamp)
      horaire = d.toLocaleString()

      // change CSS class id date is two minutes old more
      if ((dnow-d)/1000 > 1*120) { classTime="smallRed" } else {classTime="small"}
      
      if (v.fct.toLowerCase()=="energy") {
        if (v.address < 300) {
          vMain = v.status.power+" w"
          vSecond=v.status.index+" wh"
        } else {
          vMain = v.status.power+" w"
          if (v.part == 1) vSecond=v.status.indexHP/1000+" Kwh"+"<br>"+v.status.indexHC/1000+" Kwh"
          if (v.part == 2) vSecond=v.status.indexProd/1000+" Kwh"+"<br>"+v.status.indexConso/1000+" Kwh"
        }
        symbol = "☢️"
      } else if (v.fct.toLowerCase()=="temp") {
        vMain = v.status.current+"°C"
        vSecond='min:'+v.status.min+" / max:"+v.status.max
        symbol = "🌡️"
      }

      // Create HTML code with dynamic informations
      HTML += 
      ` <div class="card w-300 d-inline-block">
          <a class="content-title hyperlink" href="/sensor/${v.id}">
            <div class="content-title">
              <h4>${symbol} ${v.name}</h4>
            </div>
          </a>
          <div class="content">
            <h2>${vMain}</h2>
            <p>${vSecond}</p>
            <p>$${hx} (${v.id})</p>
            <p class="${classTime}">${horaire}</p>
          </div>
        </div>
      `
      console.log("Key", k, "Val", v, "address", v.address)
    })
    HTML += `</div>`
    console.log(HTML)
    BaliseSonde.innerHTML = HTML
})