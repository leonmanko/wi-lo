// apps/web/src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 mb-6">Page introuvable</p>
        <Link
          to="/"
          className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}