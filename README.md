# uniswap-trade-base-chain
Working trade using Uniswap on the BASE chain

# Uniswap Trading Bot

This project implements a trading bot using Uniswap V3. It allows you to execute trades on the Ethereum mainnet or a local blockchain using configurable gas values.

## Environment Variables

To run the project, you need to set up the following environment variables:

- `PRIVATE_KEY`: Your Ethereum wallet private key.
- `MAINNET_RPC`: The RPC URL for the Ethereum mainnet (e.g., provided by Infura).
- `WALLET_ADDRESS`: Your Ethereum wallet address.
- `LOCAL_RPC`: The RPC URL for your local Ethereum node (default: `http://localhost:8545`).

You can create a `.env` file in the root directory of the project to set these variables:


## Running the Code

To run the code, use the following command:

```bash
npm run start:dev


### Instructions to Create the Constants File

If you don’t already have a `constants.ts` file, here is a basic example of how you might structure it:

```typescript
import { ethers } from 'ethers'

// Define default gas values
export const GAS_LIMIT = ethers.BigNumber.from(200000)
export const MAX_FEE_PER_GAS = ethers.utils.parseUnits('10', 'gwei')
export const MAX_PRIORITY_FEE_PER_GAS = ethers.utils.parseUnits('2', 'gwei')

