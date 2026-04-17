import { View, Text, Input } from "@tarojs/components";

interface EditingIndicator {
  index: number | null;
  name: string;
  value: string;
}

interface IndicatorEditModalProps {
  editing: EditingIndicator;
  onNameChange: (name: string) => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function IndicatorEditModal({
  editing,
  onNameChange,
  onValueChange,
  onSave,
  onDelete,
  onClose,
}: IndicatorEditModalProps) {
  return (
    <View className="indicator-modal-mask" onClick={onClose}>
      <View className="indicator-modal" onClick={(e) => e.stopPropagation()}>
        <Text className="indicator-modal-title">
          {editing.index === null ? "添加指标" : "编辑指标"}
        </Text>
        <View className="indicator-modal-field">
          <Text className="indicator-modal-label">指标名称</Text>
          <Input
            className="indicator-modal-input"
            placeholder="如：白细胞计数"
            value={editing.name}
            onInput={(e) => onNameChange(e.detail.value)}
          />
        </View>
        <View className="indicator-modal-field">
          <Text className="indicator-modal-label">结果值</Text>
          <Input
            className="indicator-modal-input"
            placeholder="如：5.2"
            value={editing.value}
            onInput={(e) => onValueChange(e.detail.value)}
          />
        </View>
        <View className="indicator-modal-actions">
          <View className="indicator-modal-btn primary" onClick={onSave}>
            保存
          </View>
        </View>
        {editing.index !== null && (
          <View className="indicator-modal-delete" onClick={onDelete}>
            删除此指标
          </View>
        )}
      </View>
    </View>
  );
}
