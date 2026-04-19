# Exercise Record Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add exercise recording feature to track daily physical activity with type, duration, and intensity.

**Architecture:** Follow existing record type patterns (stool, meal). Service extends base service with local storage for frequently used exercises. UI uses category tabs + custom input pattern from meal recording.

**Tech Stack:** Taro, React, TypeScript, WeChat Cloud Database

---

## File Structure

| File | Purpose |
|------|---------|
| `src/types/index.ts` | Add ExerciseRecord interface, update RECORD_TYPES and RECORD_TYPE_OPTIONS |
| `src/constants/exercise.ts` | Exercise categories, duration options, intensity options |
| `src/services/exercise.ts` | CRUD + getTopExercises for frequent exercises |
| `src/components/ExerciseIntensityIcon/index.tsx` | SVG icon component for intensity levels |
| `src/pages/exercise/add/index.tsx` | Add/edit page |
| `src/pages/exercise/add/index.css` | Page styles (copy from stool/add) |
| `src/pages/exercise/add/index.config.ts` | Page navigation title |
| `src/app.config.ts` | Register new page route |

---

### Task 1: Add ExerciseRecord Type

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add ExerciseRecord interface after MedicationRecord**

In `src/types/index.ts`, add after line 86 (after MedicationRecord):

```typescript
// 运动记录
export interface ExerciseRecord extends BaseRecord {
  type: string; // 运动类型（如"跑步"）
  duration: 15 | 30 | 45 | 60 | 90 | 120; // 时长（分钟）
  intensity: 1 | 2 | 3; // 强度：1轻松/2适中/3剧烈
  note?: string;
}
```

- [ ] **Step 2: Update RECORD_TYPES array**

Change line 2-10 from:

```typescript
export const RECORD_TYPES = [
  "symptom",
  "medication",
  "meal",
  "stool",
  "labtest",
  "exam",
  "assessment",
] as const;
```

to:

```typescript
export const RECORD_TYPES = [
  "symptom",
  "medication",
  "meal",
  "stool",
  "exercise",
  "labtest",
  "exam",
  "assessment",
] as const;
```

- [ ] **Step 3: Update RECORD_TYPE_OPTIONS array**

Add exercise option after stool (after line 24):

```typescript
  { value: "exercise", label: "运动", icon: "🏃", addPath: "/pages/exercise/add/index" },
```

- [ ] **Step 4: Update ExportData interface**

Add `exercise_records: ExerciseRecord[];` to the ExportData interface.

- [ ] **Step 5: Run build to verify**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(exercise): add ExerciseRecord type definition"
```

---

### Task 2: Create Exercise Constants

**Files:**
- Create: `src/constants/exercise.ts`

- [ ] **Step 1: Create constants file**

Create `src/constants/exercise.ts`:

```typescript
// 运动分类预设
export const EXERCISE_CATEGORIES = [
  {
    name: "有氧",
    items: [
      { name: "跑步", emoji: "🏃" },
      { name: "快走", emoji: "🚶" },
      { name: "游泳", emoji: "🏊" },
      { name: "骑行", emoji: "🚴" },
      { name: "跳绳", emoji: "🪢" },
      { name: "健身操", emoji: "🤸" },
      { name: "爬楼梯", emoji: "🪜" },
      { name: "椭圆机", emoji: "🏋️" },
      { name: "划船机", emoji: "🚣" },
    ],
  },
  {
    name: "力量",
    items: [
      { name: "举重", emoji: "🏋️" },
      { name: "俯卧撑", emoji: "💪" },
      { name: "深蹲", emoji: "🦵" },
      { name: "引体向上", emoji: "🙆" },
      { name: "哑铃", emoji: "🏋️" },
      { name: "杠铃", emoji: "🏋️" },
      { name: "器械训练", emoji: "🎰" },
    ],
  },
  {
    name: "柔韧",
    items: [
      { name: "瑜伽", emoji: "🧘" },
      { name: "普拉提", emoji: "🤸" },
      { name: "拉伸", emoji: "🙆" },
      { name: "太极", emoji: "☯️" },
    ],
  },
  {
    name: "球类",
    items: [
      { name: "篮球", emoji: "🏀" },
      { name: "足球", emoji: "⚽" },
      { name: "羽毛球", emoji: "🏸" },
      { name: "乒乓球", emoji: "🏓" },
      { name: "网球", emoji: "🎾" },
      { name: "高尔夫", emoji: "⛳" },
      { name: "排球", emoji: "🏐" },
    ],
  },
  {
    name: "其他",
    items: [
      { name: "散步", emoji: "🚶" },
      { name: "爬山", emoji: "🧗" },
      { name: "滑雪", emoji: "⛷️" },
      { name: "滑冰", emoji: "⛸️" },
      { name: "跳舞", emoji: "💃" },
      { name: "武术", emoji: "🥋" },
    ],
  },
] as const;

