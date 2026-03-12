interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCode({
  value,
  size = 200,
  className = "",
}: QRCodeProps) {
  const encoded = encodeURIComponent(value);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=1a1b2e&color=ffffff&margin=10`;

  return (
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      className={`rounded-xl ${className}`}
      loading="lazy"
    />
  );
}
