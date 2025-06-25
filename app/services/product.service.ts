import { api, handleApiError } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string[];
  image: string;
  images: string[];
  userId: string;
  averageRating: number;
  numReviews: number;
  location: string;
  hasMakeupService: boolean;
  makeupPrice?: number;
  makeupDuration?: number;
  makeupDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/products');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'averageRating' | 'numReviews'>): Promise<Product> {
    try {
      const response = await api.post<Product>('/products', productData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.put<Product>(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/products/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
