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
  dbg(`notifying live-reload server at http://localhost:${port}`);
  return axios.post(`http://localhost:${port}`, {files})
    .then(
      response => console.log(response),
      response => console.error(response)
    )
  ;
}

/**
 * A plugin that adds live-reloading to Tradie
 * @param {Tradie} tradie
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

        const server = tinylr()
          .listen(port, () => dbg(`starting live-reload server at http://localhost:${port}`))
        ;

        //TODO: plugin to add live reload code to HTML? not necessary with browser plugins?

        tradie
          .on('scripts.bundle.finished', files => {
            dbg(`files changed: [${files.join(', ')}]`);
            reload(files)
          })
          .on('styles.bundle.finished', files => {
            dbg(`files changed: [${files.join(', ')}]`);
            reload(files)
          })
          .once('command.finished', () => {
            dbg(`stopping live-reload server at http://localhost:${port}`);
            server.close()
          })
        ;

        break;

      default:
        break;

    }

  });
};