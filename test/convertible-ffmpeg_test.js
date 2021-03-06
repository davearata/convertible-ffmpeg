/*global describe,it*/
'use strict';
var assert = require('assert');
var sinon = require('sinon');
var ffmpeg = require('fluent-ffmpeg');
var requireSubvert = require('require-subvert')(__dirname);
var Writable = require('stream').Writable;

var sandbox;
var FFMpegStrategy;
var command;

describe('convertible-ffmpeg node module.', function() {
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    requireSubvert.subvert('fluent-ffmpeg', function(input) {
      command = ffmpeg(input);
      sandbox.stub(command, 'run');
      return command;
    });
    var ConvertibleStrategy = requireSubvert.require('../lib/strategy');
    FFMpegStrategy = new ConvertibleStrategy();
  });

  afterEach(function () {
    sandbox.restore();
    requireSubvert.cleanUp();
  });

  it('should throw an error if you call transcode with no path', function() {
    assert.throws(function() {
      FFMpegStrategy.transcode({});
    }, /You must specify a path in the options/);
  });

  it('should throw an error if you call transcode with no outputPath', function() {
    assert.throws(function() {
      FFMpegStrategy.transcode({
        path: 'input.avi'
      });
    }, /You must specify an outputPath in the options/);
  });

  it('should throw an error if you call transcode with a writestream outputPath and do not provide a format', function() {
    assert.throws(function() {
      FFMpegStrategy.transcode({
        path: 'input.avi',
        outputPath: new Writable()
      });
    }, /When using a stream as your output you must specify outputFormat/);
  });

  it('should not call applyOptions if preset is passed in the options', function() {
    sandbox.spy(FFMpegStrategy, 'applyOptions');
    FFMpegStrategy.transcode({
      path: 'input.avi',
      outputPath: 'output.mp4',
      preset: 'divx'
    });
    assert(!FFMpegStrategy.applyOptions.calledOnce);
  });

  it('should call applyOptions if preset is not passed in the options', function() {
    sandbox.spy(FFMpegStrategy, 'applyOptions');
    FFMpegStrategy.transcode({
      path: 'input.avi',
      outputPath: 'output.mp4'
    });
    assert(FFMpegStrategy.applyOptions.calledOnce);
  });

  it('should apply the options passed in and call run', function() {
    FFMpegStrategy.transcode({
      path: 'input.avi',
      outputPath: 'output.mp4',
      audioCodec: 'libmp3lame',
      audioBitrate: 128,
      audioChannels: 2,
      audioFrequency: 22050,
      videoCodec: 'libx264',
      videoBitrate: '1000k',
      frameRate: 29.7,
      width: 1280,
      height: 720,
      aspectRatio: '16:9',
      outputFormat: 'mp4'
    });
    assert(command.run.calledOnce);
  });
});
