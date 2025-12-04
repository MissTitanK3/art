import { QRCodeImage } from "./qr-code-image";

export function PodCard({
  name,
  link,
  contact,
  coverage,
}: {
  name: string;
  link: string;
  contact: string;
  coverage: string;
}) {
  return (
    <div className="mx-auto w-full max-w-md space-y-2 rounded-xl border p-4 text-sm shadow-sm">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p>
        <strong>Platform:</strong> Signal
      </p>
      <p>
        <strong>Join Link:</strong>{" "}
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="break-words text-blue-600 underline"
        >
          Tap to join
        </a>
      </p>
      <p>
        <strong>Contact:</strong> {contact}
      </p>
      <p>
        <strong>Covers:</strong> {coverage}
      </p>
      <QRCodeImage value={link} />
    </div>
  );
}
