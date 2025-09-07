
import React, { useState, useMemo } from 'react';
import type { Recipe } from '../types';
import RecipeCard from './RecipeCard';
import MyCreations from './MyCreations';

interface RecipeGalleryProps {
  recipes: Recipe[];
  onBack: () => void;
  onDeleteRecipe: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddIngredientsToList: (ingredients: string[]) => void;
}

type CostFilter = 'Todos' | 'Económico' | 'Medio' | 'Alto';
type DietFilter = 'Todas' | 'Dietética';
type OriginFilter = 'Todos' | 'Nacional' | 'Internacional' | 'Mundial';
type SortOrder = 'newest' | 'title-asc' | 'title-desc';

const RecipeGallery: React.FC<RecipeGalleryProps> = ({ recipes, onBack, onDeleteRecipe, onToggleFavorite, onAddIngredientsToList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [costFilter, setCostFilter] = useState<CostFilter>('Todos');
  const [dietFilter, setDietFilter] = useState<DietFilter>('Todas');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('Todos');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const handleCreationClick = (recipeId: string) => {
    const recipeElement = document.getElementById(recipeId);
    if (recipeElement) {
      recipeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const processedRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        recipe.titulo.toLowerCase().includes(searchLower) ||
        recipe.ingredientes.some(ing => ing.toLowerCase().includes(searchLower));

      const matchesCost = costFilter === 'Todos' || recipe.coste === costFilter;
      const matchesDiet = dietFilter === 'Todas' || recipe.tipo_dieta === dietFilter;
      const matchesOrigin = originFilter === 'Todos' || recipe.origen === originFilter;

      return matchesSearch && matchesCost && matchesDiet && matchesOrigin;
    });

    // Create a mutable copy for sorting
    const sorted = [...filtered];
    switch (sortOrder) {
      case 'title-asc':
        sorted.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.titulo.localeCompare(a.titulo));
        break;
      case 'newest':
      default:
        // The original `recipes` array is already sorted by newest first
        break;
    }
    
    return sorted;

  }, [recipes, searchTerm, costFilter, dietFilter, originFilter, sortOrder]);

  const FilterButtonGroup = <T extends string>({
    label,
    options,
    selectedValue,
    onChange,
  }: {
    label: string;
    options: T[];
    selectedValue: T;
    onChange: (value: T) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border-2 ${
              selectedValue === option
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                // eslint-disable-next-line indent
                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-[#D4AF37]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full animate-fade-in">
      <MyCreations recipes={recipes} onRecipeClick={handleCreationClick} />

      <div className="p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Filtrar y Buscar</h2>
        <div className="space-y-4">
            {/* Search and Sort row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-2">Buscar por Título o Ingrediente</label>
                    <input
                      type="text"
                      id="search"
                      placeholder="Ej: Pollo a la plancha, tomate..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors duration-300 text-white"
                    />
                </div>
                <div>
                    <label htmlFor="sort-order" className="block text-sm font-medium text-gray-400 mb-2">Ordenar por</label>
                    <select
                        id="sort-order"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                        className="w-full p-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors duration-300 text-white"
                    >
                        <option value="newest">Más recientes</option>
                        <option value="title-asc">Título (A-Z)</option>
                        <option value="title-desc">Título (Z-A)</option>
                    </select>
                </div>
            </div>
            {/* Filter buttons row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
                <FilterButtonGroup<CostFilter>
                  label="Coste"
                  options={['Todos', 'Económico', 'Medio', 'Alto']}
                  selectedValue={costFilter}
                  onChange={setCostFilter}
                />
                <FilterButtonGroup<DietFilter>
                  label="Dieta"
                  options={['Todas', 'Dietética']}
                  selectedValue={dietFilter}
                  onChange={setDietFilter}
                />
                <FilterButtonGroup<OriginFilter>
                  label="Origen"
                  options={['Todos', 'Nacional', 'Internacional', 'Mundial']}
                  selectedValue={originFilter}
                  onChange={setOriginFilter}
                />
            </div>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-900 rounded-xl border border-gray-700">
            <h3 className="text-2xl font-bold text-white">Tu libro de recetas está vacío</h3>
            <p className="text-gray-400 mt-2 mb-6">¡Empieza a crear tu primera receta para verla aquí!</p>
            <button
                onClick={onBack}
                className="bg-[#D4AF37] hover:bg-[#c09d2e] text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300"
            >
                Crear mi Primera Receta
            </button>
        </div>
      ) : processedRecipes.length > 0 ? (
        <div className="space-y-8">
          {processedRecipes.map(recipe => (
            <div key={recipe.id} id={recipe.id} className="scroll-mt-8">
              <RecipeCard 
                  recipe={recipe} 
                  onToggleFavorite={onToggleFavorite} 
                  onAddIngredientsToList={onAddIngredientsToList}
                  onDelete={onDeleteRecipe}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-900 rounded-xl border border-gray-700">
            <h3 className="text-2xl font-bold text-white">No se encontraron recetas</h3>
            <p className="text-gray-400 mt-2">Prueba a cambiar los filtros o el término de búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default RecipeGallery;
