import { LCDClient } from '@terra-money/terra.js';
import { Mirror } from '@mirror-protocol/mirror.js';
import BigNumber from 'bignumber.js'

const mirror = new Mirror();
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'localterra',
});

export async function getReward(address) {
  console.log('getting reward')
  const { reward_infos: rewardInfos } = await mirror.staking.getRewardInfo(address)

  const mapRewardIndex = rewardInfos.map((rewardObj) => {
    return mirror.staking.getPoolInfo(rewardObj.asset_token)
  })

  console.log('getting global index')
  const mapRewardIndexResult = await Promise.all(mapRewardIndex)

  const calculateReward = rewardInfos.map((rewardObj, i) => {
    const _reward = rewardCalc(mapRewardIndexResult[i].reward_index, rewardObj)
    return {
      asset_token: rewardObj.asset_token,
      reward: new BigNumber(_reward).integerValue(BigNumber.ROUND_FLOOR).dividedBy(1000000).toString()
    }
  })

  console.log(calculateReward)

  return calculateReward
}

function rewardCalc (globalIndex, info) {
     if (globalIndex && info) {
       const { index, bond_amount, pending_reward } = info

       const reward = new BigNumber(globalIndex)
         .minus(index)
         .times(bond_amount)
         .plus(pending_reward)

       return reward.toString()
     }
     return "0"
   }
