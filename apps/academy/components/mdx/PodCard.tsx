import { QRCodeImage } from './QRCodeImage';

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
    <div className="w-full max-w-md mx-auto p-4 border rounded-xl shadow-sm text-sm space-y-2">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p>
        <strong>Platform:</strong> Signal
      </p>
      <p>
        <strong>Join Link:</strong>{' '}
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-words">
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
