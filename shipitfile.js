var utils = require('shipit-utils');

module.exports = function (shipit) {
  require('shipit-deploy')(shipit);
  require('shipit-shared')(shipit);

  shipit.initConfig({
    default: {
      key: '~/.ssh/id_rsa',
      repositoryUrl: 'git@lamuz:lamuz/limo.git',
      deployTo: '/opt/limo',
      workspace: '/tmp/shipit',
      ignores: ['.git', 'node_modules'],
      keepReleases: 5,
      shallowClone: true,

      shared: {
        overwrite: true,
        files: ['.env', 'pm2.config.js'],
      }
    },
    production: {
      servers: 'root@limo.uz'
    }
  });

  utils.registerTask(shipit, 'setup', async function() {
    await shipit.remote('yarn install', {cwd: shipit.releasePath});
    await shipit.remote('yarn db migrate', {cwd: shipit.releasePath});
    await shipit.remote('yarn build', {cwd: shipit.releasePath});
  });

  utils.registerTask(shipit, 'start', async function() {
    await shipit.remote('pm2 startOrRestart pm2.config.js', {cwd: shipit.releasePath});
  });

  shipit.on('updated', async function () {
    utils.runTask(shipit, 'setup');
  });

  shipit.on('published', function () {
    utils.runTask(shipit, 'start');
  });
};
