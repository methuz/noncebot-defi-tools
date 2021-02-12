import { LCDClient } from "@terra-money/terra.js";
import { Mirror } from "@mirror-protocol/mirror.js";
import BigNumber from "bignumber.js";
import { request, gql } from "graphql-request";

const mirror = new Mirror();
const terra = new LCDClient({
  URL: "https://lcd.terra.dev",
  chainID: "localterra"
});

const mAssetsReverseIndex = {
  terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6: "MIR",
  terra1vxtwu4ehgzz77mnfwrntyrmgl64qjs75mpwqaz: "mAAPL",
  terra1h8arz2k547uvmpxctuwush3jzc8fun4s96qgwt: "mGOOGL",
  terra14y5affaarufk3uscy2vr6pe6w6zqf2wpjzn5sh: "mTSLA",
  terra1jsxngqasf2zynj5kyh0tgq9mj3zksa5gk35j4k: "mNFLX",
  terra1csk6tc7pdmpr782w527hwhez6gfv632tyf72cp: "mQQQ",
  terra1cc3enj9qgchlrj34cnzhwuclc4vl2z3jl7tkqg: "mTWTR",
  terra1227ppwxxj3jxz8cfgq00jgnxqcny7ryenvkwj6: "mMSFT",
  terra165nd2qmrtszehcfrntlplzern7zl4ahtlhd5t2: "mAMZN",
  terra1w7zgkcyt7y4zpct9dw8mw362ywvdlydnum2awa: "mBABA",
  terra15hp9pr8y4qsvqvxf3m4xeptlk7l8h60634gqec: "mIAU",
  terra1kscs6uhrqwy6rx5kuw5lwpuqvm3t6j2d6uf2lp: "mSLV",
  terra1lvmx8fsagy70tv0fhmfzdw9h6s3sy4prz38ugf: "mUSO",
  terra1zp3a6q6q4953cz376906g5qfmxnlg77hx3te45: "mVIXY",
  terra1g4x2pzmkc9z3mseewxf758rllg08z3797xly0n: "mABNB",
  terra137drsu8gce5thf6jr5mxlfghw36rpljt3zj73v: "mGS",
  terra1dk3g53js3034x4v5c3vavhj2738une880yu6kx: "mETH",
  terra1rhhvx8nzfrx5fufkuft06q5marfkucdqwq5sjw: "mBTC",
  terra1mqsjugsugfprn3cvgxsrr8akkvdxv2pzc74us7: "mFB"
};

export async function getReward(address) {
  console.log("getting reward");
  const { reward_infos: rewardInfos } = await mirror.staking.getRewardInfo(address);

  const mapRewardIndex = rewardInfos.map(rewardObj => {
    return mirror.staking.getPoolInfo(rewardObj.asset_token);
  });

  console.log("getting global index");
  const mapRewardIndexResult = await Promise.all(mapRewardIndex);

  const calculateReward = rewardInfos.map((rewardObj, i) => {
    const _reward = rewardCalc(mapRewardIndexResult[i].reward_index, rewardObj);
    return {
      name: mAssetsReverseIndex[rewardObj.asset_token] || "unknown",
      asset_token: rewardObj.asset_token,
      reward: new BigNumber(_reward).integerValue(BigNumber.ROUND_FLOOR).dividedBy(1000000).toString()
    };
  });

  return calculateReward;
}

export async function getPrices() {
  //Oracle
  mirror.oracle.getPrices().then(res => {
    let prices = res.Ok.prices;
    prices.map(price => {
      return {
        ...price,
        name: mAssetsReverseIndex[price.asset_token]
      };
    });
  });
}

export async function getMirPrice() {
   const query = gql`
     query {
       asset(token: "terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6") {
         token
         prices {
           price
         }
       }
     }
   `;
   const price = await request("https://graph.mirror.finance/graphql", query)
   console.log(price)
 }

function rewardCalc(globalIndex, info) {
  if (globalIndex && info) {
    const { index, bond_amount, pending_reward } = info;

    const reward = new BigNumber(globalIndex).minus(index).times(bond_amount).plus(pending_reward);

    return reward.toString();
  }
  return "0";
}
