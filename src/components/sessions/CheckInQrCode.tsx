import { QRCodeSVG } from "qrcode.react";
import { buildCheckInUrl } from "../../utils/checkInUrl";

interface CheckInQrCodeProps {
  sessionId: string;
  pin: string;
  size?: number;
}

export function CheckInQrCode({
  sessionId,
  pin,
  size = 64,
}: CheckInQrCodeProps) {
  return (
    <QRCodeSVG
      value={buildCheckInUrl(sessionId, pin)}
      size={size}
      level="M"
      marginSize={1}
      title="QR-Code für den Session-Check-in"
    />
  );
}
