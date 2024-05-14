import { 
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} from "@uniswap/sdk-core";
import { Pool, Trade, SwapOptions, Route, SwapRouter } from "@uniswap/v3-sdk";
import JSBI from 'jsbi'

import { mainnetProvider, wallet, getTokenTransferApproval } from "@libs/providers";
import { CurrentConfig } from "config";
import { getPoolInfo, getWalletAddress } from "@libs/providers";
import { fromReadableAmount } from "@libs/utils"
import { getOutputQuote } from "@libs/utils";
import { SWAP_ROUTER_ADDRESS, MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from "@libs/constants";

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

const executeTrade = async () => {
  const tradeRoute = await createTrade();
  const walletAddress = getWalletAddress()
  const amountOut = await getOutputQuote(tradeRoute, mainnetProvider);

  const uncheckedTrade = Trade.createUncheckedTrade({
    route: tradeRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      ).toString()
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.out,
      JSBI.BigInt(amountOut).toString()
    ),
    tradeType: TradeType.EXACT_INPUT,
  })
  
  await getTokenTransferApproval(CurrentConfig.tokens.in)
  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: walletAddress!,
  }

  const methodParameters = SwapRouter.swapCallParameters([uncheckedTrade], options)
  const tx = {
    data: methodParameters.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: methodParameters.value,
    from: walletAddress,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  }
  
  const res = await wallet.sendTransaction(tx)
  return res;
}