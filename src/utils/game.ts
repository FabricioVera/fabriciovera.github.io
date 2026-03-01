import Rand from "rand-seed";

export const calculateDailyTarget = (listTarget: any[]) => {
  const today = new Date();
  const seed = (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  ).toString();

  const rand = new Rand(seed);
  const randomValue = rand.next();

  return listTarget[Math.floor(randomValue * listTarget.length)];
};

export const calculateRandomTarget = (listTarget: any[]) => {
  const randomIndex = Math.floor(Math.random() * listTarget.length);
  return listTarget[randomIndex];
};
