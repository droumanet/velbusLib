/*----------------------------------------------------------------------------
  Analyzer
  ----------------------------------------------------------------------------
*/

const CtrlAnalyze = {
    view : (req, res) => {
        console.log("*** going to installation.ejs ***")
        res.render('analyze.ejs')
    }
}

module.exports = CtrlAnalyze