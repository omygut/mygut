import { View, Text, ScrollView } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { useState, useCallback, useRef } from "react";
import { symptomService } from "../../services/symptom";
import { mealService } from "../../services/meal";
import { stoolService } from "../../services/stool";
import { medicationService } from "../../services/medication";
import { labTestService } from "../../services/labtest";
import { examService } from "../../services/exam";
import { formatDisplayDate, getWeekday } from "../../utils/date";
import RecordItem, { AnyRecord } from "../../components/RecordItem";
import { RecordType, RECORD_TYPE_OPTIONS } from "../../types";
import "./index.css";

const PAGE_SIZE = 50;

const services = {
  symptom: symptomService,
  medication: medicationService,
  meal: mealService,
  stool: stoolService,
  labtest: labTestService,
  exam: examService,
} as const;

export default function History() {
  const [selectedType, setSelectedType] = useState<RecordType>(() => {
    return Taro.getStorageSync("history_selected_type") || "meal";
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [records, setRecords] = useState<AnyRecord[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef({ date: "9999-12-31", time: "23:59" });

  const loadMore = useCallback(async (type: RecordType, isInitial = false) => {
    const service = services[type];
    const cursor = cursorRef.current;

    const data = await service.getRecentBefore(cursor.date, cursor.time, PAGE_SIZE);

    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }

    if (data.length > 0) {
      const last = data[data.length - 1];
      cursorRef.current = { date: last.date, time: last.time };
    }

    return data.map((r) => ({ ...r, _type: type })) as AnyRecord[];
  }, []);

  const loadInitial = useCallback(
    async (type: RecordType) => {
      setLoading(true);
      setHasMore(true);
      cursorRef.current = { date: "9999-12-31", time: "23:59" };

      try {
        const newRecords = await loadMore(type, true);
        setRecords(newRecords);
      } catch (error) {
        console.error("加载数据失败:", error);
        Taro.showToast({ title: "加载失败", icon: "none" });
      } finally {
        setLoading(false);
      }
    },
    [loadMore],
  );

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const newRecords = await loadMore(selectedType);
      if (newRecords.length > 0) {
        setRecords((prev) => [...prev, ...newRecords]);
      }
    } catch (error) {
      console.error("加载更多失败:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadMore, selectedType, loadingMore, hasMore]);

  useDidShow(() => {
    if (records.length === 0) {
      loadInitial(selectedType);
    }
  });

  const handleRefresh = useCallback(async () => {
    await loadInitial(selectedType);
  }, [loadInitial, selectedType]);

  const handleTypeChange = (type: RecordType) => {
    if (type === selectedType) return;
    setSelectedType(type);
    Taro.setStorageSync("history_selected_type", type);
    setRecords([]);
    loadInitial(type);
  };

  // 按日期分组记录
  const groupedRecords: { date: string; records: AnyRecord[] }[] = [];
  let currentDate = "";
  records.forEach((record) => {
    if (record.date !== currentDate) {
      currentDate = record.date;
      groupedRecords.push({ date: record.date, records: [] });
    }
    groupedRecords[groupedRecords.length - 1].records.push(record);
  });

  return (
    <View className="history-page">
      <View className="type-filter">
        {RECORD_TYPE_OPTIONS.map((option) => (
          <View
            key={option.value}
            className={`type-option ${selectedType === option.value ? "active" : ""}`}
            onClick={() => handleTypeChange(option.value)}
          >
            <Text className="type-icon">{option.icon}</Text>
            <Text className="type-label">{option.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View className="loading">加载中...</View>
      ) : records.length === 0 ? (
        <View className="empty">
          <Text className="empty-text">暂无记录</Text>
        </View>
      ) : (
        <ScrollView
          className="records-scroll"
          scrollY
          refresherEnabled
          refresherTriggered={loading}
          onRefresherRefresh={handleRefresh}
          onScrollToLower={handleLoadMore}
          lowerThreshold={100}
        >
          <View className="records-list">
            {groupedRecords.map((group) => (
              <View key={group.date} className="date-group">
                <View className="date-header">
                  <Text className="date-text">
                    {formatDisplayDate(group.date)} {getWeekday(group.date)}
                  </Text>
                </View>
                <View className="date-records">
                  {group.records.map((record) => (
                    <RecordItem key={record._id} record={record} />
                  ))}
                </View>
              </View>
            ))}
          </View>
          {loadingMore && (
            <View className="loading-more">
              <Text>加载中...</Text>
            </View>
          )}
          {!hasMore && records.length > 0 && (
            <View className="no-more">
              <Text>没有更多了</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
