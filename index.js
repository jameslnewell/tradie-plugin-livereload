import path from 'path';
import debug from 'debug';
import axios from 'axios';
import tinylr from 'tiny-lr';

const dbg = debug('tradie-plugin-livereload');

/**
 * A plugin that adds live-reloading to tradie
 * @param {object} options
 */
export default (options = {}) => tradie => {
  const {port = '35729'} = options;

  /**
   * Force the styles and/or scripts to reload
   * @param   {array} files
   * @returns {Promise}
   */
  const reload = files => {
    return axios.post(`http://localhost:${port}/changed`, {files})
      .then(
        response => dbg(`live-reload successful for ${files}`),
        response => dbg(`live-reload failed for ${files}`)
      )
      ;
  };

  //only run livereload while we're watching
  if (!tradie.watch) {
    return;
  }

  //only run livereload while we're building
  if (tradie.command !== 'build') {
    return;
  }

  const server = tinylr({
    errorListener: error => tradie.emit('error', error)
  });
  server.listen(
    port,
    () => dbg(`Started livereload server at http://localhost:${port}`)
  );

  tradie
    .on('scripts.bundle.finished', result => {
      dbg(`file changed "${path.relative(tradie.dest, result.dest)}"`);
      reload([result.dest])
    })
    .on('styles.bundle.finished', result => {
      dbg(`file changed "${path.relative(tradie.dest, result.dest)}"`);
      reload([result.dest])
    })
    .once('exit', () => {
      
      try {
        server.close();
        dbg(`Stopped livereload server at http://localhost:${port}`);
      } catch (error) {
        tradie.emit('error', error)
      }

    })
  ;

};
