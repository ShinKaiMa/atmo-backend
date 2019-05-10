const log4js = require('log4js');

log4js.configure({
    appenders: {
        consoleAppenders: {
            type: 'console', layout: {
                type: 'pattern',
                pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c -%] %m',
            }
        },
        fileAppenders: {
            type: 'datefile', filename: './logs/atmo-service.log', pattern: '.yyyy-MM-dd-hh', compress: true, layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c - %m',
            }
        }
    },
    categories: {
        default: { appenders: ['consoleAppenders', 'fileAppenders'], level: 'debug' }
    }
});
const logger = log4js.getLogger('ATMO');

module.exports = logger;