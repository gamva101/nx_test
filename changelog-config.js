'use strict';
const Q = require('q');
const conventionalChangelog = require('conventional-changelog');
const parserOpts = require('./parser-opts');
const writerOpts = require('./writer-opts');

module.exports = {
  parserOpts,
  writerOpts,
  whatBump: (commits) => {
    let level = 2;
    let breakings = 0;
    let features = 0;

    commits.forEach((commit) => {
      if (commit.notes.length > 0) {
        breakings += commit.notes.length;
        level = 0;
      } else if (commit.type === 'feat') {
        features += 1;
        level = 1;
      }
    });

    return {
      level: level,
      reason:
        breakings === 1
          ? `There are ${breakings} BREAKING CHANGES and ${features} features`
          : `There are ${breakings} BREAKING CHANGES and ${features} features`,
    };
  },
  generateNotes: (config, context, options, commits, keyCommit, cb) => {
    config = config || {};

    const contextTmp = {};
    for (const key in context) {
      contextTmp[key] = context[key];
    }
    contextTmp.version = context.version || context.nextRelease.version;
    contextTmp.title = contextTmp.version;

    const changelogStream = conventionalChangelog(
      {
        preset: 'angular',
        config: {
          parserOpts: parserOpts,
          writerOpts: writerOpts,
        },
      },
      contextTmp,
      { commits: commits },
      { keyCommit: keyCommit }
    );

    changelogStream.pipe(writerOpts.transform).pipe(cb);
  },
};
