#!/usr/bin/env node
import { main } from '../src/cli.mjs';

main(process.argv.slice(2)).catch((error) => {
  console.error(`commercial-license-skill: ${error?.message ?? error}`);
  if (process.env.DEBUG) console.error(error?.stack ?? error);
  process.exitCode = 1;
});

