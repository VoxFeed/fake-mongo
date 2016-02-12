var winston = require('winston');

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      name: 'info-file',
      filename: 'filelog-info.log',
      json: false,
      level: 'info'
    }),
    new winston.transports.File({
      name: 'error-file',
      filename: 'filelog-error.log',
      json: false,
      level: 'error'
    }),
    new winston.transports.File({
      name: 'debug-file',
      filename: 'filelog-debug.log',
      json: false,
      level: 'debug'
    }),
    new winston.transports.Console({
      name: 'info-console',
      level: 'info'
    }),
    new winston.transports.Console({
      name: 'error-console',
      level: 'error'
    }),
    new winston.transports.Console({
      name: 'debug-console',
      level: 'debug'
    })
  ]
});

module.exports = logger;
