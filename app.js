var twilio = require('twilio');
var app = require('express')();
var _ = require('lodash');
var bodyParser = require('body-parser');

var client = new twilio.RestClient(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
var jokes = ['toc toc'];

app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/handle', (req, res) => {
    var phone = req.body.From;
    var msg = req.body.Body || '';
    if (msg.toLowerCase() === 'lol') {
        //subscribe(phone);
        //sendJoke(phone);
        res.type('text/html');
        res.render('twiml', {
            message: _.sample(jokes),
        });
    } else {
        res.end();
    }

}).listen(process.env.PORT || 3000, () => {
    console.log('listening on 3000');
})

var sendJoke = (phone) => {
    client.sms.messages.create({
        to: phone,
        from: '+16467626126',
        body: _.sample(jokes),
    });
}



