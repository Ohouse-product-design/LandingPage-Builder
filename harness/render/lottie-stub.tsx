// SSR 에서는 lottie-web 이 document 에 접근하므로 정적 placeholder 로 대체
export default function Lottie({ className }: { className?: string }) {
  return <div className={className} data-lottie-placeholder />;
}
