/*----------------------------------------------------------------------------
  First start on installation
  ----------------------------------------------------------------------------
*/

const CtrlInstallation = {
    installation : (req, res) => {
        console.log("*** going to installation.ejs ***")
        res.render('installation.ejs')
    }
}

module.exports = CtrlInstallation