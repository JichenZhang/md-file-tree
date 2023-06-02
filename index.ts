#!/usr/bin/env -S ts-node --transpile-only

// const tree = require('')
import walker from './walker';
import { Command } from 'commander';
import nodepath from 'path';

const { name, version } = require('./package.json');

const main = () => {
  const program = new Command();
  program.name(name);
  program.version(version);

  program
    .description('Generate md tree from directory')
    .option('-d, --dir [dir]', 'directory to walk', '.')
    .option('-e, --emoji', 'add emoji to show file type')
    .option('-i, --ignores <ignores...>', 'ignore files besides node_modules', [])
    .parse();
  console.log(program.opts());

  const { emoji, dir, ignores } = program.opts();
  const resolvedDir = dir

  const cleanMarkdown = (name: string) => name.replace(/([\\\/_*|-])/g, '\\$1');
  const directoryName = (name: string) => {
    return '- ' + (emoji ? '📂 ' : '') + '__' + cleanMarkdown(name) + '__\n';
  };
  const filename = (name: string, path: string) => {
    console.log(name, path)
    const relative = nodepath.relative(process.cwd(), path);
    const link = relative.replace(/\\/g, '/').replace(/^\/?(.+?)\/?$/, '$1') + '/' + encodeURIComponent(name);
    return '- ' + (emoji ? '📄 ' : '') + '[' + cleanMarkdown(name) + '](' + link.replace(/^\/?(.+?)$/, '$1') + ')\n';
  };
  const addIndentation = (i: number) => {
    return ' '.repeat(i * 2 + 1);
  };

  let indentation = 0;
  let output = directoryName(dir);

  const parseResult = (result: any) => {
    indentation++;
    Object.keys(result)
      .sort()
      .forEach(key => {
        const data = result[key];
        // console.log(data);
        if (typeof data === 'string' && key[0] !== '.') {
          const path = data.replace(/\\/g, '/').split('/');
          output += addIndentation(indentation) + filename(path.pop() || '', path.join('/'));
        } else if (typeof data === 'object') {
          output += addIndentation(indentation) + directoryName(key);
          parseResult(data);
          indentation--;
        }
      });
  };

  walker(
    resolvedDir,
    (err: any, result: any) => {
      parseResult(result);
      console.log(output);
    },
    [...ignores, 'node_modules']
  );
};

main();
