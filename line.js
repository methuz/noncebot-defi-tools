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
