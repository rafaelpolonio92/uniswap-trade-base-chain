import { ethers } from "ethers";
import { 
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} from "@uniswap/sdk-core";
import { Pool, Trade, SwapRouter, Route } from "@uniswap/v3-sdk";

import { mainnetProvider, wallet } from "@libs/providers";
import { MAINNET_CHAIN_ID } from "@libs/constants";
import { CurrentConfig } from "config";
import { getPoolInfo } from "@libs/providers";

const BASE_ETH = new Token(MAINNET_CHAIN_ID, '0x...BASE_ETH_address...', 18, 'BASE_ETH', 'Base Ethereum');
const USDC = new Token(MAINNET_CHAIN_ID, '0x...USDC_address...', 6, 'USDC', 'USD Coin');

const createTrade = async (): Promise<Route<Token, Token>> => { 

  const poolInfo = await getPoolInfo()

  const pool = new Pool(
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out,
    CurrentConfig.tokens.poolFee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )

  const swapRoute = new Route(
    [pool],
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out
  )
  return swapRoute;
}