// 时长选项（分钟）
export const DURATION_OPTIONS = [
  { value: 15, label: "15分钟" },
  { value: 30, label: "30分钟" },
  { value: 45, label: "45分钟" },
  { value: 60, label: "1小时" },
  { value: 90, label: "1.5小时" },
  { value: 120, label: "2小时" },
] as const;

// 强度选项
export const INTENSITY_OPTIONS = [
  { value: 1, label: "轻松", desc: "可以正常聊天" },
  { value: 2, label: "适中", desc: "呼吸加快，微微出汗" },
  { value: 3, label: "剧烈", desc: "大量出汗，难以说话" },
] as const;
```

- [ ] **Step 2: Run build to verify**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/constants/exercise.ts
git commit -m "feat(exercise): add exercise constants"
```

---

### Task 3: Create Exercise Service

**Files:**
- Create: `src/services/exercise.ts`

- [ ] **Step 1: Create service file**

Create `src/services/exercise.ts`:

```typescript
import Taro from "@tarojs/taro";
import { createRecordService } from "./base";
import type { ExerciseRecord } from "../types";

const baseService = createRecordService<ExerciseRecord>("exercise_records");

const RECENT_EXERCISES_KEY = "recent_exercises";
const MAX_RECENT_EXERCISES = 50;

function getRecentExercises(): string[] {
  const stored = Taro.getStorageSync(RECENT_EXERCISES_KEY);
  return Array.isArray(stored) ? stored : [];
}

function addRecentExercise(exerciseType: string) {
  const existing = getRecentExercises();
  const updated = [exerciseType, ...existing.filter((e) => e !== exerciseType)].slice(
    0,
    MAX_RECENT_EXERCISES,
  );
  Taro.setStorageSync(RECENT_EXERCISES_KEY, updated);
}

export const exerciseService = {
  ...baseService,

  async add(data: Omit<ExerciseRecord, "_id" | "userId" | "createdAt">): Promise<string> {
    const id = await baseService.add(data);
    addRecentExercise(data.type);
    return id;
  },

  getTopExercises(limit = 10): string[] {
    const recentExercises = getRecentExercises();
    const exerciseCount = new Map<string, number>();
    for (const exercise of recentExercises) {
      exerciseCount.set(exercise, (exerciseCount.get(exercise) || 0) + 1);
    }

    return [...exerciseCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([exercise]) => exercise);
  },
};
```

- [ ] **Step 2: Run build to verify**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/services/exercise.ts
git commit -m "feat(exercise): add exercise service"
```

---

### Task 4: Create ExerciseIntensityIcon Component

**Files:**
- Create: `src/components/ExerciseIntensityIcon/index.tsx`

- [ ] **Step 1: Create icon component**

Create `src/components/ExerciseIntensityIcon/index.tsx`:

```typescript
import { Image } from "@tarojs/components";
import { COLORS } from "../../constants/colors";

type IntensityLevel = 1 | 2 | 3;

