import { NextResponse } from 'next/server';
import { fetchBillingProducts } from '../../services/products';

export default async function handler(req, res) {
    try {
        const products = await fetchBillingProducts();
        res.status(200).json(products);
    } catch (err) {
        console.error('API/products error:', err);
        res.status(500).json({ error: err.message });
    }
}