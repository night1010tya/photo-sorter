"use client";

export type PhotoStatusFilterValue = "UNSORTED" | "SORTED" | "ALL";

type Props = {
  value: PhotoStatusFilterValue;
  onChange: (value: PhotoStatusFilterValue) => void;
};

export default function PhotoStatusFilter({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(event) => {
        const nextValue = event.target.value;

        if (
          nextValue === "UNSORTED" ||
          nextValue === "SORTED" ||
          nextValue === "ALL"
        ) {
          onChange(nextValue);
        }
      }}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2"
    >
      <option value="UNSORTED">未整理</option>
      <option value="SORTED">整理済み</option>
      <option value="ALL">すべて</option>
    </select>
  );
}
