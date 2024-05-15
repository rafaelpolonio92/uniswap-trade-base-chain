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
    in: Token
    amountIn: number
    out: Token
    poolFee: number
  }
}


export const CurrentConfig: Config = {
  env: Environment.LOCAL,
  rpc: {
    local: 'http://localhost:8545',
    mainnet: process.env.MAINNET_RPC!
  },
  wallet: {
    address: '0x0B2Fbe272a7111b22f1b8Ec56CCc0F87D75ACdAE',
    privateKey: process.env.PRIVATE_KEY!
  },
  tokens: {
    in: WETH_TOKEN,
    amountIn: 0.00001,
    out: USDC_TOKEN,
    poolFee: FeeAmount.LOWEST,
  },
}