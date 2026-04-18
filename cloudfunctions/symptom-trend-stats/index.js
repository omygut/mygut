const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { startDate, endDate, symptom } = event;

  if (!startDate || !endDate || !symptom) {
    return { error: "startDate, endDate and symptom are required" };
  }

  const collection = db.collection("symptom_records");
  const MAX_LIMIT = 1000;
  const allData = [];

  let hasMore = true;
  while (hasMore) {
    const { data } = await collection
      .where({
        userId: OPENID,
        deletedAt: _.exists(false),
        date: _.gte(startDate).and(_.lte(endDate)),
        symptoms: symptom,
        severity: _.exists(true),
      })
      .orderBy("date", "asc")
      .skip(allData.length)
      .limit(MAX_LIMIT)
      .get();

    allData.push(...data);
    hasMore = data.length === MAX_LIMIT;
  }

  // 按日期聚合，取当天最大严重程度
  const dailyData = {};
  allData.forEach((record) => {
    if (!dailyData[record.date] || record.severity > dailyData[record.date]) {
      dailyData[record.date] = record.severity;
    }
  });

  const result = Object.entries(dailyData)
    .map(([date, severity]) => ({ date, value: severity }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { data: result };
};