function generateIntensitySvg(level: IntensityLevel, active: boolean): string {
  const baseColor = active ? "#ccc" : "#e0e0e0";
  const activeColor = active
    ? level === 1
      ? COLORS.primary
      : level === 2
        ? COLORS.yellow
        : COLORS.orange
    : "#e0e0e0";

  // 三个火焰，根据强度点亮
  const flame1 = level >= 1 ? activeColor : baseColor;
  const flame2 = level >= 2 ? activeColor : baseColor;
  const flame3 = level >= 3 ? activeColor : baseColor;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <!-- 火焰1（左） -->
    <path d="M10 36 Q8 28 12 24 Q10 20 14 16 Q16 22 18 20 Q20 28 16 32 Q18 36 14 38 Q10 40 10 36 Z" fill="${flame1}"/>
    <!-- 火焰2（中） -->
    <path d="M20 34 Q18 24 22 18 Q20 12 24 8 Q26 16 28 14 Q32 24 28 30 Q30 36 26 38 Q20 40 20 34 Z" fill="${flame2}"/>
    <!-- 火焰3（右） -->
    <path d="M32 36 Q30 28 34 24 Q32 20 36 16 Q38 22 40 20 Q42 28 38 32 Q40 36 36 38 Q32 40 32 36 Z" fill="${flame3}"/>
  </svg>`;
}

function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg.replace(/\s+/g, " ").trim());
  return `data:image/svg+xml,${encoded}`;
}

interface ExerciseIntensityIconProps {
  level: IntensityLevel;
  size?: number;
  active?: boolean;
}

export default function ExerciseIntensityIcon({
  level,
  size = 48,
  active = true,
}: ExerciseIntensityIconProps) {
  return (
    <Image
      src={svgToDataUri(generateIntensitySvg(level, active))}
      style={{ width: `${size}px`, height: `${size}px` }}
      mode="aspectFit"
    />
  );
}
```

- [ ] **Step 2: Run build to verify**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/ExerciseIntensityIcon/index.tsx
git commit -m "feat(exercise): add ExerciseIntensityIcon component"
```

---

### Task 5: Create Exercise Add Page

**Files:**
- Create: `src/pages/exercise/add/index.tsx`
- Create: `src/pages/exercise/add/index.css`
- Create: `src/pages/exercise/add/index.config.ts`

- [ ] **Step 1: Create page config**

Create `src/pages/exercise/add/index.config.ts`:

```typescript
export default definePageConfig({
  navigationBarTitleText: "运动记录",
});
```

- [ ] **Step 2: Copy and adapt CSS from stool add page**

Run: `cp src/pages/stool/add/index.css src/pages/exercise/add/index.css`

- [ ] **Step 3: Create exercise add page**

Create `src/pages/exercise/add/index.tsx`:

```typescript
import { View, Text, Input, Textarea } from "@tarojs/components";
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import { useState, useEffect } from "react";
import { exerciseService } from "../../../services/exercise";
import {
  EXERCISE_CATEGORIES,
  DURATION_OPTIONS,
  INTENSITY_OPTIONS,
} from "../../../constants/exercise";
import { formatDate, formatTime } from "../../../utils/date";
import { showError } from "../../../utils/error";
import CalendarPopup from "../../../components/CalendarPopup";
import TimePicker from "../../../components/TimePicker";
import ExerciseIntensityIcon from "../../../components/ExerciseIntensityIcon";
import type { ExerciseRecord } from "../../../types";
import "./index.css";

const CUSTOM_EXERCISES_KEY = "custom_exercises";

const ALL_PRESET_EXERCISES = new Set(
  EXERCISE_CATEGORIES.flatMap((cat) => cat.items.map((item) => item.name)),
);

const EXERCISE_EMOJI_MAP = new Map(
  EXERCISE_CATEGORIES.flatMap((cat) => cat.items.map((item) => [item.name, item.emoji])),
);

function getStoredCustomExercises(): string[] {
  const stored = Taro.getStorageSync(CUSTOM_EXERCISES_KEY);
  return Array.isArray(stored) ? stored : [];
}

function saveCustomExercise(exercise: string) {
  const existing = getStoredCustomExercises();
  if (!existing.includes(exercise)) {
    Taro.setStorageSync(CUSTOM_EXERCISES_KEY, [...existing, exercise]);
  }
}

function removeCustomExercise(exercise: string) {
  const existing = getStoredCustomExercises();
  Taro.setStorageSync(
    CUSTOM_EXERCISES_KEY,
    existing.filter((e) => e !== exercise),
  );
}

export default function ExerciseAdd() {
  const router = useRouter();
  const editId = router.params.id;
  const isEdit = !!editId;

  const [date, setDate] = useState(formatDate());
  const [time, setTime] = useState(formatTime());
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [manualInput, setManualInput] = useState("");
  const [duration, setDuration] = useState<ExerciseRecord["duration"]>(30);
  const [intensity, setIntensity] = useState<ExerciseRecord["intensity"]>(2);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [topExercises, setTopExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [calendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => {
    if (editId) {
      loadRecord(editId);
    }
  }, [editId]);

  const loadRecord = async (id: string) => {
    try {
      const record = await exerciseService.getById(id);
      if (record) {
        setDate(record.date);
        setTime(record.time || formatTime());
        setSelectedExercise(record.type);
        setDuration(record.duration);
        setIntensity(record.intensity);
        setNote(record.note || "");
      }
    } catch (error) {
      showError("加载失败", error);
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    setCustomExercises(getStoredCustomExercises());
    const exercises = exerciseService.getTopExercises(10);
    setTopExercises(exercises.filter((e) => ALL_PRESET_EXERCISES.has(e)));
  });

  const handleExerciseClick = (exercise: string) => {
    setSelectedExercise(selectedExercise === exercise ? "" : exercise);
  };

  const handleManualAdd = () => {
    const exercise = manualInput.trim();
    if (!exercise) {
      Taro.showToast({ title: "请输入运动名称", icon: "none" });
      return;
    }

    if (exercise.length > 20) {
      Taro.showToast({ title: "名称不能超过20个字符", icon: "none" });
      return;
    }

    setSelectedExercise(exercise);
    setManualInput("");
    if (!ALL_PRESET_EXERCISES.has(exercise)) {
      saveCustomExercise(exercise);
      setCustomExercises(getStoredCustomExercises());
    }
  };

  const handleDeleteCustomExercise = async (exercise: string) => {
    const res = await Taro.showModal({
      title: "删除运动",
      content: `确定要删除"${exercise}"吗？`,
    });
    if (res.confirm) {
      removeCustomExercise(exercise);
      setCustomExercises(getStoredCustomExercises());
      if (selectedExercise === exercise) {
        setSelectedExercise("");
      }
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    const res = await Taro.showModal({
      title: "确认删除",
      content: "确定要删除这条记录吗？",
    });

    if (res.confirm) {
      try {
        await exerciseService.delete(editId);
        Taro.showToast({ title: "已删除", icon: "success" });
        Taro.eventCenter.trigger("recordChange");
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } catch (error) {
        showError("删除失败", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!selectedExercise) {
      Taro.showToast({ title: "请选择运动类型", icon: "none" });
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        date,
        time,
        type: selectedExercise,
        duration,
        intensity,
        note: note.trim() || undefined,
      };

      if (isEdit && editId) {
        await exerciseService.update(editId, data);
        Taro.showToast({ title: "更新成功", icon: "success" });
      } else {
        await exerciseService.add(data);
        Taro.showToast({ title: "记录成功", icon: "success" });
      }

      Taro.eventCenter.trigger("recordChange");
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      showError("保存失败", error);
    } finally {
      setSubmitting(false);
    }
  };

  const myFavoriteExercises = [
    ...topExercises,
    ...customExercises.filter((e) => !topExercises.includes(e)),
  ];

  const currentExercises =
    selectedCategory === -1
      ? myFavoriteExercises.map((name) => ({ name, emoji: EXERCISE_EMOJI_MAP.get(name) }))
      : EXERCISE_CATEGORIES[selectedCategory].items;

  if (loading) {
    return (
      <View className="add-page">
        <View className="loading">加载中...</View>
      </View>
    );
  }

  return (
    <View className="add-page">
      {/* 日期时间 */}
      <View className="section">
        <Text className="section-title">时间</Text>
        <View className="time-row">
          <View className="picker-value" onClick={() => setCalendarVisible(true)}>
            {date}
          </View>
          <TimePicker value={time} onChange={setTime} />
        </View>
        <CalendarPopup
          visible={calendarVisible}
          value={date}
          onChange={setDate}
          onClose={() => setCalendarVisible(false)}
        />
      </View>

      {/* 运动类型选择 */}
      <View className="section">
        <Text className="section-title">运动类型</Text>

        {/* 分类标签 */}
        <View className="category-tabs">
          <View
            className={`category-tab ${selectedCategory === -1 ? "active" : ""}`}
            onClick={() => setSelectedCategory(-1)}
          >
            常用
          </View>
          {EXERCISE_CATEGORIES.map((cat, index) => (
            <View
              key={cat.name}
              className={`category-tab ${selectedCategory === index ? "active" : ""}`}
              onClick={() => setSelectedCategory(index)}
            >
              {cat.name}
            </View>
          ))}
        </View>

        {/* 运动网格 */}
        <View className="food-grid">
          {currentExercises.length === 0 ? (
            <Text className="no-food-hint">暂无常用运动，请从其他分类选择或手动输入</Text>
          ) : (
            currentExercises.map((exercise) => {
              const isCustom =
                selectedCategory === -1 && customExercises.includes(exercise.name);
              return (
                <View
                  key={exercise.name}
                  className={`food-item ${selectedExercise === exercise.name ? "selected" : ""} ${isCustom ? "custom" : ""}`}
                  onClick={() => handleExerciseClick(exercise.name)}
                  onLongPress={
                    isCustom ? () => handleDeleteCustomExercise(exercise.name) : undefined
                  }
                >
                  {exercise.emoji && <Text className="food-emoji">{exercise.emoji}</Text>}
                  <Text className="food-name">{exercise.name}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* 手动输入 */}
        {selectedCategory === -1 && (
          <View className="manual-input-row">
            <Input
              className="manual-input"
              placeholder="输入其他运动"
              value={manualInput}
              onInput={(e) => setManualInput(e.detail.value)}
              onConfirm={handleManualAdd}
            />
            <View className="manual-add-btn" onClick={handleManualAdd}>
              添加
            </View>
          </View>
        )}

        {/* 已选运动 */}
        {selectedExercise && (
          <View className="selected-exercise">
            <Text>已选：{selectedExercise}</Text>
          </View>
        )}
      </View>

      {/* 时长 */}
      <View className="section">
        <Text className="section-title">时长</Text>
        <View className="amount-options">
          {DURATION_OPTIONS.map((option) => (
            <View
              key={option.value}
              className={`amount-item ${duration === option.value ? "active" : ""}`}
              onClick={() => setDuration(option.value as ExerciseRecord["duration"])}
            >
              <Text className="amount-label">{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 强度 */}
      <View className="section">
        <Text className="section-title">强度</Text>
        <View className="bristol-options">
          {INTENSITY_OPTIONS.map((option) => (
            <View
              key={option.value}
              className={`bristol-item ${intensity === option.value ? "active" : ""}`}
              onClick={() => setIntensity(option.value as ExerciseRecord["intensity"])}
            >
              <ExerciseIntensityIcon
                level={option.value as 1 | 2 | 3}
                size={48}
                active={intensity === option.value}
              />
            </View>
          ))}
        </View>
        <View className="bristol-selected">
          <Text className="bristol-selected-label">
            {INTENSITY_OPTIONS[intensity - 1].label}
          </Text>
          <Text className="bristol-selected-desc">
            {INTENSITY_OPTIONS[intensity - 1].desc}
          </Text>
        </View>
      </View>

      {/* 备注 */}
      <View className="section">
        <Text className="section-title">备注</Text>
        <Textarea
          className="note-input"
          placeholder="添加备注（可选）"
          value={note}
          onInput={(e) => setNote(e.detail.value)}
          maxlength={500}
          autoHeight
        />
      </View>

      {/* 提交按钮 */}
      <View className="submit-section">
        <View className={`submit-btn ${submitting ? "disabled" : ""}`} onClick={handleSubmit}>
          {submitting ? "保存中..." : isEdit ? "更新记录" : "保存记录"}
        </View>
        {isEdit && (
          <View className="delete-btn" onClick={handleDelete}>
            删除记录
          </View>
        )}
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Run build to verify**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/pages/exercise/add/
git commit -m "feat(exercise): add exercise recording page"
```

---

### Task 6: Register Page Route

**Files:**
- Modify: `src/app.config.ts`

- [ ] **Step 1: Add exercise page to routes**

In `src/app.config.ts`, add after line 9 (after stool/add):

```typescript
    "pages/exercise/add/index",
```

- [ ] **Step 2: Run build to verify**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app.config.ts
git commit -m "feat(exercise): register exercise page route"
```

---

### Task 7: Add CSS Styles for Selected Exercise

**Files:**
- Modify: `src/pages/exercise/add/index.css`

- [ ] **Step 1: Add selected-exercise style**

Add to the end of `src/pages/exercise/add/index.css`:

```css
.selected-exercise {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0f9f5;
  border-radius: 8px;
  color: #5fcf9a;
  font-size: 14px;
}
```

- [ ] **Step 2: Run build to verify**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/pages/exercise/add/index.css
git commit -m "style(exercise): add selected-exercise style"
```

---

### Task 8: Final Integration Test

- [ ] **Step 1: Build and verify**

Run: `pnpm build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run integration tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 3: Final commit if any remaining changes**

```bash
git status
# If there are uncommitted changes:
git add -A
git commit -m "chore(exercise): final cleanup"
```
