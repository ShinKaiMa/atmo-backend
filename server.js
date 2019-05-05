var express = require('express');
var app = express();


app.post('/api/test', function (req, res) {
    res.json({ content: "status ok" })
})

app.listen(5000, () => console.log('server running at port 5000'))