"use strict";
import line from "@line/bot-sdk";
import express from "express";
import { getReward, getMirPrice } from "./mirror.js";

import { listTemplate } from "./line.js";

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
  const address = event.message.text;
  console.log("address = ", JSON.stringify(address, null, 4));

  const terraAddressFormat = /^terra[a-z0-9]{39}$/;

  if (!terraAddressFormat.test(address)) {
    console.log("invalid address");
    return Promise.resolve(null);
  }

  const mirrorReward = await getReward(address);
  const priceData = await getMirPrice();
  const mirPrice = priceData.asset.prices.price;

  let replyContent = JSON.parse(JSON.stringify(listTemplate));

  // Set current mir price
  replyContent.body.contents[6].contents[1].text = mirPrice;

  // Push Reward List
  let sum = 0;
  mirrorReward.forEach(reward => {
    sum += parseFloat(reward.reward);
    replyContent.body.contents[4].contents.push(
      generateLine(reward.name, reward.reward)
    );
  });

  replyContent.body.contents[4].contents.push(
    generateLine("Total(MIR)", "" + sum.toFixed(6), { bold: true })
  );

  replyContent.body.contents[4].contents.push(
    generateLine("Total(UST)", "" + (sum * parseFloat(mirPrice)).toFixed(6), {
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

function generateLine(title, value, options) {
  let returnBody = {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: title,
        size: "sm",
        color: "#555555",
        flex: 0
      },
      {
        type: "text",
        text: value,
        size: "sm",
        color: "#111111",
        align: "end"
      }
    ]
  };

  if (options && options.bold) {
    returnBody.contents[0].weight = "bold";
    returnBody.contents[1].weight = "bold";
  }

  return returnBody;
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
