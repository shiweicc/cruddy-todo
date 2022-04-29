const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const fsPromises = require('fs').promises;
const Promise = require('bluebird');
const fsPromisify = Promise.promisifyAll(fs);

var items = {};

/*
Questions:
Q1: var filePath = `./test/testData/${id}.txt`; VS `../test/testData/${id}.txt`; ???
Q2: for promisify, what's difference between using Promisify or not, since they are both Async functions
*/
// Q2: update function: using readOne function, then how to check if readOnereturn an err or succuss

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log('Cannot get unique id.');
    } else {
      var filePath = exports.dataDir + `/${id}.txt`;
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          console.log('Cannot write file path.');
        } else {
          callback(null, {id, text});
        }
      });
    }
  });
  // var id = counter.getNextUniqueId();
  // items[id] = text;
  // callback(null, { id, text });
};

exports.readAll = (callback) => {
  // var dataPromises = []; //[{id, text_promise}]
  return fsPromisify.readdirAsync(exports.dataDir)
    .then(files => {
      return Promise.all(files.map(file => {
        var id = file.slice(0, 5);
        return fsPromisify.readFileAsync(exports.dataDir + `/${id}.txt`, 'utf8').then ((todo) => { return {id, text: todo}; });

      }));
    }).then((data) => {


      callback(null, data);

    })
    .catch(err => console.log('error'));



  // fsPromises.readdir(exports.dataDir, (err, files) => {
  //   if (err) {
  //     console.log('Cannot read directory.');
  //   } else {

  //     _.each(files, file => {
  //       //00001.txt;
  //       var id = file.slice(0, 5);
  //       data.push({id, text: id});
  //     });

  //     callback(null, data);
  //   }
  // });

  // var data = _.map(items, (text, id) => {
  //   return { id, text };
  // });
  // callback(null, data);
};

exports.readOne = (id, callback) => {
  fs.readFile(exports.dataDir + `/${id}.txt`, 'utf8', (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text });
    }
  });
  // var text = items[id];
  // if (!text) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback(null, { id, text });
  // }
};

exports.update = (id, text, callback) => {
  var filePath = exports.dataDir + `/${id}.txt`;
  exports.readOne(id, (err, id) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          console.log('Cannot update the file.');
        } else {
          callback(null, {id, text});
        }
      });
    }
  });

  // data in the callback is optional, since we don't use the data in the following function
  // fs.readFile(filePath, 'utf8', (err, data) => {
  //   if (err) {
  //     callback(new Error(`No item with id: ${id}`));
  //   } else {
  //     fs.writeFile(filePath, text, (err) => {
  //       if (err) {
  //         console.log('Cannot update the file.');
  //       } else {
  //         callback(null, {id, text});
  //       }
  //     });
  //   }
  // });

  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  var filePath = exports.dataDir + `/${id}.txt`;
  fs.readFile(filePath, 'utf8', (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.unlink(filePath, (err) => {
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback();
        }
      });
    }
  });
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};