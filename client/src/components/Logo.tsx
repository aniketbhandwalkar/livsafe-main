import { Link } from 'wouter';

export function Logo() {
  return (
    <Link href="/">
      <div className="flex items-center space-x-2 cursor-pointer">
        <span className="text-pink-400 text-2xl font-bold">TR</span>
        <span className="font-bold text-white">LivSafe</span>
      </div>
    </Link>
  );
}
