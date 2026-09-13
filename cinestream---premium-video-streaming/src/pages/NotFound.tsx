import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/effects/PageTransition';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4 py-24 text-center">
      <div className="flex flex-col items-center gap-5 max-w-md mx-auto">
        {/* Animated Projector / Film Reel Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-crimson-600/15 border border-crimson-500/30 flex items-center justify-center text-crimson-400 shadow-2xl shadow-crimson-600/20">
            <Film className="w-12 h-12 animate-pulse" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-crimson-600 text-white font-mono text-xs font-bold shadow-md">
            404
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight">
            Lost in the Stream?
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Looks like this page doesn&apos;t exist or the broadcast frequency was moved to another galaxy.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            icon={<Home className="w-4 h-4" />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};
