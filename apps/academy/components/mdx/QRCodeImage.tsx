// components/QRCodeImage.tsx
import Image from 'next/image';
import { generateQRDataURL } from '@/lib/qrcode';
import Link from 'next/link';

export async function QRCodeImage({ value }: { value: string }) {
  const dataUrl = await generateQRDataURL(value);

  return (
    <div className="w-72 max-w-sm mx-auto px-4 py-4 bg-slate-600 border rounded-lg shadow-md flex flex-col items-center text-center space-y-3">
      <Image src={dataUrl} alt="QR code linking to resource" width={200} height={200} className="rounded" priority />
      <Link href={value} className="text-xs text-gray-200 break-words w-full">
        {value}
      </Link>
      <a
        href={dataUrl}
        download="academy-qr.png"
        className="text-sm text-blue-800 underline hover:text-blue-800 focus:outline-none">
        Download QR Code
      </a>
    </div>
  );
}
