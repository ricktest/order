let fs = require('fs');
const request = require('request');
const EventEmitter = require('events');
const {cloneDeep, merge} = require('lodash');
const util = require("util");

const pArgsSymbol = Symbol('hdllogger');

const defaultConfig = {

    consoleDebug: true,  //允許global_log顯示並紀錄log
    consoleDebug_level: 150,  //允許紀錄的level
    rotate_time_secs: 3600, //滾表時間
    write_sql: true,  //寫入預設sql
    //使用外部nlog server
    nlog_server: {
        server: '',
    },
};

function getFileTimeFlag(){
    let dd = new Date();
    let str = dd.getFullYear().toString() + "_" +
        dd.getMonth().toString() + "_" +
        dd.getMinutes().toString() + "_" +
        dd.getHours().toString() + "_" +
        dd.getMinutes().toString() + "_" +
        dd.getSeconds().toString();
    return str;
}

function nlogAddMsg(msg, level = 100){
    this[pArgsSymbol].nlog_msg_buffer.push({msg:msg,level:level});
}

function nlogSend() {
    const instance = this;
    if(this[pArgsSymbol].nlog_sending === false){
        this.log('prepare nlog', 100, 'nlog', true);
        this[pArgsSymbol].nlog_sending = true;
        if(this[pArgsSymbol].nlog_msg_buffer.length > 0){
            //cut log
            let cut_array = this[pArgsSymbol].nlog_msg_buffer.splice(0, this[pArgsSymbol].nlog_msg_buffer.length);
            let len = cut_array.length;
            this.log(`cut nlog len=${len}`, 100, 'nlog', true);
            this.log('writing nlog', 100, 'nlog', true);

            const url = 'http://' + this[pArgsSymbol].nlog_server.server + ':'+ this[pArgsSymbol].nlog_server.port + '/addLog';
            const method = 'POST';
            const options = {
                url,
                method,
                'timeout' : 30000, //30sec
                'headers': [{
                    'User-Agent': 'node_showdo'
                }]
            };
            options['form'] = [];
            options['form']['apiKey'] = this[pArgsSymbol].nlog_server.apiKey;
            options['form']['server_name'] = this[pArgsSymbol].nlog_server.serverInfo.server_name;
            options['form']['ip'] = this[pArgsSymbol].nlog_server.serverInfo.ip;
            options['form']['source'] = this[pArgsSymbol].nlog_server.serverInfo.source;
            options['form']['cn'] = this[pArgsSymbol].nlog_server.serverInfo.cn;
            options['form']['pid'] = this[pArgsSymbol].nlog_pid;
            options['form']['data'] = JSON.stringify(cut_array);

            function callback(error, response, body) {
                if (!error && response.statusCode === 200) {
                    let this_msg = 'nlog Result->' + this.method + ' : ' + this.href + ' ' + response.statusCode;
                    instance.log(this_msg, 100, 'nlog', true);
                    if(instance[pArgsSymbol].db_callback !== null){
                        instance[pArgsSymbol].db_callback(this, this_msg, 100, 'nlog');
                    }
                }else{
                    let this_msg = 'nlog Result->' + this.method + ' : ' + this.href + ', erro=' + error;
                    instance.log(this_msg, 100, 'nlog', true);
                    if(instance[pArgsSymbol].db_callback !== null){
                        instance[pArgsSymbol].db_callback(this, this_msg, 100, 'nlog');
                    }
                }
                instance[pArgsSymbol].nlog_sending = false;
                if (instance[pArgsSymbol].isStopInterval && instance[pArgsSymbol].nlog_msg_buffer.length === 0) {
                    clearInterval(instance[pArgsSymbol].nlogSendIntervalId);
                    instance[pArgsSymbol].nlogSendIntervalId = undefined;
                    instance[pArgsSymbol].checkExit();
                }
            }

            request(options, callback);

        }else{
            instance.log('prepare nlog clean', 100, 'nlog', true);
            instance[pArgsSymbol].nlog_sending = false;
            if (instance[pArgsSymbol].isStopInterval) {
                clearInterval(instance[pArgsSymbol].nlogSendIntervalId);
                instance[pArgsSymbol].nlogSendIntervalId = undefined;
                instance[pArgsSymbol].checkExit();
            }
        }
    }
}

