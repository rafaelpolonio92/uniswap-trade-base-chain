import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core'
import { Pool, Trade, SwapOptions, Route, SwapRouter } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'
import { ethers } from 'ethers'
import {
  mainnetProvider,
  getTokenTransferApproval,
  sendTransaction,
  getPoolInfo,
  getWalletAddress,
  TransactionState,
  getProvider,
} from '@libs/providers'
import { fromReadableAmount, getOutputQuote } from '@libs/utils'
import {
  SWAP_ROUTER_ADDRESS,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  GAS_LIMIT,
} from '@libs/constants'

import { CurrentConfig } from '../config'

export const createTrade = async (): Promise<Route<Token, Token>> => {
  const poolInfo = await getPoolInfo()

  const pool = new Pool(
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out,
    CurrentConfig.tokens.poolFee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick,
  )

  const swapRoute = new Route(
    [pool],
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out,
  )
  return swapRoute
}

export const executeTrade = async () => {
  const tradeRoute = await createTrade()
  const walletAddress = getWalletAddress()
  const provider = getProvider()
  const amountOut = await getOutputQuote(tradeRoute, mainnetProvider)

  const uncheckedTrade = Trade.createUncheckedTrade({
    route: tradeRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals,
      ).toString(),
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.out,
      JSBI.BigInt(amountOut).toString(),
    ),
    tradeType: TradeType.EXACT_INPUT,
  })

  const tokenApproval = await getTokenTransferApproval(CurrentConfig.tokens.in)

  if (tokenApproval !== TransactionState.Sent) {
    return TransactionState.Failed
  }

  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000),
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    recipient: walletAddress!,
  }

  const methodParameters = SwapRouter.swapCallParameters(
    [uncheckedTrade],
    options,
  )

  const gasLimit = ethers.BigNumber.from(GAS_LIMIT)
  const maxFeePerGas = ethers.utils.parseUnits(MAX_FEE_PER_GAS, 'gwei')
  const maxPriorityFeePerGas = ethers.utils.parseUnits(
    MAX_PRIORITY_FEE_PER_GAS,
    'gwei',
  )
  const nonce = await provider!.getTransactionCount(walletAddress!, 'pending')

  const tx = {
    data: methodParameters.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: methodParameters.value,
    from: walletAddress,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
    nonce,
  } as ethers.providers.TransactionRequest

  const res = await sendTransaction(tx)
  return res
}
