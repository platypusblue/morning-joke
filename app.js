var twilio = require('twilio');
var app = require('express')();
var _ = require('lodash');
var bodyParser = require('body-parser');
var rtg   = require("url").parse(process.env.REDIS_URL);
var redis = require('redis').createClient(rtg.port, rtg.hostname);
var schedule = require('node-schedule');
var jokes = require('./jokes')
redis.auth(rtg.auth.split(":")[1]);

var client = new twilio.RestClient(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express').static('./public'));

schedule.scheduleJob({hour: 9, minute: 00, dayOfWeek: [0, 1, 2, 3, 4, 5, 6]}, () => {
    console.log('running job');
    client.smembers('numbers', (err, phones) => {
        if (err) {
            return;
        }
        phones.map(sendJoke);
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/handle', (req, res, next) => {
    var phone = req.body.From;
    var msg = req.body.Body || '';
    if (msg.toLowerCase() === 'lol') {
        redis.sadd(['numbers', phone], (err, reply) => {
            if (err) {
                console.log('something wrong', err);
                return next(err);
            }
            console.log('phone ', phone, 'pushed to redis');
            res.type('text/html');
            res.render('twiml', {
                message: '\n' + _.sample(jokes),
            });
        });
    } else {
        res.end();
    }

}).listen(process.env.PORT || 3000, () => {
    console.log('listening on 3000');
})

var sendJoke = (phone) => {
    return client.sms.messages.create({
        to: phone,
        from: '+16467626126',
        body: _.sample(jokes),
    }, (err) => {
        if (err) {
            console.log('error sending message', err);
            return;
        }
        console.log('joke sent to', phone);
    });
}



