export async function getBan(db: any, userId: string) {
  const collection = db.collection("Bans");
  let result = await collection.findOne({
    UserID: userId.toString(),
  });
  return result;
}

export async function updateBan(db: any, banData: any) {
  let Length = banData.Length < 1 ? Math.round(banData.Length) : banData.Length;
  const collection = db.collection("Bans");
  let UnbanDate = new Date();
  UnbanDate.setMinutes(UnbanDate.getMinutes() + Length);
  let result = await collection.updateOne(
    {
      UserID: banData.UserID,
    },
    {
      $set: {
        UserID: banData.UserID,
        Banned: banData.Banned,
        Length: banData.Length,
        Reason: banData.Reason,
        UnbanDate: banData.UnbanDate,
        Date: new Date(),
        AdminID: banData.AdminID,
        Proof: banData.Proof,
        TestUniverse: banData.TestUniverse,
      },
    },
    {
      upsert: true,
    },
  );

  return result;
}

export async function updateUnbanDate(db: any, { UserID, UnbanDate }: any) {
  const collection = db.collection("Bans");
  let result = await collection.updateOne(
    {
      UserID: UserID,
    },
    {
      $set: {
        UnbanDate: UnbanDate,
        Length:
          UnbanDate === 0
            ? 0
            : Math.round((UnbanDate.getTime() - new Date().getTime()) / 60000),
      },
    },
  );

  return result;
}

export async function unbanLengthCheckDatabase(db: any) {
  const collection = db.collection("Bans");
  await collection.updateMany(
    {
      Length: {
        $ne: 0,
      },
      Banned: true,
      UnbanDate: {
        $lte: new Date(),
      },
    },
    {
      $set: {
        Banned: false,
      },
    },
  );
}

export async function getBans(db: any) {
  const collection = db.collection("Bans");
  let result = await collection
    .find({
      Banned: true,
    })
    .project({
      _id: 0,
      UserID: 1,
      Reason: 1,
      TestUniverse: 1,
    })
    .toArray();

  return result;
}
