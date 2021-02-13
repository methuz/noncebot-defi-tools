export const listTemplate = {
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
        type: "separator",
        margin: "xxl"
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "md",
        contents: [
          {
            type: "text",
            text: "Noncebot by",
            size: "xs",
            color: "#aaaaaa",
            flex: 0
          },
          {
            type: "text",
            text: "@Methuz",
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

export function generateTemplate(header, title, subtitle) {
  let replyContent = JSON.parse(JSON.stringify(listTemplate));
  replyContent.body.contents[0].text = header;
  replyContent.body.contents[1].text = title;
  replyContent.body.contents[2].text = subtitle;
  return replyContent;
}

export function generateRow(title, value, options) {
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

export function generateRow3(title, value1, value2, value3, options) {
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
        text: value1,
        size: "sm",
        color: "#111111",
        align: "end"
      },
      {
        type: "text",
        text: value2,
        size: "sm",
        color: "#111111",
        align: "end"
      },
      {
        type: "text",
        text: value2,
        size: "sm",
        color: "#111111",
        align: "end"
      }
    ]
  };

  if (options && options.bold) {
    //TODO loop
    for (let i = 0; i < 4; i++) {
      returnBody.contents[i].weight = "bold";
    }
  }

  if (options && options.thirdColor) {
    returnBody.contents[i].color = options.thirdColor
  }

  return returnBody;
}
