"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/primitives/button";
import QRCode from "react-qr-code";

function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="no-print">
      🖨️ Print / Save as PDF
    </Button>
  );
}

export function PublicEngagementPrint({ message }: { message: string }) {
  const [lang] = useState("en");

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          .print-border {
            border: 4px solid #dc2626 !important;
            border-radius: 12px !important;
            overflow: hidden !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `,
        }}
      />

      <div className="flex flex-col items-center gap-6 bg-neutral-100 p-6 print:bg-white">
        <p className="text-sm text-gray-500 print:hidden">
          🖨️ Tip: Use “Save as PDF” in your print dialog for a sharable flyer.
        </p>
        <PrintButton />

        <div className="w-[6in] h-[6in] bg-gradient-to-br from-red-600 to-orange-500 text-white flex flex-col justify-between items-center p-8 text-center print-border">
          <h1 className="text-3xl font-bold">Urgent Call</h1>
          <p className="text-lg font-semibold">{message}</p>
          <div className="mt-4">
            <QRCode
              value="https://region.domain.org/onboarding"
              size={120}
              bgColor="transparent"
              fgColor="#fff"
            />
            <p className="text-xs mt-2">Scan to get involved</p>
          </div>
        </div>
      </div>
    </>
  );
}
