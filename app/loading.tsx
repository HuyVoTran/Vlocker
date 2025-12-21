export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        background: 'linear-gradient(90deg, #1877f2, #60a5fa)',
        animation: 'loading 1.2s infinite',
        zIndex: 9999,
      }}
    />
  );
}
