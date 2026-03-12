export default function LoadingSpinner({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeMap[size]} border-2 border-arena-purple/30 border-t-arena-purple rounded-full animate-spin`}
      />
    </div>
  );
}
