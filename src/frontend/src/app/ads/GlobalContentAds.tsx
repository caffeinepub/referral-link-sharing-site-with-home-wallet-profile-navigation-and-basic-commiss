import AdSenseScript from './AdSenseScript';
import AdSlot from './AdSlot';

export default function GlobalContentAds() {
  return (
    <>
      <AdSenseScript />
      <div className="w-full max-w-screen-lg mx-auto px-4 py-6">
        <AdSlot
          className="my-4"
          style={{ minHeight: '100px' }}
        />
      </div>
    </>
  );
}
