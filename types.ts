
export interface Recipe {
  id: string;
  titulo: string;
  descripcion: string;
  tiempo_preparacion: string;
  tiempo_coccion: string;
  ingredientes: string[];
  instrucciones: string[];
  utensilios: string[];
  coste: 'Económico' | 'Medio' | 'Alto';
  tipo_dieta: 'Normal' | 'Dietética';
  origen: 'Nacional' | 'Internacional' | 'Mundial';
  favorito: boolean;
  video_url?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  // FIX: Add quantity to the shopping list item type.
  quantity: string;
  checked: boolean;
}