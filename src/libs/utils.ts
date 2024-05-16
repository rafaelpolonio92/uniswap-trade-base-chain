import { BigNumber, ethers } from 'ethers'
import { SwapQuoter, Route } from '@uniswap/v3-sdk'
import { CurrencyAmount, TradeType, Token } from '@uniswap/sdk-core'
import { QUOTER_CONTRACT_ADDRESS } from '@libs/constants'

import { CurrentConfig } from '../config'

export const fromReadableAmount = (
  amount: number,
  decimals: number,
): BigNumber => {
  return ethers.utils.parseUnits(amount.toString(), decimals)
}

export const getOutputQuote = async (
  swapRoute: Route<Token, Token>,
  provider: ethers.providers.JsonRpcProvider,
) => {
  const { calldata } = SwapQuoter.quoteCallParameters(
    swapRoute,
    CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals,
      ).toString(),
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    },
  )

  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  })
  return new ethers.utils.AbiCoder().decode(['uint256'], quoteCallReturnData)
}
