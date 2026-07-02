// Global application state

// Generate a random guest session email if one doesn't exist
const getSessionId = () => {
  let id = localStorage.getItem('luxe_session');
  if (!id) {
    id = `guest_${Math.random().toString(36).substring(2, 9)}@luxe.com`;
    localStorage.setItem('luxe_session', id);
  }
  return id;
};

export const state = {
  sessionId: getSessionId(),
  cartItemCount: 0,
  chatOpen: false,
  chatMessages: [],
  chatInput: '',
  chatLoading: false,
  currentCategory: '',
  priceFilter: { min: null, max: null },  // price range filter
  products: [],
  productList: [],
};
