import QRCode from "qrcode"

export async function generateQRDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 320,
      color: {
        dark: "#1f2937",
        light: "#fefce8",
      },
    })
  } catch (error) {
    console.error("Failed to generate QR code:", error)
    return ""
  }
}
