# Crane

[![Build](https://travis-ci.org/jaredhanson/crane.png)](https://travis-ci.org/jaredhanson/crane)
[![Coverage](https://coveralls.io/repos/jaredhanson/crane/badge.png)](https://coveralls.io/r/jaredhanson/crane)
[![Quality](https://codeclimate.com/github/jaredhanson/crane.png)](https://codeclimate.com/github/jaredhanson/crane)
[![Dependencies](https://david-dm.org/jaredhanson/crane.png)](https://david-dm.org/jaredhanson/crane)
[![Tips](http://img.shields.io/gittip/jaredhanson.png)](https://www.gittip.com/jaredhanson/)


Crane is a [message queue](http://en.wikipedia.org/wiki/Message_queue)
middleware layer for [Node](http://nodejs.org).  Applications can be constructed
by using _middleware_ and defining _routes_.

This architecture has been proven effective by [Express](http://expressjs.com/),
which provides HTTP middleware.  Crane adopts this approach, repurposing it
for use with message queues, allowing workers to be built quickly and easily,
using patterns familiar to Node.js developers.

## Install

    $ npm install crane
    
## Usage

    var crane = require('crane');
    var app = crane();
    
    app.work('tasks/email', function(msg, next) {
      console.log('sending email to: ' + msg.body.to);
      msg.ack();
    });

## Adapters

Adapters are used to connect to message queues, receiving messages and
dispatching those messages to the application for processing.

The following table lists commonly used strategies:

|Adapter                                           |Developer                                       |
|--------------------------------------------------|------------------------------------------------|
|[AMQP](https://github.com/jaredhanson/crane-amqp) |[Jared Hanson](https://github.com/jaredhanson)  |

## Tests

    $ npm install
    $ make test

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2014 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
