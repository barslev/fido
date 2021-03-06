#!/usr/bin/env node

import Yam from 'yam';
import fido from '../';
import chrono from 'chrono-node';
import { format } from '../util/format';
import chalk from 'chalk';

let cfg = [];
let fromDate = null;

const config = new Yam('fido', {
  primary: require('user-home'),
  secondary: process.cwd(),
});

const argv = require('yargs')
  .usage('Usage: fido')
  .option('i', {
    alias: 'id',
    demand: false,
    describe: 'The podcast id to query (single numeric value)',
  })
  .option('n', {
    alias: 'name',
    demand: false,
    describe: 'The name of the podcast to query',
    type: 'string',
  })
  .option('c', {
    alias: 'countries',
    demand: false,
    describe: 'The countries to query (space separated)',
    type: 'array',
  })
  .option('p', {
    alias: 'pages',
    demand: false,
    describe: 'The number of pages to fetch (page size is 50)',
  })
  .option('f', {
    alias: 'from',
    demand: false,
    describe: 'Natural language date from which point on reviews should be fetched',
    type: 'string',
  })
  .option('l', {
    alias: 'last',
    describe: 'Get the natural language relative date from the config file that ' +
    'represents the start time of the last podcast episode. The value should be ' +
    'under a top level key called last_episode_date. Example: Last Monday 5pm',
    type: 'boolean',
  })
  .version(() => {
    return require('../../package').version;
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .argv;

if (typeof argv.id !== 'undefined') {
  cfg.push({
    podcastId: argv.id,
    name: argv.name,
    countries: argv.countries,
  });
} else {
  cfg = config.get('podcasts');
}

if (typeof argv.from !== 'undefined') {
  fromDate = chrono.parseDate(argv.from);
}

if (argv.last === true) {
  const lastEpiDate = config.get('last_episode_date');

  if (typeof lastEpiDate !== 'undefined') {
    fromDate = chrono.parseDate(lastEpiDate);
  }
}

fido(cfg, argv.pages, fromDate).then(data => {
  Object.keys(data).forEach(key => {
    console.log(chalk.bold.black(`** ${data[key].name} **`));
    console.log(format(data[key].reviews, data[key].fromDate));
  });
});
