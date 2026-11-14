/**
 * test - Main entry point
 *
 * test
 */

import { greet } from "./lib";

function main(): void {
  const message = greet("World");
  console.log(message);
}

main();
