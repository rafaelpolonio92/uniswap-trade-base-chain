/* eslint-disable @typescript-eslint/no-explicit-any */
import { executeTrade } from '@libs/trading'
import { ethers } from 'ethers'

import logger from './logger'

function handleError(error: any) {
  if (error instanceof Error) {
    logger.error('An error occurred during the trade execution:', error.message)
    logger.error('Stack trace:', error.stack)
  } else {
    logger.error('An unexpected error occurred:', error)
  }

  if (error.code === ethers.errors.UNPREDICTABLE_GAS_LIMIT) {
    logger.error('Gas Limit error:', error)
  } else if (error.code === ethers.errors.CALL_EXCEPTION) {
    logger.error('Call exception:', error)
  } else if (error.code === ethers.errors.NETWORK_ERROR) {
    logger.error('Network error:', error)
  }

  // Ensure the process exits with a non-zero status code
  process.exit(1)
}

async function main() {
  try {
    await executeTrade()
  } catch (error) {
    handleError(error)
  }
}

main()
