"use client";
type Props = {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
};
export default function KeyValueItem({ label, value, className }: Props) {
  return (
    <div
      className={
        "flex items-center justify-between rounded-md border p-3 " +
        (className ?? "")
      }
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
