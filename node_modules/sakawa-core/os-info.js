const os = require("os");
const EventEmitter = require('events');
const {cloneDeep, merge} = require('lodash');

const {clog} = require('./hdl-logger');
const {m_sql_time_3} = require("./utils/common");

const default_config = {
    log_stst_to_clog : false, //輸出CPU資訊到console
    output_interval : 1000
}

class OsInfo extends EventEmitter{
    #system_status = {
        startup_time: '',
        uptime: 0,
        m_sql_time: '',
        sys: {
            cpu_gsage: 0,
            memory_gsage: {
                rss: 0,
                heapTotal: 0,
                heapUsed: 0,
                external: 0,
                arrayBuffers: 0
            },
            cpu_gsage_max: 0,
            memory_gsage_max: {
                rss: 0,
                heapTotal: 0,
                heapUsed: 0,
                external: 0,
                arrayBuffers: 0
            }
        },
        os: {
            loadavg: []
        },
        call_count: {
            notFound: 0
        }
    };
    #online_stst = {
        os: '',
        attn: []
    };
    #intervalId;

    constructor(config) {
        super();
        this.init(config);
    }

    get system_status() {
        return this.#system_status;
    }

    get online_stst() {
        return this.#online_stst;
    }

    init(config) {
        let _config = cloneDeep(default_config);
        merge(_config, config);
        this.config = _config;
        return this;
    }

    update() {
        this.#system_status.uptime += (this.config.output_interval / 1000);
        this.#system_status.os.loadavg = os.loadavg();
        this.#system_status.m_sql_time = m_sql_time_3();

        let mem = process.memoryUsage();
        let max = this.#system_status.sys.memory_gsage_max;
        this.#system_status.sys.memory_gsage = mem;
        if (mem.rss > max.rss) {
            max.rss = mem.rss;
        }
        if (mem.heapTotal > max.heapTotal) {
            max.heapTotal = mem.heapTotal;
        }
        if (mem.heapUsed > max.heapUsed) {
            max.heapUsed = mem.heapUsed;
        }
        if (mem.external > max.external) {
            max.external = mem.external;
        }
        if (mem.arrayBuffers > max.arrayBuffers) {
            max.arrayBuffers = mem.arrayBuffers;
        }
        let mem_t = Math.floor(mem.rss / 1024 / 1024 * 100) / 100;
        let mem_h = Math.floor(mem.heapUsed / 1024 / 1024 * 100) / 100;
        let cpua = this.#system_status.os.loadavg[0];
        let cpub = this.#system_status.os.loadavg[1];
        let cpuc = this.#system_status.os.loadavg[2];
        if (this.config.log_stst_to_clog == true) {
            let str = `CPU [${cpua}, ${cpub}, ${cpuc}], RSS: ${mem_t} MB, HEAP: ${mem_h} MB`;
            clog(str);
            this.#online_stst.os = str;
            this.#online_stst.attn = [];
        }
        this.emit('update', this.#system_status, this.#online_stst);
    }

    startUpdate() {
        this.stopUpdate();
        this.update();
        clog(`OsInfo startUpdate every ${this.config.output_interval} ms`);
        this.#intervalId = setInterval(() => {
            this.update();
        }, this.config.output_interval);
    }

    stopUpdate() {
        if (this.#intervalId) {
            clog(`OsInfo stopUpdate`);
            clearInterval(this.#intervalId);
            this.#intervalId = undefined;
        }
    }
}

const singleton = new OsInfo({});

exports = module.exports = singleton;

exports.OsInfo = OsInfo;
