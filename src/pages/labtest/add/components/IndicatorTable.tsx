import { View, Text } from "@tarojs/components";
import type { LabTestIndicator } from "../../../../types";

interface IndicatorTableProps {
  indicators: LabTestIndicator[];
  onEdit: (index: number) => void;
}

const getRefText = (ind: LabTestIndicator) =>
  ind.refValue ||
  (ind.refMin !== undefined && ind.refMax !== undefined
    ? `${ind.refMin}-${ind.refMax}`
    : ind.refMin !== undefined
      ? `≥${ind.refMin}`
      : ind.refMax !== undefined
        ? `≤${ind.refMax}`
        : "-");

const isNegativeValue = (value: string) => {
  const v = value.toLowerCase().trim();
  return v === "negative" || v === "neg" || v === "阴性" || v === "(-)" || v === "-";
};

const isPositiveValue = (value: string) => {
  const v = value.toLowerCase().trim();
  return v === "positive" || v === "pos" || v === "阳性" || v === "(+)" || v === "+";
};

const getAbnormalFlag = (ind: LabTestIndicator) => {
  // Qualitative: refValue=negative means negative is normal, positive is abnormal
  if (ind.refValue === "negative") {
    if (isNegativeValue(ind.value)) return "";
    if (isPositiveValue(ind.value)) return "↑";
  }

  // Quantitative
  const numValue = parseFloat(ind.value);
  if (isNaN(numValue)) return "";
  if (ind.refMin !== undefined && numValue < ind.refMin) return "↓";
  if (ind.refMax !== undefined && numValue > ind.refMax) return "↑";
  return "";
};

export default function IndicatorTable({ indicators, onEdit }: IndicatorTableProps) {
  if (indicators.length === 0) {
    return <Text className="no-indicators">点击"手动添加"或上传图片后"AI 识别"</Text>;
  }

  // Group by category
  const groups = indicators.reduce(
    (acc, ind, originalIndex) => {
      const cat = ind.category || "其他";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ ...ind, originalIndex });
      return acc;
    },
    {} as Record<string, (LabTestIndicator & { originalIndex: number })[]>,
  );

  return (
    <View className="indicators-list">
      {Object.entries(groups).map(([category, items]) => (
        <View key={category} className="indicator-group">
          <Text className="indicator-group-title">{category}</Text>
          <View className="indicator-table">
            <View className="indicator-table-header">
              <Text className="indicator-col-name">指标</Text>
              <Text className="indicator-col-value">结果</Text>
              <Text className="indicator-col-ref">参考</Text>
              <Text className="indicator-col-unit">单位</Text>
            </View>
            {items.map((ind) => {
              const abnormalFlag = getAbnormalFlag(ind);
              return (
                <View
                  key={ind.originalIndex}
                  className="indicator-table-row clickable"
                  onClick={() => onEdit(ind.originalIndex)}
                >
                  <Text className="indicator-col-name">{ind.name}</Text>
                  <Text className="indicator-col-value">
                    {ind.value}
                    {abnormalFlag && (
                      <Text className={`abnormal-flag ${abnormalFlag === "↑" ? "high" : "low"}`}>
                        {abnormalFlag}
                      </Text>
                    )}
                  </Text>
                  <Text className="indicator-col-ref">{getRefText(ind)}</Text>
                  <Text className="indicator-col-unit">{ind.unit || "-"}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
