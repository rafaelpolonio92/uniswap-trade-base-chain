import { Token } from '@uniswap/sdk-core';
import { FeeAmount } from '@uniswap/v3-sdk';
import { WETH_TOKEN, USDC_TOKEN } from '@libs/constants';

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
    mainnet: 'https://mainnet.infura.io/v3/9b54c88cc9ff4eba9bd56b3629d7b33b',
  },
  wallet: {
    address: '0x65142A94Bf51ce79c0b8C0fA71DE923317131238',
    privateKey:
      'fa30b988543720cb1724b432dfbd7772dbfe186ffd523462055920d28e93b7b0',
  },
  tokens: {
    in: WETH_TOKEN,
    amountIn: 1,
    out: USDC_TOKEN,
    poolFee: FeeAmount.MEDIUM,
  },
}