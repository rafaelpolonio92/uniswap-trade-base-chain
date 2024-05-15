import { executeTrade } from './libs/trading';

async function main() {
  try {
    await executeTrade();
  } catch (error) {
    console.error('Error executing swap:', error);
    process.exit(1);
  }
}

main();