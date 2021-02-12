import { request, gql } from "graphql-request";

async function getMirPrice() {
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

getMirPrice()

