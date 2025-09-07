

import React, { useState, useCallback, useEffect } from 'react';
import { identifyIngredientsFromImage, generateRecipe, searchGlobalRecipes, findRecipeVideo, startChat, sendMessageToChat } from './services/geminiService';
import type { Recipe, FilterOption, ShoppingListItem, ChatMessage } from './types';
import type { Chat } from '@google/genai';
import CameraCapture from './components/CameraCapture';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import RecipeGallery from './components/RecipeGallery';
import GlobalRecipeSearch from './components/GlobalRecipeSearch';
import ShoppingListView from './components/ShoppingListView';
import Spinner from './components/Spinner';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatButton from './components/ChatButton';
import ChatInterface from './components/ChatInterface';

type View = 'input' | 'camera' | 'gallery' | 'global_gallery' | 'shopping_list';

const RECIPES_KEY = 'homsent-chef-recipes';
const SHOPPING_LIST_KEY = 'homsent-chef-shopping-list';

const Toast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-5 right-5 bg-[#D4AF37] text-black font-bold py-3 px-6 rounded-lg shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('input');
  const [ingredients, setIngredients] = useState<string>('');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [globalRecipes, setGlobalRecipes] = useState<Recipe[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat state
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Load data on initial render
  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem(RECIPES_KEY);
      if (storedRecipes) {
        setAllRecipes(JSON.parse(storedRecipes));
      }
      const storedShoppingList = localStorage.getItem(SHOPPING_LIST_KEY);
      if(storedShoppingList) {
        setShoppingList(JSON.parse(storedShoppingList));
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  // Helper to save recipes
  const saveRecipes = (recipes: Recipe[]) => {
    try {
        localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    } catch (e) {
        console.error("Failed to save recipes to localStorage", e);
    }
  }

  const handleCapture = useCallback(async (imageData: string) => {
    setView('input');
    setIsLoading(true);
    setLoadingMessage('Reconociendo ingredientes...');
    setError(null);
    setCurrentRecipe(null);
    try {
      const detectedIngredients = await identifyIngredientsFromImage(imageData);
      setIngredients(detectedIngredients.join(', '));
    } catch (err) {
      setError('No se pudieron reconocer los ingredientes. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleGenerateRecipe = useCallback(async (manualIngredients: string, filters: FilterOption[]) => {
    if (!manualIngredients.trim()) {
      setError('Por favor, introduce al menos un ingrediente.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Generando una receta deliciosa...');
    setError(null);
    setCurrentRecipe(null);
    setChatSession(null);
    setChatHistory([]);
    try {
      const ingredientList = manualIngredients.split(',').map(i => i.trim()).filter(Boolean);
      const filterList = filters.filter(f => f.checked).map(f => f.label);
      const recipeData = await generateRecipe(ingredientList, filterList);
      
      setLoadingMessage('Buscando un vídeo tutorial...');
      const videoUrl = await findRecipeVideo(recipeData.titulo);

      const newRecipe: Recipe = {
        ...recipeData,
        id: `recipe-${new Date().getTime()}`,
        favorito: false,
        video_url: videoUrl,
      };
      
      setCurrentRecipe(newRecipe);

      setAllRecipes(prevRecipes => {
        const updatedRecipes = [newRecipe, ...prevRecipes];
        saveRecipes(updatedRecipes);
        return updatedRecipes;
      });

      // Start chat session
      const chat = startChat(newRecipe);
      setChatSession(chat);
      setChatHistory([{
        role: 'chef',
        content: `¡Hola! Soy tu asistente de chef. ¿Tienes alguna pregunta sobre tu receta de "${newRecipe.titulo}"?`
      }]);
      setToastMessage('¡Asistente de chef listo! Haz clic en el icono de chat.');

    } catch (err) {
      setError('Hubo un error al generar la receta. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleSendChatMessage = useCallback(async (message: string) => {
    if (!chatSession || isChatLoading) return;

    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);

    try {
        const responseText = await sendMessageToChat(chatSession, message);
        setChatHistory([...updatedHistory, { role: 'chef', content: responseText }]);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
        setChatHistory([...updatedHistory, { role: 'chef', content: `Lo siento, ${errorMessage}` }]);
    } finally {
        setIsChatLoading(false);
    }
  }, [chatSession, chatHistory, isChatLoading]);

  const handleGlobalSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setGlobalError('Por favor, introduce un término de búsqueda.');
      return;
    }
    setIsGlobalLoading(true);
    setGlobalError(null);
    setGlobalRecipes([]);
    try {
      const results = await searchGlobalRecipes(query);
      
      const recipesWithVideos = await Promise.all(
        results.map(async (recipe) => {
          const videoUrl = await findRecipeVideo(recipe.titulo);
          return { ...recipe, video_url: videoUrl };
        })
      );

      const resultsWithIds: Recipe[] = recipesWithVideos.map((recipe, index) => ({
        ...(recipe as Omit<Recipe, 'id' | 'favorito' | 'origen'> & { origen: 'Nacional' | 'Internacional' }),
        id: `global-${new Date().getTime()}-${index}`,
        favorito: false,
      }));
      setGlobalRecipes(resultsWithIds);
    } catch (err) {
        setGlobalError('Hubo un error al buscar recetas. Por favor, inténtalo de nuevo.');
        console.error(err);
    } finally {
        setIsGlobalLoading(false);
    }
  }, []);

  const handleToggleGlobalFavorite = useCallback((recipeToToggle: Recipe) => {
    setAllRecipes(prevRecipes => {
      const existingRecipeIndex = prevRecipes.findIndex(r => r.titulo === recipeToToggle.titulo);
      let updatedRecipes;

      if (existingRecipeIndex !== -1) {
        updatedRecipes = [...prevRecipes];
        const existingRecipe = updatedRecipes[existingRecipeIndex];
        updatedRecipes[existingRecipeIndex] = { ...existingRecipe, favorito: !existingRecipe.favorito };
      } else {
        const newFavoriteRecipe: Recipe = {
          ...recipeToToggle,
          id: `recipe-${new Date().getTime()}`,
          favorito: true,
          origen: 'Mundial',
        };
        updatedRecipes = [newFavoriteRecipe, ...prevRecipes];
      }
      
      saveRecipes(updatedRecipes);
      return updatedRecipes;
    });
  }, []);

  const isRecipeFavorited = (recipeToCheck: Recipe): boolean => {
    const found = allRecipes.find(r => r.titulo === recipeToCheck.titulo);
    return found ? found.favorito : false;
  };

  const handleDeleteRecipe = useCallback((recipeId: string) => {
    if (currentRecipe && currentRecipe.id === recipeId) {
      setCurrentRecipe(null);
    }

    setAllRecipes(prevRecipes => {
      const updatedRecipes = prevRecipes.filter(recipe => recipe.id !== recipeId);
      saveRecipes(updatedRecipes);
      return updatedRecipes;
    });
  }, [currentRecipe]);

  const handleToggleFavorite = useCallback((recipeId: string) => {
    setAllRecipes(prevRecipes => {
      const updatedRecipes = prevRecipes.map(recipe =>
        recipe.id === recipeId ? { ...recipe, favorito: !recipe.favorito } : recipe
      );
      saveRecipes(updatedRecipes);
      return updatedRecipes;
    });

    setCurrentRecipe(prev => (prev?.id === recipeId ? { ...prev, favorito: !prev.favorito } : prev));
  }, []);

  // --- Shopping List Handlers ---
  const updateShoppingListStorage = (newList: ShoppingListItem[]) => {
    try {
        localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(newList));
    } catch (e) {
        console.error("Failed to save shopping list to localStorage", e);
    }
  };
  
  const handleAddToShoppingList = useCallback((ingredientsToAdd: string[]) => {
    setShoppingList(prevList => {
      const existingNames = new Set(prevList.map(item => item.name.toLowerCase()));
      const newItems = ingredientsToAdd
        .filter(name => !existingNames.has(name.toLowerCase()))
        .map(name => ({
          id: `item-${new Date().getTime()}-${Math.random()}`,
          name,
          quantity: '1',
          checked: false,
        }));

      if(newItems.length > 0) {
        const updatedList = [...prevList, ...newItems];
        updateShoppingListStorage(updatedList);
        setToastMessage(newItems.length === 1 ? 'Ingrediente añadido' : `${newItems.length} ingredientes añadidos`);
        return updatedList;
      } else {
        setToastMessage('Todos los ingredientes seleccionados ya estaban en la lista');
        return prevList;
      }
    });
  }, []);

  const handleToggleShoppingItem = useCallback((itemId: string) => {
    setShoppingList(prevList => {
        const updatedList = prevList.map(item => item.id === itemId ? {...item, checked: !item.checked} : item);
        updateShoppingListStorage(updatedList);
        return updatedList;
    });
  }, []);

  const handleUpdateShoppingItemQuantity = useCallback((itemId: string, newQuantity: string) => {
    setShoppingList(prevList => {
      const updatedList = prevList.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      updateShoppingListStorage(updatedList);
      return updatedList;
    });
  }, []);

  const handleClearCompletedItems = useCallback(() => {
    setShoppingList(prevList => {
        const updatedList = prevList.filter(item => !item.checked);
        updateShoppingListStorage(updatedList);
        return updatedList;
    });
  }, []);

  const handleToggleAllShoppingItems = useCallback(() => {
    setShoppingList(prevList => {
      const allChecked = prevList.length > 0 && prevList.every(item => item.checked);
      const updatedList = prevList.map(item => ({
        ...item,
        checked: !allChecked,
      }));
      updateShoppingListStorage(updatedList);
      return updatedList;
    });
  }, []);

  const handleClearAllShoppingList = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres vaciar toda la lista de la compra?')) {
        setShoppingList([]);
        updateShoppingListStorage([]);
    }
  }, []);

  const resetToInput = () => {
    setIngredients('');
    setCurrentRecipe(null);
    setError(null);
    setIsLoading(false);
    setView('input');
    setChatSession(null);
    setChatHistory([]);
    setIsChatOpen(false);
  }
  
  const renderContent = () => {
    if (view === 'camera') {
      return <CameraCapture onCapture={handleCapture} onCancel={() => setView('input')} />;
    }
    
    if (view === 'gallery') {
        return <RecipeGallery 
            recipes={allRecipes} 
            onDeleteRecipe={handleDeleteRecipe} 
            onToggleFavorite={handleToggleFavorite}
            onAddIngredientsToList={handleAddToShoppingList}
            onBack={resetToInput}
        />;
    }

    if (view === 'global_gallery') {
        return (
            <GlobalRecipeSearch 
                onSearch={handleGlobalSearch}
                recipes={globalRecipes}
                isLoading={isGlobalLoading}
                error={globalError}
                onToggleFavorite={handleToggleGlobalFavorite}
                isRecipeFavorited={isRecipeFavorited}
                onAddIngredientsToList={handleAddToShoppingList}
            />
        );
    }
    
    if (view === 'shopping_list') {
        return (
            <ShoppingListView
                items={shoppingList}
                onToggle={handleToggleShoppingItem}
                onUpdateQuantity={handleUpdateShoppingItemQuantity}
                onClearCompleted={handleClearCompletedItems}
                onClearAll={handleClearAllShoppingList}
                onToggleAll={handleToggleAllShoppingItems}
            />
        );
    }

    // Default 'input' view content
    return (
      <>
        {!currentRecipe && !isLoading && (
          <IngredientInput
            ingredients={ingredients}
            setIngredients={setIngredients}
            onGenerate={handleGenerateRecipe}
            onOpenCamera={() => setView('camera')}
          />
        )}
        
        {isLoading && <Spinner message={loadingMessage} />}
        
        {error && <div className="bg-red-900/20 border border-red-500 text-[#D4AF37] p-4 rounded-lg my-4 text-center animate-fade-in">{error}</div>}

        {currentRecipe && (
          <div className="w-full animate-fade-in">
            <RecipeCard 
              recipe={currentRecipe} 
              onToggleFavorite={handleToggleFavorite} 
              onAddIngredientsToList={handleAddToShoppingList}
              onDelete={handleDeleteRecipe}
            />
            <div className="flex flex-col md:flex-row gap-4 mt-6">
               <button
                onClick={() => setIsChatOpen(true)}
                className="w-full md:flex-1 bg-[#D4AF37] hover:bg-[#c09d2e] text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                   <path d="M15 7v2a2 2 0 012 2v5a2 2 0 01-2 2h-1v-2l-3 3v-3h-3a2 2 0 01-2-2V9a2 2 0 012-2h7z" />
                 </svg>
                Preguntar al Chef
              </button>
              <button
                onClick={() => setView('gallery')}
                className="w-full md:flex-1 bg-transparent hover:bg-[#D4AF37]/10 border border-[#D4AF37] text-[#D4AF37] font-bold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Ver Mis Recetas
              </button>
              <button
                onClick={resetToInput}
                className="w-full md:flex-1 bg-transparent hover:bg-[#D4AF37]/10 border border-[#D4AF37] text-[#D4AF37] font-bold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Crear Otra Receta
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans" style={{fontFamily: "'Montserrat', sans-serif"}}>
      <Header 
        view={view}
        onNavigateHome={resetToInput}
        onNavigateGallery={() => setView('gallery')}
        onNavigateGlobal={() => setView('global_gallery')}
        onNavigateShoppingList={() => setView('shopping_list')}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto">
        {renderContent()}
      </main>
      <Footer />
      
      {chatSession && !isChatOpen && (
        <ChatButton onClick={() => setIsChatOpen(true)} />
      )}
      
      {isChatOpen && chatSession && (
        <ChatInterface
          history={chatHistory}
          isLoading={isChatLoading}
          onSendMessage={handleSendChatMessage}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;