import React from 'react';
import type { Recipe } from '../types';

interface MyCreationsProps {
  recipes: Recipe[];
  onRecipeClick: (recipeId: string) => void;
}

const MyCreations: React.FC<MyCreationsProps> = ({ recipes, onRecipeClick }) => {
  if (recipes.length === 0) {
    return null; // Don't render anything if there are no recipes
  }

  return (
    <div className="w-full p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 mb-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-4">Mis Creaciones</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 horizontal-scrollbar">
        {recipes.map(recipe => (
          <button
            key={recipe.id}
            onClick={() => onRecipeClick(recipe.id)}
            className="group flex-shrink-0 w-48 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-[#D4AF37] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            aria-label={`Ver receta ${recipe.titulo}`}
          >
            <div className="relative h-28">
              <img
                src={`https://picsum.photos/seed/${recipe.id}/200/150`}
                alt={recipe.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            </div>
            <div className="p-3 text-left">
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#D4AF37] transition-colors">
                {recipe.titulo}
              </h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MyCreations;
