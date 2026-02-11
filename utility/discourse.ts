function sleep(milliseconds: number) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

async function GetArtResponse(id: any, num: any) {
  try {
    let response: any = await fetch(
      `https://forum.arcaneodyssey.dev/t/${id}.json`,
    );
    response = await response.json();
    console.log(`Checking for art, CHECK_NUMBER: ${num}`);
    if (response.image_url) {
      return response;
    } else if (num > 0) {
      sleep(15000);
      return await GetArtResponse(id, num - 1);
    } else {
      return response;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  GetArtResponse,
};
