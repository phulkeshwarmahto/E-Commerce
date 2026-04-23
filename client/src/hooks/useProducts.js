import { useEffect, useState } from "react";
import { getProductRequest, getProductsRequest } from "../api/products.api";

export function useProducts(filters) {
  const queryKey = JSON.stringify(filters || {});
  const [state, setState] = useState({
    products: [],
    featured: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;
    const parsedFilters = JSON.parse(queryKey);

    setState((current) => ({ ...current, loading: true, error: "" }));
    getProductsRequest(parsedFilters)
      .then((data) => {
        if (!active) {
          return;
        }

        setState({
          products: data.products,
          featured: data.featured,
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setState({
          products: [],
          featured: [],
          loading: false,
          error: error.message,
        });
      });

    return () => {
      active = false;
    };
  }, [queryKey]);

  return state;
}

export function useProductDetail(id) {
  const [state, setState] = useState({
    product: null,
    relatedProducts: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    setState((current) => ({ ...current, loading: true, error: "" }));
    getProductRequest(id)
      .then((data) => {
        if (!active) {
          return;
        }

        setState({
          product: data.product,
          relatedProducts: data.relatedProducts,
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setState({
          product: null,
          relatedProducts: [],
          loading: false,
          error: error.message,
        });
      });

    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
