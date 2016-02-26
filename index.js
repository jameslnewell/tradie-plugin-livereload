import debug from 'debug';
import axios from 'axios';
import tinylr from 'tiny-lr';

const dbg = debug('tradie-plugin-livereload');
const port = process.env.LIVERELOAD_PORT || '35729';

/**
 * Force the styles and/or scripts to reload
 * @param   {array} files
 * @returns {Promise}
 */
function reload(files) {
  return axios.post(`http://localhost:${port}/changed`, {files})
    .then(
      response => dbg(`live-reload successful for ${files}`),
      response => dbg(`live-reload failed for ${files}`)
    )
  ;
}

/**
 * A plugin that adds live-reloading to Tradie
 * @param {tradie} tradie
 * @param {object} config
 */
export default function(tradie, config) {
  tradie.once('command.started', cmd => {

    if (!cmd.args.watch) {
      return;
    }

    switch (cmd.name) {

      case 'build':
      case 'bundle':
      case 'bundle-scripts':
      case 'bundle-styles':

        const server = tinylr({
          errorListener: error => tradie.emit('error', error)
        });
        server.listen(port, () => dbg(`starting live-reload server at http://localhost:${port}`));

        tradie
          .on('scripts.bundle.finished', result => {
            dbg(`files changed: [${result.dest}]`);
            reload([result.dest])
          })
          .on('styles.bundle.finished', result => {
            dbg(`files changed: [${result.dest}]`);
            reload([result.dest])
          })
          .once('command.finished', () => {
            dbg(`stopping live-reload server at http://localhost:${port}`);

            try {
              server.close();
            } catch (error) {
              tradie.emit('error', error)
            }

          })
        ;

        break;

      default:
        break;

    }

  });
};