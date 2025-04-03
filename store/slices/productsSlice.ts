/**
 * Products Slice
 * Redux slice for managing products state
 */

import { Product } from '@/types/api';

// Action Types
const FETCH_PRODUCTS_REQUEST = 'products/fetchRequest';
const FETCH_PRODUCTS_SUCCESS = 'products/fetchSuccess';
const FETCH_PRODUCTS_FAILURE = 'products/fetchFailure';
const FETCH_PRODUCT_DETAIL_REQUEST = 'products/fetchDetailRequest';
const FETCH_PRODUCT_DETAIL_SUCCESS = 'products/fetchDetailSuccess';
const FETCH_PRODUCT_DETAIL_FAILURE = 'products/fetchDetailFailure';
const CREATE_PRODUCT_REQUEST = 'products/createRequest';
const CREATE_PRODUCT_SUCCESS = 'products/createSuccess';
const CREATE_PRODUCT_FAILURE = 'products/createFailure';
const UPDATE_PRODUCT_REQUEST = 'products/updateRequest';
const UPDATE_PRODUCT_SUCCESS = 'products/updateSuccess';
const UPDATE_PRODUCT_FAILURE = 'products/updateFailure';
const DELETE_PRODUCT_REQUEST = 'products/deleteRequest';
const DELETE_PRODUCT_SUCCESS = 'products/deleteSuccess';
const DELETE_PRODUCT_FAILURE = 'products/deleteFailure';

// State Interface
interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

// Reducer
export default function productsReducer(state = initialState, action: any): ProductsState {
  switch (action.type) {
    case FETCH_PRODUCTS_REQUEST:
    case FETCH_PRODUCT_DETAIL_REQUEST:
    case CREATE_PRODUCT_REQUEST:
    case UPDATE_PRODUCT_REQUEST:
    case DELETE_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        products: action.payload,
      };
    case FETCH_PRODUCT_DETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedProduct: action.payload,
      };
    case CREATE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: [...state.products, action.payload],
      };
    case UPDATE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        ),
        selectedProduct: action.payload,
      };
    case DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: state.products.filter(product => product.id !== action.payload),
        selectedProduct: state.selectedProduct?.id === action.payload ? null : state.selectedProduct,
      };
    case FETCH_PRODUCTS_FAILURE:
    case FETCH_PRODUCT_DETAIL_FAILURE:
    case CREATE_PRODUCT_FAILURE:
    case UPDATE_PRODUCT_FAILURE:
    case DELETE_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Action Creators
export const fetchProductsRequest = () => ({
  type: FETCH_PRODUCTS_REQUEST,
});

export const fetchProductsSuccess = (products: Product[]) => ({
  type: FETCH_PRODUCTS_SUCCESS,
  payload: products,
});

export const fetchProductsFailure = (error: string) => ({
  type: FETCH_PRODUCTS_FAILURE,
  payload: error,
});

export const fetchProductDetailRequest = () => ({
  type: FETCH_PRODUCT_DETAIL_REQUEST,
});

export const fetchProductDetailSuccess = (product: Product) => ({
  type: FETCH_PRODUCT_DETAIL_SUCCESS,
  payload: product,
});

export const fetchProductDetailFailure = (error: string) => ({
  type: FETCH_PRODUCT_DETAIL_FAILURE,
  payload: error,
});

export const createProductRequest = () => ({
  type: CREATE_PRODUCT_REQUEST,
});

export const createProductSuccess = (product: Product) => ({
  type: CREATE_PRODUCT_SUCCESS,
  payload: product,
});

export const createProductFailure = (error: string) => ({
  type: CREATE_PRODUCT_FAILURE,
  payload: error,
});

export const updateProductRequest = () => ({
  type: UPDATE_PRODUCT_REQUEST,
});

export const updateProductSuccess = (product: Product) => ({
  type: UPDATE_PRODUCT_SUCCESS,
  payload: product,
});

export const updateProductFailure = (error: string) => ({
  type: UPDATE_PRODUCT_FAILURE,
  payload: error,
});

export const deleteProductRequest = () => ({
  type: DELETE_PRODUCT_REQUEST,
});

export const deleteProductSuccess = (productId: number) => ({
  type: DELETE_PRODUCT_SUCCESS,
  payload: productId,
});

export const deleteProductFailure = (error: string) => ({
  type: DELETE_PRODUCT_FAILURE,
  payload: error,
});

// Thunk Actions
export const fetchProducts = () => async (dispatch: any) => {
  dispatch(fetchProductsRequest());
  try {
    // API call would go here
    // const response = await apiService.get<Product[]>('/products');
    // dispatch(fetchProductsSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(fetchProductsFailure(error.message));
    throw error;
  }
};

export const fetchProductDetail = (productId: number) => async (dispatch: any) => {
  dispatch(fetchProductDetailRequest());
  try {
    // API call would go here
    // const response = await apiService.get<Product>(`/products/${productId}`);
    // dispatch(fetchProductDetailSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(fetchProductDetailFailure(error.message));
    throw error;
  }
};

export const createProduct = (productData: any) => async (dispatch: any) => {
  dispatch(createProductRequest());
  try {
    // API call would go here
    // const response = await apiService.post<Product>('/products', productData);
    // dispatch(createProductSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(createProductFailure(error.message));
    throw error;
  }
};

export const updateProduct = (productId: number, productData: any) => async (dispatch: any) => {
  dispatch(updateProductRequest());
  try {
    // API call would go here
    // const response = await apiService.put<Product>(`/products/${productId}`, productData);
    // dispatch(updateProductSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(updateProductFailure(error.message));
    throw error;
  }
};

export const deleteProduct = (productId: number) => async (dispatch: any) => {
  dispatch(deleteProductRequest());
  try {
    // API call would go here
    // await apiService.delete(`/products/${productId}`);
    // dispatch(deleteProductSuccess(productId));
  } catch (error: any) {
    dispatch(deleteProductFailure(error.message));
    throw error;
  }
};
