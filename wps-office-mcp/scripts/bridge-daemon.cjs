const { macPollServer } = require('../dist/client/mac-poll-server');

macPollServer.start(Number(process.env.WPS_MCP_PORT || 58891)).then(() => {
  process.stderr.write('wps-office bridge daemon started\n');
});

process.on('SIGINT', () => {
  macPollServer.stop();
  process.exit(0);
});
process.on('SIGTERM', () => {
  macPollServer.stop();
  process.exit(0);
});
