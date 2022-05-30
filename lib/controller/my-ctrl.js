const path = require('path')
function welcome(req, res) {
    
    res.sendFile(path.join(__dirname, '../view/index.html'));
}
exports.welcome = welcome;
