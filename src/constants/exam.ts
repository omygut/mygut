// 检查类型
export const EXAM_TYPES = [
  { value: "ultrasound", label: "超声", emoji: "🔊" },
  { value: "ct", label: "CT", emoji: "🔬" },
  { value: "mri", label: "MRI", emoji: "🧲" },
  { value: "colonoscopy", label: "肠镜", emoji: "🔭" },
  { value: "gastroscopy", label: "胃镜", emoji: "🔍" },
  { value: "xray", label: "X光", emoji: "☢️" },
  { value: "other", label: "其他", emoji: "📋" },
] as const;
