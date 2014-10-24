/*
 * 
 * https://github.com/davearata/convertible-ffmpeg
 *
 * Copyright (c) 2014 Dave Arata
 * Licensed under the MIT license.
 */

'use strict';

var ffmpeg = require('fluent-ffmpeg');

/**
 * `Strategy` constructor.
 *
 * The FFMpeg convertible strategy
 *
 * Examples:
 *
 *     convertible.use(new FFMpegStrategy());
 *
 * @api public
 */
function Strategy() {
  this.name = 'ffmpeg';
}

/**
 * apply options to the given command
 *
 * @param command
 * @param options
 * @api private
 */
Strategy.prototype.applyOptions = function (command, options) {
  if (!!options.audioCodec) {
    command.audioCodec(options.audioCodec);
  }
  if (!!options.auduioBitrate) {
    command.audioBitrate(options.audioBitrate);
  }
  if (!!options.audioChannels) {
    command.audioChannels(options.audioChannels);
  }
  if (!!options.audioFrequency) {
    command.audioFrequency(options.audioFrequency);
  }
  if (!!options.videoCodec) {
    command.videoCodec(options.videoCodec);
  }
  if (!!options.videoBitrate) {
    command.videoBitrate(options.videoBitrate);
  }
  if (!!options.frameRate) {
    command.fps(options.frameRate);
  }
  if (!!options.width || !!options.height) {
    var sizeString = '?x';
    if (!!options.width) {
      sizeString = options.width + 'x';
    }
    if (!!options.height) {
      sizeString = sizeString + options.height;
    } else {
      sizeString = sizeString + '?';
    }
    command.size(sizeString);
  }
  if (!!options.thumbnails) {
    command.screenshots(options.thumbnails);
  }
  if (!!options.aspectRatio) {
    command.aspect(options.aspectRatio);
  }
  if (!!options.outputFormat) {
    command.format(options.outputFormat);
  }
};

/**
 * Transcode video file from one format to another
 *
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */
Strategy.prototype.transcode = function (options, callback) {
  if (!options.path) {
    throw new Error('You must specify a path in the options');
  }

  if (!options.outputPath) {
    throw new Error('You must specify an outputPath in the options');
  }

  var command = ffmpeg(options.path);

  if (!!options.preset) {
    command.preset(options.preset);
  } else {
    this.applyOptions(command, options);
  }

  command
    .on('start', function (commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('codecData', function (data) {
      console.log('Input is ' + data.audio + ' audio ' +
        'with ' + data.video + ' video');
    })
    .on('progress', function (progress) {
      console.log('Processing: ' + progress.percent + '% done');
    })
    .on('error', function (err) {
      console.log('Cannot process video: ' + err.message);
      if(!!callback) {
        callback(err);
      }
    })
    .on('end', function() {
      console.log('Transcoding succeeded !');
      if(!!callback) {
        callback();
      }
    })
    .save(options.outputPath);
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
