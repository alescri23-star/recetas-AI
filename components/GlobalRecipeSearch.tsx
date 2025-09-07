
import React, { useState } from 'react';
import type { Recipe } from '../types';
import RecipeCard from './RecipeCard';
import Spinner from './Spinner';

interface GlobalRecipeSearchProps {
  onSearch: (query: string) => void;
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  onToggleFavorite: (recipe: Recipe) => void;
  isRecipeFavorited: (recipe: Recipe) => boolean;
  onAddIngredientsToList: (ingredients: string[]) => void;
}

const GlobalRecipeSearch: React.FC<GlobalRecipeSearchProps> = ({ onSearch, recipes, isLoading, error, onToggleFavorite, isRecipeFavorited, onAddIngredientsToList }) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    onSearch(query);
  };

  const handleToggle = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      onToggleFavorite(recipe);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <Spinner message="Buscando recetas del mundo..." />;
    }

    if (error) {
      return <div className="bg-red-900/20 border border-red-500 text-[#D4AF37] p-4 rounded-lg my-4 text-center animate-fade-in">{error}</div>;
    }

    if (!hasSearched) {
      return (
        <div className="text-center py-16 px-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-white mt-4">Explora Recetas Mundiales</h3>
          <p className="text-gray-400 mt-2">Busca cualquier plato, ingrediente o tipo de cocina que se te antoje.</p>
        </div>
      );
    }
    
    if (recipes.length > 0) {
      return (
        <div className="space-y-8">
          {recipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={{...recipe, favorito: isRecipeFavorited(recipe)}} 
              onToggleFavorite={handleToggle}
              onAddIngredientsToList={onAddIngredientsToList}
            />
          ))}
        </div>
      );
    }
    
    if (hasSearched && recipes.length === 0) {
      return (
        <div className="text-center py-16 px-6">
          <h3 className="text-2xl font-bold text-white">No se encontraron recetas</h3>
          <p className="text-gray-400 mt-2">Prueba a buscar con otros términos.</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: Lasaña, postres de chocolate, cocina mexicana..."
            className="flex-grow p-3 bg-gray-800 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors duration-300 text-white"
            aria-label="Buscar receta"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#D4AF37] hover:bg-[#c09d2e] text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default GlobalRecipeSearch;
