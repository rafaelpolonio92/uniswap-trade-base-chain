import { Token } from '@uniswap/sdk-core';
import { FeeAmount } from '@uniswap/v3-sdk';
import { WETH_TOKEN, USDC_TOKEN } from '@libs/constants';
import * as dotenv from 'dotenv';
dotenv.config();

export enum Environment {
  LOCAL,
  MAINNET,
  WALLET_EXTENSION,
}

export interface Config {
  env: Environment
  rpc: {
    local: string
    mainnet: string
  }
  wallet: {
    address: string
    privateKey: string
  }
  tokens: {
    in: any
    amountIn: number
    out: Token
    poolFee: number
  }
}

if (!process.env.LOCAL_RPC || !process.env.MAINNET_RPC || !process.env.WALLET_ADDRESS || !process.env.PRIVATE_KEY) {
  throw new Error('Missing environment variables')
}

export const CurrentConfig: Config = {
  env: Environment.LOCAL,
  rpc: {
    local: process.env.LOCAL_RPC!,
    mainnet: process.env.MAINNET_RPC!
  },
  wallet: {
    address: process.env.WALLET_ADDRESS!,
    privateKey: process.env.PRIVATE_KEY!
  },
  tokens: {
    in: WETH_TOKEN,
    amountIn: 0.0020,
    out: USDC_TOKEN,
    poolFee: FeeAmount.LOWEST,
  },
}