function logRotate() {
    if (!this[pArgsSymbol].log_rotating) {
        this[pArgsSymbol].log_rotating = true;
        if(this.stdout_file !== "" && typeof this.stdout_file !== 'undefined'){
            //overwrite log
            let t_fs_stdout = fs.createWriteStream(this.stdout_file + '_' + getFileTimeFlag() + '.log');
            process.stdout.write = t_fs_stdout.write.bind(t_fs_stdout);
            this.log('create log stdout_file : ' + this.stdout_file);
            if(this[pArgsSymbol].fs_stdout != null){
                this[pArgsSymbol].fs_stdout.close();
                this.log('close log stdout_file : ' + this[pArgsSymbol].fs_stdout.path);
            }
            this[pArgsSymbol].fs_stdout = t_fs_stdout;
        }
        if(this.stderr_file !== "" && typeof this.stderr_file !== 'undefined'){
            //overwrite log
            let dd = new Date();
            let t_fs_stderr = fs.createWriteStream(this.stderr_file + '_' + getFileTimeFlag() + '.log');
            process.stderr.write = t_fs_stderr.write.bind(t_fs_stderr);
            this.log('create log stderr_file : ' + this.stderr_file);
            if(this[pArgsSymbol].fs_stderr != null){
                this[pArgsSymbol].fs_stderr.close();
                this.log('close log stderr_file : ' + this[pArgsSymbol].fs_stderr.path);
            }
            this[pArgsSymbol].fs_stderr = t_fs_stderr;
        }
        this[pArgsSymbol].log_rotating = false;
        if (this[pArgsSymbol].isStopInterval && this[pArgsSymbol].logRotateIntervalId) {
            clearInterval(this[pArgsSymbol].logRotateIntervalId);
            this[pArgsSymbol].logRotateIntervalId = undefined;
            this[pArgsSymbol].checkExit();
        }
    }
}

function checkExit() {
    if (this[pArgsSymbol].isStopInterval && !this[pArgsSymbol].logRotateIntervalId && !this[pArgsSymbol].nlogSendIntervalId) {
        this.emit('exit');
    }
}

const config = {
    consoleDebug: true,
    consoleDebug_level: 150
}

const orig_console_log = console.log.bind(console);

class HdlLogger extends EventEmitter{

    consoleDebug = true;
    consoleDebug_level = 150;

    constructor(config = {}) {
        super();
        let _config = cloneDeep(defaultConfig);
        merge(_config, config);
        this.consoleDebug = _config.consoleDebug;
        this.consoleDebug_level = _config.consoleDebug_level;

        this[pArgsSymbol] = {
            nlog_pid: Math.floor(Math.random() * Math.floor(99999999)),
            isStopInterval: false,

            logInit: false,
            stdout_file: '',
            stderr_file: '',
            log_rotating: false,
            log_rotate: logRotate.bind(this),
            fs_stdout: null,
            fs_stderr: null,
            logRotateIntervalId: undefined,
            rotate_time_secs: undefined,


            nlogInit: false,
            nlog_msg_buffer: [],
            nlog_server: false,
            nlog_sending: false,
            nlogSendIntervalId: undefined,
            nlogAddMsg: nlogAddMsg.bind(this),
            nlogSend: nlogSend.bind(this),

            db_log: null,
            db_callback: null,

            checkExit: checkExit.bind(this),
        };
    }

    get nlog_pid() {
        return this[pArgsSymbol].nlog_pid;
    }

    get stdout_file() {
        return this[pArgsSymbol].stdout_file;
    }

    get stderr_file() {
        return this[pArgsSymbol].stderr_file;
    }

    get nlog_sending() {
        return this[pArgsSymbol].nlog_sending;
    }

    set db_callback(db_callback) {
        this[pArgsSymbol].db_callback = db_callback;
    }

    get db_callback() {
        return this[pArgsSymbol].db_callback;
    }

