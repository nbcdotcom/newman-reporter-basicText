const exportFile = require('./rollingExport');

function isTrue(bool) {
    return bool && ((typeof(bool) === "boolean" && bool) || bool === 'true');
}

module.exports = function(newman, reporterOptions) {
    var basicOutput = '';
    typeof(variable) === "boolean"
    var useCli = isTrue(reporterOptions.cli);
    let useRolling = isTrue(reporterOptions.rolling);
    let useExport = reporterOptions.export && typeof reporterOptions.export === 'string';
    let newmanCollection = reporterOptions.collection;

    function log(str) {
        if (useRolling || useExport) basicOutput += str;
        if (useCli) process.stdout.write(str);
    }

    // Add time length for all tests
    newman.on('start', () => {
        log(`Start collection run at ${new Date()}\n\n`);
        this.count = 0;
    });

    newman.on('beforeItem', (err, o) => { });

    newman.on('beforeRequest', (err, o) => { });

    newman.on('request', (err, o) => {
      if (err) {
        console.log(JSON.stringify(err));
      }
      if (o && useCli) {
        console.log(JSON.stringify(o));
      }
    });

    newman.on('script', (err, o) => { });

    newman.on('assertion', (err, o) => {
        this.count++;
        if (err) {
            let responses = JSON.parse(JSON.stringify(o.item.responses));
            log(`✗ Assertion failed! [${this.count} / ${o.item.name}]: "${o.assertion}"\n`);
            if (responses && responses.length > 0) {
                log('  URL PATH: ' + o.item.request.url.path.join('/') + '\n');
                log('  CODE: ' + responses[0].code + '\n');
                log('  BODY: ' + responses[0].body + '\n');
            }
        } else {
            log(`✔ Assertion passed! [${this.count} / ${o.item.name}]: "${o.assertion}"\n`);
        }
    });

    newman.on('beforeDone', (err) => {
        if (err) {
            console.log('there was an error');
            return;
        }

        log(`\nCollection run completed for collection: ${this.count} tests executed\n`);

        // Export to a single file based on rolling option
        let options = {
            name: 'basic-reporter',
            default: 'newman-run-report.txt',
            path: reporterOptions.export,
            content: basicOutput
        };

        if (useRolling) {
            exportFile(options)
        } else {
            newman.exports.push(options);
        }
    });
}
