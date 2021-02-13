"use strict";
import line from "@line/bot-sdk";
import express from "express";
import { getReward, getMirPrice, getPrices } from "./mirror.js";

import { listTemplate, generateRow } from "./line.js";

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // Test valid address
  const text = event.message.text;

  const terraAddressFormat = /^terra[a-z0-9]{39}$/;

  if (terraAddressFormat.test(text)) {
    return await getMirrorReward(text);
  } else {
    const replyMessage = { type: "text", text: "Invalid Command" };
    return client.replyMessage(event.replyToken, replyMessage);
  }
}

async function getMirrorReward(text) {
  const mirrorReward = await getReward(text);
  const priceData = await getMirPrice();
  const mirPrice = priceData.asset.prices.price;

  let replyContent = JSON.parse(JSON.stringify(listTemplate));

  // Set current mir price
  replyContent.body.contents[2].text = 'MIR = $' + mirPrice;

  // Push Reward List
  let sum = 0;
  mirrorReward.forEach(reward => {
    sum += parseFloat(reward.reward);
    replyContent.body.contents[4].contents.push(
      generateRow(reward.name, reward.reward)
    );
  });

  replyContent.body.contents[4].contents.push(
    generateRow("Total(MIR)", "" + sum.toFixed(6), { bold: true })
  );

  replyContent.body.contents[4].contents.push(
    generateRow("Total(UST)", "" + (sum * parseFloat(mirPrice)).toFixed(6), {
      bold: true
    })
  );

  const replyMessage = {
    type: "flex",
    altText: "Your current mirror reward",
    contents: replyContent
  };

  // use reply API
  return client.replyMessage(event.replyToken, replyMessage);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
