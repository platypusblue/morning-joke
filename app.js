var twilio = require('twilio');
var app = require('express')();
var _ = require('lodash');
var bodyParser = require('body-parser');
var rtg   = require("url").parse(process.env.REDISTOGO_URL);
var redis = require('redis').createClient(rtg.port, rtg.hostname);
redis.auth(rtg.auth.split(":")[1]);

var client = new twilio.RestClient(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
var jokes = ['toc toc'];

app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/handle', (req, res) => {
    var phone = req.body.From;
    var msg = req.body.Body || '';
    if (msg.toLowerCase() === 'lol') {
        redis.rpush(['phones', phone], (err, reply) => {
            if (err) {
                console.err('something wrong', err);
                return next(err);
            }
            console.log('phone ', phone, 'pushed to redis');
            res.type('text/html');
            res.render('twiml', {
                message: _.sample(jokes),
            });
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



