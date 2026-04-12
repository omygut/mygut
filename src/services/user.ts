import Taro from "@tarojs/taro";
import { getDatabase, getOpenId } from "../utils/cloud";

const COLLECTION = "user_settings";

interface UserSettings {
  _id: string; // 使用 userId 作为 _id
  nickname?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 获取当前用户设置
export async function getUserSettings(): Promise<UserSettings> {
  const db = getDatabase();
  const userId = await getOpenId();

  try {
    const res = (await db.collection(COLLECTION).doc(userId).get()) as { data: UserSettings | null };

    if (res.data) {
      return res.data;
    }
  } catch {
    // 用户设置不存在
  }

  // 返回默认值
  return {
    _id: userId,
  };
}

// 获取默认昵称
export function getDefaultNickname(userId: string): string {
  return `微信用户 ${userId.slice(-4)}`;
}

// 更新用户设置（使用 set 实现 upsert）
export async function updateUserSettings(data: {
  nickname?: string;
  avatar?: string;
}): Promise<void> {
  const db = getDatabase();
  const userId = await getOpenId();

  // 先尝试更新
  try {
    await db
      .collection(COLLECTION)
      .doc(userId)
      .update({
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
  } catch {
    // 记录不存在，创建新记录（指定 _id 为 userId）
    await db.collection(COLLECTION).add({
      data: {
        _id: userId,
        ...data,
        createdAt: new Date(),
      },
    });
  }
}

// 上传头像到云存储
export async function uploadAvatar(tempFilePath: string): Promise<string> {
  const openId = await getOpenId();
  const cloudPath = `${openId}/avatar.jpg`;

  const res = await Taro.cloud.uploadFile({
    cloudPath,
    filePath: tempFilePath,
  });

  return res.fileID;
}
