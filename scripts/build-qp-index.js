#!/usr/bin/env node
/**
 * build-qp-index.js — Scan 25maths-cie0580-pdf-singlequestions repo
 * and generate data/qp-index.json in the same format as ms-index.json:
 *   { "2024March-Paper12": { "1": "0580_m24_qp_12_Q1-1.1.pdf", ... } }
 */

var fs = require('fs');
var path = require('path');

var QP_REPO = path.resolve(__dirname, '../../25maths-cie0580-pdf-singlequestions');
var OUT_FILE = path.resolve(__dirname, '../data/qp-index.json');

/* Map short session codes to paperKey session format */
var SESSION_MAP = {
  'm': 'March',
  's': 'MayJune',
  'w': 'OctNov'
};

var index = {};
var totalFiles = 0;
var totalPapers = 0;

/* Iterate session directories */
var sessions = fs.readdirSync(QP_REPO).filter(function(d) {
  return fs.statSync(path.join(QP_REPO, d)).isDirectory() && !d.startsWith('.');
});

sessions.forEach(function(sessionDir) {
  var sessionPath = path.join(QP_REPO, sessionDir);
  var papers = fs.readdirSync(sessionPath).filter(function(d) {
    return fs.statSync(path.join(sessionPath, d)).isDirectory();
  });

  papers.forEach(function(paperDir) {
    var paperPath = path.join(sessionPath, paperDir);
    var files = fs.readdirSync(paperPath).filter(function(f) {
      return f.endsWith('.pdf');
    });

    /* Build paperKey from directory names: "2024March" + "Paper12" → "2024March-Paper12" */
    var paperKey = sessionDir + '-' + paperDir;

    if (!index[paperKey]) {
      index[paperKey] = {};
      totalPapers++;
    }

    files.forEach(function(filename) {
      /* Extract question number from filename
         Pattern: 0580_{session}_qp_{paper}_Q{num}-{section}.pdf
         Example: 0580_m24_qp_12_Q1-1.1.pdf → qnum = "1" */
      var match = filename.match(/_Q(\d+)/);
      if (match) {
        var qnum = match[1];
        index[paperKey][qnum] = filename;
        totalFiles++;
      }
    });
  });
});

fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2) + '\n');
console.log('Done: ' + totalFiles + ' QP PDFs across ' + totalPapers + ' papers → ' + OUT_FILE);