    start(config) {
        let _config = cloneDeep(defaultConfig);
        merge(_config, config);

        if (!this[pArgsSymbol].logInit) {
            this[pArgsSymbol].logInit = true;
            this[pArgsSymbol].stdout_file = _config.stdout_file;
            this[pArgsSymbol].stderr_file = _config.stderr_file;
            this[pArgsSymbol].rotate_time_secs = _config.rotate_time_secs;

            const needOutputFile = (this[pArgsSymbol].stdout_file !== '' && this[pArgsSymbol].stdout_file !== undefined) || (this[pArgsSymbol].stderr_file !== '' && this[pArgsSymbol].stderr_file !== undefined);

            if (needOutputFile) {
                this[pArgsSymbol].log_rotate();
                if(typeof this[pArgsSymbol].rotate_time_secs !== 'undefined'){
                    this.log('set auto rotate');
                    this[pArgsSymbol].logRotateIntervalId = setInterval(() => {
                        this.log('log rotating : ');
                        this[pArgsSymbol].log_rotate()
                    }, this[pArgsSymbol].rotate_time_secs * 1000);
                }
            }
        }

        if (!this[pArgsSymbol].nlogInit) {
            this[pArgsSymbol].nlogInit = true;

            this[pArgsSymbol].nlog_server = _config.nlog_server;

            if(this[pArgsSymbol].nlog_server.server){
                this.log('set auto nlog_send');
                this[pArgsSymbol].nlogSendIntervalId = setInterval(() => {
                    this[pArgsSymbol].nlogSend();
                }, this[pArgsSymbol].nlog_server.sendTimer);
            }
        }
    }

    log(msg, level = 100, type = 'console.log', skip_nlog = false) {
        if(this.consoleDebug){
            if(level <= this.consoleDebug_level){
                let dd = new Date();
                msg = dd.toLocaleString('zh-TW', {hour12: false}) + "." +  ("00" + dd.getMilliseconds()).slice(-3) + " : "+ msg;
                orig_console_log(msg);

                if(this[pArgsSymbol].nlog_server.server) {
                    if(skip_nlog === false){
                        this[pArgsSymbol].nlogAddMsg(msg, level, type);
                    }
                } else if (this.db_callback !== null) {
                    this.db_callback(this, msg, level, type);
                }
            }
        }
    }

    stop() {
        if (!this[pArgsSymbol].isStopInterval) {
            this[pArgsSymbol].isStopInterval = true;
            if (this[pArgsSymbol].logRotateIntervalId) {
                if (!this[pArgsSymbol].log_rotating) {
                    orig_console_log('auto rotate stopped.');
                    clearInterval(this[pArgsSymbol].logRotateIntervalId);
                    this[pArgsSymbol].logRotateIntervalId = undefined;
                }else{
                    orig_console_log('auto rotate stopping.');
                }
            }
            if (this[pArgsSymbol].nlogSendIntervalId) {
                if (!this[pArgsSymbol].nlog_sending && this[pArgsSymbol].nlog_msg_buffer.length === 0) {
                    orig_console_log('auto nlog_send stopped.');
                    clearInterval(this[pArgsSymbol].nlogSendIntervalId);
                    this[pArgsSymbol].nlogSendIntervalId = undefined;
                }else{
                    orig_console_log('auto nlog_send stopping.');
                }
            }
            this[pArgsSymbol].checkExit();
        }
    }
}

const singleton = new HdlLogger({
    consoleDebug: true,
    consoleDebug_level: 150,
});

exports = module.exports = singleton;

exports.overwriteConsoleLog = (logDepth = 3, logInColor = true, logger = undefined) => {
    if (!(logger instanceof  HdlLogger)) {
        logger = singleton;
    }
    console.log = (...args) => {
        for(let i = 0, count = args.length; i < count; i++){
            if (typeof args[i] != 'object') {
                continue;
            }

            args[i] = util.inspect(
                args[i],
                {
                    depth: logDepth,
                    colors: logInColor
                }
            );
        }

        logger.log(args.join(' '));
    }
};

exports.orig_console_log = orig_console_log;

/**
 *
 * @param config
 * @return {HdlLogger}
 */
exports.createLogger = function createLogger(config) {
    return new HdlLogger(config);
}

exports.HdlLogger = HdlLogger;

exports.clog = (msg, level = 100) => {
    singleton.log(msg, level);
};

exports.getFileTimeFlag = getFileTimeFlag;
