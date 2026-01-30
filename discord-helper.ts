export function getBanEmbed({
  UserID,
  Banned,
  Length,
  Reason,
  Proof,
  UnbanDate,
  AdminName,
  TestUniverse,
}: any) {
  let data = {
    embeds: [
      {
        title: `Ban Information: ${UserID}`,
        type: `rich`,
        description: "",
        color: false ? 2105893 : Banned ? 15158332 : 2600544,
        url: `https://www.roblox.com/users/${UserID}/profile`,
        fields: [
          {
            name: "Admin",
            value: AdminName,
            inline: true,
          },
          {
            name: "Enforced",
            value: Banned.toString(),
            inline: true,
          },
          // {
          //   name: "Length (in minutes)",
          //   value: Length.toString(),
          //   inline: false,
          // },
          {
            name: "Reason",
            value: Reason || "[No Reason]",
            inline: false,
          },
          {
            name: "Proof",
            value: Proof || "[No Proof]",
            inline: false,
          },
          ...(UnbanDate
            ? [
                {
                  name: "Unban Date",
                  value: new Date(UnbanDate).toISOString(),
                  inline: false,
                },
              ]
            : []),
        ],
      },
    ],
  };
  return data;
}
