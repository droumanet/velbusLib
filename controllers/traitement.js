const enHexa = (donnees) => {
    let c='';
    let dhex=[];
    for (let i=0; i < donnees.length; i++) {
        
        c = donnees[i].toString(16);
        if (c.length < 2) c='0'+c;
        dhex.push(c);
    }
    return dhex.toString()+' ('+donnees.length+')';
}

module.exports = {
    enHexa
}