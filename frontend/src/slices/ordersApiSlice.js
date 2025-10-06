import { ORDERS_URL, PAYMENT_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createOrder: builder.mutation({
      query: order => ({
        url: ORDERS_URL,
        method: 'POST',
        body: { ...order }
      }),
      invalidatesTags: ['Order']
    }),
    getOrderDetails: builder.query({
      query: orderId => ({
        url: `${ORDERS_URL}/${orderId}`
      }),
      providesTags: ['Order']
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/my-orders`,
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }),
      providesTags: ['Order'],
      // Force a refetch when token changes or when auth state changes
      keepUnusedDataFor: 5, // Only keep data for 5 seconds to ensure freshness
      // Transform the error response to provide more useful information
      transformErrorResponse: (response) => ({
        status: response.status,
        message: 
          response.data?.message || 
          response.error || 
          'Failed to fetch order history'
      }),
      // Add additional error handling
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      },
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: { ...details }
      }),
      invalidatesTags: ['Order']
    }),
    updateDeliver: builder.mutation({
      query: orderId => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT'
      }),
      invalidatesTags: ['Order']
    }),

    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL
      }),
      providesTags: ['Order']
    }),
    getStripeConfig: builder.query({
      query: () => ({
        url: `${PAYMENT_URL}/stripe/config`
      }),
      providesTags: ['Payment']
    }),
    createStripePaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: `${PAYMENT_URL}/stripe/create-payment-intent`,
        method: 'POST',
        body: paymentData
      }),
      invalidatesTags: ['Payment']
    }),
    confirmStripePayment: builder.mutation({
      query: (confirmationData) => ({
        url: `${PAYMENT_URL}/stripe/confirm-payment`,
        method: 'POST',
        body: confirmationData
      }),
      invalidatesTags: ['Payment']
    })
  })
});

export const {
  useGetOrderDetailsQuery,
  useCreateOrderMutation,
  usePayOrderMutation,
  useUpdateDeliverMutation,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useGetStripeConfigQuery,
  useCreateStripePaymentIntentMutation,
  useConfirmStripePaymentMutation
} = ordersApiSlice;
