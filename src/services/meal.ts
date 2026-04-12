import Taro from "@tarojs/taro";
import { createRecordService } from "./base";
import type { MealRecord } from "../types";

const baseService = createRecordService<MealRecord>("meal_records");

const RECENT_FOODS_KEY = "recent_foods";
const MAX_RECENT_FOODS = 100;

function getRecentFoods(): string[] {
  const stored = Taro.getStorageSync(RECENT_FOODS_KEY);
  return Array.isArray(stored) ? stored : [];
}

function addRecentFoods(foods: string[]) {
  const existing = getRecentFoods();
  // 新食物放在前面，保留最近 100 个
  const updated = [...foods, ...existing].slice(0, MAX_RECENT_FOODS);
  Taro.setStorageSync(RECENT_FOODS_KEY, updated);
}

export const mealService = {
  ...baseService,

  async add(data: Omit<MealRecord, "_id" | "userId" | "createdAt">): Promise<string> {
    const id = await baseService.add(data);
    // 更新本地缓存
    addRecentFoods(data.foods);
    return id;
  },

  getTopFoods(limit = 10): string[] {
    const recentFoods = getRecentFoods();
    const foodCount = new Map<string, number>();
    for (const food of recentFoods) {
      foodCount.set(food, (foodCount.get(food) || 0) + 1);
    }

    return [...foodCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([food]) => food);
  },
};
