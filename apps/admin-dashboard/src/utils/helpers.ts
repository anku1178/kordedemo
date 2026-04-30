import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const statusColors: Record<string, string> = {
    placed: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    picking: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    handed_over: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
};

export const statusLabels: Record<string, string> = {
    placed: 'Placed',
    confirmed: 'Confirmed',
    picking: 'Picking',
    ready: 'Ready',
    handed_over: 'Completed',
    cancelled: 'Cancelled',
};

export const nextStatus: Record<string, string | null> = {
    placed: 'confirmed',
    confirmed: 'picking',
    picking: 'ready',
    ready: 'handed_over',
    handed_over: null,
    cancelled: null,
};

export const nextStatusLabel: Record<string, string> = {
    placed: 'Confirm Order',
    confirmed: 'Start Picking',
    picking: 'Mark Ready',
    ready: 'Hand Over',
};
