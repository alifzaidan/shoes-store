import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Category, columns } from './columns';
import { DataTable } from './data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin',
    },
    {
        title: 'Category',
        href: '/admin/categories',
    },
];

export default function Categories({ categories }: { categories: Category[] }) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4 md:p-8">
                    <h1 className="text-2xl font-semibold">Daftar Kategori</h1>
                    <p className="mb-4 text-sm text-gray-500 md:w-2xl">Tambahkan Kategori Anda di sini.</p>
                    <Button asChild className="mb-4">
                        <Link href={route('categories.create')}>Tambah Kategori</Link>
                    </Button>
                    <DataTable columns={columns} data={categories} />
                </div>
            </div>
        </AppLayout>
    );
}
