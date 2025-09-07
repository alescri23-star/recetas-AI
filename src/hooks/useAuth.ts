
// La funcionalidad de autenticación ha sido eliminada.
export const useAuth = () => {
    return { currentUser: null, login: () => {}, signUp: () => {}, logout: () => {} };
};
