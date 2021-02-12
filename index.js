"use strict";
import line from "@line/bot-sdk";
import express from "express";
import { getReward, getMirPrice } from "./mirror.js";

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

const messageTemplate = {
  type: "bubble",
  body: {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "Total Reward",
        weight: "bold",
        color: "#1DB446",
        size: "sm"
      },
      {
        type: "text",
        text: "Mirror",
        weight: "bold",
        size: "xxl",
        margin: "md"
      },
      {
        type: "text",
        text: "mirror.finance",
        size: "xs",
        color: "#aaaaaa",
        wrap: true
      },
      {
        type: "separator",
        margin: "xxl"
      },
      {
        type: "box",
        layout: "vertical",
        margin: "xxl",
        spacing: "sm",
        contents: []
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "md",
        contents: [
          {
            type: "text",
            text: "MIR price",
            size: "xs",
            color: "#aaaaaa",
            flex: 0
          },
          {
            type: "text",
            text: "12/12/12",
            color: "#aaaaaa",
            size: "xs",
            align: "end"
          }
        ]
      }
    ]
  },
  styles: {
    footer: {
      separator: true
    }
  }
};

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

  let replyContent = JSON.parse(JSON.stringify(messageTemplate));

  // Set current mir price
  replyContent.body.contents[5].contents[1].text = mirPrice;

  // Push Reward List
  let sum = 0;
  mirrorReward.forEach(reward => {
    sum += parseFloat(reward.reward);
    replyContent.body.contents[4].contents.push({
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: reward.name,
          size: "sm",
          color: "#555555",
          flex: 0
        },
        {
          type: "text",
          text: reward.reward,
          size: "sm",
          color: "#111111",
          align: "end"
        }
      ]
    });
  });

  replyContent.body.contents[4].contents.push({
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: "Total(MIR)",
        size: "sm",
        weight: "bold",
        color: "#555555",
        flex: 0
      },
      {
        type: "text",
        weight: "bold",
        text: "" + sum.toFixed(6),
        size: "sm",
        color: "#111111",
        align: "end"
      }
    ]
  });

  replyContent.body.contents[4].contents.push({
    type: "separator",
    margin: "xxl"
  });

  replyContent.body.contents[4].contents.push({
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: "Total(UST)",
        size: "sm",
        weight: "bold",
        color: "#555555",
        flex: 0
      },
      {
        type: "text",
        weight: "bold",
        text: "" + (sum * parseFloat(mirPrice)).toFixed(6),
        size: "sm",
        color: "#111111",
        align: "end"
      }
    ]
  });

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
