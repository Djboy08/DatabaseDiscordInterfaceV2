export let messageservice_send_payload = async (data: any) => {
  let url = `https://apis.roblox.com/messaging-service/v1/universes/1180269832/topics/${data.type === "raw-message-service" ? data.payload.message.split(" ")[0] : "databasev4"}`;
  let API_KEY = process.env.ROBLOX_SECRET;

  try {
    await send_fetch({ url, api_key: API_KEY, data }); // MAIN GAME
  } catch (e) {
    console.log(e);
  }
};

export let send_fetch = async ({ url, api_key, data }: any) => {
  try {
    let res: any = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${api_key}`,
      },
      body: JSON.stringify({
        message: JSON.stringify(data),
      }),
    }).catch((e) => console.log("Error in RBLX API fetching"));
    if (res.status == 200) {
      console.log(`Sent payload type: ${data.type}`);
    }
  } catch (e) {
    console.log(e);
  }
};
