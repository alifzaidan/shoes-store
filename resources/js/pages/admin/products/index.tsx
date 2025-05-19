import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin',
    },
    {
        title: 'Produk',
        href: '/admin/products',
    },
];

export default function Products() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4 md:p-8">
                    <h1 className="text-2xl font-semibold">Daftar Produk</h1>
                    <p className="mb-4 text-sm text-gray-500 md:w-2xl">Tambahkan Produk Anda di sini.</p>
                    <Button asChild>
                        <Link href={route('products.create')}>Tambah Produk</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
