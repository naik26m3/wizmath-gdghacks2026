// Three layered fixed background overlays applied at z-0 / z-1.
// `runes` toggles the faint runic-constellation dot field (default on).
export default function Backdrop({ runes = true }) {
  return (
    <>
      <div className="hx-backdrop" />
      {runes && <div className="hx-runes-bg" />}
      <div className="hx-grain" />
    </>
  );
}
