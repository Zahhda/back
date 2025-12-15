import axios from 'axios';

export const verifyUPI = async (vpa: string) => {
  const res = await axios.post('/api/payments/verify-upi', { vpa });
  return res.data;
};

export const verifyBankAccount = async (accountNumber: string, ifsc: string, name?: string) => {
  const res = await axios.post('/api/payments/verify-bank', { accountNumber, ifsc, name });
  return res.data;
};

export const createPaymentOrder = async (orderData: {
  amount: number; vpa: string; clientRefId?: string; note?: string;
  customerName?: string; mobile?: string;
}) => {
  const res = await axios.post('/api/payments/create-order', orderData);
  return res.data;
};

